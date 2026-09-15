# Feature: DMARC Checker

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | planned |
| **phase** | 1 |
| **access** | free |
| **tool_id** | `dmarc_checker` |
| **last_reviewed** | 2026-09-15 |

## Summary

Query `_dmarc.domain` TXT, parse policy (none/quarantine/reject), alignment hints.

## Problem

High SEO demand for DMARC validation; operators need policy at a glance.

## Scope

**In scope:** TXT at `_dmarc`; parse tags p, sp, adkim, aspf, rua, ruf, pct.

**Out of scope:** Aggregate report ingestion; mailbox verification for rua.

## User flows

- **Anonymous:** Enter domain → Run → policy table and raw record.
- **Logged-in (future):** Same.

## Architecture

Python `backend/tools/dmarc_checker/` or extract from dns_checker DMARC check.

## Data model

None for v1.

## API

POST `/api/tools/dmarc_checker` `{ "domain" }`.

## UI

Template **T2**, `/tools/dmarc-checker`.

## Limits and abuse

Standard IP limits.

## Monetization

Free public tier by default ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)). Paid experiments only after funnel metrics ([METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)).

## Dependencies

Platform skeleton recommended.

## Implementation checklist

- [ ] Standalone page `/tools/dmarc-checker`
- [ ] Link from health results when `dmarc` category present

## Acceptance criteria

- [ ] Policy p= displayed
- [ ] rua/ruf URIs listed when present
- [ ] Missing DMARC shows actionable message

## References

None for v1.
