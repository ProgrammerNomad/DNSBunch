# Feature: DNS Health Check (Single Domain)

## Metadata

| Field | Value |
|-------|--------|
| **status** | shipped |
| **priority** | P0 |
| **phase** | - |
| **access** | free |
| **tool_id** | `dns_health` |
| **surface** | `single` |
| **last_verified_against_repo** | 2026-09-15 |

## Summary

Comprehensive IntoDNS-style DNS and mail-related diagnostics for one domain. Production feature at [dnsbunch.com](https://www.dnsbunch.com/).

## Problem

Admins and developers need a single report showing NS/MX/SOA/WWW and related issues without paying for commercial tools or creating an account.

## Scope

**In scope:**

- Full or partial health check via `checks[]` filter
- Normal and advanced UI presentation
- Anonymous use with rate limits

**Out of scope:**

- Multi-domain bulk (see [bulk-checker.md](../dns-health/bulk-checker.md))
- Persistent history, accounts, API keys

## User flows

- **Anonymous:** Enter domain on home → view results table; optional deep link `/?domain=...`
- **Logged-in (future):** Same flow; optional saved history (not shipped)

## Architecture

[ARCHITECTURE.md §3, §6, §8, INV-1](../../ARCHITECTURE.md). Engine: `DNSChecker.run_all_checks()` only ([dns_checker.py](../../../backend/dns_checker.py)).

Flow: Browser → `POST /api/dns/check` → Flask `POST /api/check` → engine. Code: [route.ts](../../../frontend/src/app/api/dns/check/route.ts), [app.py](../../../backend/app.py), [useDNSAnalysis.ts](../../../frontend/src/hooks/useDNSAnalysis.ts), [DNSResultsTable.tsx](../../../frontend/src/components/DNSResultsTable.tsx), [page.tsx](../../../frontend/src/app/[...domain]/page.tsx).

**Reuses existing engine?** N/A (this is the engine surface).

## Data model

None for v1. No server-side persistence of queries or results.

## API

[API.md](../../API.md).

| Surface | Method | Path |
|---------|--------|------|
| BFF | POST | `/api/dns/check` |
| Flask | GET | `/api/csrf-token` |
| Flask | POST | `/api/check` |

Body: `{ "domain": "example.com", "checks": ["ns", "soa", "mx", "www"] }` - omit `checks` for all categories ([ARCHITECTURE §8](../../ARCHITECTURE.md#8-dns-health-engine-architecture-current)).

Types: [dns.ts](../../../frontend/src/types/dns.ts) `DNSAnalysisResult`. Records: [DNS_RECORDS.md](../../DNS_RECORDS.md).

## UI

- Template **T1** - route `/` ([PAGE_TEMPLATES.md](../../ux/PAGE_TEMPLATES.md#t1--dns-health-home))
- **CURRENT:** MUI [page.tsx](../../../frontend/src/app/page.tsx), [DNSResultsTable.tsx](../../../frontend/src/components/DNSResultsTable.tsx), [DNSResultsAdvanced.tsx](../../../frontend/src/components/DNSResultsAdvanced.tsx)
- **TARGET:** Tailwind + shadcn per [FRONTEND_STACK.md](../../ux/FRONTEND_STACK.md), global [SITE_SHELL.md](../../ux/SITE_SHELL.md)

## Limits and abuse

[ARCHITECTURE.md §6](../../ARCHITECTURE.md#6-current-security-model-current): CSRF, 50 req / 300 s / IP, 60 s block, domain validation, CORS.

## Monetization

Free, anonymous. No account required ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)).

## Dependencies

None.

## Implementation checklist

- [x] BFF CSRF proxy
- [x] Engine + UI
- [ ] On engine change: update DNS_RECORDS, API, ARCHITECTURE §8 and bump `last_verified_against_repo`

## Acceptance criteria

- [x] BFF obtains CSRF and proxies check
- [x] Normal and advanced UI render results
- [x] Rate limit returns 429 when exceeded

## References

- IntoDNS-style check parity (see root [README.md](../../../README.md))
