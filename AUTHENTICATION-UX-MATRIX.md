# Maabar — Authentication UX Matrix

One sign-in for the whole product: phone → 6-digit OTP → one identity → capabilities loaded → routed.
Admin has its own entry with an added MFA step and is never reachable from the public sign-in.

The server returns, after OTP, an **account summary**: capabilities, per-capability verification state,
the incomplete setup step if any, and the last context used on this device. The client routes from that
summary. It never decides what the user *may do* — only where to *take* them.

## The matrix

| # | Case | Entry | Authentication | Detected state | Destination | Available actions |
|---|---|---|---|---|---|---|
| 1 | New anonymous visitor, consumer intent | Marketplace → *Sign in* (or heart / message) | phone → OTP → name, wilaya | new identity, `consumer` | back to the page they came from | save, message, review; *Import or sell?* |
| 2 | Returning consumer | *Sign in* | phone → OTP | `consumer` only | Marketplace (or origin page) | as above |
| 3 | New visitor, importer intent | *I'm an importer* → For Importers → *Start* | phone → OTP | new identity, intent importer | Importer Setup step 1 | continue setup, save and leave |
| 4 | Returning importer — verified | *Sign in* | phone → OTP | `importer` L2-I | **Importer Home** directly | full Import workspace; no KYC, no onboarding, no *Become an importer* |
| 5 | Returning importer — pending | *Sign in* | phone → OTP | `importer` case under_review | **Verification Status** (pending) inside the Import shell | view status, what's open now (messages, records read-only), contact support; operations locked |
| 6 | Returning trader — verified | *Sign in* | phone → OTP | `trader` L2-T | **Trader Home** directly | full Trade workspace |
| 7 | Importer + trader, both verified | *Sign in* | phone → OTP | two open workspaces | **Choose Experience** (Import · Trade · Marketplace); last context pre-highlighted | open either; switch later from the user block |
| 8 | Started importer onboarding, never submitted | *Sign in* | phone → OTP | `importer` setup incomplete at step *k* | Importer Setup at step *k* (via Choose Experience card *Continue importer setup* when another workspace is also open) | continue, save and leave; nothing restarts |
| 9 | Verification needs correction | *Sign in* (or notification) | phone → OTP | case needs_correction, N documents | **Verification Status** (needs attention) | correct documents (one by one), later |
| 10 | Verification expired | *Sign in* (or 34 / 14 / 7 / 1-day notice) | phone → OTP | document expired, level dropped | **Verification Status** (expired) in the workspace shell | upload the new document; in-flight commitments, messages, records stay open; publish and new requests frozen |
| 11 | Admin | `ops.maabar.dz/login` | identifier → OTP → **MFA** | `admin_users` + role | Admin Console, first queue of the role | queues of the role only |
| 12 | Super admin | same | same | roles contains `superadmin` | Admin Console, *Administration* group visible | grant roles, approve rule versions; **cannot** decide queue items |
| 13 | Verified trader wants to import | signed in → user block → *Become an importer* | none (already authenticated) | `trader` L2-T, no `importer` | For Importers (signed-in variant) → Importer Setup step 1 | setup on the same identity; Trade stays usable meanwhile |
| 14 | Deep link into a locked page | any URL | phone → OTP if needed | gate 2 or 3 refusal | the page's drawn locked state | the CTA the refusal names (Become a … / Verification) |
| 15 | Rejected verification | *Sign in* | phone → OTP | case rejected | Verification Status (not approved) | resubmit after correction, contact support |
| 16 | Session expired mid-task | any | phone → OTP | previous state | the page they were on | — |

## Error and edge states on the sign-in screen itself

| State | Copy (EN) | CTA |
|---|---|---|
| OTP not received | *Code didn't arrive — resend* with countdown | resend (rate-limited) · change number |
| Wrong code | *That code isn't right. 4 attempts left.* | try again |
| Too many attempts | *Too many attempts. Try again in 10 minutes.* | back |
| Offline | *You're offline. The code will send when you're back.* | retry |
| New device on an account with L2 | sign-in succeeds; high-impact actions show a 24-hour cooldown notice (`SECURITY-ARCHITECTURE.md` §2.1) | — |
| Phone number in use with different identity | never disclosed (enumeration-safe); the OTP simply goes to the number's owner | — |

## What never happens

- Three logins. There is one *Sign in*; the door only sets intent.
- A role question at sign-in. Capabilities are read from the identity, not asked.
- A second phone number for a second capability.
- KYC repeated for a verified capability.
- Admin appearing in any public flow, menu or onboarding.
- Client-side authorization. The router picks a destination; the server picks what is allowed.
