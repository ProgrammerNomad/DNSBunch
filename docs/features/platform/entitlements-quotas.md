# Feature: Entitlements and Quotas

## Metadata

| Field | Value |
|-------|--------|
| **status** | planned |
| **phase** | 1 |
| **access** | both |
| **tool_id** | `_platform` |

## Summary

Single `canRun(user, toolId)` used by all API routes; defaults allow anonymous free tier with IP limits.

## Scope

**In:** Helper + usage counters (optional DB).  
**Out:** Complex enterprise RBAC.

## Architecture

Next.js before proxy to Python; pass `tier` in internal JWT when implemented.

## Dependencies

[analytics-events.md](analytics-events.md) for usage logging

## Implementation checklist

- [ ] `canRun` stub (always true + IP limit)
- [ ] Extend for plan limits when Stripe live

## Acceptance criteria

- [ ] All new tool routes call `canRun`
