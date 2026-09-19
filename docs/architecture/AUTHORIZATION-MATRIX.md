# Maabar — Authorization Matrix

Authorization is evaluated **server-side on every request**, never inferred from the client.
The web tier hides what a user cannot do; the API refuses it. These are two independent
mechanisms and only the second is a control.

---

## 1. The five gates

Every protected endpoint declares a policy. The guard evaluates the gates **in order** and stops
at the first failure, so the error names the real reason and the client can render the right
screen — the design draws different screens for "you need a capability" and "you need to verify".

| # | Gate | Failure | HTTP | Client renders |
|---|---|---|---|---|
| 1 | **Authenticated** — live, unrevoked session | `UNAUTHENTICATED` | 401 | Sign-in |
| 2 | **Capability held** — `capabilities` contains the required kind, unrevoked | `CAPABILITY_REQUIRED` | 403 | `Listing Composer` *blocked* view, with alternatives |
| 3 | **Verification level** — derived level ≥ required, all backing documents unexpired | `VERIFICATION_REQUIRED` | 403 | `Verification` ladder at the missing rung |
| 4 | **Ownership / visibility** — actor owns the resource or is an explicit participant, and the resource is visible to them | `NOT_FOUND` (never `FORBIDDEN`) | 404 | Generic not-found |
| 5 | **Action precondition** — state machine, capacity, feature flag, subscription, rate limit | `STATE_TRANSITION_INVALID`, `CAPACITY_EXCEEDED`, `FEATURE_DISABLED`, `LEGAL_LIMIT_REACHED` | 409 / 403 | State-specific message |

**Gate 4 returns 404, not 403.** Distinguishing "exists but forbidden" from "does not exist" is
an enumeration oracle: an attacker walking `/commitments/:id` could map the platform's volume.
Only where the user already demonstrably knows the resource exists (they are a party) does the
API return a semantic error.

**Gate 3 re-reads live state.** This is the concrete payoff of AD-010: an expired general
authorisation fails gate 3 on the very next request, with no token to wait out.

---

## 2. Capability matrix

Derived from `DESIGN-AUDIT.md` §5 and the two verification ladders. `—` = no account needed.

| Action | Anon | Consumer | Trader | Importer | Min level | Enforcement beyond the guard |
|---|:--:|:--:|:--:|:--:|---|---|
| Browse marketplace, view listing, view seller profile | ✅ | ✅ | ✅ | ✅ | — | Only `published` listings |
| Search (products / traders / importers / trips) | ✅ | ✅ | ✅ | ✅ | — | Importer and trip scopes gated — see §4 |
| Compliance checker | ✅ | ✅ | ✅ | ✅ | — | Public by design |
| Save product / seller / trip | ❌ | ✅ | ✅ | ✅ | L1 | — |
| Message a counterparty | ❌ | ✅ | ✅ | ✅ | L1 | Must share a context object |
| **Publish a consumer-facing listing** | ❌ | ❌ | ✅ | **❌ never** | **L2-T** | **Composite FK (AD-017)** — structurally impossible otherwise |
| Public storefront profile | ❌ | ❌ | ✅ | ❌ | L2-T | Importers have a trust profile, not a storefront |
| Create / publish a sourcing request | ❌ | ❌ | ✅ | ⚠️ | L2-T | ⚠️ **see §7, open conflict** |
| Make a sourcing offer | ❌ | ❌ | ❌ | ✅ | L2-I | Cannot offer on one's own request |
| Discover trips | ❌ | ❌ | ✅ | ✅ | L1 | Subject to trip `visibility` |
| Discover importers | ❌ | ❌ | ✅ | ❌ | L2-T | Behind `discover.importers.audience` (AD-045) |
| Receive aggregated demand | ❌ | ❌ | ❌ | ✅ | **L2-I** | `Demand Board` |
| Create trip (draft) | ❌ | ❌ | ❌ | ✅ | L2-I | — |
| **Publish trip** | ❌ | ❌ | ❌ | ✅ | **L2-I, unexpired** | Monthly cap `max_trips_per_month`; frozen on licence expiry |
| Propose a commitment | ❌ | ❌ | ✅ | ✅ | L2 | Counterparty must also be L2 |
| Accept a commitment | ❌ | ❌ | ✅ | ✅ | L2 | **Never the proposer**; capacity must fit |
| Declare a deposit | ❌ | ❌ | ✅ | ✅ | L2 | **`FEATURE_DISABLED` until legal sign-off** (AD-019) |
| Confirm handover | ❌ | ✅ | ✅ | ✅ | L1 | Party only; both sides required |
| Leave a review | ❌ | ✅ | ✅ | ✅ | L1 | Only from a recorded transaction, once per source |
| Reply to a review | ❌ | ✅ | ✅ | ✅ | L1 | **Subject only**, exactly one |
| Open a dispute | ❌ | ✅ | ✅ | ✅ | L1 | Party to a recorded transaction, inside the window |
| Simplified ledger and Art. 14 labels | ❌ | ❌ | ❌ | ✅ | **L2-I** | `Records` |
| Manage own subscription | ❌ | ❌ | ✅ | ✅ | L1 | `billing` only; never reads commercial data |
| Any admin action | ❌ | ❌ | ❌ | ❌ | — | `admin_users` + role + MFA (§5) |

---

## 3. Endpoint policies — the questions the brief asks

| Question | Policy |
|---|---|
| **Who can create a Trip?** | `auth` + `capability:importer` + `level:L2-I` |
| **Who can publish a Trip?** | The above, **plus** every backing document unexpired, plus `trips_this_month < max_trips_per_month` (rule-resolved), plus the trip is `draft` and complete. Freeze rule: an expired document denies publication while still permitting completion of in-flight commitments |
| **Who can discover Importers?** | `auth` + `capability:trader` + `level:L2-T` + flag `discover.importers.audience = verified_traders` (AD-045). Never anonymous, never consumer |
| **Who can publish a ProductListing?** | `auth` + `capability:trader` + `level:L2-T` + `trader_profiles.listing_eligible` — and the database refuses the row regardless of what the service believes |
| **Who can create a SourcingRequest?** | `auth` + `capability:trader` + `level:L2-T`. **Importer case unresolved — §7** |
| **Who can accept an Offer?** | `auth` + owner of the request + request is `open`/`matched` + offer is `offered` + no other offer accepted |
| **Who can create a Commitment?** | Either party at L2 with the matching capability; both parties L2; counterparty not suspended |
| **Who can confirm Handover?** | Either party; importer additionally needs a valid handover code; one confirmation per party |
| **Who can open a Dispute?** | Party to the commitment, commitment not `expired`/`cancelled`, within `dispute_window_days` of `done` |
| **Who can write a Review?** | Author is a party to a `done` commitment (or a recorded consumer transaction), once per source, never about oneself |
| **Who can access KYC documents?** | The owning user sees **status and expiry only, never the binary**. An admin with `trust_safety` sees the binary through a short-lived signed URL, with every access audited. **Nobody else, ever** — including other admins, support and analytics |
| **Who can make Admin decisions?** | An `admin_users` row with the matching queue role, MFA satisfied, a mandatory reason code, and a stored user-facing consequence |

---

## 4. Visibility rules — beyond ownership

Ownership alone is not enough; several resources are visible to a *set* of users defined by the
resource itself.

| Resource | Rule |
|---|---|
| `Trip` | `all_verified_traders` → any L2-T or L2-I; `my_category_traders` → those whose declared categories intersect; `known_counterparties` → users with a prior terminal commitment with this importer. The owner always sees it |
| **`Trip.value_cap` and value consumption** | **Owner only** (AD-021). Never serialised into any counterparty view. Enforced by two serializers with a test asserting the public one omits the field |
| `SourcingRequest` | `all_verified_importers` → any L2-I; `selected_importers` → the explicit list. Author always |
| `SourcingOffer` | Offer author and request owner only. Competing offerers never see each other's price |
| `DemandAggregate` | L2-I only; cells suppressed below `k` contributors (AD-028) |
| `Conversation` | Participants only. Admins only through a dispute, and only the bundle the dispute references |
| `Dispute` | Both parties and the assigned admin |
| `Review` | Public when `visible`; a `removed_by_moderation` row shows a tombstone, not the text |
| `VerificationDocument` | Binary: owner never, admin with role only. Status and `valid_until`: public on a profile |
| `ProductListing` | Public when `published`; owner sees `draft`/`in_review`/`hidden`; admin sees all |
| `billing.*` | Owner and `billing` admin. Never joined to commercial data (AD-018) |

### 4.1 Search scope authorization

`Search` has four scopes and they are not equally public:

| Scope | Who |
|---|---|
| `products` | Anyone |
| `traders` | Anyone |
| `importers` | L2-T only (AD-045) — an anonymous query returns `403 CAPABILITY_REQUIRED`, not an empty list, so the boundary is honest |
| `trips` | L1+ with trader or importer capability, filtered by each trip's visibility |

---

## 5. Admin authorization

Admin power is separate from user capabilities (`DOMAIN-MODEL.md` §7.1) and is never grantable
by self-service.

| Role | Queues | May see |
|---|---|---|
| `trust_safety` | Verification, risk | KYC binaries via signed URL, device and risk signals |
| `moderation` | Content moderation | Listings, images, message reports. **No KYC binaries** |
| `disputes` | Disputes | The dispute's evidence bundle and referenced conversation only |
| `compliance` | Category review, rule drafts | Regulatory data. No personal documents |
| `regulatory` | Rule publication | Draft → approve. **Separation of duty: cannot approve own draft** |
| `billing` | Subscription confirmation | `billing` schema only. **No commercial data** |
| `superadmin` | Role administration | Cannot decide queue items — granting and deciding are separated |

Requirements for every admin action: MFA enrolled and satisfied; a `reason_code` from
`decision_reasons`; a stored `user_facing_consequence`; an audit row. Corrections are new
decisions referencing the old (AD-024).

Two separations of duty are deliberate and asserted by tests:

1. A `regulatory` admin cannot approve a rule version they drafted.
2. A `superadmin` can grant roles but cannot decide queue items — otherwise one compromised
   account could both grant itself trust powers and clear the evidence.

---

## 6. IDOR / BOLA prevention

The brief calls this out; these are the concrete mechanisms.

1. **No endpoint takes an owner identifier from the request.** Ownership comes from the session.
   `POST /listings` never accepts `seller_user_id`; the field does not exist in the zod schema,
   so an extra key is a validation error, not a silent overwrite.
2. **Every `:id` route loads the resource *scoped* to the actor** — one query with the ownership
   predicate in the `WHERE` clause, not load-then-check. A missed check cannot leak because the
   row was never selected.
3. **UUID v7 primary keys** are unguessable; sequential integers never appear in a URL. Human
   references (`CMT-26-0331`) are also scoped-loaded, never trusted as authorization.
4. **Gate 4 returns 404**, defeating enumeration.
5. **Nested resources re-verify the parent.** `GET /commitments/:cid/messages` checks membership
   of `:cid` before reading messages, and the message query is additionally scoped by
   `conversation_id` — two independent conditions.
6. **Media is never served by path.** Every object goes through a signed URL issued after an
   authorization check, with a short TTL (`FILE-STORAGE.md` §5).
7. **A contract test enumerates every route** and fails the build if any lacks a declared policy,
   or if a policy is `public` without an explicit annotation in the source.

---

## 7. Open conflict blocking a frozen matrix

**Can a micro-importer publish a sourcing request?**

Two approved sources disagree:

- `designs/Verification.dc.html`, importer ladder L2 `unlocks: ['ملف عام', 'نشر طلب توريد']`
  — identity-verified importers unlock *publish a sourcing request*.
- `DESIGN-AUDIT.md` §5: "Create a sourcing request — Micro-importer: ⚠️ only when acting as
  trader", i.e. only if they also hold a verified trader capability.

The difference is material: it decides whether an importer can source *from another importer*
without a commercial register, which touches §9.1's Law 18-05 question.

Until it is settled, the implementation uses the **audit's stricter reading** —
`capability:trader + L2-T` — because the stricter reading cannot create a legal exposure that
the looser one would. This is recorded as AD-044 and listed as blocking in
`TECHNICAL-BLUEPRINT.md` §36.

---

## 8. Policy declaration (shape, not implementation)

```ts
@Policy({
  capability: 'importer',
  level: 'L2',
  requireUnexpiredDocuments: true,
  ownership: 'trip.importer_user_id',
  preconditions: ['trip.state == draft', 'monthlyTripsUnderCap', 'tripComplete'],
})
@Post('/trips/:id/publish')
```

Rules the build enforces:

- Every route has a `@Policy` or an explicit `@Public()`.
- `ownership` names a column, not a callback, so it is greppable and reviewable.
- `preconditions` are named predicates registered in the domain module, not inline lambdas, so
  each one is unit-testable in isolation.
- A route whose policy mentions `level` but not `capability` fails the lint — a level is
  meaningless without the capability it belongs to.
