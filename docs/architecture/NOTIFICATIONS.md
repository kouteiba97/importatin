# Maabar — Notifications

Notifications are how the product keeps a deadline-driven, multi-day, two-party process alive
across people who are not looking at the app. `Importer Home` and `Trader Home` both lead with a
ranked "needs your attention" block carrying explicit deadlines — that block is a read model over
this system.

---

## 1. Channels

| Channel | MVP | Use | Cost | Notes |
|---|---|---|---|---|
| **In-app** | ✅ | Everything | None | The authoritative feed; every notification lands here |
| **Web Push** | ✅ | Time-sensitive, user opted in | None | VAPID; the PWA is installable so this is the phone-reaching channel |
| **SMS** | ✅ **OTP only** | Authentication | **High** | Never used for product notifications at MVP |
| **Email** | ⛔ V1 | Receipts, digests | Low | The design never collects an email address. Adding it would be new product |

The SMS restriction is deliberate and financial as well as architectural: SMS in Algeria is
expensive enough that a chatty product could spend more on messaging than on hosting. A commitment
deadline reminder by SMS is a V1 decision with a cost model behind it, not an MVP default.

Because email does not exist, **Web Push is the only channel that reaches a user who has closed
the app**. That makes push enrolment a first-class onboarding step for importers and traders, and
makes the in-app feed the durable record for anyone who declines.

---

## 2. Catalogue

Every notification carries: `kind`, `priority`, `context_type`, `context_id`, a `message_key`
(never prose — `I18N-ARCHITECTURE.md` §6), structured `payload`, and a deep link.

### 2.1 Verification

| Kind | Trigger | Priority | Push |
|---|---|---|---|
| `verification.submitted` | Case submitted | low | no |
| `verification.needs_correction` | Admin requests a clearer document | **high** | yes |
| `verification.approved` | Case approved | **high** | yes |
| `verification.rejected` | Case rejected, with reason and right to resubmit | **high** | yes |
| `verification.expiring` | 34 / 14 / 7 / 1 days before `valid_until` | high | yes |
| `verification.expired` | On expiry, naming what froze and what still works | **critical** | yes |

`verification.expiring` at 34 days matches `Importer Home` ("رخصتك العامة تنتهي قريباً · بعد 34
يوماً"). The 34-day lead is not arbitrary: it is roughly one trip cycle, so the importer can renew
before planning their next trip rather than discovering the problem at publication.

### 2.2 Commercial

| Kind | Trigger | Priority | Push |
|---|---|---|---|
| `sourcing.offer_received` | An importer offers on my request | high | yes |
| `sourcing.offer_accepted` / `_declined` | Trader decides | high | yes |
| `sourcing.request_expiring` | 24 h before expiry | normal | no |
| `trip.published` | An importer I follow publishes a trip | normal | opt-in |
| `trip.stage_changed` | Departed / customs / arrived | high | yes |
| `trip.cancelled` | Trip cancelled, with reason | **critical** | yes |
| `commitment.proposed` | Agreement proposed to me | **critical** | yes |
| `commitment.accepted` | Counterparty accepted | high | yes |
| `commitment.expiring` | 24 h before `offer_expires_at` | high | yes |
| `commitment.expired` | Offer lapsed, with the renewal route | normal | no |
| `commitment.stage_changed` | buying / transit / handover | high | yes |
| `commitment.handover_ready` | Arrived, confirm receipt | **critical** | yes |
| `commitment.completed` | Both confirmed; review unlocked | normal | no |
| `commitment.cancelled` | With reason | high | yes |
| `capacity.warning` | A trip axis passes 90% | normal | no |

`capacity.warning` at 90% mirrors the meters, which turn amber at `ratio >= 0.9` and red at 1.0.

### 2.3 Messaging, trust, saved, account

| Kind | Trigger | Priority | Push |
|---|---|---|---|
| `message.received` | New message, coalesced per conversation | high | yes |
| `message.action_card` | Agreement or handover card posted | **critical** | yes |
| `review.received` | A review about me | normal | no |
| `review.replied` | Subject replied to my review | low | no |
| `dispute.opened` | Dispute against me — auto-notified, as the design's timeline shows | **critical** | yes |
| `dispute.evidence_requested` | Admin needs more | **critical** | yes |
| `dispute.decided` | Decision with reason and effect | **critical** | yes |
| `saved.price_drop` | Saved listing price fell | normal | opt-in |
| `saved.low_stock` | Few units remain | normal | opt-in |
| `saved.unavailable` | Saved listing gone | low | no |
| `saved.seller_new_products` | Saved seller added items | low | opt-in |
| `saved.importer_new_trip` | Saved importer published a trip | normal | opt-in |
| `saved.trip_expired` | Saved trip ended | low | no |
| `account.new_device_signin` | Sign-in from an unrecognised device | **critical** | yes |
| `account.phone_change_started` | To the **old** number | **critical** | yes |
| `account.suspended` / `reinstated` | Admin action, with reason | **critical** | yes |
| `regulatory.rule_changed` | A rule affecting me changed, with the reason | high | yes |
| `billing.receipt_confirmed` / `_rejected` | Manual subscription path | high | yes |
| `billing.subscription_expiring` | 7 / 3 / 1 days | normal | no |

The saved-item kinds are exactly the change flags drawn in `Saved`: price drop, low stock,
unavailable, seller added products, new trip, trip expired. The screen is a notification surface
as much as a list, which is why saving subscribes the user to a watch (`DOMAIN-MODEL.md` §5.4).

`regulatory.rule_changed` exists because the audit requires it: when a rule changes, affected
users are notified **with the reason — never silently** (§10 of the audit).

---

## 3. Delivery architecture

```
domain transaction
   └─ INSERT app.outbox (event)         ← same commit as the state change
COMMIT
   │
worker (pg-boss)
   ├─ resolve recipients and preferences
   ├─ INSERT app.notifications          (in-app, always)
   └─ for each enabled channel → notification_deliveries → dispatch
```

The transactional outbox is the whole point: a commitment cannot be accepted without its
notification being *scheduled*, because both are in one commit (AD-007). The alternative — call
the push service inside the request — produces both "notified but not committed" and "committed
but not notified", and the second one silently breaks a deadline-driven product.

`notification_deliveries` records per-channel attempts, status and provider response, so
"did they get told?" is answerable during a dispute.

**Retry:** exponential backoff, 5 attempts, dead-letter after that. A push subscription returning
`410 Gone` is deleted immediately.

---

## 4. Coalescing and quiet hours

| Rule | Detail |
|---|---|
| Message coalescing | Multiple messages in one conversation within 5 minutes produce one push |
| Digest | `low` priority kinds are batched into one daily in-app summary |
| Quiet hours | 22:00–07:00 `Africa/Algiers` for `normal` and `low`. `critical` always delivers |
| Per-kind caps | `saved.*` capped at 3 pushes/day/user |
| Deduplication | `(user, kind, context_id)` within a window collapses to one |

`critical` ignores quiet hours because those kinds are: an agreement proposed with a running
clock, goods arrived for handover, a dispute opened against you, an unrecognised sign-in, and a
phone-change attempt. Each is time-critical or security-critical.

---

## 5. Preferences

Per-kind, per-channel, defaulting to the table in §2. In-app is not disableable — it is the
record, not a notification. Opt-out is honoured for everything except `critical` security and
account kinds, where the notification is a control rather than a convenience.

`GET /notifications/preferences` and `PATCH` (`API-CONTRACT.md` §12).

---

## 6. Web Push specifics

- VAPID keys in the secret store; rotation invalidates subscriptions, so rotation is planned, not
  reactive.
- Payloads are **encrypted and minimal**: kind, a short title key, and the deep link. **No
  document data, no price, no counterparty name, no trip value** — a push payload may be visible
  on a lock screen, and `SECURITY-ARCHITECTURE.md` T8 makes trip value a safety issue.
- The service worker fetches the full content after the user taps, authenticated.
- Enrolment is requested contextually — after the first commitment or trip, never on first load,
  where it is reflexively denied.

---

## 7. The "needs your attention" read model

`Importer Home.ATTENTION` and `Trader Home.DECISIONS` are ranked lists with deadlines, not raw
feeds. They are a query, not a table:

```
rank = priority_weight(kind)
     + urgency_weight(deadline - now)
     + blocking_weight(does this block a counterparty?)
```

Ordering rules taken from the design:

1. Something with a running clock outranks something without ("تنتهي بعد 19 ساعة").
2. Something blocking a counterparty outranks something blocking only yourself.
3. A regulatory or verification deadline outranks a commercial one — missing it freezes
   capabilities, which is worse than missing an offer.

Each card carries what happened, why it matters, the deadline, and one primary action — the
pattern the design uses consistently, and the reason this is a read model with rules rather than
a reverse-chronological list.

---

## 8. What is deliberately not built

| Not built | Why |
|---|---|
| Email of any kind at MVP | No email address is collected anywhere in the design |
| SMS for product events | Cost; Web Push covers the need for installed users |
| Marketing or re-engagement pushes | Would cost the permission that the critical kinds depend on |
| Per-notification sound, LED and vibration controls | Platform handles it |
| A notification inbox with threading | The in-app feed plus the attention block is what the design draws |
