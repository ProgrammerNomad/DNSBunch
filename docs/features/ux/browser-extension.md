# Feature: Browser Extension

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P3 |
| **status** | planned |
| **phase** | 5 |
| **access** | free |
| **tool_id** | `browser_extension` |
| **last_reviewed** | 2026-09-15 |

## Summary

Quick DNS check from toolbar (FUTURE_IDEAS #8).

## Problem

Quick check from browser toolbar (FUTURE_IDEAS #8).

## Scope

**In scope:** MV3 extension opens DNSBunch tool or runs check via public BFF.

**Out of scope:** Extension store launch day one.

## User flows

- **Anonymous:** Click extension → popup with domain from active tab → open results on DNSBunch.

## Architecture

Thin extension; API calls same-origin or API keys Phase 3.

## Data model

None for v1.

## API

Reuse `/api/dns/check` or tool BFF with CORS policy decision documented.

## UI

Extension popup minimal shadcn-not applicable - HTML + brand; links to **T1**.

## Limits and abuse

Extension obeys same rate limits via server.

## Monetization

Free public tier by default ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)). Paid experiments only after funnel metrics ([METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)).

## Dependencies

Public API or extension calling dnsbunch.com.

## Implementation checklist

- [ ] Spec implemented per FRONTEND_STACK
- [ ] Document in CHANGELOG when shipped

## Acceptance criteria


## References

None for v1.
