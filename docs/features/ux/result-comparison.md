# Feature: Result Comparison

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P3 |
| **status** | planned |
| **phase** | 5 |
| **access** | free |
| **tool_id** | `compare_domains` |
| **last_reviewed** | 2026-09-15 |

## Summary

Side-by-side two domains’ health summaries (FUTURE_IDEAS #6).

## Problem

Compare two runs (domains or dates) for regressions (FUTURE_IDEAS #6).

## Scope

**In scope:** Side-by-side or diff view for DNS health results; may attach to **T1/T3**.

**Out of scope:** Arbitrary cross-tool diff v1.

## User flows

- **Anonymous:** Select two cached results in session or paste two domains sequential compare.
- **Logged-in (future):** Pick from history.

## Architecture

Client diff on `DNSAnalysisResult` JSON structure.

## Data model

None for v1.

## API

None v1.

## UI

Mode on **T1** or modal `Sheet`; shadcn two-column `Table` with changed rows highlighted.

## Limits and abuse

Client-only memory bounds.

## Monetization

Free public tier by default ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)). Paid experiments only after funnel metrics ([METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)).

## Dependencies

[dns-health-single.md](../shipped/dns-health-single.md) engine run twice.

## Implementation checklist

- [ ] Spec implemented per FRONTEND_STACK
- [ ] Document in CHANGELOG when shipped

## Acceptance criteria


## References

None for v1.
