# Feature: Developer API Keys

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | planned |
| **phase** | 3 |
| **access** | pro |
| **tool_id** | `api_access` |
| **last_reviewed** | 2026-09-15 |

## Summary

REST API with keys, daily quotas, documented in extended [API.md](../../API.md).

## Problem

Developers request programmatic access after web tool traction.

## Scope

**In scope:** API keys in dashboard; rate limits per key; public REST facade in Next.

**Out of scope:** Unlimited free API.

## User flows

- **Logged-in (future):** Create/revoke keys on **T5** `/dashboard/api-keys`.

## Architecture

Next validates `Authorization: Bearer`; maps to plan quotas.

## Data model

None for v1.

## API

Document public REST in API.md Phase 3 section.

## UI

**T5** keys table; masked secret shown once on create.

## Limits and abuse

Key rotation; abuse revoke; per-key rate limit.

## Monetization

Free public tier by default ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)). Paid experiments only after funnel metrics ([METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)).

## Dependencies

[internal-jwt-proxy.md](../platform/internal-jwt-proxy.md), [entitlements-quotas.md](../platform/entitlements-quotas.md), [billing-stripe-ready.md](../platform/billing-stripe-ready.md)

## Implementation checklist

- [ ] Entitlement gate
- [ ] UI affordance on tool or dashboard
- [ ] Metrics event

## Acceptance criteria

- [ ] User can create and revoke API keys from dashboard
- [ ] Requests with valid key authenticate and respect plan rate limits
- [ ] Revoked keys return 401 immediately

## References

None for v1.
