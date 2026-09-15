# Feature: DNS Propagation

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | planned |
| **phase** | 1 |
| **access** | free |
| **tool_id** | `dns_propagation` |
| **last_reviewed** | 2026-09-15 |

## Summary

Query multiple public resolvers (Google, Cloudflare, Quad9) for a record type; show agreement %.

## Problem

See if DNS changes have propagated globally.

## Scope

**In scope:** Fixed resolver list; record type + name input.

**Out of scope:** Custom resolver input from user (abuse); continuous monitoring.

## User flows

- **Anonymous:** Enter name + type → resolver result grid.
- **Logged-in (future):** Same.

## Architecture

Python async DNS to multiple resolvers.

## Data model

None for v1.

## API

POST `/api/tools/dns_propagation` `{ "name", "type" }`.

## UI

Template **T2**, `/tools/dns-propagation`.

## Limits and abuse

Cap resolver count; rate limit.

## Monetization

Free public tier by default ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)). Paid experiments only after funnel metrics ([METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)).

## Dependencies

None for v1 unless listed elsewhere in this doc.

## Implementation checklist

- [ ] Python tool module
- [ ] T2 page + BFF proxy
- [ ] Analytics `tool_run`

## Acceptance criteria

- [ ] Each resolver row shows answers or error
- [ ] Mismatch highlighted

## References

None for v1.
