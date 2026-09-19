# HANDOFF — read this first on a new machine

This file is written for **Claude (or a person) picking up the Maabar project on another PC** with no memory of the previous sessions. It explains what the project is, every decision already made, the exact state of the work, and what to do next. Read it fully before changing anything.

Last updated: **19 September 2026**. Remote: `https://github.com/kouteiba97/importatin` (branch `main`).

---

## 1. What Maabar is

**Maabar (مَعْبَر, "crossing point")** is a **web platform (SaaS)** for Algeria's newly legalised micro-import trade (*تجارة الكابة / تجارة الشنطة*).

- **Legal basis:** Executive Decree **25-170** (28 June 2025, JO n°40). Micro-importers may import **1,800,000 DZD per trip, 2 trips per month**, 5% duty, personal and non-transferable, exempt from the commercial register (RC), pre-declaration on **anae.dz**, Article 14 labelling in Arabic.
- **The problem:** importers fly to Istanbul, Dubai, China… with their savings and *buy on a guess*. Wrong guesses freeze capital, and the monthly cap stops them recycling it.
- **What Maabar does:** connects **micro-importers**, **traders** and **consumers** through verified demand, discovery, trust records and structured paperwork.
- **What Maabar is NOT:** not a seller, not a payment processor, not escrow, not customs, not shipping, and it does **not** grant the right to import.

### The three users + admin
| Surface | Who | Shell |
|---|---|---|
| **Public website** | Visitors and shoppers (consumers) | Top header navigation, wide pages |
| **Importer web app** | Verified micro-importers | Left sidebar + top bar |
| **Trader web app** | Verified traders (have an RC) | Left sidebar + top bar |
| **Operations console** | Internal staff (trust & safety, compliance, billing) | Separate platform, desktop |

### The RC paradox (the core legal design rule)
Importers are exempt from the commercial register, but Law 18-05 requires one of anyone selling online to consumers. **So an importer never sells to a consumer.** Importers sell to traders; **traders** list to the public. Every public seller is a verified trader.

---

## 2. The user's instructions and preferences (do not break these)

These came directly from the project owner across the sessions:

1. **Do NOT build the application yet.** No Next.js scaffolding, no `package.json` app, no database schema, no API routes, no auth. This repo is **design + documentation only** until the client approves. (An early session scaffolded Next.js against instructions and had to delete it.)
2. **It is a WEB PLATFORM / SaaS first — NOT a mobile app.** Screens must be designed at desktop width (1440px) with web navigation. A phone-width column with bottom tabs is wrong. *This was the most recent correction and the current work item.*
3. **No explainer text inside the UI.** The designs are shown to a client as the real product. Design rationale belongs in `.md` files and code comments, never as visible copy on a screen.
4. **Three equal languages: English, French, Arabic.** Arabic is **not** the first/source language. Default locale = browser language, fallback **French**.
5. **The logo is Latin** ("Maabar") in all languages. `مَعْبَر` is only a wordmark variant inside the Arabic interface.
6. **Destinations are worldwide** — Istanbul was only an example.
7. **Admin platform is separate** from the user-facing product.
8. **Clean homepage** where a simple shopper finds the marketplace immediately; business users get a clear door. **Signup is entry-driven**: the door you came through sets your role, then KYC follows — no role menu.
9. **Be critical, not agreeable.** Research law from official sources only (Journal Officiel, ANAE, Customs, Ministry of Commerce), never social media. Never hardcode regulatory values — they are configuration with effective dates.
10. Communicate plainly; the owner is not a designer or developer. Show results, don't lecture.

---

## 3. History — what was done, in order

| Phase | Outcome | Where |
|---|---|---|
| 1. Strategy (26-part brief, Arabic) | Market, legal and product analysis; ended with a master prompt for Claude Design | `docs/history/01-PRODUCT-STRATEGY.md`, `02-MASTER-PROMPT-CLAUDE-DESIGN.md`, `PROMPT-READY-TO-PASTE.md` |
| 2. Claude Design output audited | The handoff drifted from the strategy; audit + remediation plan | `docs/history/03-AUDIT-AND-REMEDIATION.md` |
| 3. Design remediation | 24 screens rebuilt, one token file, states, RTL fixes, legal holds | `designs/`, `DESIGN-AUDIT.md` |
| 4. Client clean-up | Removed all explanatory/"rules" text from screens | commits before `9ea661d` |
| 5. Architecture | Admin separated; consumer-first Landing with search hero; entry-driven Onboarding; worldwide destinations | `Landing`, `Onboarding`, `DESIGN-AUDIT.md` §12b |
| 6. Rebrand (v3) | Blue/navy brand, new flat double-arch **M** logo, Sora/Inter/IBM Plex Sans Arabic, **brand colour separated from status colour**, WCAG AA verified | `designs/tokens.css`, `designs/Logo.dc.html`, commit `a075bea` |
| 7. Three languages | All 24 screens EN/FR/AR, `?lang=` override, bidi and plural fixes | commits `9385f35` → `9f749a4` |
| 9. **Experience separation** | One identity, four experiences: public doors, one Sign In, Importer/Trader Setup, Verification Status, Choose Experience, Admin Sign In; eight architecture documents | `PRODUCT-ARCHITECTURE.md` … `FINAL-UX-SEPARATION-AUDIT.md`, `designs/` |
| 8. **Web platform conversion (IN PROGRESS)** | Shared web shell (`web.css`, `shell.js`), review hub (`index.html`), 18 of 22 phone-layout screens rebuilt as desktop web pages | this commit — see §6 |

Older audit files in `docs/history/` are kept for context; **`DESIGN-AUDIT.md` at the root is the current audit** (the web-layout gap it lists is being closed now).

---

## 4. Repository map

```
HANDOFF.md            ← this file
CLAUDE.md             ← short rules auto-loaded by Claude Code
README.md             ← product overview for humans
DESIGN-AUDIT.md       ← current design audit (legal holds, matrix, journeys, states)
designs/
  index.html          ← DESIGN REVIEW HUB: every screen at 1440px, grouped, with EN/FR/AR switch
  tokens.css          ← the ONLY source of colours, type, spacing, radii, shadows
  web.css             ← web platform layout: .app shell (sidebar) and .site shell (public header)
  shell.js            ← navigation data for each surface in EN/FR/AR (window.MaabarShell)
  support.js          ← Claude Design runtime (do not edit)
  *.dc.html           ← 24 screens (Claude Design artboard format) + Logo.dc.html
  Dashboards.html     ← three-role overview deck (still shows phone frames — to update)
preview/server.js     ← local server; injects React so .dc.html files render outside Claude Design
tools/
  web-shell/          ← generator used to convert screens to the web shell (see tools/README.md)
  qa.js               ← browser QA check (errors, shell present, overflow, direction)
docs/history/         ← strategy, master prompts, earlier audits
.claude/launch.json   ← preview server config for Claude Code's Browser pane
```

---

## 5. How to run and review

```bash
node preview/server.js
```
Open **http://localhost:4321** → the **review hub**. It lists every screen grouped by surface, renders each at a true desktop width scaled to fit, and has ←/→ navigation and an EN / FR / ع switch. Any screen can be opened alone:
`http://localhost:4321/Marketplace.dc.html?lang=fr`. The plain file list is at `/list`.

In Claude Code on the other PC, the Browser pane can start it with the `maabar-preview` config in `.claude/launch.json`.

---

## 6. CURRENT STATE — the web platform conversion

### Why
The owner said: *"it is still presented as a mobile app and I told you it is not."* Screens were a 430px column with bottom tab bars; the deck showed phone frames. Everything is being rebuilt as a desktop web platform.

### How (the pattern — follow it exactly)
- Each converted screen links `web.css` and loads `shell.js` (after `support.js`).
- The template (between `</helmet>` and `</x-dc>`) is replaced by either:
  - **`.app` shell** (importer/trader): sticky 252px sidebar (brand, role badge, nav with badges, settings, user) + 68px top bar (global search, language switch, notifications) + `.page` (max 1360px), or
  - **`.site` shell** (public): sticky header (logo, nav, search, language, saved, messages, avatar) + `.container` (max 1280px) + footer.
- `renderVals()` gets `sh: window.MaabarShell(this.state.lang, '<surface>', '<active nav id>')`.
- Content uses the layout primitives in `web.css`: `.page-head`, `.panel/.panel-h/.panel-b/.panel-f`, `.split` (main + 360px aside), `.split-wide`, `.split-l`, `.cols-2/3/4`, `.stats`, `.pgrid`/`.pcard`, `.tabs-h/.tab-h`, `.fchips/.fchip`, `.btn/.btn-primary/.btn-dark/.btn-lg`, `.note`, `.statebar` (review-only state switcher).
- Artboard size set to `1440 × (page height)` in the `data-props` preview.
- **Screen logic, strings and translations were kept** — only layout markup changed.
- The generator in `tools/web-shell/` did this; `w-*.js` files are the exact recipes used per screen.

### Screen status
| Screen | Surface | Web layout |
|---|---|---|
| Landing | public | ✅ already web (own header, not yet on shared `.site` shell — optional alignment) |
| Consumer Home | public | ✅ converted |
| Marketplace | public | ✅ converted (filter sidebar + 3-col grid) |
| Search | public | ✅ converted |
| Product Detail | public | ✅ converted (gallery + info two-column) |
| **Seller Profile** | public | ❌ **TODO** — still phone layout |
| **Saved** | public | ❌ **TODO** — still phone layout |
| **Compliance Checker** | public | ❌ **TODO** — still phone layout (uses `l.label` not `l.short` in its language list; pass `langKey: 'label'` to the shell) |
| Onboarding | public | superseded — split into **Sign In** (identity), **Importer Setup** and **Trader Setup**; file kept for history, not in the hub |
| **For Importers, For Traders, Sign In, Choose Experience** | public | ✅ new, web (`tools/newscreen.py` + `tools/recipes/`) |
| **Importer Setup, Verification Status** | importer | ✅ new |
| **Trader Setup** | trader | ✅ new |
| **Admin Sign In** | admin | ✅ new |
| Importer Home, Trip, Trip Creation, Demand Board, Messages, Records, Verification | importer | ✅ converted |
| Trader Home, Discover, Importer Profile, Sourcing Request, Commitment, Dispute, Listing Composer | trader | ✅ converted |
| Admin Console | admin | ✅ already desktop (separate platform, own layout) |
| Logo | brand | n/a |
| **Dashboards.html** (deck) | brand | ❌ **TODO** — replace the three phone mockups with browser-window frames showing the desktop screens (the hub's viewer code in `index.html` shows how to scale a 1440px iframe) |

### Next steps, in order
1. Convert **Seller Profile, Saved, Compliance Checker** with the same generator (write `tools/web-shell/w-public-2.js`, modelled on `w-public-1.js`). Before writing markup, list a screen's bindings:
   `awk '/<\/helmet>/,/<\/x-dc>/' "designs/Saved.dc.html" | grep -o "{{[^}]*}}" | sort -u`
2. Update **`Dashboards.html`** to show desktop screens in browser frames.
3. Run QA (see `tools/README.md`) on all screens in EN and AR; view each in the hub in all three languages.
4. Update `README.md` "Known gaps" and `DESIGN-AUDIT.md` §12 to say the web conversion is complete.
5. Commit and push. Then give the owner the hub URL to review.

### Gotchas learned the hard way
- **Do not re-run** a `w-*.js` recipe on a screen that is already converted — `logic` replacements (e.g. Marketplace) would apply twice. The recipes are records and templates.
- Inside `<sc-for ... as="t">` the loop variable **shadows the page strings `t`**. Use other loop names (`tr`, `tb`, `tm`, `tl`).
- Never size things with `100vh` inside content — the review hub sets the iframe height to the page height, so vh-based heights grow forever.
- `.dc.html` needs React on `window`; open screens through the preview server, not as files.
- The Browser pane screenshot crops wide pages; review through the hub (it scales to fit) with the viewport set to ~800×450.

---

## 7. Design system rules (enforced)

- **`tokens.css` is the only colour source.** No new inline `oklch()` except white/navy alpha scrims and computed placeholder hues.
- **Brand ≠ status.** Blue `--brand` / navy `--brand-dark` = identity, buttons, selection, progress. Green `--allowed` / amber `--conditional` / red `--prohibited` = **compliance or outcome verdicts only**. No brand element uses `--allowed`; no verdict uses `--brand`.
- **Role tints:** purple `--role-importer-*`, blue `--role-trader-*`, neutral `--role-consumer-*`.
- **Teal `--viz-1` is chart-only** (3.42:1 — fails as text).
- **Type:** Sora (wordmark/display), Inter (Latin UI), IBM Plex Sans Arabic (Arabic UI). Arabic never letter-spaced or uppercased.
- **Logical CSS only** (`inset-inline`, `margin-inline-start`, `border-inline-end`) — layouts mirror automatically in RTL.
- Every text pairing clears **WCAG AA 4.5:1**.

## 8. Internationalisation rules (enforced)

- Each screen's logic has `L = { ar, fr, en }`; the template binds `{{ t.* }}`. Direction comes from `L[lang].dir` applied to the root element — never hardcode.
- Locale: `?lang=` → browser language → `'fr'` (`Component.detect()`).
- **Bidi:** pure number runs → LRI…PDI (`⁦…⁩`, `fmt()`); mixed text → **FSI**…PDI (`⁨…⁩`, `iso()`), which also pins each digit group inside Arabic to LTR. Wrapping Arabic text in LRI reverses its segment order — don't.
- Group separator: space (AR, FR), comma (EN). Decimal comma in **FR only**. Western digits everywhere.
- **Plurals:** Arabic one / two / 3–10 / 11+; FR/EN one / many (`count()`).
- Icons: back and send glyphs flip in RTL (`backFlip`); forward chevrons flip in LTR (`arrow`).
- **The Article 14 label content stays Arabic in every interface language** (`Records` renders it `dir="rtl" lang="ar"`).
- Legal meaning must match across languages: Maabar never receives/holds/guarantees/refunds money and never grants the right to import.

## 9. Legal holds and settled decisions

See `README.md` → "Before writing code" (ten settled decisions) and `DESIGN-AUDIT.md` §9. The **deposit declaration in `Commitment`** is on a conditional hold pending Algerian legal review; keep it behind a feature flag in any build.

---

## 10. If the owner asks for something new

Work design-first in this repo, keep the patterns above, verify in the hub in all three languages, update the relevant `.md` files, then commit with a clear message and push to `main`.
