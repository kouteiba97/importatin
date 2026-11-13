# Maabar — Development stack and architecture, on one page

This page is the short version. The binding contract is `docs/architecture/ARCHITECTURE-LOCK.md`;
if the two ever disagree, the lock wins.

## 1. Stack

| Layer | Choice | Deliberately not used |
|---|---|---|
| Web app | Next.js 15 (App Router), React 19, TypeScript, CSS Modules over `designs/tokens.css` | Tailwind, component libraries, Redux |
| Data fetching and forms | TanStack Query, react-hook-form + zod | — |
| Server | NestJS 11, TypeScript, one modular monolith (api + worker from one image) | Microservices |
| Database | PostgreSQL 16 (`pg_trgm`, `unaccent`, `citext`, `pgcrypto`) | MongoDB, Redis |
| Data access | Drizzle ORM, hand-written SQL migrations | Auto-generated migrations |
| Background jobs | pg-boss (inside Postgres) | Kafka, RabbitMQ, separate outbox |
| Search | Postgres full-text + trigram | Elasticsearch |
| Files | S3-compatible storage behind a `StoragePort` (MinIO in dev) | Files in the database |
| Sign-in | Phone + 6-digit SMS code, server sessions in a secure cookie | Passwords, JWT |
| Payments | Subscriptions only, manual CCP/BaridiMob receipt first, behind a `PaymentProvider` interface | Holding users' money, escrow |
| Hosting | Docker on one VPS, Caddy for TLS, GitHub Actions | Kubernetes |
| Tests | Vitest, Supertest, Playwright | — |
| Monitoring | JSON logs, Sentry, health endpoints | Prometheus/Grafana at first |

## 2. Repository layout

```
maabar/
  apps/
    web/        Next.js — screens built from designs/*.dc.html
    api/        NestJS — src/modules/<module>/{domain,application,infrastructure,http}
  packages/
    contracts/  zod schemas and types shared by web and api
    i18n/       ar / fr / en message catalogues, formatters, bidi helpers
    ui/         tokens.css and the few shared components
  db/migrations/  numbered SQL files — the source of truth
  designs/      design reference (read-only during the build)
  docs/         architecture and legal documents
```

## 3. Clean architecture rules

1. **Four layers per module, dependencies point inwards.** `http` → `application` → `domain`; `infrastructure` implements the ports the domain declares. The domain imports nothing from NestJS, Drizzle or HTTP.
2. **Eleven modules, one database, no cross-module table access.** A module reads another module only through its exported service. The module list and their tables are in `SYSTEM-ARCHITECTURE.md` and the lock.
3. **Every legal number comes from the regulatory engine** with an "as of" date (`REGULATORY-ENGINE.md`). No cap, rate or count is written in code or in a translation.
4. **Authorization is server-side, in five ordered gates per route** (`AUTHORIZATION-MATRIX.md`). The web app hides things for comfort only.
5. **State changes go through the state machines** in `STATE-MACHINES.md`; every transition writes an audit row in the same transaction.
6. **Three schemas:** `app`, `billing` (no foreign key into `app`), `audit` (append-only).
7. **Three equal languages, French fallback, logical CSS only**, bidi rules from `HANDOFF.md` §8.

## 4. Legal rules the code must make impossible to break

- An importer can never publish a listing to the public — only a verified trader can.
- A trip cannot exceed the value cap or the monthly trip count in force on its date.
- An importer account is one verified person; documents: ID, auto-entrepreneur card, general authorisation, CASNOS, BEA currency account, residence, plus the two declarations.
- Maabar never holds, moves or converts users' money. The deposit feature flag stays off.
- Rule texts and values are published only by a different admin than the author, with an official source.

## 5. Build order

Thirteen phases, each a complete slice a user can try (`IMPLEMENTATION-ROADMAP.md`):
foundation → sign-in → verification and admin → marketplace → trips → demand board → sourcing →
commitments → messaging → trust → compliance → billing → hardening and launch.
