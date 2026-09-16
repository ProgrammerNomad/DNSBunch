# Feature: Domain Expiry

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | shipped |
| **phase** | 1 |
| **access** | free |
| **tool_id** | `domain_expiry` |
| **last_reviewed** | 2026-09-16 |

## Summary

Days until registration expiry from WHOIS/RDAP.

## Problem

Renewal reminders start with knowing expiry.

## Scope

**In scope:** Expiry date + countdown.

**Out of scope:** Registrar API renew; alerts (Phase 3 monitoring).

## User flows

- **Anonymous:** Enter domain → expiry date and days left.
- **Logged-in (future):** Same.

## Architecture

Reuse [`tools/rdap.py`](../../../backend/tools/rdap.py).

## Data model

None for v1.

## API

POST `/api/tools/domain_expiry` `{ "domain" }`.

## UI

Template **T2**, `/tools/domain-expiry`.

## Limits and abuse

RDAP rate limits.

## Monetization

Free public tier by default ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)).

## Dependencies

Shared RDAP client with [whois-lookup.md](whois-lookup.md).

## Implementation checklist

- [x] Python tool module
- [x] T2 page + BFF proxy
- [x] Analytics `tool_run`

## Acceptance criteria

- [x] Expiry displayed or unknown explained
- [x] Past expiry flagged warn

## References

None for v1.
