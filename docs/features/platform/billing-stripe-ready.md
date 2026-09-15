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

When metrics justify a SKU, billing must not require architecture rewrite.

## Scope

**In scope:** Stripe Checkout + Customer portal wiring in Next; webhook handler; inactive until experiment flag.

**Out of scope:** Launching paid plans day one.

## User flows

- **Anonymous:** N/A.
- **Logged-in (future):** Upgrade from dashboard billing tab.

## Architecture

Stripe in Next only; webhooks update entitlements table.

## Data model

None for v1.

## API

Stripe webhooks internal; checkout session create authenticated.

## UI

Template **T5**, `/dashboard/billing` - pricing `Card`, manage subscription link.

## Limits and abuse

Verify webhook signatures; idempotent event handling.

## Monetization

Free public tier by default ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)). Paid experiments only after funnel metrics ([METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)).

## Dependencies

[auth-optional-accounts.md](auth-optional-accounts.md), [entitlements-quotas.md](entitlements-quotas.md)

## Implementation checklist

- [ ] Stripe test mode products
- [ ] Webhook: subscription updated

## Acceptance criteria

- [ ] Test subscription toggles entitlement flag in DB

## References

None for v1.
