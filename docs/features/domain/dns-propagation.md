# Feature: DNS Propagation

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | shipped |
| **phase** | 1 |
| **access** | free |
| **tool_id** | `dns_propagation` |
| **last_reviewed** | 2026-09-16 |

## Summary

Query multiple public resolvers (Google, Cloudflare, Quad9) for a record type; show agreement %.

## Problem

See if DNS changes have propagated globally.

## Scope

**In scope:** Fixed resolver list; record types A, AAAA, MX, NS, TXT, CNAME.

**Out of scope:** Custom resolver input from user (abuse); continuous monitoring.

## User flows

- **Anonymous:** Enter name + type → resolver result grid.
- **Logged-in (future):** Same.

## Architecture

Python dnspython queries to 8.8.8.8, 1.1.1.1, 9.9.9.9.

## Data model

None for v1.

## API

POST `/api/tools/dns_propagation` `{ "name", "type" }`.

## UI

Template **T2**, `/tools/dns-propagation`.

## Limits and abuse

Cap resolver count; rate limit.

## Monetization

Free public tier by default ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)).

## Dependencies

None for v1 unless listed elsewhere in this doc.

## Implementation checklist

- [x] Python tool module
- [x] T2 page + BFF proxy
- [x] Analytics `tool_run`

## Acceptance criteria

- [x] Each resolver row shows answers or error
- [x] Mismatch highlighted

## References

None for v1.
