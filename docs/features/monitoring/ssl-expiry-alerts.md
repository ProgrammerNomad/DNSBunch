# Feature: SSL Expiry Alerts

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | planned |
| **phase** | 3 |
| **access** | pro |
| **tool_id** | `ssl_watch` |
| **last_reviewed** | 2026-09-15 |

## Summary

Monitor HTTPS cert expiry; notify before threshold.

## Problem

Certificate expiry causes outages; proactive alerts add Pro value.

## Scope

**In scope:** Watch host:443 cert expiry; alert thresholds (30/7/1 days).

**Out of scope:** Full cert inventory for all SANs enterprise-wide.

## User flows

- **Logged-in (future):** Add SSL watch from ssl-inspector or dashboard.

## Architecture

Reuse ssl_inspector engine on schedule; store next expiry.

## Data model

None for v1.

## API

Same watch API as DNS alerts with type `ssl`.

## UI

**T5** watches list; create from **T2** ssl-inspector optional button.

## Limits and abuse

Poll interval minimum 24h free tier.

## Monetization

Free public tier by default ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)). Paid experiments only after funnel metrics ([METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)).

## Dependencies

[ssl-inspector.md](../website/ssl-inspector.md), accounts, scheduler.

## Implementation checklist

- [ ] Watch model + worker job
- [ ] T5 UI CRUD
- [ ] Alert delivery channel

## Acceptance criteria

- [ ] Alert N days before expiry

## References

None for v1.
