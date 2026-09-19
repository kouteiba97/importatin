# Maabar — Security Architecture and Threat Model

Maabar holds national identity cards, self-entrepreneur cards, commercial registers, tax numbers,
social-security affiliations, phone numbers, and a record of who travels abroad carrying cash.
The KYC store is the highest-value asset in the system — higher than the marketplace itself.

---

## 1. Security objectives, in priority order

1. **KYC documents never leak.** A breach here is unrecoverable for the people affected.
2. **The legal invariant cannot be bypassed.** An importer must never sell to a consumer, by any
   path — UI, API, admin console, direct SQL from the application role, or race condition.
3. **No account takeover.** Identity is a phone number; SIM-swap is the realistic attack.
4. **Trust facts cannot be forged.** Fake verification or inflated transaction counts destroy the
   product's only differentiator.
5. **The audit trail cannot be quietly altered.**
6. **Trip value capacity never leaks** — it tells an attacker how much cash a named person is
   carrying to Istanbul on a known date (AD-021). This is a physical-safety issue, not a privacy
   nicety.

---

## 2. Authentication

**Passwordless: phone + 6-digit OTP** (AD-013, from `Onboarding`). No password store, therefore
no credential stuffing, no reuse, no reset-link phishing.

| Control | Specification |
|---|---|
| OTP generation | 6 digits from a CSPRNG; never derived from time or phone number |
| Storage | `sha256(code + per-challenge salt)`; plaintext never persisted or logged |
| Lifetime | 5 minutes |
| Attempts | 5 per challenge, then burned; a new code requires a new request |
| Request limits | 3/phone/hour, 10/IP/hour, 30/phone/day |
| Enumeration | `POST /auth/otp/request` returns `202` for every well-formed number |
| Verify failure | One `OTP_INVALID` for wrong, expired and unknown alike |
| Delivery | Gateway credentials in the secret store; the OTP is never written to any log, APM trace or error report |
| Concurrency | One live challenge per (phone, purpose); requesting again invalidates the previous |

### 2.1 SIM-swap — the real threat

Phone-only identity means an attacker who ports the number owns the account. Mitigations,
graduated by what the account can do:

1. **Re-verification cooldown.** After a successful sign-in from a device with no prior history
   for the account, high-impact actions are held for 24 hours: publishing a trip, accepting a
   commitment, changing the phone number, requesting KYC re-review. The user sees why and can
   still browse and message.
2. **Notify the old channel.** A phone change notifies the previous number and every live session
   before it completes, and requires OTP on **both** numbers.
3. **Device continuity signal.** Sign-in from an unrecognised device with an in-flight commitment
   raises a trust signal in the admin risk queue — `Admin Console.SIGNALS` already shows
   "حسابات من نفس الجهاز", so the device fingerprint exists in the design.
4. **Step-up for KYC.** Any change to verification documents requires a fresh OTP regardless of
   session age.
5. **Recovery is manual and audited.** There is no self-service recovery that bypasses the phone.
   A lost-number case goes to the `trust_safety` queue with document re-verification, decided
   with a reason and a user-facing consequence like any other case.

**V1 enhancement:** WebAuthn passkey as a second factor for L2 accounts. Not MVP — it would add a
second enrolment flow the design does not draw.

### 2.2 Sessions

Opaque 256-bit random token, `sha256` stored (AD-010). Cookie `__Host-mb_session`, `HttpOnly`,
`Secure`, `SameSite=Lax`. Sliding expiry 30 days, absolute 90. Rotation on privilege change.
Mass revocation on phone change, suspension, password-equivalent events and user request.
The user can list and revoke sessions (`GET /auth/sessions`).

---

## 3. Authorization

Full specification in `AUTHORIZATION-MATRIX.md`. Security-relevant properties:

- Five ordered gates on every request; no route without a declared policy (build-enforced).
- Capability and verification read **fresh from the database** each request — the entire reason
  for rejecting JWT.
- Resources are loaded scoped to the actor; ownership is a `WHERE` clause, never a post-load
  `if`.
- Gate 4 returns `404`, defeating enumeration.
- Active context (`import`/`buy`) **never widens** authorization — asserted by test, because this
  is the most plausible accidental privilege escalation in the product.

---

## 4. The legal invariant, defended in depth

| Layer | Control |
|---|---|
| Database | Composite FK to `trader_profiles(user_id, listing_eligible)` — the row is unrepresentable (AD-017) |
| Database role | `maabar_app` cannot `ALTER` the constraint |
| Service | `ListingService` refuses at gate 2/3 with `CAPABILITY_REQUIRED` |
| API | `POST /listings` has no `seller_user_id` field in its schema |
| Moderation | `Listing Composer` checks include "no importer data disclosed" |
| UI | Importers see the *blocked* view with the three alternatives |
| Test | Direct `INSERT` as `maabar_app` must raise `23503`; an API attempt must return 403 |

Five of these six are server-side, and the strongest is the one no application bug can reach.

---

## 5. KYC and document security

**Threat:** a single exposed object URL leaks a national identity card. Controls:

| Control | Specification |
|---|---|
| Residency | Private buckets on self-hosted MinIO **in Algeria** (AD-008, design §9.4) |
| Bucket policy | No public read. No listing. No anonymous access of any kind |
| Encryption | Server-side AES-256 at rest; TLS in transit; per-object key derived from a KMS master |
| Naming | Random object keys; no user id, phone number or document type in the path |
| Access | **Only** via `GET /admin/documents/:id/view`, which checks the `trust_safety` role, issues a signed URL with a 120-second TTL, and writes an audit row **before** issuing |
| Owner access | The owner sees status and expiry only — never the binary. There is no endpoint for it (`API-CONTRACT.md` §4) |
| Downstream | Signed URLs are `Cache-Control: no-store`, single-use where the storage layer supports it, and never embedded in a page the browser might cache |
| Upload validation | Magic-byte sniffing, not the declared MIME or extension; allowlist `image/jpeg`, `image/png`, `application/pdf`; 10 MB cap |
| Sanitisation | Images re-encoded server-side (strips EXIF, GPS and embedded payloads). PDFs rasterised or structurally validated; JavaScript-bearing PDFs rejected |
| Malware | ClamAV scan before the object becomes referencable; quarantine bucket until clean |
| Retention | `kyc.retention_months` configuration; the deletion job is written but **not scheduled** until ANPDP is answered (AD-046) |
| Backups | Encrypted; restore requires two people; restores are audited |
| Analytics | `maabar_readonly` has **no** grant on `verification_documents`, `media_objects` or `phone_identities` |

**Every KYC access is audited** with admin id, document id, case id, reason, request id and
timestamp. A weekly report of KYC views per admin goes to the trust lead — access without a
matching open case is the signal that matters.

---

## 6. File upload security (all buckets)

1. Client requests an upload session; server issues a scoped, short-lived signed PUT.
2. Object lands in a quarantine bucket, unreferencable.
3. Worker: size check, magic-byte sniff, malware scan, re-encode/rasterise, strip metadata.
4. On pass, move to the destination bucket and create the `media_objects` row.
5. On fail, delete and notify with a reason.

Uploads are chunked and resumable (the `Verification` offline state requires it). No SVG is
accepted anywhere — it is a script container. Original bytes of a rejected file are never served
back.

---

## 7. Transport and browser

| Control | Setting |
|---|---|
| TLS | 1.2 minimum, 1.3 preferred; HSTS `max-age=31536000; includeSubDomains; preload` |
| CSP | `default-src 'self'; img-src 'self' data: <cdn>; script-src 'self'; style-src 'self'; frame-ancestors 'none'; base-uri 'none'; object-src 'none'; form-action 'self'` — nonce-based, **no `unsafe-inline`** |
| Other headers | `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` denying geolocation, microphone and payment |
| CORS | Same-origin by design. If a separate API host is used, an exact-origin allowlist with credentials; **never** `*` with credentials |
| Cookies | `__Host-` prefix, `HttpOnly`, `Secure`, `SameSite=Lax` |
| CSRF | Double-submit token plus `Origin` / `Sec-Fetch-Site` check on unsafe methods |

**XSS:** React escapes by default; `dangerouslySetInnerHTML` is banned by lint. User content is
plain text — no rich text anywhere in the design. Arabic content is stored and rendered as text,
never interpolated into HTML strings. CSP with nonces is the backstop.

**SQL injection:** parameterised queries only; Drizzle's `sql` template is the sole raw path and
requires review. A lint rule forbids string concatenation into `sql`.

---

## 8. Threat model

| # | Threat | Attack surface | Impact | Mitigation | Layer |
|---|---|---|---|---|---|
| T1 | **IDOR / BOLA** — reading another user's commitment, offer, conversation or document | Every `:id` route | Commercial espionage; competing offer prices; identity data | Scoped loads; UUID v7; 404 on gate 4; nested parent re-check; route-coverage test | API + DB |
| T2 | **Privilege escalation via capability self-declaration** | `POST /capabilities` | An importer publishing consumer listings | Capability grants nothing alone; level is derived from admin-approved documents; composite FK is terminal | DB + service |
| T3 | **Privilege escalation via active context** | Context switcher | Acting as trader while only importer-verified | Context never enters authorization; explicit test | Service |
| T4 | **Fake verification** — forged or borrowed documents | Verification upload | Unverified operator gains L2; trust collapses | Human review with a designed evidence panel: name match across documents, liveness selfie vs ID, accounts from the same device, account age; risk banding; re-verification on renewal; all decisions audited | Admin + process |
| T5 | **KYC exposure** | Object storage, admin console, backups, logs | Catastrophic, irreversible | §5 in full | Storage + API + ops |
| T6 | **Account takeover by SIM swap** | Phone-only identity | Impersonation of a verified importer; fraud against counterparties | §2.1: cooldown on high-impact actions, dual-number OTP, device signals, manual audited recovery | Auth + trust ops |
| T7 | **OTP abuse** — SMS pumping, brute force, enumeration | `/auth/otp/*` | Cost; account compromise | Layered rate limits; 5 attempts; hashed codes; uniform responses; per-country gateway cost alerting | Edge + API |
| T8 | **Trip value-capacity disclosure** | Trip serializer, search index, logs | **Physical risk to a person carrying cash abroad** | Separate serializers; field absent not null; not indexed; contract test; excluded from analytics exports | API + search |
| T9 | **Listing spam / counterfeit goods** | Listing composer | Regulatory exposure; consumer harm — the design already flags "three counterfeit reports in this category in 30 days" | Moderation queue before publication; per-account rate limits; report flow; category risk signals on the demand board | Admin + API |
| T10 | **Message abuse** — off-platform payment solicitation, scams, harassment | Messaging | User harm; Maabar drawn into a transaction it must not be part of | Rate limits; report and block; moderation queue; conversation locked at terminal states; no attachment types beyond images | API + admin |
| T11 | **Malicious file upload** | All uploads | RCE, stored XSS, malware distribution | §6: sniffing, allowlist, re-encode, rasterise, AV scan, quarantine, no SVG | Worker + storage |
| T12 | **Race on trip capacity** | Concurrent accepts | Importer exceeds a **legal** cap; regulatory exposure for a real person | `SELECT … FOR UPDATE` on the trip, ledger sum inside the lock, fixed lock order, idempotency keys | DB |
| T13 | **Race on handover confirmation** | Two simultaneous confirms | Premature `done`; corrupted completion rate | `UNIQUE (commitment_id, party)`; "am I second?" evaluated inside the commitment lock | DB |
| T14 | **Duplicate state transition via retry** | Mobile network retries | Double capacity consumption; duplicate notifications | `Idempotency-Key` required; unique on `(commitment_id, idempotency_key)` | API + DB |
| T15 | **Reputation gaming** — self-dealing between two controlled accounts | Commitments, reviews | Fabricated record; the product's core claim becomes false | Reviews require a `done` commitment; dual confirmation; same-device and same-IP clustering into the risk queue; velocity checks on new-account commitment pairs; L3 requires 10 confirmed and zero open disputes | Service + admin |
| T16 | **Admin abuse** — a rogue or compromised admin approving fraud or reading KYC | Admin console | Total trust failure | Mandatory MFA; role separation; drafter ≠ approver on rules; granter ≠ decider; every decision carries a reason; KYC-access reporting; superadmin actions audited and alerted | Admin + audit |
| T17 | **Audit tampering** | Database access | Destroys accountability | Append-only grants; hash chain; nightly verifier; off-box shipping (§11) | DB + ops |
| T18 | **Scraping** — harvesting the trader directory, prices and importer schedules | Public endpoints | Competitive harm; T8 amplification | Pagination caps; per-IP and per-session limits; importer scope gated to L2-T; no bulk export; anomaly alerting | Edge |
| T19 | **Rate-limit bypass** via IP rotation | Edge | T7, T18 amplification | Identity-keyed limits as well as IP; phone-level daily caps; cost alerting on the SMS gateway | Edge + API |
| T20 | **Billing fraud** — forged CCP receipt, webhook replay | Billing | Revenue loss | Human confirmation of receipts with the queue evidence panel; signature-verified webhook; idempotent on `(provider, provider_reference)`; amount and reference cross-check | Admin + API |
| T21 | **Regulatory-value tampering** — raising the value cap | Rule engine | A user exceeds a legal limit believing they are compliant | Versioned rules; drafter ≠ approver; impact preview; every read carries provenance; changes audited and users notified | Service + admin |
| T22 | **Deposit feature enabled prematurely** | Config | Legal exposure while §9.2 is open | Flag defaults `false`; staging and production configs assert `false`; a CI check fails the deploy if the production value is `true` without a recorded legal sign-off reference | Ops + CI |

---

## 9. Secrets

- Never in the repository. `.gitignore` already excludes `.env*`; a pre-commit secret scanner
  (gitleaks) and a CI scan back it up.
- Runtime secrets from the host secret manager, injected as environment variables, never baked
  into an image.
- Rotation: database credentials and API keys every 90 days; session signing material and the SMS
  gateway key on any suspicion. Rotation is a runbook, not a memory.
- Separate credentials per environment. Production secrets are never readable from staging.
- The SMS gateway key, SATIM credentials and the MinIO root key are the three highest-value
  secrets; each has a named owner.

---

## 10. Privacy and personal data

| Data | Handling |
|---|---|
| Phone number | Never displayed to a counterparty. Communication is in-platform only |
| Full legal name | Shown as the design shows it — "كريمة ح.", "سفيان ب." — abbreviated on public surfaces |
| KYC documents | §5. Never visible to another user under any circumstance |
| Address | Trader business address is public (it is a shop). **Importer address is private**, used only for the Art. 14 label the importer generates for themselves |
| Location | No GPS collection. Wilaya is self-declared |
| Conversations | Participants only; admins only through a dispute, scoped to that dispute's bundle |
| Aggregated demand | k-anonymity threshold with a per-contributor share cap (AD-028) |
| Analytics | No third-party script on authenticated pages. Any analytics is first-party, aggregate, and excludes value capacity and document data |

Data-subject requests (export, correction, deletion) are an admin queue with the same
queue → evidence → decision → reason → consequence → audit shape as every other queue. Deletion
is closure plus anonymisation, never destruction of commitments, reviews or audit entries, which
belong to counterparties and to the record as much as to the user.

---

## 11. Audit integrity

Append-only table, revoked `UPDATE`/`DELETE`/`TRUNCATE` for the application role, per-stream hash
chain, nightly verification (AD-037, `DATABASE-DESIGN.md` §9).

**Honest limitation:** a database superuser can rewrite history and recompute the chain. Closing
that gap requires shipping audit records off-box to append-only storage. MVP position: ship the
audit stream to a write-only external sink daily, retain 90 days externally, and reconcile counts.
Full external immutability is V1. Stating the limit is part of the control — an audit trail
believed to be tamper-proof when it is only tamper-evident is worse than one whose limits are
known.

---

## 12. Incident response

| Severity | Definition | Response |
|---|---|---|
| **S1** | KYC exposure, mass account takeover, audit tampering | Immediate: revoke all sessions, rotate keys, freeze admin console, notify leadership and counsel; ANPDP notification assessed within 24 h |
| **S2** | Single-account takeover, admin abuse, payment fraud | Contain within 4 h; user notified; audited remediation decision |
| **S3** | Spam wave, scraping, abusive content | Rate-limit tightening, moderation sweep |

Every incident produces a written timeline from the audit log and correlation ids, and a
prevention item in the backlog. The S1 runbook is written in Phase 0, not after the first
incident.

---

## 13. Pre-launch security gate

- [ ] Route-coverage test: every route has a declared policy
- [ ] Direct `INSERT` of an importer listing raises `23503`
- [ ] Trip counterparty payload contains no value-capacity field
- [ ] KYC binary unreachable without the `trust_safety` role; every access audited
- [ ] `features.deposit_declaration = false` asserted in staging and production configs
- [ ] OTP rate limits verified under load; SMS cost alert live
- [ ] Malware scanning verified with EICAR; SVG rejected; polyglot rejected
- [ ] CSP has no `unsafe-inline`; HSTS preloaded
- [ ] Secret scan clean on full history
- [ ] Backup restore rehearsed, including object storage
- [ ] Audit hash-chain verifier running and alerting
- [ ] Independent penetration test focused on T1, T5, T6 and T12
