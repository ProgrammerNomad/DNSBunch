# Feature: Developer API Keys

## Metadata

| Field | Value |
|-------|--------|
| **status** | planned |
| **phase** | pro |
| **access** | pro |
| **tool_id** | `api_access` |

## Summary

REST API with keys, daily quotas, documented in extended [API.md](../../API.md).

## Dependencies

[internal-jwt-proxy.md](../platform/internal-jwt-proxy.md), [entitlements-quotas.md](../platform/entitlements-quotas.md), [billing-stripe-ready.md](../platform/billing-stripe-ready.md)

## Scope

Reuse `DNSChecker.run_all_checks` behind keyed endpoints-not separate DNS code.
