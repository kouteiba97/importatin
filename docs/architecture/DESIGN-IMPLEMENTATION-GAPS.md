# Maabar — Design → Implementation Gap Audit

Every gap found while reading the 24 artboards and their `<script type="text/x-dc">` data tables
against a real implementation path.

**This is not a redesign.** Nothing below changes a drawn screen, a flow or a product decision.
Each entry names a place where the design assumes data, a capability or a state that the
architecture must supply, and recommends the smallest resolution consistent with the approved
design and the settled boundaries.

**Severity:**
`P0` — blocks implementation of an approved screen · `P1` — needed before launch ·
`P2` — needed before the feature is useful at scale · `P3` — note, no action at MVP

---

## Summary

| # | Gap | Priority |
|---|---|---|
| G1 | The ledger and `price_stability_rate` need a **final price** Maabar has no defined source for | **P0** |
| G2 | `Compliance Checker` has **no "unknown goods" state** | **P0** |
| G3 | `Demand Board` unit cost / weight / volume estimates have no stated origin | **P0** |
| G4 | `Saved` price-drop detection needs price history that nothing records | **P1** |
| G5 | "صورة حيّة مطابقة" implies liveness detection; only manual comparison is drawn | **P1** |
| G6 | Handover code is drawn inside a chat message, i.e. persisted in history | **P1** |
| G7 | Importer sourcing-request permission: two approved sources conflict | **P1 (blocking Phase 5)** |
| G8 | Subscription expiry has no drawn consequence | **P1** |
| G9 | `Trip.BUYERS` sub-states are not in the commitment machine | **P2** |
| G10 | Customs duty in the ledger is computed on a customs value Maabar does not hold | **P2** |
| G11 | Art. 14 label sheet (24/page) needs a print or PDF pipeline | **P2** |
| G12 | Group sourcing request appears once with no flow behind it | **P2** |
| G13 | Reference price index has no stated methodology | **P2** |
| G14 | Four live scope counts on every search | **P3** |
| G15 | Desktop layouts exist only for admin | **P3** |
| G16 | Product imagery is placeholders | **P3** |
| G17 | Mixed Arabic register (darija and MSA) must be preserved, not "corrected" | **P3** |

---

## G1 — The ledger and price-stability metric need a final price · **P0**

**Design requirement.**
`Records` draws a ledger with exact amounts: `بيع — معاطف نسائية · + 312 000`,
`استيراد — رحلة إسطنبول · − 560 000 · رسم جمركي 5%`. Separately, `Importer Profile` publishes
**ثبات السعر 95%**, defined in its own sheet as *"commitments whose final price stayed inside the
band declared at the time of agreement"*, with inputs `{with_band: 80, within: 76, outside: 4,
avg_deviation_pct: 6}`.

**Technical issue.**
A `Commitment` records a **price band**, never a settled price (AD-032), because Maabar is not a
party to the sale and never handles goods money. There is therefore no field anywhere in the
approved model from which either the ledger amounts or "the final price" can be derived. The
metric measures a quantity the system has no defined way to learn.

This is the single most consequential gap in the deck: `price_stability_rate` is a **published
trust figure**, and the audit requires every published figure to be traceable to raw inputs
(settled decision 3). A figure computed from an undefined input would violate that directly.

**Impact.**
Without a resolution: the ledger cannot be populated, and `price_stability_rate` is either
unimplementable or — worse — silently invented. High.

**Recommended solution.**
Capture the final price as a **declared fact from both parties at handover**, not as a payment
record:

1. Extend the `confirm_handover` action card with one optional field, `final_unit_price_centimes`,
   pre-filled with the band midpoint. Both parties already confirm handover (AD-029), so both
   already touch this step — no new screen, no new interaction.
2. Store it on `handover_confirmations`, per party. Agreement between the two parties makes the
   figure `corroborated`; a single declaration makes it `declared`; silence makes it `unknown`.
3. `price_stability_rate` counts **only corroborated commitments** in its denominator. Its stored
   `inputs` already carry `with_band`, which becomes "commitments with a corroborated final price
   and a declared band" — the exclusion is visible in the sheet, exactly as the customs-hold
   exclusion is.
4. The ledger is the **importer's own bookkeeping**, editable by them, pre-filled from corroborated
   figures. `Records` is already a private, owner-only surface, and its subscription line is
   already marked with a distinct `fee` kind — the ledger is a notebook, not an account.

**Why this is not payment handling.** Nothing is transferred, held, guaranteed or reconciled. Both
parties state what happened, the same way they state that goods were handed over. Maabar records
an assertion, which is what it does everywhere else.

**Confirm with product** that declaring a final price is acceptable, or accept the alternative:
drop `price_stability_rate` from published facts. Do not implement it from an inferred value.

---

## G2 — `Compliance Checker` has no "unknown goods" state · **P0**

**Design requirement.**
A free-text field ("مثال: عطور نسائية 100 مل") returning a verdict. The artboard draws exactly one
verdict — `مسموح بشرط` / conditional — with fixed glyph and colours, plus quick chips.

**Technical issue.**
There is no drawn state for goods absent from the catalogue, and none for an ambiguous match. A
public tool with a free-text input will receive unmatched queries constantly, and this is a
**legal** surface: guessing a verdict for unknown goods is the worst possible failure.

The audit's §7 state-coverage table lists `Search` as carrying empty and error states; the
compliance screen is not covered there.

**Impact.**
The primary public acquisition surface has an undefined path for a common input. High, and legally
sensitive.

**Recommended solution.**
Add one state using components the deck already contains, with no new visual language:

- **Unknown** — neutral chip (`chip-neutral`, never `allowed` or `prohibited`), copy to the effect
  of *"we do not have a verdict for these goods"*, the existing quick chips as a route out, and the
  standing customs disclaimer, which is already on every response.
- Resolution order: exact match → normalized Arabic match (`DATABASE-DESIGN.md` §8) → category
  match returning a **category-level** verdict clearly labelled as such → unknown.
- Unmatched queries are logged (query text only, no identity) into the existing
  `أصناف تحتاج مراجعة` admin queue, so the catalogue grows from real demand.

**Never** fall back to "allowed" for an unmatched query.

---

## G3 — Demand Board unit estimates have no stated origin · **P0**

**Design requirement.**
`Demand Board` items carry `unitCost`, `w` (weight per unit) and `v` (volume per unit) —
e.g. coats at `2600` DZD, `0.8` kg, `0.004` m³ — and the buy-list capacity meters multiply them by
quantity to drive all three axes and the blocked state *"لا يتّسع في المتبقّي"*.

**Technical issue.**
These are purchase-side estimates at the foreign destination. They are not a trader's demand price,
not a listing price, and not a commitment band. Nothing in the approved model produces them.

**Impact.**
The buy-list — the core function of the importer's main working screen — cannot compute anything
without them. High.

**Recommended solution.**
Treat them as **category-level planning estimates owned by the aggregate**, sourced in this order:

1. Median of corroborated final unit prices for that category and destination over the last 90 days
   (available once G1 is resolved), with a minimum sample of 5.
2. Otherwise an **admin-curated category default**, maintained in the existing
   `أصناف تحتاج مراجعة` compliance/category queue.
3. Weight and volume per unit are physical attributes of the category and are **always**
   admin-curated defaults — they do not vary by market.

Label them as estimates in the API payload (`estimate_basis: "median_90d" | "curated"`) so the
client can render provenance, consistent with how every other figure in this product carries its
basis. Never present an estimate with the visual weight of a recorded fact.

---

## G4 — Saved price-drop detection needs price history · **P1**

**Design requirement.**
`Saved` shows `نزل السعر 500 دج` with both the previous and current price, and
`بقيت 3 وحدات` for low stock.

**Technical issue.**
`product_listings` holds only the current price and quantity. Nothing records the price at the
moment of saving, and nothing records a change history, so "it dropped by 500" is not computable.

**Impact.**
A drawn feature on a drawn screen cannot be built. Medium.

**Recommended solution.**
Two small additions, no new screen:

- `saved_items.price_at_save_centimes` and `quantity_at_save` — snapshot on save.
- `listing_price_changes (listing_id, from_centimes, to_centimes, changed_at)` — append-only,
  written by the listing update path. It also feeds the `saved.price_drop` notification
  (`NOTIFICATIONS.md` §2.3) and gives moderation a record of price manipulation.

Comparison is against the snapshot, which is what the user actually experienced.

---

## G5 — "صورة حيّة مطابقة" implies liveness detection · **P1**

**Design requirement.**
Importer and trader L2 both require `بطاقة التعريف الوطنية` **and** `صورة حيّة مطابقة` — a live
photo matching the ID. `Admin Console` evidence shows the national ID annotated
`مطابقة للصورة الحيّة` (matches the live photo).

**Technical issue.**
"Live" implies anti-spoofing. The admin annotation implies **manual human comparison**, which can
detect a mismatched face but cannot detect that the selfie was a photograph of a photograph.
Automated liveness means a biometric vendor — which raises a data-residency problem (design §9.4
requires documents stored in Algeria) and an ANPDP question (§9.4) that is already open.

**Impact.**
Either the anti-spoofing claim is weaker than the word "حيّة" suggests, or a vendor decision is
needed that touches an unresolved legal question. Medium, and it bears on T4 (fake verification).

**Recommended solution — MVP:** manual comparison, as the admin console draws, plus cheap
client-side capture controls that raise the cost of the simplest attacks: camera-only capture with
no gallery upload, a randomised head-turn or blink prompt captured as a short sequence, and EXIF
and device checks on the worker. Record the method used on the verification decision so the
assurance level is auditable.

**V1:** evaluate a liveness vendor **only** against the residency and ANPDP answers. Do not
procure before §9.4 is resolved.

Do not describe the MVP control as "biometric verification" in any user-facing copy — it is
document-to-photo comparison by a reviewer, and the trust vocabulary in `tokens.css` is careful
about exactly this kind of overclaim.

---

## G6 — The handover code is drawn inside a chat message · **P1**

**Design requirement.**
`Messages` handover card shows `رمز التأكيد 4 7 2 9 1 6` as a row inside the conversation.

**Technical issue.**
Messages are a permanent record and are bundled into dispute evidence (`Dispute.ATTACHED`
auto-attaches "your full conversation"). A secret stored in message content persists after use,
travels into evidence bundles seen by admins, and would appear in any future export.

**Impact.**
A single-use secret leaks into a long-lived record. Medium, and it undermines the control that
stops an importer self-confirming delivery.

**Recommended solution.**
Store only `handover_codes.code_hash` (already in `DATABASE-DESIGN.md` §6). The message carries
`code_required: true`, **not the code**; the client fetches the plaintext from a live, authorised
endpoint and renders it into the card. After consumption or expiry the endpoint returns nothing and
the card renders "code used". Visually identical to the artboard; the secret never enters message
history or an evidence bundle.

---

## G7 — Importer sourcing-request permission: sources conflict · **P1, blocking Phase 5**

**Design requirement.**
`Verification` importer ladder, L2: `unlocks: ['ملف عام', 'نشر طلب توريد']`.
`DESIGN-AUDIT.md` §5: *"Create a sourcing request — Micro-importer: ⚠️ only when acting as trader."*

**Technical issue.**
Two approved sources disagree on a permission that decides whether an importer may source from
another importer without a commercial register — which touches the open §9.1 Law 18-05 question.

**Impact.**
The authorization matrix for `/sourcing-requests` cannot be frozen. Blocks Phase 5; does not block
Phases 0–4.

**Recommended solution.**
Implement the audit's stricter reading (`capability:trader` + `L2-T`) until product and counsel
answer, because the stricter reading cannot create an exposure the looser one would. Tracked as
AD-044 and as the single blocking question in `TECHNICAL-BLUEPRINT.md` §36.1.

---

## G8 — Subscription expiry has no drawn consequence · **P1**

**Design requirement.**
`Records` subscription tab shows plan, days remaining, expiry date, plans and payment methods.

**Technical issue.**
No screen, state or copy anywhere says what stops working when a subscription lapses. The audit's
role matrix lists billing as a capability but does not gate any other capability on it.

**Impact.**
A revenue-critical behaviour is undefined, and the wrong guess either breaks obligations to
counterparties or gives the product away. Medium.

**Recommended solution.**
Default until answered (AD-043): block capability-gated **creation** — publishing a trip, creating
a sourcing request, proposing a commitment — while leaving browsing, messaging, in-flight
commitments, handover, disputes and reviews fully available. Never interrupt an obligation to a
counterparty over the subscriber's billing status; the counterparty is not a party to that
relationship.

A `grace` state already exists in the machine (`STATE-MACHINES.md` §2.9), with length as
configuration.

---

## G9 — Trip buyer sub-states are not in the commitment machine · **P2**

**Design requirement.**
`Trip.BUYERS` shows per-buyer meta: `وافق على النطاق` (agreed to the band) and
`بانتظار المواصفة` (awaiting the specification).

**Technical issue.**
Neither is a commitment state. They are a finer reading of the same commitment.

**Impact.**
Low — a display mapping, not a missing capability.

**Recommended solution.**
Derive, do not store:
`accepted` → *agreed to the band*; `proposed` with incomplete `specification` → *awaiting
specification*; `proposed` with complete terms → *awaiting acceptance*. Exposed as a computed
`buyer_status` on the owner-only buy-list payload.

---

## G10 — Customs duty is computed on a value Maabar does not hold · **P2**

**Design requirement.**
`Records` ledger line: `استيراد — رحلة إسطنبول · − 560 000 · رسم جمركي 5%`.

**Technical issue.**
The rate is regulatory configuration (`customs_duty_rate`, AD-022), but the base is the declared
customs value, which is established at `anae.dz` and at customs — not by Maabar, which never files
(settled decision 9).

**Impact.**
Low, and shrinking once G1 is resolved, but it must not be presented as authoritative.

**Recommended solution.**
Compute an **indicative** figure from the importer's own declared purchase total, label it as
indicative in the same voice the compliance checker uses, and allow the importer to overwrite it
with the actual figure from their customs paperwork. The ledger is their notebook; Maabar supplies
arithmetic, not a customs position.

---

## G11 — Art. 14 label sheet needs a print pipeline · **P2**

**Design requirement.**
`Records` labels tab: importer name, address, goods, country of origin, plus a goods note, with
`اطبع N ورقة` at 24 labels per sheet.

**Technical issue.**
Browser printing of a precise grid is unreliable across mobile browsers, and these labels are a
**regulatory artefact** (Art. 14 labelling), so layout fidelity matters.

**Impact.**
Low-to-medium — the feature exists but may print wrongly on the devices most importers use.

**Recommended solution.**
Server-generated PDF at a fixed A4 grid, delivered through the standard signed-URL path. Deterministic
across devices, and reprintable. The design's `missingAddr` flag already covers the refusal case
when the profile has no address; keep that as a hard block, since a label without an address does
not satisfy the requirement it exists for.

---

## G12 — Group sourcing request appears once, with no flow · **P2**

**Design requirement.**
`Trader Home.OPPS`: *"انضمّ إلى طلب جماعي — عطور · 7 تجّار في وهران يجمعون 210 وحدة للوصول إلى سعر
أفضل"*, CTA *"اطّلع وانضمّ"*.

**Technical issue.**
No dedicated screen, no lifecycle, no entry in the audit's screen inventory, entity list or
journeys. Joining raises real questions the deck does not answer: who owns the pooled request, who
accepts an offer on behalf of seven traders, how the quantity is apportioned, what happens when one
participant withdraws, and how a single commitment can have seven trader-side parties when
`commitments` has exactly one.

**Impact.**
Medium — an attractive feature, but building it from one card means inventing product.

**Recommended solution.**
Defer (AD-041). The opportunity feed renders without the card at MVP. If product wants it, it needs
its own design pass covering ownership, apportionment and withdrawal — the commitment model would
need either a request-level group with per-trader child commitments, or a nominated lead trader.
Do not improvise either.

---

## G13 — Reference price index has no methodology · **P2**

**Design requirement.**
`Trader Home.OPPS`: *"الأحذية الرجالية: النطاق نزل ⁦8%⁩ · النطاق في سطيف صار 3 500 – 4 900 دج ·
مبنيّ على 34 معاملة مؤكَّدة · آخر 90 يوماً"*.

**Technical issue.**
Minimum sample size, outlier handling, the geographic and category grain, update cadence and
anti-gaming rules are all unspecified — and it depends on the same final-price input as G1.
Publishing a market price signal from thin data is a real harm: it moves prices for people whose
capital is already frozen.

**Impact.**
Medium.

**Recommended solution.**
Defer to V1 (AD-042) with a published methodology, a minimum sample (34 in the mock is plausible;
below ~20 it should not publish), trimmed means or medians, and a per-contributor share cap so one
large trader cannot move the index. Consistent with the settled decision that every published
figure must be decomposable into its inputs.

---

## G14 — Four live scope counts on every search · **P3**

`Search` shows counts per scope (products 128 · traders 14 · importers 9 · trips 4). That is four
`COUNT` queries per keystroke-completed search. Negligible at this corpus size; if it ever bites,
cap counts at a threshold and render `+99`, which is standard and changes nothing visually. No
action at MVP.

---

## G15 — Desktop layouts exist only for admin · **P3**

Named by the audit itself (§12, P1). Mobile-first layouts will stretch awkwardly on desktop,
particularly `Marketplace`, `Product Detail` and `Seller Profile` — the three surfaces most likely
to be opened from a search engine on a laptop. Mitigation at MVP: a max-width container and a
responsive grid on the public tier only, which is a layout change, not a redesign. Full desktop
treatment stays P1 as the audit scheduled it.

---

## G16 — Product imagery is placeholders · **P3**

The audit flags this (§12, P1: *"Needed before the client demo"*). Not a technical gap: the
placeholders are designed, live in `tokens.css` as data-URI SVGs, and behave correctly. Traders
supply real photography, and `tokens.css` states the principle — *"Maabar never supplies product
imagery, because Maabar never owns goods."* The launch dependency is content and trader
onboarding, not engineering.

---

## G17 — Mixed Arabic register must be preserved · **P3**

**Observation.** The deck deliberately mixes registers: Algerian darija in conversational surfaces
(`Messages`: "واخّا"، "راني نخطّط"، "ما نشريش"؛ `Consumer Home`: "نبحث على"؛ `Commitment`: "تقدر
دابا") and modern standard Arabic in legal, compliance and admin surfaces.

**Technical issue.** A translation or copy-editing pass that "corrects" darija to MSA would destroy
a deliberate voice decision — the product speaks the way its users speak where it is being
friendly, and speaks formally where it is being legal.

**Impact.** Low, but irreversible in practice once a catalogue is normalised.

**Recommended solution.** Record the register per namespace in the i18n catalogue
(`register: "darija" | "msa"`) and state it in the translator brief. Compliance, verification,
regulatory and admin namespaces are MSA; messaging, home and marketplace conversational copy keeps
darija.

---

## What is **not** a gap

Checked and found complete — recorded so nobody re-opens them:

| Area | Finding |
|---|---|
| Commitment lifecycle | Fully specified, including the optional `secured` stage and all three terminals |
| Verification ladders | Both roles, all eight document-journey states, expiry freeze rules explicit |
| Three-axis capacity | Fully specified, including which axis is private and why |
| Reputation metrics | Each with numerator, denominator and exclusions — more precisely specified than most shipped products |
| State coverage | Loading, empty, no-results, error, offline, pending, needs-correction, rejected, expired, cancelled, disputed, blocked, partial, success, needs-action all drawn |
| RTL and bidi | Complete, with the two real failure cases already caught and fixed in the token layer |
| Admin pattern | Queue → evidence → decision → reason → consequence → audit, fully drawn |
| Legal boundary | Taught in-product via the `Listing Composer` blocked state, with alternatives |
| Payment separation | Stated on every listing, on `Consumer Home`, and in the `Landing` limits block |

The deck is unusually implementable. Of seventeen gaps, three are P0, and all three are *missing
data sources* rather than missing design — which is the right kind of gap to find at this stage.
