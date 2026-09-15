| Desktop layouts for the remaining 22 screens | **P0 for a web-first launch** | The responsive app-shell pattern is proven on `Demand Board` (rail replaces bottom tabs at 1140px, capacity panel pins beside the list). Admin is already desktop. The rest need the same treatment |
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
- All 24 screens Arabic-first RTL
- Zero physical `left`/`right` in layout across the whole deck
- All 14 number formatters wrap output in `U+2066…U+2069`
- Arabic plural forms implemented as counted nouns (`صنف واحد` / `صنفان` / `3 أصناف` / `11 صنفاً`)
- Western digits, tabular figures, non-breaking thousands separators
- Value axes increase leftward; time-series run right-to-left

**Partial — the one honest gap:**
French and English copy is drawn on **2 of 24 screens** (`Landing`, `Compliance Checker`). The architecture is proven — `dir` flips correctly, no component has a fixed width, French runs ~20% longer and is absorbed — but the remaining 22 screens have Arabic strings only.

**Assessment:** this is a **P1 content task, not a P0 design task**. The pattern is established and repeatable; no product decision remains. It does not block development, but it does block launch, and the string extraction should happen as part of the i18n layer in the first implementation sprint.

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

- **One token file**, `designs/tokens.css` — every colour, size, spacing, radius, shadow, density value. 24 of 24 screens consume it. Zero screens define their own palette
- **Four density tiers**: public (low, imagery-led, commercial accent) · operational (medium, cards + rules) · compliance (progressive disclosure, no commercial colour) · admin (high, tables and panels)
- **Cards for comparable entities, rules for data within one entity**
- **Saturation reserved for status.** Terracotta accent is public-tier only and banned from compliance and admin surfaces
- **Imagery system** with fixed aspect ratios and *designed* placeholders per category
- **Motion**: functional only, ≤200ms, `prefers-reduced-motion` honoured system-wide

---

## 12. REMAINING WORK — NOT BLOCKING

| Item | Priority | Note |
|---|---|---|
| FR/EN strings on 22 screens | P1 | Content task; architecture proven |
| Desktop layouts | P1 | Everything is mobile-first; only Admin is desktop |
| Real product photography | P1 | Placeholders are designed but are placeholders. **Needed before the client demo** |
| Per-queue admin evidence panels | P2 | Layout established; contents differ |
| Requests list, Commitments list, Consumer profile | P2 | Patterns established elsewhere |
| Analytics screens | P2 | Metrics specified, screens not drawn |

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
