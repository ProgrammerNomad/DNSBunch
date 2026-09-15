# Feature: Bulk DNS Health Check

## Metadata

| Field | Value |
|-------|--------|
| **status** | planned |
| **priority** | P1 |
| **phase** | 1 |
| **access** | both |
| **tool_id** | `dns_health` |
| **surface** | `bulk` |
| **last_reviewed** | 2026-09-15 |

## Summary

Run the same DNS health engine on many domains; show a summary table/CSV with drill-down to the existing single-domain UI.

## Problem

Agencies and admins managing many domains need a quick pass/fail overview without running checks one by one in the browser.

## Scope

**In scope:**

- Paste or upload domain lists (phased max size)
- Rollup columns (NS/SOA/MX/WWW/overall)
- Drill-down to full [dns-health-single.md](../shipped/dns-health-single.md) result
- **No second DNS engine** (INV-1, INV-2)

**Out of scope:**

- Different diagnostic rules than single-domain health
- **Bulk 4** (100+ domains, queues, job IDs) - **[Phase 4](../../roadmap/PHASES.md)** scale work, not Phase 1

**Bulk delivery steps (this feature, Phase 1):**

| Step | Deliverable |
|------|-------------|
| Bulk 1 | Paste list (~10–50 domains), concurrency cap, summary table |
| Bulk 2 | CSV in/out |
| Bulk 3 | Row drill-down to existing single-domain UI |

**Bulk 4** (large async jobs, workers, progress, download) is documented under Phase 4 in [PHASES.md](../../roadmap/PHASES.md) and [ARCHITECTURE §22](../../ARCHITECTURE.md#22-scaling-strategy-planned).

## User flows

- **Anonymous:** Paste domains → wait for table → click row for full analysis (limits TBD)
- **Logged-in (future):** Higher limits, saved bulk jobs (TBD)

## Architecture

[ARCHITECTURE.md §9](../../ARCHITECTURE.md#9-bulk-architecture-planned), **INV-1, INV-2**, [ADR-001](../../ARCHITECTURE.md#adr-001-dns-health-bulk-is-a-surface-not-a-separate-tool_id).

```text
DNSChecker.run_all_checks()
    → analyze_domain()
    → bulk_analyze(semaphore)
    → rollup_for_bulk()
    → table / CSV / drill-down
```

| Layer | Responsibility |
|--------|----------------|
| Next.js | BFF, job UI, CSV upload/download |
| Python | Orchestration only; calls same engine per domain |

**Reuses existing engine?** yes - `DNSChecker.run_all_checks()`.

## Data model

None for v1 (phase 1–3). Phase 4: optional `bulk_jobs` table - TBD.

## API

TBD in [API.md](../../API.md) (e.g. `POST /api/dns/bulk`). Next BFF only; not direct Flask from browser.

## UI

TBD: e.g. `frontend/src/app/tools/bulk-dns-health/page.tsx` or `/bulk` - reuse results components for drill-down.

## Limits and abuse

Stricter than single-domain: max domains per request, concurrency cap, IP rate limits. Partial failure: per-domain error rows, job continues.

## Monetization

Free tier with tight caps; larger batches / async jobs as Pro experiment ([METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)).

Analytics: `{ tool_id: "dns_health", surface: "bulk" }`.

## Dependencies

Shipped [dns-health-single.md](../shipped/dns-health-single.md). Platform skeleton optional for phase 1.

## Implementation checklist

- [ ] `analyze_domain`, `bulk_analyze`, `rollup_for_bulk` in Python
- [ ] Next UI + limits
- [ ] CSV phase 2
- [ ] Document endpoints in API.md when shipped

## Acceptance criteria

- [ ] Same engine output as single domain for each row
- [ ] Bounded concurrency; stable under max free-tier batch size
- [ ] No duplicate NS/MX/SOA implementation

## References

- [bulk-checker architectural intent](../../ARCHITECTURE.md#9-bulk-architecture-planned)
