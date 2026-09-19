# ADR-001 — ORM: Drizzle vs Prisma

**Status:** 🔒 LOCKED — **DRIZZLE**
**Date:** 14 September 2026
**Decides:** the single data-access layer for the Maabar backend

---

## Context

Maabar's correctness rests on database constructs, not on application code. Before comparing
developer experience, here is the exhaustive list of PostgreSQL features the approved architecture
*requires* — every one traceable to a product or legal constraint:

| Requirement | Used for |
|---|---|
| **Generated column** (`GENERATED ALWAYS AS … STORED`) | `trader_profiles.listing_eligible` — the legal invariant |
| **Composite FK to a non-PK unique** | `product_listings → trader_profiles(user_id, listing_eligible)` — the legal invariant |
| **`ON UPDATE RESTRICT` semantics** | Loud failure when eligibility is revoked with live listings |
| **CHECK constraints** | Money > 0, band ordering, two distinct parties, approver ≠ drafter, `seller_listing_eligible` always true |
| **Partial unique indexes** | One live primary phone · one open verification case · one approved document per type · one accepted offer per request · one live subscription |
| **Exclusion constraint (GiST)** | Exactly one regulatory rule version in force per date |
| **`SELECT … FOR UPDATE`** | Trip capacity allocation |
| **Multiple schemas** | `app` / `billing` / `audit` separation |
| **`REVOKE UPDATE, DELETE`** | Append-only reviews, admin decisions, audit, transitions |
| **Generated `tsvector` + GIN + `pg_trgm`** | Arabic search |
| **Immutable SQL function** | Arabic normalization, used inside a generated column |
| **`citext`, `inet`, `bytea`, `daterange`, arrays, `jsonb`** | Phones, IPs, token hashes, rule windows, delivery options, metric inputs |

This is not an ORM preference question. It is: *which tool can express the constraints that make
this product legally safe, without fighting me on every migration?*

---

## Decision

**Drizzle ORM**, with **hand-written SQL migrations as the source of truth**. `drizzle-kit
generate` produces a starting point; the SQL file is reviewed and edited as SQL, then committed.

---

## Why

### Feature coverage

| Requirement | Drizzle | Prisma |
|---|---|---|
| Generated column | ✅ `.generatedAlwaysAs(sql\`…\`)` | ❌ Not in the schema language |
| Composite FK to a unique | ✅ `foreignKey({ columns, foreignColumns })` | ✅ `@relation(fields, references)` on a `@@unique` |
| CHECK constraint | ✅ `check('name', sql\`…\`)` | ❌ Raw SQL migration only |
| Partial index | ✅ `.where(sql\`…\`)` | ❌ Not in the schema language |
| Exclusion constraint | ⚠️ Raw SQL migration | ❌ Raw SQL migration |
| `SELECT … FOR UPDATE` | ✅ `.for('update')` | ⚠️ `$queryRaw` only — loses type safety on the locked read |
| Multiple schemas | ✅ `pgSchema()` | ✅ `multiSchema` |
| `REVOKE` / grants | ⚠️ Raw SQL migration | ⚠️ Raw SQL migration |
| Generated `tsvector` + GIN | ✅ | ❌ Raw SQL migration |
| Migration authoring | Plain SQL files you own | Managed by the migration engine |

Prisma cannot express **five** of the constructs above in its schema, including both halves of the
legal invariant.

### The decisive factor: drift detection

Prisma's workaround for unsupported constructs is `migrate dev --create-only` plus hand-edited
SQL. That works once. The problem is what happens afterwards.

`prisma migrate dev` replays the migration history into a shadow database and diffs the result
against `schema.prisma`. Objects that exist in the shadow database but cannot be described in
`schema.prisma` — the generated column, the partial indexes, the CHECK constraints, the exclusion
constraint — appear to the engine as **drift to be removed**. Every subsequent migration proposes
dropping them, and the developer must notice and edit it out, every time.

That is an acceptable annoyance for a CHECK on a nullable field. It is not acceptable when the
object being silently proposed for deletion is the composite foreign key that stops a micro-importer
from selling to a consumer. The failure mode is a tired engineer accepting a generated migration on
a Friday, and the product's central legal control disappearing with no test failing until someone
tries the exploit.

Drizzle has no such engine. Migrations are SQL files; nothing proposes deletions; what is committed
is what runs.

### Secondary factors

- **Typed locked reads.** Trip capacity allocation reads with `FOR UPDATE` and immediately uses the
  row. Drizzle keeps that typed; Prisma drops to `$queryRaw` at exactly the most correctness-
  sensitive point in the system.
- **One query layer.** The alternative "Prisma for CRUD, raw SQL for the hard parts" means two
  mental models, two error shapes, and a boundary that will be crossed wrongly.
- **Schema review is SQL review.** A database reviewer checking a legal constraint reads DDL, not
  a DSL that approximates it.

---

## Alternatives considered

**Prisma ORM.** Genuinely better in the areas that matter most days: a more polished client,
substantially better error messages, Prisma Studio, far more NestJS documentation and examples, and
faster onboarding for an engineer who has not used either. If Maabar's schema were ordinary CRUD,
Prisma would win this decision. It loses on the five unsupported constructs and on drift detection
fighting the one constraint we cannot afford to lose.

**Kysely.** Excellent type-safe query builder, but no migration story and no schema definition —
we would add a second tool immediately.

**TypeORM.** Mature and NestJS-native, but its migration generation is unreliable and its
decorator-based schema is further from SQL than Drizzle's, not closer.

**Raw `pg` + a migration runner.** Maximum control, zero type safety across ~34 tables. Rejected:
the type safety is doing real work in the state machines and serializers.

---

## Trade-offs (accepted, with eyes open)

| Cost | Mitigation |
|---|---|
| Smaller ecosystem; fewer NestJS + Drizzle examples than Prisma | A thin `DrizzleModule` provider is ~30 lines and written once in Phase 0 |
| Less mature tooling; no Studio equivalent | `psql` and any standard GUI work fine — the schema is plain PostgreSQL |
| Onboarding is slower for engineers who know Prisma | Offset by the schema being readable SQL, which every backend engineer already knows |
| `drizzle-kit` migration generation is less automatic | **This is the point.** Migrations are reviewed as SQL because they encode legal constraints |
| Relational query API is younger and has had breaking changes | Pin the version; the queries here are not exotic |

---

## Consequences

1. **SQL migration files are the source of truth.** `drizzle-kit generate` is a starting point,
   never the authority.
2. Migrations touching `product_listings`, `trader_profiles`, `audit.*` or
   `regulatory_rule_versions` require **two reviewers** and must state the invariant they preserve.
3. Drizzle schema files mirror the SQL. A CI check runs migrations into a scratch database and
   diffs the resulting schema against the Drizzle definitions — a mismatch fails the build.
4. Capacity allocation, handover completion and offer acceptance are written as explicit
   transactions with explicit locks, not through any ORM convenience helper.
5. If Drizzle is ever abandoned upstream, migration away is cheap: the SQL is already ours, and
   only the query layer would be rewritten.

> **LOCK: DRIZZLE**
