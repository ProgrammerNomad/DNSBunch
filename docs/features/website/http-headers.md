# Feature: HTTP Headers

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | planned |
| **phase** | 1 |
| **access** | free |
| **tool_id** | `http_headers` |
| **last_reviewed** | 2026-09-15 |

## Summary

Fetch URL, display response headers (security headers highlighted).

## Problem

Inspect caching, HSTS, CSP, and related headers quickly.

## Scope

**In scope:** Single GET; header list; highlight HSTS, CSP, X-Frame-Options, etc.

**Out of scope:** Full site crawl; POST body testing.

## User flows

- **Anonymous:** Enter URL → header table with highlights.
- **Logged-in (future):** Same.

## Architecture

Python httpx with redirects cap; BFF SSRF validation.

## Data model

None for v1.

## API

POST `/api/tools/http_headers` `{ "url" }`.

## UI

Template **T2**, `/tools/http-headers`.

## Limits and abuse

SSRF deny list; max redirects 5; timeout 15s.

## Monetization

Free public tier by default ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)). Paid experiments only after funnel metrics ([METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)).

## Dependencies

None for v1 unless listed elsewhere in this doc.

## Implementation checklist

- [ ] Python tool module + SSRF tests
- [ ] T2 page + BFF proxy
- [ ] Analytics `tool_run`

## Acceptance criteria

- [ ] Status code shown
- [ ] Security headers section populated
- [ ] Invalid URL rejected

## References

None for v1.
