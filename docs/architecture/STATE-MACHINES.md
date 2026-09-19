# Maabar — State Machines

Every lifecycle in the system, with its transition matrix. Transitions are **inserts**, never
column updates alone: each one writes a transition row and an audit row in the same transaction.

**Common rules for all machines**

- A transition not listed is invalid and returns `409 STATE_TRANSITION_INVALID` naming the
  current state and the allowed actions.
- Every state-changing endpoint requires an `Idempotency-Key`; a replay returns the original
  result, never a second transition.
- `actor` is `importer`, `trader`, `consumer`, `admin`, `system` (jobs/timers), or `both`.
- Terminal states accept no transitions except an audited admin correction, which is itself a
  new decision referencing the old (AD-024).

---

## 1. Commitment

### 1.1 Vocabulary — a discrepancy, resolved

The brief offers an illustrative list: `Interested · Requested · Accepted · Committed ·
In Progress · Handover · Completed · Disputed · Cancelled · Expired`.

The approved design uses different names and a different shape. `Commitment.dc.html` defines:

```js
FLOW   = [proposed, accepted, secured, buying, transit, handover, done]
SWITCH = [accepted, secured, transit, handover, done, disputed, cancelled, expired]
```

Under the stated source-of-truth hierarchy the design wins. **The implemented vocabulary is the
design's** (AD-026). The mapping is recorded here so nobody re-derives it later:

| Brief's term | Design's term | Note |
|---|---|---|
| Interested | *(no state)* | Pre-commitment interest lives on `DemandSignal`, not on a commitment |
| Requested | `proposed` | Created by a `propose_agreement` action card or from an accepted offer |
| Accepted / Committed | `accepted` | One state, not two |
| — | `secured` | **Deposit declared. Optional, feature-flagged OFF** (AD-019) |
| In Progress | `buying` then `transit` | The design splits purchasing abroad from customs/transit |
| Handover | `handover` | |
| Completed | `done` | Requires **two** handover confirmations |
| Disputed / Cancelled / Expired | same | |

### 1.2 States

| State | Arabic (design) | Meaning | Capacity held? | Deposit shown? |
|---|---|---|---|---|
| `proposed` | اقتُرح الاتفاق | Terms offered, awaiting the other party | No | No |
| `accepted` | وافق الطرفان | Both agreed; trip capacity reserved | **Yes** | No |
| `secured` | صُرّح بالعربون | Both declared a deposit — **optional stage** | Yes | Yes |
| `buying` | الشراء في الخارج | Importer is purchasing at destination | Yes | Yes |
| `transit` | في الطريق والجمركة | In transit / at customs | Yes | Yes |
| `handover` | التسليم | Arrived, arranging delivery | Yes | Yes |
| `done` | مكتمل ومؤكَّد | Both confirmed; review unlocked | Released | Yes |
| `disputed` | في نزاع | Frozen pending a decision | Held | Yes |
| `cancelled` | أُلغي الاتفاق | Ended before purchase | Released | No |
| `expired` | انتهت صلاحية العرض | Never accepted before `offer_expires_at` | Never held | No |

`secured` being skippable is not an implementation convenience — the artboard's `accepted` copy
reads "the next step is to agree a deposit **if you both want**", and `dep:false` on `accepted`,
`cancelled` and `expired`. With `features.deposit_declaration = false`, `secured` is simply
unreachable and the flow renders six stages instead of seven.

### 1.3 Transition matrix

| # | From | Action | Actor | To | Preconditions | Side effects |
|---|---|---|---|---|---|---|
| C1 | — | `create` | trader \| importer | `proposed` | Proposer L2 and holds the matching capability; counterparty L2; if from an offer, offer is `accepted`; `band_valid_until` in the future | Terms snapshot v1; conversation created or reused; action card posted; notify counterparty; `offer_expires_at` set |
| C2 | `proposed` | `accept` | counterparty | `accepted` | Actor is the other party (never the proposer); not expired; **trip capacity available on all three axes**; both parties unsuspended and unexpired | **Locks trip row**, inserts capacity ledger; terms frozen; notify both; trip `collecting_demand` progress updated |
| C3 | `proposed` | `amend` | either | `proposed` | Actor is a party; not expired | New terms version referencing the old; counterparty must re-accept; audit records both versions |
| C4 | `proposed` | `decline` | counterparty | `cancelled` | Actor is the other party | Reason required; notify proposer |
| C5 | `proposed` | `withdraw` | proposer | `cancelled` | Actor is the proposer | Notify counterparty |
| C6 | `proposed` | `expire` | system | `expired` | `now > offer_expires_at` | Notify both; offer renewal CTA ("اطلب تجديداً") |
| C7 | `accepted` | `declare_deposit` | both (two acts) | `secured` | **`features.deposit_declaration = true`**; both parties declared; amount > 0 | Two declaration rows; immutable notice that Maabar neither receives, holds, guarantees nor refunds it |
| C8 | `accepted` | `start_buying` | importer | `buying` | Trip state is `travelling` or later; actor is the trip owner | Notify trader |
| C9 | `secured` | `start_buying` | importer | `buying` | as C8 | as C8 |
| C10 | `buying` | `mark_in_transit` | importer | `transit` | — | Notify trader; ETA from trip `arrival_on` |
| C11 | `transit` | `mark_arrived` | importer | `handover` | — | Generate 6-digit handover code; post `confirm_handover` card; notify trader |
| C12 | `handover` | `confirm_handover` | importer **and** trader | `done` *(only when both exist)* | Actor is a party; code verified once; `HandoverConfirmation` row per party | On the **second** row: release capacity, unlock reviews for both, recompute reputation facts, notify both |
| C13 | `accepted` … `handover` | `open_dispute` | either party | `disputed` | A `Dispute` is created; commitment not already `done` or terminal | Freeze: no further progress transitions; capacity **stays held**; notify counterparty and the trust queue |
| C14 | `done` | `open_dispute` | either party | `disputed` | Within `dispute_window_days` of `done` | As C13, plus reviews for this commitment are frozen pending the decision |
| C15 | `disputed` | `resolve` | admin | previous state \| `done` \| `cancelled` | Dispute `decided`; decision states the resulting commitment state | Decision recorded on both records; reputation recomputed with the design's exclusion rules |
| C16 | `accepted` \| `secured` | `cancel` | either party | `cancelled` | Before `buying`. Mutual, or unilateral with a reason | **Release capacity**; notify; counts against the canceller's completion rate |
| C17 | `buying` \| `transit` \| `handover` | `cancel` | admin only | `cancelled` | Requires an admin decision with a reason | Release capacity; audit; notify both |
| C18 | any non-terminal | `force_transition` | admin | any | Admin decision with mandatory reason and user-facing consequence | Full audit; both parties notified with the reason |

**Invalid by construction** (each has an explicit rejecting test):
`proposed → done` · `accepted → done` (skipping handover) · `done → anything` except C14 ·
`expired → accepted` · `cancelled → *` · self-acceptance (C2 by the proposer) ·
a second `confirm_handover` from the same party · any transition on a commitment whose party is
suspended.

### 1.4 Idempotency and concurrency

- `commitment_transitions` has `UNIQUE (commitment_id, idempotency_key)`.
- C2 and C12 take `SELECT … FOR UPDATE` on the commitment row; C2 additionally locks the trip row
  **first** (fixed lock order: trip → commitment) to avoid deadlock.
- C12's "second row completes it" is evaluated inside the lock, so two simultaneous confirmations
  cannot both believe they are second.

### 1.5 Timers

| Timer | Default | Rule source | Effect |
|---|---|---|---|
| `offer_expires_at` | 7 days | `commitment.offer_validity_days` | C6 |
| `band_valid_until` | Set by the proposer | Design (`صلاحية النطاق`) | Blocks C2 after it passes |
| `handover_reminder` | 48 h before `handover_on` | config | Notification only |
| `dispute_window_days` | 14 days after `done` | config | Bounds C14 |

---

## 2. Supporting machines

### 2.1 Trip

`draft → published → collecting_demand → travelling → customs → handover → closed`
plus `cancelled`.

| From | Action | Actor | To | Preconditions | Side effects |
|---|---|---|---|---|---|
| — | `create` | importer | `draft` | L2-I, capability `importer` | Six-step wizard state |
| `draft` | `publish` | importer | `published` | L2-I valid **and unexpired**; destination, dates, ≥1 category, weight and volume caps set; **monthly trip count < `max_trips_per_month`**; `value_cap` resolved from the effective rule version and stamped | Stamp `rule_version_id`; index for discovery; notify followers of the importer |
| `published` | `open_demand` | system | `collecting_demand` | On publish | Visible in `Discover` per `visibility` |
| `collecting_demand` | `depart` | importer | `travelling` | `depart_on` reached or manual | Commitments may move to `buying` |
| `travelling` | `mark_customs` | importer | `customs` | — | Notify committed traders |
| `customs` | `mark_arrived` | importer | `handover` | — | Enable C11 on each commitment |
| `handover` | `close` | importer \| system | `closed` | All commitments terminal | Reputation recompute; `trips_completed` increments |
| `draft` \| `published` \| `collecting_demand` | `cancel` | importer | `cancelled` | **No `accepted` commitments**, otherwise admin only | Release all ledger rows; notify every interested trader with the reason |

Invariant: publishing is refused with `LEGAL_LIMIT_REACHED` when the monthly count is at the cap.
The cap is resolved from `max_trips_per_month` at the effective date, never a constant.

### 2.2 SourcingRequest

`draft → open → matched → committed → closed` plus `expired`, `cancelled`.

| From | Action | Actor | To | Preconditions |
|---|---|---|---|---|
| — | `create` | trader | `draft` | Capability `trader`, L2-T **(see the open question in `TECHNICAL-BLUEPRINT.md` §36 about importers)** |
| `draft` | `publish` | trader | `open` | Category, quantity, band, deadline, handover wilaya, visibility set |
| `open` | `receive_offer` | importer | `matched` | First offer arrives; request not expired |
| `matched` | `accept_offer` | trader | `committed` | Exactly one offer accepted; all others auto-`declined`; creates a `Commitment` in `proposed` |
| `open` \| `matched` | `expire` | system | `expired` | `now > expires_at` |
| `open` \| `matched` | `cancel` | trader | `cancelled` | No accepted offer |
| `committed` | `close` | system | `closed` | Linked commitment terminal |

Editing after `open` is allowed only while there are no offers; once an offer exists, an edit
creates a new version and notifies every offerer, whose offers move to `expired`.

### 2.3 SourcingOffer

`offered → accepted | declined | withdrawn | expired`.
Accepting one offer declines the rest in the same transaction. An importer may not offer on their
own request (impossible today, but asserted, because one identity can hold both capabilities).

### 2.4 ProductListing

`draft → in_review → published → hidden → archived`, plus `rejected`.

| From | Action | Actor | To | Preconditions |
|---|---|---|---|---|
| — | `create` | trader | `draft` | **`trader_profiles.listing_eligible = true`** — the FK makes anything else impossible |
| `draft` | `submit` | trader | `in_review` | ≥1 photo, price, quantity, category, attributes; moderation checks from `Listing Composer.CHECKS` incl. *no importer data disclosed* |
| `in_review` | `approve` | admin | `published` | Moderation decision with reason |
| `in_review` | `reject` | admin | `rejected` | Reason + user-facing consequence |
| `published` | `hide` \| `unhide` | trader | `hidden` \| `published` | — |
| any | `archive` | trader \| admin \| system | `archived` | **Forced by the system when `listing_eligible` is about to become false** |
| `published` | `takedown` | admin | `hidden` | Moderation decision; visible to the trader with a reason |

The `blocked` view in `Listing Composer` is not a state — it is the authorization denial
`CAPABILITY_REQUIRED` rendered for an importer, together with the three alternatives the design
specifies (publish a trip, appear on the demand board, sell to a trader).

### 2.5 VerificationCase and VerificationDocument

Case: `draft → submitted → under_review → needs_correction → approved | rejected`.
Document: `uploaded → under_review → approved | needs_correction | rejected → expired | superseded`.

| From | Action | Actor | To | Side effects |
|---|---|---|---|---|
| `submitted` | `assign` | admin | `under_review` | Queue claim; prevents two admins deciding the same row |
| `under_review` | `approve` | admin | `approved` | Set `valid_until`; **recompute derived level in the same transaction**; may flip `listing_eligible`; notify |
| `under_review` | `request_document` | admin | `needs_correction` | Problem list + fix list (`Verification.PROBLEMS` / `.FIXES`); **stays in the queue, not restarted** |
| `needs_correction` | `resubmit` | user | `under_review` | New document row; old marked `superseded` |
| `under_review` | `reject` | admin | `rejected` | Reason + right to resubmit |
| `approved` | `expire` | system | `expired` | Daily sweep on `valid_until` |

**Expiry freeze**, verbatim from `Verification.FROZEN`:

| Capability | On expiry |
|---|---|
| Publish a new trip | **Denied** |
| Receive new requests | **Denied** |
| Complete existing commitments | **Allowed** |

Advance notices at 34, 14, 7 and 1 days (the design shows "بعد 34 يوماً" on `Importer Home`).

### 2.6 Handover confirmation — code direction

**ARCHITECTURAL DECISION.** The design shows the code on the receiving party's card
(`Messages`, CTA "استلمتُ ومطابق") but does not say who speaks it. Specified behaviour:

1. On C11 the server generates a 6-digit code, stores only a hash, and shows the **plaintext to
   the receiving party** (the trader) in their handover card.
2. At the meeting, the trader reads the code to the importer, who enters it in their own app.
3. Entering a correct code creates the **importer's** confirmation. The trader's confirmation is
   their own "استلمتُ ومطابق" tap. Both rows ⇒ `done`.

Rationale: the party who physically receives the goods controls the secret, so the importer
cannot self-confirm delivery from home. Code is single-use, expires with the handover window,
and entry is rate-limited to 5 attempts per commitment per hour; exhaustion raises a trust signal
rather than locking the commitment.

### 2.7 Dispute

`submitted → under_review → needs_more_evidence → decided`, plus `withdrawn`.

| From | Action | Actor | To | Side effects |
|---|---|---|---|---|
| — | `open` | party | `submitted` | Commitment → `disputed`; counterparty notified **automatically** (the design's timeline shows this as a system event); evidence auto-bundled by reference |
| `submitted` | `assign` | admin | `under_review` | Queue claim |
| `under_review` | `request_evidence` | admin | `needs_more_evidence` | Specific ask, e.g. "add a photo showing the size label" |
| `needs_more_evidence` | `submit_evidence` | party | `under_review` | — |
| `under_review` | `decide` | admin | `decided` | Decision + mandatory reason + outcome; commitment resolved via C15; recorded on **both** records; **not counted against the opener's completion rate**; reputation recomputed |
| `submitted` \| `under_review` | `withdraw` | opener | `withdrawn` | Commitment returns to its prior state |

### 2.8 Review

`draft → visible`, plus `removed_by_moderation`. No deletion, ever (AD-023).
Creatable only from a `done` commitment or a recorded consumer transaction, once per author per
source. The subject may add exactly one `ReviewReply`, which is always shown alongside.

### 2.9 Subscription (billing — isolated)

`none → pending_payment → active → grace → expired`, plus `cancelled`.

| From | Action | Actor | To | Notes |
|---|---|---|---|---|
| `none` | `choose_plan` | user | `pending_payment` | Monthly / 3-month / yearly |
| `pending_payment` | `submit_receipt` | user | `pending_payment` | CCP / BaridiMob: receipt uploaded, enters the admin billing queue |
| `pending_payment` | `confirm` | admin | `active` | Manual path; activation is idempotent |
| `pending_payment` | `gateway_success` | system | `active` | CIB / Eddahabia via SATIM; instant |
| `active` | `expire` | system | `grace` | At `valid_until`; grace length is configuration |
| `grace` | `expire` | system | `expired` | **Effect on capabilities is an open product question** (AD-043). Default until answered: block new *creation* actions, never interrupt an in-flight commitment |
| any | `cancel` | user \| admin | `cancelled` | No proration, no refund logic at MVP |

No transition in this machine may read or write any commercial entity (AD-018).

---

## 3. Cross-machine rules

1. **Capacity is held from `accepted` to a terminal state.** `disputed` keeps it held — the goods
   exist and the space is spent.
2. **A commitment cannot outlive its trip's cancellation** except through an admin decision.
3. **Reviews unlock only at `done`**, and freeze while a dispute on that commitment is open.
4. **Reputation recomputes** on: C12 (done), C15 (dispute decided), C16/C17 (cancel), and the
   nightly response-time window roll.
5. **Every terminal transition closes the associated conversation to `locked`** — readable
   forever, not writable, so the evidence bundle stays stable.
6. **Suspension** blocks every transition where the suspended user is the actor, but never blocks
   the counterparty from completing or disputing. A suspended user's in-flight obligations remain
   visible to the other side.
