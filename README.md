# Maabar (مَعْبَر)

A commercial network for Algeria's legalised micro-import trade — known locally as **تجارة الكابة / تجارة الشنطة**.

Algeria legalised micro-importing in June 2025 through **Executive Decree 25-170**. Thousands of people now hold a licence to import goods personally, on their own trips abroad, funded with their own foreign currency — capped at **1,800,000 DZD per trip, maximum 2 trips per month**.

Their core problem: they fly to Istanbul or Dubai carrying their savings in hard currency and **buy on a guess**. Guess wrong and their capital freezes in unsold stock, and they cannot recycle it, because the trip cap is monthly.

Maabar connects three parties:

| Party | Job |
|---|---|
| **Micro-importer** | Sees verified local demand *before* buying, so purchasing becomes a data-backed decision |
| **Trader** (holds a commercial register) | Finds reliable importers, discovers who is travelling where and when, documents agreements |
| **Consumer** | Buys imported goods from a verified trader, with that trader's record visible |

Maabar is **not** a seller, a payment processor, an escrow service, a customs system, a currency exchange, or a shipping company. It is a discovery, matching, and record-keeping layer.

---

## Status

**Design phase complete. No application code yet.**

The design has passed a pre-build gate: 24 screens, every P0 user journey walked end to end, one token file, Arabic-first RTL throughout.

Read **[`design/FINAL-DESIGN-AUDIT.md`](design/FINAL-DESIGN-AUDIT.md)** first — it carries the verdict, the role/capability matrix, the state coverage, and the legal items that must be resolved before certain modules are built.

---

## Repository layout

```
docs/                              product strategy and research
  01-PRODUCT-STRATEGY.md           market, legal, business model, architecture
  02-MASTER-PROMPT-CLAUDE-DESIGN.md
  03-AUDIT-AND-REMEDIATION.md      the audit that reshaped the product
  PROMPT-READY-TO-PASTE.md

design/
  FINAL-DESIGN-AUDIT.md            ← START HERE
  DESIGN-AUDIT.md                  earlier audit, kept for history
  REMEDIATION-MAP.md               how the design got to its current form
  designs/                         24 product screens + tokens.css
  spec/                            design-system documentation
  _archive/                        superseded versions
  _preview/server.js               local preview server
```

---

## Viewing the design

The screens are Claude Design artboards (`.dc.html`). They need a React runtime that the Claude Design canvas normally injects — the preview server supplies it:

```bash
node design/_preview/server.js
```

Then open <http://localhost:4321>.

Boards with a chip row at the top or bottom are **state-switchable** — click through to see loading, empty, error, offline, pending, rejected, expired and success states.

---

## Non-negotiables for implementation

Settled during design. These should not be re-opened while coding:

1. **An importer never sells to a consumer.** Enforce at schema level: a listing requires `seller.role === 'trader' && rc_verified`. Decree 25-170 Art. 4 exempts micro-importers from the commercial register, while Law 18-05 requires one of an online supplier — the trader resolves that conflict, the importer would create it.
2. **No transaction fee, no escrow, no payment for goods.** Subscription billing only, and it may never reference a commitment.
3. **No composite trust score.** Countable facts only, each decomposable into its raw inputs.
4. **Regulatory values are configuration**, never constants — `max_value_per_trip`, `max_trips_per_month`, `customs_duty_rate` and the rest are parameters with effective dates.
5. **Reviews only from recorded transactions**, never deleted, always with a right of reply.
6. **Admin corrections are new decisions referencing the old**, never edits.
7. **Numbers are always LTR-isolated** (`U+2066…U+2069`); Arabic is never letter-spaced or uppercased.
8. **Compliance answers first, evidence on demand** — never a wall of legal text before the verdict.
9. **Import pre-declaration happens on anae.dz.** Maabar reminds; it never files.
10. **The deposit field stays behind a feature flag** until the legal question in `FINAL-DESIGN-AUDIT.md` §9.2 is answered.

---

## Open legal questions

Four items require an Algerian lawyer before the affected modules are built. They are documented in `design/FINAL-DESIGN-AUDIT.md` §9, each isolated behind a configurable capability so a ruling changes configuration rather than architecture.

The blocking one: whether a deposit agreed between two users — recorded but never held by the platform — constitutes a *purchase mandate* prohibited by Art. 3.

---

## Known gaps

- French and English copy exists on 2 of 24 screens. The RTL/LTR architecture is proven; the remaining strings are an i18n content task.
- Desktop layouts exist only for the admin console. Everything else is mobile-first.
- Product imagery uses designed category placeholders, not real photography.
