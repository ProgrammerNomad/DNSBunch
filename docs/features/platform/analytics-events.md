# Feature: Analytics Events

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P1 |
| **status** | planned |
| **phase** | 0 |
| **access** | both |
| **tool_id** | `_platform` |
| **last_reviewed** | 2026-09-15 |

## Summary

Lightweight per-tool metrics: views, runs, errors, return visits-without storing queried domain names in anonymous v1 aggregates.

## Problem

TBD - align with Summary and [PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md).

## Scope

**In:** Server-side events from Next API routes; daily rollups by `tool_id`.  
**Out:** Full product analytics suite, third-party BI.

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

Optional DB or log sink; can start with structured logs.

## Implementation checklist

- [ ] Event helper in Next.js
- [ ] Document fields in [METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)

## Acceptance criteria

- [ ] Funnel fields measurable per tool_id

## References

None for v1.

## Events

See [TOOL_PLUGIN_CONTRACT.md](../../TOOL_PLUGIN_CONTRACT.md): `tool_view`, `tool_run`, `tool_error`.
