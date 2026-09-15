# Feature: Mail Tester (Inbound)

## Metadata

| Field | Value |
|-------|--------|
| **status** | planned |
| **priority** | P1 |
| **phase** | 2 |
| **access** | both |
| **tool_id** | `mail_tester` |
| **last_reviewed** | 2026-09-15 |

## Summary

User sends email to a unique address; DNSBunch receives via inbound SMTP, scores the message, and returns an actionable deliverability report (similar value to [mail-tester.com](http://www.mail-tester.com)).

## Problem

mail-tester.com-style inbound scoring is highest retention potential vs another DNS lookup.

## Scope

**In scope:** Session-bound address `@mail.dnsbunch.com`, inbound SMTP receiver, scoring worker, results UI.

**Out of scope:** Outbound bulk mail; unlimited free abuse.

## User flows

- **Anonymous:** Start session → copy address → send email → poll score on **T4**.
- **Logged-in (future):** History of tests on **T5**.

## Architecture

Separate Python SMTP ingress + worker; PostgreSQL sessions; Next polls BFF.

## Data model

| Store | Purpose |
|-------|---------|
| `mail_test_sessions` | id, token, user_id nullable, status, expires_at, score, created_at |
| Object storage / blob | Raw `.eml`, short TTL |

## API

Session create, status poll, result fetch - [API.md](../../API.md#planned-internal-tools-and-bff).

## UI

Template **T4**, `/tools/mail-tester` - `Card`, copy `Button`, `Progress`, score `Table`.

## Limits and abuse

RCPT TO session-bound; TTL expiry; rate limit new sessions per IP.

## Monetization

Generous free tier for SEO; stricter limits anonymous; Pro for history/volume ([METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)).

## Dependencies

[analytics-events.md](../platform/analytics-events.md); [auth-optional-accounts.md](../platform/auth-optional-accounts.md) optional; PostgreSQL required for sessions.

## Implementation checklist

- [ ] Subdomain MX + SPF for inbound host
- [ ] Inbound service + session API
- [ ] Scoring pipeline + UI
- [ ] Update API.md and ARCHITECTURE when shipped

## Acceptance criteria

- [ ] Test email to session address produces score within TTL
- [ ] Invalid RCPT rejected
- [ ] Inbound isolated from Flask `/api/check`

## References

- [mail-tester.com](http://www.mail-tester.com)
