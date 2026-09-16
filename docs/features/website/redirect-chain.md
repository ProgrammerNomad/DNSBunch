# Feature: Redirect Chain

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | shipped |
| **phase** | 1 |
| **access** | free |
| **tool_id** | `redirect_chain` |
| **last_reviewed** | 2026-09-16 |

## Summary

Follow redirects up to N hops; show status codes and final URL.

## Problem

Debug redirect loops and HTTP→HTTPS chains.

## Scope

**In scope:** Up to **5** hops; method GET.

**Out of scope:** JavaScript redirects.

## User flows

- **Anonymous:** Enter URL → hop table.
- **Logged-in (future):** Same.

## Architecture

Python `requests` via shared [`url_fetch.fetch_redirect_chain`](../../../backend/tools/url_fetch.py); BFF [`validate-fetch-url`](../../../frontend/src/lib/validate-fetch-url.ts).

## Data model

None for v1.

## API

POST `/api/tools/redirect_chain` `{ "url" }`.

## UI

Template **T2**, `/tools/redirect-chain`.

## Limits and abuse

SSRF rules; max **5** hops; timeout 15s.

## Monetization

Free public tier by default ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)). Paid experiments only after funnel metrics ([METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)).

## Dependencies

Shared URL fetch + SSRF validation (`url_fetch`, BFF mirror).

## Implementation checklist

- [x] Python tool module + hop/loop tests
- [x] T2 page + BFF proxy
- [x] Analytics `tool_run`

## Acceptance criteria

- [x] Each hop listed
- [x] Loop detected message
- [x] Final URL shown

## References

None for v1.
