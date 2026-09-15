# Feature: DNS Health Check (Single Domain)

## Metadata

| Field | Value |
|-------|--------|
| **status** | shipped |
| **phase** | - |
| **access** | free |
| **tool_id** | `dns_health` |
| **surface** | `single` |
| **last_verified_against_repo** | 2026-09-15 |

## Summary

Comprehensive IntoDNS-style DNS and mail-related diagnostics for one domain. Production feature at [dnsbunch.com](https://www.dnsbunch.com/).

## Architecture reference

Normative flow, security, engine, and invariants: **[ARCHITECTURE.md §3, §6, §8, INV-1](../../ARCHITECTURE.md)**.

- **Engine:** `DNSChecker.run_all_checks()` only ([dns_checker.py](../../../backend/dns_checker.py)).
- **Bulk/API:** same `tool_id`, different `surface` - [bulk-checker.md](../dns-health/bulk-checker.md), [ADR-001](../../ARCHITECTURE.md#adr-001-dns-health-bulk-is-a-surface-not-a-separate-tool_id).

## Request flow (summary)

Browser → `POST /api/dns/check` → Flask `POST /api/check` → engine.  
Details: [ARCHITECTURE.md §3](../../ARCHITECTURE.md#3-current-dns-health-request-flow-current).

**Code:** [route.ts](../../../frontend/src/app/api/dns/check/route.ts), [app.py](../../../backend/app.py), [useDNSAnalysis.ts](../../../frontend/src/hooks/useDNSAnalysis.ts), [DNSResultsTable.tsx](../../../frontend/src/components/DNSResultsTable.tsx).

Domain deep links: [page.tsx](../../../frontend/src/app/[...domain]/page.tsx) → `/?domain=...`.

## API

Canonical HTTP: [API.md](../../API.md).

| Surface | Method | Path |
|---------|--------|------|
| BFF | POST | `/api/dns/check` |
| Flask | GET | `/api/csrf-token` |
| Flask | POST | `/api/check` |

**Body:** `{ "domain": "example.com", "checks": ["ns", "soa", "mx", "www"] }` - `checks` optional (all categories if omitted).

**Categories:** see [ARCHITECTURE.md §8](../../ARCHITECTURE.md#8-dns-health-engine-architecture-current) and [dns_checker.py](../../../backend/dns_checker.py) `all_check_types`.

**Types:** [dns.ts](../../../frontend/src/types/dns.ts) `DNSAnalysisResult`.

## Check coverage

NS (incl. parent delegation), SOA, MX, WWW, plus optional spf/dmarc/dkim/etc. when requested.  
Human-readable sub-checks under `checks.<category>.checks[]`.  
Record reference: [DNS_RECORDS.md](../../DNS_RECORDS.md).

## Security and limits

See **[ARCHITECTURE.md §6](../../ARCHITECTURE.md#6-current-security-model-current)** (CSRF 1h, rate limit 50/300s, block 60s, CORS, domain validation).

## Client configuration

[api.ts](../../../frontend/src/services/api.ts), env: [frontend/.env.example](../../../frontend/.env.example).

## Monetization

Free, anonymous. No account required.

## Dependencies

None.

## Maintenance checklist

- [ ] Engine changes → update [DNS_RECORDS.md](../../DNS_RECORDS.md), [API.md](../../API.md), [ARCHITECTURE.md §8](../../ARCHITECTURE.md)
- [ ] Bump `last_verified_against_repo` when behavior changes

## Acceptance criteria (shipped)

- [x] BFF obtains CSRF and proxies check
- [x] Normal and advanced UI render results
- [x] Rate limit returns 429 when exceeded
