# ADR-006 — Search

**Status:** 🔒 LOCKED
**Date:** 14 September 2026
**Revises:** the first blueprint's dedicated `search.documents` index table → **generated columns on
source tables**

---

## Context

The `Search` screen has four scopes with independent counts — products (128), traders (14),
importers (9), trips (4). The corpus at launch is roughly 1,200 listings, tens of profiles and
single-digit trips. Arabic is the primary query language, with French and English secondary.

## Decision

**PostgreSQL full-text search + `pg_trgm`, with generated `tsvector` columns on the source tables.**

No separate index table. No Elasticsearch. No OpenSearch. No Meilisearch. No Typesense.

```sql
-- Immutable, so it can be used inside a generated column.
CREATE FUNCTION app.ar_normalize(t text) RETURNS text
LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE AS $$ … $$;

ALTER TABLE app.product_listings
  ADD COLUMN search_tsv tsvector
    GENERATED ALWAYS AS (to_tsvector('simple',
      app.ar_normalize(coalesce(title,'') || ' ' || coalesce(description,'')))) STORED,
  ADD COLUMN search_norm text
    GENERATED ALWAYS AS (app.ar_normalize(coalesce(title,'') || ' ' ||
                                          coalesce(description,''))) STORED;

CREATE INDEX listings_tsv  ON app.product_listings USING gin (search_tsv)  WHERE state='published';
CREATE INDEX listings_trgm ON app.product_listings USING gin (search_norm gin_trgm_ops) WHERE state='published';
```

Same pattern on `trader_profiles`, `importer_profiles` and `trips`.

---

## Why the index table was wrong

The first blueprint specified `search.documents` — one row per (entity, locale) with a sync job.
Reviewing it honestly:

- The four scopes are **four separate queries anyway**, against four different result shapes. A
  unified index bought no query consolidation.
- It introduced a **sync job that can silently go stale**, producing a search result for a listing
  that was archived an hour ago — with no failing test, because the source data was correct.
- Generated columns update **in the same write** as the row. There is no lag and nothing to
  reconcile.

The one thing the index table would have bought — cross-entity relevance ranking in a single
result list — is not what the design does. `Search` shows scoped tabs.

## Why not Elasticsearch

At 1,200 documents, a search cluster would be the **largest operational burden in the system**:
another stateful service to run, back up, upgrade and keep in sync, serving a table that fits
comfortably in shared buffers. The first blueprint reached the same conclusion; this review
confirms it.

---

## Arabic handling — the part that actually matters

PostgreSQL ships **no Arabic stemmer**. Without normalization, `معطف`, `معاطف` and `المعطف` do not
match each other, and users type all three.

`ar_normalize` folds, in one immutable function shared by indexing and querying:

- tatweel (`ـ`) and all tashkeel diacritics stripped
- alef variants `أ إ آ ٱ` → `ا`; alef maqsura `ى` → `ي`
- taa marbuta `ة` → `ه`
- Arabic-Indic digits `٠١٢٣٤٥٦٧٨٩` → `0123456789`
- punctuation → space, lowercase

`tsvector` with the `simple` configuration handles token matching; `pg_trgm` similarity handles
typos and the prefix/suffix morphology that `simple` cannot stem. Ranking is
`ts_rank_cd` + `similarity()`, with **confirmed-transaction count as the tiebreak** — which is also
the design's `الأكثر معاملات مؤكَّدة` sort option, so one signal serves both.

Cross-language matching (`parfum` → `عطور`) works because category and product taxonomies are
already multilingual: the searchable text includes the item's titles in all three locales.
**Transliteration of arbitrary user content is explicitly out of scope** — the design does not need
it.

---

## Alternatives considered

**Elasticsearch / OpenSearch.** Rejected: disproportionate. Revisit above ~100k listings or when
ranking needs learned signals.

**Meilisearch / Typesense.** Lighter than Elasticsearch and genuinely good with typo tolerance, but
still a second stateful service with its own sync problem, for a corpus this size.

**`LIKE '%term%'`.** Rejected: no ranking, no normalization, sequential scans, and it would give
Arabic users visibly worse results than the design promises.

**Keeping `search.documents`.** Rejected — see above.

---

## Trade-offs

| Cost | Accepted because |
|---|---|
| Generated columns add write cost on every listing update | Listings change rarely; the cost is microseconds |
| Changing `ar_normalize` requires a reindex migration | It is `IMMUTABLE` by necessity; the change is rare and the migration is mechanical (`ALTER … DROP/ADD COLUMN`) |
| No learned ranking, no synonyms, no "did you mean" | Not in the design. `Search` has a designed empty state with suggestions instead |
| Four count queries per search | Four indexed counts over a small corpus. Cap at a threshold and render `+99` if it ever matters |

---

## Consequences

1. Search has **no separate infrastructure**, no sync job and no staleness class of bug.
2. The query layer sits behind a `SearchPort` interface, so swapping engines later is contained.
3. The Arabic normalization tests (`معطف` ↔ `المعاطف`, `عطر` ↔ `عطور`, Arabic-Indic digits) are in
   the standing test suite, because a regression there is invisible to a non-Arabic-reading
   reviewer.
4. **Scaling trigger, written down now:** revisit when published listings exceed ~100,000 or search
   p95 exceeds 400 ms on warm cache.
