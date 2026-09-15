# Feature: Domain Expiry

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | planned |
| **phase** | 1 |
| **access** | free |
| **tool_id** | `domain_expiry` |
| **last_reviewed** | 2026-09-15 |

## Summary

Days until registration expiry from WHOIS/RDAP.

## Problem

Renewal reminders start with knowing expiry.

## Scope

**In scope:** Expiry date + countdown.

**Out of scope:** Registrar API renew; alerts (Phase 3 monitoring).

## User flows

- **Anonymous:** Enter domain → expiry date and days left.
- **Logged-in (future):** Same.

## Architecture

Reuse WHOIS/RDAP layer from whois tool.

## Data model

None for v1.

## API

POST `/api/tools/domain_expiry` `{ "domain" }`.

## UI

Template **T2**, `/tools/domain-expiry`.

## Limits and abuse

WHOIS rate limits.

## Monetization

Free public tier by default ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)). Paid experiments only after funnel metrics ([METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)).

## Dependencies

[whois-lookup.md](whois-lookup.md) or shared RDAP client.

## Implementation checklist

- [ ] Python tool module
- [ ] T2 page + BFF proxy
- [ ] Analytics `tool_run`

## Acceptance criteria

- [ ] Expiry displayed or unknown explained
- [ ] Past expiry flagged warn

## References

None for v1.
