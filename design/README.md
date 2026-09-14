# Handoff: مَعْبَر (Maabar) — B2B Demand-Intelligence & Import-Capacity Network (Algeria)

## Overview
Maabar turns an Algerian micro-importer's purchase decision from a guess into a data-backed decision. An importer flying to Istanbul/Dubai/Guangzhou with up to **1,800,000 DZD of their own hard currency** buys stock blind; if they guess wrong their capital freezes, and the law caps them at 2 trips per month. Maabar shows **verified local demand before they buy**, computes their remaining legal headroom live, and builds a portable trust record for both sides.

It is **not** a marketplace, payment platform, customs system, shipping company, or currency exchange. The architecture must keep it that way — see *Legal Invariants*, which are load-bearing, not preferences.

Positioning line used throughout: «اعرف واش يطلبو التجار — قبل ما تشري.» ("Know what the market wants — before you buy.")

---

## About the Design Files
The files in `designs/` are **design references created in HTML** — prototypes of intended look and behavior. They are **not production code to copy**.

Your task is to **recreate these designs in the target codebase's environment** using its established patterns and libraries. If no codebase exists yet, choose an appropriate stack and implement there. Recommended given the constraints (see *Performance & Platform*): a mobile-first installable PWA — Preact/React or SvelteKit, server-rendered public pages for SEO and WhatsApp link previews, IndexedDB for drafts and a background send-queue.

**How to read the HTML files.** Each `*.dc.html` is a self-contained page: a `<x-dc>` template (inline-styled markup) plus a `class Component extends DCLogic` script holding the data and handlers. `support.js` is the prototype runtime — **do not port it**. Read the template for structure and exact style values; read the logic class for data shape, state, and derived values. Several files pack multiple screens behind an in-page tab/segment switcher (noted per file below) — implement those as real routes.

**Language.** All UI copy is Arabic. Copy it verbatim — it has been written to satisfy specific legal disclosure requirements. French and English strings exist in `Landing.dc.html` and `Trilingual and RTL.dc.html`.

---

## Fidelity
**High-fidelity.** Final colors, typography, spacing, states, and copy. Recreate pixel-faithfully using the codebase's own libraries. Mobile screens are designed at **430px** width and must work from **320px**; the Admin Console is desktop-first at **1440px** and must degrade to ~900px without losing the evidence panel.

---

## Legal Invariants (non-negotiable — these shape the data model)
Sources: Décret exécutif n° 25-170 (28 June 2025, JO n° 40); Law 22-23; Law 18-05; Law 18-07 as amended by Law 25-11; Finance Law 2026.

**Never build:**
- Currency exchange rates or any FX conversion/transfer feature
- Holding, escrowing, transferring, or processing payment for goods
- Any claim that the platform issues an authorization, certification, or government approval
- The words "مضمون / guaranteed", "معتمَد من الدولة / certified by the State", "100% آمن", "buyer protection"
- Any "order this from abroad on my behalf" flow — the activity is personal and non-transferable (Art. 3 & 12)
- **Any field for the importer's foreign supplier, purchase price, or margin.** The field must not exist in the schema.
- A public consumer-facing storefront for the importer
- KYC or personal data leaving Algeria (Law 25-11)
- Duplicating the state's customs pre-declaration (Art. 13 — it happens on anae.dz)

**Always build:**
- Every regulatory number is a row in a `regulation_parameters` table with `effective_from` / `effective_to`. **Never hardcode** 1,800,000 · 2 · 5% · 0.5% · 50% · 12 months. An admin changes them without a deploy.
- Every compliance answer renders: **verdict · reason · citation (decree + article) · JO link · last-updated date · next action · disclaimer**.
- Fixed disclaimer string: «معلومة استرشادية — القرار النهائي يعود لمصالح الجمارك.»
- Fixed verification-badge string: «تحقّقت المنصّة من الوثائق المقدَّمة. هذا ليس اعتماداً حكومياً.»
- Trip → `ABROAD` fires one **reminder** (never a verification): "Have you filed your pre-declaration on anae.dz?"
- Any recorded deposit is labelled **declared by both parties**, with a permanent note that the platform does not receive, hold, guarantee, or refund it.

Modelled values (all parameterized): max value/trip 1,800,000 DZD (Art. 2) · max trips/month 2 (Art. 2) · surplus not carried over or pooled · tourist allocation separate · customs duty 5% (Art. 4) · IFU 0.5% (Finance Law 2026) · remaining shelf life > 50% (Art. 6) · general authorization issued in 5 working days, valid 12 months, personal & non-transferable (Art. 11–12) · resale in original state only (Art. 2) · excluded goods (Art. 9) · mandatory labelling (Art. 14) · deregistration triggers (Art. 15).

---

## Core Objects (never conflate; never call anything an "Order")
| Object | Owner | Lifecycle |
|---|---|---|
| **Trip / رحلة** | Importer | `DRAFT → PLANNED → OPEN_FOR_DEMAND → SOURCING_LOCKED → ABROAD → RETURNING → CUSTOMS → LANDED → DISTRIBUTING → COMPLETED`; side: `POSTPONED · CANCELLED · BLOCKED_AT_CUSTOMS · PARTIALLY_COMPLETED · UNDER_REVIEW · EXPIRED` |
| **Sourcing Request / طلب توريد** | Trader | `DRAFT → OPEN → MATCHED → COMMITTED → FULFILLED → CLOSED`; side: `EXPIRED` |
| **Product Listing / عرض** | Importer | `DRAFT → ACTIVE → RESERVED → SOLD_OUT → ARCHIVED` |
| **Commitment / التزام** | Both | `PROPOSED → ACCEPTED → SECURED → IN_TRANSIT → HANDED_OVER → CONFIRMED → CLOSED`; side: `DISPUTED · WITHDRAWN · EXPIRED` |

**`designs/State Coverage.dc.html` is the authoritative spec for all 39 states** — per state it gives the displayed copy, the colour tone, what each party sees, and the single available action. Implement from that file.

---

## Design Tokens

### Colour (OKLCH — convert to your system's format)
| Token | Value | Use |
|---|---|---|
| `paper` | `oklch(0.975 0.008 80)` | page background (warm sand, never cool grey) |
| `paper-2` | `oklch(0.95 0.01 80)` | explanatory blocks, decision surfaces |
| `paper-3` | `oklch(0.93 0.012 80)` | offline bar, selected rows |
| `surface` | `#ffffff` | cards, inputs, documents |
| `rule` | `oklch(0.88 0.012 80)` | all structure — dividers, borders |
| `rule-soft` | `oklch(0.92 0.012 80)` / `oklch(0.93 0.012 80)` | table rows, inner dividers |
| `border-input` | `oklch(0.78 0.015 70)` | input borders |
| `border-btn` | `oklch(0.82 0.012 80)` / `oklch(0.85 0.012 80)` | neutral buttons, chips |
| `ink` | `oklch(0.22 0.02 60)` | primary text and figures |
| `ink-2` | `oklch(0.35 0.02 60)` | secondary body text |
| `muted` | `oklch(0.48 0.02 60)` | labels, captions (7.0:1 on paper) |
| `olive` (primary) | `oklch(0.42 0.07 150)` | primary action · allowed · committed |
| `olive-bg` | `oklch(0.93 0.035 150)` | allowed/committed chip fills |
| `ochre` | `oklch(0.55 0.12 70)` | conditional · near limit · expiring |
| `ochre-bg` | `oklch(0.95 0.045 85)` | warning blocks |
| `clay` | `oklch(0.5 0.14 35)` | forbidden · blocked · disputed |
| `clay-bg` | `oklch(0.94 0.035 35)` | error blocks |

Saturated colour is reserved for **status only**. **Never encode meaning in colour alone** — every status is colour + glyph (`✓ ! ✕ ·`) + text. Text contrast ≥ 4.5:1, headline-scale ≥ 3:1.

### Typography
- One family: **IBM Plex Sans Arabic** (covers Arabic + Latin) — weights 300/400/500/600. **IBM Plex Mono** 400/500 for reference numbers and serials only. Subset, WOFF2, preload.
- Scale (px / line-height / weight): `30 / 1.35 / 500` display · `20–26 / 1.40 / 500` heading · `16–17 / 1.45 / 500` card title · `15 / 1.70 / 400` body · `13–14 / 1.60 / 400` secondary · `12 / 1.60 / 400` label · `11 / 1.55 / 400` caption · mono `10–13 / 1.40 / 400`.
- **`font-variant-numeric: tabular-nums` on every financial, capacity, count, and timer figure.**
- ⛔ Never `letter-spacing` on Arabic (breaks joining). ⛔ Never `text-transform: uppercase`.
- Arabic line-height runs 10–15% higher than the Latin equivalent; Arabic reads visually heavier, so use one weight step lighter than the Latin equivalent for equal perceived weight.

### Numerals & formats
- **Western Arabic numerals 0–9 only.** Never ٠–٩ — everyday, official, and commercial usage in Algeria is 0–9, and Arabic-Indic digits destroy scannability of financial figures.
- Currency: `1 800 000 دج` — non-breaking-space thousands separators, symbol **after** the number in Arabic.
- Dates Gregorian by default; offer Hijri display in legal/regulatory contexts.

### Spacing, radius, motion
- 4px base. Work surfaces 8/12px; decision paths 16/24px. Page padding 16px mobile, 20–24px desktop.
- Radius: `4px` documents · `5–6px` buttons, inputs, cards · `8px` panels · `10–12px` sheets · `50%` status dots · pill `15–18px` chips.
- **No shadows.** Structure comes from 1px rules. One exception: the sticky bottom bar uses `backdrop-filter: blur(4px)` over `paper/0.96`.
- Motion functional only, ≤200ms: meter fill `width 180ms ease-out`, sheet enter ~160ms. Honour `prefers-reduced-motion: reduce` (the prototypes disable all animation/transition under it).

---

## RTL & Trilingual (mandatory)
Arabic (RTL) is the **default and the design reference**; French and English are derived from it.

- **Logical CSS properties only:** `margin-inline-start`, `padding-inline-end`, `padding-inline`, `inset-inline`, `text-align: start`, `border-inline`. **`left` / `right` in layout is a code-review rejection.** (Watch the `padding:` 4-value shorthand — it is physical and silently breaks RTL indentation.)
- `dir="rtl"` on the root; correct `lang` on every text block.
- **Three locale bundles from day one**, with Arabic plural categories `zero / one / two / few / many / other` — write each form out in full; never concatenate `{n} + " معاملة"` (that yields "2 معاملة" and "11 معاملات").
- **Mixed-direction text must be isolated**: wrap every Latin brand name, phone number, URL, reference, and confirmation code in `<bdi>` or `unicode-bidi: isolate` + `direction: ltr`. Test string: «معطف Zara مقاس L بسعر 5,400 دج». A 6-digit handover code rendered in an RTL flex row without isolation displays reversed — both parties then read different numbers.
- **Mirror:** layout, columns, sidebars, arrows and chevrons, progress/meter fill direction, timelines and steppers, table alignment and sort arrows, chart category axes. Forward/next is `←`, back is `→`.
- **Do not mirror:** logos, camera/clock/lock icons, photographs, phone numbers, URLs, foreign currency symbols. Pick one time-axis direction and keep it consistent product-wide.
- **No fixed widths** on buttons, badges, or column headers — French runs 15–25% longer than English; Arabic is shorter in characters but taller in line-height. Test every component with the longest French and widest Arabic string.

`designs/Trilingual and RTL.dc.html` demonstrates all of the above with working examples.

---

## Screens

### Public (Phase 0 — the growth wedge; build first)
**`Landing.dc.html`** — value proposition, AR/FR/EN switcher (switches `dir` and `lang` on the root). Speaks to the importer's fear, not to investors. Sections: hero + two CTAs · "three questions before every trip" · how it works (4 numbered steps) · **"what we do not do — by architecture"** (chips: no FX, no payment/escrow, no buying by proxy, no supplier directory, no customs filing, no consumer storefront) · "what we ask / never ask" · footer disclaimer. Copy for all three locales lives in the logic class `L` object.

**`Compliance Checker.dc.html`** — three tabs, no account required.
- *فحص سلعة*: free-text input + 7 category chips → verdict block (28px verdict in the status colour, glyph, reference `CHK-XXXX-NNNN`) → reason → **legal basis rows** (article + text + JO link) → decree/JO/effective-date line → next-step block → disclaimer → **WhatsApp share card** (the primary growth channel in Algeria: the share URL is `https://wa.me/?text=` + encoded verdict, articles, disclaimer, and `maabar.dz/check/<ref>`). States: idle (explains what it answers, states nothing is logged under your name) · loading (pulsing skeleton + "matching against the rule registry") · result · unknown item (refuses to rule rather than guessing) · offline (works from the cached rule snapshot, shows its date).
- *الحاسبة*: value input → remaining headroom with meter, over-cap error stating surplus is not carried over or pooled → duty 5% and IFU 0.5% derived → monthly trip slots (used/available) → shelf-life calculator (total vs remaining months → accept/reject against the 50% threshold).
- *القواعد*: 8 parameterized rule rows with article + note + JO link · 6 required documents · 4 deregistration triggers · anae.dz note.

### Importer
**`Demand Board.dc.html` — the 10x screen; build this best.** Aggregated demand × trip capacity × compliance filter.
- **Three capacity meters (value / weight / volume) are three independent constraints. Show all three, always, and update them live as items are added.** This is the product's signature interaction. Value = legal limit (labelled «الحدّ القانوني»); weight and volume = the importer's own transport limits (labelled «حدّك أنت»). Meter colour: ink < 90% used, ochre ≥ 90%, clay ≥ 100%. Tapping a meter opens a breakdown sheet itemising consumption per line + remainder.
- Under the meters, permanently: "purchase value is an estimate stored on your device only — never sent to the platform, never shown to anyone."
- Each demand row: numbered serial · name · top wilayas · **confidence chip (tappable → 4-signal breakdown sheet: verified traders, commitment-to-indication ratio, request recency, category reports)** · **committed demand in 22px ink with a 3px olive inline-start bar, indicated demand in 15px muted with a dashed border** — the visual hierarchy between them must be unmistakable · price **band** on a category-range track (never a single false-precision number) · compliance chip + estimated unit weight · optional alert (counterfeit reports, conditional shelf-life, no commitments yet) · add / quantity stepper (44px targets, ±10 units) · disabled add state when the item no longer fits the remaining headroom.
- Sticky bottom bar: open buy list + summary. Must be usable **standing in a market, on bad roaming data, in ≤3 taps.**

**`Importer App.dc.html`** — three screens behind an internal switcher, plus a `tripStatus` prop driving six scenarios.
- *Home / Trip Command*, ordered exactly per the dashboard law: (1) active trip + 3 meters + monthly trip counter → (2) **يحتاج انتباهك** ranked with SLA/expiry timers → (3) top demand signals in the importer's categories → (4) **في خطر** (uncommitted stock value, capacity overflow, expiring documents — each with the *why*) → (5) recent activity → (6) **exactly one** recommended next action. Status-specific content for `OPEN_FOR_DEMAND · ABROAD · CUSTOMS · BLOCKED_AT_CUSTOMS · PARTIALLY_COMPLETED · UNDER_REVIEW` lives in the `STATUS`, `ATT`, and `NEXT` maps in the logic class — port these verbatim; the ugly states carry the most carefully written copy in the product.
- *Trip Wizard*: 5 steps (destination · capacity · transport · price policy · privacy), each with a "why we're asking" line. The privacy step states plainly that supplier, purchase price, and margin are not stored at all — there is no setting that could reveal them because the field does not exist.
- *Trip Detail*: RTL timeline (10 stages, current stage turns clay when blocked) · manifest table · committed buyers with transaction counts · handover schedule.
- Bottom tab bar: الرحلة · الطلب · الالتزامات · الرسائل · أنا. Header holds the **role context switcher** (أنا أستورد / أنا أشتري) — roles are capabilities on one account, not separate account types.

**`Importer Trust.dc.html`** — three tabs.
- *Trust ladder*: L0 مُسجَّل → L1 هوية مؤكَّدة → L2-I مستورد مُتحقَّق → L2-T تاجر مُتحقَّق → L3 سجل مُثبَت, each showing requirement + what it unlocks. **Gate actions, never access.** Progressive upload: **one document at a time**, each with an explicit "why we ask" and an on-device-compression + data-sovereignty note.
- *Document vault*: ANAE card, general authorization (expiry countdown + 5-working-day renewal warning), NIF, CASNOS (under review), plus a **rejected** document showing the exact reason and how to fix it.
- *Reliability profile*: **confirmed transaction count rendered at 52px — larger and more prominent than the score itself** (in a low-trust market "47 معاملة مؤكَّدة" beats "4.8★"); score shown at 20px with an explicit floor ("not shown below 5 transactions"; new profiles read «مستورد جديد — بلا سجل بعد» honestly). Six weighted components: delivery 30% · specification 20% · price stability 20% · responsiveness 10% · compliance standing 10% · depth 10%, each with a bar and a plain explanation. Reviews **always** display the subject's single right-of-reply alongside them. Exportable record certificate (PDF + QR).

**`Importer Records.dc.html`** — three tabs.
- *Ledger (الدفتر)*: Art. 4 numbered ledger, period filter, totals, serial entries that are **never deleted** — corrections are reversing entries. PDF/Excel export. States plainly that Maabar does not compute taxes or give fiscal advice.
- *Label & delivery-note generator*: Art. 14 label (importer name + address, goods designation, country of origin, quantity, lot ref, QR) and delivery note (quantity, weight, volume, both signatures), printable per lot or in bulk per commitment.
- *Credits & billing*: prepaid packs; **CCP / BaridiMob manual transfer is a first-class 3-step flow** (copyable account + mandatory reference → receipt photo upload → manual confirmation, typically < 24h, with a pending-transfer notice) — a large share of the market will pay no other way. CIB/Edahabia is single-payment only: **no automatic recurring billing.** Compliance checker, calculators, ledger, messaging, and handover are always free.

### Trader
**`Trader App.dc.html`** — six screens behind a bottom tab bar.
- *Supply pipeline*: horizontally scrolling kanban — طلب → مطابقة → التزام → في الطريق → وصلت → استُلمت — plus "needs your decision" with expiry timers, "at risk", and one next step.
- *Post a sourcing request*: **structured spec form** (category, specification with a "vague specs cause disputes" hint, quantity, target price **band** with the reference band shown inline, deadline, delivery wilaya) — never a free-text box.
- *Match results*: side-by-side importer cards **sorted by confirmed transaction count, not price** — record, historical band, price stability, arrival date, delivery discipline, verification level. A new importer honestly shows «مستورد جديد — بلا سجل بعد» and "بيانات غير كافية" rather than blanks.
- *Price index*: reference **bands** by category × wilaya over 6 months (newest first), per-wilaya table with transaction counts, and an explicit floor: no band below 5 confirmed transactions in 90 days.
- *Commitment detail*: 6-step progress, agreed spec, price band + tolerance (±10%) + expiry countdown, declared deposit with the permanent platform-is-not-a-party note, handover plan.
- *Trader verification*: RC, NIF/NIS, business address — each with its "why we ask".

### Shared
**`Shared Flows.dc.html`** — four tabs.
- *Context-bound messaging*: every thread pinned to a Request/Trip/Commitment (header shows the object ref and state). **Structured message templates precede free text**: أطلب عرضاً · أؤكّد المواصفة · أقترح سعراً · أبلغ عن تأخير · أقترح موعد استلام. Template messages carry structured field rows. **No unilateral deletion** — stated in the composer footer. Queued-while-offline messages show "· في قائمة الإرسال".
- *Handover protocol*: arrival announcement → **mandatory timestamped photos** → pickup point/window → **6-digit confirmation code** (isolated LTR; shown only in person, never messaged) → dual confirmation (سلّمتُ / استلمتُ ومطابق) → **48h objection window** → mutual review.
- *Dispute (Lite)*: structured, explicitly **non-binding** mediation. Evidence timeline built automatically from the platform record (both parties see the identical timeline — no hidden information). Three suggested remedies with real frequencies. If no agreement, the objection and both replies stay on both records permanently and neither party is assigned fault.
- *Notifications*: in-app + push; **SMS reserved for critical events only** (arrival announcement, offer expiry, admin decision affecting the account) because it costs money and arrives without internet. Channel toggles with honest explanations.

### Admin (desktop-first, RTL mandatory)
**`Admin Console.dc.html`** — four sections.
- *Queue console*: six queues (Verification · Risk · Content · Disputes · Compliance Review · Payment Confirmation) with live counts and oldest-item SLA age, risk-weighted sort. **No dashboard, no vanity KPI cards** — "everything shown here needs a decision".
- *Queue item workspace*: three panes — queue rail · item list · workspace. **Every piece of evidence needed for the decision sits in one panel**: documents, risk signals, user context stats, prior decisions on this user (with the admin ID who made them), related conversations. Decision (approve / request alternative document / reject) + **mandatory reason code** + internal note + a live preview of **the exact user-facing consequence**. Submit stays disabled until decision AND reason are both chosen. Decisions are immutable; corrections are new decisions that reference the original. Shell must degrade below ~1100px: rail and list shrink, the workspace inner grid becomes `repeat(auto-fit, minmax(300px,1fr))` so the evidence panel never collapses to 0px.
- *Compliance rule authoring*: no-code conditional builder (field / operator / value rows) → verdict → user-facing reason text → **JO citation + effective date** → **impact preview before publishing** ("1,240 past answers would differ · 87 active trips affected · 3 goods change verdict · 0 live commitments affected") → versioned publish → one-click rollback. Publishing never rewrites past answers retroactively; it adds a version with an effective date and notifies affected users **with the reason text**, not silently.
- *Market health*: fill rate, median time-to-first-response, commitment completion, dispute rate, estimated leakage, liquidity per category × wilaya heatmap, cold-start success. **No total users, no page views.** Every tile is clickable and decomposable.
- *Audit log*: immutable, searchable, filterable by actor/object/time — includes every admin decision, every rule change, and **every access to a personal document**.

### Specification artifacts (not screens — implement *from* these)
- **`State Coverage.dc.html`** — all 39 states of the 4 objects: displayed copy, tone, what each party sees, the single available action.
- **`System States.dc.html`** — the states usually forgotten, drawn as real screens: cold start (no verified demand in your categories — never fake a number; redirect to where commitments actually exist) · skeleton loading with a specific progress sentence · network error listing **what still works offline** + auto-retry + last-successful-update time · offline send-queue itemising exactly what will be sent · "insufficient data" instead of a misleading price band · new profile with no record · partial delivery with a mandatory coded reason · L0 phone OTP · account under review. Shared rule: title describing reality, one written reason, what still works, one primary action and at most one alternative, no illustrations, no apologies, no blaming the user.
- **`Design System.dc.html`** — the full token set, type scale, tabular-figure rules, capacity-meter and price-band components, trust vocabulary, 15-item component inventory, composition rules, and the banned-words content checklist.
- **`Trilingual and RTL.dc.html`** — the same component in AR/FR/EN, bidi isolation demos, the six Arabic plural forms, the mirror/don't-mirror table, and the longest-string stress test.
- **`Taxonomy and Entitlements.dc.html`** — the 3-level category tree (group → branch → leaf), mandatory attributes per leaf, what binds to each leaf (demand aggregation, price band, compliance verdict, trip matching), tree governance rules, and the **entitlements matrix** (role × level × credits) with the action-gating pattern.

---

## Interactions & Behaviour
- **Capacity meters** recompute synchronously on every quantity change; width transitions 180ms ease-out. Fill starts at the **inline-start** (right in RTL) edge.
- **Composite numbers are auditable**: tapping any composite figure opens a bottom sheet decomposing it into its inputs, with source and last-updated date. If a number leads nowhere, delete it.
- **Action gating**: the gated CTA stays visible; its disabled state names what it unlocks and which document is needed. Work in progress is never lost — the trip saves as `PLANNED`, the request as `DRAFT`.
- **Offline tolerance**: local drafts, a visible send-queue, and an explicit "سيُرسل عند الاتصال" state — never a spinner. Actions are accepted optimistically and replayed in order.
- **Camera is first-class**: product photos, document capture, handover proof — with on-device compression before upload (state the compressed size to the user).
- Bottom sheets: backdrop `oklch(0.22 0.02 60 / 0.4)`, panel radius `12px 12px 0 0`, max-height 85vh, close button plus backdrop dismiss, `role="dialog" aria-modal="true"`.
- Timers (offer expiry, objection window, SLA age) are live and always visible where the decision is made.

## State Management
Per surface: `screen`/`tab` route state · `sheet` (open breakdown sheet id) · wizard `step` + `wizData` · demand-board `qty` map (device-local, drives all three meters) · `filter`/`category`/`period`/`range` selections · admin `queue` / `item` / `decision` / `reason` (submit blocked until decision && reason) · `offline` + pending-action count.

Data fetching: aggregated demand by category × wilaya (server-computed; never expose individual trader identity before an offer) · rule registry snapshot cached locally with its effective date for offline use · price bands with a minimum-sample threshold · trip/commitment/request records · admin queues with SLA age and risk weight.

**The value meter's per-unit purchase estimate is device-local and must never be transmitted.** The server receives quantities only.

## Performance & Platform
- Mobile-first installable **PWA**. Assume 85%+ mobile, mid-range Android, unstable 3G/4G, metered data.
- Budget: **initial JS < 200KB gzipped · LCP < 2.5s on 3G** · WebP/AVIF · strict lazy loading.
- Fonts: subset, WOFF2, preload, **one family** covering Arabic + Latin. Arabic webfaces are heavy — treat font weight as a performance decision.
- Works from **320px**; tables become cards; the body never scrolls horizontally.
- Touch targets ≥ 44px; primary actions in the thumb zone (lower half).
- **Hosting must be in Algeria** (Law 25-11; Law 18-05 `.dz` requirement). Do not introduce foreign third-party scripts, fonts-from-CDN, analytics, or services — self-host the font files (the prototypes load them from Google Fonts purely for convenience; **change this**).
- Accessibility: WCAG 2.1 AA. Contrast ≥ 4.5:1. Full keyboard operability on admin surfaces. Visible focus states that work in RTL (`:focus-visible { outline: 2px solid olive; outline-offset: 2px }`). Never colour alone. Screen-reader labels in the active language.

## Assets
None. No images, icon fonts, or illustration libraries. All iconography is CSS-drawn (circles, rules, bordered squares) or a text glyph (`✓ ! ✕ · ← →`). Photo and QR placeholders use striped `repeating-linear-gradient` / `repeating-conic-gradient` fills — replace with real content. Fonts: IBM Plex Sans Arabic + IBM Plex Mono (SIL Open Font License) — **self-host**.

Explicitly forbidden: large gradients, glassmorphism, playful 3D illustration, dark mode as default, over-decorated icons, anything resembling a governmental seal, emblem, or official stamp.

## Build Order
1. **Phase 0 — the wedge:** public compliance checker · cap/quota/shelf-life calculators · regulation reference · shareable WhatsApp result cards.
2. **Phase 1 — the network:** identity & roles · trust ladder L0→L2 · document vault · sourcing requests · aggregated demand board · importer directory · structured messaging · admin queues · full AR/FR/EN.
3. **Phase 2 — operations:** trips & capacity ledger · matching · commitments · handover protocol · reviews & reliability index · ledger · label generator · credits & billing · dispute lite.
4. **Phase 3 — depth:** risk engine · advanced moderation · pro subscriptions · price index · exportable record certificate.

> Demand before supply. Trust before transaction. Compliance before marketplace. Record before monetization.

## Three design decisions that departed from the original brief
1. **The value meter needs a purchase price the target user will never disclose.** Resolved: an importer-entered estimate, stored on-device only, never transmitted — and the meter says so on its own face. The server sees quantities only.
2. **Weight and volume are not legal caps** — only value is (Art. 2). Labelling all three identically would teach a wrong rule, so the UI distinguishes «الحدّ القانوني» from «حدّك أنت», the latter set in the Trip Wizard.
3. **"Deposit-backed" committed demand vs. the no-payments rule.** Kept as a record *declared by both parties*, with a permanent note that the platform does not receive, hold, guarantee, or refund it. The UI never implies custody.

## Files
All in `designs/`:
`Index.dc.html` (system map — open first) · `Landing.dc.html` · `Compliance Checker.dc.html` · `Demand Board.dc.html` · `Importer App.dc.html` · `Importer Trust.dc.html` · `Importer Records.dc.html` · `Trader App.dc.html` · `Shared Flows.dc.html` · `Admin Console.dc.html` · `State Coverage.dc.html` · `System States.dc.html` · `Design System.dc.html` · `Trilingual and RTL.dc.html` · `Taxonomy and Entitlements.dc.html` · `DESIGN.md` (UX architecture, IA, and direction rationale) · `support.js` (prototype runtime — **do not port**).

Open any file directly in a browser to view it.
