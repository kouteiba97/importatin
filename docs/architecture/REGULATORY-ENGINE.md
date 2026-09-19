# Maabar — Regulatory Configuration Engine

> "No regulatory value is drawn as a constant. Every one is a parameter with an effective date."
> — `DESIGN-AUDIT.md` §10

Algeria legalised micro-importing in June 2025. The rules are new, and new rules move. A system
that hard-codes `1,800,000` will be wrong, and — worse — will silently reinterpret last month's
records under this month's law.

---

## 1. Why this is a subsystem, not a settings table

Three requirements make a simple key-value store insufficient:

1. **Historical interpretability.** A commitment created in October must remain readable under
   the rules effective in October, even after they change in December.
2. **Provenance is user-facing.** `Trip Creation` shows the cap *with its effective date*, and the
   `Compliance Checker` shows article, source and last-updated. The citation is content the user
   reads, not metadata for engineers.
3. **Change is an event with consequences.** The audit requires an impact preview before
   publication and notification of affected users **with the reason — never silently**.

---

## 2. Model

```sql
CREATE TABLE app.regulatory_rules (
  key           text PRIMARY KEY,          -- max_value_per_trip
  scope         text NOT NULL,             -- trip | compliance | verification | tax
  value_type    text NOT NULL,             -- money | integer | ratio | duration | list | boolean
  unit          text,                      -- DZD_centimes | trips_per_month | months | percent
  description_key text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE app.regulatory_rule_versions (
  id              uuid PRIMARY KEY,
  rule_key        text NOT NULL REFERENCES app.regulatory_rules(key),
  version         integer NOT NULL,
  value           jsonb NOT NULL,          -- {"centimes":180000000} | {"n":2} | {"codes":[...]}
  effective_from  date NOT NULL,
  effective_until date,                    -- null = still in force
  status          text NOT NULL
                  CHECK (status IN ('draft','in_review','approved','scheduled','active','superseded')),
  source_name_key text NOT NULL,           -- official_journal_40
  source_reference text NOT NULL,          -- "الجريدة الرسمية … العدد 40 … 29 جوان 2025"
  source_article  text,                    -- "المادة 6"
  source_url      text,
  created_by      uuid NOT NULL REFERENCES app.admin_users(id),
  approved_by     uuid REFERENCES app.admin_users(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  approved_at     timestamptz,
  published_at    timestamptz,
  notes           text,

  UNIQUE (rule_key, version),
  CONSTRAINT rrv_window CHECK (effective_until IS NULL OR effective_until > effective_from),
  CONSTRAINT rrv_approval_pair CHECK ((approved_by IS NULL) = (approved_at IS NULL)),
  CONSTRAINT rrv_separation_of_duty CHECK (approved_by IS NULL OR approved_by <> created_by)
);

-- no two versions of the same rule may be in force at once
ALTER TABLE app.regulatory_rule_versions
  ADD CONSTRAINT rrv_no_overlap EXCLUDE USING gist (
    rule_key WITH =,
    daterange(effective_from, coalesce(effective_until,'infinity'::date), '[)') WITH &&
  ) WHERE (status IN ('scheduled','active'));

REVOKE UPDATE, DELETE ON app.regulatory_rule_versions FROM maabar_app;
```

Three constraints carry most of the weight. `rrv_separation_of_duty` makes single-person rule
changes impossible at the database level. `rrv_no_overlap` makes "which rule applies?" always
have exactly one answer. The revoked grants make a published version permanent — a correction is
a new version, never an edit (the same principle as AD-024).

---

## 3. Rule catalogue

From `DESIGN-AUDIT.md` §10, with the values visible in the deck:

| Key | Type | Current value | Source | Used by |
|---|---|---|---|---|
| `max_value_per_trip` | money | `180 000 000` centimes (1 800 000 DZD) | Decree 25-170, JO 40, 29 June 2025 | Trip publication, capacity checks, `Trip Creation` display |
| `max_trips_per_month` | integer | `2` | Decree 25-170 | Trip publication ("الرحلة 1 من 2") |
| `customs_duty_rate` | ratio | `0.05` | Decree 25-170 | `Records` ledger ("رسم جمركي 5%") |
| `flat_tax_rate` | ratio | *to confirm* | Decree 25-170 | Ledger |
| `authorisation_validity_months` | duration | *to confirm* | Ministry of Foreign Trade | Expiry warnings |
| `shelf_life_min_remaining_ratio` | ratio | `0.5` | Decree 25-170 **art. 6** | Compliance verdict for cosmetics and fragrance |
| `restricted_categories` | list | category codes | Decree 25-170 | Compliance, listing moderation, demand board flags |
| `required_documents_per_role` | list | ANAE card, general authorisation, NIF, CASNOS / commercial register, NIF, address | Decree 25-170 art. 4; Law 18-05 | Verification ladders |

`shelf_life_min_remaining_ratio` is quoted verbatim in the `Compliance Checker` in all three
languages — "more than half of the shelf life must remain on the import date". The *number* is
configuration; the *sentence* is a translated message key that interpolates it, so changing 0.5
to 0.6 changes every locale at once without a translation round.

`required_documents_per_role` being a rule, not an enum, is why `document_types` is a lookup
table (`DATABASE-DESIGN.md` §4). A new required document is a rule version plus a lookup row,
not a deployment.

---

## 4. Lifecycle

```
draft ──▶ in_review ──▶ approved ──▶ scheduled ──▶ active ──▶ superseded
  │           │            │
  └───────────┴────────────┴──▶ (discarded, retained for audit)
```

| State | Meaning | Who |
|---|---|---|
| `draft` | Being prepared | `regulatory` admin |
| `in_review` | Awaiting approval | second `regulatory` admin |
| `approved` | Accepted, not yet in force | approver ≠ drafter, enforced by CHECK |
| `scheduled` | `effective_from` is in the future | system |
| `active` | In force now | system, at `effective_from` |
| `superseded` | A later version took effect | system |

`Admin Console` shows this queue as "قواعد قيد النشر · مسودّة v7" — a draft awaiting publication
is a first-class work item with its own row, not a configuration file someone edits.

---

## 5. Resolution — every read is time-anchored

```ts
interface RegulatoryResolver {
  get<T>(key: RuleKey, asOf: Date): Promise<RuleValue<T>>;   // value + provenance
}
```

**There is no `get(key)` without `asOf`.** The signature makes the mistake impossible to write,
which is the only reliable way to prevent it.

| Caller | `asOf` |
|---|---|
| Trip publication | `now()` — and the resolved `rule_version_id` is stamped on the trip |
| Capacity check | The trip's stamped version, **not** `now()` |
| Compliance checker | `now()` |
| Historical commitment display | The commitment's stamped `rule_version_id` |
| Ledger and Art. 14 labels | The trip's stamped version |
| Admin impact preview | A candidate `effective_from` |

Stamping is what makes history stable. `trips.rule_version_id` and `commitments.rule_version_id`
are `NOT NULL` foreign keys, so a record can always answer "under which law was this made?".

In-process cache keyed by `(key, date)`, invalidated on publication; the working set is a handful
of rows, so a cache miss costs one indexed read.

---

## 6. Publishing a change

```
1. Draft        new version, value, effective_from, source citation (mandatory)
2. Impact       system computes, before approval:
                  · trips scheduled after effective_from that would exceed the new cap
                  · commitments in flight referencing the old version
                  · listings in categories entering `restricted_categories`
                  · users whose required documents change
3. Approve      a DIFFERENT regulatory admin; reason mandatory
4. Schedule     status=scheduled; the exclusion constraint proves no overlap
5. Activate     at effective_from: previous version gets effective_until and superseded
6. Notify       every affected user, with the reason and what changes for them
7. Audit        stream `rule:<key>`, full before/after
```

Step 2 is required by the audit ("sees an impact preview") and is the step that prevents the real
failure mode: lowering a cap and discovering afterwards that forty published trips are now
illegal. Step 6 is required too — silent regulatory change is explicitly forbidden.

### 6.1 Records already made are never rewritten

A published trip keeps its stamped version. If a cap is **lowered**, existing published trips are
not retroactively invalid; the importer is notified that their next trip is subject to a new
limit. If a cap is **raised**, existing trips keep their old cap until republished. In both cases
`DESIGN-AUDIT.md`'s requirement holds: *"No silent mutation of historical records."*

---

## 7. Compliance verdicts

The `Compliance Checker` is a regulatory read with a strict disclosure order (settled decision 8):
**verdict → reason → what to do → (collapsed) legal basis → (collapsed) source and last-updated.**
Never legal text before the verdict.

```sql
CREATE TABLE app.compliance_items (
  id uuid PRIMARY KEY,
  category_id uuid REFERENCES app.categories(id),
  goods_key text NOT NULL,
  origin_country char(2),
  verdict text NOT NULL CHECK (verdict IN ('allowed','conditional','prohibited')),
  reason_key text NOT NULL,
  steps_keys text[] NOT NULL DEFAULT '{}',
  rule_version_id uuid NOT NULL REFERENCES app.regulatory_rule_versions(id),
  article text,
  last_reviewed_on date NOT NULL,
  reviewed_by uuid REFERENCES app.admin_users(id)
);
```

Verdict colours map to the token semantics — `--allowed`, `--conditional`, `--prohibited` — and
the accent colour is banned from compliance surfaces, so a compliance answer can never look like
a commercial promotion.

Every response carries the disclaimer, in all three locales: *indicative guidance; the final
decision at entry rests with customs*. It is part of the payload (`API-CONTRACT.md` §14), not a
client-side string a redesign could drop.

`Admin Console` carries a queue for this — "أصناف تحتاج مراجعة" — so verdicts age and are
re-reviewed rather than set once and trusted forever.

---

## 8. Feature flags — adjacent, deliberately separate

```sql
CREATE TABLE app.feature_flags (
  key text PRIMARY KEY, enabled boolean NOT NULL DEFAULT false,
  description text NOT NULL, updated_by uuid, updated_at timestamptz NOT NULL DEFAULT now()
);
```

| Flag | Default | Meaning |
|---|---|---|
| `features.deposit_declaration` | **false** | **LEGAL HOLD** — §9.2. Must remain false in staging and production until an Algerian lawyer rules on purchase-mandate status (AD-019) |
| `discover.importers.audience` | `verified_traders` | §9.1 visibility question (AD-045) |
| `features.group_sourcing` | false | AD-041 |
| `features.price_index` | false | AD-042 |
| `features.push_notifications` | true | Rollout control |

Flags are **not** regulatory rules and do not live in the same table: a flag is a product or legal
switch with no effective date, no citation and no history requirement. Conflating them would put
"is this feature on?" into the same versioned, cited, dual-approved structure as "what is the
legal cap?", and would make the compliance audit trail noisy.

CI asserts that the production configuration has `features.deposit_declaration = false` unless a
recorded legal sign-off reference is present (`SECURITY-ARCHITECTURE.md` T22). This is the
mechanical guarantee behind the conditional hold.

---

## 9. Testing

| Test | Assertion |
|---|---|
| Resolution | `get(key, asOf)` returns the version effective at that date, across boundaries |
| No overlap | Inserting an overlapping in-force version raises the exclusion violation |
| Separation of duty | A version approved by its drafter is rejected by the CHECK |
| Stamping | A trip published today and read after a rule change still reports its original cap |
| Historical reproducibility | A commitment from version 2 renders identically after version 3 activates |
| Cap enforcement | Publishing a trip beyond the cap returns `LEGAL_LIMIT_REACHED` with the rule key and effective date |
| Monthly cap | The third trip in a month is refused, resolved against the effective version |
| Immutability | `UPDATE` on a published version is refused for `maabar_app` |
| Impact preview | Lowering the cap lists exactly the affected trips |
| Notification | Activating a rule notifies affected users with a reason |
| Flag hold | Deposit endpoints return `FEATURE_DISABLED` while the flag is false, in every environment |
