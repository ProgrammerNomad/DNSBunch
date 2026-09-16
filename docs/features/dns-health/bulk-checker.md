# Feature: Bulk DNS Health Check

## Metadata

| Field | Value |
|-------|--------|
| **status** | shipped |
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
- **Bulk 4** (100+ domains, queues, job IDs) - **[Phase 4](../../roadmap/PHASES.md)** - see [scale-async-jobs.md](../platform/scale-async-jobs.md)

**Bulk delivery steps (Phase 1):**

| Step | Deliverable |
|------|-------------|
| Bulk 1 | Paste list (~10–50 domains), concurrency cap, summary table |
| Bulk 2 | CSV in/out |
| Bulk 3 | Row drill-down to single-domain UI |

## User flows

- **Anonymous:** Paste domains on **T3** → progress → summary table → row opens drill-down (Sheet or `/` with domain).
- **Logged-in (future):** Higher batch limits; saved bulk runs on dashboard (Phase 2+).

## Architecture

[ARCHITECTURE.md §9](../../ARCHITECTURE.md#9-bulk-architecture-planned), **INV-1, INV-2**, [ADR-001](../../ARCHITECTURE.md#adr-001-dns-health-bulk-is-a-surface-not-a-separate-tool_id).

```text
DNSChecker.run_all_checks() → analyze_domain() → bulk_analyze(semaphore) → rollup_for_bulk()
```

| Layer | Responsibility |
|--------|----------------|
| Next.js | BFF `dns_health` surface bulk, CSV, **T3** UI |
| Python | Orchestration only |

**Reuses existing engine?** Yes.

## Data model

None for Bulk 1–3. Phase 4: `bulk_jobs` table - [scale-async-jobs.md](../platform/scale-async-jobs.md).

## API

`POST /api/tools/dns_health` with `{ "surface": "bulk", "domains": ["..."] }` or dedicated bulk body - [API.md §Planned](../../API.md#planned-internal-tools-and-bff). Sync response for Phase 1; async job id Phase 4.

## UI

| UX (cross-cutting) | Spec |
|--------------------|------|
| Template | **T3** bulk table; drill-down **T1** ([PAGE_TEMPLATES.md](../../ux/PAGE_TEMPLATES.md#t3--bulk-dns-health)) |
| Route | `/tools/bulk-dns-health` ([PHASE_UI_MAP.md](../../ux/PHASE_UI_MAP.md)) |
| Components | shadcn `Textarea`, `Progress`, `Table`, optional `Sheet` |
| States | Loading, partial row failure, empty list, 429 - [STATES_AND_FEEDBACK.md](../../ux/STATES_AND_FEEDBACK.md) |
| Responsive | Mobile horizontal scroll for wide table ([SITE_SHELL.md](../../ux/SITE_SHELL.md)) |

Product **phase** (1) ≠ UX template (T3); **priority** P1 is separate in metadata.

## Limits and abuse

Max domains per request (e.g. 50 free), semaphore concurrency 10–50, IP rate limits stricter than single check. Per-domain error rows; job continues.

## Monetization

Free tier with tight caps; larger batches / async jobs as Pro experiment ([METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)). Analytics: `{ tool_id: "dns_health", surface: "bulk" }`.

## Dependencies

[dns-health-single.md](../shipped/dns-health-single.md), [generic-tool-bff.md](../platform/generic-tool-bff.md) recommended.

## Implementation checklist

- [x] `analyze_domain`, `bulk_analyze`, `rollup_for_bulk` in Python (Bulk 1)
- [x] T3 page + BFF bulk surface (Bulk 1)
- [x] CSV Bulk 2 (client-side import/export on T3)
- [x] Bulk 3 row drill-down to T1 (`/?domain=` View full)
- [x] Document endpoints in API.md when shipped

## Acceptance criteria

- [x] Same engine output as single domain for each row (Bulk 1)
- [x] Bounded concurrency under max free-tier batch size (Bulk 1)
- [x] No duplicate NS/MX/SOA implementation

## References

- [ARCHITECTURE.md §9](../../ARCHITECTURE.md#9-bulk-architecture-planned)
