# Feature: MX Lookup

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | planned |
| **phase** | 1 |
| **access** | free |
| **tool_id** | `mx_lookup` |
| **last_reviewed** | 2026-09-15 |

## Summary

Simple MX record list with priorities and resolved A/AAAA-lighter than full health check.

## Problem

Quick MX inspection separate from full health report.

## Scope

**In scope:** MX RRset sorted by preference; target hostnames.

**Out of scope:** SMTP banner test (use smtp-test tool).

## User flows

- **Anonymous:** Enter domain → MX table.
- **Logged-in (future):** Same.

## Architecture

Python `backend/tools/mx_lookup/`; dnspython.

## Data model

None for v1.

## API

POST `/api/tools/mx_lookup` `{ "domain" }`.

## UI

Template **T2**, `/tools/mx-lookup`.

## Limits and abuse

Rate limits per IP.

## Monetization

Free public tier by default ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)). Paid experiments only after funnel metrics ([METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)).

## Dependencies

None.

## Implementation checklist

- [ ] Tool module + page
- [ ] CTA to full DNS health check

## Acceptance criteria

- [ ] All MX rows shown with priority
- [ ] No MX case handled

## References

None for v1.
