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

TBD - align with Summary and [PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md).

## Scope

Reuse `DNSChecker.run_all_checks` behind keyed endpoints-not separate DNS code.

## User flows

- **Anonymous:** TBD.
- **Logged-in (future):** TBD.

## Architecture

See [ARCHITECTURE.md §11](../../ARCHITECTURE.md#11-tool-execution-contract-current--planned). Feature-specific detail TBD.

**Reuses existing engine?** TBD.

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

[internal-jwt-proxy.md](../platform/internal-jwt-proxy.md), [entitlements-quotas.md](../platform/entitlements-quotas.md), [billing-stripe-ready.md](../platform/billing-stripe-ready.md)

## Implementation checklist

- [ ] TBD

## Acceptance criteria

- [ ] TBD

## References

None for v1.
