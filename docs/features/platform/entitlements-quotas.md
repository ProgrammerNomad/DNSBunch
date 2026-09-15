# Feature: Entitlements and Quotas

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P1 |
| **status** | planned |
| **phase** | 1 |
| **access** | both |
| **tool_id** | `_platform` |
| **last_reviewed** | 2026-09-15 |

## Summary

Single `canRun(user, toolId)` used by all API routes; defaults allow anonymous free tier with IP limits.

## Problem

TBD - align with Summary and [PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md).

## Scope

**In:** Helper + usage counters (optional DB).  
**Out:** Complex enterprise RBAC.

## User flows

- **Anonymous:** TBD.
- **Logged-in (future):** TBD.

## Architecture

Next.js before proxy to Python; pass `tier` in internal JWT when implemented.

## Data model

None for v1.

## API

TBD. Canonical reference when shipped: [API.md](../../API.md).

## UI

TBD (e.g. `frontend/src/app/tools/...`).

## Limits and abuse

TBD; follow [ARCHITECTURE.md §6](../../ARCHITECTURE.md#6-current-security-model-current) and tool-specific caps.

## Monetization

Default free unless noted; Pro TBD per [METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md).

## Dependencies

[analytics-events.md](analytics-events.md) for usage logging

## Implementation checklist

- [ ] `canRun` stub (always true + IP limit)
- [ ] Extend for plan limits when Stripe live

## Acceptance criteria

- [ ] All new tool routes call `canRun`

## References

None for v1.
