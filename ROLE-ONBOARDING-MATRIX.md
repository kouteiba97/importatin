# Maabar — Role Onboarding Matrix

Requirements below are those already established in `DESIGN-AUDIT.md` §5, `Verification` (both ladders)
and `AUTHORIZATION-MATRIX.md` §2. Nothing legal is added here. Document lists are rendered from the
regulatory configuration at runtime; the names below are the current configuration, not constants.

## 1. Summary

| Surface | Entry | Sign-up | Capability | Verification | Approval | Workspace unlocked |
|---|---|---|---|---|---|---|
| **Consumer** | Marketplace (any page), *Sign in* | Optional · phone + OTP | `consumer`, self-declared | None (L1 = confirmed phone) | Immediate | Marketplace with Saved, Messages, Account |
| **Importer** | *I'm an importer* → For Importers | Phone + OTP (or existing identity) | `importer`, self-declared in Importer Setup | Identity + importer eligibility (L2-I) | **Required** — trust & safety queue, 24 h SLA | Maabar Import |
| **Trader** | *I'm a trader* → For Traders | Phone + OTP (or existing identity) | `trader`, self-declared in Trader Setup | Personal identity + business identity (L2-T) | **Required** — trust & safety queue | Maabar Trade |
| **Admin** | Private entry `ops.maabar.dz` | None — invited | Not a capability; `admin_users` row + queue role | Staff identity + MFA | Granted internally by a super admin | Maabar Admin |

## 2. What each step collects

| Step | Consumer | Importer | Trader | Admin |
|---|---|---|---|---|
| Identity | phone, OTP | phone, OTP | phone, OTP | identifier, OTP, MFA |
| Profile | name, wilaya | full name as on documents, wilaya | full name as on ID, wilaya | — |
| Capability facts | — | usual categories, usual destinations | business name, business address, activity | — |
| Documents — identity | — | national ID · live photo | national ID · live photo | — |
| Documents — role | — | auto-entrepreneur card (low-value import) · general authorisation · tax number · CASNOS affiliation | commercial register · tax number · business address proof | — |
| Review | — | one page, grouped identity / eligibility | one page, grouped **person / business** | — |

## 3. Levels and what they open

| Level | Meaning to the user | Opens | Stays locked |
|---|---|---|---|
| L0 | visitor | browse, search, product, seller, compliance checker | everything else |
| L1 | phone confirmed | save, message, review, dispute, subscription | any publishing or commitment |
| L2-I | verified importer | publish trips, receive requests and demand, commitments, records, labels | consumer-facing listings (**never**) |
| L2-T | verified trader | public listings, shop profile, sourcing requests, importer discovery, commitments | trips, demand board |
| L3 | established record | badge, ranking priority | — |

The UI names the level by its meaning (*Verified importer*), never by its code. The code appears only in
`api/` and admin evidence.

## 4. States per capability, as the user sees them

| State | Consumer | Importer | Trader |
|---|---|---|---|
| Not started | — | *Become an importer* | *Become a trader* |
| In progress | — | *Continue importer setup* (step shown) | *Continue trader setup* |
| Ready to submit | — | Review page, *Submit for review* | Review page |
| Submitted / under review | — | Verification Status · pending | Verification Status · pending |
| Needs correction | — | Verification Status · N documents to correct | same |
| Approved | immediate | Welcome to Maabar Import → workspace | Welcome to Maabar Trade → workspace |
| Expired / frozen | — | Status · what expired, what is frozen, what continues | Status · listings archived, renew register |
| Rejected | — | Status · reason, right to resubmit | same |

## 5. Rules that hold across every row

1. One phone, one identity. A second capability is added to the same identity; the phone step is skipped.
2. Sign-up and verification are separate stages on separate screens.
3. Nothing operational unlocks before approval. Locked items are visible and labelled, never hidden.
4. Approval is an admin decision with a mandatory reason; the user-facing consequence is stored.
5. No public admin sign-up, no admin option in any onboarding.
6. Documents are private: shown as status and expiry only, never as images outside admin evidence.
