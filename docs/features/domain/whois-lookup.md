# Feature: WHOIS Lookup

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | planned |
| **phase** | 1 |
| **access** | free |
| **tool_id** | `whois_lookup` |
| **last_reviewed** | 2026-09-15 |

## Summary

Registrar, dates, nameservers via WHOIS/RDAP.

## Problem

Registration context without leaving DNSBunch.

## Scope

**In scope:** WHOIS text or structured fields where library supports.

**Out of scope:** Bulk WHOIS; legal WHOIS for all TLDs guaranteed.

## User flows

- **Anonymous:** Enter domain → WHOIS fields panel.
- **Logged-in (future):** Same.

## Architecture

Python whois library; rate limit heavily.

## Data model

None for v1.

## API

POST `/api/tools/whois_lookup` `{ "domain" }`.

## UI

Template **T2**, `/tools/whois-lookup`.

## Limits and abuse

Strict rate limits; cache responses short TTL optional.

## Monetization

Free public tier by default ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)). Paid experiments only after funnel metrics ([METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)).

## Dependencies

None for v1 unless listed elsewhere in this doc.

## Implementation checklist

- [ ] Python tool module
- [ ] T2 page + BFF proxy
- [ ] Analytics `tool_run`

## Acceptance criteria

- [ ] Key fields shown when available
- [ ] Rate limit message on 429

## References

None for v1.

## Note

May cross-promote WhoisExtractor; keep DNSBunch read-only lookup.
