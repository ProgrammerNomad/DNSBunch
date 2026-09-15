# Feature: White-Label Reports

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | planned |
| **phase** | 3 |
| **access** | pro |
| **tool_id** | `white_label` |
| **last_reviewed** | 2026-09-15 |

## Summary

Agency branding on PDF/export (FUTURE_IDEAS monetization #14).

## Problem

Agencies want PDF with their logo for clients.

## Scope

**In scope:** Upload logo + brand color; PDF template for DNS health summary.

**Out of scope:** Full custom domain hosting.

## User flows

- **Logged-in Pro:** Configure brand on **T5** `/dashboard/reports`.

## Architecture

Store brand assets; PDF worker.

## Data model

None for v1.

## API

Brand settings CRUD authenticated.

## UI

**T5** report settings form; preview `Card`.

## Limits and abuse

Asset size limits; scan uploads.

## Monetization

Free public tier by default ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)). Paid experiments only after funnel metrics ([METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)).

## Dependencies

[export-pdf-json-csv.md](export-pdf-json-csv.md), billing.

## Implementation checklist

- [ ] Entitlement gate
- [ ] UI affordance on tool or dashboard
- [ ] Metrics event

## Acceptance criteria

- [ ] Pro user can upload logo and set brand color
- [ ] Generated PDF includes brand header on DNS health summary
- [ ] PDF generation fails gracefully when quota exceeded

## References

None for v1.
