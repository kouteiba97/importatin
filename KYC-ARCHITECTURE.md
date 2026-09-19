# Maabar — KYC Architecture (experience view)

How verification is presented per audience. The underlying machine is unchanged
(`STATE-MACHINES.md` §2.5): case `draft → submitted → under_review → needs_correction → approved | rejected`,
document `uploaded → under_review → approved | needs_correction | rejected → expired | superseded`, derived
level recomputed in the approval transaction, daily expiry sweep, advance notices at 34 / 14 / 7 / 1 days.

---

## 1. Principles

1. **Sign-up is not verification.** Identity (phone + OTP) is one screen; verification is a separate journey
   with a waiting period.
2. **Verification is per capability.** One open case per user per capability (I5). Approving the importer
   case says nothing about the trader case.
3. **Grouped, not one form.** Requirements are shown in named groups the person understands: *Personal
   identity*, *Importer eligibility*, *Business identity*. The group list comes from the regulatory
   configuration for the capability; the UI never hard-codes a document set.
4. **Levels are explained by their meaning.** *Verified importer*, *Verified trader*, *Identity confirmed*.
   `L2-I` and friends stay in the API and admin evidence.
5. **Nothing operational before approval.** Locked items are visible and labelled with what unlocks them.
6. **Every state has an exit.** No state ends without a primary CTA.
7. **Documents are private.** The owner sees status and expiry only; no owner-facing endpoint returns the
   binary (`TECHNICAL-BLUEPRINT.md` §9).

---

## 2. Per audience

### Consumer
| | |
|---|---|
| Entry | any marketplace page |
| Sign-up | phone + OTP, optional |
| Capability | `consumer` on sign-up |
| Verification | **none** — L1 is the confirmed phone |
| Pending / correction / expiry | not applicable |
| Unlock | immediate: save, message, review, dispute |
| Re-entry | sign in → marketplace |

### Importer
| | |
|---|---|
| Entry | *I'm an importer* → For Importers → *Start as an importer* |
| Sign-up | phone + OTP (skipped for an existing identity) |
| Capability | `importer` created in Importer Setup step 1 |
| Verification groups | **Personal identity**: national ID, live photo · **Importer eligibility**: auto-entrepreneur card (low-value import activity), general authorisation, tax number, CASNOS affiliation |
| Level reached | L2-I when every required document is approved and unexpired |
| Pending | Verification Status: received list, review target (24 h SLA), what is already open at L1 |
| Correction | per document: reviewer reason + fix; resubmission keeps the queue place |
| Approval | Status (approved) → *Welcome to Maabar Import* → Importer Home |
| Expiry / freeze | general authorisation expiry: publish trip and receive requests **denied**; existing commitments **allowed**; Status shows the frozen list and *Upload the new authorisation* |
| Re-entry | sign in → Importer Home; Verification only reachable from the sidebar |

### Trader
| | |
|---|---|
| Entry | *I'm a trader* → For Traders → *Start as a trader* |
| Sign-up | phone + OTP (skipped for an existing identity) |
| Capability | `trader` created in Trader Setup (business step) |
| Verification groups | **Personal identity**: national ID, live photo · **Business identity**: commercial register extract, tax number, business address proof |
| Level reached | L2-T; `trader_profiles.listing_eligible` flips in the same transaction |
| Pending | Status: person ✓ / business ⏳ shown separately; discovery, messaging and requests explain what opens at L2-T; public listing explicitly locked with the register named |
| Correction | as importer |
| Approval | Status (approved) → *Welcome to Maabar Trade* → Trader Home |
| Expiry / freeze | register status change: listings archived first (I2), shop hidden, Status explains and asks for the new extract |
| Re-entry | sign in → Trader Home |

### Admin
| | |
|---|---|
| Entry | `ops.maabar.dz/login`, never linked publicly |
| Sign-up | none — an `admin_users` row created by a super admin |
| Authentication | identifier → OTP → **MFA** (mandatory) |
| Verification | staff onboarding is internal; no document upload in the product |
| Pending / correction | not applicable |
| Unlock | console with the queues the role grants |
| Re-entry | same three steps; short sessions |

---

## 3. The user-facing state machine

```
NOT_STARTED ─▶ IN_PROGRESS ─▶ READY_TO_SUBMIT ─▶ SUBMITTED ─▶ UNDER_REVIEW ─┬─▶ APPROVED ─▶ EXPIRED / FROZEN
                                                                            ├─▶ NEEDS_CORRECTION ─▶ RESUBMITTED ─▶ UNDER_REVIEW
                                                                            └─▶ REJECTED (right to resubmit → IN_PROGRESS)
```

| State | Title | Explanation | Primary CTA | Secondary | Open | Locked | Next |
|---|---|---|---|---|---|---|---|
| NOT_STARTED | Become an importer / trader | what it opens, what is needed | Start | Not now | marketplace, L1 | workspace | Setup |
| IN_PROGRESS | Continue importer setup | step list with the current one marked | Continue | Save and leave | L1 | workspace | next step |
| READY_TO_SUBMIT | Review before you submit | every document listed, grouped | Submit for review | Edit | L1 | workspace | SUBMITTED |
| SUBMITTED | We've received your documents | what was received, review target | Go to what's open now | — | L1 + read-only workspace | operations | UNDER_REVIEW |
| UNDER_REVIEW | Under review | reviewer has it; time expectation | Go to what's open now | Contact support | same | same | decision |
| NEEDS_CORRECTION | Verification needs attention | *N documents need correction*, each with reason + fix | Correct documents | Later | same | same | RESUBMITTED |
| RESUBMITTED | Resubmitted | queue place kept | Go to what's open now | — | same | same | UNDER_REVIEW |
| APPROVED | You're a verified importer | what is now open; validity date | Open Maabar Import | Later | workspace | — | workspace |
| REJECTED | Not approved this time | reason; right to resubmit after correction | Resubmit | Contact support | L1 | workspace | IN_PROGRESS |
| EXPIRED / FROZEN | Your authorisation has expired | what expired, frozen list, what continues | Upload the new document | — | in-flight commitments, messages, records | publish, new requests | UNDER_REVIEW |

`SUBMITTED` and `RESUBMITTED` are transient; the design draws them as the first render after the action,
then the screen settles into `UNDER_REVIEW`.

---

## 4. Approval → workspace transition

```
Decision recorded (admin) → derived level recomputed → notification "You're a verified importer"
   → Verification Status (approved): validity date, four things now open
   → [Open Maabar Import]
   → Import shell, Importer Home, first-run panel "Create your first trip"
```

The first-run panel is the existing `next` block of Importer Home with the *no trip yet* variant; no new
screen. The same for Trade: Trader Home's *next step* becomes *Add your first product*.

---

## 5. What the reviewer sees

Unchanged: Admin Console verification queue, evidence (documents with validity, identity signals, context,
history), decision with mandatory reason, stored user-facing consequence. The consequence copy shown in the
console is the exact text the user receives in Verification Status.
