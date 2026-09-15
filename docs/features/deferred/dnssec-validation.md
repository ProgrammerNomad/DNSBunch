# Feature: DNSSEC Validation (deferred)

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P3 |
| **status** | deferred |
| **phase** | 1 |
| **access** | free |
| **tool_id** | `dnssec_checker` |
| **last_reviewed** | 2026-09-15 |

## Summary

Validate DNSSEC chain of trust for a domain ([DNS_RECORDS.md](../../DNS_RECORDS.md) §15). Deferred until scoped post core toolbox.

## Problem

DNSSEC checks are specialized; demand unproven vs DMARC/SPF volume.

## Scope

**In scope (when activated):** DS/DNSKEY validation UI on **T2** `/tools/dnssec`.

**Out of scope:** Until status moves to planned - no implementation.

## User flows

- **Anonymous:** N/A until shipped.
- **Logged-in (future):** N/A until shipped.

## Architecture

Python DNSSEC validator module; likely reuse resolver infra from propagation tool.

## Data model

None for v1.

## API

Deferred - will use generic BFF when planned.

## UI

Template **T2** when activated - see [PHASE_UI_MAP.md](../../ux/PHASE_UI_MAP.md).

## Limits and abuse

Standard rate limits when built.

## Monetization

Free lookup expected.

## Dependencies

DNS health engine optional overlap.

## Implementation checklist

- [ ] Revisit when FUTURE_IDEAS #15 prioritized

## Acceptance criteria

- [ ] N/A deferred

## References

- FUTURE_IDEAS #15
