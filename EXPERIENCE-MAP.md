# Maabar — Experience Map

The complete lifecycle for each of the four audiences, from anonymous visitor to returning user, with the
screen that carries each step. Screens in **bold** are new or restructured in this pass; the others exist
in the deck unchanged.

Common spine:

```
Anonymous → Public → Capability intent → Authentication → Onboarding → Verification → Pending
         → Approved → Specialized workspace → Returning user → Capability switching
```

---

## 1. Consumer

| Step | What happens | Screen | State |
|---|---|---|---|
| Anonymous | Lands on the public site, sees the marketplace first | Landing | — |
| Public | Browses categories, products, sellers, search, compliance checker | Marketplace · Search · Product Detail · Seller Profile · Compliance Checker | no account |
| Capability intent | Taps the heart, *Message the seller* or *Sign in* | Product Detail / Seller Profile → **Sign In** | intent = consumer |
| Authentication | Phone → 6-digit OTP | **Sign In** | phone · otp |
| Onboarding | Name and wilaya, one step. Language already chosen | **Sign In** (profile step) | profile |
| Verification | **None.** The consumer capability is L1 (confirmed phone) | — | — |
| Pending | — | — | — |
| Approved | Immediate | **Sign In** (done: *Your account is ready*) | done |
| Workspace | Same public site, now with Saved, Messages, Account in the header | Consumer Home · Saved · Messages | signed in |
| Returning | Sign in → recognised → straight back to the marketplace (or the page they came from) | **Sign In** → Marketplace | — |
| Switching | *Import or sell?* in the header → For Importers / For Traders → *Become a…* adds a capability to the same identity | Landing → **For Importers** / **For Traders** | — |

Consumer onboarding never asks for a document. If a consumer later becomes a trader, the trader flow does
not repeat the phone step — the identity already exists.

---

## 2. Micro-importer

| Step | What happens | Screen | State |
|---|---|---|---|
| Anonymous | Sees *I'm an importer* in the hero and header | Landing | — |
| Public | Reads what Import does, what is required, what it unlocks, what Maabar is not | **For Importers** | — |
| Capability intent | *Start as an importer* | **For Importers** → **Sign In** | intent = importer |
| Authentication | Phone → OTP. Existing identity: recognised; new: created | **Sign In** | phone · otp |
| Onboarding | Importer information: name as on documents, wilaya, usual categories, usual destinations. Capability `importer` is created here | **Importer Setup** | info |
| Verification | Required documents, grouped: identity · importer eligibility. Capture → preview → upload per document | **Importer Setup** (checklist) → Verification (document journey) | documents |
| Review & submit | Everything listed once more; *Submit for review* | **Importer Setup** (review) | ready_to_submit → submitted |
| Pending | *Under review* with what was received, what happens next, what is already usable | **Verification Status** | submitted · under_review |
| Correction | Named documents with the reviewer's reason and the fix; resubmission keeps the queue place | **Verification Status** (needs correction) → Verification (capture) | needs_correction → resubmitted |
| Approved | *You're a verified importer* → *Welcome to Maabar Import* → *Open your workspace* | **Verification Status** (approved) | approved |
| Workspace | Import shell: Home, Demand, Trips, Commitments, Messages, Records, Profile | Importer Home · Demand Board · Trip · Trip Creation · Records · Importer Profile | L2-I |
| Returning | Sign in → recognised as verified importer → Import home directly | **Sign In** → Importer Home | — |
| Expired / frozen | Licence expiry freezes publishing and new requests; in-flight commitments continue | **Verification Status** (expired) · Verification (renew) | expired |
| Switching | Account menu → *Your experiences* → Trade if held, else *Become a trader* | **Choose Experience** | — |

---

## 3. Trader

| Step | What happens | Screen | State |
|---|---|---|---|
| Anonymous | Sees *I'm a trader* in the hero and header | Landing | — |
| Public | Reads what Trade does; the commercial register is named as the key requirement | **For Traders** | — |
| Capability intent | *Start as a trader* | **For Traders** → **Sign In** | intent = trader |
| Authentication | Phone → OTP | **Sign In** | phone · otp |
| Onboarding — person | Name as on ID, wilaya | **Trader Setup** (person) | person |
| Onboarding — business | Business name, business address, activity. Capability `trader` is created here | **Trader Setup** (business) | business |
| Verification | Two visibly separate groups: **Personal identity** (national ID + live photo) and **Business identity** (commercial register, tax number, business address) | **Trader Setup** (checklist) → Verification (document journey, trader ladder) | documents |
| Review & submit | Person and business summarised separately; *Submit for review* | **Trader Setup** (review) | submitted |
| Pending | Under review; sourcing, discovery and messaging already usable at L1; public listing locked until L2-T | **Verification Status** | under_review |
| Correction | Per-document reason and fix | **Verification Status** → Verification | needs_correction |
| Approved | *You're a verified trader* → *Welcome to Maabar Trade* → *Open your workspace* | **Verification Status** (approved) | approved |
| Workspace | Trade shell: Home, Discover, Requests, Commitments, Shop, Messages, Profile | Trader Home · Discover · Sourcing Request · Listing Composer · Commitment · Dispute | L2-T |
| Returning | Sign in → recognised as verified trader → Trade home | **Sign In** → Trader Home | — |
| Expired / frozen | Register status change freezes public listings (`ON UPDATE RESTRICT` — listings archived first) | **Verification Status** (frozen) | expired |
| Switching | *Become an importer* from the account menu → For Importers → Importer Setup on the same identity | **Choose Experience** → **For Importers** | — |

---

## 4. Admin

| Step | What happens | Screen | State |
|---|---|---|---|
| Anonymous | Nothing on the public site. Staff open `ops.maabar.dz` directly | — | — |
| Entry | Invited account identifier | **Admin Sign In** | identifier |
| Authentication | Phone OTP on the staff number | **Admin Sign In** | otp |
| MFA | Second factor (authenticator code) — mandatory | **Admin Sign In** (mfa) | mfa |
| Onboarding | None. Roles were granted by a super admin; the first screen is the queue | — | — |
| Verification | Not applicable; admins are not a capability and never self-declare | — | — |
| Workspace | Queue → evidence → decision → reason → consequence → audit | Admin Console | signed in |
| Returning | Same three steps every time; sessions are short | **Admin Sign In** → Admin Console | — |
| Super admin | Same entry; additionally grants roles and approves rule versions; may **not** decide queue items | Admin Console (role management) | — |

---

## 5. Multi-capability lifecycle

```
Verified trader (Yacine)                    Verified importer (Karima)
        │                                            │
 Account menu → Your experiences             Account menu → Your experiences
        │                                            │
   Maabar Trade  ✓ verified                    Maabar Import ✓ verified
   Marketplace   ✓                             Marketplace   ✓
   Become an importer  →  For Importers → Importer Setup → Verification → Status
                                                     │
                                            (approved) → Maabar Import now listed
        │
 Next sign-in → Choose experience: Import · Trade · Marketplace
```

One phone, one identity, one session. Each capability has its own verification case and its own status;
approving one never changes the other. The selector only ever lists what the identity holds; *Become a…*
appears only for what it does not.
