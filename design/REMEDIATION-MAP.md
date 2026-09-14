# Maabar — Design Remediation Map
**Phase:** Design only. No application code.
**Date:** 14 September 2026
**Inputs:** 17 existing artboards · `DESIGN.md` · `README.md` · `docs/01-PRODUCT-STRATEGY.md` · `docs/02-MASTER-PROMPT-CLAUDE-DESIGN.md` · `docs/03-AUDIT-AND-REMEDIATION.md`

---

## 1. THE CORRECTION IN ONE SENTENCE

The existing design is **a compliance console with a demand board attached**.
It must become **a commercial network with compliance built into its infrastructure**.

Everything below serves that single correction.

---

## 2. PER-ARTBOARD REMEDIATION MAP

| # | Artboard | Keep | Modify | Redesign | Replace | Why |
|---|----------|:----:|:------:|:--------:|:-------:|-----|
| 1 | `Index` | | ✓ | | | System map must now cover ~30 boards in two groups (screens vs. specification) |
| 2 | `Landing` | | | ✓ | | Hero idea is right; 2 of 5 sections are negation. Rebuild as: value → discovery → how → trust → compliance → CTA |
| 3 | `Compliance Checker` | | ✓ | | | Verdict is correct but all five evidence layers render at once. Apply progressive disclosure |
| 4 | `Compliance Checker Trilingual` | ✓ | | | | AR/FR/EN parity proven; `dir` flip verified. Becomes the canonical checker |
| 5 | `Demand Board` | | ✓ | | | Core logic excellent. Needs: operational tier treatment, imagery on category rows, clearer meter hierarchy (legal vs. own) |
| 6 | `Importer App` | | ✓ | | | Structure matches brief §16 order. Needs tier treatment + listing entry point |
| 7 | `Importer Trust` | | | ✓ | | Trust is the product's hardest-won asset and currently its weakest visual moment. Must become visual, scannable in seconds |
| 8 | `Importer Records` | | ✓ | | | Ledger + credits are sound. `الوسم` tab is a **dead stub** — must be filled |
| 9 | `Labels and Delivery Notes` | | | | ✓ | Correct content, wrong home. **Merged into `Importer Records` → الوسم**, then deleted as a standalone board |
| 10 | `Trader App` | | | ✓ | | Trader is a second-class citizen: pipeline + price index only. No discovery. Rebuild discovery-led |
| 11 | `Shared Flows` | ✓ | ✓ | | | Handover protocol and dispute timeline are strong. Add: save/follow, contact-seller, express-interest |
| 12 | `Admin Console` | ✓ | ✓ | | | **Best artifact in the handoff.** Only change: separate subscription billing from trade, per audit §1.H |
| 13 | `State Coverage` | | | | ✓ | Knowledge is valuable, form is wrong → becomes specification doc, not a screen |
| 14 | `System States` | | | | ✓ | Same → specification doc |
| 15 | `Design System` | | | ✓ | | Must express **four visual tiers**, cards + rules, elevation policy, imagery system |
| 16 | `Trilingual and RTL` | | | | ✓ | → specification doc |
| 17 | `Taxonomy and Entitlements` | | | | ✓ | → specification doc |

**Totals:** 3 keep · 7 modify · 5 redesign · 5 convert-or-merge.

---

## 3. NEW ARTBOARDS REQUIRED

The commercial layer that was deleted along with the liability.

### Group A — Public / Consumer (visual tier, low density)
| # | Artboard | Job |
|---|----------|-----|
| N1 | **Marketplace** | Browse, search, categories, filter, sort. The commercial front door |
| N2 | **Product Detail** | What is it · who sells it · are they trustworthy · is it available · how do I ask |
| N3 | **Seller Profile** | Public-facing storefront of a **verified trader**, never an importer |
| N4 | **Consumer Home** | Categories, recommendations, recently arrived, saved |
| N5 | **Saved** | Products, sellers, trips — the retention primitive |
| N6 | **Search** | Contextual, scoped by role. Not one overloaded box |

### Group B — Trader discovery (operational tier, medium density)
| # | Artboard | Job |
|---|----------|-----|
| N7 | **Trader Home v2** | Discovery-led. Must be useful with zero active requests |
| N8 | **Discover — Trips** | "Who is travelling where and when?" — inventory in motion |
| N9 | **Discover — Importers** | Directory with verification, activity, categories, destinations |

### Group C — Supply side
| # | Artboard | Job |
|---|----------|-----|
| N10 | **Product Listing composer** | How a listing is created, priced, and imaged |

### Group D — Foundations
| # | Artboard | Job |
|---|----------|-----|
| N11 | **Design System v2** | Four tiers · cards + rules · elevation · **imagery system** |
| N12 | **Trust Profile v2** | Visual, evidence-based, no fake certification |

---

## 4. THE STRUCTURAL LEGAL RULE (must be visible in the UX, not just the docs)

```
Importer ──sells to──> Trader (RC) ──sells to──> Consumer
   │                       │
   │                       └── ONLY actor who may hold a consumer-facing Product Listing
   └── never appears as a seller to consumers
```

**Enforced in design as:**
- A `Product Listing` carries a **seller badge that always resolves to a trader** with a verified commercial register.
- Importer surfaces appear only in B2B contexts (Demand Board, Trip Discovery, Importer Directory) — never in the consumer Marketplace.
- The Seller Profile shows *"تاجر مُتحقَّق · سجل تجاري مُتحقَّق منه"*, never *"مستورد"*.

Source: Décret 25-170 Art. 4 (micro-importer exempt from the commercial register) vs. Law 18-05 (e-supplier **requires** it). The trader resolves the conflict; the importer would create it.

---

## 5. INFORMATION ARCHITECTURE — verified coherent before any visual work

```
IMPORTER   Demand → Matching → Trip → Capacity → Commitment → Fulfilment → Reputation
           nav: Home · Trip · Demand · Commitments · Messages · Profile

TRADER     Discover → Match → Request → Commitment → Fulfilment → Reputation
           nav: Home · Discover · Requests · Commitments · Messages · Profile

CONSUMER   Discover → Product → Seller → Contact/Request → Follow-up
           nav: Home · Marketplace · Saved · Requests · Messages · Profile

ADMIN      Queue → Evidence → Decision → Reason → Consequence → Audit
           rail: Operations · Users · Verification · Marketplace · Risk ·
                 Compliance · Disputes · Analytics · Audit · Settings
```

**Two deviations from brief §24, with reasons:**

1. **Trader gets `Discover` as the second tab, not `Requests`.** A trader with no active request currently has nothing to do — the retention hole identified in the audit. Discovery must be one tap from home, and posting a request becomes an outcome *of* discovery rather than its precondition.

2. **Admin `Marketplace` splits into `Listings` and `Billing`.** Lumping subscription payment confirmation under a generic operations queue is precisely what produced the payment ambiguity in audit §1.H. Billing is a separate concern with a separate queue and must never reference a `Commitment`.

---

## 6. FOUR VISUAL TIERS

| Tier | Surfaces | Density | Containers | Imagery | Colour |
|---|---|---|---|---|---|
| **Public** | Landing, Marketplace, Product, Seller, Consumer Home, Saved | Low | Cards, restrained elevation | **Required** | Warmer, more saturated accents permitted |
| **Operational** | Importer Home, Trip, Demand, Trader Home, Discover, Commitments | Medium | Cards for entities, rules for data | Thumbnails | Status-reserved saturation |
| **Compliance** | Verdict, citations, regulation reference | Medium | Rules + progressive disclosure | None | Verdict semantics only |
| **Admin** | Queues, evidence, rule authoring, audit | High | Tables and panels | Evidence only | Risk semantics only |

**"The Ruled Ledger" is retained as visual DNA, not as a uniform:** tabular figures, reference IDs as typographic objects, rules as structure, restraint with colour, saturation reserved for status.

---

## 7. IMAGERY SYSTEM

Seventeen artboards contained zero images. For apparel, cosmetics, accessories and watches — the actual categories — that is disqualifying.

**Rules:**
- Every image serves discovery. No decorative stock photography anywhere.
- Product card: 4:5 portrait (apparel/cosmetics read better tall).
- Product detail: 1:1 primary + up to 4 thumbnails.
- Category tile: 16:9.
- Seller avatar: 1:1, circular, with verification chip anchored to it.
- **Placeholder state is designed, never a grey box** — category silhouette on a tinted ground, so an un-imaged listing still looks intentional.
- Trader-supplied photography only. Maabar never supplies product imagery, because Maabar never owns goods.
- Moderation hook: every image passes the admin content queue before going public.

---

## 8. EXECUTION ORDER

1. Design System v2 — tiers, tokens, cards/rules, elevation, imagery *(everything else depends on it)*
2. Marketplace · Product Detail · Seller Profile *(the missing commercial layer)*
3. Consumer Home · Saved · Search
4. Trader Home v2 · Discover Trips · Discover Importers
5. Landing v2 · Trust Profile v2
6. Records `الوسم` merge · Compliance progressive disclosure · Admin billing split
7. Specification docs (states, taxonomy, i18n) extracted from artboards
8. Second product audit · AR/FR/EN verification
9. `DESIGN-REMEDIATION-COMPLETE.md`
