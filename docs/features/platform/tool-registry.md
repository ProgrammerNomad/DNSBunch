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

Central registry mapping `tool_id` → async runner and metadata (category, timeout_ms). Enables one internal router to dispatch all Python tools without growing `app.py` route lists.

## Problem

Without a registry, each new tool adds bespoke Flask routes and duplicate validation. That blocks the plugin model in [TOOL_PLUGIN_CONTRACT.md](../../TOOL_PLUGIN_CONTRACT.md).

## Scope

**In scope:**

- `register(tool_id, runner, meta)` and `get(tool_id)`
- Metadata: `category`, `timeout_ms`, `title` (for future T6 hub)
- Register shipped `dns_health` adapter wrapping `DNSChecker.run_all_checks`

**Out of scope:**

- Individual tool business logic (lives in `backend/tools/<tool_id>/`)
- HTTP routing (internal JWT layer + Flask blueprint)
- PostgreSQL

## User flows

- **Anonymous:** N/A (server-side only).
- **Logged-in (future):** N/A.

## Architecture

- Module: `backend/tools/registry.py`
- Startup: register `dns_health` from `backend/tools/dns_health/`
- Dispatch: internal handler resolves `tool_id`, enforces timeout, calls runner
- See [ARCHITECTURE.md §11](../../ARCHITECTURE.md#11-tool-execution-contract-current--planned)

## Data model

None for v1.

## API

No public browser API. Internal dispatch only - see [API.md §Planned internal tools](../../API.md#planned-internal-tools-and-bff).

## UI

None for v1. Registry metadata later feeds **T6** `/tools` card grid ([PHASE_UI_MAP.md](../../ux/PHASE_UI_MAP.md)).

## Limits and abuse

Registry enforces per-tool `timeout_ms`; default cap 30s align with `NEXT_PUBLIC_API_TIMEOUT`).

## Monetization

N/A (platform).

## Dependencies

None.

## Implementation checklist

- [ ] `registry.py` + unit tests (unknown id raises)
- [ ] Register `dns_health` adapter
- [ ] Wire internal route to registry dispatch

## Acceptance criteria

- [ ] Adding a tool requires registration + module only, not new public Flask `/api/check` variants
- [ ] `dns_health` via registry matches current `/api/check` JSON for same input

## References

- [internal-jwt-proxy.md](internal-jwt-proxy.md)
- [generic-tool-bff.md](generic-tool-bff.md)
