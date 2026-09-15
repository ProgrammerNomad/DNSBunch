# Feature: DNS History

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | planned |
| **phase** | 1 |
| **access** | pro |
| **tool_id** | `dns_history` |
| **last_reviewed** | 2026-09-15 |

## Summary

Timeline of detected DNS changes for watched domains.

## Problem

Troubleshoot what changed after incidents.

## Scope

**In scope:** UI for timeline/table of past records; v1 may use third-party API or stub with Pro gate.

**Out of scope:** Authoritative long-term archive operated by DNSBunch day one.

## User flows

- **Anonymous:** Free tier: limited preview or message to sign in.
- **Logged-in (future):** Pro: full history views.

## Architecture

Next + Python; external data provider (vendor TBD at implementation); store queries in DB Phase 2+.

## Data model

None for v1.

## API

POST `/api/tools/dns_history` - entitlement checked Phase 3.

## UI

Template **T2**, `/tools/dns-history` - timeline `Table`; access pro per metadata.

## Limits and abuse

Pro quota; no scraping without license.

## Monetization

Free public tier by default ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)). Paid experiments only after funnel metrics ([METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)).

## Dependencies

PostgreSQL, [dns-change-alerts.md](../monitoring/dns-change-alerts.md)

## Implementation checklist

- [ ] Python tool module
- [ ] T2 page + BFF proxy
- [ ] Analytics `tool_run`

## Acceptance criteria

- [ ] Access gate matches access: pro
- [ ] Empty history explained

## References

None for v1.
