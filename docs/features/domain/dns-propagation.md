# Feature: DNS Propagation

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | planned |
| **phase** | 1 |
| **access** | free |
| **tool_id** | `dns_propagation` |
| **last_reviewed** | 2026-09-15 |

## Summary

Query multiple public resolvers (Google, Cloudflare, Quad9) for a record type; show agreement %.

## Problem

TBD - align with Summary and [PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md).

## Scope

**In scope:** TBD.

**Out of scope:** None for v1 unless noted.

## User flows

- **Anonymous:** TBD.
- **Logged-in (future):** TBD.

## Architecture

Python parallel queries; maps to [FUTURE_IDEAS.md](../../../FUTURE_IDEAS.md) history/propagation themes.

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

None for v1 unless listed elsewhere in this doc.

## Implementation checklist

- [ ] TBD

## Acceptance criteria

- [ ] Per-resolver result grid

## References

None for v1.
