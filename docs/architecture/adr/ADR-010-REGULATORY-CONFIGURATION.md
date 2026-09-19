# ADR-010 — Regulatory configuration (not a rules engine)

**Status:** 🔒 LOCKED
**Date:** 14 September 2026
**Revises:** the first blueprint's six-state version lifecycle → **three states**

---

## Context

Algeria legalised micro-importing in June 2025. The rules are new, and new rules move. The design
is explicit: *"No regulatory value is drawn as a constant. Every one is a parameter with an
effective date"* — and `Trip Creation` displays the value cap **with its effective date visible to
the user**, while the `Compliance Checker` shows article, source and last-updated.

Two requirements follow that a settings table cannot meet:

1. **Historical interpretability.** A commitment made in October must remain readable under
   October's rules after they change in December.
2. **Provenance is user-facing.** The citation is content a user reads, not metadata for engineers.

## Decision

**Versioned configuration rows with effective dates, plus explicit domain validation in code.**

**Not** a rules engine. No DSL, no expression evaluator, no scriptable conditions, no
`if/then` rows in a database.

---

## Why not a rules engine

The temptation is real — "regulatory rules" sounds like it wants a rules engine. It does not.

There are **eight** rule keys, they are scalars and lists, and the logic that consumes them is
fixed: compare a trip's value against a cap, count trips in a month, check a category against a
restricted list, look up a required-document set. That logic belongs in domain code where it is
typed, testable and readable.

A rules engine would move it into strings in a database, where it is untyped, untestable by the
compiler, and — worst for this product — **unreviewable by a lawyer**, who can read
"max_value_per_trip = 1,800,000 DZD, effective 29 June 2025, JO n°40" but cannot audit an
expression tree.

The versioning and provenance are what must be data. The interpretation stays code.

---

## Model — locked

```sql
app.regulatory_rules          key (PK) · scope · value_type · unit · description_key

app.regulatory_rule_versions  id · rule_key · version · value jsonb
                              · effective_from · effective_until
                              · status: draft | active | superseded
                              · source_name_key · source_reference · source_article · source_url
                              · created_by · approved_by · approved_at · published_at

  CHECK (approved_by IS NULL OR approved_by <> created_by)      -- separation of duty
  EXCLUDE USING gist (rule_key WITH =,
                      daterange(effective_from,
                                coalesce(effective_until,'infinity'::date),'[)') WITH &&)
    WHERE (status = 'active')                                   -- exactly one in force

  REVOKE UPDATE, DELETE FROM maabar_app                         -- a published version is permanent
```

Two constraints do the heavy lifting, and both are free:

- **Separation of duty** as a CHECK — a single person can never change a legal value alone.
- **No overlap** as an exclusion constraint — "which rule applies?" always has exactly one answer.

### Why three states, not six

The first blueprint specified `draft → in_review → approved → scheduled → active → superseded`.
For eight rules that change perhaps twice a year, a six-state workflow is ceremony: `in_review`,
`approved` and `scheduled` are all "a second person has signed off and the date has not arrived
yet", which `approved_by IS NOT NULL` plus `effective_from > today` already expresses.

Locked: **`draft → active → superseded`**, with dual approval preserved as the CHECK constraint,
because that is the part with actual value.

---

## The rules — eight keys

| Key | Type | Current value | Source |
|---|---|---|---|
| `max_value_per_trip` | money | 180,000,000 centimes (1,800,000 DZD) | Decree 25-170, JO 40, 29 June 2025 |
| `max_trips_per_month` | integer | 2 | Decree 25-170 |
| `customs_duty_rate` | ratio | 0.05 | Decree 25-170 |
| `flat_tax_rate` | ratio | ⚪ to confirm | Decree 25-170 |
| `authorisation_validity_months` | duration | ⚪ to confirm | Ministry of Foreign Trade |
| `shelf_life_min_remaining_ratio` | ratio | 0.5 | Decree 25-170 **art. 6** |
| `restricted_categories` | list | category codes | Decree 25-170 |
| `required_documents_per_role` | list | ANAE card, general authorisation, NIF, CASNOS / commercial register, NIF, address | Decree 25-170 art. 4; Law 18-05 |

`required_documents_per_role` being a rule rather than an enum is why `document_types` is a lookup
table: a newly required document is a rule version plus a lookup row, **not a deployment**.

---

## Resolution — the signature is the control

```ts
interface RegulatoryResolver {
  get<T>(key: RuleKey, asOf: Date): Promise<RuleValue<T>>;   // value + provenance
}
```

**There is no `get(key)` without `asOf`.** Making the mistake unwritable is more reliable than
documenting that it must not be made.

| Caller | `asOf` |
|---|---|
| Trip publication | `now()` — and the resolved `rule_version_id` is **stamped on the trip** |
| Capacity check | The trip's **stamped** version, not `now()` |
| Compliance checker | `now()` |
| Historical commitment display | The commitment's stamped version |
| Ledger and Art. 14 labels | The trip's stamped version |

`trips.rule_version_id` and `commitments.rule_version_id` are `NOT NULL` foreign keys. That is what
makes history stable: a record can always answer *under which law was this made?*

---

## Publishing a change

```
1 Draft      value + effective_from + source citation (mandatory)
2 Impact     system lists what the change would affect, BEFORE approval
3 Approve    a DIFFERENT admin (enforced by CHECK)
4 Activate   at effective_from; previous version gets effective_until, status=superseded
5 Notify     affected users, with the reason — never silently
6 Audit      stream rule:<key>, full before/after
```

Step 2 exists because the failure mode is real: lowering a cap and discovering afterwards that
forty published trips are now non-compliant. Step 5 is a design requirement — the audit states
that affected users are notified with the reason, never silently.

**Records already made are never rewritten.** A published trip keeps its stamped version. If a cap
is lowered, existing trips are not retroactively invalid; the importer is told their next trip is
subject to a new limit.

---

## Alternatives considered

**Constants in code.** Rejected: the design forbids it, and a rule change would need a deploy.

**Environment variables.** Rejected: no effective date, no history, no citation, no audit — and
historical records would silently reinterpret.

**A single-row settings table.** Rejected: same, plus it makes reproducibility impossible.

**A full rules engine (JSON Logic, CEL, a DSL).** Rejected — see above. Eight scalar keys.

**Six-state lifecycle.** Rejected as ceremony; the valuable part was the dual approval, which is
kept as a constraint.

---

## Consequences

1. Regulatory values are data; their interpretation is typed, tested code.
2. Every regulatory read carries provenance to the UI, because the design displays it.
3. Adding a ninth rule is a row plus the domain code that consumes it — deliberately, so nobody can
   add a rule that nothing enforces.
4. Feature flags are a **separate** table (`app.feature_flags`). A flag has no effective date, no
   citation and no history requirement; conflating the two would put "is this feature on?" into the
   dual-approved, cited, versioned structure and make the compliance trail noisy.
