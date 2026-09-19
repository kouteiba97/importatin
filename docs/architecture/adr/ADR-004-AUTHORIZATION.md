# ADR-004 — Capability-based authorization

**Status:** 🔒 LOCKED
**Date:** 14 September 2026

---

## Context

`Onboarding` presents roles as a **multi-select** — one person may be consumer, trader and
micro-importer at once — and both home screens carry an `أنا أستورد / أنا أشتري` context switcher.
So "role" is not a property of a person; it is a set of capabilities held simultaneously, plus a
UI context.

Separately, one authorization rule is a legal boundary rather than a product preference:
**a micro-importer may never publish a consumer-facing listing.**

## Decision

Five **ordered**, server-side gates, declared per route. Capabilities live on one identity; there
is **no `role` column**.

```
1 authenticated          → 401 UNAUTHENTICATED
2 capability held        → 403 CAPABILITY_REQUIRED
3 verification level     → 403 VERIFICATION_REQUIRED
4 ownership / visibility → 404 NOT_FOUND
5 action precondition    → 409 / 403 with a specific code
```

---

## Why ordered gates

The approved design draws **different screens** for different denials. `Listing Composer` has a
dedicated *blocked* state that explains the legal boundary and offers three alternatives;
`Verification` shows a ladder positioned at the missing rung. A single `403 Forbidden` cannot tell
the client which to render.

Ordering also makes every denial explainable and individually testable: a policy is data, so the
authorization test suite is **generated** from the route registry rather than hand-written, and
therefore cannot fall behind the routes.

## Why gate 4 returns 404

Distinguishing "exists but forbidden" from "does not exist" is an enumeration oracle — walking
`/commitments/:id` would map the platform's volume and counterparties. Only where the actor
demonstrably already knows the resource exists (they are a party to it) does the API return a
semantic error.

---

## Actors — locked

| Actor | Source | Notes |
|---|---|---|
| Anonymous | no session | Browse, search products/traders, compliance checker |
| Consumer | `capabilities` contains `consumer` | Self-declared |
| Trader | `capabilities` contains `trader` | Powers require **L2-T** |
| Micro-importer | `capabilities` contains `importer` | Powers require **L2-I** |
| Admin | row in `audit.admin_users` + queue role + MFA | **Granted, never self-declared** |
| Super Admin | `admin_users.roles` contains `superadmin` | Manual grant. **May grant roles but may NOT decide queue items** |

`admin` is **not** a capability and never appears in `app.capabilities`. Granting and deciding are
separated so one compromised account cannot both escalate itself and use the escalation.

Verification levels are **derived, never assigned**: computed from approved, unexpired documents
plus countable record facts. A stored level would drift out of sync the moment a licence lapsed.

---

## Active context is not an authorization input

`import` / `buy` / `shop` selects navigation and the default home surface. It **never** widens
authorization. This is stated explicitly because it is the most plausible accidental privilege
escalation in this product — a developer reading "the user is in importer context" as "the user may
do importer things". A test asserts that switching context changes no authorization outcome on any
route.

---

## The legal invariant — enforced three times

> Only a trader with a verified commercial register may create a consumer-facing `ProductListing`.

| Layer | Mechanism |
|---|---|
| Policy gate 2 | `capability: 'trader'` |
| Policy gate 3 | `level: 'L2-T'` with unexpired documents |
| **Database** | Composite FK to `trader_profiles(user_id, listing_eligible)` where `listing_eligible` is a generated column |

The database refusal is **authoritative**. If the service checks were deleted tomorrow, the insert
would still fail with `23503`. UI hiding is not counted as a layer and is not a control.

---

## IDOR / BOLA prevention — locked mechanisms

1. **No endpoint accepts an owner identifier.** `POST /listings` has no `seller_user_id` in its zod
   schema; sending one is a `422`, not a silent overwrite.
2. **Scoped loads.** Ownership is a `WHERE` clause in the same query, never a post-load `if`. A
   missing check cannot leak a row that was never selected.
3. **UUID v7** primary keys; no sequential identifiers in URLs.
4. **Nested resources re-verify the parent** and scope the child query independently.
5. **No object is served by path** — every file read mints a signed URL after an authorization
   check (ADR-005).
6. **Route-coverage test**: every route has `@Policy` or an explicit `@Public()`, or the build
   fails.

---

## Alternatives considered

**A `role` enum on `users`.** Rejected: contradicts the multi-select design, and would force
duplicate accounts for a person who both imports and sells — which the product explicitly refuses.

**RBAC library (CASL, Casbin).** Rejected: the rules here are five fixed gates plus per-route
preconditions. A policy DSL would add indirection over something already declarative, and would
make the generated test suite harder to derive.

**ABAC / policy engine (OPA).** Rejected: an external policy service for ~120 routes in a single
monolith is ceremony, and it would move authorization *away* from the database constraints that
back it.

---

## Consequences

- Authorization is data, so the test suite is generated: every route × every actor class.
- A new capability is a row plus a ladder definition, not a schema migration.
- Denial reasons are distinct codes, so the client renders the designed state rather than a generic
  error.
- The authorization matrix cannot be frozen until Q4 (may an importer publish a sourcing request?)
  is answered. Interim: the stricter reading, `trader` + L2-T.
