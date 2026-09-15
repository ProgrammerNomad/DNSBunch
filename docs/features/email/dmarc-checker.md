# Feature: DMARC Checker

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | planned |
| **phase** | organic |
| **access** | free |
| **tool_id** | `dmarc_checker` |
| **last_reviewed** | 2026-09-15 |

## Summary

Query `_dmarc.domain` TXT, parse policy (none/quarantine/reject), alignment hints.

## Problem

TBD - align with Summary and [PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md).

## Scope

**In scope:** TBD.

**Out of scope:** None for v1 unless noted.

## User flows

- **Anonymous:** TBD.
- **Logged-in (future):** TBD.

## Architecture

Python: `_check_dmarc_record` or dedicated tool. High SEO value per [PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md).

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

Platform skeleton recommended.

## Implementation checklist

- [ ] Standalone page `/tools/dmarc-checker`
- [ ] Link from health results when `dmarc` category present

## Acceptance criteria

- [ ] Policy and rua/ruf displayed when present

## References

None for v1.
