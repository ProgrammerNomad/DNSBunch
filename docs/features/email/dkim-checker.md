# Feature: DKIM Checker

## Metadata

| Field | Value |
|-------|--------|
| **status** | planned |
| **phase** | organic |
| **access** | free |
| **tool_id** | `dkim_checker` |

## Summary

Discover common DKIM selectors and validate DNS records.

## Architecture

Python: `_check_dkim_records` logic or dedicated module. Next: `/tools/dkim-checker`.

## Dependencies

Optional [tool-registry.md](../platform/tool-registry.md).

## Implementation checklist

- [ ] Selector list + user-provided selector
- [ ] Results UI

## Acceptance criteria

- [ ] Shows record or clear missing-selector guidance
