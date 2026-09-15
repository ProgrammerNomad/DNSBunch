# Feature: DNSBL / Blacklist Check

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | planned |
| **phase** | 1 |
| **access** | free |
| **tool_id** | `dnsbl_lookup` |
| **last_reviewed** | 2026-09-15 |

## Summary

Query major DNSBLs for domain or IP (reverse DNSBL format)-respect list provider usage policies.

## Problem

TBD - align with Summary and [PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md).

## Scope

**In scope:** TBD.

**Out of scope:** None for v1 unless noted.

## User flows

- **Anonymous:** TBD.
- **Logged-in (future):** TBD.

## Architecture

Python dnspython; configurable list set.

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

Platform rate limits.

## Implementation checklist

- [ ] IP + domain input modes
- [ ] Document which lists are queried

## Acceptance criteria

- [ ] Listed/not listed per zone with list name

## References

None for v1.
