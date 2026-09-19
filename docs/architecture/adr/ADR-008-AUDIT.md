# ADR-008 — Audit, and the deferral of hash chaining

**Status:** 🔒 LOCKED
**Date:** 14 September 2026
**Revises:** the first blueprint's hash-chained, partitioned audit log with a nightly verifier

---

## Context

Auditability is a genuine product requirement. `Admin Console` draws a decision flow whose final
step is an immutable record, and its evidence panel renders a **history** of prior decisions with
actor identifiers (`ADM-002`, `ADM-014`) — so the audit trail is user-facing, not just forensic.

The requirement, stated precisely: an audit record must answer **who · did what · to which resource ·
when · from what state · to what state · why · with what context**, and must not be alterable by the
application.

## Decision

Three **distinct** kinds of record, kept separate:

| Kind | Where | Retention | Mutable? |
|---|---|---|---|
| **Business audit** | `audit.audit_log`, `audit.admin_decisions` | Permanent | No — `UPDATE`/`DELETE`/`TRUNCATE` revoked |
| **Security audit** | `audit.audit_log` with `category='security'` | 2 years | No |
| **Technical logs** | stdout → JSON, shipped to the log store | 30 days | n/a — never an authority |

Immutability mechanism: **PostgreSQL grants.**

```sql
REVOKE UPDATE, DELETE, TRUNCATE ON audit.audit_log       FROM maabar_app, maabar_worker;
REVOKE UPDATE, DELETE, TRUNCATE ON audit.admin_decisions FROM maabar_app, maabar_worker;
GRANT  INSERT, SELECT                ON audit.audit_log  TO   maabar_app, maabar_worker;
```

**No hash chain at MVP. No partitioning at MVP.**

---

## Why the hash chain was wrong for MVP

The first blueprint specified `prev_hash` / `hash` per stream plus a nightly verifier. Reviewing it
honestly against the threat it claims to address:

| Threat | Stopped by revoked grants? | Additional value of the hash chain |
|---|---|---|
| Application bug deletes audit rows | ✅ Yes | None |
| Compromised application deletes rows | ✅ Yes | None |
| Rogue admin using the product | ✅ Yes — they go through the application | None |
| **Database superuser rewrites history** | ❌ No | **They can recompute the chain too** |

The chain defends against nobody the grants do not already stop. The first blueprint said as much —
it explicitly admitted a superuser could recompute the chain — and then specified the chain anyway.
That is engineering for the appearance of rigour rather than for a threat.

The genuine control against a privileged insider is **shipping audit records off-box to
append-only storage**, which is an operational measure, not a cryptographic one.

**Deferred, not rejected.** If an external auditor, a regulator or an insurer later requires
demonstrable tamper evidence, adding `prev_hash`/`hash` is an additive migration plus a one-time
backfill — not a schema break. Trigger written down: any of those three asking for it.

## Why partitioning is deferred

Monthly partitions are correct for a table with hundreds of millions of rows. Maabar's audit volume
at launch is on the order of thousands of rows per month. Partitioning now would add DDL complexity
and a partition-creation job to solve a problem that is years away. Trigger: `audit_log` above ~50M
rows or when query latency degrades measurably.

---

## What must be audited — locked

| Event | Category |
|---|---|
| Every admin decision, with mandatory reason and stored user-facing consequence | business |
| Verification document approve / reject / request-correction / expire | business |
| Capability and derived-level changes | business |
| Listing moderation and takedown | business |
| Every commitment state transition | business |
| Dispute opening and decision | business |
| Regulatory rule version creation, approval and activation | business |
| Review removal by moderation | business |
| **Every KYC document access**, written *before* the signed URL is minted | security |
| Sign-in from an unrecognised device, phone change, session mass-revoke | security |
| Account suspension and reinstatement | security |
| Admin role grants | security |

**Not audited** (technical logs only): ordinary reads, search queries, page views, successful
routine requests, job executions.

## What is *not* audited, deliberately

Turning every application event into an audit row would bury the twelve categories above in noise
and make the `Admin Console` history panel useless. Audit is a record of **decisions and access to
sensitive data**, not a request log.

---

## The decision loop — preserved exactly

```
Evidence → Decision → Mandatory reason → User-facing consequence → Immutable audit
```

Locked properties:

- `reason_code` is `NOT NULL`, foreign-keyed to `decision_reasons` (a lookup table, so the trust
  team extends it without a deploy).
- `user_facing_consequence` is **stored**, not generated at display time — so the record answers
  "what was this person actually told?" years later, even after the copy changes.
- Corrections are **new decisions** with `supersedes_decision_id`. Both rows remain. No `UPDATE`.
- The decision, its domain effect, its audit row and its notification job commit **together**
  (ADR-007).

---

## Access

| Who | Audit access |
|---|---|
| The user | Their own commitment timeline, rendered from transitions — never the raw log |
| Queue admin | History for the case they are deciding, scoped to that subject |
| Super admin | Full query, **and that query is itself audited** |
| `maabar_readonly` | No grant on `audit.*` |
| Anyone | No `UPDATE`, `DELETE` or `TRUNCATE`, ever, through the application |

---

## Alternatives considered

**Hash chain at MVP.** Rejected — see above.

**Trigger-based blocking instead of grants.** Rejected: a trigger can be disabled by the same
privilege level that could bypass it; grants are checked by the engine itself.

**An external append-only audit service.** Deferred with the off-box shipping decision. Adds a
service and a network failure mode; the grant-based control covers the realistic threat first.

**Event sourcing the whole domain.** Rejected as a wholesale re-architecture for an auditability
requirement that append-only tables satisfy.

---

## Consequences

1. Immutability is enforced by the database engine, not by convention or by a library.
2. Business audit, security audit and technical logs are three different things with three
   retentions, and nobody has to ask which one an event belongs in.
3. `audit` is a separate schema purely so the grants are unambiguous and reviewable in one place.
4. Two upgrade triggers are written down now so the deferral is a decision, not a drift:
   hash chain on external-auditor demand; partitioning above ~50M rows.
