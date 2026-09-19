# ADR-002 — Modular monolith, 11 modules

**Status:** 🔒 LOCKED
**Date:** 14 September 2026
**Revises:** the first blueprint's 19 modules → **11**

---

## Context

Maabar is a single-market, single-currency, single-tenant product with 24 screens and a team of
three to four engineers. It has three unusually hard correctness requirements: trip-capacity
concurrency, atomic audit of admin decisions, and a legal invariant enforced by a foreign key.

## Decision

**One deployable backend application** (NestJS) with **11 internal modules**. Two process
entrypoints — `api` and `worker` — built from one image, sharing domain code.

No microservices. No service mesh. No internal event bus.

---

## Why microservices are wrong here

All three hard requirements get *harder* across a network boundary:

1. **Capacity concurrency.** In one database: `SELECT … FOR UPDATE` on the trip row. Across
   services: a distributed lock or a saga with compensations — for a workload of single-digit
   concurrent writes per trip.
2. **Audit atomicity.** A decision, its consequence, its notification and its audit row must commit
   together. Two services introduce "decided but never audited", the exact failure the audit
   requirement exists to prevent.
3. **The legal foreign key.** A composite FK protects only rows in its own database. Splitting
   listings from trader profiles would demote the strongest control in the system to an
   eventually-consistent check.

There is no scaling pressure, no independent deployment need, and no team-boundary pressure that
would justify paying those costs.

---

## Why 19 modules was wrong

Eight of the original nineteen were CRUD groupings wearing bounded-context clothing: `saved`,
`media`, `search`, `compliance`, `demand`, `audit`, `reviews`, `disputes`. A folder per noun is not
a boundary. A boundary exists where **behaviour, authorization or lifecycle genuinely differ**.

`saved_items` is one table with create, delete and list. It does not need a module; it needs a
service inside `platform`. `media` is a storage adapter, used almost entirely by `verification`.
`search` is two generated columns and a query. `reviews` and `disputes` share actors, share the
commitment they hang off, and are always reasoned about together — they are one `trust` module.

The ceremony had a cost: nineteen module folders, nineteen sets of barrel files and provider
registrations, and nineteen places to decide "does this belong here?" for a system where most
answers were obvious.

---

## The 11 modules

| # | Module | Owns | Absorbed |
|---|---|---|---|
| 1 | `identity` | users, phones, capabilities, sessions, OTP | — |
| 2 | `profiles` | trader + importer profiles, derived levels | consumer data → `users` |
| 3 | `verification` | cases, documents, upload + storage adapter | `media` |
| 4 | `marketplace` | categories, listings, listing media, listing search | `search` (part) |
| 5 | `trips` | trips, capacity ledger, demand aggregates | `demand` |
| 6 | `sourcing` | requests, offers | — |
| 7 | `commitments` | commitments, terms, transitions, handover | — |
| 8 | `messaging` | conversations, messages, action cards | — |
| 9 | `trust` | reviews, replies, reputation facts, disputes, evidence | `reviews`, `disputes` |
| 10 | `platform` | regulatory rules, compliance, saved items, notifications, flags | `compliance`, `regulatory`, `saved`, `notifications` |
| 11 | `admin` | admin users, queues, decisions, audit writer | `audit` |

---

## Boundary rules (build-enforced, not convention)

1. A module may import another module's **service interface and DTOs**. Never its Drizzle tables,
   never its repositories. Enforced by `no-restricted-imports` on `*/infra/**` across module
   boundaries — a violation fails the build, not a review.
2. **Exactly one cross-module transaction is permitted:** `commitments` → `trips` through
   `TripCapacityPort`, executed inside the caller's transaction. Any other cross-module transaction
   is a build failure.
3. `admin` may call into any module through its service interface. **No module may call `admin`.**
4. Asynchronous work goes through pg-boss, enqueued on the request's transaction (ADR-007).
5. Shared infrastructure lives in a `kernel` that is **not** a module: policy guard, audit writer,
   reference-id generator, money value objects, i18n catalogue, regulatory resolver, clock. It owns
   no tables and no domain rules.

---

## Alternatives considered

**Microservices.** Rejected — see above. Nothing in this product wants a network boundary.

**A layered monolith** (controllers / services / repositories, no modules). Rejected: the legal and
authorization boundaries would blur, and `billing` must be provably separate from commercial data.

**19 modules.** Rejected as ceremony without benefit.

**Fewer than 11** (e.g. merging `sourcing` into `commitments`). Rejected: a sourcing request has a
distinct lifecycle, a distinct actor and distinct visibility rules, and merging would produce one
service with two state machines.

---

## Consequences

- One CI pipeline, one image, one deploy, one database transaction scope.
- Extraction stays possible: each module already exposes a service interface, so pulling one into
  its own process later is a transport change, not a redesign.
- The `commitments` ↔ `trips` coupling is documented and tested. It is the one place two modules
  share a transaction, and any future second instance of that pattern is a design smell to
  escalate, not a precedent.
