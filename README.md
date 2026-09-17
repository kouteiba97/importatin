# Maabar (مَعْبَر)

A commercial network for Algeria's legalised micro-import trade — **تجارة الكابة / تجارة الشنطة**.

Algeria legalised micro-importing in June 2025 through **Executive Decree 25-170**. Thousands now hold a licence to import goods personally, on their own trips abroad, with their own foreign currency — capped at **1,800,000 DZD per trip, 2 trips per month**.

The problem: they fly to Istanbul or Dubai carrying their savings in hard currency and **buy on a guess**. Guess wrong and their capital freezes in unsold stock, and the monthly cap means they cannot recycle it.

Maabar connects the micro-importer, the trader, and the consumer through discovery, verified demand, trust, and structured records. It is **not** a seller, payment processor, escrow service, customs system, or shipping company.

---

## Contents

| | |
|---|---|
| **[`HANDOFF.md`](HANDOFF.md)** | Full context for anyone (or Claude) continuing on another machine: decisions, history, current state, next steps. **Read this first.** |
| **[`DESIGN-AUDIT.md`](DESIGN-AUDIT.md)** | The audit. Verdict, role/capability matrix, screen inventory, user journeys, state coverage, legal holds. |
| **`designs/`** | 24 product screens, `index.html` (review hub), `tokens.css` (colours/type), `web.css` + `shell.js` (web platform layout and navigation), `Logo.dc.html` (brand kit), `Dashboards.html` (three-role deck) |
| **`tools/`** | The generator used to convert screens to the web layout, and a QA check |
| **`docs/history/`** | Strategy, Claude Design prompts, earlier audits |
| **`preview/`** | Local server for viewing the screens |

---

## Brand

**Maabar** — مَعْبَر, *crossing point*. The name is the product.

The mark is an **M built from two arches**: two passages meeting on one line. Monoline geometric — one stroke weight, round caps, no gradient, no fill, no depth. That is a constraint rather than a style: the Article 14 label is a legal obligation, frequently printed on single-colour thermal paper, and the mark has to survive there and at 16px as a favicon. The full kit is `designs/Logo.dc.html`.

**The logo is Latin in all three interfaces.** `مَعْبَر` is a localised wordmark variant used only inside the Arabic interface — never a second line under the Latin.

| | |
|---|---|
| **Brand** | Blue `--brand`, navy `--brand-dark` |
| **Status** | Green / amber / red — compliance verdicts **only** |
| **Roles** | Purple importer · blue trader · neutral consumer |
| **Charts** | Teal `--viz-1` — never text, never a button, never the logo |
| **Type** | Sora (wordmark, display) · Inter (Latin UI) · IBM Plex Sans Arabic (Arabic UI) |

Brand colour and status colour are deliberately disjoint. On a product whose core feature is a compliance verdict, a green brand would mean *"this is Maabar"* and *"this good is legally permitted"* at the same time. **No brand element uses `--allowed`; no verdict uses `--brand`.** Every text pairing clears WCAG AA 4.5:1, verified by script against the token file.

---

## Languages

**Three equals: English, French, Arabic** — on all 24 screens. Arabic is not the source language and not the default. Locale comes from `?lang=` in the URL, else the browser, else **French**; direction derives from the locale rather than being hardcoded. Append `?lang=en`, `?lang=fr` or `?lang=ar` to any screen to open it in that language.

One thing never translates: the **Article 14 label** is legally Arabic, so its preview stays Arabic in every interface language.

---

## Viewing the design

The screens are Claude Design artboards (`.dc.html`). They need a React runtime that the Claude Design canvas normally injects — the preview server supplies it:

```bash
node preview/server.js
```

Then open <http://localhost:4321> — the **design review hub**: every screen grouped by surface (public website, importer app, trader app, operations console, brand), rendered at desktop width (1440px), with ←/→ navigation and an EN / FR / ع switch.

Boards with a chip row at the top or bottom are **state-switchable** — click through to see loading, empty, error, offline, pending, rejected, expired and success states.

---

## Status

**Design complete. No application code yet.**

24 screens in three languages, one token layer, both directions supported throughout. Every P0 user journey is drawn end to end.

**One module is held pending Algerian legal review:** the deposit declaration in `Commitment` — see `DESIGN-AUDIT.md` §9.2. Everything else is buildable.

---

## Before writing code

Ten decisions were settled during design. Do not re-open them while implementing:

1. **An importer never sells to a consumer.** Enforce at schema level: a listing requires `seller.role === 'trader' && rc_verified`. Decree 25-170 art. 4 exempts micro-importers from the commercial register while Law 18-05 requires one of an online supplier — the trader resolves that conflict, the importer would create it.
2. **No transaction fee, no escrow, no payment for goods.** Subscription billing only, and it may never reference a commitment.
3. **No composite trust score.** Countable facts only, each decomposable into its raw inputs.
4. **Regulatory values are configuration with effective dates**, never constants.
5. **Reviews only from recorded transactions**, never deleted, always with a right of reply.
6. **Admin corrections are new decisions referencing the old**, never edits.
7. **Numbers are always LTR-isolated** (`U+2066…U+2069`); Arabic is never letter-spaced or uppercased.
8. **Compliance answers first, evidence on demand** — never legal text before the verdict.
9. **Import pre-declaration happens on anae.dz.** Maabar reminds; it never files.
10. **The deposit field stays behind a feature flag** until §9.2 is answered.

---

## Known gaps

- All 24 screens are trilingual (EN / FR / AR). The French and Arabic copy has not yet been reviewed by native commercial writers.
- **Maabar is a web platform, not a mobile app.** 20 of 24 screens now use the desktop web layout (public website header, or importer/trader sidebar app); the operations console was already desktop. **Still to convert:** Seller Profile, Saved, Compliance Checker, Onboarding, and the `Dashboards.html` deck (still shows phone frames). See `HANDOFF.md` §6.
- Product imagery uses designed category placeholders, not real photography.
