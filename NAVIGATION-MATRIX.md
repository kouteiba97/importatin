# Maabar — Navigation Matrix

Four shells, one identity. `designs/shell.js` is the single source for every item below
(`window.MaabarShell(lang, surface, active)`); this document is the specification it implements.

## 1. Public site — `.site` shell

| Region | Anonymous | Signed-in consumer | Signed-in with Import / Trade |
|---|---|---|---|
| Brand | Maabar wordmark → `/` | same | same |
| Primary nav | Marketplace · Can I import this? · For importers · For traders | same | same |
| Search | products or shops | same | same |
| Actions | **Sign in** · *I'm an importer* / *I'm a trader* (hero) | Saved · Messages · avatar | Saved · Messages · avatar · **Open Maabar Import / Trade** |
| Avatar menu | — | Account · Saved · Messages · Sign out | Your experiences (Import / Trade / Marketplace) · Become a … (only for capabilities not held) · Account · Sign out |
| Footer | limits line · Terms · Privacy · Help | same | same |

Admin is never in this shell.

## 2. Maabar Import — `.app` shell, surface `importer`

Sidebar mark: `Maabar` / **Import** (workspace label under the wordmark, importer tint).

| Nav item | Icon | Screen | Locked before L2-I |
|---|---|---|---|
| Home | home | Importer Home | shows verification status panel instead of trip data |
| Demand | demand | Demand Board | locked (summary only) |
| Trips | trip | Trip · Trip Creation | locked |
| Commitments | cmt | Commitment | locked |
| Messages | msg | Messages | open (L1) |
| Records & labels | rec | Records | locked |
| Verification | ver | Verification · Verification Status | open — the only working item before approval |
| — | — | — | — |
| Account settings | settings | Account | open |
| User block | avatar · name · *Verified importer* / *Verification pending* | | |

Top bar: global search (trips, demand, importers) · language · notifications. The **experience switcher**
lives in the user block at the bottom of the sidebar: clicking the name opens *Your experiences*.

## 3. Maabar Trade — `.app` shell, surface `trader`

Sidebar mark: `Maabar` / **Trade** (trader tint).

| Nav item | Icon | Screen | Locked before L2-T |
|---|---|---|---|
| Home | home | Trader Home | shows status panel + what is already open |
| Discover | disc | Discover | trips open at L1; importers need L2-T |
| Requests | req | Sourcing Request | locked (L2-T — `ARCHITECTURE-LOCK.md` Q4) |
| Commitments | cmt | Commitment | locked |
| My shop | shop | Listing Composer · Seller Profile | locked — copy names the commercial register |
| Messages | msg | Messages | open |
| Records | rec | Records (trader view) | open |
| Verification | ver | Verification · Verification Status | open |

## 4. Maabar Admin — console shell

Own host, own entry. Groups exactly as drawn: Trust & Safety (verification, risk, moderation, disputes) ·
Compliance (items, rules) · Billing (subscription confirmations). Super admin adds *Roles* under a fourth
group, *Administration*. No link to any user-facing shell; no user-facing shell links here.

## 5. After authentication — where the router sends people

Evaluated once after OTP, then whenever the account summary changes. `last_context` is remembered per
device; `intent` is the public door used before sign-in.

| Account state | Destination |
|---|---|
| intent = importer, no `importer` capability | Importer Setup, step 1 |
| intent = trader, no `trader` capability | Trader Setup, step 1 |
| intent set, capability held, setup incomplete | that Setup at the saved step |
| intent set, capability verified | that workspace home |
| no intent · one verified workspace | that workspace home |
| no intent · two verified workspaces | Choose Experience |
| no intent · one capability pending / needs correction / expired, nothing verified | that Verification Status |
| no intent · setup incomplete, nothing verified | Choose Experience (*Continue … setup* card) |
| consumer only | back to the page the sign-in was started from, else Marketplace |

## 6. Switching, acquiring, leaving

| Action | Where | Result |
|---|---|---|
| Switch experience | avatar (site) / user block (app) → *Your experiences* → Choose Experience | changes shell and `last_context`; no re-authentication, no authorization change |
| Become an importer / trader | Choose Experience or avatar menu, only when not held | For Importers / For Traders → Setup on the same identity, phone step skipped |
| Open Marketplace from a workspace | Choose Experience → Marketplace | leaves the app shell; session unchanged |
| Sign out | avatar / user block | session revoked server-side; lands on Landing |
| Deep link to a locked page (`/import/demand` at L1) | — | page renders its locked state with *Verification* CTA — gate 3 refusal drawn, never a blank |
| Deep link to another experience's page without the capability | — | gate 2 refusal: *This is part of Maabar Trade* with *Become a trader* / *Back to Import* |

## 7. Context is not authorization

The shell decides what to show. The API decides what is allowed. A user who edits the URL from
`/import/…` to `/trade/…` without the trader capability sees the drawn gate-2 refusal because the server
returned `CAPABILITY_REQUIRED`, not because the client checked a flag.
