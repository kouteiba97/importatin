# Maabar — Product Architecture: one identity, distinct experiences

**Status:** design decision · **Date:** 19 September 2026
**Scope:** UX architecture only. Nothing here changes `ARCHITECTURE-LOCK.md`; where the two could be read
differently, the lock wins and `DESIGN-ARCHITECTURE-IMPACT.md` records the difference.

---

## 1. The principle

> **One Maabar identity. Several specialized experiences. Admin apart.**

The technical model is unchanged: one `users` row, capabilities on that identity, a derived verification
level per capability, five server-side gates. What changes is how the product *presents* that model.
A visitor must never meet a role menu, an authenticated dashboard, or a compliance portal before they
have chosen what they came to do.

```
                          MAABAR  (one brand, one identity, one sign-in)
                                          │
        ┌─────────────────┬───────────────┼────────────────┐
        │                 │               │                │
   MARKETPLACE       MAABAR IMPORT   MAABAR TRADE          │
   public website    importer        trader                │
   + consumer        workspace       workspace             │
   account           (L2-I)          (L2-T)                │
                                                           │
                                                   MAABAR ADMIN
                                                   private entry · MFA
                                                   never a capability
```

| Experience | Who | Shell | Entry | Gate to enter |
|---|---|---|---|---|
| **Marketplace** | anyone; consumers with an account | `.site` — public header, wide pages | `/` | none (account optional) |
| **Maabar Import** | verified micro-importers | `.app` — sidebar, "Import" workspace mark | `I'm an importer` / `Open Maabar Import` | capability `importer` + L2-I |
| **Maabar Trade** | verified traders | `.app` — sidebar, "Trade" workspace mark | `I'm a trader` / `Open Maabar Trade` | capability `trader` + L2-T |
| **Maabar Admin** | invited staff | `tier-admin` console, desktop | `ops.maabar.dz` — not linked from the public site | `admin_users` row + queue role + MFA |

The experiences are **navigation contexts**, not accounts. `ARCHITECTURE-LOCK.md` §6: active context
selects navigation only and never appears in an authorization decision. Every screen in Import or Trade
still fails closed on the server if the identity behind it lacks the capability or the level.

---

## 2. Four layers that must never collapse into one "role"

| Layer | Values | Where it lives | What it drives in the UI |
|---|---|---|---|
| **Identity** | anonymous · authenticated | session | sign-in vs signed-in chrome |
| **Capability** | consumer · importer · trader (any combination) | `app.capabilities` | which experiences exist for this person |
| **Verification** | L0 · L1 · L2-I · L2-T · L3, plus case state (draft / submitted / under review / needs correction / approved / expired) | `verification_cases`, derived level | whether an experience is *open*, *pending*, *needs attention* or *frozen* |
| **Experience** | marketplace · import · trade | client-side context (last used, remembered) | shell, navigation, terminology, priorities |
| **Authorization** | allowed / refused per request | server gates 1–5 | never inferred on the client; the client only renders the refusal it is told |

A person is therefore described as, for example: *authenticated · {consumer, importer, trader} · importer
L2-I approved, trader L1 pending business documents · currently in Import*. The UI never stores this as
`role = importer`.

---

## 3. What each experience is for

### Marketplace — the front door
Commercial, image-led, no chrome that implies a logged-in tool. Answers *what is Maabar, what can I buy,
who sells it, why trust them*, and offers two clearly marked professional doors. Browsing, search, product,
seller and the compliance checker need no account. An account (phone + OTP) adds saved items, messaging and
reviews — nothing more is asked of a shopper.

### Maabar Import — an operating workspace
The importer's working environment: the current trip and its three capacity meters, verified demand, what
needs attention, commitments and messages, records and Article 14 labels. Opens only to a verified
importer. Before verification the same navigation exists but every operational item is shown locked, with
one open panel: **verification status**.

### Maabar Trade — a commercial B2B workspace
Discovery first: trips, importers (where the audience flag allows), sourcing requests, commitments, the
public shop. Opens only to a verified trader. The commercial register is the visible centre of trader
verification because it is the legal thesis of the product: *only a verified trader lists to the public*.

### Maabar Admin — a separate console
Queue → evidence → decision → mandatory reason → consequence → audit. Own entry, own authentication step,
MFA, no self-registration, no link from the public site, no mention in any onboarding flow.

---

## 4. Entry points (public)

| Door | Label (EN) | Leads to | Creates |
|---|---|---|---|
| Header / hero | **Explore the marketplace** | `/marketplace` | nothing |
| Header / hero | **I'm an importer** | `/for-importers` → *Start as importer* | capability intent `importer` |
| Header / hero | **I'm a trader** | `/for-traders` → *Start as trader* | capability intent `trader` |
| Header | **Sign in** | `/sign-in` | nothing; routing decided after OTP |
| Nowhere public | Admin | `ops.maabar.dz/login` | — |

The door a visitor walks through is remembered as **intent** until they authenticate. After OTP the intent
becomes a self-declared capability (`ARCHITECTURE-LOCK.md` §6: capabilities are self-declared; powers
require the level). The identity is the same whichever door they used; a person who signs up through the
importer door and later chooses *Become a trader* adds a capability, never an account.

---

## 5. The journey shape, shared by Import and Trade

```
public door → introduction → sign in (phone + OTP) → capability onboarding → verification
           → review & submit → pending → (needs correction →) approved → welcome → workspace
```

Two things are deliberately separate stages and never one form:

| Stage | Question it answers | Screen |
|---|---|---|
| **Identity** | who are you (a phone number that answers an OTP) | `Sign In` |
| **Capability onboarding** | what do you want to use Maabar as, and the facts that experience needs | `Importer Setup` / `Trader Setup` |
| **Verification** | can we confirm you hold the documents that experience legally requires | `Verification` (document journey) + `Verification Status` |

Verification is the only stage with a waiting period, and the only one with a correction loop. The
onboarding stages are resumable: closing the browser after OTP leaves a recognised identity with an
incomplete setup, and the next sign-in offers *Continue importer setup* at the exact step left.

---

## 6. Returning users — routing, not asking

After OTP the client asks the server for the account summary (capabilities, per-capability verification
state, open setup step, last context) and routes **without a question** whenever the answer is
unambiguous. The full table is in `AUTHENTICATION-UX-MATRIX.md`; the rule in one line:

> One open experience → go straight into it. Several → *Choose experience*. None open but one pending or
> incomplete → its status screen. Nothing but a consumer capability → marketplace.

A verified importer therefore lands on the Import home three days later with no onboarding, no KYC and no
"become an importer" button — that button exists only for capabilities the identity does not hold.

---

## 7. What is *not* changing

- No new backend, database, auth system or user table. Four shells, one API.
- No role column. No client-side authorization. Context never widens what the server allows.
- The legal invariant — an importer never publishes a consumer-facing listing — remains database-enforced
  and is *taught* in the UI (Listing Composer blocked view, trader verification copy), never worked around.
- Regulatory values stay configuration with effective dates; no screen hard-codes them.
- The money boundary: subscription only; no trade payments, no escrow, no custody, no deposit until legal
  sign-off.
- Documents stay private; no verification document ever appears on a public profile.

---

## 8. Route architecture (UX concepts, not backend contracts)

```
PUBLIC (site shell)                    AUTH
/                                      /sign-in                (phone → OTP → routed)
/marketplace  /search  /p/[slug]       /choose                 (experience selector)
/shop/[slug]  /check                   /account                (identity, phone, sessions, capabilities)
/for-importers  /for-traders

IMPORT (app shell · "Import")          TRADE (app shell · "Trade")
/import                → home or status   /trade               → home or status
/import/setup          (onboarding)       /trade/setup         (onboarding)
/import/verification   (documents)        /trade/verification  (identity + business documents)
/import/status         (pending/correction/approved/expired)   /trade/status
/import/demand  /import/trips  /import/records                 /trade/discover  /trade/requests  /trade/shop
/import/commitments  /import/messages  /import/profile         /trade/commitments  /trade/messages  /trade/profile

ADMIN (own host, own shell)
ops.maabar.dz/login → /mfa → /  (queues) /verification /moderation /disputes /compliance /regulation /billing /audit
```

`/import/*` and `/trade/*` correspond to the Next.js `(app)` route group already locked; `/admin` to
`(admin)`. The prefix is what makes the workspace visible in the address bar — the server still evaluates
the same five gates on every request regardless of prefix.

---

## 9. Brand architecture inside the experiences

One logo, one type stack, one token file. Differentiation is controlled:

| Element | Marketplace | Import | Trade | Admin |
|---|---|---|---|---|
| Shell | site header | sidebar | sidebar | console |
| Workspace mark under the wordmark | — | `Import` | `Trade` | `Operations` |
| Role tint (existing tokens) | consumer neutral | `--role-importer-*` (purple) | `--role-trader-*` (blue) | admin neutral |
| Density | low, image-led | medium, operational | medium, commercial | high |
| Status colours | compliance verdicts only | same | same | same |
| Photography | product imagery | none | product cards in Discover / shop | none |

No fourth logo, no per-experience palette, no gradient. The workspace mark is a text lockup below the
wordmark in the sidebar (`Maabar` / `Import`) and in the browser title, nothing more.
