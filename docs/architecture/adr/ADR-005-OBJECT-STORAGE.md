# ADR-005 — Object storage

**Status:** 🔒 LOCKED (interface) · ⚪ **DEFERRED** (production provider) · **LEGAL VALIDATION REQUIRED**
**Date:** 14 September 2026
**Revises:** the first blueprint, which treated Algerian residency as an established requirement and
specified a replicated self-hosted MinIO cluster

---

## Context

Four classes of file: KYC documents, product imagery, dispute evidence, billing receipts. Profile
photographs do **not** exist — the design uses generated initials avatars throughout, which removes
an entire moderation surface.

### The correction

`DESIGN-AUDIT.md` §9.4 records the design position as *"documents stored in Algeria, never shown to
other users"* — while listing, in the same section, the open question *"retention period … and
whether prior ANPDP authorisation is required"* as **unresolved**.

The first blueprint converted that design position into a technical requirement and sized
infrastructure around it. That is precisely the failure this review was asked to catch: an
unresolved legal assumption silently becoming a technical fact.

**Classification:**

| Claim | Status |
|---|---|
| KYC documents must be physically stored in Algeria | ⚪ **LEGAL VALIDATION REQUIRED** — a design position, not a confirmed requirement |
| KYC documents must never be readable by other users | 🟢 Confirmed product constraint |
| KYC documents must never be publicly accessible | 🟢 Confirmed product constraint |
| Self-hosting is operationally preferable | 🔴 No — it is an operational *cost* |

---

## Decision

**Lock the interface. Defer the provider.**

```ts
interface StoragePort {
  createUploadGrant(purpose, userId, declaredType, declaredBytes): Promise<UploadGrant>;
  promote(objectKey: string, bucket: Bucket): Promise<void>;
  signedReadUrl(objectKey: string, ttlSeconds: number): Promise<string>;
  delete(objectKey: string): Promise<void>;
}
```

**Locked now:**

- S3-compatible API via AWS SDK v3 — the abstraction costs nothing and is supported by every
  candidate provider.
- Five logical buckets: `kyc`, `disputes`, `receipts`, `media-public`, `quarantine`.
- Random object keys (`{uuid}/{uuid}.{ext}`) containing no user id, phone number or document type.
- **Nothing is served by path.** Every private read mints a signed URL after an authorization check.
  KYC TTL 120 s; other private TTL 300 s.
- Direct-to-storage resumable upload into `quarantine`; the object is unreferencable until the
  worker promotes it.
- Server-side **re-encode** for images and **rasterisation** for PDFs.
- `image/svg+xml` is never accepted anywhere.
- Development and staging: MinIO in a container.

**Deferred:** the production provider and its physical location.

| Legal answer | Production storage |
|---|---|
| Residency required | **Single MinIO node** on the Algerian VPS + nightly encrypted off-box backup |
| Residency not required | Managed S3-compatible in the nearest EU region |
| Still unanswered at launch | Default to the Algerian MinIO node — it satisfies both outcomes |

---

## Why a single node, not a cluster

The first blueprint specified replicated MinIO. At MVP volumes — a few thousand documents and
images — a distributed object store is infrastructure sized for a problem we do not have, operated
by a team of four who would also be writing the product.

A single node with nightly encrypted backups has a worse RTO and an identical RPO for this data.
That trade is correct until there is measurable load or a contractual availability requirement.

## Why the malware scanner was dropped

The first blueprint ran ClamAV in front of re-encoding. Re-encoding an image and rasterising a PDF
**destroys** embedded payloads — that is the actual control. Putting a signature scanner in front
of a transform that neutralises the payload anyway adds a service, a virus-definition update job
and a failure mode, for marginal benefit against a threat model where uploads are seen only by
admins in a rasterised form.

Deferred, not rejected forever: if Maabar ever serves user-uploaded files back to other users in
their original bytes, the scanner comes back.

---

## Alternatives considered

**Local filesystem.** Rejected: breaks with more than one app node, and signed URLs, lifecycle
rules, server-side encryption and replication would all have to be written by hand.

**Managed S3 / R2 / Spaces, chosen now.** Rejected *as a decision*, not as an option: choosing a
foreign provider before U1 is answered could force a migration of exactly the data that is hardest
to migrate. Choosing the conservative default costs nothing and forecloses nothing.

**Storing documents as `bytea` in PostgreSQL.** Rejected: bloats backups, no signed access, no
lifecycle, and it would put binary KYC data in every database dump.

---

## Trade-offs

| Cost | Accepted because |
|---|---|
| The `StoragePort` indirection | It is ~40 lines and it is the thing that makes U1 a deferrable question |
| Single node has no storage HA at MVP | Nightly backups; a restore is a documented, rehearsed procedure |
| Running MinIO at all is ops work | Bounded: one container, one volume, one backup job |

---

## Consequences

1. **U1 is a deployment decision, not an architecture decision.** Moving is a config change plus an
   object copy.
2. `KYC_RETENTION_MONTHS` ships **unset**. The deletion job reads it, finds nothing, refuses to run
   and logs why. An empty value is safer than a guessed one (U2).
3. Database and object-storage backups are taken and restored **as a pair** — a database restore
   without matching objects leaves verification cases pointing at nothing.
4. Every KYC read writes an audit row **before** the signed URL is minted, so a crash between the
   two cannot lose the access record.
