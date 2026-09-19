# ADR-009 — Billing, payment abstraction, and the money boundary

**Status:** 🔒 LOCKED
**Date:** 14 September 2026
**Revises:** the first blueprint, which put a SATIM/CIB integration in the MVP roadmap

---

## Context

Maabar's only revenue is subscriptions — `Records` shows monthly 3,000 DZD, three months 8,100,
yearly 28,800 — and the `Admin Console` keeps billing in its own navigation group, with its source
comment stating why: *"A subscription payment must never appear beside goods-related work, or the
console implies Maabar settles trade."*

Maabar is **not** an escrow provider, a bank, a currency exchange, a payment processor for goods,
or a shipping/payment intermediary. `Landing` states this publicly in three languages.

## Decision

### 1. Structural separation

`billing` is a **separate PostgreSQL schema with no foreign key into `app`**.
`billing.subscriptions.user_id` is a bare `uuid`, deliberately without a constraint.

This is not a policy; it is a structural guarantee. A query that settles trade through Maabar
cannot be written without first writing a migration that adds the key — and such a migration
requires two reviewers and must cite this ADR.

### 2. Provider abstraction, manual implementation

```ts
interface PaymentProvider {
  readonly code: string;
  initiate(attempt: PaymentAttempt): Promise<InitiateResult>;
  confirm(attempt: PaymentAttempt, evidence: ConfirmationEvidence): Promise<ConfirmResult>;
}
```

**MVP ships exactly one implementation: `ManualTransferProvider`** — CCP / BaridiMob receipt upload
→ the existing admin billing queue → confirmation → idempotent activation.

**SATIM / CIB / Eddahabia are NOT BUILT.**

### 3. Three kinds of money, never touching

| Kind | Who pays whom | In the system |
|---|---|---|
| Subscription | User → Maabar | **Yes** — `billing` schema, the only money Maabar handles |
| Trade price | User ↔ user | **A band, never settled.** `commitment_terms.band_min/max_centimes` |
| Deposit | User ↔ user | **Table exists, flag OFF.** No custody, settlement or refund column |

### 4. Forbidden by construction

A Maabar wallet · an escrow balance · a user funds ledger · a payment-custody record · a
trade-payment path · a commission or transaction fee · currency conversion.

None of these has a table, a column or an endpoint, and none may be added.

---

## Why SATIM/CIB is not in MVP

The brief is right to challenge this, and the first blueprint was wrong to schedule it.

| Question | Status |
|---|---|
| Is SATIM e-payment technically available to Maabar? | ⚪ **UNKNOWN** |
| Is commercial/merchant access approved? | ⚪ **UNKNOWN** |
| Is API documentation available to us? | ⚪ **UNKNOWN** |
| Are merchant onboarding requirements known? | ⚪ **UNKNOWN** |
| Is card payment required for MVP? | 🔴 **No** |

Four unknowns and a "no". Building against an unconfirmed provider risks writing to a specification
we have not read, and — worse — shaping the billing domain around one provider's callback model.

The manual path is not a stopgap. `Records` draws it as a first-class option ("upload the receipt
and it activates within one business day"), and CCP / BaridiMob transfer is how a large share of the
Algerian market actually pays. The `Admin Console` already has the queue.

Adding a card provider later is: one class implementing `PaymentProvider`, one signature-verified
webhook route, one config value. No domain change.

---

## Data model — locked (3 tables)

```
billing.plans              code · audience · price_centimes · period_months · active
billing.subscriptions      user_id (NO FK) · plan_id · state · valid_until
                           partial unique index: one live subscription per user
billing.payment_attempts   subscription_id · method · provider · provider_reference
                           · amount_centimes · state · receipt_media_id (no FK)
                           · confirmed_by_admin_id
                           UNIQUE (provider, provider_reference)   ← replay protection
```

Merged from the first blueprint: `billing_receipts` → `payment_attempts` (a receipt is an attribute
of an attempt); `subscription_periods` → `subscriptions` (MVP has no proration and no mid-period
plan change).

Subscription states: `pending_payment → active → grace → expired`, plus `cancelled`.
Activation is **idempotent** on `(subscription_id, period_start)`, so a duplicate admin confirmation
or a replayed webhook cannot double-extend a subscription.

---

## What an expired subscription blocks — ⚪ UNKNOWN (U6)

The design shows plans, days remaining, expiry and payment methods. **It never draws a
consequence.** This is a genuine product gap, not an oversight in the architecture.

**Locked default until answered:** block capability-gated **creation** — publishing a trip, creating
a sourcing request, proposing a commitment — while leaving browsing, messaging, in-flight
commitments, handover, disputes and reviews fully available.

Rationale: never interrupt an obligation to a counterparty over the subscriber's billing status.
The counterparty is not party to that relationship, and stranding them would be a trust failure
worse than the unpaid invoice.

---

## Alternatives considered

**Build the SATIM integration now.** Rejected: four unknowns, and no MVP requirement.

**Use Stripe / an international processor.** Rejected: DZD is not supported for local acquiring,
Algerian card rails do not route to it, and it would imply a cross-border money flow this product
must not have.

**One `payments` table with a `kind` discriminator covering both subscriptions and trade.**
**Rejected emphatically.** A discriminator column is exactly how trade-payment custody gets built by
accident — one nullable column and a well-meaning feature request later, Maabar is holding money.
The separate schema with no foreign key is the whole point.

**Invoicing / accounting integration.** Deferred. A receipt record exists; formal invoicing waits
for a stated requirement.

---

## Consequences

1. Billing has **no** dependency on any Algerian payment provider at MVP.
2. A report joining subscriptions to commitments is impossible to write without a migration.
3. The `Admin Console` billing queue is in its own group — visually and structurally separate —
   matching the design's stated reason.
4. `PAYMENT_PROVIDER=manual` is the only valid value; production startup refuses to boot if it names
   a provider with no implementation.
5. U5 (SATIM availability) is a **commercial** question, not a technical blocker.
