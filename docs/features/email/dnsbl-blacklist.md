# Feature: DNSBL / Blacklist Check

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | planned |
| **phase** | 1 |
| **access** | free |
| **tool_id** | `dnsbl_lookup` |
| **last_reviewed** | 2026-09-15 |

## Summary

Query major DNSBLs for domain or IP (reverse DNSBL format)-respect list provider usage policies.

## Problem

Deliverability troubleshooting requires multi-RBL checks.

## Scope

**In scope:** Configurable small set of RBLs (e.g. zen.spamhaus.org); listed/not listed.

**Out of scope:** Delisting requests; commercial RBL API keys.

## User flows

- **Anonymous:** Enter IP or domain → table of RBL results.
- **Logged-in (future):** Same.

## Architecture

Python DNS queries to RBL zones; reverse IP encoding.

## Data model

None for v1.

## API

POST `/api/tools/dnsbl_lookup` `{ "ip" | "domain" }`.

## UI

Template **T2**, `/tools/dnsbl-lookup`.

## Limits and abuse

Cap RBL count per run; rate limit; respect RBL provider terms.

## Monetization

Free public tier by default ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)). Paid experiments only after funnel metrics ([METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)).

## Dependencies

Platform rate limits.

## Implementation checklist

- [ ] IP + domain input modes
- [ ] Document which lists are queried

## Acceptance criteria

- [ ] Each RBL row shows listed/clean/error
- [ ] Invalid IP rejected

## References

None for v1.
