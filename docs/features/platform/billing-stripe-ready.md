# Feature: Stripe-Ready Billing

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P1 |
| **status** | planned |
| **phase** | 3 |
| **access** | pro |
| **tool_id** | `_platform` |
| **last_reviewed** | 2026-09-15 |

## Summary

Wire Stripe Checkout, Customer Portal, and webhooks in Next.js-**inactive** until first paid experiment is chosen from metrics.

## Problem

TBD - align with Summary and [PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md).

## Scope

**In:** Webhook handler, customer id on user, plan enum stub.  
**Out:** Launching paid tiers without data.

## User flows

- **Anonymous:** TBD.
- **Logged-in (future):** TBD.

## Architecture

Next.js API routes only; entitlements read plan from DB.

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

[auth-optional-accounts.md](auth-optional-accounts.md), [entitlements-quotas.md](entitlements-quotas.md)

## Implementation checklist

- [ ] Stripe test mode products
- [ ] Webhook: subscription updated

## Acceptance criteria

- [ ] Test subscription toggles entitlement flag in DB

## References

None for v1.
