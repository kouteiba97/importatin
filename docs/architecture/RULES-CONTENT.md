# Maabar — Rules pages (structured, admin-controlled content)

The public **Rules** page tells each audience what Algerian law allows on Maabar:

| Audience | Question it answers | Topics |
|---|---|---|
| Shoppers | "Why isn't this product here?" | Why some products aren't here · Who sells to you · Your purchase |
| Micro-importers | "What am I allowed to do?" | Who can import · Your limits · What you may bring · Before and after each trip · What gets you struck off |
| Traders | "What must I respect?" | Selling to the public · Buying from micro-importers · Your responsibilities |

It is **not** a free-text page that someone types into. It is a list of structured
**rule articles** that admins manage from the operations console (`Admin Rules`), with a
review step before anything reaches the public. The same template serves all three
audiences (`/rules?for=shoppers|importers|traders`).

Design files: `designs/Rules.dc.html` (public), `designs/Admin Rules.dc.html` (console),
`designs/rules-content.js` (the sample data both read — the stand-in for the database).
Recipes: `tools/recipes/rules.js`, `tools/recipes/admin-rules.js` (built with `tools/newscreen.js`).

---

## 1. Why structured, not a page editor

1. **Law changes.** When a figure changes (e.g. the per-trip cap), every page in every
   language must change at the same moment, from one approved value — never by
   hand-editing three translations.
2. **Every statement needs its source.** Each article carries the instrument, article
   number and official source, so users and admins can check it.
3. **Three equal languages.** An article cannot go live in one language only.
4. **Two people, always.** Whoever writes a rule cannot be the one who publishes it.

---

## 2. Content model

### Rule article (`rule_articles` + `rule_article_versions`)

| Field | Meaning |
|---|---|
| `code` | Stable id, e.g. `RUL-103` (one per article, kept across versions) |
| `version` | 1, 2, 3 … — versions are immutable once submitted |
| `audience` | `shopper` · `importer` · `trader` |
| `topic` | One of the audience's topics (table above; topics are data too) |
| `level` | `prohibited` · `conditional` · `obligation` · `limit` · `info` — drives the label shown ("Not allowed", "Condition", "Required", "Limit", "Good to know") |
| `position` | Order inside its topic |
| `text[en|fr|ar]` | Three fields per language: **title**, **explanation**, **what this means for you** |
| `instrument` + `article` | e.g. Decree 25-170 · art. 9. Instruments are a managed list (name in 3 languages + official source + URL + `confirmed` flag) |
| `status` | `draft` → `in_review` → `published` → `superseded` (or back to `draft` when returned) |
| `created_by`, `approved_by` | Admin ids; database CHECK `approved_by <> created_by` |
| `reviewed_at` | Shown publicly as "Reviewed …" |

### Value placeholders — no numbers in the text

Texts never contain a regulatory figure. They contain a placeholder that is filled at
display time from the **regulatory engine** (`REGULATORY-ENGINE.md`), formatted for the
reader's language:

| Placeholder | Regulatory rule key | Current value | Source |
|---|---|---|---|
| `{cap}` | `max_value_per_trip` | 1,800,000 DZD | Decree 25-170 art. 2 |
| `{trips}` | `max_trips_per_month` | 2 | Decree 25-170 art. 2 |
| `{duty}` | `customs_duty_rate` | 5% | Decree 25-170 art. 4 |
| `{shelf}` | `shelf_life_min_remaining` | more than 50% | Decree 25-170 art. 6 |
| `{tax}` | `flat_tax_rate` | 0.5% — **proposed, not approved** | Finance Law 2026 (official text not yet confirmed) |

When a new value version becomes active, every article using its placeholder shows the
new figure the same day, in all three languages. The admin "Regulatory values" view
shows, before approval, exactly which published articles will change (impact preview).

---

## 3. Who can do what

| Action | Content editor (sub-admin, role `rules_editor`) | Regulatory approver (role `regulatory`) | Superadmin |
|---|---|---|---|
| Create / edit a draft article | ✅ | — | — |
| Submit for review | ✅ (needs the 3 languages, a legal reference and only known placeholders) | — | — |
| Withdraw from review | ✅ own | — | — |
| Approve and publish | — | ✅ **only if not the author** and all checks pass | — |
| Return to author | — | ✅ | — |
| Unpublish | — | ✅ (reason recorded) | — |
| Propose a new value version | ✅ | — | — |
| Approve / schedule a value version | — | ✅ only if not the proposer, official source present | — |
| Assign the roles above | — | — | ✅ (cannot edit or publish) |

### Checks before publishing (shown in the console; enforced by the server)

1. Text complete in EN, FR and AR (title, explanation, "what this means").
2. Legal reference present, and its instrument is **confirmed** (published in the Journal officiel).
3. Every placeholder exists and points to an **approved** value.
4. Publisher ≠ author.

If any check fails, the "Approve and publish" button is disabled and the failing
reason is shown. Example in the design: `RUL-112` (Finance Law 2026 flat tax) — Arabic
text incomplete, official text not confirmed, `{tax}` not approved → cannot be published.

---

## 4. Publication rules

- Publishing version *n* supersedes the previously published version of the same `code`
  (one live version per article). History keeps every version with author, approver, date.
- Every action is written to the admin audit log (`ADMIN-ARCHITECTURE.md`).
- The public page shows only `published` articles, grouped by topic, with level label,
  legal reference, official source, "Reviewed" date, link to the official text, and the
  page's "Last updated" date (latest `reviewed_at`).
- The page always shows: "Guidance, not legal advice. Customs decide at entry."
- Platform policies (e.g. "Maabar does not take your money") use the instrument
  `platform` and are labelled as Maabar's terms, never as law.

---

## 5. Where the content appears

- Public site: **Rules** in the main navigation (`/rules`, three audience tabs).
- Importer and trader workspaces: **Rules & limits** / **Rules** in the sidebar, opening the
  page on their audience.
- Shoppers (to wire in a later pass): Product pages and "Can I import this?" should link to the shopper rules when a
  product category is excluded (explains "why it isn't here").
- Console: **Compliance → Rules pages** (`Admin Rules`), tabs *Articles* and *Regulatory values*.

---

## 6. Sources used for the published articles

Only verified official texts:

- Executive Decree 25-170 of 28 June 2025, Official Journal n°40 of 29 June 2025 —
  arts 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15.
- Law 18-05 of 10 May 2018 on e-commerce (registration of online sellers).
- Law 09-03 on consumer protection and fraud repression.

Anything not confirmed in an official text (currently the Finance Law 2026 flat tax) stays
a draft and never reaches the public.
