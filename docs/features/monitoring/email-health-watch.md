# Feature: Email Health Watch

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | planned |
| **phase** | 3 |
| **access** | pro |
| **tool_id** | `email_health_watch` |
| **last_reviewed** | 2026-09-15 |

## Summary

Scheduled SPF/DMARC/DKIM/MX checks + optional periodic mail-tester prompts.

## Problem

Combine SPF/DMARC/DKIM/MX signals over time for a domain.

## Scope

**In scope:** Scheduled re-run email tools; diff summary alert.

**Out of scope:** Inbox placement tests.

## User flows

- **Logged-in (future):** Enable email health watch per domain.

## Architecture

Orchestrate existing tool runners; store snapshots.

## Data model

None for v1.

## API

Watch API type `email_health`.

## UI

**T5** detail view with trend badges.

## Limits and abuse

Weekly schedule free; daily Pro.

## Monetization

Free public tier by default ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)). Paid experiments only after funnel metrics ([METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)).

## Dependencies

Email tool modules, [mail-tester-inbound.md](../email/mail-tester-inbound.md), [dns-change-alerts.md](dns-change-alerts.md) infrastructure.

## Implementation checklist

- [ ] Watch model + worker job
- [ ] T5 UI CRUD
- [ ] Alert delivery channel

## Acceptance criteria


## References

None for v1.
