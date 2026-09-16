# Feature: WHOIS Lookup

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | shipped |
| **phase** | 1 |
| **access** | free |
| **tool_id** | `whois_lookup` |
| **last_reviewed** | 2026-09-16 |

## Summary

Registrar, dates, nameservers via WHOIS/RDAP.

## Problem

Registration context without leaving DNSBunch.

## Scope

**In scope:** RDAP JSON via `rdap.org`; structured fields when available.

**Out of scope:** Bulk WHOIS; legal WHOIS for all TLDs guaranteed.

## User flows

- **Anonymous:** Enter domain → WHOIS fields panel.
- **Logged-in (future):** Same.

## Architecture

Python [`tools/rdap.py`](../../../backend/tools/rdap.py) + `requests`; domain validation via `normalize_domain`.

## Data model

None for v1.

## API

POST `/api/tools/whois_lookup` `{ "domain" }`.

## UI

Template **T2**, `/tools/whois-lookup`.

## Limits and abuse

RDAP rate limits; 429 surfaced to user.

## Monetization

Free public tier by default ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)).

## Dependencies

None for v1 unless listed elsewhere in this doc.

## Implementation checklist

- [x] Python tool module
- [x] T2 page + BFF proxy
- [x] Analytics `tool_run`

## Acceptance criteria

- [x] Key fields shown when available
- [x] Rate limit message on 429

## References

None for v1.
