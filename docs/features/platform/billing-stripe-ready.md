# Feature: Stripe-Ready Billing

## Metadata

| Field | Value |
|-------|--------|
| **status** | planned |
| **phase** | 1 |
| **access** | pro |
| **tool_id** | `_platform` |

## Summary

Wire Stripe Checkout, Customer Portal, and webhooks in Next.js-**inactive** until first paid experiment is chosen from metrics.

## Scope

**In:** Webhook handler, customer id on user, plan enum stub.  
**Out:** Launching paid tiers without data.

## Architecture

Next.js API routes only; entitlements read plan from DB.

## Dependencies

[auth-optional-accounts.md](auth-optional-accounts.md), [entitlements-quotas.md](entitlements-quotas.md)

## Implementation checklist

- [ ] Stripe test mode products
- [ ] Webhook: subscription updated

## Acceptance criteria

- [ ] Test subscription toggles entitlement flag in DB
