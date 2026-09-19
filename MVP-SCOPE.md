# Maabar — MVP Scope Boundary

**Status:** 🔒 LOCKED
**Date:** 14 September 2026
**Rule:** if a capability is not marked MVP here, it is not built. Adding one is a scope decision
with a named owner, not a pull request.

---

## 1. Capability classification

| Capability | MVP | Post-MVP | Reason |
|---|:--:|:--:|---|
| **Authentication** (phone + OTP, sessions, revocation) | ✅ | | Nothing works without identity |
| **Profiles** (trader, importer; consumer merged into `users`) | ✅ | | Required for every authorization decision |
| **Capabilities** (multi-select on one identity) | ✅ | | The authorization model depends on it |
| **Verification / KYC** (both ladders, 8 document states, expiry freeze) | ✅ | | Gates the legal invariant. Without it nobody can list or publish a trip |
| **Consumer marketplace** (browse, category, filter, sort) | ✅ | | The public face; also the SEO surface |
| **Trader listings** (compose → moderation → publish → hide → archive) | ✅ | | The revenue-adjacent core, and where the legal invariant bites |
| **Search** (4 scopes, Postgres FTS + Arabic normalization) | ✅ | | Drawn with 5 states; a marketplace without search is not one |
| **Saved items** (products, sellers, trips + change flags) | ✅ | | Small, drawn, and the retention mechanism for consumers |
| **Importer discovery** (trip + importer directory) | ✅ | | The trader's core job |
| **Trip discovery** | ✅ | | Same |
| **Trips + three-axis capacity** | ✅ | | The regulatory core of the product |
| **Demand board** (aggregated, k-thresholded) | ✅ | | The importer's main working screen; the product's thesis |
| **Sourcing requests + offers** | ✅ | | The B2B matching loop |
| **Commitments** (7 stages + 3 terminals, dual handover confirmation) | ✅ | | The keystone; everything else records against it |
| **Messaging** (threads + structured action cards) | ✅ | | Agreement and handover happen inside the thread |
| **Reviews + right of reply** | ✅ | | The trust substrate; reviews require a `done` commitment |
| **Reputation facts** (4 metrics with stored inputs) | ✅ | | Drawn in full with calculation sheets. `price_stability_rate` is conditional on Q1 |
| **Disputes** (5 kinds, 6 states, auto-bundled evidence) | ✅ | | Required before real money is at stake between strangers |
| **Compliance checker** (public, 3 languages) | ✅ | | Public acquisition surface and a legal statement |
| **Regulatory configuration** (8 keys, versioned, time-anchored) | ✅ | | Hard-coding 1,800,000 would be wrong on day one |
| **Admin console** (queues → evidence → decision → reason → consequence → audit) | ✅ | | Verification cannot happen without it |
| **Audit** (append-only, revoked grants) | ✅ | | Business requirement, and cheap |
| **Subscription billing** (plans + manual CCP/BaridiMob confirmation) | ✅ | | Maabar's only revenue |
| **In-app notifications** | ✅ | | The durable record every home screen reads |
| **i18n architecture + Arabic RTL + launch-critical fr/en** | ✅ | | Arabic is the product; fr/en limited to the legally required set |
| | | | |
| **Web Push** | | ✅ Phase 8 | In-app first. Push is the only out-of-app channel, so it lands before launch but after the loops work |
| **Offline PWA browsing** | | ✅ V1 | Only 2 offline states are drawn (search cache banner, resumable upload). Both ship; general offline browsing does not |
| **Trade payments** | | 🔴 **NEVER** | Maabar is not a payment processor. No table, no column, no endpoint |
| **Deposits** | | ⚪ **LEGAL HOLD** | Table exists, flag `false`. Blocked on §9.2 |
| **SATIM / CIB / Eddahabia card payment** | | ✅ V1 | Provider unconfirmed (U5). Adapter interface ships; implementation does not |
| **Email notifications** | | ✅ V1 | No email address is collected anywhere in the design |
| **SMS product notifications** | | ✅ V1 | Cost. SMS is OTP-only at MVP |
| **Group / pooled sourcing** | | ✅ V1 | One opportunity card, no flow, no lifecycle. Building it means inventing product |
| **Reference price index** | | ✅ V1 | No methodology, no minimum sample, no anti-gaming rules. Publishing a thin market signal is a real harm |
| **Desktop layouts** (beyond admin) | | ✅ V1 | Design is mobile-first; a max-width container ships at MVP as a stopgap |
| **Advanced analytics** | | ✅ V1 | Metrics specified, screens not drawn. Operational queue counters ship with the console — those are controls, not analytics |
| **Abstract `Product` separate from `ProductListing`** | | ✅ V1 | Pays off only for cross-trader price comparison. Additive migration later |
| **Requests list / Commitments list screens** | | ✅ V1 | Filtered views over existing data; the pattern exists in `Trader Home` and `Saved` |
| **Consumer profile screen** | | ✅ V1 | Standard account settings; no Maabar-specific decision in it |
| **Hash-chained audit** | | 🔵 On demand | Deferred (ADR-008). Trigger: an external auditor, regulator or insurer asks |
| **Audit partitioning** | | 🔵 On demand | Trigger: `audit_log` above ~50M rows |
| **Malware scanning (ClamAV)** | | 🔵 On demand | Re-encode + rasterise is the real control. Trigger: serving original user bytes to other users |
| **Elasticsearch** | | 🔵 On demand | Trigger: >100k listings or search p95 > 400 ms warm |
| **Redis** | | 🔵 On demand | Trigger: measurable session or rate-limit contention |
| **WebAuthn / passkeys** | | ✅ V1 | Second factor for L2 accounts; adds an enrolment flow the design does not draw |
| **Multi-country / multi-currency** | | 🔴 Future | Breaks single-tenant and single-currency assumptions. A deliberate re-architecture, never a creep |

---

## 2. The 24 screens — all MVP

Every approved screen ships. The scope reductions above are **capabilities inside screens**, never
whole screens.

| Group | Screens |
|---|---|
| Public / consumer (8) | Landing · Consumer Home · Marketplace · Search · Product Detail · Seller Profile · Saved · Compliance Checker |
| Importer (6) | Importer Home · Demand Board · Trip · Trip Creation · Records · Importer Profile |
| Trader (4) | Trader Home · Discover · Sourcing Request · Listing Composer |
| Shared (5) | Onboarding · Verification · Messages · Commitment · Dispute |
| Admin (1) | Admin Console |

Three screens ship with a reduced feature inside them:

| Screen | Reduced | Why |
|---|---|---|
| `Trader Home` | Opportunity feed renders without the *group request* and *price index* cards | Both deferred to V1; the feed is built to tolerate absent card types |
| `Commitment` | Renders **six** lifecycle stages, not seven — `secured` is unreachable | Deposit legal hold. The artboard already models `secured` as optional |
| `Records` | Ledger amounts depend on Q1 | If Q1 is declined, the ledger is user-entered only and `price_stability_rate` is dropped |

---

## 3. What "MVP" costs, stated honestly

| Metric | Value |
|---|---|
| Screens | 24 |
| Backend modules | 11 |
| Database tables | 34 (+1 flagged off) |
| API endpoint groups | ~20 |
| State machines | 1 primary (commitment) + 8 supporting |
| Non-overridable test suites | 6 |
| External services at MVP | **2** — an SMS gateway and Sentry |
| Stateful services to operate | **2** — PostgreSQL and object storage |

Two external services and two stateful services is the measure of whether this is over-engineered.
The first blueprint had five stateful concerns (Postgres, MinIO cluster, ClamAV, search index
table, outbox relay). Three are gone.

---

## 4. Scope rules

1. **A capability not listed as MVP is not built.** No exceptions during a phase.
2. **A screen may not gain a feature that is not in its approved artboard.** The design is complete;
   invention during implementation is the failure mode this scope exists to prevent.
3. **Deferred ≠ forgotten.** Every deferral above names a trigger or a phase. A deferral without a
   trigger is a decision nobody will revisit.
4. **The legal holds are not scope.** `features.deposit_declaration` and
   `discover.importers.audience` are flags awaiting legal answers, not backlog items to prioritise.
5. **Adding to MVP requires removing from MVP.** The seven-month estimate assumes this list.
