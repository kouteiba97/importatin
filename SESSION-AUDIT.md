# Session audit — 12 November 2026

Written so that Claude (or a person) on **another machine** can continue without the chat history.
Read this first, then `HANDOFF.md` (full project context and the owner's standing rules), then `CLAUDE.md`.

- Repository: `https://github.com/kouteiba97/importatin`, branch `main`. Everything below is pushed.
- Last commit of this session: see `git log -1` (the one that adds this file).
- Nothing is uncommitted and nothing lives only on the Windows PC.

---

## 1. Where the project stands

Maabar is still **design and documentation only** — no application code (the owner has not asked for the build).

| | State |
|---|---|
| Screens | **34**, all in EN / FR / AR, all in the review hub (`designs/index.html`) |
| Surfaces | Public website (13) · importer workspace (9) · trader workspace (8) · operations console (4) |
| Layout | Desktop-first web platform. Public pages and both workspaces also fit phone (390px) and tablet (820px). Console is desktop-only |
| Last full check | 34 screens × EN/FR/AR at 1440px: no render errors, no sideways scrolling. Phone/tablet: 13 public + 17 workspace screens fit (checked FR and AR) |
| Technical docs | One copy of each, in `docs/architecture/`, corrected to the current product |

## 2. What was done in this session (newest last)

| Commit | What |
|---|---|
| `fca82c0` | **Rules pages.** Public `Rules` page (shoppers / micro-importers / traders, `?aud=`), console screen `Admin Rules` (structured articles, EN/FR/AR, draft → review → publish, author ≠ publisher, regulatory values with impact preview). Data: `designs/rules-content.js`. Model: `docs/architecture/RULES-CONTENT.md` |
| `e594895` | **Documents cleaned.** Six duplicate root documents removed (kept in `docs/architecture/`). "Mobile-first" / "Arabic-first" wording corrected. Screen counts fixed. `SCREEN-API-MATRIX` covers every screen. Rules system added to authorization, database and API documents. Authorisation validity = 12 months (Decree 25-170 art. 12) |
| `c26935e` | **`Admin Team` screen.** Superadmin invites admins / sub-admins, assigns roles, suspends. Nobody edits own roles; superadmin holds no other role; last active superadmin protected |
| `7a93155` | **One source for legal figures.** Trip, Trip Creation, Importer Home, Demand Board, For Importers, Records and Compliance Checker read the cap, trips/month, duty, shelf-life ratio and effective date from `rules-content.js`. Links to Rules from Product Detail, Compliance Checker, Trip Creation |
| `52d4904` | **Page states.** Shared loading / empty / error / offline pattern (`designs/states.js`, styles in `web.css`, applied by `tools/add-states.js`) on 11 screens. Compliance Checker shows its four answers |
| `89563ac` | **Public pages on phone and tablet** (header wraps, navigation becomes a strip that scrolls sideways) |
| `c3337e6` | **Clean-up.** `Onboarding` screen deleted (replaced by Sign In + Importer Setup + Trader Setup; still in git history) |
| `a46adb1` | **Workspaces on phone and tablet** (sidebar becomes a header with the same navigation strip; CSS only) |

## 3. How to run it on the Mac

```bash
git clone https://github.com/kouteiba97/importatin.git   # or: git pull
cd importatin
node preview/server.js
```

Open `http://localhost:4321` — the review hub (every screen, grouped, EN / FR / ع switch).
A single screen: `http://localhost:4321/Rules.dc.html?lang=fr&aud=importer`.
Only Node is needed. `.dc.html` files must be opened through this server (it injects React), not as files.
In Claude Code, the Browser pane can start it with the `maabar-preview` config in `.claude/launch.json`.

## 4. Files that matter (new or changed this session)

| File | Role |
|---|---|
| `designs/rules-content.js` | Sample rule articles + regulatory values. Read by `Rules`, `Admin Rules` and the seven screens that show legal figures. Stand-in for the database |
| `designs/states.js` | Shared page states + per-screen empty copy in EN/FR/AR |
| `designs/shell.js` | Navigation of each surface (now includes "Rules") |
| `designs/web.css` | Layout. **The phone/tablet rules are at the end of the file** and target class names used inside individual screens |
| `tools/newscreen.js` | Builds a new screen from parts (Node). `tools/newscreen.py` is the same in Python |
| `tools/recipes/rules.js`, `admin-rules.js`, `admin-team.js` | Recipes for the three new screens — safe to re-run (`node tools/recipes/<name>.js`) |
| `tools/recipes/*.py` | Recipes for seven older screens (Python). Kept as records; those screens were later edited directly, **do not re-run them** without checking |
| `tools/web-shell/w-*.js` | Records of the web conversion. **Never re-run** |
| `tools/add-states.js` | Adds the shared states to a screen; skips screens already done |
| `docs/architecture/RULES-CONTENT.md` | Content model, roles and publication rules for the Rules pages |

## 5. Rules to keep (short form — full list in `HANDOFF.md` §2 and `CLAUDE.md`)

1. Do **not** build the application unless the owner explicitly asks.
2. Web platform, desktop-first. It may fit a phone browser, but **no bottom tab bar, no phone-app look**.
3. No explanatory text inside screens; explanations go in `.md` files.
4. EN / FR / AR are equal; fallback French; Latin logo "Maabar".
5. Colours only from `designs/tokens.css`; brand blue ≠ status green/amber/red.
6. **No legal figure typed in a screen or a text** — read it from the regulatory values (`{cap}`, `{trips}`, `{duty}`, `{shelf}`).
7. Only facts from official texts are shown to users. The Finance Law 2026 flat tax (0.5%) is **unconfirmed** and exists only as an unpublishable draft in `Admin Rules`.
8. The owner is not technical: report plainly and briefly. Commit each phase and push to `main`.

## 6. How to verify a change

1. Start the server, open the hub, view the screen in EN, FR and AR.
2. Check 1440px, then 820px and 390px (no sideways scrolling).
3. A quick browser-console check is in `tools/qa.js` (see `tools/README.md`).
4. If a new screen has a new multi-column grid, add its phone rule at the end of `web.css`.
5. If a new screen shows data, add it to `tools/add-states.js` and its empty copy to `states.js`.

## 7. Known gaps and honest notes

- **Admin Console** has no "empty queue" state.
- **Messages on a phone** stacks the list above the conversation; a list → conversation drill-down would be better at build time.
- **French and Arabic copy** has not been reviewed by a native commercial writer (this includes all the rule texts written this session).
- **Legal texts**: rule articles are plain-language summaries of Decree 25-170 and Laws 18-05 / 09-03, written from the verified article table in `docs/history/01-PRODUCT-STRATEGY.md` §3.2. They should be read by an Algerian lawyer before real users see them.
- **Product photos** are still placeholders.
- **Deposit declaration** in `Commitment` is still held pending legal review (`DESIGN-AUDIT.md` §9.2).
- The phone check was automated (page width, no overflow) plus a visual look at about ten screens — not every screen was looked at by eye at phone width.
- `Dashboards.html` (the client deck) was not re-checked after this session's changes.

## 8. Sensible next steps (none started)

1. Owner review of the new screens in the hub: `Rules` (three audiences), `Admin Rules`, `Admin Team`.
2. Native-speaker and legal review of the rule texts.
3. Empty-queue state for the Admin Console; eyeball every screen at phone width.
4. Only when the owner says so: the build phase — start from `docs/architecture/EXECUTIVE-SUMMARY.md` and `ARCHITECTURE-LOCK.md`.
