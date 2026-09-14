# Maabar (مَعْبَر)

A commercial network for Algeria's legalised micro-import trade — **تجارة الكابة / تجارة الشنطة**.

Algeria legalised micro-importing in June 2025 through **Executive Decree 25-170**. Thousands now hold a licence to import goods personally, on their own trips abroad, with their own foreign currency — capped at **1,800,000 DZD per trip, 2 trips per month**.

The problem: they fly to Istanbul or Dubai carrying their savings in hard currency and **buy on a guess**. Guess wrong and their capital freezes in unsold stock, and the monthly cap means they cannot recycle it.

Maabar connects the micro-importer, the trader, and the consumer through discovery, verified demand, trust, and structured records. It is **not** a seller, payment processor, escrow service, customs system, or shipping company.

---

## Contents

| | |
|---|---|
| **[`DESIGN-AUDIT.md`](DESIGN-AUDIT.md)** | The audit. Verdict, role/capability matrix, screen inventory, user journeys, state coverage, legal holds. **Read this first.** |
| **`designs/`** | 24 product screens + `tokens.css` |
| **`preview/`** | Local server for viewing the screens |

---

## Viewing the design

The screens are Claude Design artboards (`.dc.html`). They need a React runtime that the Claude Design canvas normally injects — the preview server supplies it:

```bash
node preview/server.js
```

Then open <http://localhost:4321>.

Boards with a chip row at the top or bottom are **state-switchable** — click through to see loading, empty, error, offline, pending, rejected, expired and success states.

---

## Status

**Design complete. No application code yet.**

24 screens, one token layer, Arabic-first RTL throughout. Every P0 user journey is drawn end to end.

**One module is held pending Algerian legal review:** the deposit declaration in `Commitment` — see `DESIGN-AUDIT.md` §9.2. Everything else is buildable.

---

## Before writing code

Ten decisions were settled during design. Do not re-open them while implementing:

1. **An importer never sells to a consumer.** Enforce at schema level: a listing requires `seller.role === 'trader' && rc_verified`. Decree 25-170 art. 4 exempts micro-importers from the commercial register while Law 18-05 requires one of an online supplier — the trader resolves that conflict, the importer would create it.
2. **No transaction fee, no escrow, no payment for goods.** Subscription billing only, and it may never reference a commitment.
3. **No composite trust score.** Countable facts only, each decomposable into its raw inputs.
4. **Regulatory values are configuration with effective dates**, never constants.
5. **Reviews only from recorded transactions**, never deleted, always with a right of reply.
6. **Admin corrections are new decisions referencing the old**, never edits.
7. **Numbers are always LTR-isolated** (`U+2066…U+2069`); Arabic is never letter-spaced or uppercased.
8. **Compliance answers first, evidence on demand** — never legal text before the verdict.
9. **Import pre-declaration happens on anae.dz.** Maabar reminds; it never files.
10. **The deposit field stays behind a feature flag** until §9.2 is answered.

---

## Known gaps

- French and English copy exists on 2 of 24 screens. The RTL/LTR architecture is proven; the rest is an i18n content task.
- Desktop layouts exist only for the admin console. Everything else is mobile-first.
- Product imagery uses designed category placeholders, not real photography.
