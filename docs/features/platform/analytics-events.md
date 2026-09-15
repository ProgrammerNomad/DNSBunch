# Feature: Analytics Events

## Metadata

| Field | Value |
|-------|--------|
| **status** | planned |
| **phase** | 0 |
| **access** | both |
| **tool_id** | `_platform` |

## Summary

Lightweight per-tool metrics: views, runs, errors, return visits-without storing queried domain names in anonymous v1 aggregates.

## Scope

**In:** Server-side events from Next API routes; daily rollups by `tool_id`.  
**Out:** Full product analytics suite, third-party BI.

## Events

See [TOOL_PLUGIN_CONTRACT.md](../../TOOL_PLUGIN_CONTRACT.md): `tool_view`, `tool_run`, `tool_error`.

## Dependencies

Optional DB or log sink; can start with structured logs.

## Implementation checklist

- [ ] Event helper in Next.js
- [ ] Document fields in [METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)

## Acceptance criteria

- [ ] Funnel fields measurable per tool_id
