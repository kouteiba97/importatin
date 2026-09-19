# ADR-003 — Authentication and session model

**Status:** 🔒 LOCKED
**Date:** 14 September 2026

---

## Context

The approved `Onboarding` flow is **phone → 6-digit OTP → profile → capability selection**. There
is no password field anywhere in the 24-screen deck, and no email address is ever collected.

Capability and verification level gate the legal invariants. An expired import authorisation must
stop trip publication *immediately*; an admin suspension must bite on the next request.

## Decision

**Passwordless phone + OTP. Opaque server-side sessions in PostgreSQL. No JWT.**

| Element | Locked value |
|---|---|
| Identity | E.164 phone number, `citext`, one live owner |
| Credential | 6-digit OTP from a CSPRNG, `sha256(code + per-challenge salt)` stored |
| OTP lifetime | 5 minutes · 5 attempts, then the challenge is burned |
| Session token | 256-bit random, `sha256` stored — **never the token itself** |
| Cookie | `__Host-mb_session` · `HttpOnly` · `Secure` · `SameSite=Lax` · path `/` |
| Expiry | 30-day sliding, 90-day absolute |
| CSRF | Double-submit token **plus** `Origin` / `Sec-Fetch-Site` check on unsafe methods |
| Revocation | Per-session, per-user mass revoke, automatic on phone change and suspension |
| Rate limits | 3 OTP/phone/hour · 10/IP/hour · 30/phone/day · 20 session creates/IP/hour |

---

## Why not JWT

This is the decision most likely to be second-guessed, so the reasoning is explicit.

A JWT is a **cached copy of authorization facts**. In Maabar the facts being cached are precisely
the ones that must never be stale:

- `capabilities` — which determine whether a listing insert is even attempted
- derived verification level — which expires *on a date*, unattended, when a licence lapses
- account suspension — an admin action that must take effect now

A 15-minute access token means a suspended trader keeps acting for up to 15 minutes, and an
importer whose general authorisation expired at midnight keeps publishing trips until their token
rolls over. Both are regulatory exposure for a real person, not a UX blemish.

The standard rebuttal is a short TTL plus a denylist. A denylist is a database read on every
request — which is exactly what an opaque session costs, with more moving parts and two sources of
truth.

The cost of opaque sessions is one indexed read per authenticated request (`sessions.token_hash`,
unique index, single-row). At Maabar's volumes that is not measurable. Correctness wins.

Session listing and per-device revocation are also stated product requirements, and both are
natural with server-side sessions and awkward with JWT.

---

## SIM-swap — the real threat

Phone-only identity means whoever ports the number owns the account. Mitigations, graduated by what
the account can do:

1. **New-device cooldown.** From a device with no history for this account, high-impact actions are
   held 24 hours: publishing a trip, accepting a commitment, changing the phone number, resubmitting
   KYC. Browsing and messaging stay available, and the user is told why.
2. **Dual-number OTP on phone change**, plus notification to the old number and every live session.
3. **Device-continuity signal** into the admin risk queue — the `Admin Console` evidence panel
   already shows "accounts from the same device", so the fingerprint exists in the design.
4. **Step-up OTP** for any KYC change, regardless of session age.
5. **No self-service recovery that bypasses the phone.** A lost-number case goes to the
   `trust_safety` queue with document re-verification and is decided with a reason like any other.

---

## Alternatives considered

**Phone + password.** Rejected: not in the design, and it adds a credential store, reset flows,
and reuse/stuffing exposure for no gain.

**Email + magic link.** Rejected: no email address is collected anywhere in the product.

**JWT access + refresh pair.** Rejected — see above.

**WebAuthn passkeys.** Deferred to V1 as a *second* factor for L2 accounts. It would add an
enrolment flow the design does not draw, and it cannot be the primary factor when the primary
identity is a phone number.

---

## Trade-offs

| Cost | Accepted because |
|---|---|
| One database read per authenticated request | Single-row indexed lookup; it is what correctness costs here |
| Sessions are stateful — horizontal scaling needs shared session storage | They live in Postgres, which every node already shares |
| SMS delivery cost and reliability in Algeria | OTP is the **only** SMS the product sends (ADR ties to NOTIFICATIONS) |
| No offline token validation | Not a requirement; every protected action is online anyway |

---

## Consequences

1. `sessions` stores a hash, so a database dump does not hand over live sessions.
2. Every request resolves the session and re-reads live capability and verification. That read is
   the enforcement point for the entire authorization model (ADR-004).
3. SMS gateway selection, cost and sender-ID registration is `UNKNOWN — REQUIRES DECISION` (U7) and
   blocks real OTP delivery in Phase 1. A console stub ships for development.
4. If session reads ever contend measurably, the fix is a cache in front of the same table — not a
   token format change.
