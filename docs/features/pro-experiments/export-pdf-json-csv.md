# Feature: Export PDF / JSON / CSV

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | planned |
| **phase** | organic |
| **access** | both |
| **tool_id** | `export_results` |
| **last_reviewed** | 2026-09-15 |

## Summary

Download health results as JSON/CSV; PDF report for professionals (maps to FUTURE_IDEAS #2).

## Problem

TBD - align with Summary and [PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md).

## Scope

**In scope:** TBD.

**Out of scope:** None for v1 unless noted.

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

Shipped results UI; ReportLab or client-side PDF optional.

## Implementation checklist

- [ ] TBD

## Acceptance criteria

- [ ] JSON matches API response shape

## References

None for v1.
