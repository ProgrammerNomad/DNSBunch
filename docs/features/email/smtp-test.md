# Feature: SMTP Test

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | planned |
| **phase** | 1 |
| **access** | free |
| **tool_id** | `smtp_test` |
| **last_reviewed** | 2026-09-15 |

## Summary

TCP connect to MX hosts, read banner, optional STARTTLS-timeout capped.

## Problem

Verify mail server responsiveness without sending mail.

## Scope

**In scope:** TCP connect, EHLO, banner capture, timeout handling.

**Out of scope:** Auth login; sending DATA; open relay full test (abuse risk).

## User flows

- **Anonymous:** Enter domain or host → Run → connection result and banner text.
- **Logged-in (future):** Same.

## Architecture

Python asyncio SMTP client; strict timeouts; no message send.

## Data model

None for v1.

## API

POST `/api/tools/smtp_test` `{ "domain" | "host" }`.

## UI

Template **T2**, `/tools/smtp-test`.

## Limits and abuse

Low concurrency per IP; short timeouts; block private IP targets.

## Monetization

Free public tier by default ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)). Paid experiments only after funnel metrics ([METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)).

## Dependencies

[mx-lookup.md](mx-lookup.md) or inline MX resolve.

## Implementation checklist

- [ ] Connect to port 25/587 with timeout
- [ ] Abuse limits per IP

## Acceptance criteria

- [ ] Banner displayed on success
- [ ] Timeout errors user-friendly
- [ ] Does not send email

## References

None for v1.
