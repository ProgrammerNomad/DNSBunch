# Feature: Tool Registry (Python)

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

Central registry mapping `tool_id` → runner function and metadata (timeout, category). Enables one Flask/FastAPI router for all tools.

## Problem

TBD - align with Summary and [PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md).

## Scope

**In:** `register(tool_id, runner, meta)`, dispatch by id.  
**Out:** Individual tool logic (lives in tool modules).

## User flows

- **Anonymous:** TBD.
- **Logged-in (future):** TBD.

## Architecture

Python `backend/tools/registry.py`; health registers `DNSChecker.run_all_checks` wrapper as `dns_health`.

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

None (platform skeleton).

## Implementation checklist

- [ ] Registry module + unit test
- [ ] Register shipped dns_health adapter

## Acceptance criteria

- [ ] New tool added by registration only, no changes to `app.py` route list explosion

## References

None for v1.
