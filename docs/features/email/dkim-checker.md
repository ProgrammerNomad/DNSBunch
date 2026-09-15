# Feature: DKIM Checker

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | planned |
| **phase** | organic |
| **access** | free |
| **tool_id** | `dkim_checker` |
| **last_reviewed** | 2026-09-15 |

## Summary

Discover common DKIM selectors and validate DNS records.

## Problem

TBD - align with Summary and [PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md).

## Scope

**In scope:** TBD.

**Out of scope:** None for v1 unless noted.

## User flows

- **Anonymous:** TBD.
- **Logged-in (future):** TBD.

## Architecture

Python: `_check_dkim_records` logic or dedicated module. Next: `/tools/dkim-checker`.

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

Optional [tool-registry.md](../platform/tool-registry.md).

## Implementation checklist

- [ ] Selector list + user-provided selector
- [ ] Results UI

## Acceptance criteria

- [ ] Shows record or clear missing-selector guidance

## References

None for v1.
