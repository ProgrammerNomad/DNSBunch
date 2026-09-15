# Feature: Tool Registry (Python)

## Metadata

| Field | Value |
|-------|--------|
| **status** | planned |
| **phase** | 0 |
| **access** | both |
| **tool_id** | `_platform` |

## Summary

Central registry mapping `tool_id` → runner function and metadata (timeout, category). Enables one Flask/FastAPI router for all tools.

## Scope

**In:** `register(tool_id, runner, meta)`, dispatch by id.  
**Out:** Individual tool logic (lives in tool modules).

## Architecture

Python `backend/tools/registry.py`; health registers `DNSChecker.run_all_checks` wrapper as `dns_health`.

## Dependencies

None (platform skeleton).

## Implementation checklist

- [ ] Registry module + unit test
- [ ] Register shipped dns_health adapter

## Acceptance criteria

- [ ] New tool added by registration only, no changes to `app.py` route list explosion
