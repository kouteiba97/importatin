# مَعْبَر (Maabar) — Design Foundations

Working name: **مَعْبَر** ("crossing"). Original, non-governmental, describes the job: a trusted crossing between demand and capacity.

## 1. Project state
Empty repository. Greenfield.
Proposed stack: server-rendered public pages (Phase 0 wedge, SEO + WhatsApp previews) + Preact PWA shell for authenticated surfaces; IndexedDB drafts + background send-queue; one variable WOFF2 family (IBM Plex Sans Arabic subset AR+Latin) + Plex Mono for serials; all regulatory values from a `regulation_parameters` table with `effective_from`/`effective_to`; hosted on `.dz` infrastructure.

## 2. UX Architecture

### Journeys
**Importer (Sofiane / Karima)**
1. Public: type product → verdict + citation → share on WhatsApp → "احسب هامشك" → calculator → soft signup (OTP only, L0).
2. Plan: create Trip (DRAFT→PLANNED) → open for demand (OPEN_FOR_DEMAND) → browse **aggregated** demand → build Buy List against 3 live meters → lock (SOURCING_LOCKED). Verification (L2-I) is requested *only* at "open for demand", with the unlock spelled out.
3. Abroad: Buy List offline-first, ≤3 taps; meters update locally; sync when online. Move to ABROAD triggers one reminder: pre-declaration on anae.dz (remind, never verify).
4. Return: CUSTOMS → LANDED; handover protocol per commitment; ledger + labels generated from the record (compute, don't ask).
5. Ugly paths: BLOCKED_AT_CUSTOMS (what was blocked, which commitments are affected, one recommended message template to traders); PARTIALLY_COMPLETED (per-commitment reconciliation); UNDER_REVIEW (what evidence admin sees, ETA, no lecturing).

**Trader (Yacine / Nadia)**
1. Post structured Sourcing Request (OPEN) → matches appear → compare importers (record count first) → Commitment PROPOSED with price band + tolerance + expiry → ACCEPTED → deposit *declared by both* (SECURED) → track → handover → 48h objection → review.
2. Ugly paths: EXPIRED offers (timer visible throughout), DISPUTED (structured evidence timeline, non-binding), WITHDRAWN (reason code public to counterpart).

**Admin (Amine)**
Queue → item workspace (all evidence in one panel) → decision + mandatory reason code + user-facing consequence → audit entry. Rule authoring → impact preview → versioned publish → rollback.

### Decision points & recovery
- Every gate is an *action gate*: the CTA stays visible, disabled state explains "يفتح لك: …" and what to upload.
- Every compliance answer carries: verdict · reason · citation · JO link · last updated · next action · disclaimer.
- Offline: drafts and queued actions get an explicit "سيُرسل عند الاتصال" state, never a spinner.
- Nothing is deleted unilaterally; withdrawals carry a reason.

### JTBD mapping
J1 → Demand Board (aggregated, committed ≫ indicated). J2 → Commitments + committed-demand emphasis. J3 → Compliance checker + Capacity Ledger + pre-declaration reminder. J4 → Reliability profile with zero supplier/margin fields (the estimate of purchase value used for the value meter is **device-local and never sent**). J5–J7 → Compare + price bands + tolerance. J8 → Queue console with risk-weighted sort.

## 3. Information Architecture

### Navigation
- **Public**: Checker · Calculator · Regulation · (Sign in). Linear, no nav bar on mobile — the checker *is* the page.
- **Importer** (bottom tabs, thumb zone): الرحلة · الطلب · الالتزامات · الرسائل · أنا. Context switcher in header: أنا أستورد / أنا أشتري (changes tabs, emphasis, accent).
- **Trader**: الخط · طلباتي · الأسعار · الرسائل · أنا.
- **Admin** (desktop, RTL): left-of-reading-direction queue rail; workspace center; evidence panel inline-end.

### Dashboard law applied
Importer Home: (1) active trip + 3 meters + trip counter → (2) يحتاج انتباهك (ranked, timers) → (3) top demand in my categories → (4) في خطر (uncommitted stock, overflow, expiring docs) → (5) recent → (6) **one** next step.
Trader Home: (1) pipeline kanban → (2) needs your decision w/ expiry → (3) new matches → (4) at risk (stalled commitments) → (5) recent → (6) one next step.
Admin: no dashboard. Queues with counts + oldest SLA age; first item pre-opened.

Surface vs bury rule: surface anything that changes a decision *this trip / this week*; bury history, settings, and vanity counts. Every number decomposes on tap or is deleted.

## 4. Design Direction — «الدفتر المختوم» (The Ruled Ledger)
Evolved from "The Manifest": a ruled, numbered trade ledger — but *never* stamps or seals (forbidden). Structure comes from rules and reference numbers, not boxes and shadows.

- **Color**: paper `oklch(0.975 0.008 80)`, ink `oklch(0.22 0.02 60)`, muted ink `oklch(0.48 0.02 60)`, rule `oklch(0.88 0.012 80)`. Anchor **deep olive** `oklch(0.42 0.07 150)` (primary actions, allowed). **Clay** `oklch(0.55 0.13 35)` (forbidden/risk). **Ochre** `oklch(0.62 0.12 75)` (conditional/warning). Saturation reserved for status; all status is icon + text + color.
- **Type**: IBM Plex Sans Arabic (AR+Latin, one family). Weights 300/400/500 for Arabic, 400/500/600 for Latin. Tabular figures on all numbers. IBM Plex Mono for references only. Arabic line-height 1.55–1.7. No letter-spacing, no uppercase, Western digits 0–9, `1 800 000 دج`.
- **Spacing**: 4px base; work surfaces 8/12; decision paths 16/24. Rules (1px) instead of cards where possible.
- **Motion**: ≤200ms opacity/transform, meters animate width 180ms, `prefers-reduced-motion` respected. Nothing decorative.
- **Data viz**: capacity meters (three, always), price *bands* as filled segments on a reference track, wilaya lists before maps. Mirrored fill direction.
- **Trust vocabulary**: verification chip (always with the "not a government approval" note), transaction count > score, "آخر تحديث" on every regulatory statement, disclaimer line on every verdict.

### Component inventory (Phase 0–1)
Ledger header (ref + status) · Capacity meter · Verdict block · Citation row · Disclaimer line · Verification chip · Demand row (committed/indicated) · Price band · Confidence chip + explainer sheet · Quantity stepper · Sticky action bar · Offline banner · Structured message template · Stepper/timeline (RTL) · Queue row.

Composition rules: one primary action per screen, in thumb zone; every composite number → tap → breakdown sheet; no fixed widths on text containers; `bdi` around every mixed-direction fragment.

## Delivered artifacts
| File | Covers (brief §7) |
|---|---|
| `Index.dc.html` | system map — start here |
| `Landing.dc.html` | 4 · AR/FR/EN |
| `Compliance Checker.dc.html` | 1, 2, 3 + WhatsApp share card |
| `Demand Board.dc.html` | 6 — the 10x screen, 3 live meters |
| `Importer App.dc.html` | 5, 7, 8 + BLOCKED_AT_CUSTOMS / PARTIALLY_COMPLETED / UNDER_REVIEW / ABROAD / CUSTOMS |
| `Importer Trust.dc.html` | 9, 10, 13 |
| `Importer Records.dc.html` | 11, 12, 14 (incl. CCP/BaridiMob) |
| `Trader App.dc.html` | 15–20 |
| `Shared Flows.dc.html` | 21–24 |
| `Admin Console.dc.html` | 25–29 (desktop, RTL) |
| `State Coverage.dc.html` | every lifecycle state of all 4 objects |
| `System States.dc.html` | empty · loading · error · offline · partial · cold-start · L0 OTP · under-review |
| `Design System.dc.html` | §10 direction + component inventory |
| `Trilingual and RTL.dc.html` | §12 — AR/FR/EN parity, bidi isolation, 6 Arabic plural forms, mirroring table |
| `Taxonomy and Entitlements.dc.html` | §5 catalog & taxonomy, entitlements, action-gating |
| `Labels and Delivery Notes.dc.html` | 12 — Art. 14 label + delivery-note generator (was missing) |
| `Compliance Checker Trilingual.dc.html` | 1 + §12 — same verdict in AR/FR/EN, real dir flip |

### Added after review (2026-09-14)
Two gaps were closed against brief §7 and §12:
1. **Art. 14 generator** was absent — labels and simplified delivery notes are a legal obligation, not a convenience. Fields are derived from the buy list (compute, don't ask); printing is blocked while the profile address is incomplete, since Art. 14 requires it.
2. **FR/EN existed only on `Landing` and the RTL spec page.** The public compliance checker — the highest-traffic, most-shared screen — was Arabic-only. Now trilingual with `dir` flip, uppercase applied to Latin labels only, and an explicit precedence note (AR/FR authoritative, EN indicative).

Both use a raised surface treatment (white cards on the warm ground) rather than the flat rules-on-paper of the earlier boards — a proposed visual uplift, not yet rolled across the set.

## Brief inconsistencies flagged
1. **Value meter vs. supplier secrecy**: to compute value headroom the app needs a purchase value. Resolution: importer-entered *estimate*, stored on device only, never transmitted; the server only receives quantities. Copy says so on the meter.
2. **"Deposit-backed" committed demand vs. no-payment rule**: kept as a *declared-by-both* record; UI never shows the platform holding it.
3. **Weight/volume caps** are not legal caps (only value is). They are the importer's transport constraints, set in the Trip Wizard — labeled "حدّك أنت" vs "الحدّ القانوني".
