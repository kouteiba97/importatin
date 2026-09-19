# Maabar — Admin Architecture

The `Admin Console` artboard is the only desktop layout in the deck (1240×840) and the only
`tier-admin` surface. Its structure is a specification for a *reusable primitive*, not for five
separate tools.

---

## 1. The one pattern

```
Queue → Evidence → Decision → Mandatory reason → User-facing consequence → Immutable audit
```

`DESIGN-AUDIT.md` §4 justifies building this once: *"All five share the queue → evidence →
decision → reason → consequence → audit layout already drawn for verification. Only the evidence
panel contents differ."*

So the architecture is: **one queue engine, one decision engine, one audit writer, and a
per-queue evidence provider.** Adding a sixth queue means writing an evidence provider and a set
of reason codes — no new screens, no new decision plumbing, no new audit path.

```
┌──────────────┬───────────────────────────┬──────────────────────────┐
│ QUEUE GROUPS │ ROWS (the claimed queue)  │ EVIDENCE + DECISION      │
│              │                           │                          │
│ Trust&Safety │ VER-26-0881  19h  high    │ ┌ evidence (per queue) ┐ │
│  verification│ VER-26-0884  11h  mid     │ │ documents · signals  │ │
│  risk        │ VER-26-0886   6h  low     │ │ context · history    │ │
│  moderation  │                           │ └──────────────────────┘ │
│  disputes    │                           │ ┌ decision (shared) ───┐ │
│ Compliance   │                           │ │ action               │ │
│  categories  │                           │ │ reason  (MANDATORY)  │ │
│  rules       │                           │ │ consequence preview  │ │
│ Billing      │                           │ └──────────────────────┘ │
│  subscript.  │                           │                          │
└──────────────┴───────────────────────────┴──────────────────────────┘
```

**Billing sits in its own group.** The artboard's source says why: *"A subscription payment must
never appear beside goods-related work, or the console implies Maabar settles trade."* The visual
separation is a legal-positioning decision, so it is structural — `billing` is a separate schema,
a separate admin role, and a separate group in the navigation.

---

## 2. Queues

| Queue | Group | Subject | Role | SLA | Evidence |
|---|---|---|---|---|---|
| `verification` | Trust & Safety | `verification_cases` | `trust_safety` | 24 h | Documents with validity, identity signals, context, history |
| `risk` | Trust & Safety | `users` | `trust_safety` | 4 h | Device clustering, velocity, reports, linked accounts |
| `moderation` | Trust & Safety | listings, messages, reviews | `moderation` | 12 h | Content, reporter statements, author history |
| `disputes` | Trust & Safety | `disputes` | `disputes` | 3 days | Evidence bundle, terms version, conversation, handover photos |
| `category_review` | Compliance | `compliance_items` | `compliance` | 2 days | Current verdict, rule version, sample listings |
| `rule_publication` | Compliance | `regulatory_rule_versions` | `regulatory` | — | Diff, source citation, **impact preview** |
| `billing_receipts` | Billing | `billing.payment_attempts` | `billing` | 1 business day | Receipt image, amount, reference, plan |

Counts and SLA strings match the artboard ("14 · أقدم بند: 19 ساعة · الحدّ 24"). SLA is
`sla_due_at` on the row, computed at submission from a per-queue target, and the queue sorts by
risk band then age — the artboard shows a 19-hour item ranked above a 1-hour item.

---

## 3. Claiming — two admins, one case

The brief names this concurrency case explicitly.

```sql
UPDATE app.verification_cases
   SET assigned_admin_id = $admin, assigned_at = now(), state = 'under_review'
 WHERE id = $case AND assigned_admin_id IS NULL
RETURNING id;
```

Zero rows means someone else claimed it; the UI shows who and offers a read-only view. Claims
expire after 30 minutes of inactivity and return to the queue with an audit entry. A claim is not
a lock on the decision — the decision itself re-checks the claim inside its transaction.

---

## 4. Evidence providers

One interface, one implementation per queue. This is where the queues actually differ.

```ts
interface EvidenceProvider<TSubject> {
  panels(subjectId: string, admin: AdminContext): Promise<EvidencePanel[]>;
}
type EvidencePanel =
  | { kind: 'documents'; items: { label_key; status; meta_key; viewUrl? }[] }
  | { kind: 'signals';   items: { label_key; value; tone }[] }
  | { kind: 'context';   rows:  { label_key; value }[] }
  | { kind: 'history';   rows:  { what_key; when; by }[] }
  | { kind: 'content';   media: MediaRef[]; text?: string }
  | { kind: 'diff';      before: unknown; after: unknown }
  | { kind: 'impact';    affected: { type; count; sample[] }[] };
```

The verification provider returns exactly what the artboard draws:

| Panel | Contents (from `Admin Console`) |
|---|---|
| `documents` | National ID "matches the liveness photo"; ANAE card "valid until 06/2027"; general authorisation "valid until 06/2027"; CASNOS "image unclear" — with a per-document `viewUrl` that mints a 120-second signed URL **and writes an audit row first** |
| `signals` | Account age · **accounts from the same device** · reports · name match across documents |
| `context` | Requested role · wilaya · confirmed transactions · disputes |
| `history` | "Level 1 approved, 4 months ago, ADM-002" · "clearer document requested — CASNOS, 9 days ago, ADM-014" · "documents resubmitted, 19 hours ago, by the user" |

The history panel is a read of `audit_log` filtered to the subject's stream, which is why the
audit record must carry actor identity and a human-readable action.

**Role gating inside the panel:** a `moderation` admin opening a listing case never receives a
`documents` panel with KYC `viewUrl`s. The provider is selected by queue, and the panel contents
are filtered by the admin's role — two independent checks.

---

## 5. Decisions

```ts
interface Decision {
  queue: QueueKey;
  subjectId: string;
  action: string;                     // per-queue: approve | request_document | reject | …
  reasonCode: string;                 // MANDATORY, from decision_reasons
  reasonText?: string;                // required when the code is `other`
  supersedesDecisionId?: string;      // corrections reference, never edit (AD-024)
}
```

Every decision, in one transaction:

1. Insert `admin_decisions` including the **stored** `user_facing_consequence`.
2. Apply the domain effect (approve a document, publish a listing, resolve a dispute, activate a
   subscription).
3. Recompute anything derived — verification level, `listing_eligible`, reputation facts.
4. Insert `audit_log`.
5. Insert outbox events for notification.

### 5.1 The reason is not optional

`reason_code` is `NOT NULL` and foreign-keyed to `decision_reasons`. The artboard lists the
verification set: documents complete and matching · document missing or illegible · name conflict
across documents · needs supervisor review. Reason codes are a lookup table, not an enum, so the
trust team extends them without a deploy (`DATABASE-DESIGN.md` §1).

### 5.2 The consequence is stored, not generated

The artboard previews exactly what the user will be told:

| Action | Consequence shown and stored |
|---|---|
| Approve | "Promoted to verified importer; may publish a trip and receive requests. Notified." |
| Request document | "Receives a request for a clearer document with the reason, and **stays in the queue without restarting**." |
| Reject | "Receives the rejection with the reason and the right to resubmit after correcting the document." |

Storing it means the record answers "what was this person told?" years later, even if the message
template changes. Generating it at display time would let a copy edit rewrite history.

### 5.3 Corrections

An admin who decides wrongly records a **new** decision with `supersedes_decision_id`. Both
remain. The user sees the correction with its reason. `admin_decisions` has no `UPDATE` or
`DELETE` grant (AD-024, AD-048).

---

## 6. Admin identity and separation of duty

Separate from user capabilities (`DOMAIN-MODEL.md` §7.1): admin power is granted, never declared.

| Requirement | Rule |
|---|---|
| MFA | Mandatory (TOTP or WebAuthn). No admin session without it |
| Session | Shorter than a user session: 8 h absolute, 30 min idle |
| Network | Admin routes optionally IP-restricted in production |
| Reference | `ADM-NNN`, shown in every history entry |
| Least privilege | One role per function; `superadmin` grants roles but **cannot decide queue items** |
| Rule approval | Approver ≠ drafter, enforced by a database CHECK |
| KYC access | `trust_safety` only, audited per view, reported weekly to the trust lead |
| Own-account actions | An admin cannot decide a case concerning themselves or a linked account |

The two separations — granter ≠ decider, drafter ≠ approver — exist so that no single compromised
admin account can both escalate itself and use the escalation (`SECURITY-ARCHITECTURE.md` T16).

---

## 7. Per-queue actions

| Queue | Actions |
|---|---|
| `verification` | `approve` · `request_document` · `reject` · `escalate` |
| `risk` | `clear` · `restrict` · `suspend` · `require_reverification` |
| `moderation` | `approve` · `reject` · `takedown` · `warn_author` · `remove_review` |
| `disputes` | `request_evidence` · `decide_for_claimant` · `decide_for_respondent` · `decide_partial` · `record_only` |
| `category_review` | `confirm_verdict` · `change_verdict` · `escalate_to_rule_change` |
| `rule_publication` | `approve` · `reject` · `schedule` |
| `billing_receipts` | `confirm` · `reject` · `request_clearer_receipt` |

Dispute outcomes mirror the user-side choices in `Dispute.WANTS` — replacement, partial
settlement, record only — because the decision must be expressible in the terms the claimant
asked in.

---

## 8. Desktop-only, and why that is fine for now

The admin console is the single desktop layout in the deck; everything else is mobile-first
(`DESIGN-AUDIT.md` §12 lists desktop layouts for the rest as P1). Admin work is document review
on a large screen, so this is a correct scoping decision rather than a gap.

Consequences: the admin bundle is a separate route group with its own code split, does not ship to
the mobile app shell, uses `tier-admin` density (9px padding, 8px gaps) and tables rather than
cards, and **never uses the commercial accent colour** — `tokens.css` reserves terracotta for the
public tier and bans it from compliance and admin surfaces, so a moderation screen can never look
like a shop.

---

## 9. Analytics and reporting — explicitly deferred

`DESIGN-AUDIT.md` §4 and §12 put analytics at P2 with metrics specified but screens undrawn.
Operational counters that the queues themselves need — queue depth, SLA breaches, decisions per
admin, KYC access frequency — are **not** analytics; they are controls, and they ship with the
console. Market-health analytics waits for its screens.
