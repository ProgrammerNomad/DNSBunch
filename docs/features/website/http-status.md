# Feature: HTTP Status Check

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | shipped |
| **phase** | 1 |
| **access** | free |
| **tool_id** | `http_status` |
| **last_reviewed** | 2026-09-16 |

## Summary

Return status code and timing for URL.

## Problem

Simple up/down and status code check.

## Scope

**In scope:** Single URL; status + latency ms (after up to 5 redirects).

**Out of scope:** Global uptime monitoring (Phase 3).

## User flows

- **Anonymous:** Enter URL → status badge and timing.
- **Logged-in (future):** Same.

## Architecture

Python `requests` via [`url_fetch.fetch_get_with_redirect_cap`](../../../backend/tools/url_fetch.py); BFF [`validate-fetch-url`](../../../frontend/src/lib/validate-fetch-url.ts).

## Data model

None for v1.

## API

POST `/api/tools/http_status` `{ "url" }`.

## UI

Template **T2**, `/tools/http-status`.

## Limits and abuse

SSRF; timeout 15s; max 5 redirects.

## Monetization

Free public tier by default ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)). Paid experiments only after funnel metrics ([METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)).

## Dependencies

Shared `url_fetch` + BFF URL validation.

## Implementation checklist

- [x] Python tool module + SSRF tests
- [x] T2 page + BFF proxy
- [x] Analytics `tool_run`

## Acceptance criteria

- [x] Status code accurate
- [x] Timeout handled

## References

None for v1.
