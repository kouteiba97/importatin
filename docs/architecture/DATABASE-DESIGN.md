# Maabar — Database Design

**Engine:** PostgreSQL 16 (AD-002)
**Extensions:** `pg_trgm`, `unaccent`, `citext`, `pgcrypto`, `btree_gist`
**Schemas:** `app` (domain) · `billing` (isolated, AD-018) · `audit` (append-only) · `search` (derived)

---

## 1. Conventions

| Concern | Rule |
|---|---|
| Primary keys | `uuid` v7 (`id`), time-ordered so index locality is good without exposing a count |
| Human references | `reference text UNIQUE` — `CMT-26-0331`, `VER-26-0881`, `USR-26-0044` (AD-030) |
| Timestamps | `timestamptz`, always UTC; `created_at NOT NULL DEFAULT now()` |
| Money | `bigint` **centimes** DZD, suffix `_centimes` (AD-031). Never `float`, never `numeric` |
| Weight | `integer` **grams**, suffix `_grams` |
| Volume | `integer` **cubic centimetres**, suffix `_cm3` |
| Percentages | `numeric(5,2)` where a true ratio is needed for display only, never for money |
| Enums | **Postgres native `ENUM`** for closed domains that change only by migration (states); `text` + FK to a lookup table for domains an admin may extend (reason codes, categories, doc types) |
| Soft delete | Only where a user can restore. **Never** on `audit_log`, `admin_decisions`, `reviews`, `commitment_transitions`, `regulatory_rule_versions` (AD-048) |
| Text search | Generated `tsvector` columns via an immutable Arabic normalizer (§8) |
| Booleans | Never nullable |
| JSONB | Only for genuinely open payloads: audit `context`, reputation `inputs`, notification `payload`, admin `evidence_snapshot`. Never for queryable domain fields |

Enum choice rationale: state values appear in transition matrices and must not be creatable at
runtime; reason codes are managed by the trust team and must be addable without a deploy.

---

## 2. The legal invariant, in DDL

This is the single most important piece of schema in the system (AD-017).

```sql
CREATE TABLE app.trader_profiles (
  user_id            uuid PRIMARY KEY REFERENCES app.users(id) ON DELETE RESTRICT,
  shop_name          text NOT NULL,
  bio                text,
  wilaya_code        text NOT NULL REFERENCES app.wilayas(code),
  business_address   text,
  identity_verified  boolean NOT NULL DEFAULT false,
  rc_verified        boolean NOT NULL DEFAULT false,   -- commercial register
  nif_verified       boolean NOT NULL DEFAULT false,
  address_verified   boolean NOT NULL DEFAULT false,
  suspended          boolean NOT NULL DEFAULT false,

  listing_eligible   boolean NOT NULL
    GENERATED ALWAYS AS (
      identity_verified AND rc_verified AND nif_verified
      AND address_verified AND NOT suspended
    ) STORED,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT trader_profiles_eligibility_key UNIQUE (user_id, listing_eligible)
);

CREATE TABLE app.product_listings (
  id           uuid PRIMARY KEY,
  reference    text NOT NULL UNIQUE,
  product_id   uuid NOT NULL REFERENCES app.products(id) ON DELETE RESTRICT,
  seller_user_id uuid NOT NULL,

  -- Always true. Exists solely to be the second half of the composite FK.
  seller_listing_eligible boolean NOT NULL DEFAULT true
    CONSTRAINT product_listings_seller_must_be_eligible CHECK (seller_listing_eligible),

  price_centimes    bigint NOT NULL CHECK (price_centimes > 0),
  currency          char(3) NOT NULL DEFAULT 'DZD' CHECK (currency = 'DZD'),
  quantity_available integer NOT NULL CHECK (quantity_available >= 0),
  availability      app.listing_availability NOT NULL,   -- in_stock|arriving_soon|on_order
  delivery_options  app.delivery_option[] NOT NULL CHECK (array_length(delivery_options,1) >= 1),
  state             app.listing_state NOT NULL DEFAULT 'draft',
  published_at      timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT product_listings_seller_eligible_fk
    FOREIGN KEY (seller_user_id, seller_listing_eligible)
    REFERENCES app.trader_profiles (user_id, listing_eligible)
    ON UPDATE RESTRICT ON DELETE RESTRICT,

  CONSTRAINT product_listings_published_has_time
    CHECK ((state <> 'published') OR (published_at IS NOT NULL))
);
```

**What this buys.** A row in `product_listings` can only reference a `trader_profiles` row whose
`listing_eligible` is `true`. A micro-importer has no `trader_profiles` row at all, so the
listing is unrepresentable — not merely rejected by a service. When a trader's commercial
register lapses, `rc_verified` flips, the generated column recomputes, and the `ON UPDATE
RESTRICT` **fails the update** while listings still point at the old key.

That failure is the designed behaviour, not an obstacle: the verification service must archive or
hide the trader's listings first, inside the same transaction, which produces an audit trail and
a user notification. A silent cascade would hide a legally significant event.

```sql
-- executed by the verification service before revoking eligibility
UPDATE app.product_listings SET state = 'archived', updated_at = now()
 WHERE seller_user_id = $1 AND state IN ('draft','in_review','published','hidden');
UPDATE app.trader_profiles SET rc_verified = false WHERE user_id = $1;
```

A regression test asserts that a direct `INSERT` of a listing for an ineligible or importer-only
user raises `23503`.

---

## 3. Identity and access

```sql
CREATE TYPE app.user_status     AS ENUM ('pending_phone','active','suspended','closed');
CREATE TYPE app.capability_kind AS ENUM ('consumer','trader','importer');
CREATE TYPE app.locale          AS ENUM ('ar','fr','en');

CREATE TABLE app.users (
  id            uuid PRIMARY KEY,
  reference     text NOT NULL UNIQUE,
  display_name  text NOT NULL,
  wilaya_code   text REFERENCES app.wilayas(code),
  locale        app.locale NOT NULL DEFAULT 'ar',
  status        app.user_status NOT NULL DEFAULT 'pending_phone',
  suspended_reason_id uuid REFERENCES app.decision_reasons(id),
  created_at    timestamptz NOT NULL DEFAULT now(),
  last_seen_at  timestamptz,
  closed_at     timestamptz
);

CREATE TABLE app.phone_identities (
  id          uuid PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES app.users(id) ON DELETE RESTRICT,
  e164        citext NOT NULL,
  verified_at timestamptz,
  is_primary  boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  retired_at  timestamptz
);
-- one live primary phone per user; one owner per number
CREATE UNIQUE INDEX phone_identities_active_e164 ON app.phone_identities (e164)
  WHERE retired_at IS NULL;
CREATE UNIQUE INDEX phone_identities_one_primary ON app.phone_identities (user_id)
  WHERE is_primary AND retired_at IS NULL;

CREATE TABLE app.capabilities (
  user_id     uuid NOT NULL REFERENCES app.users(id) ON DELETE RESTRICT,
  kind        app.capability_kind NOT NULL,
  declared_at timestamptz NOT NULL DEFAULT now(),
  revoked_at  timestamptz,
  PRIMARY KEY (user_id, kind)
);

CREATE TABLE app.sessions (
  id            uuid PRIMARY KEY,
  user_id       uuid NOT NULL REFERENCES app.users(id) ON DELETE RESTRICT,
  token_hash    bytea NOT NULL UNIQUE,       -- sha256 of a 256-bit random token
  device_label  text,
  user_agent_hash bytea,
  ip_first      inet,
  ip_last       inet,
  active_context text CHECK (active_context IN ('import','buy','shop')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  last_used_at  timestamptz NOT NULL DEFAULT now(),
  expires_at    timestamptz NOT NULL,
  revoked_at    timestamptz,
  revoked_reason text
);
CREATE INDEX sessions_user_live ON app.sessions (user_id)
  WHERE revoked_at IS NULL;

CREATE TABLE app.otp_challenges (
  id           uuid PRIMARY KEY,
  phone_e164   citext NOT NULL,
  purpose      text NOT NULL CHECK (purpose IN ('signup','login','phone_change','recovery')),
  code_hash    bytea NOT NULL,
  attempts     smallint NOT NULL DEFAULT 0,
  max_attempts smallint NOT NULL DEFAULT 5,
  ip           inet,
  created_at   timestamptz NOT NULL DEFAULT now(),
  expires_at   timestamptz NOT NULL,
  consumed_at  timestamptz
);
CREATE INDEX otp_live ON app.otp_challenges (phone_e164, created_at DESC)
  WHERE consumed_at IS NULL;
```

`sessions.token_hash` stores a hash, so a database dump does not yield live sessions.

---

## 4. Verification

```sql
CREATE TYPE app.verification_case_state AS ENUM
  ('draft','submitted','under_review','needs_correction','approved','rejected');
CREATE TYPE app.verification_doc_status AS ENUM
  ('uploaded','under_review','approved','needs_correction','rejected','expired','superseded');

CREATE TABLE app.verification_cases (
  id            uuid PRIMARY KEY,
  reference     text NOT NULL UNIQUE,
  user_id       uuid NOT NULL REFERENCES app.users(id) ON DELETE RESTRICT,
  target_capability app.capability_kind NOT NULL,
  kind          text NOT NULL CHECK (kind IN ('first_verification','renewal','detail_change')),
  state         app.verification_case_state NOT NULL DEFAULT 'draft',
  risk_band     text NOT NULL DEFAULT 'low' CHECK (risk_band IN ('low','mid','high')),
  submitted_at  timestamptz,
  sla_due_at    timestamptz,
  assigned_admin_id uuid REFERENCES app.admin_users(id),
  assigned_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);
-- one open case per user per capability
CREATE UNIQUE INDEX verification_cases_one_open ON app.verification_cases (user_id, target_capability)
  WHERE state IN ('draft','submitted','under_review','needs_correction');
CREATE INDEX verification_queue ON app.verification_cases (state, sla_due_at)
  WHERE state IN ('submitted','under_review','needs_correction');

CREATE TABLE app.verification_documents (
  id             uuid PRIMARY KEY,
  case_id        uuid NOT NULL REFERENCES app.verification_cases(id) ON DELETE RESTRICT,
  user_id        uuid NOT NULL REFERENCES app.users(id) ON DELETE RESTRICT,
  doc_type       text NOT NULL REFERENCES app.document_types(code),
  media_object_id uuid NOT NULL REFERENCES app.media_objects(id) ON DELETE RESTRICT,
  status         app.verification_doc_status NOT NULL DEFAULT 'uploaded',
  issued_on      date,
  valid_until    date,
  reviewed_by    uuid REFERENCES app.admin_users(id),
  reviewed_at    timestamptz,
  supersedes_id  uuid REFERENCES app.verification_documents(id),
  created_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT vd_reviewed_pair CHECK ((reviewed_by IS NULL) = (reviewed_at IS NULL))
);
-- at most one approved, live document of each type per user
CREATE UNIQUE INDEX vd_one_live_approved
  ON app.verification_documents (user_id, doc_type)
  WHERE status = 'approved';
CREATE INDEX vd_expiry_sweep ON app.verification_documents (valid_until)
  WHERE status = 'approved' AND valid_until IS NOT NULL;
```

`document_types` is a lookup table (not an enum) because `required_documents_per_role` is
regulatory configuration (AD-022) and a new required document must not need a deploy.

Derived level is materialised for indexing and joined cheaply:

```sql
CREATE TABLE app.profile_levels (
  user_id    uuid NOT NULL REFERENCES app.users(id) ON DELETE RESTRICT,
  capability app.capability_kind NOT NULL,
  level      text NOT NULL CHECK (level IN ('L0','L1','L2','L3')),
  computed_at timestamptz NOT NULL DEFAULT now(),
  inputs     jsonb NOT NULL,
  PRIMARY KEY (user_id, capability)
);
```

Recomputed in the same transaction as any document status change, and by the daily sweep. It is a
cache of a pure function, never an authority — the function is re-runnable from source rows.

---

## 5. Trips, capacity and the concurrency model

```sql
CREATE TYPE app.trip_state AS ENUM
  ('draft','published','collecting_demand','travelling','customs','handover','closed','cancelled');
CREATE TYPE app.trip_visibility AS ENUM
  ('all_verified_traders','my_category_traders','known_counterparties');

CREATE TABLE app.trips (
  id            uuid PRIMARY KEY,
  reference     text NOT NULL UNIQUE,
  importer_user_id uuid NOT NULL REFERENCES app.importer_profiles(user_id) ON DELETE RESTRICT,
  country_code  char(2) NOT NULL,
  destination_code text NOT NULL,
  depart_on     date NOT NULL,
  return_on     date NOT NULL,
  arrival_on    date NOT NULL,
  state         app.trip_state NOT NULL DEFAULT 'draft',
  visibility    app.trip_visibility NOT NULL DEFAULT 'all_verified_traders',

  -- capacity: three independent axes (AD-021)
  value_cap_centimes bigint NOT NULL CHECK (value_cap_centimes > 0),   -- REGULATORY, private
  weight_cap_grams   integer NOT NULL CHECK (weight_cap_grams > 0),    -- user-defined, public
  volume_cap_cm3     integer NOT NULL CHECK (volume_cap_cm3  > 0),     -- user-defined, public

  rule_version_id uuid NOT NULL REFERENCES app.regulatory_rule_versions(id),
  published_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT trips_dates_ordered CHECK (depart_on <= return_on AND return_on <= arrival_on)
);
CREATE INDEX trips_discovery ON app.trips (state, depart_on)
  WHERE state IN ('published','collecting_demand');

CREATE TABLE app.trip_capacity_ledger (
  id            uuid PRIMARY KEY,
  trip_id       uuid NOT NULL REFERENCES app.trips(id) ON DELETE RESTRICT,
  commitment_id uuid NOT NULL REFERENCES app.commitments(id) ON DELETE RESTRICT,
  value_centimes bigint  NOT NULL CHECK (value_centimes >= 0),
  grams          integer NOT NULL CHECK (grams >= 0),
  cm3            integer NOT NULL CHECK (cm3 >= 0),
  reserved_at    timestamptz NOT NULL DEFAULT now(),
  released_at    timestamptz,
  release_reason text
);
CREATE UNIQUE INDEX tcl_one_live_per_commitment
  ON app.trip_capacity_ledger (commitment_id) WHERE released_at IS NULL;
CREATE INDEX tcl_trip_live ON app.trip_capacity_ledger (trip_id) WHERE released_at IS NULL;
```

### 5.1 Overbooking prevention

A ledger plus a lock, not a mutable counter. A counter column would be a second source of truth
and would drift on any partial failure.

```sql
BEGIN;                                        -- READ COMMITTED is sufficient with the lock
  SELECT value_cap_centimes, weight_cap_grams, volume_cap_cm3, state
    FROM app.trips WHERE id = $trip FOR UPDATE;      -- serialises all capacity writers

  SELECT coalesce(sum(value_centimes),0) AS v,
         coalesce(sum(grams),0)          AS w,
         coalesce(sum(cm3),0)            AS c
    FROM app.trip_capacity_ledger
   WHERE trip_id = $trip AND released_at IS NULL;

  -- all three axes must fit; the value axis is a LEGAL cap even though it is never
  -- shown to the counterparty (AD-021)
  -- if any fails -> 409 CAPACITY_EXCEEDED { axis, requested, remaining }

  INSERT INTO app.trip_capacity_ledger (...) VALUES (...);
  UPDATE app.commitments SET state = 'accepted' WHERE id = $cmt;
  INSERT INTO app.commitment_transitions (...);
  INSERT INTO audit.audit_log (...);
  INSERT INTO app.outbox (...);
COMMIT;
```

**Lock ordering is fixed: `trips` → `commitments` → everything else.** Any code path taking them
in a different order is a deadlock waiting for load; a review checklist item enforces it.

Why not `SERIALIZABLE`: the workload is a handful of writers per trip, and an explicit row lock
gives deterministic behaviour with no retry loop to get wrong. Why not an `EXCLUDE` constraint:
the rule is a *sum* across rows, which exclusion constraints cannot express.

### 5.2 Other concurrency cases named in the brief

| Case | Mechanism |
|---|---|
| Two admins reviewing the same case | `UPDATE verification_cases SET assigned_admin_id=… WHERE id=… AND assigned_admin_id IS NULL` — zero rows updated means someone else claimed it; the UI shows who |
| Two users changing the same commitment | `SELECT … FOR UPDATE` on the commitment, then re-read state inside the lock; the loser gets `STATE_TRANSITION_INVALID` with the current state |
| Two requests attempting the same transition | `UNIQUE (commitment_id, idempotency_key)` on `commitment_transitions`; the second returns the first's result |
| Two confirmations of the same handover | `UNIQUE (commitment_id, party)` on `handover_confirmations`; "am I the second?" is evaluated inside the commitment lock |
| Accepting two offers on one request | Partial unique index `WHERE state='accepted'` on `sourcing_offers (request_id)` |
| Double-charging a subscription | `UNIQUE (provider, provider_reference)` on `payment_attempts`; activation is idempotent on `(subscription_id, period_start)` |

---

## 6. Commitments

```sql
CREATE TYPE app.commitment_state AS ENUM
  ('proposed','accepted','secured','buying','transit','handover','done',
   'disputed','cancelled','expired');

CREATE TABLE app.commitments (
  id            uuid PRIMARY KEY,
  reference     text NOT NULL UNIQUE,
  trip_id       uuid REFERENCES app.trips(id) ON DELETE RESTRICT,
  sourcing_request_id uuid REFERENCES app.sourcing_requests(id) ON DELETE RESTRICT,
  sourcing_offer_id   uuid REFERENCES app.sourcing_offers(id)   ON DELETE RESTRICT,
  importer_user_id uuid NOT NULL REFERENCES app.users(id) ON DELETE RESTRICT,
  trader_user_id   uuid NOT NULL REFERENCES app.users(id) ON DELETE RESTRICT,
  state         app.commitment_state NOT NULL DEFAULT 'proposed',
  state_entered_at timestamptz NOT NULL DEFAULT now(),
  proposed_by_user_id uuid NOT NULL REFERENCES app.users(id),
  offer_expires_at timestamptz NOT NULL,
  rule_version_id uuid NOT NULL REFERENCES app.regulatory_rule_versions(id),
  created_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT commitments_two_distinct_parties CHECK (importer_user_id <> trader_user_id),
  CONSTRAINT commitments_capacity_needs_trip
    CHECK (state IN ('proposed','expired','cancelled') OR trip_id IS NOT NULL)
);
CREATE INDEX commitments_party ON app.commitments (importer_user_id, state);
CREATE INDEX commitments_party2 ON app.commitments (trader_user_id, state);
CREATE INDEX commitments_expiry ON app.commitments (offer_expires_at) WHERE state = 'proposed';

CREATE TABLE app.commitment_terms (
  id            uuid PRIMARY KEY,
  commitment_id uuid NOT NULL REFERENCES app.commitments(id) ON DELETE RESTRICT,
  version       integer NOT NULL,
  goods_description text NOT NULL,
  specification text,
  quantity      integer NOT NULL CHECK (quantity > 0),
  band_min_centimes bigint NOT NULL CHECK (band_min_centimes > 0),
  band_max_centimes bigint NOT NULL,
  band_tolerance_pct numeric(5,2),
  band_valid_until date NOT NULL,
  handover_wilaya_code text NOT NULL REFERENCES app.wilayas(code),
  handover_on   date,
  weight_grams  integer NOT NULL CHECK (weight_grams >= 0),
  volume_cm3    integer NOT NULL CHECK (volume_cm3 >= 0),
  supersedes_id uuid REFERENCES app.commitment_terms(id),
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (commitment_id, version),
  CONSTRAINT terms_band_ordered CHECK (band_max_centimes >= band_min_centimes)
);

CREATE TABLE app.commitment_transitions (
  id            uuid PRIMARY KEY,
  commitment_id uuid NOT NULL REFERENCES app.commitments(id) ON DELETE RESTRICT,
  from_state    app.commitment_state,
  to_state      app.commitment_state NOT NULL,
  actor_type    text NOT NULL CHECK (actor_type IN ('user','admin','system')),
  actor_id      uuid,
  reason_code   text REFERENCES app.decision_reasons(code),
  note          text,
  idempotency_key text NOT NULL,
  occurred_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (commitment_id, idempotency_key)
);

CREATE TABLE app.handover_confirmations (
  id            uuid PRIMARY KEY,
  commitment_id uuid NOT NULL REFERENCES app.commitments(id) ON DELETE RESTRICT,
  party         text NOT NULL CHECK (party IN ('importer','trader')),
  confirmed_at  timestamptz NOT NULL DEFAULT now(),
  code_verified boolean NOT NULL DEFAULT false,
  UNIQUE (commitment_id, party)
);

CREATE TABLE app.handover_codes (
  commitment_id uuid PRIMARY KEY REFERENCES app.commitments(id) ON DELETE RESTRICT,
  code_hash     bytea NOT NULL,
  attempts      smallint NOT NULL DEFAULT 0,
  issued_at     timestamptz NOT NULL DEFAULT now(),
  expires_at    timestamptz NOT NULL,
  consumed_at   timestamptz
);

-- HELD PENDING LEGAL REVIEW (AD-019). Table exists; endpoints gated OFF.
-- No custody, settlement or refund column, because Maabar never holds the money.
CREATE TABLE app.commitment_deposit_declarations (
  commitment_id uuid PRIMARY KEY REFERENCES app.commitments(id) ON DELETE RESTRICT,
  amount_centimes bigint NOT NULL CHECK (amount_centimes > 0),
  declared_by_importer_at timestamptz,
  declared_by_trader_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE app.commitment_deposit_declarations IS
  'LEGAL HOLD — DESIGN-AUDIT.md 9.2. Feature flag features.deposit_declaration must be false '
  'in staging and production until an Algerian lawyer rules on purchase-mandate status.';
```

---

## 7. Reviews, disputes, reputation

```sql
CREATE TABLE app.reviews (
  id            uuid PRIMARY KEY,
  subject_user_id uuid NOT NULL REFERENCES app.users(id) ON DELETE RESTRICT,
  author_user_id  uuid NOT NULL REFERENCES app.users(id) ON DELETE RESTRICT,
  source_type   text NOT NULL CHECK (source_type IN ('commitment','consumer_transaction')),
  source_id     uuid NOT NULL,
  body          text NOT NULL CHECK (length(btrim(body)) >= 10),
  moderation_state text NOT NULL DEFAULT 'visible'
    CHECK (moderation_state IN ('visible','removed_by_moderation')),
  moderation_decision_id uuid REFERENCES app.admin_decisions(id),
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reviews_no_self CHECK (subject_user_id <> author_user_id),
  CONSTRAINT reviews_one_per_source UNIQUE (author_user_id, source_id)
);
-- no rating column, deliberately (AD-020)
REVOKE DELETE ON app.reviews FROM maabar_app;

CREATE TABLE app.review_replies (
  review_id      uuid PRIMARY KEY REFERENCES app.reviews(id) ON DELETE RESTRICT,
  author_user_id uuid NOT NULL REFERENCES app.users(id),
  body           text NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now()
);
REVOKE DELETE ON app.review_replies FROM maabar_app;

CREATE TABLE app.reputation_facts (
  subject_user_id uuid NOT NULL REFERENCES app.users(id) ON DELETE RESTRICT,
  metric        text NOT NULL,      -- confirmed_transactions|completion_rate|
                                    -- median_response_time|price_stability_rate|spec_match
  window        text NOT NULL CHECK (window IN ('all_time','last_90d')),
  value_numeric numeric(12,4) NOT NULL,
  inputs        jsonb NOT NULL,     -- the "how was this calculated" sheet, stored
  computed_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (subject_user_id, metric, window)
);
```

`inputs` is the exact payload the `Importer Profile` sheets render — for `completion_rate`:
`{accepted, on_time, late, cancelled_by_subject, excluded_customs_hold}`. Storing it means the
published figure and its explanation can never disagree.

---

## 8. Search (schema `search`)

```sql
-- Immutable so it can be used in a generated column. Changing it needs a reindex migration.
CREATE FUNCTION search.ar_normalize(t text) RETURNS text
LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE AS $$
  SELECT lower(
    regexp_replace(
      translate(
        unaccent(t),
        'أإآٱىةًٌٍَُِّْـ٠١٢٣٤٥٦٧٨٩',   -- alef variants, alef maqsura, taa marbuta,
        'اااايه            0123456789'  -- tashkeel, tatweel, Arabic-Indic digits
      ),
      '[^[:alnum:][:space:]]', ' ', 'g')
  );
$$;

CREATE TABLE search.documents (
  entity_type text NOT NULL,     -- listing|trader|importer|trip
  entity_id   uuid NOT NULL,
  locale      app.locale NOT NULL,
  title       text NOT NULL,
  body        text,
  facets      jsonb NOT NULL,    -- wilaya, category, origin, availability, capacity band
  visible     boolean NOT NULL,
  norm        text GENERATED ALWAYS AS (search.ar_normalize(coalesce(title,'') || ' ' ||
                                                            coalesce(body,''))) STORED,
  tsv         tsvector GENERATED ALWAYS AS (
                to_tsvector('simple', search.ar_normalize(coalesce(title,'') || ' ' ||
                                                          coalesce(body,'')))) STORED,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (entity_type, entity_id, locale)
);
CREATE INDEX docs_tsv  ON search.documents USING gin (tsv)            WHERE visible;
CREATE INDEX docs_trgm ON search.documents USING gin (norm gin_trgm_ops) WHERE visible;
CREATE INDEX docs_facets ON search.documents USING gin (facets jsonb_path_ops) WHERE visible;
```

`tsv` handles word matching; `norm` + trigram handles typos and partial Arabic morphology that
`simple` cannot stem. Ranking: `ts_rank_cd` + `similarity()`, then confirmed-transaction count as
a tiebreak — which is also the design's `الأكثر معاملات مؤكَّدة` sort option, so the same signal
serves both.

---

## 9. Audit (schema `audit`)

```sql
CREATE TABLE audit.audit_log (
  id           uuid NOT NULL,
  stream       text NOT NULL,         -- 'commitment:<uuid>', 'user:<uuid>', 'rule:<key>'
  seq          bigint NOT NULL,
  actor_type   text NOT NULL CHECK (actor_type IN ('user','admin','system','anonymous')),
  actor_id     uuid,
  action       text NOT NULL,
  resource_type text NOT NULL,
  resource_id  uuid NOT NULL,
  from_state   text,
  to_state     text,
  reason       text,
  context      jsonb NOT NULL,        -- request_id, ip, user_agent hash, rule_version_id
  occurred_at  timestamptz NOT NULL DEFAULT now(),
  prev_hash    bytea,
  hash         bytea NOT NULL,
  PRIMARY KEY (id, occurred_at)
) PARTITION BY RANGE (occurred_at);

CREATE UNIQUE INDEX audit_stream_seq ON audit.audit_log (stream, seq, occurred_at);
CREATE INDEX audit_resource ON audit.audit_log (resource_type, resource_id, occurred_at DESC);
CREATE INDEX audit_actor    ON audit.audit_log (actor_id, occurred_at DESC);

REVOKE UPDATE, DELETE, TRUNCATE ON audit.audit_log FROM maabar_app;
GRANT  INSERT, SELECT ON audit.audit_log TO maabar_app;
```

`hash = sha256(prev_hash || canonical_json(row_without_hash))`. A nightly verifier walks every
stream; a break raises a security alert. This gives tamper *evidence*; tamper *prevention*
against someone with database superuser rights additionally requires off-box log shipping
(`SECURITY-ARCHITECTURE.md` §11).

Monthly partitions created a quarter ahead by a scheduled job; nothing is dropped without an
explicit retention decision.

---

## 10. Billing (schema `billing`) — deliberately unjoinable

```sql
CREATE TABLE billing.plans (
  id uuid PRIMARY KEY, code text NOT NULL UNIQUE,      -- monthly|quarterly|yearly
  audience app.capability_kind NOT NULL,
  price_centimes bigint NOT NULL CHECK (price_centimes > 0),
  period_months smallint NOT NULL CHECK (period_months > 0),
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE billing.subscriptions (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,          -- NO FOREIGN KEY, deliberately (AD-018)
  plan_id uuid NOT NULL REFERENCES billing.plans(id),
  state text NOT NULL CHECK (state IN ('pending_payment','active','grace','expired','cancelled')),
  valid_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX subs_one_live ON billing.subscriptions (user_id)
  WHERE state IN ('pending_payment','active','grace');

CREATE TABLE billing.payment_attempts (
  id uuid PRIMARY KEY,
  subscription_id uuid NOT NULL REFERENCES billing.subscriptions(id),
  method text NOT NULL CHECK (method IN ('ccp_transfer','baridimob','cib_card','eddahabia_card')),
  provider text, provider_reference text,
  amount_centimes bigint NOT NULL,
  state text NOT NULL CHECK (state IN ('initiated','awaiting_confirmation','succeeded','failed')),
  receipt_media_id uuid,          -- manual path; NO FK into app.media_objects
  confirmed_by_admin_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_reference)
);
```

**No column in `billing` references a commitment, trip, listing, sourcing request or offer.**
A query that settles trade through Maabar cannot be written without first writing a migration,
which is exactly the friction intended.

---

## 11. Table inventory

| Schema | Tables |
|---|---|
| `app` core | `users`, `phone_identities`, `phone_identity_changes`, `capabilities`, `sessions`, `otp_challenges`, `wilayas` |
| `app` profiles | `consumer_profiles`, `trader_profiles`, `importer_profiles`, `profile_levels` |
| `app` verification | `verification_cases`, `verification_documents`, `document_types` |
| `app` marketplace | `categories`, `products`, `product_listings`, `listing_media` |
| `app` trips | `trips`, `trip_categories`, `trip_capacity_ledger` |
| `app` sourcing | `sourcing_requests`, `sourcing_offers` |
| `app` commitments | `commitments`, `commitment_terms`, `commitment_transitions`, `handover_confirmations`, `handover_codes`, `commitment_deposit_declarations` *(held)* |
| `app` demand | `demand_signals`, `demand_aggregates` |
| `app` messaging | `conversations`, `conversation_participants`, `messages`, `message_actions` |
| `app` trust | `reviews`, `review_replies`, `reputation_facts`, `disputes`, `dispute_evidence` |
| `app` retention | `saved_items`, `saved_watch_events` |
| `app` notify | `notifications`, `notification_deliveries`, `push_subscriptions` |
| `app` compliance | `compliance_items`, `compliance_verdicts` |
| `app` regulatory | `regulatory_rules`, `regulatory_rule_versions` |
| `app` media | `media_objects`, `upload_sessions` |
| `app` admin | `admin_users`, `admin_queues`, `admin_decisions`, `decision_reasons` |
| `app` infra | `outbox`, `reference_sequences`, `rate_limit_counters`, `feature_flags` |
| `search` | `documents` |
| `audit` | `audit_log` (partitioned) |
| `billing` | `plans`, `subscriptions`, `subscription_periods`, `payment_attempts`, `billing_receipts` |

**Roughly 48 tables.** Small enough for one team to hold in mind; every one traces to a designed
screen or a stated invariant.

---

## 12. Index strategy

Indexes exist for named access paths, not speculatively.

| Access path | Index |
|---|---|
| Marketplace grid by category, newest first | `product_listings (state, published_at DESC)` partial `WHERE state='published'` + join `products(category_id)` |
| Seller storefront | `product_listings (seller_user_id, state)` |
| Trip discovery | `trips (state, depart_on)` partial |
| My commitments by state | two indexes on `(importer_user_id, state)` and `(trader_user_id, state)` |
| Admin queue by SLA | `verification_cases (state, sla_due_at)` partial |
| Expiry sweep | `verification_documents (valid_until)` partial `WHERE status='approved'` |
| Unread counts | `messages (conversation_id, id DESC)`; compare with `last_read_message_id` |
| Search | GIN on `tsv`, GIN trigram on `norm`, GIN on `facets` |
| Audit lookup | `(resource_type, resource_id, occurred_at DESC)` |
| Capacity sum | `trip_capacity_ledger (trip_id)` partial `WHERE released_at IS NULL` |

---

## 13. Roles and grants

| Role | Grants |
|---|---|
| `maabar_migrate` | DDL owner. Used only by migrations |
| `maabar_app` | `SELECT/INSERT/UPDATE` on `app.*`, `billing.*`; `INSERT/SELECT` only on `audit.audit_log`; **no `DELETE`** on `reviews`, `review_replies`, `admin_decisions`, `commitment_transitions`, `regulatory_rule_versions` |
| `maabar_worker` | As `maabar_app`, plus write on `search.documents` and `demand_aggregates` |
| `maabar_readonly` | `SELECT` on non-sensitive views only. **No access to `verification_documents`, `media_objects`, `phone_identities`** |
| `maabar_backup` | Replication and dump only |

Application code never connects as `maabar_migrate`. The `DELETE` revocations are the enforcement
of AD-023, AD-024 and AD-048 — a compromised application cannot erase the record.

---

## 14. Migration discipline

1. One concern per migration, forward-only, with a written rollback note.
2. Every migration is plain SQL reviewed as SQL (AD-005).
3. No blocking DDL on hot tables: `CREATE INDEX CONCURRENTLY`; add columns nullable, backfill in
   batches, then set `NOT NULL` with a validated constraint.
4. Enum changes: `ADD VALUE` is safe; removing a value requires a new type and a rewrite —
   which is why states are enums and reason codes are not.
5. A migration touching `product_listings`, `trader_profiles` or `audit_log` requires a second
   reviewer and must cite the invariant it preserves.
