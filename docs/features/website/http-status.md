# Feature: HTTP Status Check

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | planned |
| **phase** | 1 |
| **access** | free |
| **tool_id** | `http_status` |
| **last_reviewed** | 2026-09-15 |

## Summary

Return status code and timing for URL.

## Problem

Simple up/down and status code check.

## Scope

**In scope:** Single URL; status + latency ms.

**Out of scope:** Global uptime monitoring (Phase 3).

## User flows

- **Anonymous:** Enter URL → status badge and timing.
- **Logged-in (future):** Same.

## Architecture

Python httpx; SSRF gate.

## Data model

None for v1.

## API

POST `/api/tools/http_status` `{ "url" }`.

## UI

Template **T2**, `/tools/http-status`.

## Limits and abuse

SSRF; timeout.

## Monetization

Free public tier by default ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)). Paid experiments only after funnel metrics ([METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)).

## Dependencies

None for v1 unless listed elsewhere in this doc.

## Implementation checklist

- [ ] Python tool module + SSRF tests
- [ ] T2 page + BFF proxy
- [ ] Analytics `tool_run`

## Acceptance criteria

- [ ] Status code accurate
- [ ] Timeout handled

## References

None for v1.
