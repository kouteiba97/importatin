# Maabar — Design → Architecture Impact of the experience separation

**Rule applied:** `ARCHITECTURE-LOCK.md` wins. Nothing below reopens a locked decision. Every item is
classified as *no impact*, *UX only*, or *needs implementation documentation later*.

## 1. No architecture impact

| Design change | Why it costs nothing |
|---|---|
| Four shells (Marketplace, Import, Trade, Admin) | Presentation. The locked Next.js route groups `(public)`, `(app)`, `(admin)` already exist; Import and Trade are two navigation configurations of `(app)` |
| One sign-in, doors set *intent* | Intent is client state until OTP; after OTP it becomes a self-declared capability, exactly as `identity` already models it |
| Experience selector / context switcher | Active context is already "navigation only" (AD-014). The selector reads `capabilities` + derived levels from the account summary |
| Workspace marks `Import` / `Trade` | Copy and CSS |
| Importer Setup / Trader Setup as separate screens | Same `capabilities` insert, same `verification_cases` draft, same document upload path. The form is split across steps; the data model is untouched |
| Personal vs business grouping in trader verification | `document_types` already distinguishes the documents; grouping is a display attribute of the regulatory configuration |
| Admin Sign In with MFA | `ADMIN-ARCHITECTURE.md` already mandates MFA and no self-registration; the screen draws what was specified |
| Removal of the role menu | Nothing asked the server for a role before; nothing does now |

## 2. UX-only changes (design files)

| Item | Files |
|---|---|
| Landing hero: three paths, doors in the header, shared site header | `designs/Landing.dc.html` |
| New public pages | `For Importers`, `For Traders`, `Sign In`, `Choose Experience` |
| New workspace pages | `Importer Setup`, `Trader Setup`, `Verification Status` |
| New admin page | `Admin Sign In` |
| Shell: marks, doors, switcher data, `Verification` in the trader nav, label overrides | `designs/shell.js`, `designs/web.css` |
| Hub groups renamed to the four experiences; routes shown per experience prefix | `designs/index.html` |
| `Onboarding.dc.html` superseded by `Sign In` + the two Setup screens; kept on disk for history, removed from the hub | — |

## 3. Needs implementation documentation later (no lock change)

| # | Item | What to document | Where |
|---|---|---|---|
| D1 | **Account summary endpoint** — after OTP the client needs `{capabilities[], verification: {importer: {state, level, validUntil}, trader: {...}}, setup: {importer: step \| null, trader: step \| null}, lastContext}` in one call | Response shape and that it is a *projection* of existing tables (`capabilities`, `verification_cases`, `profile_levels`); no new table | `API-CONTRACT.md` |
| D2 | **Setup progress** — "continue where you left off" needs the current step persisted | A `setup_step` column on `importer_profiles` / `trader_profiles` (or derived from which fields are filled — preferred, no column) | `DATABASE-DESIGN.md` note |
| D3 | **Intent before sign-in** — the door used before OTP must survive the OTP round-trip | Client-side only (query param `?intent=importer` carried into the sign-in route); never stored server-side | `SCREEN-API-MATRIX.md` |
| D4 | **Last context per device** — the selector pre-highlights the last workspace | `localStorage` on the device; never an authorization input | frontend note |
| D5 | **Gate-2 refusal copy per experience** — "This is part of Maabar Trade" with *Become a trader* | The existing 403 `CAPABILITY_REQUIRED` payload should carry `capability` so the client picks the right door | `AUTHORIZATION-MATRIX.md` §1 client column |
| D6 | **Stored consequence text** — Verification Status shows the exact user-facing consequence the admin recorded | Already specified (`ADMIN-ARCHITECTURE.md`); note that the *fix list* is structured (document, reason, todo), matching `Verification.PROBLEMS/FIXES` | `STATE-MACHINES.md` §2.5 |
| D7 | **Admin session policy** — Admin Sign In states a 30-minute idle expiry and MFA attempt lock-out | Confirm the values with security; they are configuration, not constants | `SECURITY-ARCHITECTURE.md` |

## 4. Conflicts found and how they were resolved

| Conflict | Resolution |
|---|---|
| Brief §43 "Importer and Trader are mobile-first" vs `HANDOFF.md` §2 "web platform, not a mobile app" (the owner's latest correction) | **Owner confirmed desktop web first.** All new screens are 1440px web shells that narrow gracefully (`web.css` breakpoints). Phone artboards are not drawn |
| Brief §32 routes `/import/*`, `/trade/*` vs hub URLs on `app.maabar.dz` | Hub now shows `maabar.dz/import/*` and `maabar.dz/trade/*`. Host vs path is a deployment choice; the route groups are unchanged |
| Brief §10 nav "Home · Demand · Trips · Records · Messages · Profile" vs existing 7-item importer nav | Kept the existing items (Commitments and Verification are drawn screens), reordered to Home · Demand · Trips · Commitments · Messages · Records · Verification. Profile lives in the user block |
| Brief §12 "importer can never become a storefront by clicking" | Already enforced (I1); the Trader Setup business step and For Traders page name the commercial register explicitly |

## 5. Explicitly not done

- No trip, listing, commitment or messaging screen was changed beyond the sidebar mark.
- No new document type, level or legal requirement was invented; document lists are the current configuration.
- No admin capability was added to the public product; no admin option exists in any onboarding.
- No fourth backend, database, identity or auth system — see §1.
