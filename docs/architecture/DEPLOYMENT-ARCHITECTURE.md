# Maabar — Deployment Architecture

Boring infrastructure that works. The hard constraint is **data residency in Algeria for KYC
documents** (design §9.4), which shapes everything else.

---

## 1. Topology

```
                    ┌────────────────────────────────┐
  users ───────────▶│ DNS + WAF + TLS termination    │
                    └───────────────┬────────────────┘
                                    │
                    ┌───────────────▼────────────────┐
                    │ reverse proxy (Caddy / nginx)  │
                    │ HTTP/2 · gzip+brotli · limits  │
                    └───┬────────────────────────┬───┘
                        │                        │
            ┌───────────▼─────────┐   ┌──────────▼──────────┐
            │ web × 2 (Next.js)   │   │ api × 2 (NestJS)    │
            └───────────┬─────────┘   └──────────┬──────────┘
                        └────────────┬───────────┘
                                     │
        ┌────────────────┬───────────┴────┬──────────────────┐
        │                │                │                  │
┌───────▼──────┐ ┌───────▼──────┐ ┌───────▼───────┐ ┌────────▼───────┐
│ Postgres 16  │ │ MinIO (DZ)   │ │ worker × 1-2  │ │ observability  │
│ primary      │ │ private +    │ │ pg-boss       │ │ logs · metrics │
│  + replica   │ │ public       │ │ consumers     │ │ error tracking │
│ PITR (WAL)   │ │ replicated   │ └───────────────┘ └────────────────┘
└──────────────┘ └──────────────┘

public product imagery ──▶ CDN (may be outside Algeria: no personal data)
```

Three application processes (`web`, `api`, `worker`); `api` and `worker` share one image with a
different entrypoint.

---

## 2. Hosting decision

**Primary recommendation: Algerian VPS/colocation for Postgres and MinIO; application tier
co-located.**

| Option | Verdict |
|---|---|
| Fully in Algeria (Algérie Télécom / ICOSNET / Ayrade or similar) | **Recommended.** Satisfies residency unambiguously; lowest latency for Algerian users; the operator is a local legal entity, which matters when ANPDP answers |
| Hybrid: app abroad, data in Algeria | Acceptable fallback. Adds cross-border latency on every query and a harder story to tell a regulator |
| Fully abroad (Hetzner, OVH, DigitalOcean) | **Rejected for KYC.** Contradicts the stated design position before the legal question is even settled |
| Managed PaaS (Vercel, Railway, Fly) | Convenient for the web tier only. Not for Postgres or MinIO, for the same residency reason |

If Algerian hosting proves operationally inadequate during Phase 0, the fallback is **hybrid**:
application and public CDN abroad, Postgres and MinIO in Algeria, with a documented latency budget
and a written note for counsel. This is a Phase 0 decision with a spike attached, not an
assumption to carry into Phase 6.

**Sizing at launch** (deliberately modest — this is a new market, not a scale problem):

| Component | Spec |
|---|---|
| web | 2 × 2 vCPU, 4 GB |
| api | 2 × 2 vCPU, 4 GB |
| worker | 1 × 2 vCPU, 4 GB |
| Postgres | 4 vCPU, 16 GB, NVMe, + streaming replica |
| MinIO | 4 vCPU, 8 GB, 500 GB usable, replicated |

---

## 3. Containers

Multi-stage Docker builds, distroless or Alpine runtime, non-root user, read-only root filesystem,
pinned base image digests, `HEALTHCHECK` on each. Images are built once in CI and promoted
unchanged from staging to production — the artifact that passed staging is the artifact deployed.

```yaml
# docker-compose.yml (local development)
services:
  postgres:  { image: postgres:16-alpine, volumes: [pgdata:/var/lib/postgresql/data] }
  minio:     { image: minio/minio, command: server /data --console-address ":9001" }
  api:       { build: ., command: node dist/api.js,    depends_on: [postgres, minio] }
  worker:    { build: ., command: node dist/worker.js, depends_on: [postgres] }
  web:       { build: ./web, depends_on: [api] }
  mailpit:   { image: axllent/mailpit }   # placeholder; SMS is a console stub locally
```

---

## 4. Environments

| | local | development | staging | production |
|---|---|---|---|---|
| Data | synthetic fixtures | synthetic | **synthetic only** | real |
| SMS | console stub | console stub | real gateway, allowlisted numbers | real gateway |
| Payments | stub | stub | SATIM sandbox | SATIM production |
| Object storage | MinIO container | MinIO | MinIO, separate buckets | MinIO, replicated, in Algeria |
| `features.deposit_declaration` | true (tests only) | false | **false** | **false** |
| Admin access | open | team | team + MFA | MFA + optional IP allowlist |
| Backups | none | weekly | daily | continuous WAL + daily base |
| Observability | console | basic | full | full + alerting |

**Staging never receives production KYC documents or phone numbers.** If a production-like dataset
is needed, a masked-restore script generates it: phone numbers replaced with reserved test ranges,
KYC objects replaced with synthetic specimens, names pseudonymised, `audit_log` truncated. The
script is written in Phase 0 and is the only sanctioned path from production to a lower
environment.

---

## 5. Configuration and secrets

Twelve-factor: all configuration from the environment; nothing environment-specific in an image.

```
NODE_ENV · APP_BASE_URL · API_BASE_URL
DATABASE_URL · DATABASE_POOL_MAX · DATABASE_REPLICA_URL
STORAGE_ENDPOINT · STORAGE_ACCESS_KEY · STORAGE_SECRET_KEY · STORAGE_BUCKET_*
SESSION_COOKIE_DOMAIN · SESSION_ABSOLUTE_DAYS · SESSION_IDLE_DAYS
SMS_PROVIDER · SMS_API_KEY · SMS_SENDER_ID
SATIM_MERCHANT_ID · SATIM_API_KEY · SATIM_WEBHOOK_SECRET
VAPID_PUBLIC_KEY · VAPID_PRIVATE_KEY
CDN_PUBLIC_BASE
FEATURE_DEPOSIT_DECLARATION=false          # LEGAL HOLD — must stay false
DISCOVER_IMPORTERS_AUDIENCE=verified_traders
KYC_RETENTION_MONTHS=                      # intentionally unset until ANPDP answers
LOG_LEVEL · SENTRY_DSN · OTEL_EXPORTER_OTLP_ENDPOINT
```

Secrets come from the host secret manager, injected at runtime, never baked into an image, never
in the repository (`.gitignore` already excludes `.env*`; gitleaks runs pre-commit and in CI).
Rotation: database credentials and API keys every 90 days; SMS and SATIM keys on any suspicion.

A startup assertion refuses to boot production if `FEATURE_DEPOSIT_DECLARATION` is `true` without
`LEGAL_SIGNOFF_REF` set — the mechanical enforcement of the §9.2 hold
(`SECURITY-ARCHITECTURE.md` T22).

---

## 6. CI/CD

```
push ──▶ lint · typecheck · stylelint · secret scan
      ──▶ unit · integration · database (Postgres service container)
      ──▶ authorization matrix · state machine · 7 critical-invariant suites
      ──▶ contract tests · i18n completeness
      ──▶ build images, tag by commit SHA
      ──▶ deploy to staging (automatic)
      ──▶ migrate · smoke · E2E on staging
      ──▶ deploy to production (manual approval, same artifact)
      ──▶ migrate · smoke · watch error rate 15 min
```

**Deployment style:** rolling with health checks, two nodes per tier, drain on stop. Blue-green is
not justified at this size; rolling with a fast rollback path is simpler to operate correctly.

**Rollback:** re-deploy the previous image tag. Because migrations are expand/contract (§7), the
previous image runs against the new schema, so a code rollback never requires a database
rollback — the property that makes rollback safe enough to actually use at 2 a.m.

**Migrations** run as a separate job before the new version starts, as `maabar_migrate`, with an
advisory lock so two deploys cannot migrate concurrently.

---

## 7. Migration discipline in production

Expand → migrate → contract, always:

1. **Expand** — add the nullable column / new table / `CREATE INDEX CONCURRENTLY`. Old code still
   works.
2. **Deploy** code that writes both and reads the new.
3. **Backfill** in batches, off-peak, resumable.
4. **Contract** — in a *later* release, set `NOT NULL`, drop the old column.

Never in one step: renaming a column, adding `NOT NULL` without a default, dropping anything a
running version reads, blocking `ALTER TABLE` on a hot table.

Any migration touching `product_listings`, `trader_profiles`, `audit_log` or
`regulatory_rule_versions` requires a second reviewer and must state the invariant it preserves.

---

## 8. Backup and recovery

| Asset | Method | Frequency | Retention | RPO | RTO |
|---|---|---|---|---|---|
| Postgres | Continuous WAL archiving + nightly base backup | Continuous | 30 daily, 12 monthly | **< 5 min** | **< 2 h** |
| Postgres | Streaming replica | Continuous | — | ~0 | < 15 min (promote) |
| MinIO private buckets | Encrypted replication to a second Algerian location | Nightly | 30 daily, 12 monthly | < 24 h | < 4 h |
| MinIO public bucket | Weekly | Weekly | 4 weeks | < 7 days | < 4 h |
| Configuration | In Git; secrets in the manager with its own backup | On change | Full history | 0 | < 30 min |

**Database and object-storage backups are taken and restored as a pair.** A database restore
without matching objects leaves `media_objects` rows pointing at nothing — verification cases
whose documents have vanished.

**Restore procedure** (rehearsed quarterly, timed, written down):
1. Provision from the image tag.
2. Restore the base backup, replay WAL to the target time.
3. Restore object storage to the same timestamp.
4. Verify: row counts, audit hash chain, a signed-URL fetch of a KYC object through the real path.
5. Re-point DNS.

KYC restores require two people and are audited.

---

## 9. Observability

**Logging** — structured JSON, one line per request, always carrying `request_id`, `user_id`
(when authenticated), route, status, duration, and outcome code.
**Never logged:** OTP codes, session tokens, handover codes, document contents, signed URLs, full
phone numbers (last 3 digits only), **trip value capacity**. A redaction allowlist is applied at
the logger, not left to call sites.

**Error tracking** — Sentry or equivalent, self-hosted if the DSN would carry personal data.
Source maps uploaded, not served.

**Metrics** — RED per route (rate, errors, duration) plus domain counters: verification queue
depth and SLA breaches, commitment transitions by type, capacity rejections, OTP send rate and
cost, push delivery failures, search latency, job queue depth and age.

**Tracing** — OpenTelemetry, sampled at 10% (100% for errors). One trace should show request →
policy gate → transaction → outbox → job.

**Health** — `/health/live` (process), `/health/ready` (database, storage, queue).

**Alerts** (paging vs informational, so alerts stay meaningful):

| Alert | Severity |
|---|---|
| Error rate > 2% for 5 min | page |
| Database unreachable or replica lag > 60 s | page |
| Audit hash-chain break | **page** |
| KYC signed-URL issuance without a matching open case | **page** |
| Job queue age > 15 min | page |
| OTP send rate above the cost threshold | page |
| Disk > 80% | warn |
| Verification queue SLA breach | warn (business) |
| p95 latency > 2× baseline | warn |

---

## 10. Domains and TLS

| Host | Purpose |
|---|---|
| `maabar.dz` | Web (public + app) |
| `api.maabar.dz` | API |
| `cdn.maabar.dz` | Public product imagery |
| `storage.internal.maabar.dz` | MinIO — **not publicly routable**; signed URLs are proxied |
| `admin.maabar.dz` | Optional separate admin host for IP restriction |

TLS via ACME with auto-renewal; TLS 1.2 minimum; HSTS preloaded. A `.dz` domain requires an
Algerian registrant — a Phase 0 administrative task with a real lead time, not a deploy-day step.

---

## 11. Scaling path

| Signal | Action |
|---|---|
| API CPU sustained > 60% | Add an api node (stateless; sessions are in Postgres) |
| Read latency rising | Route read-only queries to the replica |
| Search p95 > 400 ms | Tune indexes; only then reconsider a search engine (AD-033) |
| Job queue age growing | Add a worker; only then reconsider the queue (AD-007) |
| Session or rate-limit contention | Introduce Redis (AD-009) |
| Object storage > 70% | Add capacity; lifecycle rules first |

Nothing here requires re-architecture — which is the point of choosing a modular monolith with
swappable ports.

---

## 12. Cost sketch (order of magnitude, monthly)

| Item | Estimate |
|---|---|
| Compute (5 small instances) | 60–120 USD |
| Postgres host + replica | 80–150 USD |
| MinIO host + replication | 60–120 USD |
| CDN | 10–40 USD |
| **SMS (OTP)** | **highly variable — the largest and least predictable line** |
| Monitoring | 0–50 USD (self-hosted) |
| Domain, TLS | negligible |

SMS deserves a cost model before launch, not after: an OTP-only policy (`NOTIFICATIONS.md` §1)
plus per-phone daily caps and a spend alert are the controls. An SMS-pumping attack is a financial
incident as much as a security one.
