# Feature: Export PDF / JSON / CSV

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | planned |
| **phase** | 3 |
| **access** | both |
| **tool_id** | `export_results` |
| **last_reviewed** | 2026-09-15 |

## Summary

Download health results as JSON/CSV; PDF report for professionals (maps to FUTURE_IDEAS #2).

## Problem

Users want to share or archive results offline.

## Scope

**In scope:** Export buttons on **T1/T2/T3** results - JSON/CSV free; PDF Pro optional.

**Out of scope:** Branded report design (white-label separate).

## User flows

- **Anonymous:** JSON/CSV export where enabled.
- **Logged-in (future):** PDF export if Pro.

## Architecture

Client-side JSON/CSV generation; server PDF render optional.

## Data model

None for v1.

## API

None or POST generate PDF authenticated.

## UI

`DropdownMenu` on ResultsPanel - Export.

## Limits and abuse

PDF rate limit; no massive bulk export free.

## Monetization

Free public tier by default ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)). Paid experiments only after funnel metrics ([METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)).

## Dependencies

Shipped results UI; ReportLab or client-side PDF optional.

## Implementation checklist

- [ ] Entitlement gate
- [ ] UI affordance on tool or dashboard
- [ ] Metrics event

## Acceptance criteria

- [ ] JSON matches API response shape

## References

None for v1.
