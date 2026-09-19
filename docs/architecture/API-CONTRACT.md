# Maabar — API Contract

**Base:** `https://api.maabar.dz/v1` · JSON only · UTF-8 · session cookie auth (AD-010)
**Conventions:** plural resource nouns; verbs only for state transitions (`/accept`, `/publish`);
cursor pagination; `Idempotency-Key` required on every unsafe state transition.

`A` = required policy, written as `capability/level` (see `AUTHORIZATION-MATRIX.md`).
`—` = public.

---

## 1. Global conventions

### 1.1 Headers

| Header | Direction | Purpose |
|---|---|---|
| `Cookie: __Host-mb_session` | → | Session (AD-011) |
| `X-CSRF-Token` | → | Required on unsafe methods (AD-012) |
| `Idempotency-Key` | → | Required on every state transition; UUID; 24 h replay window |
| `Accept-Language` | → | `ar` \| `fr` \| `en`; server falls back `fr→ar`, `en→ar` |
| `X-Request-Id` | ↔ | Correlation; echoed on every response and written to audit `context` |
| `X-RateLimit-Remaining`, `Retry-After` | ← | Rate limiting |

### 1.2 Pagination

`?cursor=<opaque>&limit=<1..50>` → `{ data: [...], page: { next_cursor, has_more } }`.
Keyset over `(sort_key, id)`; never `OFFSET`, which drifts under concurrent inserts.

### 1.3 Money and measures on the wire

```json
{ "price": { "centimes": 740000, "currency": "DZD" },
  "band":  { "min_centimes": 480000, "max_centimes": 520000, "valid_until": "2026-10-14" },
  "weight": { "grams": 46000 },
  "volume": { "cm3": 1200000 } }
```

Integers only (AD-031). **The API never returns a formatted string for a number** — LTR isolation
and Arabic counted nouns are the client's formatter's job, from one shared module (AD-035).

### 1.4 Regulatory values

Any response carrying a regulatory-derived value also carries its provenance, because the design
displays the effective date next to the value:

```json
{ "value_cap": { "centimes": 180000000 },
  "rule": { "key": "max_value_per_trip", "version": 3,
            "effective_from": "2025-06-29",
            "source": "Journal officiel n° 40 du 29 juin 2025" } }
```

---

## 2. `/auth`

| Method | Route | Purpose | A | Notes |
|---|---|---|---|---|
| POST | `/auth/otp/request` | Send OTP | — | Body `{ phone, purpose }`. Rate: 3/phone/hour, 10/IP/hour. **Always 202**, even for an unknown number, to avoid account enumeration |
| POST | `/auth/otp/verify` | Verify and create session | — | `{ phone, code, device_label }`. Max 5 attempts per challenge; returns `401 OTP_INVALID` without saying which of the two was wrong |
| POST | `/auth/session/refresh` | Extend sliding session | auth | Rotates the token; old hash revoked |
| GET | `/auth/sessions` | List own sessions | auth | Device, IP city, last used |
| DELETE | `/auth/sessions/:id` | Revoke one | auth | Own sessions only |
| POST | `/auth/logout` | Revoke current | auth | |
| POST | `/auth/logout-all` | Revoke all | auth | Also on phone change |
| GET | `/auth/me` | Identity snapshot | auth | Capabilities, derived levels, expiring documents, active context, feature flags |

`/auth/me` is the client's single source of navigational truth; it must never be cached beyond
the current render.

---

## 3. `/users`, `/capabilities`, `/profiles`

| Method | Route | Purpose | A |
|---|---|---|---|
| PATCH | `/users/me` | Display name, wilaya, locale | auth |
| POST | `/users/me/phone-change` | Begin phone change | auth (OTP on both numbers) |
| GET | `/capabilities` | Own capabilities and levels | auth |
| POST | `/capabilities` | Declare a capability | auth. `{ kind }`. Grants nothing by itself |
| DELETE | `/capabilities/:kind` | Revoke | auth. `409` if in-flight obligations exist under it |
| GET | `/profiles/traders/:id` | Public storefront | — |
| GET | `/profiles/importers/:id` | Public trust profile | trader/L2-T (AD-045) |
| GET | `/profiles/:id/reputation` | Facts **with their inputs** | as above |
| PATCH | `/profiles/trader/me` | Shop name, bio, address | trader/L1 |
| PATCH | `/profiles/importer/me` | Specialities | importer/L1 |

`GET /profiles/:id/reputation` returns the `Importer Profile` sheets, not just the headline:

```json
{ "facts": [
  { "metric": "completion_rate", "value": 0.97, "display": "percent",
    "inputs": { "accepted": 87, "on_time": 84, "late": 2,
                "cancelled_by_subject": 1, "excluded_customs_hold": 1 },
    "note_key": "reputation.completion.customs_exclusion" },
  { "metric": "median_response_time", "value": 58, "display": "minutes", "window": "last_90d",
    "inputs": { "incoming": 212, "replied": 204, "median_minutes": 58, "unanswered": 8 },
    "note_key": "reputation.response.median_not_mean" },
  { "metric": "price_stability_rate", "value": 0.95, "display": "percent",
    "inputs": { "with_band": 80, "within": 76, "outside": 4, "avg_deviation_pct": 6 } }
] }
```

No composite figure is present or computable from this payload (AD-020).

---

## 4. `/verification`

| Method | Route | Purpose | A |
|---|---|---|---|
| GET | `/verification/ladder` | Ladder for the active capability: rungs, requirements, unlocks | auth |
| GET | `/verification/requirements` | Required documents **from regulatory config** | auth |
| POST | `/verification/cases` | Open a case | auth. `409` if one is already open |
| POST | `/verification/documents/upload-session` | Begin a resumable upload | auth. Returns signed PUT target, chunk size, upload id |
| POST | `/verification/documents` | Attach an uploaded object | auth. `{ case_id, doc_type, media_object_id, issued_on, valid_until }` |
| POST | `/verification/cases/:id/submit` | Submit for review | auth. Validates completeness |
| GET | `/verification/cases/:id` | Status, problems, fixes | auth, owner |
| GET | `/verification/documents/:id/status` | Status and expiry **only** | auth, owner |

There is deliberately **no** endpoint returning a document binary to its owner. The design shows
status, never the image (`Importer Profile.DOCS`). Admin access is a separate, audited route
(§16).

---

## 5. `/products`, `/listings`

| Method | Route | Purpose | A |
|---|---|---|---|
| GET | `/listings` | Marketplace grid | — |
| GET | `/listings/:id` | Product detail | — |
| GET | `/listings/:id/similar` | Similar items | — |
| POST | `/listings` | Create draft | **trader/L2-T** |
| PATCH | `/listings/:id` | Edit draft | trader/L2-T, owner |
| POST | `/listings/:id/submit` | Send to moderation | trader/L2-T, owner |
| POST | `/listings/:id/hide` · `/unhide` · `/archive` | Visibility | trader/L2-T, owner |
| POST | `/listings/:id/media` | Attach image | trader/L2-T, owner |
| GET | `/categories` | Tree with counts | — |

`GET /listings` query: `category`, `wilaya`, `availability` (`in_stock`/`arriving_soon`/`on_order`),
`origin`, `sort` (`recent`/`confirmed_transactions`/`price_asc`/`price_desc`), `cursor`, `limit`.
Sorts are exactly the four in `Marketplace.SORTS`.

`GET /listings/:id` always includes the permanent disclosures from `Product Detail.DISCS` as
message keys, never as server-rendered prose:

```json
{ "disclosures": [
  { "id": "returns",  "kind": "neutral",  "key": "listing.returns.seller_policy" },
  { "id": "payment",  "kind": "neutral",  "key": "listing.payment.not_a_party" },
  { "id": "regulatory","kind": "allowed", "key": "listing.regulatory.allowed",
    "citation": { "rule": "decree_25_170", "article": 9, "source_key": "official_journal" } }
] }
```

The payment disclosure — Maabar does not receive, hold, guarantee or refund — is not optional and
not dismissible. It is part of the resource, so no client can ship a screen without it.

**`POST /listings` has no `seller_user_id` field.** Seller comes from the session. Sending one is
a `422`, not a silent overwrite (`AUTHORIZATION-MATRIX.md` §6.1).

---

## 6. `/trips`

| Method | Route | Purpose | A |
|---|---|---|---|
| GET | `/trips` | Discovery list | trader\|importer / L1 |
| GET | `/trips/:id` | Detail, **role-aware serializer** | visibility rules |
| POST | `/trips` | Create draft | importer/L2-I |
| PATCH | `/trips/:id` | Edit draft | owner |
| POST | `/trips/:id/publish` | Publish | owner; monthly cap; documents unexpired |
| POST | `/trips/:id/stage` | Advance stage | owner. `{ stage }` |
| POST | `/trips/:id/cancel` | Cancel | owner (no accepted commitments) or admin |
| GET | `/trips/:id/buy-list` | Items, quantities, buyers | **owner only** |
| GET | `/trips/me/quota` | Trips used this month vs cap | importer/L2-I |

### 6.1 The two trip serializers (AD-021)

```jsonc
// GET /trips/:id  — owner
{ "capacity": {
    "value":  { "cap_centimes": 180000000, "used_centimes": 56000000,
                "note_key": "trip.capacity.legal_cap",
                "rule": { "key": "max_value_per_trip", "effective_from": "2025-06-29" } },
    "weight": { "cap_grams": 46000,  "used_grams": 24000 },
    "volume": { "cap_cm3": 1200000, "used_cm3": 420000 } } }

// GET /trips/:id  — any counterparty: the value axis is ABSENT, not null, not zeroed
{ "capacity": {
    "weight": { "cap_grams": 46000,  "used_grams": 24000 },
    "volume": { "cap_cm3": 1200000, "used_cm3": 420000 },
    "note_key": "trip.capacity.set_by_importer" } }
```

A contract test asserts the counterparty payload contains no key matching `/value|centimes/`
anywhere under `capacity`.

---

## 7. `/demand`

| Method | Route | Purpose | A |
|---|---|---|---|
| GET | `/demand/board` | Aggregated demand | **importer/L2-I** |
| GET | `/demand/board/:categoryId` | Category detail with band and market track | importer/L2-I |
| POST | `/trips/:id/buy-list/items` | Add item at a quantity | owner |
| PATCH | `/trips/:id/buy-list/items/:itemId` | Change quantity | owner |
| DELETE | `/trips/:id/buy-list/items/:itemId` | Remove | owner |

`GET /demand/board` mirrors `Demand Board` exactly: `confirmed_count`, `interested_count`,
`wilayas[]`, `band`, `market_track`, `compliance` verdict with an optional note,
`unit_cost_centimes`, `unit_weight_grams`, `unit_volume_cm3`, and `basis`
(`{ request_count: 214 }`). Cells below the `k` threshold are omitted entirely — never returned
with a suppressed flag, which would still leak existence (AD-028).

Buy-list mutations return the recomputed three-axis capacity so the client meters stay truthful
without a second round-trip, and return `409 CAPACITY_EXCEEDED { axis, requested, remaining }`
when an addition does not fit — the `لا يتّسع في المتبقّي` state.

---

## 8. `/sourcing-requests`, `/offers`

| Method | Route | Purpose | A |
|---|---|---|---|
| GET | `/sourcing-requests` | Mine, or visible to me as an importer | trader\|importer / L2 |
| POST | `/sourcing-requests` | Create draft | trader/L2-T |
| PATCH | `/sourcing-requests/:id` | Edit | owner, no offers yet |
| POST | `/sourcing-requests/:id/publish` | Publish | owner |
| POST | `/sourcing-requests/:id/cancel` | Cancel | owner, no accepted offer |
| GET | `/sourcing-requests/:id/offers` | Offers received | **owner only** |
| POST | `/sourcing-requests/:id/offers` | Make an offer | importer/L2-I |
| PATCH | `/offers/:id` | Amend | offer author, still `offered` |
| POST | `/offers/:id/withdraw` | Withdraw | offer author |
| POST | `/offers/:id/accept` | Accept → creates a Commitment | request owner |
| POST | `/offers/:id/decline` | Decline | request owner |

`POST /offers/:id/accept` is transactional: accepted offer, all siblings declined, request →
`committed`, a `Commitment` in `proposed`, an action card posted to the conversation, and
notifications — one commit, one `Idempotency-Key`.

An offer carries `quantity_covered` which may be **less than requested** (the design shows an
80-of-120 partial), plus `proposed_price_centimes`, `arrival_on`, `note`, and the offerer's
reputation facts so the trader can "compare by confirmed transactions, not price alone".

---

## 9. `/commitments`

| Method | Route | Purpose | A |
|---|---|---|---|
| GET | `/commitments` | Mine, filter by state | party |
| GET | `/commitments/:id` | Detail: state, flow, terms | party |
| POST | `/commitments` | Propose | trader\|importer / L2 |
| POST | `/commitments/:id/accept` | Accept — **consumes capacity** | counterparty only |
| POST | `/commitments/:id/amend` | New terms version | party |
| POST | `/commitments/:id/decline` · `/withdraw` · `/cancel` | End early | per matrix |
| POST | `/commitments/:id/deposit` | Declare a deposit | **`403 FEATURE_DISABLED`** (AD-019) |
| POST | `/commitments/:id/stage` | `buying` / `transit` / `arrived` | importer, party |
| POST | `/commitments/:id/handover/confirm` | Confirm receipt | party. Importer supplies the code |
| GET | `/commitments/:id/timeline` | Transitions, user-visible | party |

Full preconditions and effects: `STATE-MACHINES.md` §1.3. Every route here requires
`Idempotency-Key`; every one returns `409 STATE_TRANSITION_INVALID` with
`{ current_state, allowed_actions }` so the client can re-render without guessing.

`POST /commitments/:id/deposit` **exists and is routed** while the flag is off, returning
`403 FEATURE_DISABLED` with `reason_key: "deposit.legal_hold"`. Shipping the route disabled is
deliberate: it keeps the contract, the tests and the client's error handling honest, so enabling
it later is a flag flip rather than a release.

---

## 10. `/messages`

| Method | Route | Purpose | A |
|---|---|---|---|
| GET | `/conversations` | Threads with unread counts | auth/L1 |
| POST | `/conversations` | Open on a context | auth/L1. `{ context_type, context_id, counterparty_id }` |
| GET | `/conversations/:id/messages` | `?after=<id>&limit=` — serves load **and** polling (AD-036) | participant |
| POST | `/conversations/:id/messages` | Send text | participant |
| POST | `/conversations/:id/actions` | Post an action card | participant |
| POST | `/messages/:id/action/accept` · `/decline` | Act on a card | the counterparty |
| POST | `/conversations/:id/read` | Mark read to a message id | participant |
| POST | `/conversations/:id/report` | Report | participant |
| POST | `/conversations/:id/block` | Block counterparty | participant |

Action card payloads:

```json
{ "action_type": "propose_agreement",
  "payload": { "goods": "…", "quantity": 18,
               "band": { "min_centimes": 480000, "max_centimes": 520000 },
               "handover": { "wilaya": "19", "on": "2026-10-20" } } }

{ "action_type": "confirm_handover",
  "payload": { "quantity_delivered": 18, "pickup_point": "…", "code_required": true } }
```

Accepting a card mutates domain state in the same transaction as the message
(`DOMAIN-MODEL.md` §5.1). Messages are not editable; moderation redaction leaves a tombstone.

---

## 11. `/reviews`, `/disputes`

| Method | Route | Purpose | A |
|---|---|---|---|
| GET | `/profiles/:id/reviews` | Public, with replies | — |
| POST | `/reviews` | Write | party to a `done` source, once |
| POST | `/reviews/:id/reply` | One reply | **subject only** |
| POST | `/reviews/:id/report` | Report for moderation | auth |
| GET | `/disputes` | Mine | party |
| POST | `/disputes` | Open | party |
| GET | `/disputes/:id` | Detail, timeline, bundle | party |
| POST | `/disputes/:id/evidence` | Add evidence | party |
| POST | `/disputes/:id/withdraw` | Withdraw | opener |

No `DELETE` exists on reviews at any level of the API (AD-023). `POST /disputes` returns the
auto-bundled evidence manifest so the user sees what was attached on their behalf — the four
items in `Dispute.ATTACHED`.

---

## 12. `/saved`, `/notifications`

| Method | Route | Purpose | A |
|---|---|---|---|
| GET | `/saved?type=listing\|seller\|importer\|trip` | Saved items with change flags | auth/L1 |
| POST | `/saved` | Save | auth/L1 |
| DELETE | `/saved/:type/:id` | Unsave | auth/L1 |
| GET | `/notifications` | In-app feed | auth |
| POST | `/notifications/read` | Mark read | auth |
| GET | `/notifications/preferences` · PATCH | Per-kind channel preferences | auth |
| POST | `/notifications/push/subscribe` · DELETE | Web Push subscription | auth |

`GET /saved` returns the designed change flags inline: `price_drop` with `was_centimes`,
`low_stock` with `remaining`, `unavailable`, `expired`, and for people `news_key`
("added 4 products", "new trip to Istanbul").

---

## 13. `/search`, `/discovery`

| Method | Route | Purpose | A |
|---|---|---|---|
| GET | `/search?q=&scope=&filters=` | Scoped search with per-scope counts | per scope (`AUTHORIZATION-MATRIX.md` §4.1) |
| GET | `/search/suggest?q=` | Suggestions for the empty state | — |
| GET | `/discovery/opportunities` | Trader opportunity feed | trader/L2-T |
| GET | `/discovery/importers` | Importer directory | trader/L2-T + flag |
| GET | `/discovery/trips` | Trip directory | trader\|importer / L1 |

`GET /search` returns counts for every scope the caller may see, so the tab row can render
numbers without four requests. A scope the caller may not see is **absent** from the counts —
not zero, which would be a lie, and not an error, which would break the page.

---

## 14. `/compliance`, `/regulatory`

| Method | Route | Purpose | A |
|---|---|---|---|
| GET | `/compliance/check?goods=&origin=` | Verdict first, evidence after | — **public** |
| GET | `/compliance/categories` | Quick chips | — |
| GET | `/regulatory/rules` | Effective values with sources | — |
| GET | `/regulatory/rules/:key?as_of=` | Value at a date | — |

Response shape follows the designed disclosure order exactly — verdict, reason, what to do, then
*collapsed* legal basis, then *collapsed* source and last-updated (settled decision 8):

```json
{ "verdict": "conditional",
  "subject": { "goods_key": "…", "origin": "TR" },
  "reason_key": "compliance.perfume.shelf_life",
  "steps": ["compliance.step.check_dates", "compliance.step.keep_invoice"],
  "disclosure": {
    "legal_basis": { "rule": "decree_25_170", "article": 6, "body_key": "…" },
    "source": { "name_key": "official_journal_40", "published_on": "2025-06-29",
                "url": "…", "last_checked": "2026-09-01" } },
  "disclaimer_key": "compliance.customs_final_decision" }
```

The disclaimer — indicative information, the final decision at entry belongs to customs — is part
of every response, in all three locales.

---

## 15. `/billing`

| Method | Route | Purpose | A |
|---|---|---|---|
| GET | `/billing/plans` | Plans for my capability | auth |
| GET | `/billing/subscription` | Mine: state, days left, expiry | auth |
| POST | `/billing/subscriptions` | Choose a plan | auth |
| POST | `/billing/subscriptions/:id/receipt` | Upload CCP / BaridiMob receipt | owner |
| POST | `/billing/subscriptions/:id/pay` | Start a CIB / Eddahabia payment | owner |
| POST | `/billing/webhooks/satim` | Gateway callback | signature-verified, no session |
| POST | `/billing/subscriptions/:id/cancel` | Cancel | owner |

**No endpoint under `/billing` accepts or returns a commitment, trip, listing or offer
identifier** (AD-018). The webhook is idempotent on `(provider, provider_reference)` and verifies
a signature before doing anything, including logging the body.

---

## 16. `/admin`

| Method | Route | Purpose | A |
|---|---|---|---|
| GET | `/admin/queues` | Queue groups with counts and SLA | admin |
| GET | `/admin/queues/:queue/items` | Rows: reference, title, subject, age, risk | admin + role |
| POST | `/admin/queues/:queue/items/:id/claim` | Claim (prevents double review) | admin + role |
| GET | `/admin/cases/:id/evidence` | Evidence panel: documents, signals, context, history | admin + role |
| GET | `/admin/documents/:id/view` | **Short-lived signed URL, audited** | `trust_safety` only |
| POST | `/admin/cases/:id/decide` | Decision | admin + role. `{ action, reason_code, reason_text, consequence }` |
| GET | `/admin/decision-reasons?queue=` | Reason list for the queue | admin |
| GET | `/admin/users/:id` | Account with risk signals | admin + role |
| POST | `/admin/users/:id/suspend` · `/reinstate` | Account action | `trust_safety` |
| GET | `/admin/regulatory/rules` · POST `/versions` · POST `/versions/:id/approve` | Rule lifecycle | `regulatory` (approver ≠ drafter) |
| GET | `/admin/regulatory/versions/:id/impact` | Impact preview before publication | `regulatory` |
| GET | `/admin/billing/receipts` · POST `/:id/confirm` | Manual subscription confirmation | `billing` |
| GET | `/admin/audit?resource=&actor=` | Audit query | `superadmin`, itself audited |

`POST /admin/cases/:id/decide` **requires** `reason_code`; a missing or unknown code is a `422`.
The response echoes the stored `user_facing_consequence` so the admin sees precisely what the
user will be told — the `Admin Console` preview panel is reading a real field, not a mock.

---

## 17. Error model

One envelope for every failure:

```json
{ "error": {
    "code": "CAPACITY_EXCEEDED",
    "message_key": "error.capacity_exceeded",
    "details": { "axis": "volume", "requested_cm3": 40000, "remaining_cm3": 12000 },
    "request_id": "01J…" } }
```

`message_key` is an i18n key; the API never returns user-facing prose (§14 of the brief).
`message` is present in development only, English, for engineers.

| Code | HTTP | Meaning |
|---|---|---|
| `VALIDATION_FAILED` | 422 | Body/query failed the schema. `details.fields[]` with per-field keys |
| `UNAUTHENTICATED` | 401 | No live session |
| `OTP_INVALID` | 401 | Wrong or expired code — never says which |
| `CAPABILITY_REQUIRED` | 403 | Gate 2. `details.capability` |
| `VERIFICATION_REQUIRED` | 403 | Gate 3. `details.required_level`, `details.missing_documents[]` |
| `FORBIDDEN` | 403 | Authorized identity, disallowed action (admin roles) |
| `NOT_FOUND` | 404 | Absent **or** invisible (deliberately indistinguishable) |
| `CONFLICT` | 409 | Uniqueness, e.g. a second open verification case |
| `STATE_TRANSITION_INVALID` | 409 | `details.current_state`, `details.allowed_actions[]` |
| `CAPACITY_EXCEEDED` | 409 | `details.axis`, `requested`, `remaining` |
| `LEGAL_LIMIT_REACHED` | 403 | Regulatory cap hit. `details.rule_key`, `effective_from` |
| `FEATURE_DISABLED` | 403 | Flagged off. `details.feature`, `reason_key` |
| `SUBSCRIPTION_REQUIRED` | 402 | Reserved pending AD-043 |
| `RATE_LIMITED` | 429 | `Retry-After` |
| `PAYLOAD_TOO_LARGE` | 413 | Upload limits |
| `UNSUPPORTED_MEDIA_TYPE` | 415 | Sniffed type not allowlisted |
| `INTERNAL_ERROR` | 500 | Opaque. `request_id` only |

**Production safety:** no stack traces, no SQL, no constraint names, no table names, no upstream
provider messages. A `23503` from the listing FK surfaces as `FORBIDDEN` with
`reason_key: "listing.requires_verified_trader"` — the invariant is communicated, the schema is
not.

---

## 18. Idempotency

Required on every state transition. Implementation: `(user_id, endpoint, idempotency_key)` unique
in `app.idempotency_keys` with the stored response and status, TTL 24 h.

- Same key, same body → the stored response, `200`, header `Idempotency-Replayed: true`.
- Same key, different body → `409 CONFLICT`.
- In-flight → `409` with `Retry-After: 1`.

This is what makes the mobile retry path safe: a commitment cannot be accepted twice and a trip's
capacity cannot be consumed twice because the network dropped a response.

---

## 19. Rate limits

| Class | Limit |
|---|---|
| OTP request | 3 / phone / hour, 10 / IP / hour, 30 / phone / day |
| OTP verify | 5 / challenge, then the challenge is burned |
| Auth session create | 20 / IP / hour |
| Search, public reads | 60 / min / IP; 600 / min / session |
| Writes (generic) | 30 / min / session |
| Messages | 20 / min / conversation, 100 / hour / user |
| Media upload | 20 / hour / user, 200 MB / day |
| Handover code entry | 5 / commitment / hour |
| Admin reads | 600 / min |

Counters live in Postgres (AD-009), keyed by class and subject, in a fixed window with a
timestamp column — accurate enough at this scale and one less service to operate.
