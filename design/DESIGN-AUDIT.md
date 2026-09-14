# Maabar — Design Audit & Handoff
**Product:** Maabar (مَعْبَر) — a commercial network for Algeria's legalised micro-import trade
**Status:** Design complete for client review. No application code exists yet.
**Date:** 14 September 2026

---

## 1. WHAT THE PRODUCT IS

Algeria legalised micro-importing ("تجارة الكابة") in June 2025 via **Executive Decree 25-170**. Thousands of people now hold a licence to import goods personally, on their own trips abroad, funded with their own foreign currency — capped at **1,800,000 DZD per trip, maximum 2 trips per month**.

Their core problem: they fly to Istanbul or Dubai carrying their life savings in hard currency and **buy on a guess**. Guess wrong and their capital freezes in unsold stock, and they cannot recycle it because the trip cap is monthly.

**Maabar connects three parties:**

| Party | Job |
|---|---|
| **Micro-importer** | Sees verified local demand *before* buying, so purchasing becomes a data-backed decision |
| **Trader** (holds a commercial register) | Finds reliable importers, discovers who is travelling where and when, documents agreements |
| **Consumer** | Buys imported goods from a verified trader, with that trader's track record visible |

**Maabar is not** a seller, a payment processor, an escrow service, a customs system, a currency exchange, or a shipping company. It is a discovery, matching, and record-keeping layer.

---

## 2. SCREEN INVENTORY — 13 screens

All screens are Arabic-first RTL, mobile-first (430px), and share one design system.

### Public / Consumer
| Screen | Purpose |
|---|---|
| **Landing** | Value proposition, live network proof, how it works, trust, compliance. Trilingual AR/FR/EN |
| **Marketplace** | Product discovery — search, category tiles, product grid, filters, sort, save |
| **Product Detail** | What it is, who sells it, are they trustworthy, is it available, how to contact |
| **Compliance Checker** | "Can I import this?" — public, no account. Trilingual AR/FR/EN |

### Importer
| Screen | Purpose |
|---|---|
| **Importer Home** | Current trip + live capacity, what needs attention, what the market wants, what's at risk, one next step |
| **Demand Board** | Aggregated demand with live capacity meters — the product's core screen |
| **Trip** | Trip status timeline, capacity, buy list, waiting buyers, pre-declaration reminder |
| **Records** | Simplified ledger (tax), Article 14 labels & delivery notes, subscription |
| **Importer Profile** | Public trust profile — evidence, not a score |

### Trader
| Screen | Purpose |
|---|---|
| **Trader Home** | Opportunities, upcoming trips, decisions needed, requests, new arrivals, reputation |
| **Discover** | Browse trips · browse importers · jump to marketplace |

### Shared / Admin
| Screen | Purpose |
|---|---|
| **Messages** | Deal-pinned conversation, structured agreement card, handover confirmation |
| **Admin Console** | Queue → evidence → decision → mandatory reason → consequence → audit |

---

## 3. DESIGN SYSTEM

### 3.1 Structure
One token file (`designs/tokens.css`) holds every colour, type size, spacing value, radius, shadow and density value. **No screen defines its own colours.** At implementation this becomes the CSS variable layer directly.

### 3.2 Four density tiers
One visual language previously covered four incompatible jobs. Now:

| Tier | Screens | Density | Containers | Imagery | Colour |
|---|---|---|---|---|---|
| **Public** | Landing, Marketplace, Product | Low | Cards, light elevation | Required | Commercial accent allowed |
| **Operational** | Importer/Trader screens, Trip, Demand | Medium | Cards for entities, rules for data | Thumbnails | Status only |
| **Compliance** | Checker, citations | Medium | Rules + progressive disclosure | None | Verdict semantics only |
| **Admin** | Console | High | Tables and panels | Evidence only | Risk semantics only |

### 3.3 Colour
The interface is ~95% white and warm off-white. **Saturation is reserved for status**:

- **Green** — verified / allowed
- **Amber** — conditional / needs attention
- **Red-brown** — prohibited / risk
- **Terracotta** — prices and marketplace CTAs, **public tier only** (banned on compliance and admin surfaces, so a regulatory verdict never reads as a commercial offer)

In the marketplace, **product photography supplies the colour; the chrome stays neutral**.

### 3.4 Typography
- One family covering Arabic and Latin: **IBM Plex Sans Arabic**, with IBM Plex Mono for reference identifiers only
- Arabic line-height runs ~12% above Latin
- **Never** `letter-spacing` on Arabic (breaks letter joining); **never** `text-transform: uppercase` (meaningless in Arabic)
- **Western digits 0–9**, not Arabic-Indic ٠–٩ — this matches Algerian official and commercial usage
- Tabular figures on every financial and capacity column
- Thousands separator is a non-breaking space: `1 800 000 دج`

### 3.5 Containers
- **Card** = a discrete, comparable, tappable entity (product, profile, trip, opportunity)
- **Rule/divider** = structured data within one entity (spec rows, compliance, audit)

### 3.6 Elevation
Three levels only. Shadows appear on public-tier cards and overlays. Operational and admin surfaces use rules, not shadows.

### 3.7 Imagery
- Product card 4:5 · Product hero 1:1 · Category tile 16:9 · Avatar 1:1
- **The empty state is designed** — a category silhouette on a tinted ground, so an un-photographed listing still looks intentional
- Photography is supplied by the trader. Maabar never supplies product images, because Maabar never owns goods
- Every image passes admin moderation before going public

### 3.8 Motion
Functional only: state transitions ~160ms, capacity meter fill ~180ms, sheets ~200ms. No decorative animation. `prefers-reduced-motion` disables everything at system level.

---

## 4. INFORMATION ARCHITECTURE

```
IMPORTER   الرئيسية · رحلتي · الطلب · الرسائل · حسابي
TRADER     الرئيسية · اكتشف · طلباتي · التزاماتي · الرسائل · حسابي
CONSUMER   الرئيسية · السوق · المحفوظات · الرسائل · حسابي
ADMIN      Trust & Safety queues · Compliance · Billing   (desktop rail)
```

**Two deliberate deviations from a conventional structure:**

1. **Trader `Discover` sits second, before requests.** A trader with no open request otherwise meets an empty screen. Discovery leads; posting a request becomes an outcome of discovery rather than its precondition.

2. **Consumer navigation is five items, not six.** Messages earns a slot because contacting a seller *is* the conversion action; "my requests" lives under the profile because an availability request is far lower frequency than a conversation.

### Role model
Roles are **capabilities on one account**, not separate account types — many importers are also traders. A context switcher (`أنا أستورد` / `أنا أشتري`) changes layout and emphasis without changing identity.

---

## 5. KEY INTERACTION PATTERNS

### 5.1 Three-dimensional capacity (the signature interaction)
Every trip is constrained on **three independent axes**, and the design shows all three, always, updating live as items are added:

| Axis | Source | Label |
|---|---|---|
| **Value** | Legal — 1,800,000 DZD per trip | "الحدّ القانوني" |
| **Weight** | The importer's own airline allowance | "حدّك أنت" |
| **Volume** | The importer's own luggage | "حدّك أنت" |

The distinction matters: the UI must never imply weight and volume are government-imposed.

### 5.2 Confirmed vs interested demand
Demand is always split into **مؤكَّد** (a verified trader committed, deposit declared between the parties) and **مهتمّ** (interest without commitment). These are never merged — the importer's capital decision depends entirely on the difference.

### 5.3 Progressive disclosure on compliance
Answer first, evidence on demand:

1. **Verdict** — allowed / conditional / prohibited (large, unmissable)
2. **Why** — one plain sentence
3. **What to do** — numbered steps
4. *(collapsed)* **Legal basis** — the decree and article
5. *(collapsed)* **Source and last update** — Official Journal reference

### 5.4 Trust as evidence, never a score
There is **no composite rating anywhere**. A profile shows:
- **Confirmed transaction count** as the hero number (in a low-trust market, "84 transactions" beats "4.8★")
- Completion rate, response time, price stability — each **decomposes on tap** into the raw counts behind it
- An honest verification checklist, **including what is not verified**
- Disputes shown, not hidden
- Reviews only from recorded transactions, never deleted, with one public right of reply displayed alongside

A new profile reads **"مستورد جديد — بلا سجل بعد"** honestly rather than being padded.

### 5.5 Structured messaging
Conversations are pinned to a specific deal, never free-floating. Structured templates ("أؤكّد المواصفة", "أقترح سعراً", "أبلغ عن تأخير") precede free text, and agreements and handovers appear as structured cards — which reduces specification disputes later and produces data rather than chat logs.

### 5.6 Admin decision loop
`Queue → Evidence (one panel) → Decision → Mandatory reason code → User-facing consequence → Immutable audit entry.` Corrections are made by a **new decision referencing the old one**, never by editing history.

---

## 6. RTL / MULTILINGUAL

Arabic is the design reference; French and English are derived.

- **Logical CSS only** — `margin-inline-start`, `padding-inline-end`, `text-align: start`. Physical `left`/`right` never used for layout
- **Bidi isolation is mandatory** for Latin or numeric runs inside Arabic. Without it: `60%` renders as `%60`, `S · M · L · XL` reverses to `XL · L · M · S`, and `--t-display` renders as `t-display--`
- **Arabic pluralisation** is implemented properly — counted nouns change form: `صنف واحد` / `صنفان` / `3 أصناف` / `11 صنفاً`. Never `1 أصناف`
- **Mirroring**: layout, arrows, progress fill, timelines and table alignment mirror. Logos, camera/clock/lock icons, phone numbers and URLs do not
- **Time-series charts run right-to-left**, matching Arabic reading order
- **Value axes increase leftward** — low value on the right, high on the left
- French runs ~20% longer than English; no fixed-width buttons, badges or column headers anywhere

---

## 7. LEGAL CONSTRAINTS BUILT INTO THE DESIGN

These are not styling preferences. Violating them breaks the product.

### 7.1 The structural rule
```
Importer ──sells to──> Trader (RC) ──sells to──> Consumer
   │                       │
   │                       └── the ONLY actor who may hold a consumer-facing listing
   └── never appears as a seller to consumers
```
**Why:** Decree 25-170 Art. 4 exempts micro-importers from the commercial register, while Law 18-05 *requires* one of an online supplier. The trader resolves the conflict; the importer would create it. This is enforced as a data constraint, not a UI convention.

### 7.2 Never in the interface
| Never | Reason |
|---|---|
| Currency exchange rates or FX features | Ordinance 96-22 — criminal exposure |
| Holding, escrowing or processing payment for goods | Unlicensed banking activity |
| "Certified by the State", "guaranteed", "100% safe", "buyer protection" | Makes the platform a party to the contract |
| Any badge resembling an official seal | Impersonation of official capacity |
| "Order this from abroad for me" flows | Art. 3 & 12 — the activity is exclusive, personal, non-transferable |
| Asking for the importer's foreign supplier, purchase price, or margin | Adoption killer; no legal need |
| Submitting customs declarations | Art. 13 — pre-declaration happens on `anae.dz`, which the design *reminds* about but never replicates |

### 7.3 Money
A subscription to Maabar (CCP/BaridiMob transfer or CIB card) is **completely separated** from any money between users. In the admin console, billing is its own queue group. A payment object may never reference a deal.

### 7.4 Parameterisation
Every regulatory number — 1,800,000 DZD, 2 trips, 5% duty, 12-month licence — is a **parameter with an effective date**, never a hardcoded value. Regulations change; the design assumes they will.

---

## 8. WHAT WAS REMOVED FROM THE EARLIER DESIGN, AND WHY

| Removed | Reason |
|---|---|
| Design-rationale text printed inside product screens | A trader does not need a paragraph justifying the sort order. It made the product read as a legal document |
| Internal reference codes (`TRP-26-0412`, `REQ-26-1180`) on user screens | Internal identifiers belong in the admin console only |
| Specification boards mixed with product screens | Moved to `spec/`. They are documentation, not the product |
| Invented terminology (`مُلتزَم فعلياً`, `طلب مُشار إليه`) | Replaced with `مؤكَّد` / `مهتمّ` |
| Four duplicate screen pairs | Consolidated; originals in `_archive/` |
| Star ratings | Replaced with countable evidence |
| Long legal paragraphs on every section | Reduced to short one-line notices only where legally necessary |

---

## 9. BUGS FOUND AND FIXED DURING REVIEW

Every screen was rendered and inspected, not just written. This surfaced:

1. `60%` rendering as `%60` inside Arabic sentences
2. `S · M · L · XL` reversing to `XL · L · M · S`
3. CSS identifiers (`--t-display`, `.tier-admin`) losing their leading characters to bidi reordering
4. `.ref` applying `letter-spacing` to Arabic, breaking letter joining
5. `1 أصناف` — incorrect Arabic plural form
6. The demand board opening **over capacity** (60 coats × 0.8 kg against a 46 kg limit), which read as broken
7. **Price band axis inverted** — a band at the cheap end of the market displayed at the expensive end
8. Product grid using viewport rather than container queries, so the mobile artboard rendered three columns

---

## 10. KNOWN GAPS — not yet designed

| Gap | Priority |
|---|---|
| **Seller Profile** (public trader storefront) | High — the consumer marketplace links to it |
| **Saved / wishlist screen** | Medium |
| **Dedicated search results screen** | Medium — search entry exists, results screen does not |
| **Sourcing request composer** (trader posts a request) | High |
| **Onboarding / KYC upload flow** | High — the trust ladder is defined but the upload journey is not drawn |
| **Trip creation wizard** | Medium |
| **Dispute flow** | Medium |
| **Consumer home** (separate from Marketplace) | Low |
| **Empty / error / offline states as dedicated screens** | Medium — patterns are defined in `spec/`, not drawn per screen |
| **Desktop layouts** | Medium — everything is mobile-first; admin is the only desktop screen |
| **Real product photography** | High for the client demo — placeholders are designed but not real |

---

## 11. TECHNICAL NOTES FOR IMPLEMENTATION

- **Mobile-first PWA**, installable. Assume mid-range Android, unstable 3G/4G, metered data
- **Performance budget**: initial JS < 200KB gzipped, LCP < 2.5s on 3G, WebP/AVIF images, strict lazy loading
- **Fonts**: subset, WOFF2, preload. One family covering Arabic + Latin, not three — Arabic webfonts are heavy
- **Works from 320px**. Tables become cards; the body never scrolls horizontally
- **Touch targets ≥ 44px**, primary actions in the thumb zone
- **Offline tolerance**: local drafts, a send queue, an explicit "will send when you're back online" state
- **Camera is first-class**: product photos, document capture, handover proof — compressed on device before upload
- **Hosting must be in Algeria** — Law 25-11 (data sovereignty) and Law 18-05 (`.dz` requirement). No dependency on foreign third-party scripts
- **Accessibility**: WCAG 2.1 AA. Contrast ≥ 4.5:1. Meaning never encoded in colour alone — always colour + icon + text

---

## 12. FILE STRUCTURE

```
design_handoff_maabar/
├── designs/           13 product screens + tokens.css   ← THE DESIGN
├── spec/              design-system and coverage documentation
├── _archive/          superseded earlier versions
├── _preview/          local preview server
├── DESIGN-AUDIT.md    this file
└── REMEDIATION-MAP.md how the design got here
```

**To view:** run `node _preview/server.js` and open `http://localhost:4321`.
The screens are Claude Design artboards (`.dc.html`); the preview server injects the runtime they need.

---

## 13. HONEST ASSESSMENT

**Strong:**
- The three-axis capacity model is specific to this regulation and cannot be copied from a generic marketplace template
- Confirmed-vs-interested demand is the product's real intellectual property
- The admin evidence→decision→reason→audit loop is production-grade
- Trust is built on countable evidence rather than a manipulable score
- RTL is structural, not retrofitted

**Weak:**
- No real product photography — the biggest visual gap for a client presentation
- Onboarding and KYC upload, arguably the highest-friction journey in the product, are not drawn
- No desktop layouts except admin
- The consumer role is the thinnest of the three

**Unresolved and requiring an Algerian lawyer before build:**
1. Whether a micro-importer appearing in a B2B directory with prices constitutes being an "electronic supplier" under Law 18-05
2. Whether a deposit declared between two users, recorded but not held by the platform, is a purchase mandate (prohibited by Art. 3) or a legitimate advance on a future domestic sale
3. Platform liability classification — technical intermediary versus commercial intermediary
4. KYC document retention periods and whether ANPDP prior authorisation is required
