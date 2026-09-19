# Maabar — File Storage

Four distinct classes of object with different privacy, residency and lifecycle requirements.
They must not share a bucket, a policy or an access path.

---

## 1. What is stored

| Class | Contents | Privacy | Residency | Retention |
|---|---|---|---|---|
| **KYC documents** | National ID, liveness selfie, ANAE card, general authorisation, NIF, CASNOS, commercial register, business-address proof | **Maximum.** Never visible to another user | **Algeria, mandatory** (design §9.4) | `kyc.retention_months` — **configurable, deletion job unscheduled pending ANPDP** (AD-046) |
| **Product imagery** | Trader-supplied listing photos | Public | Any | While the listing exists + 90 days |
| **Dispute evidence** | Photos of goods, handover, packaging | Parties and the assigned admin only | Algeria | Life of the dispute + 5 years |
| **Billing receipts** | CCP / BaridiMob transfer slips | Owner and `billing` admin | Algeria | 10 years (accounting) |

Profile images are **not** in this list: the design uses generated initials avatars
(`ك ح`, `ب ن`) with tonal backgrounds throughout. No user uploads a face picture, which removes a
whole moderation surface. Maabar never supplies product imagery either — `tokens.css` says so
plainly: *"Maabar never supplies product imagery, because Maabar never owns goods."* Un-imaged
listings use the designed category placeholders (`ph-coat`, `ph-bag`, `ph-perfume`, `ph-shoe`,
`ph-watch`, `ph-home`, `ph-elec`), which are CSS data-URI SVGs in the token layer — not stored
objects at all.

---

## 2. Local vs object storage — the decision

| | Local filesystem | Object storage (S3 API) |
|---|---|---|
| Multiple app nodes | Breaks, or needs NFS | Works |
| Signed, expiring URLs | Must be built | Native |
| Lifecycle and retention rules | Must be built | Native |
| Server-side encryption | Must be built | Native |
| Backup / replication | Ad hoc | Native |
| Residency control | Total | Total, if self-hosted |

**Decision (AD-008): S3-compatible object storage, self-hosted MinIO inside Algeria.** Managed
foreign object storage (S3, R2, Spaces) is disqualified for KYC by the residency position, and
splitting KYC to MinIO while other classes sit abroad would mean two operational models for one
small system. Public product imagery is the exception: it contains no personal data, so it may be
fronted by a foreign CDN for speed.

---

## 3. Buckets

| Bucket | Access | Encryption | Versioning | Lifecycle |
|---|---|---|---|---|
| `mb-kyc` | Private. Signed GET only, 120 s TTL, `trust_safety` role | SSE-AES256, per-object key | On | No auto-expiry — deletion is a deliberate, audited job |
| `mb-disputes` | Private. Signed GET, 300 s, parties and assigned admin | SSE-AES256 | On | 5 years after decision |
| `mb-receipts` | Private. Signed GET, 300 s, owner and `billing` admin | SSE-AES256 | On | 10 years |
| `mb-media` | Public read via CDN | SSE | Off | Orphans purged after 90 days |
| `mb-quarantine` | Private, no read grant to the app at all | SSE | Off | 24 h hard expiry |

Object keys are random (`{uuid}/{uuid}.{ext}`). No key contains a user id, phone number, document
type or listing title — a leaked key must reveal nothing by itself, and directory-style keys
invite enumeration.

---

## 4. Upload flow

Direct-to-storage with a server-issued grant. Bytes never pass through the API, which keeps the
app nodes small and makes resumable uploads possible.

```
1. POST /verification/documents/upload-session
        → policy check (who may upload what)
        → create upload_sessions row (user, purpose, declared type, declared size)
        → return signed PUT to mb-quarantine + chunk size + upload id

2. Client PUTs chunks to mb-quarantine, resumable across network loss

3. POST /verification/documents  { upload_id, doc_type, issued_on, valid_until }
        → server verifies the object exists, size matches, session is unconsumed
        → enqueue scan job, media_objects row created in state `scanning`

4. Worker:  size → magic-byte sniff → malware scan → re-encode/rasterise →
            strip metadata → copy to destination bucket → delete quarantine object
        → media_objects.state = 'ready'

5. Failure: object deleted, media_objects.state = 'rejected' with a reason the user sees
```

A `media_objects` row is not referencable by a domain entity until `state = 'ready'`, so a
half-scanned upload can never be attached to a verification case.

### 4.1 Validation

| Check | Rule |
|---|---|
| Declared type | Allowlist per purpose. KYC: `image/jpeg`, `image/png`, `application/pdf`. Listing media: `image/jpeg`, `image/png`, `image/webp`. **`image/svg+xml` is never accepted anywhere** — it is a script container |
| Actual type | Magic-byte sniff. The declared type is a hint, never a control |
| Size | KYC 10 MB; listing image 8 MB; dispute evidence 8 MB; receipt 5 MB |
| Dimensions | Max 8000×8000; reject decompression bombs by checking declared dimensions before decoding |
| Malware | ClamAV in the quarantine bucket; EICAR test in CI |
| Re-encode | All images re-encoded server-side — strips EXIF, GPS and any embedded payload |
| PDFs | Structurally validated; JavaScript, embedded files and external actions rejected; rasterised for admin viewing |
| Per-user quota | 20 uploads/hour, 200 MB/day |

Re-encoding is not optional. It is the control that turns "we scanned it" into "the bytes we
serve are bytes we generated", and it removes GPS coordinates from a photo of a shop.

---

## 5. Access control

**Nothing is served by path. Every read goes through an authorization check that mints a signed
URL.**

```
GET /admin/documents/:id/view        (trust_safety role only)
  → verify role and an open case linking admin to document
  → WRITE AUDIT ROW FIRST
  → mint signed URL, TTL 120 s, Cache-Control: no-store
  → 302
```

| Rule | Reason |
|---|---|
| Audit is written **before** the URL is minted | A crash between the two must not lose the access record |
| TTL 120 s for KYC | Long enough to view, short enough that a leaked URL from a screenshot or proxy log is dead |
| `Cache-Control: no-store` on the signed response | Keeps documents out of browser and intermediate caches |
| No signed URL is ever embedded in a page the browser caches | Fetched on demand, rendered, discarded |
| The owner has **no** endpoint for their own document binary | The design shows status and expiry only |
| Public media needs no signing | `mb-media` is CDN-fronted with long cache TTLs and content-hashed keys |

---

## 6. Image processing for listings

| Variant | Aspect | Use | Format |
|---|---|---|---|
| `thumb` | 1:1, 160px | `Saved`, `Records` item rows | WebP + JPEG fallback |
| `card` | 4:5, 480px | Marketplace grid (`--img-card`) | WebP + JPEG |
| `tile` | 16:9, 720px | Category tiles | WebP + JPEG |
| `hero` | 1:1, 1080px | Product detail | WebP + JPEG |

Aspect ratios come from `tokens.css` and are fixed so grids never jump — a layout-stability
requirement, not a style preference. Variants are generated on upload, not on request, so the CDN
never sees a cache miss that costs CPU. Served via `<picture>` with explicit `width`/`height`
to reserve space and keep CLS at zero.

---

## 7. Deletion and retention

| Object | Trigger | Behaviour |
|---|---|---|
| Listing image | Listing archived | Marked orphaned; purged after 90 days |
| Superseded KYC document | Replacement approved | **Retained** — it is evidence of what was reviewed |
| KYC document | `kyc.retention_months` after account closure | **Job written, not scheduled** (AD-046). Deletion is audited and irreversible |
| Dispute evidence | 5 years after decision | Purged, audit row retained |
| Receipt | 10 years | Purged |
| Quarantine object | 24 h | Hard expiry regardless of state |

Account closure does **not** delete KYC documents. It anonymises the profile and revokes access
while the evidence of a verification decision survives, because that decision affected
counterparties. The ANPDP answer may change the retention period; it will not change this shape.

---

## 8. Backup and durability

| | Policy |
|---|---|
| `mb-kyc`, `mb-disputes`, `mb-receipts` | Nightly encrypted replication to a second Algerian location; 30 daily + 12 monthly restore points; versioning on, so an accidental overwrite is recoverable |
| `mb-media` | Weekly; regenerable from originals, so lower value |
| Restore rehearsal | Quarterly, timed, including a KYC object fetch through the real signed-URL path |
| Restore authorisation | Two people for `mb-kyc`; every restore audited |

**A database backup without the matching object-storage backup is useless** — `media_objects`
rows would point at nothing. Backups are taken as a pair and restore is rehearsed as a pair.

---

## 9. Configuration

```
STORAGE_ENDPOINT=https://storage.internal.maabar.dz
STORAGE_REGION=dz-alg-1
STORAGE_ACCESS_KEY / STORAGE_SECRET_KEY        # secret manager, never in the repo
STORAGE_BUCKET_KYC=mb-kyc
STORAGE_BUCKET_MEDIA=mb-media
STORAGE_BUCKET_DISPUTES=mb-disputes
STORAGE_BUCKET_RECEIPTS=mb-receipts
STORAGE_BUCKET_QUARANTINE=mb-quarantine
CDN_PUBLIC_BASE=https://cdn.maabar.dz
SIGNED_URL_TTL_KYC_SECONDS=120
SIGNED_URL_TTL_DEFAULT_SECONDS=300
UPLOAD_MAX_BYTES_KYC=10485760
UPLOAD_MAX_BYTES_IMAGE=8388608
KYC_RETENTION_MONTHS=                          # intentionally unset until legal answers
```

`KYC_RETENTION_MONTHS` unset means the deletion job refuses to run and logs why. An empty value
is safer than a guessed one.
