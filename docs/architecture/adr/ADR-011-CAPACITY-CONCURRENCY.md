# ADR-011 — Trip capacity allocation and concurrency

**Status:** 🔒 LOCKED
**Date:** 14 September 2026
**Note:** required by the review brief §37 but absent from its file list in §41. Written because
this is the single most correctness-critical mechanism in the system — exceeding the value axis is
a **legal** exposure for a named individual, not a UX defect.

---

## Context

A trip has **three independent capacity axes**, and the design is emphatic that they are not one
number:

| Axis | Origin | Unit | Visible to counterparty |
|---|---|---|---|
| **Value** | **Regulatory** `max_value_per_trip` — padlocked in the UI, labelled الحدّ القانوني | `bigint` centimes | **No** |
| **Weight** | User-defined — labelled حدودك أنت | integer grams | Yes |
| **Volume** | User-defined | integer cm³ | Yes |

The value axis is private because it discloses how much cash a named person is carrying abroad on a
known date. `Discover.dc.html` says so in its own source comment.

**The invariant:**

> A confirmed commitment must never cause the sum of allocated capacity on any axis to exceed that
> axis's cap.

Concurrency is real: several traders may accept commitments against the same trip in the same
minute, and the design's `Demand Board` lets an importer build a buy list that consumes capacity
live.

---

## Decision

**A ledger plus a row lock. Nothing more.**

```sql
BEGIN;  -- READ COMMITTED is sufficient; the lock provides the serialisation

  SELECT value_cap_centimes, weight_cap_grams, volume_cap_cm3, state
    FROM app.trips
   WHERE id = $trip
     FOR UPDATE;                        -- serialises every capacity writer on this trip

  SELECT coalesce(sum(value_centimes),0) AS v,
         coalesce(sum(grams),0)          AS w,
         coalesce(sum(cm3),0)            AS c
    FROM app.trip_capacity_ledger
   WHERE trip_id = $trip AND released_at IS NULL;

  -- assert ALL THREE axes; any failure →
  --   409 CAPACITY_EXCEEDED { axis, requested, remaining }

  INSERT INTO app.trip_capacity_ledger (...);
  UPDATE app.commitments SET state='accepted' WHERE id=$cmt;
  INSERT INTO app.commitment_transitions (...);     -- UNIQUE (commitment_id, idempotency_key)
  INSERT INTO audit.audit_log (...);
  SELECT pgboss.send('notify.commitment.accepted', ...);   -- same transaction (ADR-007)

COMMIT;
```

**Locked rules:**

1. **Lock order is fixed: `trips` → `commitments` → everything else.** Any code path taking them in
   another order is a deadlock under load and is a review rejection.
2. **The locked section contains two statements.** No network calls, no file operations, no
   external provider calls inside the lock.
3. **The value axis is checked even though it is never displayed** to the counterparty. It is a
   legal cap, and exceeding it is the importer's regulatory exposure regardless of who can see it.
4. **Capacity is held from `accepted` until a terminal state.** `disputed` **keeps it held** — the
   goods exist and the space is spent. `cancelled` releases it.
5. Every allocation endpoint requires an `Idempotency-Key`.

---

## Why a ledger, not a counter column

A `consumed_value_centimes` column on `trips` would be a **second source of truth**. It drifts on
any partial failure, and reconciling it requires the ledger anyway.

A ledger row per allocation gives: the correct sum by construction, release by setting
`released_at` (never by decrementing), a per-commitment audit of what was reserved, and a partial
unique index (`WHERE released_at IS NULL`) that makes double-allocation for one commitment
impossible.

Cost: one aggregate per allocation. Over a handful of live rows per trip, inside an index-supported
partial scan, this is microseconds.

## Why `SELECT … FOR UPDATE` and not the alternatives

| Alternative | Why rejected |
|---|---|
| **`SERIALIZABLE` isolation** | Correct, but introduces serialisation failures and therefore a retry loop — one more thing to get wrong, for a workload of single-digit concurrent writers per trip. Pessimistic locking here is deterministic and needs no retry logic |
| **Advisory locks** (`pg_advisory_xact_lock`) | Would work, but invents a second locking namespace keyed by a hashed trip id. The row already exists and is the natural lock target; an advisory lock adds indirection with no benefit |
| **Optimistic concurrency** (version column + retry) | Higher throughput under contention we do not have, and the failure mode is a user-visible retry on the most important action in the product |
| **`EXCLUDE` constraint** | Cannot express the rule. The constraint is a **sum across rows**, not an overlap between rows |
| **Application-level mutex / Redis lock** | Rejected outright: correctness would depend on a process outside the transaction. A crash between lock and commit corrupts the invariant |
| **`CHECK` constraint on a counter** | Would work only with the counter column, which is rejected above |

The chosen mechanism is the **simplest one that is actually correct**, which is the stated
principle for this review.

---

## Ordering: why `trips` is locked first

Accepting a commitment touches both tables. If one path locked `commitments` then `trips` while
another locked `trips` then `commitments`, two concurrent accepts would deadlock. PostgreSQL would
detect and abort one, so the invariant would hold — but a user would see an unexplained failure.

Fixed ordering removes the class entirely. It is asserted by an interleaved accept/cancel
concurrency test over 50 iterations.

---

## Related concurrency cases — locked mechanisms

| Case | Mechanism |
|---|---|
| Two admins reviewing one verification case | `UPDATE … WHERE id=? AND assigned_admin_id IS NULL`; zero rows means someone else claimed it |
| Two users transitioning one commitment | `FOR UPDATE` on the commitment, state re-read inside the lock; the loser gets `STATE_TRANSITION_INVALID` with the current state |
| Duplicate transition from a mobile retry | `UNIQUE (commitment_id, idempotency_key)` |
| Two handover confirmations at once | `UNIQUE (commitment_id, party)`; "am I the second?" evaluated **inside** the commitment lock |
| Two offers accepted on one request | Partial unique index on `sourcing_offers (request_id) WHERE state='accepted'` |
| Double subscription activation | `UNIQUE (provider, provider_reference)` + idempotent activation on `(subscription_id, period_start)` |

---

## Buy-list capacity (Demand Board) — deliberately different

The importer's buy list is **planning**, not allocation. It consumes nothing and locks nothing; it
computes projected consumption from category estimates and shows the meters and the
`لا يتّسع في المتبقّي` blocked state.

Only an **accepted commitment** writes a ledger row. Keeping planning lock-free is why the most
interactive screen in the product does not contend with the most correctness-critical path.

---

## Consequences

1. The invariant is testable directly: **10 parallel accepts against a trip with room for 3 →
   exactly 3 succeed, 7 return `409`, and the ledger sum is within cap on all three axes.** This is
   in the non-overridable suite.
2. Each axis is tested to fail independently, including value — the axis no counterparty can see.
3. Cancellation releases; dispute does not. Both are asserted.
4. Scaling trigger written down: if lock wait time on `trips` becomes measurable, the fix is to
   shorten the locked section further, not to change isolation level or introduce a queue.
