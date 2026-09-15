# Feature: Bulk DNS Health Check

## Metadata

| Field | Value |
|-------|--------|
| **status** | planned |
| **phase** | 1 |
| **access** | free (limits); pro at scale |
| **tool_id** | `dns_health` |
| **surface** | `bulk` |

## Summary

Run the same DNS health engine on many domains; summary table/CSV with drill-down to single-domain UI.

## Architecture reference

**Normative bulk design:** [ARCHITECTURE.md §9](../../ARCHITECTURE.md#9-bulk-architecture-planned) and **INV-1, INV-2**.

```text
DNSChecker.run_all_checks()
    → analyze_domain()
    → bulk_analyze(semaphore)
    → rollup_for_bulk()
    → table / CSV / drill-down
```

No second DNS engine. Partial per-domain failures allowed.

## API (planned)

Next BFF only. Endpoints TBD in [API.md](../../API.md) when implemented (e.g. `POST /api/dns/bulk`).

## Phases

| Phase | Deliverable |
|-------|-------------|
| 1 | Paste list, concurrency cap, summary table |
| 2 | CSV in/out |
| 3 | Drill-down to [dns-health-single.md](../shipped/dns-health-single.md) UI |
| 4 | Pro: queued jobs, large lists |

## Analytics (planned)

`{ tool_id: "dns_health", surface: "bulk" }` per [ADR-001](../../ARCHITECTURE.md#adr-001-dns-health-bulk-is-a-surface-not-a-separate-tool_id).

## Dependencies

Shipped [dns-health-single.md](../shipped/dns-health-single.md). Platform skeleton optional for phase 1.

## Implementation checklist

- [ ] `analyze_domain`, `bulk_analyze`, `rollup_for_bulk` in Python
- [ ] Next UI + limits
- [ ] CSV phase 2

## Acceptance criteria

- [ ] Same engine output as single domain for each row
- [ ] Bounded concurrency; stable under max free tier batch size
