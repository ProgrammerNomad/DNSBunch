# Feature: Entitlements and Quotas

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P1 |
| **status** | planned |
| **phase** | 3 |
| **access** | both |
| **tool_id** | `_platform` |
| **last_reviewed** | 2026-09-15 |

## Summary

Single `canRun(user, toolId)` used by all API routes; defaults allow anonymous free tier with IP limits.

## Problem

Pro experiments need `canRun(user, toolId)` beyond stub.

## Scope

**In scope:** Plan tiers, feature flags per tool, quota counters (daily runs, bulk size).

**Out of scope:** Paywall on basic Phase 1 free lookups.

## User flows

- **Anonymous:** Free tier limits only.
- **Logged-in (future):** Pro unlocks watches, API, larger bulk.

## Architecture

Next `canRun()` reads DB + Stripe subscription state; BFF enforces before proxy.

## Data model

Plans and usage counters in PostgreSQL when billing live; stub returns allow-all for free tools in v0.

## API

BFF returns `403` JSON `{ "allowed": false, "reason": "..." }` when quota exceeded - see [generic-tool-bff.md](generic-tool-bff.md).

## UI

Upgrade prompts on **T2/T3** via `Alert`; manage on **T5**.

## Limits and abuse

Fail closed for paid features; soft messaging for free tier 429.

## Monetization

Free public tier by default ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)). Paid experiments only after funnel metrics ([METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)).

## Dependencies

[analytics-events.md](analytics-events.md) for usage logging

## Implementation checklist

- [ ] `canRun` stub (always true + IP limit)
- [ ] Extend for plan limits when Stripe live

## Acceptance criteria

- [ ] All new tool routes call `canRun`

## References

None for v1.
