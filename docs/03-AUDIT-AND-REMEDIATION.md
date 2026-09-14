# Maabar — Product & Design Audit + Remediation Plan
**Date:** 14 September 2026
**Auditor role:** Lead Product Engineer / UX Architect / Design Systems / Product Auditor
**Inputs audited:** 17 `.dc.html` artboards + `DESIGN.md` + `README.md` (Claude Design handoff), `docs/01-PRODUCT-STRATEGY.md`, `docs/02-MASTER-PROMPT-CLAUDE-DESIGN.md`

---

## 0. REPOSITORY AUDIT — the finding that reframes this engagement

Brief §28 asks me to identify the framework, routes, components, design tokens, and data assumptions of the existing codebase, then improve it incrementally rather than rewrite.

**There is no codebase.**

```
C:\Users\ii\Desktop\market place\
├── .claude\launch.json          ← created by me, preview server only
└── docs\
    ├── 01-PRODUCT-STRATEGY.md
    ├── 02-MASTER-PROMPT-CLAUDE-DESIGN.md
    └── PROMPT-READY-TO-PASTE.md
```

- No `package.json`, no `tsconfig`, no framework, no routes, no components, no build, no git.
- The "handoff" is **17 design-canvas artboards** (`.dc.html`) — a proprietary Claude Design format that renders through `support.js` against `window.React`. They are **design documents, not an application**. They cannot be deployed, routed, tested, or extended.
- Every design token lives as an **inline `style=""` string**, repeated. `Demand Board.dc.html` alone contains ~60 hardcoded `oklch()` literals. There is no token layer, no component layer, no state layer that survives translation to a real app.

**Consequence:** "fix and optimize the codebase" has no target. The real work is to **build the codebase**, using the artboards as a high-quality reference — keeping what is strong, correcting what is weak, and discarding the artboard format entirely.

This is good news, not bad: there is no legacy to protect, so the architectural corrections in §3 below cost nothing to make now and would be expensive later.

### 0.1 Stack decision (made, not asked)

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | One runtime serves both needs: server-rendered public pages for SEO and WhatsApp link previews (the acquisition wedge), and the authenticated app shell. The handoff proposed *"server-rendered public pages + a separate Preact PWA shell"* — two rendering models and two bundles for no benefit. Rejected. |
| Styling | **Tailwind v4** | Native logical properties (`ms-`/`me-`/`ps-`/`pe-`/`start-`/`end-`) make RTL-first structural, not a discipline someone has to remember. It also eliminates the inline-style sprawl that makes the artboards unmaintainable. |
| Data | **PostgreSQL + Drizzle** | The versioned regulation model (`rule_set_version`, `limit_parameter` with `effective_from`/`effective_to`) needs real relational integrity and point-in-time queries. This is the one part of the system that must never be approximated. |
| Hosting | **Plain Node, deployable to Algerian infrastructure** | Law 25-11 (data sovereignty) + Law 18-05 (`.dz`). No platform lock-in that would force foreign hosting. |
| PWA | **Installable, offline-tolerant** | Importers use this abroad on roaming. Non-negotiable, but Phase 2 — not day one. |

---

## 1. AUDIT OF THE DESIGN HANDOFF

### A. What is excellent — preserve with minimal change

1. **The Admin evidence→decision→reason→audit loop.** `Admin Console.dc.html` is the single strongest artifact in the handoff. Everything needed for a decision sits in one panel; the reason code is mandatory; the audit entry is explicitly immutable — *"لا يمكن تعديله — التصحيح يتمّ بقرار جديد يُشير إليه"* (corrections are made by a new decision referencing the old, never by editing). That is how a real trust-and-safety console works. Keep it wholesale.

2. **The rule-authoring impact preview.** Before publishing rule version v7, the admin is told: *"87 رحلة نشطة ستتلقّى تنبيهاً بتغيّر حكم صنف داخل قوائم شرائها. أرسِل التنبيه مع نصّ السبب — لا كإشعار صامت."* Publishing is versioned, non-retroactive, and rollback-able. This is better than most production compliance systems. Keep.

3. **The committed/indicated demand split.** Never conflated, visually distinct, with a confidence sheet exposing four auditable signals (verified traders, commitment ratio, recency, category reports). This is the product's intellectual core and it is correctly built.

4. **Price-index honesty rule.** *"لا يُعرض نطاق لفئة × ولاية دون 5 معاملات مؤكَّدة في آخر 90 يوماً — نقول «بيانات غير كافية» بدل رقم مضلّل."* Refusing to show a number rather than showing a bad one. Rare discipline. Keep.

5. **Sourcing-request asymmetry protection.** *"نطاق سعرك لا يُعرض للمستوردين كرقم واحد، بل كنطاق. لا نعرض عليهم سقفك الأعلى قبل أن يقترحوا — ولا نعرض لك تكلفة شرائهم."* Protects both sides' negotiating position symmetrically. Genuinely thoughtful.

6. **Device-local value estimates.** The capacity value meter needs a purchase price, but the purchase price is the importer's secret. Resolution: the estimate is stored on device and never transmitted; the server sees only quantities. This resolves a real contradiction in the original brief rather than papering over it.

7. **RTL discipline.** Zero physical `margin-left/right` across all 17 files. Correct mirroring, `bdi` on mixed-direction fragments, tabular numerals, Western digits. The `letter-spacing`/`uppercase` occurrences are inside "never do this" documentation. This is textbook.

8. **State coverage.** Loading, empty, error, offline, partial, pending, under-review, blocked-at-customs — including the unglamorous ones. Preserve.

### B. What is weak

1. **The Trader is a second-class citizen.** Brief §17 is right. The trader surface is a request pipeline plus a price index. There is no discovery: no browsing importers, no browsing upcoming trips, no "who is going to Istanbul in October", no recommendations. A trader who has no active request has nothing to do in the product. That is a retention hole.

2. **Trip is under-modelled as a discoverable object.** `Trip` exists richly for the importer who owns it (wizard, manifest, timeline) and barely at all for the trader who wants to find one. A published trip is inventory-in-motion; it should be browsable.

3. **Landing is value-led in the hero but negation-heavy overall.** The hero is fine — *"اعرف واش يطلبو التجار — قبل ما تشري"* sells the value. But of five sections, two are about limits: a six-item "ما لا نفعله" grid and a privacy section, plus a negation line sitting directly under the primary CTA (*"لا نطلب هويتك... لا نسأل عن مورّدك"*). The cumulative impression is defensive. Brief §15 is directionally right, though it overstates: the hero itself is not the problem.

4. **No product imagery anywhere.** Not one image, avatar, or photograph in 17 artboards. For apparel, cosmetics, and accessories — the actual categories — this is disqualifying. Nadia the Instagram trader "sells by the photo"; the handoff gives her none.

5. **Reputation is under-visualised relative to its importance.** Transaction count over score is the right call, but the trust profile is rows of text. Trust is the product's hardest-won asset and its weakest visual moment.

### C. What is too restrictive

1. **"Not a marketplace" was applied literally and the commerce drained out.** My own strategy document (§5.2) is the origin of this, and brief §3 is a fair correction. The legal constraint is real — *Maabar must never be the seller* — but that constraint forbids **Maabar transacting**, not **users discovering**. The handoff deleted discovery along with the liability. Result: a compliance console with a demand feed attached.

2. **The "no cards, rules-only" rule is over-applied.** `DESIGN.md` states *"Rules (1px) instead of cards where possible."* Applied uniformly across 17 boards, it produces a monochrome document aesthetic on every surface — including surfaces (product, profile, recommendation, comparison) where a card is the correct container because it represents a discrete, comparable, tappable entity. Brief §14 is right.

3. **Consumer is absent entirely.** Zero surface. This followed my own earlier recommendation to defer it on the Law 18-05 / commercial-register conflict. See §2 — the user's reframing resolves that conflict and I was over-cautious.

4. **Uniform density.** One density level across landing, marketplace, operations, and admin. Brief §23 is correct: density must be contextual.

### D. What is over-engineered

1. **Five of seventeen artboards are specification documents, not screens** — `State Coverage`, `System States`, `Taxonomy and Entitlements`, `Trilingual and RTL`, `Design System`. Their *content* is valuable; their *form* is wrong. In a real repo these become: a state enum + Storybook stories, a token file, an i18n test suite. As artboards they consume a third of the deliverable and produce nothing runnable.

2. **The `Importer Records` "الوسم" (labelling) tab is a stub.** `<sc-if value="{{ tabLabels }}">` exists and renders nothing. The Art. 14 label/delivery-note generator I built yesterday as a standalone board should be folded into this tab rather than living separately — the tab was the right home, it was simply never filled.

3. **Reference-ID ceremony is applied indiscriminately.** `TRP-26-0412`, `REQ-26-1180`, `CMT-26-0331`, `RUL-0042`, `ADM-014`, `PAY-26-0768`. Correct on commitments, disputes, and audit entries where the ID is the legal handle. Noise on a consumer-facing product card.

### E. What is missing

| Missing | Severity | Note |
|---|---|---|
| **Consumer experience entirely** | P0 | No marketplace, search, categories, product page, seller profile, wishlist |
| **Product Listing as a first-class object** | P0 | Referenced in `State Coverage` only; has no UX. Brief §5 requires it |
| **Trip discovery for traders** | P0 | Trips are invisible to the people who need them |
| **Importer discovery / directory** | P0 | Traders cannot browse or compare importers outside a match result |
| **Product imagery pipeline** | P1 | Upload, compression, moderation, display |
| **Search** | P1 | No search anywhere in the product |
| **Saved / wishlist / follow** | P2 | Lightweight retention primitive, currently absent |
| **Onboarding for the trader and consumer roles** | P1 | Only the importer has a modelled entry path |

### F. What creates commercial friction

1. **No discovery = no top of funnel.** Every commercial path requires the trader to already know what they want and to post a structured request. There is no browsing, no serendipity, no "I didn't know someone was flying to Guangzhou next week."
2. **The product looks non-commercial.** A user landing on a beige, ruled, monochrome document does not think "business happens here." Perceived liquidity is itself a conversion factor in marketplaces.
3. **Negation-forward copy suppresses intent.** Six "لا..." statements mid-funnel invite the question "so what *do* you do?"
4. **No lightweight action below "post a structured request."** Nothing between passive reading and high-commitment posting — no save, no follow, no "notify me", no express interest.

### G. What creates UX friction

1. **Empty-handed trader** has no screen that does anything for them.
2. **Scent of action is weak** — uniform rules and identical type weights mean nothing announces itself as tappable.
3. **Density/comprehension mismatch on first-run** — new users meet operator-grade density immediately.
4. **Multi-step disclosure on the compliance verdict.** The artboards show verdict + reason + citation + updated + next step + disclaimer stacked simultaneously. Brief §8 is right: answer first, evidence on demand.

### H. What creates legal ambiguity

1. **🔴 The payment contradiction is real — but the correct fix is disambiguation, not deletion.**
   The audit log in `Admin Console.dc.html` contains:
   `event: 'تأكيد دفع يدوي — وصل CCP مطابق', obj: 'PAY-26-0768'`
   Brief §11 reads this as the platform processing payments. It is subtler than that: this is a **CCP transfer for the user's own Maabar subscription credits** (`Importer Records` → "الرصيد" tab) — Maabar charging its own customer, which is ordinary and lawful. The defect is that it is **labelled generically and queued beside goods-related items**, so it reads as if Maabar settles trade payments.
   **Fix:** rename to *Subscription payment confirmation*, move it out of the trust-and-safety queue group into Billing, and never let a `PAY-` object reference a Commitment. Deleting it outright would break legitimate revenue collection — which brief §11 does not intend.

2. **Deposit language needs one permanent, non-dismissible treatment.** Currently present but phrased differently in different places. It must be a single component with fixed wording, not copy written per screen.

3. **The "ما لا نفعله" grid is legally useful but commercially placed wrong** — it belongs in Terms and a footer disclosure, surfaced contextually, not as a primary landing section.

### I. What creates future technical debt

1. **Inline styles everywhere.** ~60 `oklch()` literals in one board. No token layer. Any palette change is a find-and-replace across 17 files.
2. **No component boundaries.** The capacity meter is re-implemented per board instead of existing once.
3. **Copy is embedded in logic.** Translation strings live inside `L = {ar:…, fr:…, en:…}` objects inside component classes. Unextractable, untestable, unreviewable by a translator.
4. **Regulatory values are parameterised *per board*.** `P = { maxValue: 1800000, maxTrips: 2 }` appears as a local constant in `Importer App`, `Demand Board`, and others. The *intent* (no hardcoding) is right; the *implementation* hardcodes in multiple places. This must become one versioned source of truth.
5. **`.dc.html` is a dead end.** It is not a deployable format. Every hour spent polishing artboards is an hour not spent on the product.

### J. What should be redesigned

| # | Item | Verdict |
|---|---|---|
| 1 | Add a **Discovery layer** (marketplace) across all three roles | **New build** |
| 2 | **Consumer experience** end-to-end | **New build** |
| 3 | **Product Listing** object + card + detail + management | **New build** |
| 4 | **Trader Home** — from pipeline to discovery-led home | **Redesign** |
| 5 | **Landing** — value-led; limits moved below the fold | **Restructure** |
| 6 | **Visual system** — four density/tone tiers instead of one | **Redesign** |
| 7 | **Trust profile** — make it the strongest visual moment | **Redesign** |
| 8 | **Compliance verdict** — progressive disclosure | **Refactor** |
| 9 | **Admin payment queue** — disambiguate as billing | **Rename + relocate** |
| 10 | Fold **Art. 14 labels** into the Records stub tab | **Merge** |
| 11 | Convert 5 spec artboards → tokens, enums, Storybook, i18n tests | **Convert** |

---

## 2. THE ONE STRATEGIC CORRECTION I OWE THE USER

My strategy document (`01-PRODUCT-STRATEGY.md` §1.1, §3.3) recommended **deleting the consumer surface from v1**, reasoning that Décret 25-170 Art. 4 exempts micro-importers from the commercial register while Law 18-05 requires an e-supplier to hold one — so the importer cannot lawfully sell to consumers online.

**That reasoning is sound but the conclusion was over-drawn.** The brief's §4C framing resolves it:

> The consumer's job is *"find a product available through a trustworthy **seller**."*

The seller is the **trader** — who holds a commercial register. A consumer marketplace where listings are published by RC-holding traders is squarely inside Law 18-05, not outside it. The constraint was never "no consumer"; it was **"the micro-importer must not be the one selling to the consumer."**

That constraint survives intact and becomes a **structural rule** in the data model, not a reason to delete a third of the product:

```
Importer  ──sells to──>  Trader (RC)  ──sells to──>  Consumer
   │                         │
   └── never listed to consumers
                             └── the only actor who may hold a consumer-facing Product Listing
```

**Enforcement:** a `ProductListing` requires `seller.role === 'trader' && seller.verification >= L2-T && seller.rc_verified`. Importer inventory surfaces only in B2B contexts. This is a database constraint, not a UI convention.

My earlier position cost the product its commercial layer. The correction is right and I am building to it.

---

## 3. PRIORITISED REMEDIATION PLAN

Mapped to brief §29. Each item states what ships.

### P0 — Foundations (must exist before any screen is meaningful)
| # | Work | Ships |
|---|---|---|
| 0.1 | Scaffold Next.js + TS + Tailwind v4 + Drizzle; RTL-first root layout | Running app, `/` renders |
| 0.2 | **Token layer** — colour, type, spacing, elevation, density tiers — extracted from the artboards into CSS variables | One source of truth; no inline `oklch()` |
| 0.3 | **i18n layer** — AR/FR/EN message catalogues as data files, Arabic plural categories, `bdi` helper, number/date/currency formatters | Translator-editable; testable |
| 0.4 | **Regulation config** — `regulation`, `rule_set_version`, `limit_parameter`, `restriction_rule` with effective dates; one accessor | No regulatory value in any component |
| 0.5 | **Role & capability model** — roles as capabilities on one account; context switcher | Importer/trader/consumer/admin |

### P0 — Product/UX contradictions
| 0.6 | Disambiguate billing vs. trade payment; `PAY-` may never reference a `Commitment` | Admin IA corrected |
| 0.7 | Single permanent `DepositDisclosure` component with fixed wording | One place, one wording |
| 0.8 | `ProductListing` constrained to RC-verified traders at the schema level | Structural legal guarantee |

### P0 — Navigation & IA (per brief §20)
| 0.9 | Four distinct role navigations; mobile bottom nav; admin desktop rail | Each role gets its own IA |

### P0 — Core workflows
| 0.10 | **Marketplace / Discovery** — search, categories, listing cards, listing detail, seller profile | The missing commercial layer |
| 0.11 | **Consumer experience** — home, marketplace, saved, requests, messages, profile | New role, low density |
| 0.12 | **Trader Home redesign** — discovery-led: trips, importers, recommendations, then pipeline | Retention for empty-handed traders |
| 0.13 | **Importer Home** — preserve structure, apply new visual tiers | Brief §16 order |
| 0.14 | **Trip discovery** — published trips browsable by traders | Inventory-in-motion becomes visible |
| 0.15 | **Trust profile** — the product's strongest visual moment | Brief §10 |
| 0.16 | **Compliance verdict** — progressive disclosure: answer → why → basis → source → action | Brief §8 |

### P1
Visual hierarchy across the four tiers · responsive behaviour · component consistency (brief §25 inventory) · Arabic RTL verification per screen · FR/EN parity tested per screen · product imagery pipeline · Art. 14 labels merged into Records.

### P2
Micro-interactions · meter fill animation · cosmetic polish.

**Explicitly out of scope** (brief §32): AI features, maps, wallets, escrow, payment processing for goods, social feeds, gamification, crypto, decorative charts.

---

## 4. THE FOUR VISUAL TIERS

The single most important design correction. One aesthetic currently covers four incompatible jobs.

| Tier | Surfaces | Density | Character | Containers |
|---|---|---|---|---|
| **Public** | Landing, marketplace, listing detail, seller profile | Low | Modern, visual, confident, imagery-led | Cards with restrained elevation |
| **Operational** | Importer home, trip, demand board, trader pipeline, commitments | Medium | Precise, live, instrument-like | Mixed: cards for entities, rules for data |
| **Compliance** | Verdict, citations, regulation reference | Medium | Evidence-driven, calm, progressive | Rules and disclosure |
| **Admin** | Queues, evidence panel, rule authoring, audit | High | Dense professional tooling | Tables and panels |

"The Ruled Ledger" stays as **visual DNA** — tabular figures, reference numbers as typographic objects, rules as structure, restraint with colour, status-reserved saturation. It stops being a uniform.

---

## 5. WHAT HAPPENS NEXT

Beginning P0.1–P0.5 — scaffold, tokens, i18n, regulation config, role model. Nothing visual ships until the foundation is real, because every screen depends on it and rebuilding screens against a late token layer is exactly the debt this audit exists to prevent.
