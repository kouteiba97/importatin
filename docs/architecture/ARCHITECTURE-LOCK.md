# Maabar — Locked Architecture

**Status:** 🔒 **LOCKED** — this is the implementation contract
**Date:** 14 September 2026
**Supersedes:** conflicting statements in `TECHNICAL-BLUEPRINT.md` v1 and its companions
**Authority:** where this document and any other architecture document disagree, **this one wins**

No alternatives. No "could use X or Y". An engineer starting Phase 0 should never need to ask
which technology we are using, whether something is MVP, who is allowed to do what, where data
lives, whether we process payments, or how capacity allocation works.

---

## 1. The contract

```
Frontend:        Next.js 15 (App Router) · React 19 · TypeScript · CSS Modules over tokens.css
                 TanStack Query (server state) · react-hook-form + zod (forms)
                 No Redux, no Zustand, no MobX, no Tailwind, no component library

Backend:         NestJS 11 · TypeScript · ONE deployable modular monolith
                 11 modules · 2 process entrypoints (api, worker) from ONE image

Database:        PostgreSQL 16
                 extensions: pg_trgm, unaccent, citext, pgcrypto
                 schemas: app · billing · audit

ORM:             Drizzle ORM + hand-written SQL migrations (SQL is the source of truth)

Object Storage:  S3-compatible API (AWS SDK v3) behind a StoragePort interface
                 dev/staging: MinIO container · production provider: DEFERRED to legal answer
                 NOT a self-hosted MinIO cluster

Background Jobs: pg-boss only
                 NO separate outbox table · NO event bus · NO Redis · NO RabbitMQ · NO Kafka

Search:          PostgreSQL FTS + pg_trgm, generated tsvector columns on source tables
                 NO separate search index table at MVP · NO Elasticsearch/OpenSearch

Authentication:  Phone + 6-digit OTP, passwordless
                 Opaque 256-bit session token, sha256-hashed in Postgres
                 Cookie __Host-mb_session · HttpOnly · Secure · SameSite=Lax
                 NO JWT · NO passwords · NO refresh-token pair

Authorization:   Five ordered server-side gates, declared per route
                 authenticated → capability → verification level → ownership/visibility → precondition
                 Capabilities on ONE identity. NO role column. NO frontend enforcement.

Verification:    Derived level (L0/L1/L2-I/L2-T/L3) computed from approved, unexpired documents
                 Documents private, never returned by a public API, admin-only short-lived signed URL

Messaging:       Conversation attached to one context object · structured action cards
                 HTTP polling while a thread is focused · NO WebSocket server

Notifications:   In-app (durable record, always) · SMS for OTP ONLY
                 Web Push: late-MVP, Phase 8 · Email: NOT BUILT (no address is collected)

Audit:           Append-only tables in the `audit` schema
                 UPDATE/DELETE/TRUNCATE revoked for the application role
                 NO hash chain at MVP (deferred — see ADR-008)

Billing:         Separate `billing` schema with NO foreign key into `app`
                 PaymentProvider adapter interface
                 MVP implementation: ManualTransferProvider (CCP/BaridiMob receipt + admin confirm)
                 SATIM/CIB/Eddahabia: NOT BUILT until commercially confirmed

Deployment:      Docker · 1 VPS at MVP (web + api + worker + Postgres + MinIO)
                 Caddy (TLS) · GitHub Actions CI/CD · staging + production
                 NO Kubernetes · NO service mesh · NO multi-region

Testing:         Vitest (unit + integration with Testcontainers) · Supertest (API)
                 Playwright (E2E) · 6 non-overridable critical-invariant suites

Observability:   Structured JSON logs with request-id · Sentry · /health/live + /health/ready
                 pg-boss job monitoring · NO Prometheus/Grafana/OTel at MVP
```

---

## 2. What changed in this review, and why

Nine decisions from the first blueprint were **wrong or over-built**. Each is corrected below.
Everything not listed here stands unchanged.

| # | Was | Now | Why it was wrong |
|---|---|---|---|
| C1 | Transactional outbox table **plus** pg-boss | **pg-boss only** | pg-boss *is* a Postgres table. Enqueuing on the request's transaction is already transactionally atomic. The outbox was a second implementation of a guarantee pg-boss provides. Pure ceremony |
| C2 | Hash-chained audit log + nightly verifier | **Append-only + revoked grants.** Hash chain deferred | I revoked UPDATE/DELETE for the app role, then added a chain to detect tampering by someone who could still tamper — a database superuser — and admitted in the same document that they could recompute it. It defends against nobody the grants do not already stop |
| C3 | `search.documents` table, per-locale rows, sync jobs | **Generated `tsvector` columns on source tables** | The four search scopes are four different queries anyway. A denormalised index table bought nothing and added a sync job that can silently go stale |
| C4 | "Documents stored in Algeria" treated as a requirement | **LEGAL VALIDATION REQUIRED.** Provider choice deferred behind `StoragePort` | `DESIGN-AUDIT.md` §9.4 states this as a *design position* while explicitly listing the ANPDP question as unresolved. I converted an open question into a technical fact — the exact failure the brief warns about |
| C5 | Self-hosted, replicated MinIO cluster | **S3 API abstraction; single MinIO node or managed S3-compatible** | The *abstraction* costs nothing and prevents a migration problem. The *cluster* is real ops burden for a team of four, sized for volumes we do not have |
| C6 | SATIM/CIB integration in Phase 10 | **Adapter interface; manual confirmation only** | Merchant access, API availability and onboarding requirements are all unconfirmed. Coupling billing to an unconfirmed provider is the mistake the brief names explicitly |
| C7 | 19 modules | **11 modules** | Eight were CRUD groupings wearing bounded-context clothing (`saved`, `media`, `search`, `compliance`, `demand`, `audit`, `reviews`, `disputes`). A modular monolith needs boundaries where behaviour differs, not one folder per noun |
| C8 | ~48 tables | **34 MVP tables** | `Product` as an abstraction separate from `ProductListing` earns its keep only when several traders list the same item for comparison — which is not an MVP behaviour. Seven other tables were infrastructure split too finely |
| C9 | ClamAV malware scanning | **Re-encode images, rasterise PDFs.** AV deferred | Re-encoding an image and rasterising a PDF destroys embedded payloads. That is the actual control; the scanner was a second, weaker one bolted in front of it |

Two further reductions, smaller but real:

| # | Was | Now |
|---|---|---|
| C10 | Regulatory version lifecycle with 6 states | **3 states** — `draft → active → superseded`. Dual approval kept as a CHECK constraint, because it is free |
| C11 | Web Push in MVP | **Phase 8.** In-app notifications first — they are the durable record and every screen reads them |

### What I am NOT changing, and will defend

| Decision | Why it survives review |
|---|---|
| Modular monolith | The three hardest requirements — capacity concurrency, audit atomicity, the legal foreign key — all get *harder* if split. Nothing in this product wants a network boundary |
| Drizzle over Prisma | See ADR-001. The legal invariant is a generated column plus a composite FK; Prisma can express neither, and its drift detection actively fights hand-written DDL |
| Opaque sessions, not JWT | Capability and verification gate legal invariants. A JWT caches exactly the facts that must be instantly revocable |
| Composite FK for the listing invariant | It is the product's legal thesis expressed as a constraint, and the only control no application bug can defeat |
| `bigint` centimes | Non-negotiable |
| Three-axis capacity with `SELECT … FOR UPDATE` | Simplest mechanism that is actually correct. No advisory locks, no SERIALIZABLE, no retry loop |
| `billing` schema with no FK into `app` | A structural guarantee that beats any policy document |
| No composite trust score | Settled product decision, and a legal exposure under Law 18-07 |
| Postgres FTS, no Elasticsearch | ~1,200 listings |
| Deposit behind a feature flag | Live legal hold |

---

## 3. Modules — final, 11

One deployable. Boundaries exist where **behaviour and authorization differ**, not per noun.

| # | Module | Owns | Absorbed from v1 |
|---|---|---|---|
| 1 | `identity` | users, phone identities, capabilities, sessions, OTP | — |
| 2 | `profiles` | trader/importer profiles, **consumer data merged into `users`** | — |
| 3 | `verification` | cases, documents, derived levels, **file upload + storage** | `media` |
| 4 | `marketplace` | categories, listings, listing media, **search over listings** | `search` (part) |
| 5 | `trips` | trips, capacity ledger, **demand aggregates** | `demand` |
| 6 | `sourcing` | sourcing requests, offers | — |
| 7 | `commitments` | commitments, terms, transitions, handover | — |
| 8 | `messaging` | conversations, messages, action cards | — |
| 9 | `trust` | reviews, replies, reputation facts, **disputes + evidence** | `reviews`, `disputes` |
| 10 | `platform` | regulatory rules, compliance items, **saved items**, notifications, feature flags | `compliance`, `saved`, `notifications`, `regulatory` |
| 11 | `admin` | admin users, queues, decisions, **audit writer** | `audit` |

### Communication rules (enforced by lint, not convention)

- A module may import another module's **service interface and DTOs**. Never its Drizzle tables,
  never its repositories. `no-restricted-imports` on `*/infra/**` across module boundaries.
- **Exactly one cross-module transaction is permitted:** `commitments` → `trips` via
  `TripCapacityPort`, inside the caller's transaction. Accepting a commitment consumes trip
  capacity; they must not diverge. Any other cross-module transaction is a build failure.
- `admin` may read any module through its service interface. No module may call `admin`.
- Everything else asynchronous goes through pg-boss, enqueued on the request transaction.
- **No internal event bus.** A domain "event" at MVP is either a direct service call or a job.

---

## 4. Database — final, 34 MVP tables

`app` (28) · `billing` (3) · `audit` (3).

### `app`

| Group | Tables |
|---|---|
| Identity (5) | `users` *(consumer profile merged in)*, `phone_identities`, `capabilities`, `sessions`, `otp_challenges` |
| Reference (2) | `wilayas`, `categories` |
| Profiles (3) | `trader_profiles`, `importer_profiles`, `profile_levels` |
| Verification (4) | `verification_cases`, `verification_documents`, `document_types`, `media_objects` *(upload sessions merged in as a state)* |
| Marketplace (2) | `product_listings` *(Product merged in)*, `listing_media` |
| Trips (4) | `trips`, `trip_categories`, `trip_capacity_ledger`, `demand_aggregates` |
| Sourcing (2) | `sourcing_requests`, `sourcing_offers` |
| Commitments (5) | `commitments`, `commitment_terms`, `commitment_transitions`, `handover_confirmations`, `handover_codes` |
| Messaging (4) | `conversations`, `conversation_participants`, `messages`, `message_actions` |
| Trust (5) | `reviews`, `review_replies`, `reputation_facts`, `disputes`, `dispute_evidence` |
| Platform (5) | `regulatory_rules`, `regulatory_rule_versions`, `compliance_items`, `saved_items`, `notifications` |
| Infra (4) | `feature_flags`, `reference_sequences`, `rate_limit_counters`, `idempotency_keys` |

Plus **`commitment_deposit_declarations`** — created, permanently gated by
`features.deposit_declaration = false` until legal sign-off. Counted separately because it must
not ship enabled.

### `billing` (3)

`plans` · `subscriptions` · `payment_attempts` *(receipts merged in)*
**No foreign key into `app`.** `subscriptions.user_id` is a bare uuid, deliberately.

### `audit` (3)

`audit_log` · `admin_decisions` · `decision_reasons`
`UPDATE`, `DELETE`, `TRUNCATE` revoked for `maabar_app` and `maabar_worker`.

### Merges applied, with reasons

| Merged | Into | Reason |
|---|---|---|
| `products` | `product_listings` | An abstract Product pays for itself only when several traders list the same item for price comparison. Not an MVP behaviour. Splitting later is an additive migration |
| `consumer_profiles` | `users` | One nullable column (`wilaya_code`). A table for one field is ceremony |
| `upload_sessions` | `media_objects` | A state (`pending → scanning → ready → rejected`), not an entity |
| `billing_receipts` | `payment_attempts` | A receipt is an attribute of an attempt |
| `subscription_periods` | `subscriptions` | MVP has no proration and no mid-period plan change |
| `compliance_verdicts` | `compliance_items` | One verdict per item per rule version |
| `saved_watch_events` | `notifications` | A watch event *is* a notification |
| `phone_identity_changes` | `audit_log` | It is an audit entry |
| `notification_deliveries` | `notifications` | One channel at MVP (in-app). Split when Web Push lands in Phase 8 |
| `push_subscriptions` | — | Deferred with Web Push |
| `search.documents` | generated columns | See C3 |
| `outbox` | pg-boss | See C1 |
| `demand_signals` | derived from `sourcing_requests` | A query, not a table |

### Tables that must stay separate

| Table | Why it cannot merge |
|---|---|
| `trader_profiles` | Holds `listing_eligible`, the generated column the legal FK targets. Merging into `users` would put the constraint on a table every write touches |
| `product_listings` | Target of the composite FK. Independent lifecycle and moderation |
| `commitment_terms` | Versioned and immutable; `price_stability_rate` is measured against a specific version |
| `commitment_transitions` | Append-only history; a mutable state column cannot answer "when and by whom" |
| `trip_capacity_ledger` | A sum over rows is the concurrency mechanism. A counter column would be a second source of truth |
| `regulatory_rule_versions` | Historical reproducibility depends on it |
| `handover_confirmations` | Two rows are the dual-confirmation invariant |
| `reviews` / `review_replies` | One reply per review, different author, different authorization |
| `audit.*` | Different schema, different grants |
| `billing.*` | Different schema, deliberately no FK |

---

## 5. Critical invariants — enforcement locked

For each: **application-only**, **database-enforced**, or **both**.

| # | Invariant | Enforcement |
|---|---|---|
| I1 | A micro-importer can never publish a consumer-facing listing | **BOTH.** Composite FK `product_listings(seller_user_id, seller_listing_eligible) → trader_profiles(user_id, listing_eligible)` where `listing_eligible` is `GENERATED ALWAYS AS (identity ∧ rc ∧ nif ∧ address ∧ ¬suspended) STORED`, plus gate 2/3 in the policy guard |
| I2 | Revoking listing eligibility with live listings fails loudly | **DATABASE.** `ON UPDATE RESTRICT`. Service must archive listings first |
| I3 | A confirmed commitment never exceeds available capacity on any axis | **BOTH.** `SELECT … FOR UPDATE` on `trips`, sum `trip_capacity_ledger WHERE released_at IS NULL`, assert all three axes, insert ledger row — one transaction. CHECK constraints keep every ledger amount ≥ 0 |
| I4 | One live primary phone per user; one owner per number | **DATABASE.** Two partial unique indexes |
| I5 | One open verification case per user per capability | **DATABASE.** Partial unique index |
| I6 | At most one approved live document of each type per user | **DATABASE.** Partial unique index `WHERE status = 'approved'` |
| I7 | At most one accepted offer per sourcing request | **DATABASE.** Partial unique index `WHERE state = 'accepted'` |
| I8 | Exactly two handover confirmations reach `done` | **BOTH.** `UNIQUE (commitment_id, party)` + "am I second?" evaluated inside the commitment row lock |
| I9 | A state transition is never applied twice | **DATABASE.** `UNIQUE (commitment_id, idempotency_key)` |
| I10 | One review per author per source; never about oneself | **DATABASE.** `UNIQUE (author_user_id, source_id)` + CHECK `subject ≠ author` |
| I11 | Exactly one reply per review, by the subject | **BOTH.** `review_id` is the PK of `review_replies`; author checked in the service |
| I12 | Reviews, admin decisions, audit rows and transitions are never deleted | **DATABASE.** `REVOKE DELETE, UPDATE` from `maabar_app`, `maabar_worker` |
| I13 | One live subscription per user | **DATABASE.** Partial unique index |
| I14 | A payment is never applied twice | **DATABASE.** `UNIQUE (provider, provider_reference)` |
| I15 | A regulatory rule version is never approved by its drafter | **DATABASE.** `CHECK (approved_by IS NULL OR approved_by <> created_by)` |
| I16 | Exactly one regulatory version is in force per rule at any date | **DATABASE.** `EXCLUDE USING gist (rule_key WITH =, daterange(...) WITH &&) WHERE (status = 'active')` — requires `btree_gist` |
| I17 | Trip value capacity never reaches a counterparty | **APPLICATION.** Two serializers + a contract test asserting the field is absent. A database cannot enforce a projection |
| I18 | Money is never a float | **DATABASE.** Every monetary column is `bigint`, named `*_centimes` |
| I19 | Billing never joins to commercial data | **DATABASE.** Separate schema, no FK. A join requires a migration first |
| I20 | Deposit declaration is unreachable | **APPLICATION + CI.** Feature flag false; production startup assertion; CI check |

**I17 is the only invariant that is application-only**, and it is called out here so nobody
assumes the database is covering it. It is covered by a test instead, and that test is in the
non-overridable set.

---

## 6. Authorization — locked

### Actors

| Actor | Definition | Granted by |
|---|---|---|
| **Anonymous** | No session | — |
| **Consumer** | `capabilities` contains `consumer` | Self-declared at onboarding |
| **Trader** | `capabilities` contains `trader` | Self-declared; powers require L2-T |
| **Micro-importer** | `capabilities` contains `importer` | Self-declared; powers require L2-I |
| **Admin** | Row in `audit.admin_users` with a queue role + MFA | Granted by a super admin. **Never self-declared** |
| **Super Admin** | `admin_users.roles` contains `superadmin` | Manual database grant at setup. **May grant roles but may NOT decide queue items** |

One identity may hold consumer + trader + importer simultaneously. `admin` is **not** a capability
and never appears in `app.capabilities`.

### Gates — evaluated in order, server-side, on every request

```
1 authenticated          → 401 UNAUTHENTICATED
2 capability held        → 403 CAPABILITY_REQUIRED
3 verification level     → 403 VERIFICATION_REQUIRED
4 ownership / visibility → 404 NOT_FOUND          (never 403 — anti-enumeration)
5 action precondition    → 409 / 403 with a specific code
```

Every route carries `@Policy({...})` or an explicit `@Public()`. A route with neither **fails the
build**. Active context (`import` / `buy` / `shop`) selects navigation only and **never** appears
in an authorization decision.

### The locked example

> Only a trader whose commercial register is verified may create a consumer-facing
> `ProductListing`.

Enforced at: policy gate 2 (capability `trader`), gate 3 (level L2-T), and the composite foreign
key. The database refusal is authoritative — if the service check is ever removed by mistake, the
insert still fails with `23503`.

---

## 7. Money boundary — locked

Three kinds of money exist in this product. They must never touch.

| Kind | Who pays whom | In the system? |
|---|---|---|
| **Subscription** | User → Maabar | **Yes.** `billing` schema. The only money Maabar handles |
| **Trade price** | Trader ↔ importer, consumer ↔ trader | **Recorded as a band, never settled.** `commitment_terms.band_min/max_centimes`. A declared final price may be recorded at handover as a fact — see the open question in §10 |
| **Deposit** | Trader ↔ importer | **Table exists, feature flag OFF.** No custody, settlement or refund column exists |

**Forbidden by construction — none of these may ever be created:**
a Maabar wallet · an escrow balance · a user funds ledger · a payment-custody record · a
trade-payment processing path · a commission or transaction fee · a currency conversion.

The structural guarantee: `billing` has **no foreign key into `app`**, so no query can settle
trade through Maabar without a migration first. A migration that adds such a key requires two
reviewers and must cite this section.

---

## 8. Storage — locked interface, deferred provider

```ts
interface StoragePort {
  createUploadGrant(purpose, userId, declaredType, declaredBytes): Promise<UploadGrant>;
  promote(objectKey: string, bucket: Bucket): Promise<void>;
  signedReadUrl(objectKey: string, ttlSeconds: number): Promise<string>;
  delete(objectKey: string): Promise<void>;
}
```

**Locked:** the S3-compatible API (AWS SDK v3), the `StoragePort` interface, five logical buckets
(`kyc`, `disputes`, `receipts`, `media-public`, `quarantine`), random object keys, signed reads
only, no path-based serving, image re-encode and PDF rasterisation in the worker.

**Deferred — `UNKNOWN — REQUIRES DECISION`:** the production provider and its physical location.

`DESIGN-AUDIT.md` §9.4 records "documents stored in Algeria" as a **design position** while
listing the ANPDP authorisation question as **unresolved**. That is not an established legal
requirement, and the first blueprint wrongly treated it as one.

| Scenario | Production storage |
|---|---|
| Residency confirmed required | Single MinIO node on the Algerian VPS + nightly encrypted off-box backup. **Not a cluster** |
| Residency not required | Managed S3-compatible in the nearest EU region |
| Answer still pending at launch | Default to the conservative option (Algerian MinIO) — it satisfies both answers |

Because everything speaks the S3 API through one port, moving is a config change plus an object
copy, not a rewrite. **`LEGAL VALIDATION REQUIRED` — see §12.**

---

## 9. Background work — locked

**pg-boss only.** Enqueued on the request's transaction, so a job cannot exist for a change that
rolled back, and a committed change cannot lose its job. That is the outbox guarantee, without an
outbox table.

| Must be synchronous (in the request) | Must be asynchronous (pg-boss) |
|---|---|
| Every domain state transition | SMS/OTP dispatch |
| Every authorization decision | Image variant generation, PDF rasterisation |
| Every capacity allocation | Notification fan-out |
| Every audit row | Demand aggregate recomputation |
| Every constraint check | Document expiry sweep (scheduled) |
| Reading regulatory rules | Commitment/offer expiry timers (scheduled) |
| Search queries | Reputation recomputation |
| **Search index updates** *(generated columns — free, in the same write)* | Backups and retention jobs |

Ordinary CRUD stays synchronous. A create-listing request writes a row and returns; it does not
publish an event for someone to maybe handle later.

---

## 10. Open items carried into implementation

Four questions gate later phases. None blocks Phases 0–3. Each has a locked interim.

| # | Question | Gates | Locked interim |
|---|---|---|---|
| **Q1** | Where does a **final price** come from? `Records` draws exact ledger amounts and `Importer Profile` publishes `ثبات السعر`, but a commitment records a band, never a settled price | Phase 9 | Optional `final_unit_price_centimes` declared by **both parties** on the handover confirmation. Count only corroborated values. **If product declines: drop `price_stability_rate`. Never infer it** |
| **Q2** | What does the compliance checker answer for unknown goods? One verdict is drawn, no unknown state | Phase 10 | A neutral "no verdict for these goods" state from existing components + the standing customs disclaimer. **Never default to "allowed"** |
| **Q3** | Where do Demand Board unit cost/weight/volume estimates come from? | Phase 5 | **Admin-curated category defaults** — unblocks the phase immediately. Median of corroborated prices once Q1 lands |
| **Q4** | May a micro-importer publish a sourcing request? `Verification` L2 says yes; `DESIGN-AUDIT.md` §5 says "only when acting as trader" | Phase 6 | The audit's **stricter** reading: `capability:trader` + L2-T |

---

## 11. `UNKNOWN — REQUIRES DECISION`

Explicitly unknown. Not invented, not assumed.

| # | Unknown | Type | Needed by |
|---|---|---|---|
| U1 | Is storage of KYC documents inside Algeria legally required? Is prior ANPDP authorisation required for this processing? | **LEGAL** | Before production launch. Does not block build (§8) |
| U2 | Legal retention period for KYC documents, dispute evidence and messages | **LEGAL** | Before production launch. `KYC_RETENTION_MONTHS` ships **unset**, and the deletion job refuses to run and logs why |
| U3 | Is a recorded, never-held deposit a prohibited purchase mandate under Decree 25-170 art. 3? | **LEGAL** | Flag stays false until answered |
| U4 | May an importer appear in B2B discovery with indicative price bands under Law 18-05? | **LEGAL** | Flag `discover.importers.audience` defaults to `verified_traders` |
| U5 | Is SATIM/CIB merchant access commercially and technically available to Maabar? | **COMMERCIAL** | Not needed for MVP — manual confirmation ships instead |
| U6 | What does an expired subscription actually block? The design never draws a consequence | **PRODUCT** | Phase 12. Default: block capability-gated *creation*, never interrupt an in-flight commitment |
| U7 | SMS gateway, per-message cost and sender-ID registration in Algeria | **COMMERCIAL** | Phase 1. Blocks real OTP delivery; a console stub ships for development |
| U8 | Is a `.dz` domain registration in progress, and who is the Algerian registrant? | **ADMIN** | Before staging is public |

None of U1–U8 forces an architectural change in any direction, because each is isolated behind an
interface, a flag or an unset configuration value.

---

## 12. Locked environment configuration

```
NODE_ENV · APP_BASE_URL · API_BASE_URL
DATABASE_URL · DATABASE_POOL_MAX
STORAGE_ENDPOINT · STORAGE_ACCESS_KEY · STORAGE_SECRET_KEY · STORAGE_BUCKET_*
SESSION_COOKIE_DOMAIN · SESSION_IDLE_DAYS=30 · SESSION_ABSOLUTE_DAYS=90
SMS_PROVIDER · SMS_API_KEY · SMS_SENDER_ID
LOG_LEVEL · SENTRY_DSN

FEATURE_DEPOSIT_DECLARATION=false        # LEGAL HOLD — production startup asserts this
DISCOVER_IMPORTERS_AUDIENCE=verified_traders
KYC_RETENTION_MONTHS=                    # intentionally EMPTY until U2 is answered
PAYMENT_PROVIDER=manual                  # only 'manual' exists at MVP
```

Two startup assertions refuse to boot production:
`FEATURE_DEPOSIT_DECLARATION=true` without `LEGAL_SIGNOFF_REF`, and `PAYMENT_PROVIDER` set to any
provider that has no implementation.
