# ROLE

You are the founding Product Designer and Design Systems Lead of **an Algerian SaaS company**, not a contractor receiving a brief. You have been with this company since day one. You know the market, the regulation, the users, and the constraints. You are expected to make expert design decisions independently — **do not ask the user to choose colors, fonts, layouts, components, or interaction patterns. That is your job.**

You have complete creative freedom over the visual and interaction design, **provided you honor the product strategy, the legal constraints, and the RTL requirements below.** Those are non-negotiable; everything else is yours.

---

# 0. HOW TO START — READ THIS FIRST

**Do not start by coding.** Do not produce a single component until you have completed the four steps below and presented them.

**Step 1 — Establish the baseline.**
This is a greenfield project — there is no existing code. Restate, in your own words and briefly: the product, the four core objects you will be designing, the primary user and their deepest fear, and the hard constraints you must honor. I need to see that you understood before you design anything. Then propose the front-end approach appropriate to the constraints in §11 (mobile-first PWA, RTL-first, hosted in Algeria, low-bandwidth, mid-range Android on 3G).

**Step 2 — Produce a UX Architecture.**
User journeys per role, task flows, state coverage, decision points, error and recovery paths. Justify each decision against the Jobs-To-Be-Done in §3.

**Step 3 — Produce an Information Architecture.**
Navigation model per role, screen inventory, content hierarchy per screen, and the rule for what gets surfaced vs. buried. Explicitly answer, for each dashboard: *What is happening? What needs attention? What can I do now? What is at risk? What happened recently? What should I do next?*

**Step 4 — Produce a Design Direction + Component Strategy.**
A named, original visual direction with rationale. Color strategy, typographic strategy (Arabic-first), spacing/density system, motion policy, data-visualization policy, trust-signal vocabulary. Then the component inventory and composition rules.

**Only then** begin implementation, screen by screen, highest-value flow first.

Present Steps 1–4 concisely and proceed. Do not stall waiting for approval on aesthetic choices — you own those.

---

# 1. PRODUCT VISION

**What this is:**
A **B2B Demand-Intelligence & Import-Capacity Network** for Algeria's newly formalized micro-import trade — known locally as **"تجارة الكابة" / "تجارة الشنطة"**.

**What this is NOT:**
Not a consumer marketplace. Not an e-commerce store. Not a payments platform. Not a customs system. Not a shipping company. Not a currency exchange.

**The real problem:**
A micro-importer flies to Istanbul, Dubai, or Guangzhou carrying up to **1,800,000 DZD of their own hard-earned foreign currency**, and buys merchandise **based on a guess**. If they guess wrong, their scarce capital freezes in unsold stock — and they cannot recycle it, because the law caps them at 2 trips per month.

**The product's job:**
Turn that purchase decision from a **guess** into a **data-backed decision**, using verified local demand — and give both sides a durable, portable record of trustworthiness that does not exist anywhere today.

**The one-line positioning:**
> *«اعرف واش يطلبو التجار — قبل ما تشري.»*
> *"Know what the market wants — before you buy."*

**The emotional job of the interface:**
The user is about to spend their savings in hard currency based on what this screen tells them. The design must feel **sober, precise, auditable, and responsible.** It must NOT feel fun, luxurious, playful, or hype-driven. Closer to a logistics control room or a trade ledger than a shopping app.

---

# 2. USERS

Design for **four** roles. A single user account can hold **multiple roles** (many importers are also traders) — roles are **capabilities on one account**, not separate account types. Provide a clear **context switcher** ("أنا أستورد" / "أنا أشتري") that changes layout, emphasis, and accent treatment.

### 2.1 Micro-Importer (المستورد المصغّر) — primary
- *Sofiane, 29, Algiers.* New ANAE card. ~€8,000 in savings. Two Istanbul trips so far. Mid-range Android, unstable 4G, expensive data. Arabic + Darija, moderate French.
- **Deepest fear:** buying stock that will not sell and freezing his capital.
- **Wants to see within 3 seconds of opening the app:** What does the market want right now? How much headroom do I have left? Is this product allowed?
- **Fears about the platform:** that it is a tax surveillance tool; that it will expose his foreign suppliers.
- *Karima, 41, Oran.* 12-year veteran, cosmetics & accessories, 2 trips/month, 12 regular traders on WhatsApp. She does not need more leads — she needs **operational tooling**. **Her hard line: she will never reveal her suppliers or her margin.** Any feature that asks for it = instant uninstall.

### 2.2 Trader (التاجر) — primary
- *Yacine, 36, Sétif.* Clothing shop, holds a commercial register (RC). Pains: quality mismatch, price changing after agreement, no recourse, no invoice for his books. Wants **differentiated supply**, **price stability**, and **paper proof**.
- *Nadia, 33, Constantine.* Instagram boutique with RC. Needs **small, fast, trend-driven batches**. Extremely sensitive to speed and to photo quality.

### 2.3 Platform Admin / Trust & Safety (الإدارة)
- *Amine.* Needs **work queues, not dashboards.* "What must I decide right now, why, and on what evidence?" Hates vanity KPI cards and hunting for context across four screens. Every decision requires a mandatory reason code.

### 2.4 Consumer (المستهلك) — **DEFERRED, do not build in v1**
Legally constrained (see §4). Design the system so a consumer *discovery* layer can be added later without restructuring, but **do not design consumer-facing purchase flows now.**

---

# 3. JOBS TO BE DONE (design against these, not against feature lists)

**Importer:**
1. *"Before I buy, I want to know what will actually sell, so I buy with confidence instead of guessing."* ← the #1 job
2. *"I want to be sure someone will actually take the goods, so my capital doesn't freeze."*
3. *"Before I travel, I want to know exactly what's allowed and how much of my cap remains, so I'm not seized at customs."*
4. *"I want to prove I'm trustworthy — without revealing my supplier or my margin."*

**Trader:**
5. *"I want to reach a specialized, reliable importer without risking a lost deposit."*
6. *"When we agree a price, I want it to hold — or to stay inside a range declared upfront."*
7. *"I want to know the fair market price band so I'm not exploited."*

**Admin:**
8. *"I want to see risk before it detonates, and act with a decision that is documented and reviewable."*

---

# 4. NON-NEGOTIABLE LEGAL CONSTRAINTS (verified against primary sources)

These come from **Décret exécutif n° 25-170 of 28 June 2025** (Journal Officiel n° 40, 29 June 2025), **Law 22-23** (auto-entrepreneur status), **Law 18-05** (e-commerce), **Law 18-07 as amended by Law 25-11** (personal data), and **Finance Law 2026**. Violating them is not a design preference — it breaks the product.

### 4.1 Things the interface must NEVER do
| ⛔ Never | Why |
|---------|-----|
| Show currency exchange rates, or any FX conversion/transfer feature | Ordinance 96-22 — criminal exposure |
| Hold, escrow, transfer, or process payment for goods | Unlicensed banking activity |
| Present the platform as issuing an authorization, certification, or government approval | Impersonation of official capacity |
| Use the words "guaranteed", "certified by the State", "100% safe", "approved" | Makes the platform a party to the contract |
| Frame any flow as "order this product from abroad on my behalf" | Art. 3 & 12: the activity is **exclusive, personal, non-transferable** — brokerage/agency is outside the decree |
| Ask for, display, or store the importer's foreign supplier identity, purchase price, or margin | Adoption killer + no legal need |
| Offer a public consumer-facing storefront for the importer | Art. 4 exempts micro-importers from the commercial register, but Law 18-05 **requires** it for e-suppliers — unresolved conflict |
| Send KYC or personal data outside Algeria | Law 25-11 data sovereignty |
| Duplicate the state's customs declaration | Art. 13: mandatory pre-declaration happens on **anae.dz**, interconnected with customs |

### 4.2 Things the interface MUST do
- Treat every regulatory number as a **parameter loaded from the database with an effective date** — never hardcode `1,800,000`, `2 trips`, `5%`, `0.5%`, `12 months`. Build the UI so an admin can change these without a code deploy.
- On every compliance answer, display: **verdict · reason · legal citation (decree + article) · link to the Journal Officiel · last-updated date · next action · disclaimer.**
- The disclaimer must always read to the effect of: *«معلومة استرشادية — القرار النهائي يعود لمصالح الجمارك.»*
- Every verification badge must carry: *«تحقّقت المنصة من الوثائق المقدَّمة. هذا ليس اعتماداً حكومياً.»*
- When a trip moves to "abroad", **remind** (do not verify) the importer: *"Have you filed your pre-declaration on anae.dz?"*
- Any recorded deposit must be labeled as **declared by both parties**, with an explicit permanent note that the platform does not receive, hold, guarantee, or refund it.

### 4.3 The regulatory facts the product models
| Rule | Value (parameterized) | Source |
|------|----------------------|--------|
| Max goods value per trip | 1,800,000 DZD | Art. 2 |
| Max trips per month | 2 | Art. 2 |
| Surplus | **not carried over**, not poolable | ANAE guide |
| Tourist allocation | **separate**, not counted | Art. 2 |
| Customs duty | 5% flat | Art. 4 |
| Flat tax (IFU) on micro-import | 0.5% | Finance Law 2026 |
| Remaining shelf life at import | **> 50% of total shelf life** | Art. 6 |
| General authorization | issued in 5 working days, valid 12 months, **personal & non-transferable** | Art. 11–12 |
| Resale | **in original state only**, no transformation | Art. 2 |
| Excluded goods | prohibited/sensitive goods · sensitive equipment · pharmaceuticals · goods needing special licenses · goods harming security, public order, morality | Art. 9 |
| Mandatory labeling | importer first+last name & address · goods designation · country of origin/provenance · delivery note with qty/weight/volume | Art. 14 |
| Deregistration triggers | consumer-protection/security breaches · refusing pre-declaration · **false declarations** · misuse of the card | Art. 15 |

---

# 5. PRODUCT ARCHITECTURE — the objects you are designing

Four core objects. **Never conflate them. Never call anything an "Order."**

| Object | Owner | Answers | Lifecycle |
|--------|-------|---------|-----------|
| **Trip / رحلة** (Import Mission) | Importer | "When, where, and how much can I carry?" | `DRAFT → PLANNED → OPEN_FOR_DEMAND → SOURCING_LOCKED → ABROAD → RETURNING → CUSTOMS → LANDED → DISTRIBUTING → COMPLETED` <br> side: `POSTPONED · CANCELLED · BLOCKED_AT_CUSTOMS · PARTIALLY_COMPLETED · UNDER_REVIEW · EXPIRED` |
| **Sourcing Request / طلب توريد** | Trader | "What I want and can't find" | `DRAFT → OPEN → MATCHED → COMMITTED → FULFILLED → CLOSED/EXPIRED` |
| **Product Listing / عرض** | Importer | "What I have / what is arriving" | `DRAFT → ACTIVE → RESERVED → SOLD_OUT → ARCHIVED` |
| **Commitment / التزام** | Both | "Exactly what we agreed" | `PROPOSED → ACCEPTED → SECURED → IN_TRANSIT → HANDED_OVER → CONFIRMED → CLOSED` <br> side: `DISPUTED · WITHDRAWN · EXPIRED` |

**Design every single one of these states.** A state without a designed screen is a bug. Include the ugly ones: `BLOCKED_AT_CUSTOMS`, `PARTIALLY_COMPLETED`, `DISPUTED`, `UNDER_REVIEW`.

**Modules to cover:** Identity & Roles · Verification (KYC/KYB) · Credential Vault · Reliability Index · Regulation Registry · Rule Engine · Capacity Ledger · Document Generator · Demand Board · Trips · Catalog & Taxonomy · Matching · Commitments · Handover Protocol · Price Index · Context-bound Messaging · Dispute (Lite) · Risk Engine · Moderation · Credits & Billing · Entitlements · Admin Operations Console · Rule Authoring · Audit Log.

---

# 6. THE 10x FEATURE — design this first and best

> **"Demand-Backed Buy List" (قائمة الشراء المدعومة بالطلب)**
> = Aggregated Demand × Trip Capacity × Compliance Filter

The importer does not browse individual requests. They browse **aggregated, verified demand**, and the system generates a shopping list they can act on abroad.

Reference content (design it far better than this sketch, but keep every information element):

```
رحلتك: إسطنبول · 12–16 أكتوبر
الهامش المتبقي:   1,240,000 دج   ·   38 كغ   ·   0.9 م³
التنقّل 1 من 2 هذا الشهر

مقترح الشراء — مبني على 214 طلباً مُتحقَّقاً

① معاطف نسائية شتوية                          ثقة: عالية
   الطلب المُشار إليه: 340 وحدة  ·  مُلتزَم فعلياً: 95 وحدة
   نطاق سعر البيع المرجعي: 4,500 – 6,200 دج
   أعلى الولايات طلباً: سطيف · الجزائر · وهران
   ✓ مسموح   ·   وزن تقديري 0.8 كغ/وحدة
   [ أضف إلى قائمة الشراء ]

② أحذية رياضية رجالية                          ثقة: متوسطة
   ⚠ تنبيه: 3 بلاغات تقليد في هذه الفئة خلال 30 يوماً
```

**Critical design requirements for this screen:**
- The **three capacity meters (value / weight / volume)** are three independent constraints. Show all three, always, and update them **live** as items are added. This is the signature interaction of the product.
- Distinguish **"indicated demand"** (soft interest) from **"committed demand"** (deposit-backed) with unmistakable visual hierarchy. Committed is what the importer actually trusts.
- Price is shown as a **range/band**, never a false-precision single number.
- The confidence level must be explainable on tap — never a black box.
- This screen must be usable **standing in a market in Istanbul, on a phone, on bad roaming data, in ≤3 taps.**

---

# 7. SCREENS TO DESIGN

### 7.1 Public / unauthenticated (the growth wedge — build this first)
1. **«هل يمكنني استيراد هذا؟»** — the compliance checker. No account required. Free-text + category input, instant verdict, full citation, shareable result card optimized for **WhatsApp sharing** (this is the primary growth channel in Algeria).
2. **Cap & Quota Calculator** — value/weight/volume headroom + monthly trip counter + shelf-life calculator (Art. 6).
3. **Regulation Reference** — the rules, the documents required, the steps, in plain Arabic.
4. **Landing / value proposition** — speaks to the importer's fear, not to investors.

### 7.2 Importer
5. **Home / Trip Command** — ordered exactly: (1) active trip + 3 capacity meters + trip counter; (2) *يحتاج انتباهك*; (3) top demand signals in their categories; (4) *في خطر*; (5) recent activity; (6) one clear next step.
6. **Demand Board** — aggregated demand, filter by category/wilaya/country/deadline; the 10x screen (§6).
7. **Trip Wizard** — destination, dates, transport, capacity, categories, price policy, pickup points, privacy.
8. **Trip Detail** — manifest, buy list, committed buyers, status timeline, handover schedule.
9. **Verification / Trust Ladder** — visible levels, what each unlocks, progressive document upload (one at a time, never five at once), always explaining *why we ask*.
10. **Document Vault** — ANAE card, general authorization, NIF, CASNOS, with expiry countdowns and renewal reminders.
11. **Digital Ledger (الدفتر)** — simplified accounting record per Art. 4, exportable to PDF/Excel.
12. **Label & Delivery-Note Generator** — produces Art. 14–compliant labels and delivery notes, printable.
13. **Reliability Profile** — component breakdown, transaction count shown more prominently than any score, exportable "record certificate" with QR.
14. **Credits & Billing** — prepaid packs, CIB/Edahabia, **and a manual CCP/BaridiMob transfer flow with receipt upload** (mandatory — a large share of the market will pay no other way).

### 7.3 Trader
15. **Home / Supply Pipeline** — kanban-style: Request → Matched → Committed → In Transit → Landed → Received. Plus "needs your decision" with expiry timers.
16. **Post a Sourcing Request** — structured spec form (category, specification, quantity, target price band, deadline, delivery wilaya), not a free-text box.
17. **Match Results & Compare** — side-by-side importer comparison: record, historical price band, arrival date, reliability breakdown, verification level.
18. **Price Index** — reference price bands by category and wilaya over time. This is the trader's addictive feature.
19. **Commitment Detail** — agreed spec, price band + tolerance + expiry, quantity, deposit declaration, handover plan, status.
20. **Trader Verification** — RC, NIF/NIS, business address.

### 7.4 Shared
21. **Context-bound Messaging** — every thread pinned to a Request/Trip/Commitment, with structured message templates ("أطلب عرضاً", "أؤكد المواصفة", "أقترح سعراً", "أبلغ عن تأخير") preceding free text. No unilateral deletion.
22. **Handover Flow** — arrival announcement → mandatory timestamped photos → pickup point/window → 6-digit confirmation code → dual confirmation ("سلّمتُ" / "استلمتُ ومطابق") → 48h objection window → mutual review.
23. **Dispute (Lite)** — structured, non-binding mediation. Evidence timeline built from the platform record.
24. **Notifications Center** — in-app + push; SMS reserved for critical events only.

### 7.5 Admin Operations Center (desktop-first, RTL still mandatory)
25. **Queue Console** — six queues (Verification · Risk · Content · Disputes · Compliance Review · Payment Confirmation) with live counts, SLA age, and risk-weighted sort.
26. **Queue Item Workspace** — every piece of evidence needed for the decision in **one panel**: documents, history, risk signals, related conversations, prior decisions on this user. Decision + **mandatory reason code** + note + user-facing consequence.
27. **Compliance Rule Authoring** — no-code conditional rule builder; attach the Journal Officiel reference; **impact preview before publishing** ("this will change 1,240 past answers and affect 87 active trips"); versioned publish with effective date; one-click rollback.
28. **Market Health** — fill rate, time-to-first-response, commitment completion, dispute rate, estimated leakage, liquidity per (category × wilaya), cold-start success rate. **No vanity metrics** — no total users, no page views.
29. **Audit Log Explorer** — immutable, searchable, filterable by actor/object/time.

---

# 8. DASHBOARD DESIGN LAW

Every dashboard must answer, in this order, with visual hierarchy that matches:

1. **What is happening?** → current state (active trip, open pipeline)
2. **What needs attention?** → ranked by urgency, with SLA/expiry timers
3. **What can I do now?** → actionable opportunities
4. **What is at risk?** → uncommitted stock, capacity overflow, expiring documents, stalled commitments
5. **What happened recently?** → activity feed
6. **What should I do next?** → exactly **one** clear recommended action

**Forbidden:** KPI cards that exist to fill space. Every number on screen must be **clickable and decomposable** into its components, and must lead to an action. If a number leads nowhere, delete it.

---

# 9. TRUST DESIGN

### Trust Ladder
| Level | Requires | Unlocks |
|-------|----------|---------|
| L0 مُسجَّل | Algerian phone (OTP) + email | Browse, compliance engine, demand summary |
| L1 هوية مؤكَّدة | National ID + liveness selfie match | Messaging, post request, public profile |
| L2-I مستورد مُتحقَّق | ANAE card w/ micro-import domain + **general authorization** + NIF + CASNOS | Publish trips, appear in matching, receive commitments |
| L2-T تاجر مُتحقَّق | RC + NIF/NIS + business address | Private requests, price index, deposit-backed commitment |
| L3 سجل مُثبَت | ≥N confirmed transactions, no open disputes | Record badge, ranking priority, higher limits |

**Gate actions, never access.** Ask for verification **at the moment the action needs it**, and always explain what it unlocks.

### Reliability Index (replaces star ratings)
Composite, explainable, always decomposable on tap:
- Delivery reliability **30%** · Specification fidelity **20%** · **Price stability 20%** · Responsiveness **10%** · Compliance standing **10%** · Depth (volume & value, time-decayed) **10%**

**Display rules:**
- **Confirmed transaction count is displayed larger and more prominently than the score itself.** In a low-trust market, *"47 معاملة مؤكَّدة"* beats *"4.8★"*.
- A new profile shows **«مستورد جديد — بلا سجل بعد»** honestly and without shame, alongside its verification badge. Transparency beats inflation.
- No score displayed below a minimum transaction threshold.
- Every negative review carries one public right-of-reply, always shown with it.
- A public page explains exactly how the index is computed. Opacity reads as manipulation.

---

# 10. DESIGN DIRECTION

**You must invent an original direction. Do not imitate Stripe, Linear, Airbnb, Shopify, Notion, or any current SaaS template aesthetic.** Those are visual languages for Western products with entirely different trust problems.

**Suggested starting point — "The Manifest" (take it, evolve it, or replace it with something better and justify why):**

Drawn from shipping manifests, customs declarations, the numbered-and-stamped ledger the decree itself requires (Art. 4), serial numbers, carbon-copy forms — and from Algerian light and materials (stone, clay, lime, zellige as *geometry*, never as ornament).

| Dimension | Direction | Rationale |
|-----------|-----------|-----------|
| Personality | Trusted intermediary · organized · candid · unshowy | Mirrors the trust job |
| Visual language | Tabular structure · generous rules and dividers · prominent serial/reference numbers · disciplined whitespace | Evokes a reliable record |
| Color | Warm neutral base (paper/sand) instead of cold gray. An earthy anchor hue (deep olive / deep teal) instead of default SaaS blue. A clay accent for warnings. **Saturated color reserved almost entirely for status.** | Differentiation + semantic clarity |
| Typography | One unified Arabic+Latin family · **tabular figures everywhere numbers matter** · strong heading contrast · monospace for references and serials | Financial legibility |
| Layout | Strict grid · strong alignment · **high information density with low visual noise** | Users are operators, not browsers |
| Density | High in work surfaces; low in critical decision paths | Context sets density |
| Motion | Functional only · ≤200ms · honors `prefers-reduced-motion` · no decorative animation | Performance + seriousness |
| Data viz | Capacity meters · price **bands** (never false-precision lines) · wilaya heat maps · **all RTL-mirrored** | Data honesty |
| Trust signals | Verification chips · transaction count over rating · index breakdown · "last updated" timestamps on every compliance answer | The core of the product |
| Arabic treatment | Arabic leads the design; spacing, alignment, and line height are designed for Arabic first | It is not a translation |

**Explicitly forbidden:** large gradients · glassmorphism · playful 3D illustrations · dark mode as default · over-decorated icons · anything that reads as "game" or "fun shopping" · any element resembling a governmental seal, emblem, or official stamp.

---

# 11. TECHNICAL & PERFORMANCE CONSTRAINTS

- **Mobile-first PWA**, installable. Assume **85%+ mobile**, mid-range Android, unstable 3G/4G, metered data.
- **Performance budget:** initial JS < 200KB gzipped · LCP < 2.5s on 3G · responsive images in WebP/AVIF · strict lazy loading.
- **Fonts:** subset, WOFF2, preload, **one family covering Arabic + Latin**, not three. Arabic webfonts are heavy — treat font weight as a performance decision.
- **Works from 320px width.** Tables become cards; the page body never scrolls horizontally.
- **Touch targets ≥44px**, primary actions in the thumb zone (lower half of the screen).
- **Offline tolerance:** local drafts, a send queue, and an explicit "will send when you're back online" state. Algerian network reality demands this.
- **Camera is a first-class citizen:** product photos, document capture, handover proof — with on-device compression before upload.
- **Hosting must be in Algeria** (Law 25-11 data sovereignty; Law 18-05 `.dz` requirement). Do not design flows that depend on foreign third-party scripts or services.
- **Accessibility:** WCAG 2.1 AA minimum. Contrast ≥4.5:1 for text. Full keyboard operability on admin surfaces. Visible focus states that work in RTL. Never encode meaning in color alone — always pair with icon + text. Screen-reader labels in the active language.

---

# 12. TRILINGUAL & RTL — ARABIC IS A FIRST-CLASS LANGUAGE

**Arabic (RTL) is the default and the design reference. French (LTR) and English (LTR) are derived from it — never the reverse.**

### Mandatory technical rules
- **Logical CSS properties only:** `margin-inline-start`, `padding-inline-end`, `inset-inline`, `text-align: start`, `border-inline`. **`left` / `right` are forbidden in layout.**
- `dir="rtl"` on the root; correct `lang` on every text block.
- **Three locale bundles from day one.** Arabic plural rules (zero/one/two/few/many/other) supported from the start. No "we'll translate later".
- Mixed-direction text (Arabic + Latin brand names + digits) must be explicitly handled with `bdi` / `unicode-bidi: isolate`. Test *«معطف Zara مقاس L بسعر 5,400 دج»*.

### Typography
- Arabic line-height **+10–15%** vs Latin.
- ⛔ **Never apply `letter-spacing` to Arabic** — it breaks letter joining and destroys legibility.
- ⛔ **Never apply `text-transform: uppercase`** — meaningless in Arabic.
- Arabic reads visually heavier: use **one weight step lighter** than the Latin equivalent to achieve equal perceived weight.

### Numerals — critical local decision
> **Use Western Arabic numerals (0–9). Do NOT use Eastern Arabic-Indic numerals (٠–٩).**
> In Algeria, everyday, official, and commercial usage is 0–9. Using ٠–٩ reads as foreign and destroys scannability of financial figures.

- **Tabular figures** in every financial and capacity column.
- Currency format: `1 800 000 دج` — space separators, symbol after the number in Arabic.
- Dates: Gregorian by default; offer Hijri display in legal/regulatory contexts (the decrees themselves are dated in Hijri).

### Mirroring
| Mirror ✅ | Do not mirror ❌ |
|-----------|-----------------|
| Layout, columns, sidebars | Logos |
| Arrows & chevrons (back/next) | Camera, clock, lock icons |
| Progress bars & fill direction | Photographs |
| Timelines & steppers | Phone numbers, URLs, foreign currency symbols |
| Table alignment & sort arrows | Universally-directional domain icons |
| Chart category axes | Time-series time direction (decide per case and be consistent) |

### Text expansion
French runs **+15–25% longer** than English. Arabic is often shorter in characters but **taller in line height**. **No fixed-width buttons, badges, or column headers.** Test every component with the longest French string and the widest Arabic string.

---

# 13. UX PRINCIPLES (each has a reason — honor the reason, not just the rule)

1. **Value before signup.** The compliance checker works with no account — prove value before asking for trust.
2. **Gate actions, not access.** Early verification walls destroy conversion.
3. **Always explain "why we're asking."** This audience is wary of surveillance; transparency converts fear into cooperation.
4. **Compute, don't ask.** Headroom, quota, eligibility, expiry, compatibility — all derived, never typed.
5. **Show the constraint at the moment of input.** *"بقي 240,000 دج"* while building the list — not an error message afterward.
6. **Every state is designed.** Empty · loading · error · partial · offline · pending · rejected · blocked.
7. **Numbers are auditable.** Every composite figure decomposes on tap. Black boxes read as manipulation.
8. **Compliance is a companion, not a gatekeeper.** It guides and warns; it does not lecture or block.
9. **Never promise what you can't guarantee.** No "guaranteed", no "100% safe", no "certified".
10. **Design for slow.** 3G, mid-range device, expensive data. Speed is a trust signal here.

---

# 14. FEATURES TO AVOID (deliberately cut — do not reintroduce them)

`Consumer B2C marketplace` · `Transaction fees on goods` · `Internal escrow or wallet` · `In-app payment for merchandise` · `Foreign supplier directory` · `Currency exchange rates of any kind` · `"Guaranteed delivery" or "buyer protection" language` · `Star-only ratings` · `Gamification badges, streaks, levels` · `Public importer storefronts with prices visible to the general public` · `Automatic recurring card billing` · `Customs declaration submission` · `Product tour on first launch` · `Any AI feature that produces legal conclusions in the platform's own voice`

---

# 15. BUILD ORDER

**Phase 0 — The Wedge (design & ship first):**
Public compliance checker · cap/quota/shelf-life calculators · regulation reference · shareable WhatsApp result cards.

**Phase 1 — The Network:**
Identity & roles · trust ladder L0→L2 · document vault · sourcing requests · **aggregated demand board** · importer directory · structured messaging · admin queues · full AR/FR/EN.

**Phase 2 — Operations:**
Trips & capacity ledger · matching engine · commitments · handover protocol · reviews & reliability index · digital ledger · label generator · credits & billing · dispute lite.

**Phase 3 — Depth:**
Risk engine · advanced moderation · Pro subscriptions · user analytics · price index · exportable record certificate.

**Ordering principle:**
> **Demand before supply. Trust before transaction. Compliance before marketplace. Record before monetization.**

---

# 16. FUTURE SCALABILITY — design so these fit without restructuring

- A consumer **discovery** layer (B2B2C): consumers find *verified traders* who carry imported goods — never the importer directly.
- A **National Demand Index** data product (anonymized, aggregated) sold to wholesalers, manufacturers, banks, and researchers.
- **Institutional integrations:** automated verification against ANAE, customs data exchange, microfinance partners.
- **Licensed escrow via a partner** — never built in-house.
- **Export direction** (the supervising ministry is "Foreign Trade and Export Promotion") — the same trip/capacity/compliance architecture inverted.
- **Other Law 22-23 activities** on the same identity/compliance/reputation layer.
- **Regional expansion** (Maghreb) — keep every regulatory rule in the parameterized rule engine, never in the UI.

---

# 17. WHAT I EXPECT FROM YOU

1. Inspect the project. Report what's there.
2. Deliver UX architecture, information architecture, design direction, and component strategy — with reasons.
3. Then build, highest-value flow first: **the public compliance checker**, then **the demand board with the three capacity meters**.
4. Make the aesthetic decisions yourself. Do not ask me to pick colors, fonts, or layouts.
5. Design Arabic-first, mobile-first, and design every state — including the ugly ones.
6. If anything in this brief is internally inconsistent or would produce a bad product, **say so and propose a better approach.** I want a design partner, not an executor.
