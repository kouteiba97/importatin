# Maabar — Final UX Separation Audit

**Date:** 19 September 2026 · **Scope:** the experience-separation pass (`PRODUCT-ARCHITECTURE.md`)
**Method:** each journey walked screen by screen in the review hub, in EN / FR / AR; every screen rendered
headless at 1440px in the three languages (33 screens × 3 = 99 renders, no runtime errors).

---

## 1. Journey simulations

| Journey | Path walked | Result |
|---|---|---|
| **A — New importer** | Landing → *I'm an importer* → For Importers → *Start as an importer* → Sign In (importer door: phone → code → profile) → Importer Setup (information → documents → review → sent) → Verification Status (submitted → under review) → Verification Status (approved) → *Open Maabar Import* → Importer Home | ✅ No step asks for a role; sign-up and documents are separate screens; nothing operational opens before *approved* |
| **B — Returning verified importer** | Landing → *Sign in* → phone → code → Sign In (recognised: *Welcome back, Karima* → Maabar Import) → Importer Home | ✅ No onboarding, no KYC, no *Become an importer* |
| **C — New trader** | Landing → *I'm a trader* → For Traders → Sign In (trader door) → Trader Setup (you → your business → documents grouped person / business → review → sent) → Verification Status (trader tab: pending → approved) → *Open Maabar Trade* → Trader Home | ✅ Person and business are separate steps and separate document groups; the register is named as the key to the public shop |
| **D — Multi-capability** | Sign In → Choose Experience (*Importer + trader*) → Maabar Import **or** Maabar Trade; user block ⇅ returns to the selector | ✅ One identity; no second account or number anywhere |
| **E — Incomplete importer** | Sign In → Choose Experience (*Incomplete setup*: Account ● Profile ● Documents ○ Review ○) → *Continue importer setup* → Importer Setup at *Documents* | ✅ Resumes at the saved step; no restart |
| **F — Pending importer** | Sign In → Verification Status (submitted / under review) inside the Import shell | ✅ Operational items listed as locked; messages and marketplace open; status, timeline and support visible |
| **G — Consumer** | Landing → Marketplace → Product Detail → Seller Profile → (optional) Sign In (consumer door) → *Start browsing* | ✅ No KYC, no documents, no role question |
| **H — Admin** | `ops.maabar.dz/login` → identifier → phone code → second factor → *Open the console* → Admin Console | ✅ No public link, no sign-up, MFA cannot be skipped, *No access* state for an identifier without a role |

Additional states walked: wrong code, locked, offline (Sign In); needs correction with two named documents and the queue place kept; expired authorisation with the frozen list; rejected with the right to resubmit; verified trader adding the importer role (For Importers, member variant).

---

## 2. Quality gate

### Product architecture
| Question | Answer | Evidence |
|---|---|---|
| Is Maabar clearly one company? | Yes | One wordmark, one token file, one type stack; workspace marks are text under the wordmark |
| Public marketplace separate from workspaces? | Yes | `.site` shell vs `.app` shell; the hero sells the network, not a dashboard |
| Importer and Trader distinct? | Yes | Different nav, tint, first screens, setup steps and document groups |
| Admin completely separated? | Yes | Own host, own entry, MFA, never in a menu |

### Identity
| One identity? | Yes — every flow reuses the same phone; *Become a …* adds a capability |
|---|---|
| Multiple capabilities on one identity? | Yes — Choose Experience lists what is held |
| One login? | Yes — one *Sign in*; doors only set intent |
| Switch without duplicate accounts? | Yes — selector and user-block switcher |

### Importer
| Understands what happens after *I'm an importer*? | Yes — For Importers lists the five steps and the documents |
|---|---|
| Sign-up separated from KYC? | Yes — Sign In vs Importer Setup |
| KYC role-specific? | Yes — importer eligibility group |
| Approval before restricted access? | Yes — Verification Status locks list until approved |
| Returning verified importer lands in the workspace? | Yes — journey B |
| Incomplete onboarding resumes? | Yes — journey E |

### Trader
| Distinct onboarding? | Yes — *You* then *Your business*, five steps not four |
|---|---|
| Personal identity separated from business verification? | Yes — two document groups on setup, status and For Traders |
| Approval clearly required? | Yes |
| Commercially different feel? | Yes — discovery cards, trader tint, shop language |

### Consumer
| Browse without KYC? | Yes | Lightweight onboarding? | Yes — phone, code, name |
|---|---|---|---|

### Admin
| No public sign-up? | Yes | Access clearly separate? | Yes | MFA represented? | Yes | Operational character kept? | Yes — console untouched |
|---|---|---|---|---|---|---|---|

### Multi-capability
| Both importer and trader? | Yes | Identity intact? | Yes | Switching clear? | Yes | Context affects navigation, not authorization? | Yes — documented in `NAVIGATION-MATRIX.md` §7; no client-side gate exists |
|---|---|---|---|---|---|---|---|

### Design quality
| One premium brand? | Yes — controlled differentiation only |
|---|---|
| Not generic SaaS? | Yes — no gradients, no glass, no emoji decoration, no filler stats |
| Colours restrained? | Yes — status colours reserved for verdicts; role tints from the existing tokens |
| Marketplace commercially alive? | Yes — unchanged product grids, hero paths |
| Workspaces operationally clear? | Yes — locked/open lists, steps, timelines |
| Arabic RTL first-class? | Yes — all new screens rendered in AR with logical properties, LTR-isolated numbers |

### Architecture consistency
| Locked architecture preserved? | Yes — `DESIGN-ARCHITECTURE-IMPACT.md` §1 |
|---|---|
| No four backends / auth systems? | Correct — none introduced |
| Legal/product invariants unchanged? | Yes — importer never lists; no payments; documents private |
| Every genuine impact documented? | Yes — `DESIGN-ARCHITECTURE-IMPACT.md` §3 (D1–D7) |

---

## 3. Known limits of this pass

- Phone-width artboards are not drawn (owner decision: desktop web first). Responsive rules exist in
  `web.css`; a phone pass is a separate work item.
- `Verification.dc.html` was trimmed to the **capture journey only** (ladder → document → preview →
  uploading) and links to `Verification Status`, which is now the single owner of *under review*,
  *needs correction*, *approved* and *expired*. No state is drawn on two screens.
- The trader *Records* nav item reuses the importer Records screen; a trader view is V1 (`MVP-SCOPE.md`).
- French and Arabic copy on the new screens has not been reviewed by native commercial writers (same
  known gap as the rest of the deck).

---

## 4. Gate

**READY FOR IMPLEMENTATION** — with D1–D7 in `DESIGN-ARCHITECTURE-IMPACT.md` to be written into the
implementation documents during Phase 0, none of which changes the lock.
