# Maabar — Screen → Domain → API Matrix

All 24 approved screens, including the simple ones. Column meanings:

- **Actor / policy** — required capability and derived level (`—` = public)
- **API** — endpoints from `API-CONTRACT.md`
- **States** — the states the artboard actually draws, which are the states the route must handle

---

## Public / consumer (8)

### 1. `Landing`
| | |
|---|---|
| **Actor** | — public |
| **Route** | `/` — SSR/ISR, 5 min revalidate |
| **Domain** | marketplace, trips, profiles (counts only), compliance |
| **Data** | Proof counts (products listed, trips published, verified importers); discovery tiles; the three-actor loop; how-it-works steps; trust rows; a compliance example; **platform-limits block** |
| **API** | `GET /listings?limit=8&sort=recent` · `GET /stats/public` · `GET /compliance/check?goods=<example>` |
| **Mutations** | None |
| **States** | Default only; full ar/fr/en parity **already built** |
| **Notes** | The limits block (no exchange, no payments or escrow, no buying by proxy, no customs declaration, no guarantee, no government approval) is legal positioning and must never be reduced to marketing copy. Prime SEO surface |

### 2. `Consumer Home`
| | |
|---|---|
| **Actor** | consumer / L0 (richer at L1) |
| **Route** | `/home` — SSR, personalised sections client-fetched |
| **Domain** | marketplace, profiles, saved |
| **Data** | Category tiles with counts; fresh arrivals with "today/yesterday"; verified sellers with confirmed-transaction counts; saved items with change notes; the three-step "how it works" |
| **API** | `GET /categories` · `GET /listings?sort=recent` · `GET /profiles/traders?sort=confirmed` · `GET /saved?type=listing` |
| **Mutations** | `POST /saved`, `DELETE /saved/:type/:id` |
| **States** | Signed out (no saved block), signed in, empty saved |
| **Notes** | Low density, imagery-led (`tier-public`). Step 3 — "the sale is between you and the seller; Maabar does not sell and does not receive money" — is required copy |

### 3. `Marketplace`
| | |
|---|---|
| **Actor** | — public |
| **Route** | `/market` — SSR first page, client pagination |
| **Domain** | marketplace |
| **Data** | 7 categories with counts; listing cards (title, price, seller + wilaya, confirmed transactions, flag `new`/`low`/`on order`); sorts; filters (wilaya, availability, origin) |
| **API** | `GET /listings?category=&wilaya=&availability=&origin=&sort=&cursor=` · `GET /categories` |
| **Mutations** | `POST /saved` |
| **States** | Grid, filter sheet, loading skeleton, empty |
| **Invariant** | **Every seller is a trader with a verified commercial register.** Enforced by the composite FK (AD-017) — the query needs no `WHERE role = …` because ineligible rows cannot exist |

### 4. `Search`
| | |
|---|---|
| **Actor** | scope-dependent (`AUTHORIZATION-MATRIX.md` §4.1) |
| **Route** | `/search` |
| **Domain** | search |
| **Data** | 4 scopes with counts (products 128 · traders 14 · importers 9 · trips 4); filter chips; per-scope result shapes; suggestions |
| **API** | `GET /search?q=&scope=&filters=&cursor=` · `GET /search/suggest?q=` |
| **Mutations** | `POST /saved` |
| **States** | **results · loading (skeletons) · empty (with suggestions and "post a sourcing request instead") · error (connection lost, query preserved) · offline (cached results banner)** |
| **Notes** | The `importers` scope returns `403 CAPABILITY_REQUIRED` to an anonymous caller, never an empty list. Arabic normalization per `DATABASE-DESIGN.md` §8 |

### 5. `Product Detail`
| | |
|---|---|
| **Actor** | — public |
| **Route** | `/market/:listingId` — SSR, ISR 60 s |
| **Domain** | marketplace, profiles, reviews, compliance |
| **Data** | Gallery; title; price with per-unit note; origin; updated-at; seller with wilaya, verified-trader status and verified RC; specs (category, sizes, colours, material, quantity, delivery); seller trust facts; reviews; **three disclosures**; similar items |
| **API** | `GET /listings/:id` · `GET /profiles/:sellerId/reputation` · `GET /profiles/:sellerId/reviews?limit=2` · `GET /listings/:id/similar` |
| **Mutations** | `POST /saved` · `POST /conversations` (contact seller) |
| **States** | Default, saved toggled, disclosure expanded, out of stock |
| **Invariant** | The **payment disclosure** — "payment is directly with the seller; Maabar does not receive, hold, guarantee or refund, and is not a party to the sale" — is part of the API resource, not client copy |

### 6. `Seller Profile`
| | |
|---|---|
| **Actor** | — public |
| **Route** | `/sellers/:id` — SSR |
| **Domain** | profiles, marketplace, reviews |
| **Data** | Shop name, verified-trader + wilaya, member since, bio, categories; stats (confirmed transactions, response rate, average response); verified list (RC verified, identity verified, business address confirmed); products with flags; reviews with replies |
| **API** | `GET /profiles/traders/:id` · `GET /listings?seller=:id` · `GET /profiles/:id/reviews` · `GET /profiles/:id/reputation` |
| **Mutations** | `POST /saved` · `POST /conversations` |
| **States** | Default, saved, no reviews yet |
| **Invariant** | **A micro-importer never has this page.** Route resolves only for a `trader_profiles` row |

### 7. `Saved`
| | |
|---|---|
| **Actor** | any / L1 |
| **Route** | `/saved` |
| **Domain** | saved, notifications |
| **Data** | 3 tabs with counts (products 4, stores 3, trips 2); per-item change flags: price drop with previous price, low stock, unavailable, seller news, trip ended |
| **API** | `GET /saved?type=` · `DELETE /saved/:type/:id` |
| **Mutations** | Unsave |
| **States** | **full · empty (per tab, with a route out) · price-drop · low-stock · unavailable · expired** |
| **Notes** | Saving subscribes to a watch; the flags are notification kinds rendered inline (`NOTIFICATIONS.md` §2.3) |

### 8. `Compliance Checker`
| | |
|---|---|
| **Actor** | — **public, no account** |
| **Route** | `/compliance` — SSR, per-query ISR; a high-value acquisition and SEO surface |
| **Domain** | compliance, regulatory |
| **Data** | Query field; quick chips; verdict chip; reason; what-to-do steps; **collapsed** legal basis with article; **collapsed** source with last-updated and official link; share; disclaimer |
| **API** | `GET /compliance/check?goods=&origin=` · `GET /compliance/categories` |
| **Mutations** | None |
| **States** | Idle, result (allowed / conditional / prohibited), not found, error; **ar/fr/en parity already built** |
| **Invariant** | Disclosure order is fixed: verdict → reason → steps → (collapsed) legal basis → (collapsed) source. Never legal text before the verdict. Customs disclaimer always present. No commercial accent colour on this surface |

---

## Importer (6)

### 9. `Importer Home`
| | |
|---|---|
| **Actor** | importer / L1+ |
| **Route** | `/i` |
| **Domain** | trips, demand, commitments, verification, notifications |
| **Data** | Active trip (destination, dates, days left, **three capacity meters**, "trip 1 of 2 this month"); ranked attention cards with deadlines; top demand; risks; recent activity; context switcher |
| **API** | `GET /trips/me/active` · `GET /trips/me/quota` · `GET /notifications/attention` · `GET /demand/board?limit=3` · `GET /commitments?state=needs_action` |
| **Mutations** | `PATCH /session/context` |
| **States** | No trip yet, active trip, pre-L2 (meters hidden, verification CTA), licence expiring |
| **Notes** | Value meter is **owner-only** (AD-021). Attention ranking per `NOTIFICATIONS.md` §7 |

### 10. `Demand Board`
| | |
|---|---|
| **Actor** | importer / **L2-I** |
| **Route** | `/i/demand` |
| **Domain** | demand, trips, compliance |
| **Data** | "Built on 214 requests"; trip context with three live meters; category filters; items with confirmed/interested counts, top wilayas, price band over a market track, compliance chip and note, unit cost/weight/volume; buy-list summary in counted nouns |
| **API** | `GET /demand/board?category=` · `POST /trips/:id/buy-list/items` · `PATCH …` · `DELETE …` |
| **Mutations** | Add / increment / decrement / remove buy-list items |
| **States** | Full, filtered, item in list, **item blocked ("does not fit in the remainder")**, empty |
| **Invariants** | Aggregates are anonymous and k-thresholded (AD-028). Mutations return recomputed three-axis capacity and `409 CAPACITY_EXCEEDED` with the failing axis |

### 11. `Trip`
| | |
|---|---|
| **Actor** | importer / L2-I, **owner** |
| **Route** | `/i/trips/:id` |
| **Domain** | trips, commitments, demand |
| **Data** | Destination, dates, status; 5 stages; **three capacity meters with remaining**; buy list with per-item state (fully requested / partially / no confirmed buyer); named buyers with wilaya, quantity and agreement state |
| **API** | `GET /trips/:id` (owner serializer) · `GET /trips/:id/buy-list` · `POST /trips/:id/stage` |
| **Mutations** | Advance stage, edit buy list, cancel |
| **States** | Collecting, travelling, customs, handover, closed, cancelled; partial fulfilment per item |
| **Invariant** | This is the **only** surface where named individual demand appears, and only to the trip owner |

### 12. `Trip Creation`
| | |
|---|---|
| **Actor** | importer / L2-I |
| **Route** | `/i/trips/new` |
| **Domain** | trips, regulatory, categories |
| **Data** | 6 steps: destination · dates · categories · **three-axis capacity** · visibility · review |
| **API** | `GET /categories` · `GET /regulatory/rules/max_value_per_trip` · `GET /trips/me/quota` · `POST /trips` · `POST /trips/:id/publish` |
| **Mutations** | Create draft, publish |
| **States** | Per step, review, published, **blocked (monthly cap reached)**, blocked (documents expired) |
| **Invariants** | The value cap is **padlocked and read-only**, labelled "الحدّ القانوني", shown with its effective date, resolved from the rule engine and stamped on the trip. Weight and volume are editable, labelled "حدودك أنت". Publication is refused with `LEGAL_LIMIT_REACHED` at the monthly cap |

### 13. `Records`
| | |
|---|---|
| **Actor** | importer / **L2-I** |
| **Route** | `/i/records` |
| **Domain** | commitments, trips, regulatory, **billing** |
| **Data** | **Ledger** — operations count, import value, "2 of 2 trips", entries with in/out/fee kinds including customs duty at the configured rate and the Maabar subscription line. **Labels** — Art. 14 label data (importer name, address, goods, country of origin) plus a goods note, printable at 24 per sheet. **Subscription** — days left, plan, expiry, plans, payment method |
| **API** | `GET /records/ledger` · `GET /records/labels?item=` · `GET /billing/subscription` · `GET /billing/plans` · `POST /billing/subscriptions` · `POST /billing/subscriptions/:id/receipt` · `POST /billing/subscriptions/:id/pay` |
| **Mutations** | Choose plan, upload CCP receipt, start card payment, print labels |
| **States** | Ledger populated / empty, **missing address (labels cannot be generated)**, subscription active / expiring / pending confirmation |
| **Invariant** | The subscription line renders with a distinct `fee` kind. It is the user's own bookkeeping note, **not** a Maabar money movement, and the billing API is never joined to commercial data (AD-018) |

### 14. `Importer Profile`
| | |
|---|---|
| **Actor** | trader / L2-T viewing (AD-045); owner always |
| **Route** | `/importers/:id` |
| **Domain** | profiles, reputation, reviews, trips |
| **Data** | Name, role, member since, transaction count; **three decomposable stats, each opening a calculation sheet**; 12-month histogram; activity; **document status only**; categories with counts; destinations; reviews with replies |
| **API** | `GET /profiles/importers/:id` · `GET /profiles/:id/reputation` (facts **with inputs**) · `GET /profiles/:id/reviews` |
| **Mutations** | `POST /saved` · `POST /conversations` |
| **States** | Default, sheet open (completion / response / price stability), new importer (short record) |
| **Invariants** | **No composite score** (AD-020). Each sheet is stored, not recomputed: completion excludes documented customs holds; response time is a **median**, not a mean; price stability measures against the declared band. Documents show status and validity only — **never the binary** |

---

## Trader (4)

### 15. `Trader Home`
| | |
|---|---|
| **Actor** | trader / L1+ |
| **Route** | `/t` |
| **Domain** | discovery, sourcing, commitments, trips, reputation |
| **Data** | Opportunity feed (matching trip · **group request** · **reference price signal**); trips to discover; ranked decisions with timers; my requests with states; fresh products; my reputation facts; context switcher |
| **API** | `GET /discovery/opportunities` · `GET /trips?limit=3` · `GET /notifications/attention` · `GET /sourcing-requests?mine=1` · `GET /listings?sort=recent` · `GET /profiles/me/reputation` |
| **Mutations** | `PATCH /session/context` |
| **States** | No open request (discovery leads — a deliberate v2 correction), active pipeline, pre-L2 |
| **Gaps** | The group-request and price-index cards are **deferred** (AD-041, AD-042); the feed renders without them at MVP |

### 16. `Discover`
| | |
|---|---|
| **Actor** | trader / L2-T (importers tab); L1 (trips tab) |
| **Route** | `/t/discover` |
| **Domain** | discovery, trips, profiles |
| **Data** | 3 tabs (trips · importers · products) with per-tab filter chips; trip cards with country, destination, dates, arrival, state, categories, **weight and volume meters only**, importer with confirmed transactions and response time; importer cards with level, document validity, categories, four stats, next trip |
| **API** | `GET /discovery/trips?filters=` · `GET /discovery/importers?filters=` · `GET /listings` |
| **Mutations** | Follow a trip, `POST /conversations`, request an offer |
| **States** | Per tab, filtered, empty, loading |
| **Invariant** | **The trip value meter is absent from this surface.** The artboard states it directly: the value meter is the importer's legal cap against their own money and is never shown to a counterparty (AD-021) |

### 17. `Sourcing Request`
| | |
|---|---|
| **Actor** | trader / L2-T |
| **Route** | `/t/requests/new`, `/t/requests/:id` |
| **Domain** | sourcing, commitments |
| **Data** | **compose** (category, specification with hints, quantity, target band, deadline, handover wilaya, visibility) → **published** (summary) → **offers** (comparison cards with proposed price, arrival date, quantity covered, offerer record, note, best-match marker) → **agreement** (terms) |
| **API** | `POST /sourcing-requests` · `POST /:id/publish` · `GET /:id/offers` · `POST /offers/:id/accept` · `POST /offers/:id/decline` |
| **Mutations** | Create, publish, accept, decline, discuss |
| **States** | compose · published · offers · agreement · no offers yet · expired · cancelled |
| **Invariants** | Offers may be **partial** (80 of 120 drawn). Accepting is one transaction that declines siblings and creates a `Commitment` in `proposed`. **No payment field anywhere** — this is a request, not an order |

### 18. `Listing Composer`
| | |
|---|---|
| **Actor** | trader / **L2-T with verified commercial register** |
| **Route** | `/t/listings/new` |
| **Domain** | marketplace, media |
| **Data** | Photos (min 1); category; title; description; attributes (sizes, colours, material); price; quantity; delivery options; pre-publication checks; what happens after |
| **API** | `POST /listings` · `POST /listings/:id/media` · `POST /listings/:id/submit` |
| **Mutations** | Create draft, upload media, submit for moderation |
| **States** | **compose · review · under moderation · BLOCKED (no capability)** |
| **Invariants** | The blocked state is the legal boundary taught in-product: an importer is told plainly that public listing requires a commercial register, and shown the three things they *can* do. Backed by the composite FK, not by hiding a button. One pre-publication check is "no importer data disclosed" |

---

## Shared (5)

### 19. `Onboarding`
| | |
|---|---|
| **Actor** | — public → authenticated |
| **Route** | `/onboarding` |
| **Domain** | identity, capabilities |
| **Data** | phone → OTP (6 cells) → profile (name, wilaya, **language ar/fr/en**) → capability multi-select with requirement chips → done with unlocked/locked list |
| **API** | `POST /auth/otp/request` · `POST /auth/otp/verify` · `PATCH /users/me` · `POST /capabilities` · `GET /auth/me` |
| **Mutations** | Create identity, set profile, declare capabilities |
| **States** | Per step, OTP error, OTP resend cooldown, done |
| **Invariants** | **Capabilities are multi-select on one identity** (AD-014). The done screen states plainly that browse/save/message work now and trip publication comes after verification — capability ≠ permission |

### 20. `Verification`
| | |
|---|---|
| **Actor** | any declared capability / L0+ |
| **Route** | `/verify` |
| **Domain** | verification, media, regulatory |
| **Data** | **Role-aware ladder** (importer and trader) with rungs, requirements and unlocks; document explainer with "why"; capture tips; quality checks; upload progress; submitted list with per-document status; problems and fixes; approved with new unlocks; expired with the frozen-capability table |
| **API** | `GET /verification/ladder` · `GET /verification/requirements` · `POST /verification/documents/upload-session` · `POST /verification/documents` · `POST /verification/cases/:id/submit` · `GET /verification/cases/:id` |
| **Mutations** | Upload, submit, resubmit |
| **States** | **ladder · document · preview · uploading · under review · needs correction · approved · expired** |
| **Invariants** | The trader ladder ends in the one capability an importer can never hold. Required documents come from `required_documents_per_role` (AD-022). Expiry freezes new trips and new requests but **permits completing existing commitments**. Uploads are resumable. The owner never sees their own document binary |

### 21. `Messages`
| | |
|---|---|
| **Actor** | any / L1, participant |
| **Route** | `/messages`, `/messages/:conversationId` |
| **Domain** | messaging, commitments |
| **Data** | Thread with text bubbles and **structured action cards**: proposed agreement (item, quantity, band, deadline+place, accept/modify) and handover (delivered quantity, pickup point, **6-digit code**, received-and-matching / I-object); quick templates |
| **API** | `GET /conversations` · `GET /conversations/:id/messages?after=` (load **and** poll) · `POST /conversations/:id/messages` · `POST /conversations/:id/actions` · `POST /messages/:id/action/accept` |
| **Mutations** | Send, post card, accept card, confirm handover, open dispute |
| **States** | Thread, unread, card pending, card accepted, locked (terminal), blocked |
| **Invariants** | Accepting a card mutates domain state **in the same transaction** as the message. Handover code direction per `STATE-MACHINES.md` §2.6. Polling, not WebSockets (AD-036) |

### 22. `Commitment`
| | |
|---|---|
| **Actor** | party / L2 |
| **Route** | `/commitments/:id` |
| **Domain** | commitments, trips, disputes, reviews |
| **Data** | Reference (`CMT-26-0331`); status banner with title, explanation and one primary action; **7-stage lifecycle with dates**; terms (goods, specification, quantity, **price band**, handover, trip); deposit block **when enabled** |
| **API** | `GET /commitments/:id` · `GET /commitments/:id/timeline` · `POST /commitments/:id/{accept,amend,cancel,stage,handover/confirm}` · `POST /disputes` · `POST /reviews` |
| **Mutations** | Every transition in `STATE-MACHINES.md` §1.3 |
| **States** | **accepted · secured · transit · handover · done · disputed · cancelled · expired** (8 switchable in the artboard) |
| **Invariants** | `secured` is **optional and feature-flagged off** (AD-019); with the flag off the flow renders six stages. Accepting consumes trip capacity under a row lock. `done` requires **two** handover confirmations. The cancelled copy states plainly that nothing was deducted |

### 23. `Dispute`
| | |
|---|---|
| **Actor** | party / L1 |
| **Route** | `/disputes/new?commitment=`, `/disputes/:id` |
| **Domain** | disputes, commitments, messaging, media |
| **Data** | 5 issue types; desired outcome (replace / partial / record only); description and evidence upload; **auto-attached bundle** (your description and photos, the recorded agreement specification, the full conversation, timestamped handover photos); timeline; decision with its effects |
| **API** | `POST /disputes` · `POST /disputes/:id/evidence` · `GET /disputes/:id` |
| **Mutations** | Open, add evidence, withdraw |
| **States** | **type · details · submitted · under review · needs more evidence · decided** |
| **Invariants** | The counterparty is notified **automatically** on opening. Recorded on **both** records. **Not counted against the opener's completion rate**. Evidence is bundled by reference, never copied |

### 24. `Admin Console`
| | |
|---|---|
| **Actor** | `admin_users` + queue role + **MFA** |
| **Route** | `/admin` — **desktop, 1240px** |
| **Domain** | admin, audit, every queue subject |
| **Data** | Queue groups (Trust & Safety · Compliance · **Billing, separate**) with counts and SLA; rows with reference, title, subject, age, risk; evidence panels (documents with validity, signals, context, history with actor ids); decision (action, **mandatory reason**, consequence preview) |
| **API** | `GET /admin/queues` · `GET /admin/queues/:q/items` · `POST /…/claim` · `GET /admin/cases/:id/evidence` · `GET /admin/documents/:id/view` · `POST /admin/cases/:id/decide` |
| **Mutations** | Claim, decide, suspend, publish a rule, confirm a receipt |
| **States** | Per queue, row selected, action selected, consequence previewed, claimed by another admin |
| **Invariants** | Billing is a **separate group** so the console never implies Maabar settles trade. Reason is mandatory. Consequence is **stored**. Corrections supersede, never edit. KYC view mints a 120 s signed URL and **audits before issuing**. No commercial accent colour on this tier |

---

## Coverage check

| | Count |
|---|---|
| Screens in `DESIGN-AUDIT.md` §4 | 24 |
| Screens mapped above | **24** |
| Screens with no implementation path | **0** |
| Screens blocked by an unresolved question | **0** (`Commitment` ships with `secured` disabled; `Sourcing Request` ships with the audit's stricter authorization pending AD-044) |

Cross-cutting requirements applying to every screen: `tokens.css` variable layer; logical
properties only; LTR-isolated numbers from the shared formatter; Arabic counted nouns; no
letter-spacing or uppercase on Arabic; `prefers-reduced-motion` honoured; motion ≤ 200 ms;
every state answers *what happened · why · what can I do next*.
