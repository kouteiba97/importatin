# ADR-007 — Background jobs, and the removal of the outbox

**Status:** 🔒 LOCKED
**Date:** 14 September 2026
**Revises:** the first blueprint, which specified pg-boss **and** a separate transactional outbox
table **and** a notion of domain events

---

## Context

Maabar is deadline-driven. A commitment offer expires, a licence expires, goods arrive and someone
must be told. If a notification is lost, a real person misses a deadline. So the guarantee that
matters is: **a committed state change always gets its follow-up work, and a rolled-back one never
does.**

## Decision

**pg-boss only.** Jobs are enqueued **inside the request's database transaction**.

No separate `outbox` table. No event bus. No Redis. No RabbitMQ. No Kafka. No internal
publish/subscribe at MVP.

---

## Why the outbox was wrong

This was a genuine error in the first blueprint, and it is worth stating plainly.

The transactional outbox pattern exists to solve one problem: *the queue lives somewhere other than
the database, so you cannot enqueue and commit atomically.* You write an intent row in the same
transaction, and a relay ships it to the external broker afterwards.

**pg-boss is a table in the same PostgreSQL database.** Enqueuing on the request's transaction is
already atomic with the state change. The outbox was a second implementation of a guarantee the
queue already provides — an extra table, an extra relay, an extra failure mode, and an extra thing
for a new engineer to understand, delivering nothing.

```ts
await db.transaction(async (tx) => {
  await tx.update(commitments).set({ state: 'accepted' })…;
  await tx.insert(commitmentTransitions).values(…);
  await tx.insert(auditLog).values(…);
  await boss.send('notify.commitment.accepted', payload, { db: tx });  // same transaction
});
```

If the transaction rolls back, the job disappears with it. If it commits, the job is durably
queued. That is the entire requirement.

## Why no event bus

A "domain event" at MVP is one of two things, and both already have a home:

- **Another module needs to act now** → a direct service call through its interface.
- **Work can happen later** → a pg-boss job.

An internal event bus adds indirection — a publisher that does not know its subscribers — to a
system where every interaction is known, enumerated and small in number. It would make the call
graph harder to read for no decoupling we actually need, since it is one deployable.

---

## Synchronous vs asynchronous — locked

| **Synchronous**, inside the request | **Asynchronous**, pg-boss |
|---|---|
| Every domain state transition | SMS / OTP dispatch |
| Every authorization decision | Image variant generation, PDF rasterisation |
| Capacity allocation and release | Notification fan-out |
| Every audit row | Demand aggregate recomputation |
| Every constraint check | Reputation fact recomputation |
| Reading regulatory rules | Document expiry sweep *(scheduled, daily)* |
| Search queries | Commitment / offer expiry timers *(scheduled)* |
| **Search index updates** — generated columns, free in the same write | Retention and cleanup jobs *(scheduled)* |
| Ordinary CRUD reads and writes | Backup verification |

The rule: **if the user is waiting for the result, or correctness depends on it, it is synchronous.**
Creating a listing writes a row and returns. It does not publish an event for someone to maybe
handle later.

---

## Job configuration — locked

| Property | Value |
|---|---|
| Retry | Exponential backoff, 5 attempts |
| Dead letter | After 5 attempts, into a `failed` queue with an operator alert |
| Idempotency | Every handler is idempotent; a replayed job produces no second effect |
| Scheduled jobs | pg-boss cron: expiry sweep, aggregates, timers, retention |
| Concurrency | One worker process at MVP; scale by adding workers, not by sharding queues |
| Monitoring | Queue depth and **oldest-job age** — age is the alert that actually matters |

---

## Alternatives considered

**BullMQ + Redis.** Faster and more featureful, but adds a stateful service to operate and back up,
**and loses transactional enqueue** — which would bring the outbox back. Strictly worse here.

**RabbitMQ / Kafka.** Rejected as disproportionate by an order of magnitude.

**`setTimeout` / in-process scheduling.** Rejected: jobs would be lost on deploy or crash, which is
unacceptable for expiry timers that gate a legal cap.

**Database `LISTEN/NOTIFY` as an event bus.** Rejected: no durability, no retry, no visibility.
Fine for cache invalidation, wrong for work that must not be lost.

**Keeping the outbox alongside pg-boss.** Rejected — see above.

---

## Trade-offs

| Cost | Accepted because |
|---|---|
| pg-boss puts queue load on the primary database | Job volumes are tiny; queue tables are small and well-indexed |
| Polling-based, so latency is seconds not milliseconds | Nothing in this product needs sub-second background latency |
| Less mature than BullMQ | It is a small, stable library, and the transactional property is worth more than features |
| Scaling ceiling around tens of jobs/second | Documented trigger: move to a broker only above ~50 jobs/s sustained |

---

## Consequences

1. There is **one** durability mechanism for background work, not two.
2. `boss.send` inside a transaction is the enforced pattern; a job enqueued outside a transaction in
   a request handler is a review rejection.
3. Handlers are written idempotent from day one, because retries are certain.
4. Removing the outbox also removes a table, a relay process, a poller and roughly a day of Phase 0
   work.
