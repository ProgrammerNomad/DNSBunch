# Feature: Mail Tester (Inbound)

## Metadata

| Field | Value |
|-------|--------|
| **status** | planned |
| **phase** | 2 |
| **access** | free (limited) / both |
| **tool_id** | `mail_tester` |

## Summary

User sends email to a unique address; DNSBunch receives via inbound SMTP, scores headers/SPF/DKIM/DMARC/spam, returns actionable report-similar in value to [mail-tester.com](http://www.mail-tester.com).

## Problem

DNS-only checks cannot validate what receivers actually see in a delivered message.

## Scope

**In:** Session address, inbound SMTP, MIME parse, score, results page.  
**Out:** Outbound bulk sending; mailbox hosting.

## Architecture

```text
Next.js                    Python (separate process)
  create session    →      inbound SMTP (aiosmtpd/Haraka)
  poll status       ←      RCPT TO validates session id
  results UI        ←      scoring worker (Rspamd/SpamAssassin optional)
PostgreSQL: mail_test_sessions, raw .eml (TTL)
DNS: MX mail.dnsbunch.com
```

Not bolted onto Flask `/api/check`.

## Data model (planned)

| Table | Fields |
|-------|--------|
| `mail_test_sessions` | id, token, user_id nullable, status, expires_at, score, created_at |

## Abuse

- Reject RCPT unless session valid and unexpired
- Rate limit session creation per IP
- Short TTL on raw messages

## Dependencies

[auth-optional-accounts.md](../platform/auth-optional-accounts.md) optional; [analytics-events.md](../platform/analytics-events.md)

## Implementation checklist

- [ ] Subdomain MX + SPF for inbound host
- [ ] Inbound service + session API
- [ ] Scoring pipeline + UI copy address / poll

## Acceptance criteria

- [ ] Test email to session address produces score within TTL
- [ ] Invalid RCPT rejected

## References

- [mail-tester.com](http://www.mail-tester.com)
