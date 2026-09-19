# Maabar — System Architecture

**Status:** pre-build blueprint
**Companion documents:** `DOMAIN-MODEL.md`, `DATABASE-DESIGN.md`, `ARCHITECTURE-DECISIONS.md`

---

## 1. Repository reality as inspected

The full repository was inspected before any proposal was written.

| Checked | Found |
|---|---|
| Application code (`.ts`, `.tsx`, `.py`, `.go`, `.rs`, `.php`, `.rb`, `.java`, `.sql`) | **None** |
| Package manifests (`package.json`, `requirements.txt`, `Cargo.toml`, `go.mod`, `composer.json`, `pom.xml`, `Gemfile`) | **None** |
| Configuration / environment (`.env`, `.env.example`, `docker-compose.yml`, `Dockerfile`) | **None** |
| Database schema or migrations | **None** |
| `DESIGN-AUDIT.md` | Present — 16.5 KB, the operative audit |
| `README.md` | Present — product boundaries and the ten settled decisions |
| `designs/` | 24 `.dc.html` artboards + `tokens.css` (11.7 KB) + `support.js` |
| `preview/server.js` | 3.5 KB static preview server, injects React into the artboards |
| Git history | 2 commits; latest `1d00688` "Reduce repository to the final design and its audit" |

**Files named in the brief that do not exist:** `FINAL-DESIGN-AUDIT.md`, `REMEDIATION-MAP.md`, `spec/`.
`DESIGN-AUDIT.md` is therefore the top of the source-of-truth hierarchy, and the 24 artboards
are the behavioural specification. This is recorded because the brief's hierarchy assumed those
files; their absence changes nothing material — `DESIGN-AUDIT.md` covers the same ground.

**`designs/support.js` is not Maabar code.** It is the generated Claude Design canvas runtime
(`// GENERATED from dc-runtime/src/*.ts`), a template parser for `<x-dc>` documents. It carries
no domain logic and must not be carried into the application.

**Where the domain actually lives.** Each artboard's `<script type="text/x-dc">` block holds a
`class Component extends DCLogic` whose constant tables are the de facto specification: the
commitment `FLOW` and `SWITCH`, the verification ladders, the three trip capacity axes, the
reputation metric breakdowns, the regulatory `PARAMS`. This blueprint is derived from those
tables, not from the screenshots.

---

## 2. Architectural shape

**A modular monolith behind a thin server-rendering tier** (AD-001, AD-004).

```
                         ┌──────────────────────────────┐
     public internet ───▶│  CDN  (public product media) │
                         └──────────────────────────────┘
                                       │
┌──────────────────────────────────────┼───────────────────────────────────────┐
│                          maabar.dz  (TLS, HSTS)                              │
│                                                                              │
│   ┌────────────────────────────────────────────────────────────────────┐     │
│   │  WEB TIER — Next.js App Router  (thin BFF, no domain rules)        │     │
│   │                                                                    │     │
│   │   (public)        SSR / ISR  → Landing · Marketplace · Product     │     │
│   │                                Detail · Seller Profile ·          │     │
│   │                                Compliance Checker · Search        │     │
│   │   (app)           CSR shell  → all authenticated screens          │     │
│   │   (admin)         CSR shell  → Admin Console (desktop)            │     │
│   │                                                                    │     │
│   │   service worker: shell cache · resumable upload · Web Push        │     │
│   └────────────────────────────────┬───────────────────────────────────┘     │
│                                    │ HTTP, session cookie forwarded          │
│   ┌────────────────────────────────▼───────────────────────────────────┐     │
│   │  API TIER — NestJS modular monolith                                │     │
│   │                                                                    │     │
│   │  ┌── edge ──────────────────────────────────────────────────────┐  │     │
│   │  │ correlation-id · rate limit · CSRF · session resolve ·       │  │     │
│   │  │ policy guard (5 gates) · zod validation · error mapper       │  │     │
│   │  └──────────────────────────────────────────────────────────────┘  │     │
│   │                                                                    │     │
│   │  identity   profiles   verification   marketplace   demand         │     │
│   │  trips      sourcing   commitments    messaging     reviews        │     │
│   │  disputes   saved      notifications  compliance    regulatory     │     │
│   │  billing    admin      audit          search        media          │     │
│   │                                                                    │     │
│   │  ┌── platform kernel ───────────────────────────────────────────┐  │     │
│   │  │ policy · audit writer · outbox · reference-id · money ·      │  │     │
│   │  │ i18n catalogue · regulatory resolver · clock                 │  │     │
│   │  └──────────────────────────────────────────────────────────────┘  │     │
│   └───────────┬──────────────────────┬──────────────────┬─────────────┘     │
│               │                      │                  │                   │
│   ┌───────────▼────────┐  ┌──────────▼────────┐  ┌──────▼──────────────┐    │
│   │ PostgreSQL 16      │  │ MinIO (in DZ)     │  │ worker process      │    │
│   │ app · billing ·    │  │ kyc-private       │  │ pg-boss consumers:  │    │
│   │ audit · search idx │  │ dispute-private   │  │ otp · notify · img  │    │
│   │ pg-boss queue      │  │ media-public      │  │ index · aggregates  │    │
│   │ sessions           │  │ receipts-private  │  │ expiry · audit-hash │    │
│   └────────────────────┘  └───────────────────┘  └─────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────────┘
        │                    │                   │
   SMS gateway          SATIM / CIB          Web Push (VAPID)
   (OTP only)           (subscriptions only)
```

Three processes: `web`, `api`, `worker`. `api` and `worker` are the same build with a different
entrypoint, so domain code is shared and a job can call a domain service directly.

---

## 3. Why a modular monolith, concretely

The three hardest requirements in this product all get *harder* if split across services:

1. **Trip capacity concurrency** (§26 of the brief). Two traders consuming the same trip capacity
   must be serialised. Inside one database this is `SELECT … FOR UPDATE` on the trip row. Across
   services it is a distributed lock or a saga with compensations, for a system that will see
   single-digit concurrent writes per trip.
2. **Audit atomicity.** An admin decision, its consequence, its notification and its audit row
   must commit together or not at all. One transaction plus a transactional outbox does this.
   Two services introduce the "decided but never audited" failure mode, which is precisely the
   mode the audit requirement exists to prevent.
3. **The legal invariant** (AD-017). A composite foreign key can only protect rows in the same
   database as the table it references. Splitting listings from trader profiles would demote the
   strongest guarantee in the system to an eventually-consistent check.

Module boundaries are still enforced, so extraction stays possible: a module may import another
module's **service interface and DTOs**, never its repositories or Drizzle tables. A lint rule
(`no-restricted-imports` on `*/infra/**` across module boundaries) makes the violation a build
failure rather than a review comment.

---

## 4. Bounded contexts

Nineteen modules, grouped by coupling. "Transactional with" means the two participate in one
database transaction; everything else communicates through a service call or an outbox event.

### 4.1 Core — tightly coupled, one transactional cluster

| Module | Owns | Transactional with |
|---|---|---|
| `identity` | `users`, `phone_identities`, `sessions`, `otp_challenges`, `capabilities` | `profiles`, `audit` |
| `profiles` | `consumer_profiles`, `trader_profiles`, `importer_profiles` | `identity`, `verification` |
| `verification` | `verification_cases`, `verification_documents`, derived levels | `profiles`, `audit`, `media` |
| `regulatory` | `regulatory_rules`, `regulatory_rule_versions` | `audit` |
| `audit` | `audit_log` (append-only, partitioned) | everything |

`verification` and `profiles` are transactional because approving a document changes a derived
capability in the same commit — and that capability is what AD-017's foreign key depends on.

### 4.2 Commercial — the product's centre of gravity

| Module | Owns | Coupling |
|---|---|---|
| `marketplace` | `products`, `product_listings`, `categories`, `listing_media` | reads `profiles`; **FK-coupled to `trader_profiles`** (AD-017) |
| `trips` | `trips`, `trip_categories`, `trip_capacity`, `trip_capacity_ledger` | reads `regulatory` for the value cap |
| `sourcing` | `sourcing_requests`, `sourcing_offers` | reads `trips`, `profiles` |
| `commitments` | `commitments`, `commitment_terms`, `commitment_transitions`, `handover_confirmations`, *(held)* `commitment_deposit_declarations` | **transactional with `trips`** for capacity; emits to `messaging`, `reviews`, `notifications` |
| `demand` | `demand_signals`, `demand_aggregates` | projection over `sourcing`; refreshed by `worker` |

`commitments` ↔ `trips` is the one cross-module transaction in the system, and it exists for a
single reason: accepting a commitment consumes trip capacity, and the two must not diverge.
It is implemented as a domain service in `commitments` calling a `TripCapacityPort` exposed by
`trips`, both inside the caller's transaction.

### 4.3 Interaction

| Module | Owns | Coupling |
|---|---|---|
| `messaging` | `conversations`, `conversation_participants`, `messages`, `message_actions` | attaches to one context object (AD-027); action cards call `commitments` |
| `reviews` | `reviews`, `review_replies` | requires a `done` commitment or a recorded consumer transaction |
| `disputes` | `disputes`, `dispute_evidence`, `dispute_decisions` | freezes a `commitment`; bundles `messaging` + `commitment_terms` as evidence |
| `saved` | `saved_items` | polymorphic over listing / profile / trip; emits watch events |
| `notifications` | `notifications`, `notification_deliveries`, `push_subscriptions` | consumes outbox events from every module |

### 4.4 Supporting

| Module | Owns | Notes |
|---|---|---|
| `search` | `search_documents`, Arabic normalization function | independent; rebuilt from source tables, never authoritative |
| `compliance` | `compliance_items`, verdicts, citations | public, no account; reads `regulatory` |
| `media` | `media_objects`, upload sessions, signed-URL issuance | the only module that talks to MinIO |
| `billing` | **separate `billing` schema**: `plans`, `subscriptions`, `billing_receipts`, `payment_attempts` | **no foreign key to any commercial entity** (AD-018) |
| `admin` | `admin_users`, `admin_queues`, `admin_decisions`, `decision_reasons` | reusable queue → evidence → decision primitives |

### 4.5 Coupling map

```
identity ──▶ profiles ──▶ verification ──▶ media
                │              │
                │              └──▶ audit ◀── admin ◀── all queues
                │
                ├──▶ marketplace ═══FK═══▶ trader_profiles          (AD-017)
                ├──▶ trips ◀──tx──▶ commitments ──▶ messaging
                │       ▲                │    │
                │       │                │    └──▶ reviews
                ├──▶ sourcing ───────────┘    └──▶ disputes
                │       │
                │       └──▶ demand (projection)
                │
                └──▶ saved ──▶ notifications ◀── outbox from all

regulatory ──▶ trips · compliance · commitments (as_of resolution)
billing ── (deliberately unconnected) ──
search  ── (derived, rebuildable) ──
```

---

## 5. Request lifecycle

Every authenticated mutation passes the same eight steps. Nothing bypasses them.

1. **Correlation.** `x-request-id` accepted or generated; bound to the async context and written
   into every log line and audit row.
2. **Rate limit.** Per-IP and per-identity, by route class. Counters in Postgres (AD-009).
3. **CSRF.** Double-submit token plus `Origin` / `Sec-Fetch-Site` check on unsafe methods.
4. **Session resolve.** Opaque cookie → `sessions` row → `users` row → live capability and
   verification snapshot. **Read fresh on every request** — this is the whole reason for AD-010.
5. **Policy guard.** The five ordered gates (AD-015). Denial reasons are distinct error codes so
   the client can render the right state (`CAPABILITY_REQUIRED` vs `VERIFICATION_REQUIRED` vs
   `FORBIDDEN`) — the design draws different screens for these.
6. **Validation.** zod schema per endpoint; the same schema is imported by the web tier, so a
   form and its endpoint cannot disagree.
7. **Domain transaction.** Repository work, invariant checks, state transition, audit row and
   outbox rows — one commit.
8. **Response mapping.** Role-aware serializer (AD-021), consistent error envelope, no internals.

---

## 6. Data flows worth drawing out

### 6.1 Accepting a commitment (the concurrency-critical path)

```
POST /commitments/:id/accept        idempotency-key required
   │
   ├─ policy: authenticated · capability(trader|importer) · L2 · party to commitment
   │           · commitment.state == 'proposed' · not expired
   │
   └─ BEGIN
        SELECT * FROM trips WHERE id = ? FOR UPDATE          ← serialises capacity
        SELECT coalesce(sum(...)) FROM trip_capacity_ledger WHERE trip_id = ?
        assert consumed + requested <= cap  (value · weight · volume, all three)
        INSERT trip_capacity_ledger (commitment_id, value_centimes, grams, cm3)
        UPDATE commitments SET state='accepted'
        INSERT commitment_transitions (from, to, actor, reason, at)
        INSERT audit_log (…, prev_hash, hash)
        INSERT outbox (commitment.accepted)
      COMMIT
   │
   └─ worker: notify counterparty · refresh demand aggregates · reindex trip
```

The value axis is checked even though it is never shown to the counterparty (AD-021): it is a
**legal** cap, and exceeding it is the importer's regulatory exposure, not a UX detail.

### 6.2 Approving a verification document (the capability path)

```
POST /admin/verification/:caseId/decide
   │
   └─ BEGIN
        INSERT admin_decisions (action, reason_code, reason_text, supersedes_id?)
        UPDATE verification_documents SET status='approved', valid_until=?
        recompute derived level for the profile
        UPDATE trader_profiles SET rc_verified=true       ← flips listing_eligible
        INSERT audit_log …
        INSERT outbox (verification.approved)
      COMMIT
```

`trader_profiles.listing_eligible` is a generated column; flipping `rc_verified` is what makes
`product_listings` insertable at all. The legal invariant changes state here and nowhere else.

### 6.3 Licence expiry (the freeze path)

Daily job, derived from `Verification`'s `expired` state and its `FROZEN` capability table:

```
for each verification_document where valid_until < today and status='approved':
    status := 'expired'
    recompute derived level
    → publish trip:        DENIED
    → receive new requests: DENIED
    → complete in-flight commitments: ALLOWED      ← explicitly designed
    notify user 34/14/7/1 days before, and on the day
```

The asymmetry is designed, not incidental: freezing forward-looking capability while permitting
completion of existing obligations is what keeps an expiry from stranding a counterparty.

---

## 7. Environments

| | local | development | staging | production |
|---|---|---|---|---|
| Web / API / Worker | docker compose | shared VPS | mirrors prod, 1 node | 2 app nodes |
| Postgres | container, seeded | container | managed or VM, daily backup | primary + streaming replica, PITR |
| Object storage | MinIO container | MinIO | MinIO, separate buckets | MinIO in Algeria, replicated |
| SMS | console stub | console stub | real gateway, allowlisted numbers | real gateway |
| Payments | stub | stub | SATIM sandbox | SATIM production |
| Data | synthetic fixtures | synthetic | **synthetic only — never production KYC** | real |
| Feature flags | all on incl. deposit (for tests) | as staging | **deposit OFF** | **deposit OFF** (AD-019) |

Staging never receives a copy of production KYC documents or phone numbers. A masked-restore
script is part of Phase 0 — see `DEPLOYMENT-ARCHITECTURE.md` §7.

---

## 8. What is deliberately *not* in this architecture

| Not built | Why |
|---|---|
| Payment processing for goods, escrow, wallets, currency exchange | `README.md` and `Landing.limits`: "No currency exchange · No payments or escrow · No buying by proxy · No customs declaration · No transaction guarantee · No government approval" |
| Shipping, tracking integrations, customs declaration filing | Pre-declaration happens on `anae.dz`; Maabar reminds and never files (settled decision 9) |
| A composite trust score, star ratings, ranking by opaque quality | AD-020 |
| Microservices, service mesh, event bus, CQRS read models beyond `demand_aggregates` and `search_documents` | Disproportionate; §3 |
| Elasticsearch, Redis, Kafka at MVP | AD-033, AD-009, AD-007 |
| A generic `Order` entity | AD-025 |
| Multi-tenancy | Single market, single tenant. No tenant column anywhere |
