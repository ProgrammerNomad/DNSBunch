# Feature: Domain Expiry Alerts

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | planned |
| **phase** | 3 |
| **access** | pro |
| **tool_id** | `domain_expiry_watch` |
| **last_reviewed** | 2026-09-15 |

## Summary

Watch registration expiry from RDAP/WHOIS.

## Problem

Domain renewal misses are costly; alert complements domain-expiry tool.

## Scope

**In scope:** WHOIS expiry watch; email alert before expiry.

**Out of scope:** Auto-renew at registrar.

## User flows

- **Logged-in (future):** Watch from domain-expiry tool or dashboard.

## Architecture

Scheduled WHOIS/RDAP; compare expiry date.

## Data model

None for v1.

## API

Watch API type `domain_expiry`.

## UI

**T5** watches; link from **T2** domain-expiry.

## Limits and abuse

WHOIS rate limits; max watches per user.

## Monetization

Free public tier by default ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)). Paid experiments only after funnel metrics ([METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)).

## Dependencies

[domain-expiry.md](../domain/domain-expiry.md), accounts, scheduler.

## Implementation checklist

- [ ] Watch model + worker job
- [ ] T5 UI CRUD
- [ ] Alert delivery channel

## Acceptance criteria

- [ ] Alert sent at configured days-before-expiry thresholds
- [ ] Unknown expiry handled without false alerts
- [ ] Watch respects WHOIS rate limits

## References

None for v1.
