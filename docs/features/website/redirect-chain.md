# Feature: Redirect Chain

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | planned |
| **phase** | 1 |
| **access** | free |
| **tool_id** | `redirect_chain` |
| **last_reviewed** | 2026-09-15 |

## Summary

Follow redirects up to N hops; show status codes and final URL.

## Problem

Debug redirect loops and HTTP→HTTPS chains.

## Scope

**In scope:** Up to N hops (e.g. 10); method GET.

**Out of scope:** JavaScript redirects.

## User flows

- **Anonymous:** Enter URL → hop table.
- **Logged-in (future):** Same.

## Architecture

Python httpx follow redirects manually for logging each hop.

## Data model

None for v1.

## API

POST `/api/tools/redirect_chain` `{ "url" }`.

## UI

Template **T2**, `/tools/redirect-chain`.

## Limits and abuse

SSRF rules; max hops.

## Monetization

Free public tier by default ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)). Paid experiments only after funnel metrics ([METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)).

## Dependencies

None for v1 unless listed elsewhere in this doc.

## Implementation checklist

- [ ] Python tool module + SSRF tests
- [ ] T2 page + BFF proxy
- [ ] Analytics `tool_run`

## Acceptance criteria

- [ ] Each hop listed
- [ ] Loop detected message
- [ ] Final URL shown

## References

None for v1.
