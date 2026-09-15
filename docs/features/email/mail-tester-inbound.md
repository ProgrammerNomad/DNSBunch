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

DNS-only checks cannot show what receivers actually see (headers, authentication at receive time, spam score on the real message).

## Scope

**In scope:**

- Session-bound inbound address, MIME parse, scoring, results UI
- Separate inbound service ([ARCHITECTURE §19](../../ARCHITECTURE.md#19-mail-tester-architecture-planned))

**Out of scope:**

- Outbound bulk sending, general mailbox hosting, embedding in Flask `/api/check`

## User flows

- **Anonymous:** Create session → copy address → send email → poll for score (limits TBD)
- **Logged-in (future):** History of past tests, higher quota

## Architecture

Not a standard Python tool route - dedicated inbound path:

```text
Internet SMTP → inbound SMTP service → RCPT session validation
  → raw .eml store (TTL) → scoring worker → PostgreSQL + Next.js poll/UI
```

| Layer | Responsibility |
|--------|----------------|
| Next.js | Session API, results page, poll status |
| Python (separate process) | Inbound SMTP, scoring (Rspamd/SpamAssassin optional) |
| PostgreSQL | Sessions, metadata; blob or object storage for .eml |

Full diagram: [ARCHITECTURE.md §19](../../ARCHITECTURE.md#19-mail-tester-architecture-planned).

**Reuses existing engine?** no for inbound; may **call** DNS health for related domain checks in report (TBD).

## Data model

| Store | Purpose |
|-------|---------|
| `mail_test_sessions` | id, token, user_id nullable, status, expires_at, score, created_at |
| Object storage / blob | Raw `.eml`, short TTL |

## API

TBD in [API.md](../../API.md): e.g. `POST /api/mail-test/session`, `GET /api/mail-test/[id]`. Inbound SMTP is not HTTP.

## UI

TBD: e.g. `frontend/src/app/tools/mail-test/page.tsx` - copy address, countdown, score display.

## Limits and abuse

- Reject RCPT unless session valid and unexpired
- Rate limit session creation per IP
- Short TTL on raw messages
- MX on dedicated subdomain (`mail.dnsbunch.com` or env-specific)

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
