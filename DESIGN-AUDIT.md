# Maabar — Final Design Audit
**Phase:** Pre-build gate
**Date:** 14 September 2026
**Scope:** design only — no application code exists yet
**Verdict:** **READY FOR DEVELOPMENT**, with one conditional hold (§9)

---

## 1. VERDICT

Every P0 user journey is designed and coherent. A developer can begin implementation without making product decisions during coding.

**One module is held pending legal sign-off:** the *deposit declaration* inside Commitment (§9.2). Everything around it is buildable; that single field and its copy must not be implemented until an Algerian lawyer rules on it. The design is structured so this is a feature flag, not a rewrite.

| Gate item (§24) | Status |
|---|---|
| Marketplace · Product Listing · Product Detail · Seller Profile | ✅ |
| Importer Discovery · Trip Discovery · Search | ✅ |
| Consumer · Trader · Importer experiences | ✅ |
| Onboarding · KYC upload journey · Trust ladder | ✅ |
| Trip creation · Sourcing request · Commitment lifecycle | ✅ |
| Messaging lifecycle · Dispute flow · Saved | ✅ |
| Compliance progressive disclosure | ✅ |
| Billing / trade-payment separation | ✅ |
| RTL complete · LTR architecture proven | ⚠️ see §8 |
| Mobile states | ✅ |
| Legal uncertainties documented | ✅ §9 |
| Role / capability matrix | ✅ §5 |

---

## 2. WHAT WAS ADDED THIS PHASE

Eleven new screens closing every remaining P0/P1 gap.

| Screen | Closes |
|---|---|
| **Onboarding** | Phone → OTP → profile → capability selection → done. One identity, multiple contexts |
| **Verification** | Trust ladder **for both importer and trader**, plus the full document journey: requirement → capture → preview → upload → under review → needs correction → approved → expired |
| **Seller Profile** | The public trader storefront the marketplace links to |
| **Sourcing Request** | Compose → published → offers → agreement |
| **Trip Creation** | Destination → categories → three-axis capacity → visibility → review → published |
| **Listing Composer** | How a listing is created, imaged, previewed, moderated — including the **blocked state for importers** |
| **Search** | Scoped results across products/traders/importers/trips, with loading, empty, error, offline |
| **Saved** | Products, sellers, trips — with price-drop, low-stock, unavailable, expired, empty |
| **Consumer Home** | Low-density discovery distinct from Marketplace |
| **Commitment** | Full lifecycle with eight states including disputed, cancelled, expired |
| **Dispute** | Issue type → evidence → submitted → under review → needs more → decision |

**Deck: 24 screens**, all on one token file, all Arabic-first RTL.

---

## 3. WHAT CHANGED

- **Verification became role-aware.** One journey, two document sets. The trader ladder ends in the capability the importer can never hold — publishing a consumer-facing listing.
- **Listing Composer carries an explicit blocked state.** An importer who reaches it is told plainly that public listing requires a commercial register, and shown what they *can* do instead. The legal boundary is taught in the product, not buried in terms.
- **All numbers are LTR-isolated at the formatter.** See §7.
- **Trip Creation separates the three capacity axes visually** — the legal value cap is locked with a padlock and labelled "الحدّ القانوني"; weight and volume are editable and labelled "حدودك أنت".

---

## 4. SCREEN INVENTORY — 24

### Public / Consumer
`Landing` · `Consumer Home` · `Marketplace` · `Search` · `Product Detail` · `Seller Profile` · `Saved` · `Compliance Checker`

### Importer
`Importer Home` · `Demand Board` · `Trip` · `Trip Creation` · `Records` · `Importer Profile`

### Trader
`Trader Home` · `Discover` · `Sourcing Request` · `Listing Composer`

### Shared
`Onboarding` · `Verification` · `Messages` · `Commitment` · `Dispute`

### Admin
`Admin Console`

**Deliberately not built, with reasons:**

| Not built | Why |
|---|---|
| Separate *Requests list* and *Commitments list* | Both are filtered lists of objects whose detail screens exist. The list pattern is established in `Trader Home` and `Saved`; drawing two more would add no product decision |
| Consumer *Profile* screen | Standard account settings. No Maabar-specific decision in it |
| Per-queue admin workspaces (risk, moderation, disputes, compliance, billing) | All five share the queue → evidence → decision → reason → consequence → audit layout already drawn for verification. Only the evidence panel contents differ, and those are listed in §6 |
| Analytics | Not a P0 journey. Market-health metrics are specified in `DESIGN-AUDIT.md` §18 |

---

## 5. ROLE / CAPABILITY MATRIX

Roles are **capabilities on one identity**, not separate accounts. A user may hold several.

| Capability | Consumer | Trader | Micro-importer | Notes |
|---|:--:|:--:|:--:|---|
| Browse marketplace & search | ✅ | ✅ | ✅ | No account needed to browse |
| Save products / sellers / trips | ✅ | ✅ | ✅ | Requires L1 |
| Message a counterparty | ✅ | ✅ | ✅ | Requires L1 |
| Contact a seller / ask availability | ✅ | ✅ | ✅ | |
| **Publish a consumer-facing listing** | ❌ | ✅ **L2-T only** | ❌ **never** | The structural legal rule. Enforced at schema level, not UI |
| Public storefront profile | ❌ | ✅ | ❌ | Importers have a *trust profile*, not a storefront |
| Create a sourcing request | ❌ | ✅ | ⚠️ only when acting as trader | |
| Discover trips | ❌ | ✅ | ✅ | Importers see peers' trips for market awareness |
| Discover importers | ❌ | ✅ | ❌ | |
| Receive aggregated demand | ❌ | ❌ | ✅ **L2-I** | |
| Create / publish a trip | ❌ | ❌ | ✅ **L2-I** | Requires ANAE card + general authorisation |
| Propose / accept a commitment | ❌ | ✅ L2-T | ✅ L2-I | |
| Declare a deposit | ❌ | ✅ | ✅ | **Held pending legal — §9.2** |
| Confirm handover | ✅ | ✅ | ✅ | Both sides must confirm |
| Leave a review | ✅ after a recorded purchase | ✅ after a confirmed commitment | ✅ after a confirmed commitment | Never without a recorded transaction |
| Right of reply to a review | ✅ | ✅ | ✅ | One public reply, always shown with the review |
| Open a dispute | ✅ | ✅ | ✅ | Requires a recorded transaction |
| Compliance checker | ✅ | ✅ | ✅ | Public, no account |
| Simplified ledger & Art. 14 labels | ❌ | ❌ | ✅ **L2-I** | |
| Subscription / billing | ❌ | ✅ | ✅ | Maabar's own revenue. Never references a commitment |

**Verification levels:** L0 registered → L1 identity verified → **L2-I** verified importer (ANAE card, general authorisation, NIF, CASNOS) / **L2-T** verified trader (commercial register, NIF, business address) → L3 proven record.

---

## 6. USER JOURNEYS — walked end to end

### A · Importer
`Onboarding` → `Verification` (ladder → document → review → approved) → `Importer Home` → `Demand Board` → `Trip Creation` → `Trip` → `Sourcing Request` (receives) → `Commitment` → `Messages` (handover) → `Records`
**No gap.**

### B · Trader
`Onboarding` → `Verification` (trader path, RC) → `Trader Home` → `Discover` (trips / importers) → `Importer Profile` → `Sourcing Request` (compose → offers → agreement) → `Commitment` → `Messages` → review
**No gap.** Also: `Listing Composer` → `Seller Profile` → consumer marketplace.

### C · Consumer
`Consumer Home` → `Search` / `Marketplace` → `Product Detail` → `Seller Profile` → `Messages` → `Saved` → review
**No gap.**

### D · Trust & Safety
`Dispute` (user side, six states) → `Admin Console` (queue → evidence → decision → mandatory reason → user-facing consequence → immutable audit)
**No gap.**

### E · Compliance
`Compliance Checker` → verdict → why → what to do → *(collapsed)* legal basis → *(collapsed)* source and last-updated
**No gap.**

---

## 7. STATE COVERAGE

| State | Where designed |
|---|---|
| Loading | `Search` (skeletons), `Verification` (upload progress) |
| Empty | `Saved`, `Search` (with suggestions and a route out) |
| No results | `Search` — including "post a sourcing request instead" |
| Error | `Search` — connection lost, query preserved |
| Offline | `Search` (cached results banner), `Verification` (resumable upload) |
| Pending / under review | `Verification`, `Listing Composer`, `Dispute` |
| Needs correction | `Verification` — what's wrong, what to do, not a rejection |
| Rejected | `Verification` |
| Expired | `Verification` (licence), `Commitment`, `Saved` (trip) |
| Cancelled | `Commitment` |
| Disputed | `Commitment`, `Dispute` |
| Blocked / no capability | `Listing Composer` — importer cannot publish publicly |
| Partial | `Trip` (buy list: fully committed / partially / no buyer) |
| Success | `Onboarding`, `Verification`, `Trip Creation`, `Dispute` |
| Needs action | `Importer Home`, `Trader Home` (ranked, with deadlines) |

**Principle applied throughout:** every state answers *what happened · why · what can I do next*. No generic placeholders.

---

## 8. RTL / MULTILINGUAL — HONEST STATUS

**Complete:**
- All 24 screens render correctly in RTL and flip cleanly — direction is a layout property, not a content assumption
- Zero physical `left`/`right` in layout across the whole deck
- All 14 number formatters wrap output in `U+2066…U+2069`
- Arabic plural forms implemented as counted nouns (`صنف واحد` / `صنفان` / `3 أصناف` / `11 صنفاً`)
- Western digits, tabular figures, non-breaking thousands separators
- Value axes increase leftward; time-series run right-to-left

**The target:** three equal languages — **EN / FR / AR**. Arabic is not the default and not the source language. Locale selection is browser-detected with **French as the fallback**, Algeria's commercial lingua franca and the neutral middle between the other two. That is one configuration value, trivial to change.

The **logo is Latin in all three interfaces** — `Maabar`. `مَعْبَر` exists as a localised wordmark variant used only inside the Arabic interface, never as a second line beneath the Latin.

**Complete — all 24 screens carry EN, FR and AR.** Every screen has a compact language switch; direction, number separators, decimals and plurals follow the active locale.

- **Locale resolution:** `?lang=` in the URL, else the browser language, else **French**. One value (`FALLBACK`) per screen; in the build it becomes one config value
- **Numbers:** Western digits in all three. Group separator is a space in AR/FR, a comma in EN; the decimal mark is a comma in FR only
- **Plurals:** Arabic uses four counted-noun forms (one / two / 3–10 / 11+); French and English use two
- **Bidi — two isolates, two jobs.** Pure number runs take LRI…PDI. Mixed text runs take a *first-strong* isolate (FSI…PDI), with each digit group inside Arabic pinned LTR. The first pass used LRI for everything, which forced Arabic segments joined by `·` into left-to-right order and put units on the wrong side of amounts; verified glyph-by-glyph after the fix
- **Icon mirroring:** back and send glyphs flip in RTL; forward chevrons flip in LTR. The original Arabic-only screens had the back arrow pointing the wrong way
- **What does not translate — by law:** the Article 14 label content. The label preview in `Records` is fixed `dir="rtl" lang="ar"` in every interface language; only the surrounding UI and the note beneath it translate
- **Legal meaning held constant:** deposit, dispute and platform-role copy says the same thing in all three — Maabar does not receive, hold, guarantee or refund money, and does not grant the right to import

**Not yet done:** a professional review of the French and Arabic copy by native commercial writers, and Tamazight, which is not in scope.
---

## 9. LEGAL — UNRESOLVED, MUST NOT BE GUESSED

The design does not invent answers to these. Each is isolated behind a configurable capability so a lawyer's ruling changes configuration, not architecture.

### 9.1 Importer visibility with prices (B2B directory)
**Question:** Does a micro-importer appearing in `Discover` with indicative price bands constitute "electronic supplier" activity under Law 18-05, given Decree 25-170 Art. 4 exempts them from the commercial register?
**Design position:** importers appear only in B2B surfaces, never in the consumer marketplace, and never with a public storefront.
**If the answer is restrictive:** `Discover → importers` becomes gated to verified traders only — a visibility flag, no redesign.

### 9.2 🔴 Deposit declaration — THE CONDITIONAL HOLD
**Question:** Is a deposit agreed between two users, recorded but never held by the platform, a *purchase mandate* (prohibited by Art. 3, which makes the activity exclusive and personal) or a legitimate advance on a future domestic sale?
**Design position:** recorded as "declared by both parties", with permanent copy stating Maabar does not receive, hold, guarantee or refund it.
**Why this is a hold:** if a lawyer rules it constitutes a mandate, the field must be removed entirely rather than reworded. **Do not implement this field until ruled on.** Everything else in `Commitment` is buildable now.

### 9.3 Platform liability classification
**Question:** Is Maabar a technical intermediary (hosting/classifieds) or a commercial intermediary in the sale of goods?
**Design position:** no transaction fees, no payment handling, no guarantees — deliberately positioned as technical intermediary.
**Impact if wrong:** consumer-protection obligations under Law 09-03 attach, requiring added disclosures — copy changes, not structural.

### 9.4 KYC retention and ANPDP
**Question:** Retention period for identity and licence documents, and whether prior ANPDP authorisation is required for this processing.
**Design position:** documents stored in Algeria, never shown to other users, verification status shown without exposing the document.
**Impact:** retention policy and a deletion job — configuration.

### 9.5 Review and score publication
**Question:** Can platform-computed reliability figures be published without falling foul of automated-decision provisions under Law 18-07 / 25-11?
**Design position:** no composite score anywhere; only countable facts, each decomposable into its raw inputs.

---

## 10. REGULATORY CONFIGURATION

No regulatory value is drawn as a constant. Every one is a parameter with an effective date:

`max_value_per_trip` · `max_trips_per_month` · `customs_duty_rate` · `flat_tax_rate` · `authorisation_validity_months` · `shelf_life_min_remaining_ratio` · `restricted_categories` · `required_documents_per_role`

Screens read them at render. `Trip Creation` displays the value cap with its effective date visible to the user. When a rule changes, the admin publishes a new rule version with an effective date, sees an impact preview, and affected users are notified with the reason — never silently.

---

## 11. DESIGN SYSTEM STATE

- **One token file**, `designs/tokens.css` v3 — every colour, size, spacing, radius, shadow, density value. 24 of 24 screens consume it. Zero screens define their own palette
- **Brand and status are separate colour systems.** This is the defining rule of v3 and it fixes a real flaw in v2. Blue `--brand` carries the identity: logo, rail active state, primary CTAs, selection, progress. Green / amber / red carry compliance verdicts *only*. In v2 green did both jobs on a product whose core feature is a compliance verdict — 214 `--allowed` usages of which only 21 were actually verdicts. **No brand element may use `--allowed`, and no verdict may use `--brand`**
- **Four density tiers**: public (low, imagery-led) · operational (medium, cards + rules) · compliance (progressive disclosure, no brand colour on a verdict) · admin (high, tables and panels)
- **Cards for comparable entities, rules for data within one entity**
- **Role tints, not ad-hoc tones.** `--role-importer-*` (purple) · `--role-trader-*` (blue) · `--role-consumer-*` (neutral). These replaced 75 inline `oklch()` values, including avatar tints that were green and therefore read as verdicts
- **Teal is a chart colour only.** `--viz-1` measures 3.42:1 on white — sufficient as a graphic, insufficient as text. It is never a label, never a button, never in the logo
- **Terracotta `--accent` is retired.** Prices are ink-strong; product photography carries the colour
- **Typography**: Sora (wordmark and marketing display, Latin) · Inter (Latin UI) · IBM Plex Sans Arabic (Arabic UI). Sora and Inter carry no Arabic glyphs, so Arabic resolves to Plex Arabic through ordinary per-glyph fallback — no `:lang()` rule required
- **Every text pairing clears WCAG AA 4.5:1**, verified by script against the token file rather than by eye. Three v3 candidates failed and were corrected: `--ink-3` (3.94 → 4.95), white-on-`--conditional` (4.39 → 4.67), `--viz-1` (2.98 → 3.42)
- **Imagery system** with fixed aspect ratios and *designed* placeholders per category
- **Motion**: functional only, ≤200ms, `prefers-reduced-motion` honoured system-wide

---

## 12. REMAINING WORK — NOT BLOCKING

| Item | Priority | Note |
|---|---|---|
| Native-speaker review of FR and AR copy | P1 | All 24 screens are trilingual; copy is accurate but not yet reviewed by native commercial writers |
| Desktop layouts for the remaining 22 screens | **P0 for a web-first launch** | The responsive shell is proven on `Demand Board` — rail replaces bottom tabs at 1140px, capacity panel pins beside a two-column list. Admin is already desktop. The rest need the same treatment |
| Real product photography | P1 | Placeholders are designed but are placeholders. **Needed before the client demo** |
| Per-queue admin evidence panels | P2 | Layout established; contents differ |
| Requests list, Commitments list, Consumer profile | P2 | Patterns established elsewhere |
| Analytics screens | P2 | Metrics specified, screens not drawn |

---

## 12b. SURFACE ARCHITECTURE — three deployables, not one

The product ships as **three separate surfaces**. This is an architecture decision, not a routing preference.

| Surface | Audience | Auth | Notes |
|---|---|---|---|
| **Public web** | Anyone, signed out | none | Marketplace, product, seller, search, compliance checker, landing. Server-rendered for SEO and WhatsApp previews — this is how consumers arrive |
| **App** | Consumer · trader · importer, signed in | user session | One identity, roles as capabilities. Responsive: bottom tabs on phone, persistent rail from 1140px |
| **Admin** | Trust & safety staff only | **separate auth, separate domain** | Never reachable from the public app. Admin code must never ship in the user bundle |

**Why admin is its own deployable, not a route:**
- Different threat model — a compromised user session must not reach moderation, verification or rule authoring
- Bundle weight — queue tooling, evidence panels and the rule editor are dead weight for a shopper on 3G
- Staff auth belongs on its own lifecycle (SSO, forced rotation, IP allowlisting) without touching consumer signup

**Entry determines role.** A visitor arriving at a product page and signing up is a consumer — they are never asked whether they import. Someone who clicks *«سجّل كمستورد»* or *«سجّل كتاجر»* has already declared it, so that path opens with eligibility before asking for a phone number. There is no role-selection menu anywhere in the product.

---

## 13. FOR THE DEVELOPER — WHAT NOT TO DECIDE DURING CODING

These are settled. Do not re-open them in implementation:

1. **An importer never sells to a consumer.** Enforce at schema level: a listing requires `seller.role === 'trader' && rc_verified`
2. **No transaction fee, no escrow, no payment for goods.** Subscription billing only, and it may never reference a commitment
3. **No composite trust score.** Countable facts only, each decomposable
4. **Regulatory values are configuration**, never constants
5. **Reviews only from recorded transactions**, never deleted, always with right of reply
6. **Admin corrections are new decisions referencing the old**, never edits
7. **Numbers are always LTR-isolated**; Arabic is never letter-spaced or uppercased
8. **Compliance answers first, evidence on demand** — never a wall of legal text before the verdict
9. **Pre-declaration happens on anae.dz.** Maabar reminds; it never files
10. **Deposit field stays behind a flag** until §9.2 is answered

---

## 14. HOW TO VIEW

```bash
node preview/server.js
```
Then open `http://localhost:4321`. Screens are Claude Design artboards (`.dc.html`); the preview server injects the runtime they need. Boards with a chip row at the top or bottom are state-switchable — click through to see every designed state.

```
importatin/
├── DESIGN-AUDIT.md     this file
├── designs/            24 screens + tokens.css
└── preview/server.js   local preview server
```
