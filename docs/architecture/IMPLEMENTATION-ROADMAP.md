# Maabar — Implementation Roadmap (vertical slices)

**Status:** 🔒 LOCKED
**Date:** 14 September 2026
**Supersedes:** the layer-ordered roadmap in the first blueprint

Every phase after Phase 0 ships a **usable vertical slice** — database, backend, authorization,
frontend and tests — that a real user can exercise. No phase is "the backend for X" with the
screens arriving later.

**A phase is not done because the API works.** The Definition of Done in §2 is binding.

---

## Ordering rationale

Three dependencies drive the sequence, and they are not negotiable:

1. **Verification before marketplace.** `trader_profiles.listing_eligible` is one half of the
   composite foreign key that enforces the legal invariant. Building listings first means building
   that invariant twice.
2. **Trips before sourcing before commitments.** A commitment consumes trip capacity, and the
   cross-module transaction is the riskiest code in the system. It must land on top of two stable
   modules, not underneath them.
3. **Messaging after commitments.** Action cards mutate commitment state in the same transaction as
   the message insert. Building the cards first would mean stubbing the thing they exist to do.

---

## Phase 0 — Foundation *(2 weeks · no user-facing slice)*

The only non-vertical phase, because everything after it writes audit rows and passes policy gates.

**Backend** · monorepo (`apps/api`, `apps/web`, `apps/worker`, `packages/{contracts,i18n,format,tokens}`) · NestJS bootstrap · Drizzle + SQL migration tooling · pg-boss · `StoragePort` + MinIO adapter · policy-guard skeleton · audit writer · error envelope · zod pipe · correlation ids · money/weight/volume value objects · `RegulatoryResolver` interface · reference-id generator
**Data** · Postgres 16 + extensions · roles `maabar_migrate` / `maabar_app` / `maabar_worker` / `maabar_readonly` · **grant revocations on `audit.*`** · `wilayas`, `feature_flags`, `reference_sequences`
**Frontend** · Next.js app shell · `tokens.css` imported unchanged · locale + direction switching · `format` package (LTR isolation, Arabic counted nouns)
**Security** · secret scanning · CSP/HSTS headers · `FEATURE_DEPOSIT_DECLARATION=false` CI assertion + production startup assertion
**QA** · CI pipeline · Testcontainers harness · stylelint rule banning physical directional CSS

**Acceptance** · a `/health` request passes every gate, writes a valid audit row, enqueues a pg-boss job on its own transaction, and deploys to staging automatically · `maabar_app` cannot `DELETE` from `audit.audit_log` · a physical `margin-left` fails the build.

---

## Phase 1 — Identity and onboarding *(2 weeks)*
**Slice: a person creates an account and picks their capabilities.**

**Backend** `identity` · `/auth/*` · `/capabilities` · `PATCH /users/me` · OTP hashing, rate limits, enumeration-safe responses · session cookie + CSRF · **full five-gate policy guard**
**Data** `users`, `phone_identities`, `capabilities`, `sessions`, `otp_challenges`, `rate_limit_counters`, `idempotency_keys`
**Frontend** `Onboarding` (screen 19) end to end in ar/fr/en · session handling · API client · TanStack Query setup
**Security** OTP abuse tests · session revocation · new-device cooldown scaffolding
**QA** **generated authorization matrix at 100% route coverage** · OTP brute-force · context-never-widens-authorization test

**Acceptance** · onboarding completes in all three locales · capabilities are multi-select on one identity · `/auth/me` returns live capability and level · every route has a declared policy or the build fails.

---

## Phase 2 — Verification, KYC and the admin primitive *(3 weeks)*
**Slice: a user submits documents; an admin decides; a capability changes.**

**Backend** `verification` + `admin` · upload grants, quarantine, magic-byte sniff, re-encode, PDF rasterise · signed URLs · queue engine, claim, evidence providers, decision engine · derived level recomputation · daily expiry sweep with freeze rules
**Data** `trader_profiles` (**with the generated `listing_eligible` column**), `importer_profiles`, `profile_levels`, `verification_cases`, `verification_documents`, `document_types`, `media_objects`, `audit.admin_decisions`, `audit.decision_reasons`
**Frontend** `Verification` (20) all eight states · `Admin Console` (24) verification queue
**Security** **KYC isolation suite** · audit-written-before-signed-URL ordering · role-gated evidence panels
**QA** derived-level correctness · expiry freeze (new trips denied, existing commitments still completable) · two-admin claim race · decision immutability

**Acceptance** · an importer reaches L2-I through the real admin flow · a trader reaches L2-T and `listing_eligible` flips to `true` · a moderation admin cannot fetch a KYC binary · every KYC view is audited before the URL exists.

---

## Phase 3 — Marketplace and the legal invariant *(2.5 weeks)*
**Slice: a verified trader publishes; the public browses and searches.**

**Backend** `marketplace` · `/listings`, `/categories`, `/search`, `/saved` · moderation actions · Arabic normalization function + generated `tsvector`/trigram columns
**Data** `categories`, `product_listings` (**composite FK**), `listing_media`, `saved_items`
**Frontend** `Marketplace` (3) · `Product Detail` (5) · `Seller Profile` (6) · `Consumer Home` (2) · `Search` (4, all 5 states) · `Saved` (7) · `Listing Composer` (18, **including the blocked state**) · `Landing` (1) · SSR/ISR, metadata, sitemap
**Security** **legal-invariant suite in full**, including the direct-`INSERT` `23503` assertion
**QA** Arabic search morphology · listing moderation lifecycle · saved change flags · LCP budget on throttled 3G

**Acceptance** · a verified trader publishes through moderation · **an importer sees the blocked state, and a direct database insert raises `23503`** · `معطف` matches `المعاطف` · public pages are indexable.

---

## Phase 4 — Trips and capacity *(3 weeks)*
**Slice: an importer publishes a trip inside the legal cap; traders discover it.**

**Backend** `trips` · `/trips/*` with **two role-aware serializers** · `platform` regulatory module · rule resolution + stamping · monthly trip cap · row-lock capacity allocation
**Data** `trips`, `trip_categories`, `trip_capacity_ledger`, `regulatory_rules`, `regulatory_rule_versions` (8 seeded keys)
**Frontend** `Trip Creation` (12, padlocked legal cap with effective date) · `Trip` (11) · `Importer Home` (9) · `Discover` (16)
**Security** **value-privacy suite** — no counterparty payload contains a value field
**QA** **capacity concurrency suite** (10 parallel accepts, room for 3) · each axis fails independently · lock-ordering regression · regulatory reproducibility · monthly cap refusal

**Acceptance** · ten parallel allocations leave the ledger within every cap · the counterparty payload has no value field anywhere · the third trip in a month is refused with `LEGAL_LIMIT_REACHED` · a trip published today still reports its original cap after a rule change.

> **Gate: Q3** (Demand Board unit estimates) must be answered. Interim unblocks it: admin-curated
> category defaults.

---

## Phase 5 — Demand board *(1.5 weeks)*
**Slice: an importer sees aggregated demand and builds a buy list against live capacity.**

**Backend** demand aggregation job with the k-anonymity threshold · buy-list projection (lock-free) · `/demand/board`
**Data** `demand_aggregates`
**Frontend** `Demand Board` (10) including the *does not fit in the remainder* blocked state
**QA** k-threshold suppression (cells below `k` are **absent**, not flagged) · projected-vs-allocated separation

**Acceptance** · aggregates expose counts and bands but never identities · adding an item returns recomputed three-axis capacity in one round trip.

---

## Phase 6 — Sourcing *(2 weeks)*
**Slice: a trader posts a request, importers offer, the trader accepts.**

**Backend** `sourcing` · request and offer lifecycles · accept-as-one-transaction (siblings declined, request `committed`, commitment created)
**Data** `sourcing_requests`, `sourcing_offers`
**Frontend** `Sourcing Request` (17, four views) · `Trader Home` (15) · `Importer Profile` (14)
**QA** single-accept invariant · partial-coverage offers · edit-after-offers versioning

**Acceptance** · multiple offers including a partial one; accepting one declines the rest atomically; offer cards show decomposable facts and no composite score.

> **Gate: Q4** (may an importer publish a sourcing request?). Interim: the stricter reading.

---

## Phase 7 — Commitments *(3 weeks) — the keystone*

**Do not parallelise this phase with anything.**

**Backend** `commitments` · full state machine (7 stages + 3 terminals) · versioned terms · capacity consume/release · handover codes and dual confirmation · the **disabled** deposit endpoint returning `FEATURE_DISABLED`
**Data** `commitments`, `commitment_terms`, `commitment_transitions`, `handover_confirmations`, `handover_codes`, `commitment_deposit_declarations` *(flagged off)*
**Frontend** `Commitment` (22), rendering **six** stages while the flag is off
**QA** **full transition table, valid and invalid** · dual confirmation · idempotent replay · `accepted → buying` works with `secured` unreachable

**Acceptance** · a commitment runs `proposed → accepted → buying → transit → handover → done` **without `secured`** · invalid transitions return the current state and allowed actions · a replayed request produces one transition and one ledger row.

---

## Phase 8 — Messaging and notifications *(2.5 weeks)*
**Slice: two parties negotiate in a thread, agree, and confirm handover.**

**Backend** `messaging` · polling endpoint · action cards whose effects are transactional with the message · notification fan-out via pg-boss · **Web Push**
**Data** `conversations`, `conversation_participants`, `messages`, `message_actions`, `notifications`
**Frontend** `Messages` (21) with both card types · in-app notification feed · the ranked *needs your attention* read model on both home screens
**Security** handover code stored hashed, never in message content · push payloads carry no price, name, document or trip value
**QA** participant authorization · card effects atomicity · unread correctness · conversation locks at terminal states

**Acceptance** · an agreement card creates a commitment · a handover card with a valid code creates a confirmation · a non-participant gets `404` · quiet hours respected except for `critical`.

---

## Phase 9 — Trust: reviews, reputation, disputes *(2.5 weeks)*
**Slice: a completed commitment produces a review and a visible record; a bad one produces a dispute.**

**Backend** `trust` · reviews with one reply · reputation facts with **stored inputs** · disputes with auto-bundled evidence · dispute and moderation queues reusing the Phase 2 primitive
**Data** `reviews`, `review_replies`, `reputation_facts`, `disputes`, `dispute_evidence`
**Frontend** `Dispute` (23, six states) · review + reply UI · the calculation sheets on `Importer Profile`
**QA** review-source requirement · `DELETE` grants absent · **customs-hold exclusion** · dispute not counted against the opener · median not mean

**Acceptance** · a review is possible only from a `done` commitment · each published figure opens its stored breakdown · a documented customs hold does not reduce completion rate.

> **Gate: Q1** (source of a final price). If declined, `price_stability_rate` is dropped from
> published facts in this phase, not retrofitted later.

---

## Phase 10 — Compliance and regulatory surfaces *(1.5 weeks)*
**Slice: anyone asks "can I import this?" and gets a verdict with its source.**

**Backend** compliance resolution (exact → normalized → category → **unknown**) · rule publication lifecycle with impact preview and dual approval · change notifications
**Data** `compliance_items`
**Frontend** `Compliance Checker` (8) in ar/fr/en · regulatory queue in the admin console
**QA** disclosure order · separation of duty · impact preview accuracy · **unknown-goods never returns "allowed"**

**Acceptance** · verdict-first with collapsed legal basis and source, publicly, in three languages · a rule change previews impact, requires a second approver, and notifies affected users with a reason.

> **Gate: Q2** (unknown-goods state). Needs designer sign-off only.

---

## Phase 11 — Billing and records *(2 weeks)*
**Slice: an importer subscribes by CCP transfer and keeps their ledger and labels.**

**Backend** `billing` schema · `PaymentProvider` interface + `ManualTransferProvider` · admin billing queue · idempotent activation · ledger projection · Art. 14 label PDF generation
**Data** `billing.plans`, `billing.subscriptions`, `billing.payment_attempts`
**Frontend** `Records` (13) all three tabs
**QA** idempotent activation · **no query can join billing to commercial data** · label refusal when the address is missing

**Acceptance** · a receipt upload activates a subscription through the admin queue · the billing queue is structurally separate · labels generate as a deterministic PDF.

---

## Phase 12 — Hardening and launch *(3 weeks)*

**Security** independent penetration test focused on IDOR, KYC access, SIM-swap and capacity races · remediation
**Performance** load testing, index tuning, image pipeline, bundle budgets
**Accessibility** full audit in Arabic and French
**i18n** the launch-critical fr/en content set
**Content** real product photography replacing placeholders
**Ops** backup restore rehearsed **as a pair** (database + objects) · runbooks · S1 incident procedure · alerting
**Legal** U1/U2 answered and applied · §9.2 ruled on · U6 answered
**Gate** the pre-launch checklist in `SECURITY-ARCHITECTURE.md` §13

---

## 2. Definition of Done — binding for every phase

A phase is complete only when **all five columns** are true.

| | Requirement |
|---|---|
| **Backend** | Modules registered · services with unit tests · endpoints with zod request/response schemas · **every route carries `@Policy` or `@Public()`** · errors use the standard envelope with `message_key` |
| **Frontend** | Every screen in the phase built with **all** its designed states: loading · empty · error · offline (where drawn) · permission-denied · success. Arabic RTL verified. Numbers LTR-isolated from the shared formatter |
| **Data** | Migrations reviewed **as SQL** · constraints and indexes for the phase's invariants · a CI diff proving Drizzle definitions match the migrated schema |
| **Security** | Authorization tested for every new route × every actor class · input validation · rate limits where the endpoint is abusable · no new secret in the repository |
| **QA** | Unit + integration (real Postgres) + API contract + E2E for the slice's happy path **and** its primary denial path · the phase's critical-invariant suite green |

Additionally, no phase is done while any of the six non-overridable suites is red:

1. An importer cannot create a consumer listing (incl. direct-`INSERT` `23503`)
2. KYC isolation, incl. audit-before-signed-URL ordering
3. Trip value-capacity privacy across every serializer
4. The full commitment transition table, valid and invalid
5. Capacity concurrency, incl. lock-ordering regression
6. Audit and admin-decision immutability

---

## 3. Schedule

| Phase | Wks | Cum. | Gate |
|---|---:|---:|---|
| 0 Foundation | 2 | 2 | |
| 1 Identity | 2 | 4 | U7 SMS gateway needed for real OTP |
| 2 Verification + admin | 3 | 7 | |
| 3 Marketplace | 2.5 | 9.5 | |
| 4 Trips + capacity | 3 | 12.5 | **Q3** |
| 5 Demand board | 1.5 | 14 | |
| 6 Sourcing | 2 | 16 | **Q4** |
| 7 Commitments | 3 | 19 | |
| 8 Messaging + notifications | 2.5 | 21.5 | |
| 9 Trust | 2.5 | 24 | **Q1** |
| 10 Compliance | 1.5 | 25.5 | **Q2** |
| 11 Billing + records | 2 | 27.5 | U6 default applies |
| 12 Hardening | 3 | **30.5** | U1, U2, §9.2 |

Roughly **seven months** with 3–4 engineers. Phases 3 and 5 can partially parallelise across
backend and frontend once Phase 2 lands. **Phase 7 parallelises with nothing.**
