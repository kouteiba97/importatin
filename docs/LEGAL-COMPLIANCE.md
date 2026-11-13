# Maabar — Legal compliance review (Algerian micro-import law)

Review date: **13 November 2026**. This is a design-stage compliance check, not legal advice.
An Algerian lawyer must confirm it before launch (open questions in §6).

## 1. Texts read

| Text | Where | Status in this review |
|---|---|---|
| **Executive Decree 25-170** of 28 June 2025 — conditions and procedures for micro-importing by the auto-entrepreneur (16 articles) | Journal officiel n°40, 29 June 2025, pp. 7–8 (copy published by the Ministry of Commerce) | **Read in full, official text** |
| **Law 25-17** of 14 December 2025, Finance Law for 2026 — **art. 143** | Journal officiel n°88, 31 December 2025, p. 71 | **Read, official text** |
| Customs note n°1729 of 9 September 2026 (risk directorate) and its clarification | Press reports only (Algérie Eco, 18 Sept 2026, and others) | Not an official text — used as a warning sign only |
| Law 22-23 (auto-entrepreneur status), Decree 23-197 (register) | Cited by Decree 25-170 | Not re-read |
| Law 18-05 (e-commerce), Law 09-03 (consumer protection), Law 18-07 as amended by 25-11 (personal data), Ordinance 96-22 (exchange control) | — | Not re-read in this review; earlier project analysis stands. A revision of Law 18-05 is announced but no new text was found |

## 2. Decree 25-170, article by article, against the platform

| Art. | What the law says | What Maabar does | Result |
|---|---|---|---|
| 2 | Individual operations by natural persons on their trips abroad; goods for **resale as they are**; value ≤ 1,800,000 DA **per trip**; **2 trips per month** at most; annual tourist allowance not included | Cap and trips are regulatory values with dates; trip meters; third trip refused; rule articles RUL-103, RUL-108 | Compliant |
| 3 | Exercised **exclusively and personally** by a natural person with auto-entrepreneur status | One importer account = one verified person; commitments only with the named importer; no "buy for me" flow; deposit feature stays switched off pending legal opinion | Compliant, with the deposit hold |
| 4 | Simplified accounts in a numbered ledger initialled by the tax office; no commercial register; no prior import licence; 5% customs duty + special tax regime | Records ledger (export only — it does **not** replace the stamped paper ledger); duty is a regulatory value | Compliant. See §6 Q4 |
| 5 | Legal working age; Algerian nationality **and residence in Algeria**; **no other paid activity**; CASNOS affiliation; **foreign-currency account at BEA**; unemployment allowance is lost | Verification asked for ID, card, authorisation, tax number, CASNOS — **BEA account and residence were missing** | **Fixed in this review** (§4) |
| 6 | Valid auto-entrepreneur card bearing "micro-importation" (ANAE); general authorisation (ministry of foreign trade); respect consumer-protection and national-security rules; remaining shelf life **more than half** at import date | Both documents verified with expiry tracking; shelf-life ratio is a regulatory value; Compliance Checker | Compliant. Screens said "low-value import" instead of the official term — **fixed** |
| 7 | Financed from the importer's **own foreign currency** | Maabar never handles money or currency | Compliant. See §5 on trader deposits |
| 8 | Any overrun of the art. 2 quota is forbidden | Hard stop in trip creation | Compliant |
| 9 | Excluded: prohibited goods and sensitive products; sensitive equipment (Decree 09-410); pharmaceutical products; goods needing special authorisation; goods harming security, public order, morals | Restricted categories list; listing moderation; Compliance Checker | Compliant in design. The detailed product list must be filled from official lists (§6 Q5) |
| 10 | Registration in the national auto-entrepreneur register (Decree 23-197) | Covered by the card check | Compliant |
| 11–12 | Activity only after the general authorisation; issued within 5 working days; valid 1 year, renewable; **personal and non-transferable** | Expiry reminders; trips suspended when expired | Compliant |
| 13 | **Before each operation**, declare the goods on the digital platform set up at the ministry in charge of start-ups, linked to customs | Maabar reminds and links out; it never declares for the user | Compliant. The decree does not name a website — rule text corrected (§4); screens that say "anae.dz" must be confirmed (§6 Q6) |
| 14 | Labels with importer's name, first name and address; goods designation; country of origin and/or provenance. Delivery note adds quantity and/or weight and/or volume | Label and delivery-note generator in Records | Compliant. Rule text said "in Arabic" and "quantity, weight and volume" — **corrected** |
| 15 | Struck off the register for: breaching consumer/national-security rules; refusing pre-declaration; false declarations; using the card for another purpose; breaching the decree | Rule article RUL-111; account suspension | Compliant |

## 3. Finance Law 2026, art. 143 — now confirmed

Until now the project held the flat tax as "unconfirmed". The official text says:

- Micro-importers are eligible for auto-entrepreneur status "notwithstanding the legislation in force".
- Imports: **5% customs duty**; **exempt from VAT, customs fees and the other import duties and taxes** (including the solidarity contribution and the provisional additional safeguard duty); clearance on a **simplified customs declaration**.
- **Single flat tax (IFU) of 0.5%, in full discharge, on each import operation**, calculated on **customs value + customs duty + a flat 30% margin**, **paid to customs** when the goods are released for consumption.
- Applicable **from 28 June 2025**.

Worked example for a full trip (1,800,000 DA customs value): duty 90,000 DA; tax base (1,800,000 + 90,000) × 1.30 = 2,457,000 DA; flat tax 12,285 DA; total 102,285 DA. The platform must compute this from the regulatory values, never from typed numbers.

## 4. What was changed in the designs

1. **Flat tax published.** `flat_tax_rate` (0.5%) and new `flat_tax_margin` (30%) are approved regulatory values citing Law 25-17 art. 143. Rule RUL-112 rewritten and published; new rule RUL-113 (no VAT, simplified declaration). Records ledger shows the flat tax next to the duty.
2. **Verification now asks for everything art. 5 requires**: BEA foreign-currency account and proof of residence in Algeria added to Importer Setup, Verification, Verification Status and For Importers.
3. **Official term.** "Low-value import / importation de faible valeur" replaced by "micro-import / micro-importation" (the words the card must carry).
4. **Rule texts corrected to match the decree**: art. 13 (no website named), art. 14 (no language named; "or" not "and"; origin *or provenance*), art. 5 (unemployment allowance).
5. **Unverified claims removed from drafts**: "the excess is held by customs" (not in the decree). The 48-hour declaration advice from unofficial guides is kept only as a blocked draft (RUL-114) to show that such content cannot be published.

## 5. Points the build must respect (not visible in screens)

- **Eligibility declarations.** At sign-up the importer must declare: no other paid activity (art. 5) and effective residence in Algeria. Store the declaration with date; a false one is a ground for removal (art. 15).
- **Residence is a live risk.** Customs reported in September 2026 people holding residence certificates while living abroad, and purchases paid from foreign bank accounts instead of the BEA account. Maabar should treat a foreign phone number, foreign payout details or repeated foreign sign-in as a review signal for the admin risk queue. It must not add checks customs do not require.
- **Counting trips.** The limit is per calendar month and per trip; the platform should count by the declared travel dates and never allow splitting one trip's goods across two declarations.
- **Value basis.** The cap is in dinars; the customs value is set by customs. Maabar's meter is an estimate and must say so (it already does: "Customs decide at entry").
- **Trader deposits.** Art. 7 (own currency) and art. 3 (personal) make any pre-financing by a trader legally sensitive. `features.deposit_declaration` stays **off** until a lawyer answers §6 Q1.
- **Importers never sell to the public** on Maabar (art. 4 exempts them from the commercial register; Law 18-05 requires one for online sellers). Enforced by role.

## 6. Open questions for an Algerian lawyer

1. Is a deposit paid by a trader to a micro-importer before the trip compatible with arts. 3 and 7?
2. Does listing a micro-importer's trips to verified traders make the importer an "e-supplier" under Law 18-05?
3. What is Maabar's own status and what must it hold (commercial register, .dz hosting, data-protection declaration under Law 18-07/25-11)?
4. Does the 0.5% flat tax at customs fully discharge the importer's tax on resale, and does the 5,000,000 DA auto-entrepreneur turnover ceiling still apply to micro-importers?
5. Where is the official, current list of "sensitive products" and goods needing special authorisation?
6. Which website is officially the art. 13 declaration platform? (Unofficial guides say the ANAE platform.)
7. Labelling language: do the general consumer rules (Arabic labelling) apply on top of art. 14?

## 7. Sources

- Decree 25-170: https://www.commerce.gov.dz/fr/reglementation/decret-executif-n-deg-25-170-j-o-n-deg-40-du-29-juin-2025
- Finance Law 2026: https://www.joradp.dz/FTP/jo-francais/2025/F2025088.pdf (p. 71)
- Customs clarification (press): https://algerie-eco.com/2026/09/18/micro-importation-les-precisions-des-douanes/
