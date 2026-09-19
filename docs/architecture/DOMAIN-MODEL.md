# Maabar — Domain Model

Derived from the 24 approved artboards and `DESIGN-AUDIT.md`. Every entity below traces to a
designed screen; entities the brief suggested but the design does not justify are listed in §8
with reasons for not creating them.

---

## 1. Modelling principles

1. **One identity, several capabilities.** Never a `role` column (AD-014).
2. **Verification level is derived**, never stored as an assigned rank (AD-016).
3. **Facts over scores.** Every published figure keeps its raw inputs (AD-020).
4. **Bands, not prices**, wherever two parties agree in advance (AD-032).
5. **Transitions are rows**, not just a mutated column. Every state change is an insert.
6. **Nothing that constitutes a record is ever updated in place** — reviews, admin decisions,
   audit entries and regulatory versions are append-only.
7. **Money never moves through Maabar for goods.** No commercial entity carries a settled
   amount paid (AD-018).

---

## 2. Identity and access

### 2.1 `User`
Purpose: the single account. Owner: itself. Lifecycle: `pending_phone → active → suspended → closed`.

| Field | Notes |
|---|---|
| `id` | uuid v7, primary key |
| `reference` | `USR-YY-NNNN`, shown to admins |
| `display_name`, `wilaya_code`, `locale` (`ar`/`fr`/`en`), `preferred_dir` | from `Onboarding` step 3 and the language selector |
| `status` | `pending_phone`, `active`, `suspended`, `closed` |
| `created_at`, `last_seen_at` | `Admin Console` shows "عمر الحساب" as a risk signal |

Invariants: exactly one `PhoneIdentity` may be `primary` and verified. `display_name` is not
unique. Soft delete: **no** — closure sets `status='closed'`, anonymises `display_name` and
revokes sessions, while preserving commitments, reviews and audit rows.

### 2.2 `PhoneIdentity`
`user_id`, `e164` (unique, `citext`), `verified_at`, `is_primary`, `changed_at`.
Changing a phone number is a security event: it is audited, notifies the old number, and
re-verifies. Immutable history kept in `phone_identity_changes`.

### 2.3 `Capability`
Purpose: what the user has declared themselves to be. From `Onboarding.ROLES` (multi-select).

`user_id`, `kind` (`consumer` | `trader` | `importer`), `declared_at`, `revoked_at`.
Primary key `(user_id, kind)`. **Holding a capability grants nothing by itself** — it selects
which verification ladder applies and which navigation appears. Authorization requires
capability **and** the derived level (AD-015).

`admin` is **not** a capability here; see §7.1.

### 2.4 `Session`
`id`, `user_id`, `token_hash` (never the token), `device_label`, `user_agent_hash`, `ip_first`,
`ip_last`, `created_at`, `last_used_at`, `expires_at`, `revoked_at`, `revoked_reason`.
Listed and revocable by the user. Mass-revoked on phone change, suspension and admin action.

### 2.5 `OtpChallenge`
`id`, `phone_e164`, `purpose` (`signup` | `login` | `phone_change` | `recovery`), `code_hash`,
`attempts`, `max_attempts`, `expires_at`, `consumed_at`, `ip`, `created_at`.
Never stores the plaintext code. Six digits, per `Onboarding.otpCells`.

### 2.6 `ActiveContext`
Purpose: which operating context the UI is in — `Importer Home` / `Trader Home` both carry a
`['import','buy']` switcher. Stored per session, not per user, because one person may have the
marketplace open on a phone and the trip open on a tablet.
`session_id`, `context` (`import` | `buy` | `shop`).
**Context never widens authorization.** It only selects navigation and the default home surface.
This is stated explicitly because treating it as an authorization input would be a privilege-
escalation bug disguised as a UX feature.

---

## 3. Profiles and verification

### 3.1 `ConsumerProfile`
Thin: `user_id`, `wilaya_code`. No storefront, no public page (audit §5).

### 3.2 `TraderProfile` — the legally load-bearing table
From `Seller Profile` and the trader verification ladder.

| Field | Notes |
|---|---|
| `user_id` | PK |
| `shop_name`, `bio`, `wilaya_code`, `business_address` | public storefront |
| `identity_verified` | L2 gate |
| `rc_verified` | commercial register verified — **the legal gate** |
| `nif_verified` | tax identification |
| `address_verified` | `Seller Profile.VERIFIED` shows all three |
| `suspended` | admin action |
| `listing_eligible` | **generated**: `identity_verified AND rc_verified AND nif_verified AND address_verified AND NOT suspended` |

Invariant (AD-017): `product_listings` has a composite FK onto `(user_id, listing_eligible)`,
so a listing row cannot exist for an ineligible seller. Revoking eligibility requires archiving
listings first — the failure is loud and audited by design.

### 3.3 `ImporterProfile`
From `Importer Profile` and the importer ladder.

`user_id`, `wilaya_code`, `display_specialities[]`, `identity_verified`, `anae_card_verified`,
`general_authorisation_verified`, `nif_verified`, `casnos_verified`, `suspended`,
`trips_completed`, `member_since`.

There is deliberately **no** `listing_eligible` analogue. An importer has a *trust profile*,
never a storefront (audit §5).

### 3.4 `VerificationCase`
The unit an admin works. From `Admin Console.ROWS.ver`.

`id`, `reference` (`VER-YY-NNNN`), `user_id`, `target_capability`, `kind`
(`first_verification` | `renewal` | `detail_change`), `state`
(`draft → submitted → under_review → needs_correction → approved | rejected`),
`submitted_at`, `sla_due_at`, `risk_band` (`low`/`mid`/`high`), `assigned_admin_id`.

`Admin Console` shows exactly these: title, subject, age, risk, SLA ("أقدم بند: 19 ساعة · الحدّ 24").

### 3.5 `VerificationDocument`
`id`, `case_id`, `user_id`, `doc_type`, `media_object_id`, `status`
(`uploaded → under_review → approved | needs_correction | rejected | expired | superseded`),
`issued_on`, `valid_until`, `reviewed_by`, `reviewed_at`, `correction_notes[]`.

`doc_type` enumerations taken verbatim from the two ladders:

| Importer | Trader |
|---|---|
| `national_id` | `national_id` |
| `liveness_selfie` | `liveness_selfie` |
| `anae_card` (بطاقة المقاول الذاتي — استيراد مصغّر) | `commercial_register` (السجل التجاري) |
| `general_authorisation` (الرخصة العامة) | `nif` (الرقم الجبائي) |
| `nif` | `business_address_proof` (عنوان النشاط) |
| `casnos` (الانتساب إلى CASNOS) | |

Which documents are required is **not** hard-coded: it is the regulatory rule
`required_documents_per_role` (AD-022). The lists above are today's value of that rule.

Invariants: a document is never overwritten — a replacement inserts a new row and marks the old
`superseded`. `valid_until` drives the expiry sweep. The binary is never served directly (§18 of
the brief); only status and `valid_until` are public, exactly as `Importer Profile.DOCS` shows.

### 3.6 Derived verification level (not a table)

```
L0  capability declared, phone verified
L1  + national_id approved AND liveness_selfie approved
L2-T + commercial_register AND nif AND business_address_proof, all approved and unexpired
L2-I + anae_card AND general_authorisation AND nif AND casnos, all approved and unexpired
L3  + confirmed_transactions >= 10 AND open_disputes = 0
```

Exposed as a computed field and materialised into `profile_levels` for indexing, recomputed in
the same transaction as any document status change and by the daily expiry sweep.

---

## 4. Commercial entities

The brief asks why these must not collapse into one `Order`. The answer is in the table:

| | Actor | Audience | Price shape | Lifecycle | Legal meaning |
|---|---|---|---|---|---|
| `ProductListing` | Trader (L2-T) | Public consumers | One shop price | publish / hide / archive | An offer to the public — **requires RC** |
| `SourcingRequest` | Trader (L2-T) | Verified importers | Target band | open → matched → committed → closed/expired | A B2B request for supply |
| `SourcingOffer` | Importer (L2-I) | The requesting trader | Proposed price + covered qty | offered → accepted/declined/withdrawn/expired | A response, may be partial |
| `Trip` | Importer (L2-I) | Verified traders | **No price**; three capacities | planning → collecting → travelling → customs → handover → closed | The importer's own regulated journey |
| `Commitment` | Both | The two parties only | Agreed band + validity | 7 stages + 3 terminals | A documented mutual agreement, not a sale |

Collapsing them would put a public consumer price, a B2B band, a regulated capacity and a
two-party agreement in one row, and would force the value cap — a legal limit on one person's
own money — into an entity visible to counterparties, breaking AD-021.

### 4.1 `Category`
`id`, `slug`, `parent_id`, `names` (ar/fr/en), `sort`, `placeholder_key`
(`ph-coat`, `ph-bag`, `ph-perfume`, `ph-shoe`, `ph-watch`, `ph-home`, `ph-elec` — the designed
placeholders in `tokens.css`), `restricted` (from regulatory config), `compliance_note_key`.

Seven top categories exist across `Marketplace.CATS` and `Trip Creation.CATS`.

### 4.2 `Product` and `ProductListing`

`Product` is the abstract item: `id`, `category_id`, `title`, `description`, `attributes`
(sizes, colours, material — `Product Detail.SPECS`), `origin_country`.

`ProductListing` is the trader's commercial offer:
`id`, `reference`, `product_id`, `seller_user_id`, `seller_listing_eligible` (always `true`,
CHECK-constrained, the composite-FK partner), `price_centimes`, `currency` (`DZD`),
`quantity_available`, `availability` (`in_stock` | `arriving_soon` | `on_order` — from
`Marketplace.FILTERS.avail`), `delivery_options[]` (`shop_pickup` | `within_wilaya` |
`outside_wilaya` — `Listing Composer.DELIVERY`), `state`
(`draft → in_review → published → hidden → archived | rejected`), `published_at`, `updated_at`.

Moderation is designed (`Listing Composer` `done` = "قيد المراجعة"), so `in_review` is a real
state, not a formality.

**Never on a listing:** any reference to the importer who carried the goods. `Listing Composer`
pre-publication checks include "لم تُذكر بيانات المستورد — جيّد" — this is a content rule
enforced at moderation, and a hard schema rule in that `product_listings` has no importer FK.

### 4.3 `Trip`

`id`, `reference`, `importer_user_id`, `destination_code`, `country_code`, `depart_on`,
`return_on`, `arrival_on`, `state`, `visibility`, `published_at`, `rule_version_id`.

`visibility` from `Trip Creation.VIS`: `all_verified_traders` | `my_category_traders` |
`known_counterparties`.

Stages from `Trip.STAGES`: `planning → collecting_demand → travelling → customs → handover`,
then `closed`. These are trip *stages*, distinct from commitment states.

`TripCategory`: `(trip_id, category_id)`.

`TripCapacity` — **three separate axes, never one number** (`Trip.CAPS`, audit §3):

| Axis | Source | Stored | Visible to counterparty |
|---|---|---|---|
| `value_cap_centimes` | **Regulatory** `max_value_per_trip`, resolved at publish, padlocked in the UI ("الحدّ القانوني") | `bigint` centimes | **No** (AD-021) |
| `weight_cap_grams` | User-defined ("حدودك أنت"), presets `حقيبتان 23 كغ` etc. | `integer` grams | Yes |
| `volume_cap_cm3` | User-defined | `integer` cm³ | Yes |

`TripCapacityLedger` — one row per capacity-consuming commitment:
`trip_id`, `commitment_id` (unique), `value_centimes`, `grams`, `cm3`, `released_at`.
Consumption is a sum over unreleased rows. Overbooking prevention is in `DATABASE-DESIGN.md` §6.

Trip count against `max_trips_per_month` ("الرحلة 1 من 2") is computed per calendar month from
published trips, resolved against the rule version effective then.

### 4.4 `SourcingRequest`
From `Sourcing Request` compose → sent → offers → agree.

`id`, `reference`, `trader_user_id`, `category_id`, `title`, `specification` (free text plus
hinted attributes: `المقاسات` / `الألوان` / `الخامة`), `quantity`, `target_band_min_centimes`,
`target_band_max_centimes`, `deadline_on`, `handover_wilaya_code`, `visibility`
(`all_verified_importers` | `selected_importers`), `selected_importer_ids[]`, `state`
(`draft → open → matched → committed → closed | expired | cancelled`), `expires_at`.

`Trader Home.REQS` shows exactly three surfaced states: `مفتوح` (open), `مطابَق` (matched, has
offers), `ملتزَم` (committed).

**Not an order.** It carries no payment field, no settlement, no fulfilment status of its own —
fulfilment lives on the `Commitment` it produces.

### 4.5 `SourcingOffer`
`id`, `request_id`, `importer_user_id`, `trip_id` (nullable — an offer may precede a published
trip), `proposed_price_centimes`, `quantity_covered` (**may be less than requested** — the design
shows an 80-of-120 partial offer), `arrival_on`, `note`, `state`
(`offered → accepted | declined | withdrawn | expired`), `expires_at`.

Invariant: at most one `accepted` offer per request; accepting one transitions the others to
`declined` in the same transaction.

### 4.6 `Commitment` — the centre of the record

`id`, `reference` (`CMT-YY-NNNN`), `trip_id` (nullable), `sourcing_request_id` (nullable),
`sourcing_offer_id` (nullable), `importer_user_id`, `trader_user_id`, `state`, `state_entered_at`,
`offer_expires_at`, `rule_version_id`, `created_at`.

`CommitmentTerms` — **snapshot, immutable once accepted** (from `Commitment.TERMS`):
`goods_description`, `specification`, `quantity`, `band_min_centimes`, `band_max_centimes`,
`band_tolerance_pct` (nullable — `Sourcing Request` shows `± 8%` as an alternative shape),
`band_valid_until`, `handover_wilaya_code`, `handover_on`, `weight_grams`, `volume_cm3`.

Amending terms after acceptance creates a **new terms version** referencing the old, and is
itself a transition — never an update. This is what `price_stability_rate` is measured against,
so a silent edit would corrupt a published metric.

`CommitmentTransition`: `commitment_id`, `from_state`, `to_state`, `actor_user_id` (or `system`),
`reason_code`, `note`, `occurred_at`, `idempotency_key`. Append-only.

`HandoverConfirmation`: `commitment_id`, `party` (`importer` | `trader`), `confirmed_at`,
`code_verified`, `photos[]`. **Both rows must exist** before `done` (AD-029).

`CommitmentDepositDeclaration` — **created but disabled** (AD-019):
`commitment_id`, `amount_centimes`, `declared_by_importer_at`, `declared_by_trader_at`,
`feature_version`. No custody field, no settlement field, no refund field — because Maabar never
holds it. Gated by `features.deposit_declaration`; endpoints return `FEATURE_DISABLED` while off.

### 4.7 `DemandSignal` and `DemandAggregate`

`DemandSignal` is the individual, identified interest: derived from open `sourcing_requests` and
from explicit interest recorded against a trip's buy list. It is visible only to the counterparty
it concerns (`Trip.BUYERS` names buyers to the trip owner).

`DemandAggregate` is the anonymous projection behind `Demand Board`:
`category_id`, `wilaya_code`, `period`, `confirmed_count`, `interested_count`,
`band_min_centimes`, `band_max_centimes`, `market_track_min`, `market_track_max`,
`basis_request_count` ("مبنيّة على 214 طلباً"), `computed_at`.

Privacy invariant: an aggregate cell is published only when `basis_request_count >= k`
(proposed `k = 5`) and, within a cell, no single trader contributes more than a configured share.
Without this, "confirmed: 95 in Sétif" plus a small market re-identifies a specific trader's order.

`Demand Board` also carries per-item planning inputs the importer uses to build a buy list:
`unit_cost_centimes`, `unit_weight_grams`, `unit_volume_cm3`. These are estimates owned by the
aggregate, not commitments.

---

## 5. Interaction entities

### 5.1 `Conversation`, `ConversationParticipant`, `Message`
`Conversation`: `id`, `context_type` (`listing` | `sourcing_request` | `trip` | `commitment` |
`dispute`), `context_id`, `state` (`open` | `locked` | `archived`), `created_at`, `last_message_at`.
One conversation per (context, participant pair).

`ConversationParticipant`: `conversation_id`, `user_id`, `role_in_context`, `last_read_message_id`,
`muted`, `blocked_at`. Unread counts derive from `last_read_message_id` — no counter to drift.

`Message`: `id`, `conversation_id`, `sender_user_id` (nullable for system), `kind`
(`text` | `action_card` | `system`), `body`, `attachments[]`, `created_at`, `edited_at` (null —
messages are not editable), `redacted_at` (moderation only, leaves a tombstone).

`MessageAction` — the structured cards (AD-027, from `Messages`):

| `action_type` | Card | Payload | Effect on accept |
|---|---|---|---|
| `propose_agreement` | "الاتفاق المقترح" | goods, quantity, band, deadline, handover | creates or advances a `Commitment` to `proposed`/`accepted` |
| `confirm_handover` | "وصلت البضاعة — أكّد الاستلام" | delivered qty, pickup point, 6-digit code | inserts a `HandoverConfirmation`; both ⇒ `done` |

`state`: `pending` | `accepted` | `declined` | `superseded` | `expired`.
Effects are transactional with the message insert.

Quick templates (`أؤكّد المواصفة`, `أقترح سعراً`, `أبلغ عن تأخير`, `أطلب صوراً`) are i18n
message keys, not entities.

### 5.2 `Review` and `ReviewReply`
`Review`: `id`, `subject_user_id`, `author_user_id`, `source_type`
(`commitment` | `consumer_transaction`), `source_id`, `body`, `created_at`,
`moderation_state` (`visible` | `removed_by_moderation`), `moderation_decision_id`.

Invariants (AD-023): `UNIQUE (author_user_id, source_id)`; `source` must be a completed record;
no `DELETE` grant; removal is an audited moderation decision that leaves the row and shows a
tombstone. **No rating column** — the designed reviews are prose only, and adding stars would be
the composite score AD-020 forbids, by the back door.

`ReviewReply`: `review_id` (unique — exactly one reply), `author_user_id` (must be the subject),
`body`, `created_at`. Always rendered with the review.

### 5.3 `Dispute`
From `Dispute`: `id`, `reference`, `commitment_id`, `opened_by_user_id`, `kind`
(`spec_mismatch` | `quantity_short` | `late_delivery` | `no_delivery` | `price_changed`),
`desired_outcome` (`replace` | `partial_settlement` | `record_only`), `description`, `state`
(`submitted → under_review → needs_more_evidence → decided | withdrawn`), `opened_at`,
`decided_at`, `decision_id`.

`DisputeEvidence`: `dispute_id`, `submitted_by`, `media_object_id`, `caption`, `created_at`, plus
**auto-bundled references** (`Dispute.ATTACHED`): the recorded `CommitmentTerms` version, the full
conversation, and timestamped handover photos. Bundling is by reference, not by copying.

Effects on the record, verbatim from the design: the dispute is recorded on **both** parties'
records and reflected in the specification-match figure; a dispute is **not** counted against the
opener's own completion rate; an agreed remedy (e.g. "replace 6 pieces on the next trip") is
recorded as a decision outcome.

### 5.4 `SavedItem`
`user_id`, `item_type` (`listing` | `seller` | `importer` | `trip`), `item_id`, `created_at`.
Unique per `(user_id, item_type, item_id)`.

`Saved` demands change-tracking, so saving subscribes the user to a watch:
price drop (`was` → `now`), low stock ("بقيت 3 وحدات"), unavailable ("لم يعد متوفراً"),
seller added products, importer published a trip, trip expired. These are notification triggers,
not extra entities — see `NOTIFICATIONS.md` §3.

### 5.5 `Notification`
`id`, `user_id`, `kind`, `payload`, `context_type`, `context_id`, `created_at`, `read_at`,
`priority`. Deliveries tracked separately per channel in `notification_deliveries`.

---

## 6. Reputation — facts, with their inputs

`Importer Profile.SHEETS` is a complete specification. Each metric is a materialised row that
carries its own numerator, denominator and exclusions, so the "how was this calculated" sheet is
a read, not a recomputation.

### 6.1 `ReputationFact`
`subject_user_id`, `metric`, `window` (`all_time` | `last_90d`), `value_numeric`,
`value_display_kind`, `inputs` (jsonb), `computed_at`, `source_version`.

| Metric | Definition (from the design) | Stored inputs |
|---|---|---|
| `confirmed_transactions` | Commitments both parties confirmed. Never inflated by activity alone | `count` |
| `completion_rate` | Delivered within the agreed deadline ÷ all accepted commitments | `accepted`, `on_time`, `late`, `cancelled_by_subject`, `excluded_customs_hold` |
| `median_response_time` | **Median** (explicitly not mean) first-response time to a new message, last 90 days | `incoming`, `replied`, `median_minutes`, `unanswered` |
| `price_stability_rate` | Commitments whose final price stayed inside the band declared at agreement | `with_band`, `within`, `outside`, `avg_deviation_pct` |
| `spec_match` | Reflected by dispute outcomes of kind `spec_mismatch` | `disputed_spec`, `upheld` |

Two exclusion rules are part of the specification and must be implemented, not inferred:

- **A documented customs hold does not count against the importer.** "القرار ليس بيده."
- **Median, not mean, for response time**, so one slow case cannot distort it.

`confirmed_transactions >= 10` with no open dispute is also the L3 gate (§3.6), which is why this
must be a real materialised fact and not a view computed ad hoc.

---

## 7. Administration, audit, regulation, billing

### 7.1 `AdminUser`
Separate from `Capability` by design: admin power is not something a user declares about
themselves. `id`, `reference` (`ADM-NNN`, shown in `Admin Console.HISTORY`), `user_id` (nullable —
an admin may have no consumer account), `roles[]`
(`trust_safety` | `moderation` | `disputes` | `compliance` | `regulatory` | `billing` | `superadmin`),
`status`, `mfa_enrolled` (mandatory).

### 7.2 `AdminDecision` — the reusable primitive
One table serves all five queues (audit §4 justifies not building five architectures).

`id`, `queue`, `subject_type`, `subject_id`, `admin_user_id`, `action`, `reason_code`
(mandatory, from `decision_reasons`), `reason_text`, `user_facing_consequence`,
`supersedes_decision_id`, `decided_at`, `evidence_snapshot` (jsonb).

The `Admin Console` flow — queue → evidence → decision → **mandatory reason** → user-facing
consequence → immutable audit — is exactly these columns. `user_facing_consequence` is stored,
not generated at display time, so what the user was told is part of the record.

### 7.3 `AuditLog`
`id`, `stream` (e.g. `commitment:<id>`, `user:<id>`), `seq`, `actor_type`, `actor_id`, `action`,
`resource_type`, `resource_id`, `from_state`, `to_state`, `reason`, `context` (jsonb, includes
`request_id`), `occurred_at`, `prev_hash`, `hash`. Append-only, monthly partitions (AD-037).

Answers the required questions: who · did what · to which resource · when · from what state ·
to what state · why · with which context.

### 7.4 `RegulatoryRule` / `RegulatoryRuleVersion`
See `REGULATORY-ENGINE.md`. Summary: a rule is a stable key; a version carries value, unit,
effective window, source citation, status and approvals. Nothing reads a rule without an `as_of`.

### 7.5 Billing — deliberately disconnected
Separate `billing` schema (AD-018): `plans`, `subscriptions`, `subscription_periods`,
`billing_receipts` (CCP/BaridiMob uploads), `payment_attempts` (SATIM/CIB).
**No foreign key crosses into `app`** except `subscriptions.user_id`, which is a plain uuid with
no FK, so a join to commercial data cannot be written accidentally.

---

## 8. Entities deliberately **not** created

| Candidate | Verdict | Reason |
|---|---|---|
| `Order` | **Rejected** | AD-025. Five distinct lifecycles with different actors, audiences and legal meanings |
| `Payment`, `Escrow`, `Wallet`, `Transaction` (money) | **Rejected** | Maabar handles no goods money. Creating the table invites the feature |
| `TrustScore` | **Rejected** | AD-020 |
| `Rating` (numeric on reviews) | **Rejected** | A star average is a composite score wearing a disguise; the designed reviews are prose plus reply |
| `Role` (as a user column) | **Rejected** | AD-014, AD-047 |
| `Cart`, `Checkout`, `Shipment`, `CustomsDeclaration` | **Rejected** | Outside the product boundary (`Landing.limits`) |
| `ConsumerProfile` as a full screen-backed entity | **Reduced** | Audit §4: standard account settings, no Maabar-specific decision. Kept as a thin row |
| `RequestsList`, `CommitmentsList` | **Not entities** | Filtered views over existing tables (audit §4) |
| `GroupSourcingRequest` | **Deferred** | AD-041. Appears once as an opportunity card with no flow; modelled in schema, not built |
| `PriceIndex` | **Deferred** | AD-042. Publishing a market price signal needs rules the design does not give |
| `Notification` templates as rows | **Rejected** | They are i18n catalogue keys, not data |

---

## 9. Entity relationship summary

```
User 1─* Capability            User 1─1 {Consumer|Trader|Importer}Profile
User 1─* Session 1─1 ActiveContext
User 1─* PhoneIdentity
User 1─* VerificationCase 1─* VerificationDocument *─1 MediaObject

TraderProfile ═════FK(user_id, listing_eligible)═════ ProductListing *─1 Product *─1 Category
                                                       ProductListing 1─* ListingMedia

ImporterProfile 1─* Trip 1─* TripCategory
                     Trip 1─1 TripCapacity
                     Trip 1─* TripCapacityLedger *─1 Commitment

TraderProfile 1─* SourcingRequest 1─* SourcingOffer *─1 ImporterProfile
                  SourcingRequest 1─0..1 Commitment ─0..1 SourcingOffer

Commitment 1─* CommitmentTerms(version)   1─* CommitmentTransition
           1─* HandoverConfirmation (exactly 2 to reach `done`)
           1─0..1 CommitmentDepositDeclaration      [feature-flagged OFF]
           1─0..1 Dispute 1─* DisputeEvidence
           1─* Review 1─0..1 ReviewReply

Conversation(context_type, context_id) 1─* ConversationParticipant
                                       1─* Message 1─0..1 MessageAction

SourcingRequest ──projection──▶ DemandAggregate     (anonymised, k-thresholded)
User 1─* SavedItem ──watch──▶ Notification
User 1─* ReputationFact

AdminUser 1─* AdminDecision ──▶ AuditLog (append-only)
RegulatoryRule 1─* RegulatoryRuleVersion ◀── Trip · Commitment · Compliance

billing.Subscription ──user_id, no FK──╴ (deliberately unjoined)
```
