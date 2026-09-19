# Maabar — Technical Blueprint

**Phase:** pre-build · architecture only, no application code written
**Date:** 14 September 2026
**Source of truth:** `DESIGN-AUDIT.md`, `README.md`, the 24 approved artboards, `designs/tokens.css`
**Companion documents:** `docs/architecture/*` — in particular `DESIGN-IMPLEMENTATION-GAPS.md`,
which records every place the design assumes data or a capability the architecture must supply

---

## 1. Executive summary

Maabar is a discovery, matching, communication, record-keeping and trust layer for Algeria's
legalised micro-import trade. It connects micro-importers, traders, consumers and administrators.
It is **not** a seller, buyer, escrow, payment processor, customs broker, shipper, currency
exchange or commission-taking marketplace operator.

The approved design is complete: 24 screens, one token layer, Arabic-first RTL throughout, every
P0 journey drawn end to end, with one module held pending Algerian legal review.

**Recommended architecture:** a **modular monolith** — NestJS API, Next.js web tier, PostgreSQL 16,
self-hosted MinIO inside Algeria, a Postgres-backed job queue. Nineteen modules mapped to bounded
contexts. Opaque server-side sessions rather than JWT, because capability and verification state
must be revocable instantly. Money as `bigint` centimes. Regulatory values as versioned rows with
effective dates. The legal invariant — *a micro-importer may never publish a consumer-facing
listing* — enforced by a composite foreign key that makes the illegal row **unrepresentable**,
not merely rejected.

**Verdict: READY FOR IMPLEMENTATION.** Four questions must be answered before specific later
phases (§36.1); none of them blocks Phases 0–3, roughly the first nine weeks. Three are missing
**data sources** rather than missing design, each with a concrete recommendation that changes no
screen and no architecture. The §9.2 legal hold is already architected as a feature flag.

---

## 2. Existing repository assessment

Inspected in full before anything was proposed.

| Checked | Found |
|---|---|
| Application code, any language | **None** |
| Package manifests, build config, Dockerfiles, `.env` | **None** |
| Database schema, migrations | **None** |
| `DESIGN-AUDIT.md` | Present, 16.5 KB — the operative audit |
| `README.md` | Product boundaries, the ten settled decisions |
| `designs/` | 24 `.dc.html` artboards, `tokens.css`, `support.js` |
| `preview/server.js` | Static preview server that injects React into artboards |
| Git | 2 commits, latest `1d00688` |

Three files named in the brief **do not exist**: `FINAL-DESIGN-AUDIT.md`, `REMEDIATION-MAP.md`,
`spec/`. `DESIGN-AUDIT.md` therefore sits at the top of the hierarchy and covers the same ground;
nothing material is lost.

`designs/support.js` is the generated Claude Design canvas runtime, not Maabar code, and must not
enter the application. The domain specification lives in each artboard's `<script type="text/x-dc">`
block, whose constant tables (`FLOW`, `SWITCH`, `CAPS`, `SHEETS`, `PARAMS`, the verification
ladders) are the behavioural source this blueprint is derived from.

**Conclusion: a greenfield build.** No legacy constrains the architecture; the design constrains
it heavily, and correctly.

---

## 3. Approved product boundaries

Maabar **is** discovery, matching, communication, record-keeping and trust.

Maabar **is not**, and no table, endpoint or job may make it: a seller, a buyer, a customs broker,
a shipping company, a currency exchange, an escrow service, a goods-payment processor, a
government authority, or a commission-taking marketplace operator.

From `Landing.limits`, in all three languages: no currency exchange · no payments or escrow · no
buying by proxy · no customs declaration · no transaction guarantee · no government approval. The
activity is personal and non-transferable (Decree 25-170, arts. 3 and 12). Import pre-declaration
happens exclusively on `anae.dz`.

The ten settled decisions in `README.md` are treated as frozen and are not reopened anywhere in
this blueprint.

---

## 4. System architecture

Three processes — `web`, `api`, `worker` — over one PostgreSQL database and one object store.
Full diagram and request lifecycle: `SYSTEM-ARCHITECTURE.md`.

A modular monolith is chosen because the three hardest requirements all become *harder* when
split: trip-capacity concurrency (one row lock vs a distributed saga), audit atomicity (one commit
vs a "decided but never audited" failure mode), and the composite foreign key, which can only
protect rows in its own database. Module boundaries are enforced by lint — a module may import
another's service interface, never its repositories — so extraction stays possible.

**Stack:** TypeScript end to end; NestJS (API), Next.js App Router (web, SSR/ISR for the public
tier because the marketplace must be indexable and Algerian networks punish large bundles),
PostgreSQL 16, Drizzle with hand-written SQL migrations, pg-boss, MinIO, CSS Modules over
`tokens.css` with no utility framework. Rationale and alternatives for each: `ARCHITECTURE-DECISIONS.md` §A.

---

## 5. Domain architecture

Nineteen modules in four groups: core (identity, profiles, verification, regulatory, audit),
commercial (marketplace, trips, sourcing, commitments, demand), interaction (messaging, reviews,
disputes, saved, notifications), supporting (search, compliance, media, billing, admin).

One cross-module transaction exists, deliberately: `commitments` ↔ `trips`, because accepting a
commitment consumes trip capacity and the two must never diverge.

Five commercial entities stay distinct and never collapse into a generic `Order`: `ProductListing`,
`SourcingRequest`, `SourcingOffer`, `Trip`, `Commitment`. They differ in actor, audience, price
shape, lifecycle and legal meaning — a comparison table is in `DOMAIN-MODEL.md` §4. Collapsing
them would put a public consumer price, a B2B band, a regulated capacity and a two-party agreement
in one row, and would force the trip's value cap into an entity visible to counterparties.

Entities deliberately **not** created: `Order`, `Payment`/`Escrow`/`Wallet`, `TrustScore`, numeric
`Rating`, a `role` column, `Cart`/`Shipment`/`CustomsDeclaration`, and the two list screens the
audit itself declined to draw. Reasons: `DOMAIN-MODEL.md` §8.

---

## 6. Database architecture

PostgreSQL 16; schemas `app`, `billing`, `audit`, `search`; roughly 48 tables, every one traceable
to a designed screen or a stated invariant. Full DDL for the load-bearing parts:
`DATABASE-DESIGN.md`.

Decisions that matter most:

- **Money as `bigint` centimes**, weight as integer grams, volume as integer cm³. No float, ever.
- **Native enums for states** (they change only by migration); **lookup tables for reason codes,
  document types and categories** (an admin must extend them without a deploy).
- **Append-only where the record matters**: `audit_log`, `admin_decisions`, `reviews`,
  `commitment_transitions`, `regulatory_rule_versions` — enforced by revoked `DELETE`/`UPDATE`
  grants, not by convention.
- **Concurrency by row lock plus ledger**, not counters: capacity consumption is a sum over
  unreleased `trip_capacity_ledger` rows computed inside `SELECT … FOR UPDATE` on the trip. Fixed
  lock order `trips → commitments`. Every other named concurrency case has a named mechanism
  (`DATABASE-DESIGN.md` §5.2).

---

## 7. Authentication

**Passwordless: phone + 6-digit OTP**, exactly as `Onboarding` draws it. No password store, so no
credential stuffing and no reset-link phishing.

**Opaque server-side sessions in Postgres, not JWT.** This is the deliberate answer to the brief's
"do not choose JWT simply because it is familiar": capability and verification state gate the legal
invariants, and a JWT carries a stale copy of precisely those facts. An expired general
authorisation must freeze trip publication on the *next request*, not when a token happens to
expire. Session listing and per-device revocation are also stated requirements.

Cookie `__Host-mb_session`, `HttpOnly`, `Secure`, `SameSite=Lax`; CSRF by double-submit token plus
`Origin`/`Sec-Fetch-Site`. OTP hashed, 5-minute lifetime, 5 attempts, layered rate limits,
enumeration-safe responses.

**SIM-swap is the realistic account-takeover vector** for phone-only identity, and is addressed
explicitly: a 24-hour cooldown on high-impact actions from a new device, dual-number OTP on phone
change, device-continuity signals into the risk queue, step-up for any KYC change, and manual
audited recovery with no self-service bypass (`SECURITY-ARCHITECTURE.md` §2.1).

---

## 8. Authorization

Five ordered gates on every request: authenticated → capability held → verification level →
ownership/visibility → action precondition. Ordered, so the denial names the real reason and the
client renders the right designed screen — the deck draws different states for "you need a
capability" and "you need to verify".

Gate 4 returns **404, not 403**, to defeat enumeration. Resources are loaded *scoped* to the actor
— ownership is a `WHERE` clause, never a post-load check — which is the structural defence against
IDOR/BOLA. No endpoint accepts an owner identifier in its body.

**Roles are capabilities on one identity**, held simultaneously, with an *active context* the user
toggles. The context selects navigation only and **never widens authorization** — asserted by
test, because it is the most plausible accidental escalation in this product.

Full matrix, the brief's twelve policy questions answered, and visibility rules beyond ownership:
`AUTHORIZATION-MATRIX.md`.

---

## 9. KYC and document security

The KYC store is the highest-value asset in the system. Controls (`SECURITY-ARCHITECTURE.md` §5,
`FILE-STORAGE.md`):

Private buckets on self-hosted MinIO **in Algeria**; random object keys revealing nothing; SSE at
rest; **no owner-facing endpoint for the binary at all** — the design shows status and expiry only;
admin access restricted to `trust_safety`, via a 120-second signed URL, with **the audit row
written before the URL is minted**; magic-byte sniffing, malware scan, server-side re-encode
(stripping EXIF and GPS), PDF structural validation, quarantine bucket, no SVG anywhere;
`maabar_readonly` has no grant on documents, media or phone identities; retention is configuration
and the deletion job is written but **unscheduled** pending ANPDP.

---

## 10. Marketplace architecture

Public, server-rendered, indexable. `Product` (abstract) is separate from `ProductListing` (a
trader's commercial offer). Moderation is a real state, not a formality — `Listing Composer` draws
it.

**The legal invariant, in schema:**

```sql
trader_profiles.listing_eligible  -- GENERATED: identity ∧ rc ∧ nif ∧ address ∧ ¬suspended
  UNIQUE (user_id, listing_eligible)

product_listings.seller_listing_eligible boolean NOT NULL DEFAULT true CHECK (seller_listing_eligible)
  FOREIGN KEY (seller_user_id, seller_listing_eligible)
    REFERENCES trader_profiles (user_id, listing_eligible) ON UPDATE RESTRICT
```

A micro-importer has no `trader_profiles` row, so the listing row cannot exist. When a commercial
register lapses, the generated column recomputes and the update **fails while listings still
reference the old key** — forcing the verification service to archive them first, which produces an
audit trail and a user notification. Defence in depth adds five further layers above it
(`SECURITY-ARCHITECTURE.md` §4), but the database is the one no application bug can reach.

---

## 11. Trip and demand architecture

**Three capacity axes, never one number:**

| Axis | Origin | Visible to counterparty |
|---|---|---|
| Value (`bigint` centimes) | **Regulatory** `max_value_per_trip`, padlocked, shown with its effective date | **No** |
| Weight (grams) | User-defined ("حدودك أنت") | Yes |
| Volume (cm³) | User-defined | Yes |

The value axis is private because it discloses how much cash a named person is carrying abroad on
a known date — a physical-safety matter, not a privacy preference. The `Discover` artboard states
it directly. Enforced by two serializers with a contract test asserting the counterparty payload
contains no value field anywhere.

Overbooking prevention: row lock plus ledger sum, all three axes checked, including value — it is a
*legal* cap and exceeding it is the importer's regulatory exposure regardless of who can see it.

**Demand has two privacy levels, deliberately:** `Demand Board` shows anonymous aggregates
("built on 214 requests", counts, bands, wilayas) with a k-anonymity threshold; `Trip` shows named
confirmed buyers **only to the trip owner**.

---

## 12. Sourcing architecture

`compose → published → offers → agreement`, matching the artboard's four views. Offers may cover
**less** than the requested quantity (the design draws 80 of 120). Accepting is one transaction:
the offer accepted, siblings declined, request `committed`, a `Commitment` created in `proposed`,
an action card posted, notifications enqueued.

It is a request, not an order: no payment field, no settlement, no fulfilment status of its own —
fulfilment belongs to the commitment it produces.

---

## 13. Commitment state machine

**A discrepancy, resolved.** The brief's illustrative list (`Interested/Requested/Committed/
In Progress/Completed`) does not match the approved design. The design wins under the stated
hierarchy. Implemented vocabulary, from `Commitment.FLOW` and `.SWITCH`:

`proposed · accepted · secured · buying · transit · handover · done` + `disputed · cancelled · expired`

`secured` is the **deposit declaration and is optional** — the artboard's own copy says "the next
step is to agree a deposit *if you both want*", and marks `dep:false` on `accepted`. With
`features.deposit_declaration = false` the stage is unreachable, `accepted → buying` is a valid
transition, and the UI renders six stages. This is why the legal hold is a flag, not a rewrite.

Eighteen transitions with actor, preconditions and side effects; explicit invalid-transition list;
idempotency keys on every one; `done` requires **two** handover confirmations; a 6-digit handover
code whose direction of presentation is specified so the importer cannot self-confirm delivery
from home. Full matrix: `STATE-MACHINES.md` §1.

---

## 14. Messaging

One conversation per context object (listing, sourcing request, trip, commitment, dispute).
**Structured action cards are first-class message kinds** — `propose_agreement` and
`confirm_handover` — and accepting one mutates domain state **in the same transaction** as the
message insert. Messages are not editable; moderation redaction leaves a tombstone; conversations
lock at terminal states so a dispute's evidence bundle stays stable.

Realtime: **poll while a thread is focused, Web Push otherwise. No WebSocket server at MVP.** The
UX is a two-party negotiation, and polling survives Algerian mobile-network churn better than a
socket that dies silently. One endpoint serves both initial load and polling.

---

## 15. Reviews and trust

**No composite score anywhere**, and no numeric rating — a star average would be the forbidden
composite wearing a disguise. Published facts, each stored with its own inputs so the "how was
this calculated" sheet is a read rather than a recomputation:

| Metric | Definition (from the design) |
|---|---|
| `confirmed_transactions` | Both parties confirmed; never inflated by activity alone |
| `completion_rate` | Delivered within the agreed deadline ÷ accepted, **excluding documented customs holds** — "the decision is not theirs" |
| `median_response_time` | **Median**, explicitly not mean, of first response, last 90 days |
| `price_stability_rate` | Commitments whose final price stayed inside the band declared at agreement |

Reviews require a recorded transaction, are unique per author per source, are **never deleted** —
no `DELETE` grant exists — and carry exactly one right of reply, always shown alongside.

---

## 16. Disputes

Five issue kinds and three desired outcomes, matching the artboard. Opening auto-notifies the
counterparty and auto-bundles evidence **by reference**: the recorded terms version, the full
conversation, and timestamped handover photos. The commitment freezes; capacity stays held.

Designed effects that must be implemented literally: recorded on **both** parties' records;
reflected in the specification-match figure; **not counted against the opener's own completion
rate**; the agreed remedy recorded as a decision outcome.

---

## 17. Compliance

Public, no account. Disclosure order is fixed and is a settled decision: **verdict → reason →
what to do → (collapsed) legal basis → (collapsed) source and last-updated.** Never legal text
before the verdict. The customs disclaimer is part of the API payload, in all three locales, so no
client can ship without it. Verdicts carry a `rule_version_id` and age into an admin re-review
queue. The commercial accent colour is banned from this surface by the token system.

---

## 18. Regulatory configuration

A rule is a stable key; a version carries value, unit, effective window, source citation, status
and approvals. Three database constraints do the heavy lifting: separation of duty (approver ≠
drafter) as a CHECK, an exclusion constraint guaranteeing exactly one version in force per rule at
any date, and revoked update/delete grants making a published version permanent.

**Every read is time-anchored**: the resolver's only method is `get(key, asOf)` — there is no
`get(key)`, so the mistake cannot be written. Trips and commitments **stamp** the
`rule_version_id` they were created under, which is what makes history stable when a cap changes.

Publication requires an **impact preview** before approval and notifies affected users **with the
reason — never silently**, both required by the audit. Details: `REGULATORY-ENGINE.md`.

---

## 19. Billing separation

Subscriptions are Maabar's own revenue and the **only** money the platform touches.

Separation is structural, not procedural: a separate `billing` schema, and **no foreign key
crosses into `app`** — `subscriptions.user_id` is a plain uuid deliberately without one. A report
settling trade through Maabar cannot be written by accident; it would need a migration first.

Two payment paths, both drawn: CCP/BaridiMob receipt into an admin confirmation queue, and
CIB/Eddahabia through SATIM with instant activation. Activation is idempotent in both. The admin
console keeps billing in its own group so the console never implies Maabar settles trade — the
artboard says so in its own source.

What lapses on expiry is **not specified by the design** and is an open product question (§36.2),
with a safe default: block capability-gated creation, never interrupt an in-flight commitment.

---

## 20. i18n and RTL

Arabic is the source language, not a translation. Fallback is `fr→ar` and `en→ar`; a missing
Arabic string is a build failure.

One component set, two directions: logical properties only, enforced by stylelint — the deck
achieved zero physical directional properties across 24 screens and the implementation must not
regress it. Arabic is never letter-spaced (it breaks joining) and never uppercased.

**Numbers are LTR-isolated at the formatter, never by callers.** `U+2066…U+2069` around every
numeric run; a lint rule forbids `toLocaleString` outside the `format` package. This prevents the
two bugs the RTL review actually caught: `60%` rendering as `%60`, and `S · M · L · XL` reversing.

**Arabic pluralization is four-form counted nouns** (one/two/few 3–10/many 11+), with `one` and
`two` carrying the count in the word rather than a numeral — "1 صنف واحد" is the classic bug.

Month names are **content, not `Intl` output**: the deck uses the Maghrebi set (`جوان`, not
`يونيو`), and legal citations must match the Official Journal wording exactly.

Honest status: full RTL and Arabic on 24/24; French and English copy on 2/24. A P1 content task
with the architecture proven, scheduled into the first sprint and completed for the
launch-critical set in Phase 12.

---

## 21. API architecture

REST/JSON over a session cookie; plural nouns, verbs only for transitions; cursor pagination;
`Idempotency-Key` required on every state transition.

The API returns **raw integers and message keys, never formatted numbers or user-facing prose** —
formatting and translation belong to one shared client module. Any regulatory-derived value
carries its provenance (rule key, version, effective date, source) because the design displays it.

One error envelope with a distinct code per failure class, including the domain-specific
`STATE_TRANSITION_INVALID`, `CAPACITY_EXCEEDED` (naming the failing axis),
`LEGAL_LIMIT_REACHED` and `FEATURE_DISABLED`. Production responses expose no stack traces, SQL,
constraint names or table names: a `23503` from the listing foreign key surfaces as `FORBIDDEN`
with `reason_key: "listing.requires_verified_trader"`. Full contract: `API-CONTRACT.md`.

---

## 22. Frontend architecture

Next.js App Router, three route groups: `(public)` server-rendered/ISR for SEO and first paint,
`(app)` client-rendered behind the shell, `(admin)` desktop-only with its own code split.

The web tier is a **thin BFF**: no domain rule, no authorization decision, no regulatory value.
Two enforcement points drift; one does not.

`tokens.css` is imported unchanged and treated as generated input. Server state through TanStack
Query; forms through react-hook-form with the **same zod schemas the API uses**, so a form and its
endpoint cannot disagree. Components are domain-aware and shared across roles — a `TripCard`
renders for trader and importer, with a role-aware prop, rather than two components that drift.

Every screen implements the designed states; the guiding rule from the audit applies to all of
them: each state answers *what happened · why · what can I do next*. No generic placeholders.

---

## 23. Admin architecture

**One queue engine, one decision engine, one audit writer, per-queue evidence providers.** The
audit justifies building the pattern once; adding a sixth queue means an evidence provider and a
set of reason codes.

Mandatory reason codes (lookup table, extensible without deploy). The user-facing consequence is
**stored, not generated**, so the record answers "what was this person told?" even after the copy
changes. Corrections supersede, never edit. Claiming is an atomic conditional update so two admins
cannot decide one case. MFA mandatory; two separations of duty (granter ≠ decider, drafter ≠
approver) so no single compromised account can both escalate and use the escalation.

---

## 24. File storage

Four object classes with different privacy, residency and lifecycle: KYC documents, product
imagery, dispute evidence, billing receipts. Self-hosted MinIO in Algeria for everything private;
a CDN for public imagery only, which carries no personal data.

Direct-to-storage resumable upload with a server-issued grant, landing in a quarantine bucket and
promoted only after sniffing, scanning and re-encoding. Nothing is served by path — every read
mints a short-lived signed URL after an authorization check.

No profile photographs exist: the design uses generated initials avatars throughout, which removes
a moderation surface entirely. Maabar supplies no product imagery either, because it owns no
goods; un-imaged listings use the designed category placeholders already living in `tokens.css`.

---

## 25. Notifications

In-app (always, the durable record) · Web Push (time-sensitive) · SMS (**OTP only** — cost) ·
email (**does not exist**; the design never collects an address). Web Push is therefore the only
channel reaching a user who has closed the app, which makes push enrolment a first-class step for
importers and traders.

Delivery through a **transactional outbox**: the notification is enqueued in the same commit as
the state change that caused it, removing both "notified but not committed" and "committed but not
notified" — the second being fatal in a deadline-driven product.

Coalescing, quiet hours (22:00–07:00 Algiers) for normal and low priority, and `critical` always
delivering, for the five kinds that are time- or security-critical. Push payloads carry **no**
price, name, document or trip value — a payload can appear on a lock screen.

The "needs your attention" block on both home screens is a ranked read model with rules taken from
the design: a running clock outranks no clock; blocking a counterparty outranks blocking yourself;
a regulatory deadline outranks a commercial one.

---

## 26. Search

**Postgres FTS + `pg_trgm`, no Elasticsearch at MVP.** The corpus is roughly 1,200 listings and
tens of profiles; a search cluster would be the largest operational burden in the system, serving a
table that fits in memory. The brief explicitly invites this answer, and the interface is a
`SearchPort` so the engine is swappable when the numbers justify it.

Arabic has no Postgres stemmer, so normalization is explicit and **shared between indexing and
querying**: strip tatweel and diacritics, fold alef and hamza variants, fold taa marbuta to haa,
fold Arabic-Indic digits. `tsvector` handles word matching; trigram similarity handles typos and
the morphology `simple` cannot stem. One row per locale, so an Arabic query does not have to match
French text. Ranking tiebreak is confirmed-transaction count — which is also the design's
"most confirmed transactions" sort, so one signal serves both.

Transliteration of arbitrary user content is explicitly out of scope; the design does not need it.

---

## 27. Performance

Mobile-first on Algerian networks. Targets: API p95 < 300 ms reads / < 600 ms transitions; LCP
< 2.5 s on throttled 3G for public pages; initial JS < 180 KB gzipped on public routes; CLS < 0.05.

The bottlenecks that will actually bite first, in order: image weight on the marketplace grid
(addressed by four pre-generated variants with fixed aspect ratios from `tokens.css`, WebP with
fallback, CDN); the capacity-check lock under concurrent accepts (bounded by keeping the locked
section to two statements); search ranking on a cold cache; and the demand aggregation job, which
is scheduled rather than on-request for exactly that reason.

Fixed aspect ratios are a performance decision as much as a design one — they make CLS ≈ 0
achievable without JavaScript.

---

## 28. PWA and offline

MVP: installability, app-shell caching, **resumable uploads**, Web Push, and the two offline states
the design actually draws — `Search` cached-results banner and `Verification` resumable upload.

V1: offline browsing of cached results. Future: background sync. Building a general offline data
layer for a marketplace whose data goes stale in hours is unjustified, and the design does not ask
for it.

---

## 29. Observability

Structured JSON logs with a correlation id on every line and a **redaction allowlist applied at
the logger** — never at call sites — covering OTP codes, session tokens, handover codes, signed
URLs, full phone numbers and **trip value capacity**.

RED metrics per route plus domain counters (verification queue depth and SLA breaches, capacity
rejections, OTP send rate and cost, push failures, job queue age). OpenTelemetry at 10% sampling,
100% on error. Health endpoints for liveness and readiness.

Paging alerts are kept few so they stay meaningful; two of them are security controls rather than
availability ones: an **audit hash-chain break**, and a **KYC signed-URL issued without a matching
open case**.

---

## 30. Deployment

Algerian hosting for Postgres and MinIO (residency), application tier co-located; a documented
hybrid fallback if local hosting proves operationally inadequate, decided in Phase 0 with a spike
rather than assumed. Two web nodes, two api nodes, one to two workers, Postgres primary with
streaming replica and WAL archiving.

Rolling deploys of an artifact promoted unchanged from staging. **Expand → migrate → contract**
migrations, so a code rollback never requires a database rollback — the property that makes
rollback safe enough to use under pressure. A startup assertion refuses to boot production with
the deposit flag enabled and no recorded legal sign-off reference.

Staging **never** receives production KYC documents or phone numbers; a masked-restore script is
the only sanctioned path down from production.

---

## 31. Testing

Thirteen layers, but effort follows consequence. **Seven critical-invariant suites are written
before the features they protect and block the pipeline with no override:**

1. An importer cannot create a consumer listing — including the direct-`INSERT` `23503` assertion.
2. KYC isolation, including audit-before-signed-URL ordering.
3. Trip value-capacity privacy across every serializer, the search index and analytics exports.
4. The full commitment transition table, valid **and invalid**.
5. Capacity concurrency — 10 parallel accepts against room for 3, plus a lock-ordering regression.
6. Admin auditability and immutability, including the hash chain and separation of duty.
7. Regulatory reproducibility — a record from version 2 renders identically after version 3.

Plus a **generated** authorization matrix at 100% route coverage, so it cannot fall behind the
routes, and one negative E2E journey: an importer attempting to list and receiving the blocked
state. Full plan: `TESTING-STRATEGY.md`.

---

## 32. Threat model

Twenty-two threats with attack surface, impact, mitigation and enforcement layer
(`SECURITY-ARCHITECTURE.md` §8). The ones that shape architecture rather than configuration:

| | Threat | Why it shapes the design |
|---|---|---|
| T5 | KYC exposure | Drives residency, bucket policy, signed URLs, audit-before-issue, no owner endpoint |
| T6 | SIM-swap takeover | Drives the new-device cooldown and manual audited recovery |
| T8 | Trip value disclosure | **Physical safety.** Drives two serializers and a contract test |
| T12 | Capacity race | Drives the row-lock-plus-ledger design and fixed lock ordering |
| T15 | Reputation gaming | Drives dual confirmation, review-source requirement, device clustering |
| T16 | Admin abuse | Drives MFA, two separations of duty, KYC-access reporting |
| T22 | Deposit enabled prematurely | Drives the CI assertion and the startup refusal |

---

## 33. Data lifecycle

| Entity | Creation → end |
|---|---|
| KYC document | Uploaded → reviewed → approved with `valid_until` → expired or superseded → **retained**; deletion only under `kyc.retention_months`, job written but unscheduled |
| Listing | Draft → moderation → published → hidden → archived. **Force-archived before seller eligibility is revoked.** Images orphaned then purged at 90 days |
| Trip | Draft → published → stages → closed. Stamped rule version retained permanently |
| Commitment | 7 stages + 3 terminals. Terms versioned, never edited. Transitions and audit permanent |
| Dispute | Submitted → decided. Evidence 5 years, decision permanent |
| Review | Visible or removed-by-moderation. **Never deleted**; reply permanent |
| Message | Created, not editable; conversation locks at terminal states; redaction leaves a tombstone |
| Audit | Append-only, monthly partitions, never dropped without an explicit retention decision |
| Regulatory version | Draft → approved → scheduled → active → superseded. Never deleted |
| Session | Created → expired or revoked; revoked rows retained 90 days for security investigation |
| Account | Closed → anonymised, sessions revoked; commitments, reviews and audit **survive**, because they belong to counterparties too |

---

## 34. MVP boundaries

**In:** all 24 screens, the full trust ladder for both roles, three-axis capacity with the
regulatory cap, the commitment machine without `secured`, messaging with action cards, reviews and
disputes, the compliance checker in three languages, the regulatory engine, subscriptions with both
payment paths, notifications with Web Push, the admin console.

**Out, deliberately:** deposit declaration (legal hold) · group sourcing (AD-041) · reference price
index (AD-042) · email · SMS product notifications · desktop layouts beyond admin · analytics
screens · separate requests/commitments list screens · consumer profile screen · French and English
beyond the launch-critical set.

Each exclusion is either a design gap the deck itself names, or a legal hold — none is a shortcut.

---

## 35. Implementation roadmap

Thirteen phases, roughly 29–30 weeks with 3–4 engineers. Ordering is driven by dependency and
risk, not by the screen list: the audit trail and the policy guard are Phase 0; verification is
Phase 2 **because `listing_eligible` is half of the composite foreign key**, so marketplace cannot
sensibly precede it; commitments are Phase 6 and should not be parallelised with anything, because
that is where the invariants meet.

Full phase detail with objectives, dependencies and acceptance criteria:
`IMPLEMENTATION-ROADMAP.md`.

---

## 36. Open questions

### 36.1 BLOCKING — four questions, each gating one later phase

None blocks Phases 0–3. Each has a recommended resolution in
`DESIGN-IMPLEMENTATION-GAPS.md` that changes no screen and no architecture — they need a decision,
not a design pass.

**Q1 — Where does a *final price* come from?** (gap G1, blocks **Phase 8**)
`Records` draws a ledger with exact amounts, and `Importer Profile` publishes
`ثبات السعر 95%`, defined as commitments whose **final price** stayed inside the declared band.
But a commitment records a **band**, never a settled price, because Maabar is not party to the
sale. No field in the approved model can produce either figure.
*Recommendation:* capture it as a declared fact from **both parties at handover** — one optional
field on the `confirm_handover` card both already touch — counting only corroborated figures, with
the exclusion visible in the metric's stored breakdown. The ledger becomes the importer's own
pre-filled notebook.
*Alternative if declined:* drop `price_stability_rate` from published facts. **Do not compute it
from an inferred value** — that would violate the settled decision that every published figure is
traceable to raw inputs.

**Q2 — What does the compliance checker answer for goods it does not know?** (gap G2, blocks
**Phase 9**)
The artboard draws exactly one verdict and no unknown state, on a public free-text legal surface
where guessing is the worst failure.
*Recommendation:* one neutral "no verdict for these goods" state built from existing components,
with the standing customs disclaimer and the quick chips as a route out; unmatched queries feed the
existing category-review queue. Never fall back to "allowed". Needs designer sign-off only.

**Q3 — Where do the Demand Board's unit cost, weight and volume estimates come from?** (gap G3,
blocks **Phase 4**)
The buy list multiplies them by quantity to drive all three capacity axes and the blocked state.
Nothing in the model produces them.
*Recommendation:* category-level planning estimates — median of corroborated final prices once Q1
lands, otherwise admin-curated defaults; weight and volume always curated. Labelled with their
basis in the payload so an estimate never renders with the weight of a recorded fact. **A curated
default unblocks Phase 4 without waiting on Q1.**

**Q4 — Can a micro-importer publish a sourcing request?** (gap G7, blocks **Phase 5**)
Two approved sources disagree. `designs/Verification.dc.html` importer L2 lists
`unlocks: ['ملف عام', 'نشر طلب توريد']`; `DESIGN-AUDIT.md` §5 says "only when acting as trader".
This decides whether an importer may source from another importer without a commercial register,
which touches the §9.1 Law 18-05 question.
*Interim:* the audit's stricter reading (`trader` + L2-T), because the stricter reading cannot
create an exposure the looser one would.

### 36.2 NON-BLOCKING — safe defaults chosen, confirmation wanted

| | Question | Default until answered |
|---|---|---|
| Q5 | What does an expired subscription actually block? The design shows plans, days remaining and payment, never a consequence (G8) | Block capability-gated **creation**; never interrupt an in-flight commitment; never hide existing data |
| Q6 | Handover code direction — the design shows the code on the receiving party's card but not who speaks it | Shown to the receiving party, entered by the importer, so delivery cannot be self-confirmed (`STATE-MACHINES.md` §2.6) |
| Q7 | "صورة حيّة مطابقة" implies liveness detection, but only manual admin comparison is drawn (G5) | Manual comparison plus camera-only capture and a movement prompt; method recorded on the decision. A biometric vendor waits on §9.4 residency and ANPDP |
| Q8 | `Saved` price-drop needs price history that nothing records (G4) | Snapshot price and quantity on save, plus an append-only `listing_price_changes` table |
| Q9 | The handover code is drawn inside a chat message, i.e. persisted in history and bundled into dispute evidence (G6) | Store only the hash; the card carries `code_required`, and the client fetches the plaintext from a live authorised endpoint. Visually identical |
| Q10 | Group sourcing — one opportunity card, no flow | Modelled in schema, not built (AD-041, G12) |
| Q11 | Reference price index — computation, minimum sample and anti-gaming unspecified | Deferred to V1 (AD-042, G13) |
| Q12 | Customs duty is computed on a value Maabar does not hold (G10) | Indicative figure from the importer's own declared total, labelled as such and overwritable |
| Q13 | Commitment offer validity default | 7 days, configurable |
| Q14 | Demand aggregate k-threshold | k = 5 with a per-contributor share cap |
| Q15 | Dispute window after `done` | 14 days, configurable |
| Q16 | Hosting: fully Algerian or hybrid | Fully Algerian; Phase 0 spike decides, fallback documented |

### 36.3 LEGAL — from `DESIGN-AUDIT.md` §9, unchanged and not guessed at

| | Question | Architectural treatment |
|---|---|---|
| L1 **§9.2** | Is a recorded, never-held deposit a prohibited purchase mandate under art. 3, or a legitimate advance? | `features.deposit_declaration = false`; `secured` skippable; tables exist with no custody, settlement or refund column; CI and a startup assertion enforce the hold. **A "no" is a config change plus a deletion job; a "yes" is a flag flip** |
| L2 **§9.1** | Does an importer appearing in `Discover` with indicative price bands constitute electronic-supplier activity under Law 18-05? | `discover.importers.audience` flag, defaulting to verified traders only |
| L3 **§9.3** | Technical or commercial intermediary? | Positioned as technical: no fees, no payment handling, no guarantees. A restrictive answer adds disclosures — copy, not structure |
| L4 **§9.4** | KYC retention period; is prior ANPDP authorisation required? | `kyc.retention_months` **intentionally unset**, so the deletion job refuses to run and logs why. Documents in Algeria; never shown to other users |
| L5 **§9.5** | Can platform-computed reliability figures be published under Law 18-07 / 25-11? | No composite score exists; only countable facts, each decomposable into stored inputs |

---

## 37. Architecture decisions

48 decisions in `ARCHITECTURE-DECISIONS.md`, each with reason, alternatives, consequence and
status, and each marked `DESIGN` (settled by the approved design) or `ARCHITECTURAL DECISION`
(mine, where the design left a genuine technical gap).

The ten load-bearing ones:

| ID | Decision |
|---|---|
| AD-001 | Modular monolith, not microservices |
| AD-010 | Opaque server-side sessions, **not JWT** — capability and verification must be instantly revocable |
| AD-014 | Capabilities on one identity, no `role` column; context never widens authorization |
| AD-017 | The legal invariant as a **composite foreign key** — the illegal row is unrepresentable |
| AD-018 | Billing in a separate schema with **no foreign key** into commercial data |
| AD-019 | Deposit ships **disabled**; `secured` is a skippable stage |
| AD-021 | Trip value capacity is **owner-only** |
| AD-022 | Regulatory values are versioned rows; every read is time-anchored; records stamp their version |
| AD-031 | `bigint` centimes, integer grams, integer cm³ — no floats |
| AD-033 | Postgres FTS + trigram, **no Elasticsearch** at MVP |

---

## Architecture gate

Assessed against the brief's stated conditions:

| Condition | Status |
|---|---|
| Domain boundaries coherent | ✅ 19 modules, one deliberate cross-module transaction, coupling map published |
| Database model coherent | ✅ ~48 tables, constraints carrying the invariants, concurrency specified |
| API boundaries coherent | ✅ 24 endpoint groups mapped to modules, one error contract |
| Authorization explicit | ✅ Five gates, full matrix, generated 100%-coverage test |
| State machines explicit | ✅ Commitment in full plus nine supporting machines, with invalid transitions named |
| Legal invariants enforceable | ✅ Composite FK plus five further layers; the deposit hold is a flag with CI enforcement |
| KYC security defined | ✅ Residency, signed URLs, audit-before-issue, no owner endpoint, sanitisation pipeline |
| Regulatory configuration defined | ✅ Versioned, time-anchored, dual-approved, impact-previewed, stamped on records |
| Frontend/backend responsibilities clear | ✅ Thin BFF; no rule or authorization decision in the web tier |
| Every approved screen has an implementation path | ✅ 24/24 mapped in `SCREEN-API-MATRIX.md`; zero without a path. Three screens (`Records`, `Compliance Checker`, `Demand Board`) need a **data-source decision**, not a design change — §36.1 |
| Critical concurrency addressed | ✅ Capacity, dual review, dual confirmation, duplicate transition, double-charge |
| Deployment architecture defined | ✅ Topology, environments, migrations, backup/restore with RPO and RTO |
| Testing covers the critical invariants | ✅ Seven non-overridable suites plus a generated authorization matrix |
| Design → implementation gaps audited | ✅ 17 gaps in `DESIGN-IMPLEMENTATION-GAPS.md`: 3 P0, 5 P1, 5 P2, 4 P3, each with a recommendation |
| Remaining questions genuinely non-blocking | ⚠️ **Four questions (§36.1)**, each gating one later phase (4, 5, 8, 9). None blocks Phases 0–3; each has a recommended resolution requiring a decision, not a design pass |

```
ARCHITECTURE STATUS:

READY FOR IMPLEMENTATION
```

Ready because every architectural condition is met, and because the four open questions are
**decisions, not design work**. Each has a recommended resolution that changes no screen, no
entity and no boundary; none touches Phases 0–3, roughly the first nine weeks. They must be
answered before the phase each one gates:

| Question | Answer needed before | Week (est.) |
|---|---|---|
| Q3 — Demand Board unit estimates | Phase 4 | ~week 10 |
| Q4 — importer sourcing-request permission | Phase 5 | ~week 13 |
| Q1 — source of a final price | Phase 8 | ~week 20 |
| Q2 — compliance "unknown goods" state | Phase 9 | ~week 22 |

This verdict would change to **NOT READY** if Q1 were answered by inferring a final price from a
band, or Q2 by defaulting an unknown query to "allowed". Both would publish a figure or a verdict
the system cannot stand behind, which is the one thing this product cannot survive.

**Two things must remain true throughout implementation**, or this verdict lapses:

1. `features.deposit_declaration` stays `false` in staging and production until an Algerian lawyer
   rules on §9.2, enforced by the CI check and the startup assertion, not by memory.
2. The composite foreign key on `product_listings` is never weakened, dropped or worked around.
   It is the product's legal thesis expressed as a constraint, and it is the one thing in this
   architecture that no application bug can defeat.
