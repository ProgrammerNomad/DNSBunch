# Feature: Uptime Checks

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | planned |
| **phase** | 3 |
| **access** | pro |
| **tool_id** | `uptime_check` |
| **last_reviewed** | 2026-09-15 |

## Summary

HTTP(S) ping on interval; downtime alerts.

## Problem

HTTP uptime monitoring monetizes well but usage is lower - experiment only.

## Scope

**In scope:** HTTP GET watch URL; interval check; down/up alert.

**Out of scope:** Global multi-region SLA v1.

## User flows

- **Logged-in (future):** Add URL watch on dashboard.

## Architecture

Worker HTTP checks; store last status.

## Data model

None for v1.

## API

Watch API type `uptime`.

## UI

**T5** watches table with last status `Badge`.

## Limits and abuse

Min interval 5m Pro; block internal IPs in URL.

## Monetization

Free public tier by default ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)). Paid experiments only after funnel metrics ([METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)).

## Dependencies

[http-status.md](../website/http-status.md), accounts, scheduler.

## Implementation checklist

- [ ] Watch model + worker job
- [ ] T5 UI CRUD
- [ ] Alert delivery channel

## Acceptance criteria

- [ ] Watch URL checked on configured interval
- [ ] Down transition triggers alert within one interval + grace
- [ ] Private/reserved URLs rejected at watch creation

## References

None for v1.

## Note

Lower expected usage vs lookups-Pro experiment only if metrics support it.
