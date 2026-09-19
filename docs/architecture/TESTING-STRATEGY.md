# Maabar — Testing Strategy

Test effort follows consequence. A bug in the marketplace grid is embarrassing. A bug that lets a
micro-importer publish a consumer listing is a legal exposure for a real person, and a bug that
leaks a trip's value capacity tells a stranger how much cash a named woman is carrying to
Istanbul on a known date.

---

## 1. Layers

| Layer | Scope | Tool | Where it runs |
|---|---|---|---|
| Unit | Pure domain logic: state machines, capacity arithmetic, reputation, formatters, Arabic pluralization, rule resolution | Vitest | Every commit |
| Integration | Service + real Postgres in a container; transactions, constraints, locks | Vitest + Testcontainers | Every commit |
| Database | Constraints, generated columns, partial indexes, grants, exclusion constraints | SQL assertions | Every commit |
| API contract | Request/response shape, error envelope, idempotency, pagination | Supertest + zod | Every commit |
| Authorization | Every route × every actor class | Generated matrix suite | Every commit |
| State machine | Every valid and invalid transition | Table-driven | Every commit |
| Concurrency | Parallel transactions against real Postgres | Integration harness | Every commit |
| Security | Headers, CSP, upload handling, rate limits, enumeration | Automated + manual | Nightly + pre-release |
| Frontend unit | Components, forms, hooks | Vitest + Testing Library | Every commit |
| i18n / RTL | Key coverage, direction, bidi isolation, counted nouns, overflow | Custom + visual regression | Every commit |
| E2E | The five designed journeys | Playwright | Pre-merge to main |
| Accessibility | Focus, contrast, roles, reduced motion | axe + manual | Pre-release |
| Performance | API p95, bundle budgets, Lighthouse on throttled mobile | k6 + Lighthouse CI | Nightly |

---

## 2. The critical invariants — tested first, and hardest

These seven suites are written **before** the features they protect, and a failure blocks the
pipeline with no override.

### 2.1 Legal invariant — an importer cannot create a consumer listing

```
✓ POST /listings as importer-only, L2-I            → 403 CAPABILITY_REQUIRED
✓ POST /listings as trader L1 (identity only)      → 403 VERIFICATION_REQUIRED
✓ POST /listings as trader L2-T without RC         → 403 VERIFICATION_REQUIRED
✓ POST /listings as trader L2-T with RC            → 201
✓ POST /listings with a forged seller_user_id body → 422 (field not in schema)
✓ Direct INSERT as maabar_app for an importer      → SQLSTATE 23503     ← the real control
✓ Direct INSERT for a suspended trader             → SQLSTATE 23503
✓ UPDATE trader_profiles SET rc_verified=false
     while listings exist                          → SQLSTATE 23503
✓ Archiving listings first, then revoking          → succeeds, listings archived, audit written
✓ A user holding BOTH trader and importer
     capabilities may list                         → 201  (the capability, not the person, is the gate)
```

The last case matters: one identity may legitimately be both, and the rule is about the
*capacity in which they act*, not about excluding a person.

### 2.2 KYC isolation

```
✓ Owner requesting their own document binary       → no such endpoint exists (404)
✓ Another user requesting a document               → 404 (never 403)
✓ moderation admin requesting a KYC binary         → 403
✓ trust_safety admin with an open case             → 302 to a signed URL
✓ The signed URL expires after 120 s               → 403 from storage
✓ An audit row exists BEFORE the URL is issued     → assert ordering
✓ maabar_readonly SELECT on verification_documents → permission denied
✓ Object keys contain no user id, phone or type    → regex assertion over generated keys
```

### 2.3 Trip value-capacity privacy

```
✓ GET /trips/:id as owner            → capacity.value present with rule provenance
✓ GET /trips/:id as any other actor  → no key matching /value|centimes/ under capacity
✓ GET /discovery/trips               → same assertion over every element
✓ search.documents facets            → contain no value figure
✓ Analytics export fixture           → contains no value figure
```

### 2.4 Commitment transitions

Table-driven over every (state × action × actor) triple — valid ones asserted to succeed with the
right side effects, **all others asserted to return `409 STATE_TRANSITION_INVALID`**. Explicitly
named cases: `proposed → done`; `accepted → done`; self-acceptance by the proposer; a second
`confirm_handover` from the same party; any transition on a commitment whose party is suspended;
`expired → accepted`; `cancelled → anything`.

Plus: `done` requires exactly two `handover_confirmations`; with
`features.deposit_declaration = false`, `secured` is unreachable and `accepted → buying` works.

### 2.5 Capacity concurrency

```
✓ 10 parallel accepts against a trip with room for 3
      → exactly 3 succeed, 7 return 409 CAPACITY_EXCEEDED, ledger sum ≤ cap on all three axes
✓ Value axis alone exhausted     → 409 naming axis=value  (even though it is never displayed)
✓ Weight axis alone exhausted    → 409 naming axis=weight
✓ Volume axis alone exhausted    → 409 naming axis=volume
✓ Cancellation releases capacity → a subsequent accept succeeds
✓ Dispute does NOT release capacity
✓ Replayed Idempotency-Key       → one transition, one ledger row, identical response
✓ Interleaved accept + cancel on one trip, 50 iterations → no deadlock, invariant holds
```

The last case is the lock-ordering regression test (`DATABASE-DESIGN.md` §5.1).

### 2.6 Admin auditability and immutability

```
✓ A decision without reason_code                → 422
✓ Every decision writes an audit row in the same transaction
✓ UPDATE / DELETE on admin_decisions as maabar_app → permission denied
✓ UPDATE / DELETE on audit_log as maabar_app       → permission denied
✓ DELETE on reviews as maabar_app                  → permission denied
✓ A correction creates a new row with supersedes_decision_id; both remain
✓ Hash chain verifies across a stream; a tampered row is detected
✓ Two admins claiming one case → one succeeds, one sees the claimer
✓ A regulatory admin approving their own draft → CHECK violation
```

### 2.7 Regulatory reproducibility

```
✓ get(key, asOf) returns the version effective at that date, across boundaries
✓ Overlapping in-force versions → exclusion constraint violation
✓ A trip published under v2 still reports v2's cap after v3 activates
✓ A commitment from v2 renders identically after v3 activates
✓ Publishing beyond the cap → 403 LEGAL_LIMIT_REACHED with rule_key and effective_from
✓ The third trip in a calendar month → refused
✓ Impact preview lists exactly the affected trips
✓ Deposit endpoints return 403 FEATURE_DISABLED in every environment config
✓ CI fails if production config sets features.deposit_declaration = true without a sign-off ref
```

---

## 3. Authorization matrix suite

Generated, not hand-written, so it cannot fall behind the routes.

```
for each route in routeRegistry:
  for each actor in [anonymous, consumer L0/L1, trader L1/L2-T/L3,
                     importer L1/L2-I/L3, suspended, expired-documents,
                     admin(each role), wrong-owner]:
      assert response matches the declared policy
```

Plus structural assertions:

- Every route has a `@Policy` or an explicit `@Public()` — a missing one **fails the build**.
- No route with `level` but no `capability`.
- Gate 4 failures return `404`, never `403`.
- **Switching active context (`import` ↔ `buy`) changes no authorization outcome anywhere.**
- An expired document demotes the level on the *next request*, with no session refresh.

---

## 4. i18n and RTL

| Test | Assertion |
|---|---|
| Key completeness | Every `ar` key present; gaps in the launch-critical list (`I18N-ARCHITECTURE.md` §11) fail the build |
| No hard-coded user-facing strings | Lint over components and services |
| Counted nouns | 1, 2, 3, 10, 11, 100, 101, 102 → correct Arabic form; "1 أصناف" must never appear |
| LTR isolation | Every formatter output starts `U+2066`, ends `U+2069` |
| Bidi regression | `60%` renders as `60%`; `S · M · L · XL` keeps order inside Arabic — the two failures the RTL review caught |
| No physical directions | Stylelint across component CSS |
| Direction flip | Visual regression of all 24 screens in `ar` and `fr` |
| Overflow | French at 130% of Arabic length does not clip |
| No Arabic letter-spacing or uppercase | Computed-style assertion on `[lang="ar"]` |
| Arabic search | `معطف` ↔ `المعاطف`; `عطر` ↔ `عطور`; Arabic-Indic digits match Western |

---

## 5. End-to-end journeys

The five journeys the audit walks (`DESIGN-AUDIT.md` §6), each once in Arabic RTL on a mobile
viewport and once in French LTR:

1. **Importer** — onboarding → verification (ladder → document → review → approved) → home →
   demand board → trip creation → trip → receive a sourcing request → commitment → handover →
   records.
2. **Trader** — onboarding → verification (RC) → home → discover → importer profile → sourcing
   request (compose → offers → agreement) → commitment → messages → review; plus listing
   composer → seller profile → marketplace.
3. **Consumer** — home → search → product detail → seller profile → messages → saved → review.
4. **Trust & safety** — dispute (six states) → admin console (queue → evidence → decision →
   reason → consequence → audit).
5. **Compliance** — checker → verdict → why → what to do → legal basis → source.

Plus one negative journey, because it is the product's whole legal thesis:
**an importer attempts to publish a consumer listing and is shown the blocked state with the
three alternatives.**

---

## 6. Performance

| Target | Threshold |
|---|---|
| API p95 | < 300 ms (reads), < 600 ms (transitions) |
| Marketplace grid p95 | < 250 ms server time |
| Search p95 | < 400 ms |
| LCP, public pages, throttled 3G | < 2.5 s |
| Initial JS, public routes | < 180 KB gzipped |
| CLS | < 0.05 (fixed aspect ratios make this achievable) |
| Capacity accept under 20 concurrent | No deadlock, no lost update |

k6 scenarios: marketplace browse, search, demand board build-up, concurrent commitment accepts.

---

## 7. Accessibility

- Keyboard reachable in both directions; focus visible (`:focus-visible` is already in
  `tokens.css`).
- Contrast: 4.5:1 body, 3:1 large text — verified against the token palette, including the status
  chips.
- Status is never colour alone: every chip carries a glyph, as the deck does.
- `prefers-reduced-motion` honoured (already in `tokens.css`); motion ≤ 200 ms.
- Screen reader passes in Arabic on the five journeys.
- Every form field labelled; every error associated with its field.

---

## 8. Coverage targets

| Area | Target |
|---|---|
| Domain services and state machines | **95%** branch |
| Authorization policies | **100%** route coverage |
| Regulatory resolver | **100%** |
| Capacity and money arithmetic | **100%** |
| Formatters and pluralization | **100%** |
| API controllers | 85% |
| Frontend components | 70% |
| Overall | 80% |

Percentages are a floor, not the goal. The seven §2 suites matter more than the aggregate: a
100% line-covered system that permits an importer listing has failed.

---

## 9. Test data

- **Fixtures, never production data.** Staging is seeded synthetically; there is no path that
  copies real KYC documents or phone numbers into a lower environment.
- Fixture personas mirror the deck: a verified importer with a long record; a new importer with a
  short one; a verified trader with RC; a trader with identity only; a consumer; a suspended user;
  a user with expired documents; a dual-capability user.
- Fixture KYC documents are obviously synthetic images with "SPECIMEN" printed across them.
- Arabic, French and English content in every fixture set, so a locale gap surfaces in
  development rather than in review.

---

## 10. CI gates

| Stage | Blocks merge |
|---|---|
| Lint, typecheck, stylelint (no physical directions), secret scan | ✅ |
| Unit + integration + database | ✅ |
| **Authorization matrix (100% route coverage)** | ✅ |
| **State-machine table** | ✅ |
| **The seven critical-invariant suites** | ✅ |
| i18n key completeness (launch-critical set) | ✅ |
| Contract tests | ✅ |
| E2E on main | ✅ |
| Visual regression | ⚠️ review required, not auto-blocking |
| Performance budgets | ⚠️ warn, block on regression > 20% |

No override exists for the critical-invariant suites. A red build there is a product decision, not
an engineering inconvenience.
