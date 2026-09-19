# Maabar — Technical Architecture Executive Summary

**Phase:** pre-build architecture blueprint · no application code written
**Date:** 14 September 2026
**Full documentation:** 19 documents in `docs/architecture/` (6,400+ lines)

---

## Context for a reader outside the project

**Maabar (مَعْبَر)** is a commercial network for Algeria's legalised micro-import trade
(تجارة الكابة / تجارة الشنطة).

Algeria legalised micro-importing in June 2025 through **Executive Decree 25-170**. Thousands now
hold a licence to import goods personally, on their own trips abroad, with their own foreign
currency — capped at **1,800,000 DZD per trip, 2 trips per month**. The problem: they fly to
Istanbul or Dubai carrying their savings in hard currency and **buy on a guess**. Guess wrong and
their capital freezes in unsold stock, and the monthly cap means they cannot recycle it.

Maabar connects the **micro-importer**, the **trader**, and the **consumer** through discovery,
verified demand, trust, and structured records.

**Maabar is NOT** a seller, buyer, customs broker, shipping company, currency exchange, escrow
service, goods-payment processor, government authority, or commission-taking marketplace operator.
From the product's own public statement: *no currency exchange · no payments or escrow · no buying
by proxy · no customs declaration · no transaction guarantee · no government approval*. The
activity is personal and non-transferable (Decree 25-170, arts. 3 and 12). Import pre-declaration
happens exclusively on `anae.dz`.

The design phase is complete: **24 approved screens**, one design-token layer, Arabic-first RTL
throughout, every P0 user journey drawn end to end. This document summarises the technical
architecture derived from that design.

---

# A. Repository reality

Greenfield. Every file was inspected before anything was proposed.

**Zero** application code, package manifests, config, `.env`, Dockerfiles, database schema or
migrations.

What exists:

| File | Content |
|---|---|
| `DESIGN-AUDIT.md` | 16.5 KB — the operative pre-build design audit |
| `README.md` | Product boundaries and ten settled decisions |
| `designs/` | 24 `.dc.html` artboards + `tokens.css` (11.7 KB) + `support.js` |
| `preview/server.js` | 3.5 KB static preview server |
| Git | 2 commits |

Three files the architecture brief named as sources **do not exist**: `FINAL-DESIGN-AUDIT.md`,
`REMEDIATION-MAP.md`, `spec/`. `DESIGN-AUDIT.md` covers the same ground and therefore sits at the
top of the source-of-truth hierarchy.

Two findings worth stating:

- **`designs/support.js` is not Maabar code.** It is the generated Claude Design canvas runtime
  (`// GENERATED from dc-runtime/src/*.ts`), a `<x-dc>` template parser. It carries no domain
  logic and must not enter the application.
- **The real specification lives in the artboards' script blocks.** Each artboard contains a
  `class Component extends DCLogic` whose constant tables — `FLOW`, `SWITCH`, `CAPS`, `SHEETS`,
  `PARAMS`, the two verification ladders — are far more precise than the rendered screens. The
  blueprint is derived from those tables, not from screenshots.

---

# B. Recommended stack

| Layer | Choice | Why this, and not the obvious alternative |
|---|---|---|
| Backend | **NestJS modular monolith** | The module/guard model maps directly onto bounded contexts. The three hardest requirements — capacity concurrency, audit atomicity, and the legal foreign key — all get *harder* if split across services |
| Web | **Next.js App Router** | `Marketplace`, `Product Detail`, `Seller Profile` and `Compliance Checker` are public, no-account surfaces. A marketplace search engines cannot index is crippled, and Algerian mobile networks punish large client bundles |
| Database | **PostgreSQL 16** | The only engine giving CHECK / EXCLUDE / composite-FK for the legal invariants **and** Arabic full-text search **and** row locks **and** `bigint` money in one place |
| ORM | **Drizzle + hand-written SQL migrations** | The invariants live in constraints, partial indexes and composite foreign keys. Prisma fights raw DDL; Drizzle stays close to SQL |
| Auth | **Opaque server-side sessions, NOT JWT** | Capability and verification state gate the legal invariants, and a JWT carries a stale copy of exactly those facts. An expired import licence must freeze trip publication on the *next request*, not when a token happens to expire. Per-device revocation is also a stated requirement |
| Identity | **Phone + 6-digit OTP, passwordless** | It is what the approved `Onboarding` flow draws. No password store at all, which removes credential stuffing and reset-link phishing entirely |
| Search | **Postgres FTS + `pg_trgm`, no Elasticsearch** | The corpus is roughly 1,200 listings and tens of profiles. A search cluster would be the largest operational burden in the system, serving a table that fits in memory |
| Jobs | **pg-boss** (Postgres-backed), no Redis/RabbitMQ/Kafka | Jobs enqueue in the same transaction as the state change that caused them, which eliminates the "committed but never notified" class of bug |
| Object storage | **Self-hosted MinIO inside Algeria** | The design position is that KYC documents are stored in Algeria. S3 / R2 / Spaces fail residency before the open legal question is even answered |
| CSS | **`tokens.css` + CSS Modules, no Tailwind** | The approved deck has zero physical `left`/`right` across 24 screens. Tailwind's physical-direction utilities would fight the RTL discipline |
| Cache | **No Redis at MVP** | Sessions and rate-limit counters live in Postgres. One fewer stateful service to run and back up; interfaces are written so the store is swappable |

**Three processes:** `web`, `api`, `worker`. `api` and `worker` share one image with different
entrypoints, so domain code is shared and a background job can call a domain service directly.

---

# C. Architecture

```
CDN (public product imagery only — contains no personal data)
 │
 ├─ WEB TIER — Next.js App Router
 │    THIN BFF: no domain rule, no authorization decision, no regulatory value
 │    (public) SSR / ISR  ·  (app) CSR shell  ·  (admin) desktop-only route group
 │    service worker: shell cache · resumable upload · Web Push
 │
 ├─ API TIER — NestJS modular monolith
 │    edge:  correlation-id · rate limit · CSRF · session resolve
 │           · POLICY GUARD (5 ordered gates) · zod validation · error mapper
 │
 │    19 modules mapped to bounded contexts:
 │      identity  profiles  verification  marketplace  demand  trips
 │      sourcing  commitments  messaging  reviews  disputes  saved
 │      notifications  compliance  regulatory  billing  admin  audit  search
 │
 │    platform kernel:
 │      policy · audit writer (hash chain) · transactional outbox
 │      · reference-id generator · money value objects · i18n catalogue
 │      · regulatory resolver · clock
 │
 ├─ PostgreSQL 16 ── schemas: app │ billing │ audit │ search
 │                   + pg-boss queue + sessions
 │
 ├─ MinIO (in Algeria) ── kyc-private │ disputes-private │ receipts-private
 │                        │ media-public │ quarantine
 │
 └─ worker (same image) ── otp · notify · image variants · search index
                           · demand aggregates · expiry sweep · audit hash verify

External: SMS gateway (OTP only) · SATIM/CIB (subscriptions only) · Web Push (VAPID)
```

**Why a modular monolith and not microservices:**

1. **Trip capacity concurrency** — inside one database this is `SELECT … FOR UPDATE` on the trip
   row. Across services it is a distributed lock or a saga with compensations, for a system that
   will see single-digit concurrent writes per trip.
2. **Audit atomicity** — an admin decision, its consequence, its notification and its audit row
   must commit together. Two services introduce the "decided but never audited" failure mode,
   which is exactly what the audit requirement exists to prevent.
3. **The legal invariant** — a composite foreign key can only protect rows in the same database as
   the table it references. Splitting listings from trader profiles would demote the strongest
   guarantee in the system to an eventually-consistent check.

Module boundaries are still enforced by lint: a module may import another module's **service
interface and DTOs**, never its repositories or tables. Extraction stays possible.

---

# D. Core domain model

Roughly **48 tables** across four schemas. Every one traces to a designed screen or a stated
invariant.

```
User 1─* Capability        (roles are capabilities on ONE identity — never a `role` column)
User 1─1 {Consumer|Trader|Importer}Profile
User 1─* Session 1─1 ActiveContext      (context selects navigation, NEVER authorization)
User 1─* VerificationCase 1─* VerificationDocument   → derived level L0 · L1 · L2-I/L2-T · L3

TraderProfile ═══FK(user_id, listing_eligible)═══ ProductListing   ← the legal thesis, in SQL
                                                  ProductListing *─1 Product *─1 Category

ImporterProfile 1─* Trip 1─1 Capacity{ value* , weight , volume }
                     Trip 1─* TripCapacityLedger *─1 Commitment

TraderProfile 1─* SourcingRequest 1─* SourcingOffer *─1 ImporterProfile
                  SourcingRequest 1─0..1 Commitment ─0..1 SourcingOffer

Commitment 1─* CommitmentTerms (versioned, immutable once accepted)
           1─* CommitmentTransition (append-only)
           1─* HandoverConfirmation  (exactly 2 required to reach `done`)
           1─0..1 DepositDeclaration        [FEATURE-FLAGGED OFF — legal hold]
           1─0..1 Dispute 1─* DisputeEvidence
           1─* Review 1─0..1 ReviewReply

SourcingRequest ──projection──▶ DemandAggregate   (anonymous, k-anonymity thresholded)
User 1─* SavedItem ──watch──▶ Notification
User 1─* ReputationFact       (each stores its own raw inputs)

AdminUser 1─* AdminDecision ──▶ AuditLog (append-only, hash-chained, partitioned)
RegulatoryRule 1─* RegulatoryRuleVersion ◀── Trip · Commitment · Compliance (stamped)

billing.Subscription ──user_id, NO FOREIGN KEY──╴ (deliberately unjoinable to commercial data)

* the trip VALUE axis is owner-private and absent from every counterparty payload
```

### Five commercial entities stay distinct — there is no generic `Order`

| | Actor | Audience | Price shape | Legal meaning |
|---|---|---|---|---|
| `ProductListing` | Trader (L2-T) | Public consumers | One shop price | An offer to the public — **requires commercial register** |
| `SourcingRequest` | Trader (L2-T) | Verified importers | Target band | A B2B request for supply |
| `SourcingOffer` | Importer (L2-I) | The requesting trader | Proposed price + covered qty | A response, may be partial |
| `Trip` | Importer (L2-I) | Verified traders | **No price**; three capacities | The importer's own regulated journey |
| `Commitment` | Both | The two parties only | Agreed band + validity | A documented mutual agreement, **not a sale** |

Collapsing them would put a public consumer price, a B2B band, a regulated capacity and a
two-party agreement in one row — and would force the trip value cap, a legal limit on one person's
own money, into an entity visible to counterparties.

### Commitment states — a discrepancy resolved in the design's favour

The architecture brief offered an illustrative list
(`Interested / Requested / Committed / In Progress / Completed`). It does **not** match the
approved design. `Commitment.dc.html` defines:

```
proposed · accepted · secured · buying · transit · handover · done
         + disputed · cancelled · expired
```

`secured` **is** the deposit declaration, and the artboard already models it as optional — its own
copy reads *"the next step is to agree a deposit if you both want"*, with `dep:false` on
`accepted`. That is precisely why the legal hold is a feature flag rather than a rewrite: with the
flag off, `secured` is unreachable, `accepted → buying` is valid, and the UI renders six stages
instead of seven.

---

# E. Critical invariants

Rules that must never be violated. Each is enforced server-side, and most at the database level.

1. **A micro-importer can never publish a consumer-facing listing.** Enforced by a composite
   foreign key to `trader_profiles(user_id, listing_eligible)`, where `listing_eligible` is a
   generated column requiring a verified commercial register. The illegal row is
   **unrepresentable**, not merely rejected by a service.
2. **Revoking listing eligibility while listings exist raises `23503`**, forcing explicit, audited
   archival first. The loud failure is the feature, not an obstacle.
3. **No goods money anywhere.** `billing` is a separate schema with **no foreign key** into
   commercial data. A trade-settlement report cannot be written by accident.
4. **Trip value capacity is owner-only.** Not null, not zeroed — *absent* from counterparty
   payloads. It discloses how much cash a named person is carrying abroad on a known date. This is
   physical safety, not privacy preference.
5. **All three capacity axes** (value, weight, volume) are checked under `SELECT … FOR UPDATE` on
   the trip row, summed from a ledger. Fixed lock order: `trips → commitments`.
6. **`done` requires two handover confirmations.** Completion is never unilateral.
7. **No composite trust score and no star rating.** Four countable facts, each storing its own raw
   inputs so the "how was this calculated" sheet is a read, not a recomputation.
8. **Documented customs holds do not count against the importer**, and response time is a
   **median**, not a mean. Both are explicit in the approved design.
9. **Reviews are never deleted.** No `DELETE` grant exists for the application role. Removal is an
   audited moderation decision leaving a visible tombstone, plus exactly one right of reply.
10. **Admin corrections are new decisions superseding the old, never edits.** No `UPDATE` or
    `DELETE` grant.
11. **The audit log is append-only and hash-chained**, with no `UPDATE`/`DELETE`/`TRUNCATE` grant
    and a nightly chain verifier.
12. **Every regulatory read is time-anchored.** The resolver's only method is `get(key, asOf)` —
    there is no `get(key)`, so the mistake cannot be written. Trips and commitments stamp the
    `rule_version_id` they were created under.
13. **A regulatory rule approver can never be its drafter** — a database CHECK — and an exclusion
    constraint guarantees exactly one version in force per rule at any date.
14. **Money is `bigint` centimes**, weight integer grams, volume integer cubic centimetres. No
    floating point anywhere.
15. **Numbers are LTR-isolated at the formatter** (`U+2066…U+2069`), never by callers. A lint rule
    forbids `toLocaleString` outside the shared `format` package.
16. **Arabic is never letter-spaced** (it breaks joining) **and never uppercased**. Plurals use
    four-form counted nouns (one / two / few 3–10 / many 11+).
17. **Authorization gate 4 returns 404, not 403**, so "exists but forbidden" cannot be used as an
    enumeration oracle.
18. **The active context switcher (`import` / `buy`) never widens authorization.** Asserted by
    test — it is the most plausible accidental privilege escalation in this product.
19. **KYC document binaries have no owner-facing endpoint at all.** Admin access mints a
    120-second signed URL and **writes the audit row before the URL exists**.
20. **`features.deposit_declaration = false`** in staging and production until an Algerian lawyer
    rules on it — enforced by a CI check *and* a production startup assertion, not by memory.

---

# F. Major risks

| Risk | Why it is top-tier | Mitigation |
|---|---|---|
| **KYC breach** | National IDs, ANAE self-entrepreneur cards, commercial registers, CASNOS affiliations. Irreversible harm to real people | Algerian residency, random object keys, no owner endpoint, audit-before-signed-URL, server-side re-encode stripping EXIF/GPS, PDF rasterisation, malware scan, no SVG accepted anywhere |
| **SIM-swap account takeover** | Phone-only identity means whoever ports the number owns the account | 24-hour cooldown on high-impact actions from an unrecognised device, dual-number OTP on phone change, device-continuity signals into the risk queue, manual audited recovery with no self-service bypass |
| **Trip value capacity leak** | Tells a stranger how much cash a named person carries to Istanbul on a known date | Two separate serializers plus a contract test asserting the field is absent; excluded from search index, logs and analytics exports |
| **Trip capacity race** | Exceeding a *legal* cap is a real person's regulatory exposure, not a UX bug | Row lock + ledger sum inside the lock + fixed lock ordering + mandatory idempotency keys |
| **Reputation gaming** | Self-dealing between controlled accounts would make the product's core claim false | Reviews require a `done` commitment, dual handover confirmation, same-device and same-IP clustering into the risk queue, velocity checks on new-account pairs |
| **Deposit feature shipped early** | Live legal exposure while the purchase-mandate question is open | Flag defaults false + CI check + production startup refusal without a recorded legal sign-off reference |
| **SMS cost attack (OTP pumping)** | Plausibly the largest and least predictable cost line; a financial incident as much as a security one | Layered per-phone / per-IP / per-day limits, hashed codes, uniform responses, gateway spend alerting |
| **Audit tampering** | Destroys accountability | Append-only grants + per-stream hash chain + nightly verifier. **Stated limitation:** a database superuser can rewrite history and recompute the chain; full immutability additionally requires off-box log shipping. An audit trail believed tamper-proof when it is only tamper-evident is worse than one whose limits are known |

---

# G. Blocking decisions

Four questions. **None blocks Phases 0–3** (roughly the first nine weeks). Three of the four are
missing **data sources**, not missing design — each has a concrete recommendation that changes no
screen and no architecture.

| # | Question | Blocks | Recommendation |
|---|---|---|---|
| **Q3** | **Where do the Demand Board's unit cost, weight and volume estimates come from?** The buy list multiplies them by quantity to drive all three capacity axes and the "does not fit" blocked state. Nothing in the approved model produces them | Phase 4 (~wk 10) | Category-level planning estimates: median of corroborated final prices once Q1 lands, otherwise **admin-curated defaults — which unblock Phase 4 immediately**. Weight and volume are always curated. Labelled with their basis so an estimate never renders with the weight of a recorded fact |
| **Q4** | **Can a micro-importer publish a sourcing request?** `Verification` importer L2 lists `unlocks: ['ملف عام', 'نشر طلب توريد']`; `DESIGN-AUDIT.md` §5 says "only when acting as trader". Two approved sources disagree, and it touches an open Law 18-05 question | Phase 5 (~wk 13) | Implement the audit's **stricter** reading (`trader` + L2-T) until product and counsel answer — the stricter reading cannot create an exposure the looser one would |
| **Q1** | **Where does a *final price* come from?** `Records` draws a ledger with exact amounts, and `Importer Profile` publishes `ثبات السعر 95%`, defined as commitments whose **final price** stayed inside the declared band. But a commitment records a **band**, never a settled price, because Maabar is not party to the sale. No field in the model can produce either figure | Phase 8 (~wk 20) | Capture it as a **declared fact from both parties at handover** — one optional field on a card both parties already touch — counting only corroborated figures, with the exclusion visible in the metric's stored breakdown. The ledger becomes the importer's own pre-filled notebook. **Alternative if declined: drop the metric. Never infer it from a band** |
| **Q2** | **What does the compliance checker answer for goods it does not know?** The artboard draws exactly one verdict and no unknown state — on a public, free-text, legal surface where guessing is the worst possible failure | Phase 9 (~wk 22) | One neutral "we have no verdict for these goods" state built from existing components, with the standing customs disclaimer and the quick chips as a route out. Unmatched queries feed the existing category-review admin queue. **Never fall back to "allowed"** |

### Legal questions — unchanged, and deliberately not guessed at

All five are already isolated behind configuration, so a lawyer's ruling changes config, not
architecture:

| | Question | Architectural treatment |
|---|---|---|
| §9.2 | Is a recorded, never-held deposit a prohibited **purchase mandate** under art. 3, or a legitimate advance? | Feature flag off; `secured` is a skippable stage; tables carry no custody, settlement or refund column. A "no" is a config change plus a deletion job; a "yes" is a flag flip |
| §9.1 | Does an importer appearing in Discover with indicative price bands constitute electronic-supplier activity under Law 18-05? | Visibility flag defaulting to verified traders only |
| §9.3 | Technical or commercial intermediary? | Positioned as technical: no fees, no payment handling, no guarantees. A restrictive answer adds disclosures — copy, not structure |
| §9.4 | KYC retention period; is prior ANPDP authorisation required? | Retention is configuration, **intentionally unset**, so the deletion job refuses to run and logs why |
| §9.5 | Can platform-computed reliability figures be published under Law 18-07 / 25-11? | No composite score exists; only countable facts, each decomposable into stored inputs |

---

# H. Development phases

Ordering is driven by **dependency and risk**, not by the screen inventory.

| Phase | Weeks | Cum. | Delivers |
|---|---|---|---|
| **0 Foundation** | 2 | 2 | Platform kernel, audit hash chain, policy guard skeleton, transactional outbox, CI/CD, database roles and **grant revocations** |
| **1 Identity** | 2 | 4 | OTP auth, sessions, capabilities, **authorization matrix at 100% route coverage** |
| **2 Verification + admin** | 3 | 7 | Trust ladders for both roles, **`listing_eligible`**, the reusable queue → evidence → decision → reason → consequence → audit primitive |
| **3 Marketplace** | 2.5 | 9.5 | Public surface, search, **legal invariant enforced and tested** |
| **4 Trips + demand** | 3 | 12.5 | Three-axis capacity, regulatory caps, demand aggregation |
| **5 Sourcing** | 2 | 14.5 | B2B matching, offers, first reputation facts |
| **6 Commitments** | 3 | 17.5 | **The keystone — do not parallelise this phase with anything** |
| **7 Messaging** | 2 | 19.5 | Threads, structured action cards, handover |
| **8 Trust** | 2.5 | 22 | Reviews, reputation with stored breakdowns, disputes |
| **9 Compliance** | 1.5 | 23.5 | Public checker in 3 languages, full rule lifecycle |
| **10 Billing** | 1.5 | 25 | Subscriptions (CCP receipt + SATIM card), ledger, Art. 14 labels |
| **11 Notifications + PWA** | 1.5 | 26.5 | Outbox delivery, Web Push, installability, offline states |
| **12 Hardening** | 3 | **29.5** | Penetration test, i18n content, real photography, legal answers applied |

Roughly **seven months** with 3–4 engineers (2 backend, 1–2 frontend) plus part-time design and
product.

**Two ordering decisions worth defending:**

- **Verification is Phase 2, before the marketplace**, because `trader_profiles.listing_eligible`
  is half of the composite foreign key. Building listings first would mean building the legal
  invariant twice.
- **Commitments (Phase 6) should not be parallelised**, because it is where capacity, audit,
  idempotency, the state machine and the legal hold all meet.

Phases 3–5 can partially parallelise across backend and frontend once Phase 2 lands.

### MVP · V1 · Future

**MVP:** all 24 screens, both verification ladders, three-axis capacity with the regulatory cap,
the commitment machine without `secured`, messaging with action cards, reviews and disputes, the
public compliance checker in three languages, the regulatory engine, subscriptions with both
payment paths, notifications with Web Push, the admin console.

**Deliberately out of MVP:** deposit declaration (legal hold) · group / pooled sourcing · reference
price index · email channel · SMS product notifications · desktop layouts beyond admin · analytics
screens · separate requests and commitments list screens · consumer profile screen · French and
English beyond the launch-critical set.

Each exclusion is either a design gap the audit itself names, or a legal hold. None is a shortcut.

---

# I. Final verdict

```
ARCHITECTURE STATUS:

READY FOR IMPLEMENTATION
```

Every gate condition is met:

| Condition | Status |
|---|---|
| Domain boundaries coherent | ✅ 19 modules, one deliberate cross-module transaction, coupling map published |
| Database model coherent | ✅ ~48 tables, constraints carrying the invariants, concurrency specified |
| API boundaries coherent | ✅ 24 endpoint groups mapped to modules, one error contract |
| Authorization explicit | ✅ Five ordered gates, full matrix, generated 100%-coverage test |
| State machines explicit | ✅ Commitment in full plus nine supporting machines, invalid transitions named |
| Legal invariants enforceable | ✅ Composite FK plus five further layers; deposit hold is a flag with CI enforcement |
| KYC security defined | ✅ Residency, signed URLs, audit-before-issue, no owner endpoint, sanitisation pipeline |
| Regulatory configuration defined | ✅ Versioned, time-anchored, dual-approved, impact-previewed, stamped on records |
| Frontend/backend responsibilities clear | ✅ Thin BFF; no rule or authorization decision in the web tier |
| Every approved screen has an implementation path | ✅ 24/24 mapped; three need a **data-source decision**, not a design change |
| Critical concurrency addressed | ✅ Capacity, dual review, dual confirmation, duplicate transition, double-charge |
| Deployment architecture defined | ✅ Topology, environments, migrations, backup/restore with RPO and RTO |
| Testing covers the critical invariants | ✅ Seven non-overridable suites plus a generated authorization matrix |
| Design → implementation gaps audited | ✅ 17 gaps documented: 3 P0, 5 P1, 5 P2, 4 P3, each with a recommendation |
| Remaining questions genuinely non-blocking | ⚠️ Four questions, each gating one later phase (4, 5, 8, 9). None blocks Phases 0–3 |

Ready because the four open questions are **decisions, not design work**. Each has a recommended
resolution that changes no screen, no entity and no boundary, and none touches the first nine
weeks of implementation.

**This verdict would flip to NOT READY** if Q1 were answered by inferring a final price from a
band, or Q2 by defaulting an unknown compliance query to "allowed". Both would publish a figure or
a verdict the system cannot stand behind — the one thing this product cannot survive.

**Two things must remain true throughout implementation**, or the verdict lapses:

1. `features.deposit_declaration` stays `false` in staging and production until an Algerian lawyer
   rules on the purchase-mandate question — enforced by the CI check and the startup assertion,
   not by memory.
2. The composite foreign key on `product_listings` is never weakened, dropped or worked around. It
   is the product's legal thesis expressed as a constraint, and it is the one thing in this
   architecture that no application bug can defeat.

---

## Appendix — the full document set

| Document | Contents |
|---|---|
| `TECHNICAL-BLUEPRINT.md` | Master source of truth, 37 sections + architecture gate |
| `SYSTEM-ARCHITECTURE.md` | Repository assessment, topology, bounded contexts, data flows, environments |
| `DOMAIN-MODEL.md` | Every entity with purpose, lifecycle, invariants; entities deliberately not created |
| `DATABASE-DESIGN.md` | DDL for load-bearing tables, the legal invariant in SQL, concurrency model, indexes, grants |
| `API-CONTRACT.md` | 24 endpoint groups, error model, idempotency, rate limits |
| `AUTHORIZATION-MATRIX.md` | Five gates, capability matrix, visibility rules, IDOR/BOLA prevention |
| `STATE-MACHINES.md` | Commitment transition matrix + nine supporting machines |
| `SECURITY-ARCHITECTURE.md` | Auth, KYC security, 22-threat model, incident response, pre-launch gate |
| `I18N-ARCHITECTURE.md` | RTL discipline, bidi isolation, Arabic pluralization, catalogue structure |
| `FILE-STORAGE.md` | Four object classes, buckets, upload pipeline, retention |
| `NOTIFICATIONS.md` | Channels, catalogue, outbox delivery, the attention read model |
| `ADMIN-ARCHITECTURE.md` | The one reusable queue → decision → audit primitive |
| `REGULATORY-ENGINE.md` | Versioned rules, time-anchored resolution, publication lifecycle |
| `TESTING-STRATEGY.md` | 13 layers, seven non-overridable critical-invariant suites |
| `DEPLOYMENT-ARCHITECTURE.md` | Hosting, environments, CI/CD, migrations, backup and recovery |
| `IMPLEMENTATION-ROADMAP.md` | 13 phases with dependencies and acceptance criteria |
| `ARCHITECTURE-DECISIONS.md` | 48 decisions with reason, alternatives, consequence, status |
| `SCREEN-API-MATRIX.md` | All 24 screens → actor → domain → data → API → mutations → states |
| `DESIGN-IMPLEMENTATION-GAPS.md` | 17 gaps with technical issue, impact, recommendation, priority |
