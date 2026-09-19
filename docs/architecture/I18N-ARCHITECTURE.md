# Maabar — Internationalization, RTL and Number Handling

Arabic is first-class, not a translation of a French original. The approved deck is Arabic-first
RTL across all 24 screens with zero physical `left`/`right` in layout. This document turns that
into an implementation contract.

---

## 1. Current state, honestly

From `DESIGN-AUDIT.md` §8:

- **Complete:** 24/24 screens Arabic-first RTL; zero physical directional properties; all 14
  number formatters wrap output in `U+2066…U+2069`; Arabic counted nouns implemented; Western
  digits with tabular figures and non-breaking thousands separators.
- **Partial:** French and English copy exists on **2 of 24 screens** (`Landing`,
  `Compliance Checker`). The other 22 carry Arabic strings only.

The architecture is proven — `dir` flips correctly, no component has a fixed width, French runs
roughly 20% longer and is absorbed. The remainder is a **content task**, and the string
extraction is part of the first implementation sprint rather than a later project.

---

## 2. Locales and direction

| Locale | Direction | Role |
|---|---|---|
| `ar` | RTL | Default and fallback for everything |
| `fr` | LTR | Full parity target |
| `en` | LTR | Full parity target |

Resolution order: explicit user setting → `?lang=` → session preference → `Accept-Language` →
`ar`. The choice is stored on `users.locale` and re-applied on every device.

Fallback is `fr → ar` and `en → ar`, **never** `ar → fr`. A missing Arabic string is a build
failure, not a runtime fallback: Arabic is the source language.

`dir` is set on `<html>` from the locale. The `Compliance Checker` artboard already demonstrates
the mechanism — it sets `dir` and `lang` on the root element when the language changes, and the
whole layout reflows with no duplicated markup.

---

## 3. One component set, two directions

**Never fork a component for RTL.** The rules that make this work are already in `tokens.css`:

| Forbidden | Required |
|---|---|
| `margin-left`, `padding-right`, `left`, `right` | `margin-inline-start`, `padding-inline-end`, `inset-inline-start` |
| `border-left` | `border-inline-start` |
| `text-align: left` | `text-align: start` |
| `float: left` | `float: inline-start` |
| Fixed pixel widths on text containers | `min-width`, `max-width`, intrinsic sizing |
| Directional transforms on icons | `[dir="rtl"] .icon-directional { transform: scaleX(-1) }`, applied only to genuinely directional glyphs (arrows, chevrons) |

A stylelint rule fails the build on any physical directional property in component CSS. The deck
achieved zero occurrences across 24 screens; the implementation must not regress it.

**Never letter-space or uppercase Arabic.** `tokens.css` already enforces
`[lang="ar"] { letter-spacing: 0 }` — letter-spacing breaks Arabic joining, and Arabic has no
case. A `text-transform: uppercase` in a shared component silently corrupts Arabic while looking
correct in French.

---

## 4. Mixed-direction discipline — the rule that breaks things

This is the single most error-prone area and the deck documents it explicitly in `tokens.css`:

> Inside Arabic text, a Latin or numeric run must be isolated or bidi reorders it: `60%` renders
> as `%60`, and `S · M · L · XL` reverses to `XL · L · M · S`. Both were caught in RTL review.

### 4.1 Two mechanisms, both mandatory

| Context | Mechanism |
|---|---|
| Markup | `<bdi class="ltr">S · M · L · XL</bdi>` |
| Data / strings | `U+2066` (LRI) … `U+2069` (PDI) around the run |

`tokens.css` provides `.ltr`, `.rtl` (`unicode-bidi: isolate`), and isolates `.mono`, `.code` and
`.ref` by default, because code identifiers, HS codes and reference IDs are Latin syntax that
must never inherit paragraph direction.

### 4.2 Isolation happens in the formatter, never at the call site

Every artboard implements this helper; the application implements it **once**:

```ts
const LRI = '⁦', PDI = '⁩';
export const ltr = (s: string) => LRI + s + PDI;

export function formatInteger(n: number, locale: Locale): string {
  const grouped = String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); // NBSP separator
  return ltr(grouped);
}
```

Rules:

- **No component calls `toLocaleString`, `Intl.NumberFormat` or string concatenation on a number.**
  A lint rule forbids it outside `packages/format`.
- The API returns raw integers (`API-CONTRACT.md` §1.3); formatting is a client concern with one
  implementation shared by the web tier and any future native client.
- The thousands separator is a **non-breaking space**, matching the deck's `1 800 000`.
- Digits are **Western** (`0-9`) in all three locales, with `font-variant-numeric: tabular-nums`
  via `.num`, so figures align in the capacity meters and ledger.

### 4.3 What must be isolated

Numbers · percentages · currency amounts · date ranges · size runs (`S · M · L · XL`) ·
dimensions (`1.20 م³`) · reference IDs (`CMT-26-0331`) · phone numbers · URLs · HS codes ·
any Latin token inside an Arabic sentence.

---

## 5. Arabic pluralization — counted nouns

Arabic does not have English's two-form plural. The deck implements a four-form counted noun and
comments it: *"`1 أصناف` is wrong; the noun changes form with the count."*

```ts
type CountedNoun = { one: string; two: string; few: string; many: string };

export function counted(n: number, forms: CountedNoun, locale: Locale): string {
  if (locale !== 'ar') return `${formatInteger(n, locale)} ${forms.many}`;
  const m = n % 100;
  if (n === 1) return forms.one;                                   // صنف واحد
  if (n === 2) return forms.two;                                   // صنفان
  if (m >= 3 && m <= 10) return `${formatInteger(n)} ${forms.few}`; // 3 أصناف
  return `${formatInteger(n)} ${forms.many}`;                       // 11 صنفاً
}
```

Note that `one` and `two` return the noun **without** the numeral — the number is carried by the
word form. Emitting "1 صنف واحد" is the classic bug.

Catalogue entries for counted nouns therefore carry four forms, and the extraction tooling
rejects an Arabic plural key with fewer. Known sets from the deck: units (`وحدة`), kinds
(`صنف`), buyers (`مشترٍ`), products (`منتج`), reviews (`مراجعة`), sheets (`ورقة`).

French uses one/other; English uses one/other. The catalogue format supports all CLDR categories
so a future locale does not force a refactor.

---

## 6. Catalogue structure

```
packages/i18n/
  ar/  common.json  auth.json  marketplace.json  trips.json  sourcing.json
       commitments.json  messaging.json  verification.json  disputes.json
       compliance.json  billing.json  admin.json  errors.json  notifications.json
  fr/  … same files
  en/  … same files
```

- **Keys are semantic, never English prose**: `commitment.state.secured.title`, not
  `"Deposit declared"`. This matters because Arabic is the source and English is a translation.
- **Namespaces map to modules**, so a feature ships its strings with its code and a route can
  load only what it renders.
- **No user-facing text in business logic.** Services return `message_key` and structured
  `details`; the client renders. This is why the error envelope carries `message_key`
  (`API-CONTRACT.md` §17).
- **Interpolation is named and typed**: `{count}`, `{wilaya}`, `{date}`. A generated
  `Messages` type makes a missing or misspelled variable a TypeScript error.
- **No string concatenation to build a sentence**, ever — word order differs across the three
  languages and Arabic sentence structure will not survive it.

---

## 7. Dates, times and calendars

| Concern | Rule |
|---|---|
| Storage | UTC `timestamptz`; dates without time as `date` |
| Display timezone | `Africa/Algiers` (UTC+1, no DST) |
| Calendar | Gregorian in all three locales, matching the deck (`12 – 16 أكتوبر`) |
| Month names | Arabic uses the Levantine/Maghrebi set the deck uses — `جوان` for June, `أكتوبر`, `نوفمبر` — **not** the transliterated `يونيو` set. This is a real regional distinction and a generic ICU locale will get it wrong; the month names are catalogue entries, not `Intl` output |
| Ranges | Formatted as a unit and LTR-isolated: `⁦12 – 16 أكتوبر⁩` |
| Relative time | `قبل يومين`, `بعد 34 يوماً` — counted-noun rules apply |
| Hijri | Not required by the design. Not implemented |

Because `جوان` is the term used in the compliance source citation ("29 جوان 2025"), and legal
citations must match the Official Journal wording exactly, month names are treated as content,
not formatting.

---

## 8. Currency

Only DZD. Displayed as `دج` in Arabic, `DA` in French and English, **after** the isolated number:
`⁦7 400⁩ دج`. No ISO code in the interface, no symbol before the number, no cents shown — the
design never displays subdivisions, even though the database stores centimes (AD-031).

Rounding for display is half-up to the nearest dinar; the stored value is never rounded.

---

## 9. Search across locales

`search.documents` is keyed by `(entity_type, entity_id, locale)` — one row per locale, so an
Arabic query does not have to match French text. Arabic normalization (`DATABASE-DESIGN.md` §8)
folds alef and hamza variants, taa marbuta, tashkeel, tatweel and Arabic-Indic digits.

Cross-script tolerance: a user typing `parfum` should find `عطور`. Handled by storing the
**concept's** translated titles in every locale row, not by transliteration — the category and
product taxonomies are already multilingual, so the Arabic row includes the French and English
titles in its `body`. Transliteration of arbitrary user content (`Boutique Nadia` ↔ `بوتيك نادية`)
is explicitly **out of scope for MVP**; the design does not require it.

---

## 10. Fonts and typography

From `tokens.css`: `IBM Plex Sans Arabic` with a system fallback, `IBM Plex Mono` for code and
references. Arabic line-height `1.68`; Latin `1.52` — Arabic runs about 12% taller and this is
already encoded as `--lh-ar` / `--lh-lat`.

Loading: `font-display: swap`, WOFF2, subset per script (Arabic subset does not ship to a French
user), preloaded for the two weights above the fold. On Algerian networks this is a meaningful
share of first paint, so the subsets are built in CI, not hand-maintained.

---

## 11. Content that must exist in all three locales before launch

| Content | Why |
|---|---|
| Platform limits notice (`Landing.limits`) | Legal positioning: no exchange, no payments or escrow, no buying by proxy, no customs declaration, no guarantee, no government approval |
| Payment disclosure on every listing | "Maabar does not receive, hold, guarantee or refund" |
| Compliance verdicts, reasons, steps, citations and the customs disclaimer | It is a public tool and a legal statement |
| Verification requirements and rejection reasons | A user must understand why they were refused |
| Every error `message_key` | An untranslated error is a dead end |
| Notification bodies | They arrive out of context |
| The importer *blocked* explanation in `Listing Composer` | It teaches the legal boundary — its whole purpose |

The remaining marketing and helper copy can ship Arabic-first and follow, which is what
`DESIGN-AUDIT.md` §12 means by a P1 content task.

---

## 12. Testing

| Test | Assertion |
|---|---|
| Key completeness | Every `ar` key exists; `fr`/`en` gaps are reported, and gaps in the §11 list fail the build |
| No hard-coded strings | Lint fails on user-facing literals in components and services |
| Counted nouns | 1, 2, 3, 10, 11, 100, 101, 102 produce the correct Arabic form |
| LTR isolation | Every formatter output starts `U+2066` and ends `U+2069` |
| No physical directions | Stylelint across all component CSS |
| Direction flip | Visual regression of each screen in `ar` and `fr` |
| Overflow | French strings at 130% of Arabic length do not clip or wrap badly |
| Bidi regression | `60%` renders as `60%` and `S · M · L · XL` keeps its order inside an Arabic paragraph — the two failures the RTL review actually caught |
| Arabic search | `معطف` matches `المعاطف`; `عطور` matches `عطر`; Arabic-Indic digits match Western |
