# Feature: Scale and Async Jobs (Bulk 4)

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | planned |
| **phase** | 4 |
| **access** | both |
| **tool_id** | `_platform` |
| **last_reviewed** | 2026-09-15 |

## Summary

Async bulk DNS health and high-volume tool runs: job IDs, queues, workers, progress UI, downloadable results ([PHASES.md](../../roadmap/PHASES.md) Phase 4).

## Problem

Sync bulk (Phase 1) cannot handle 100–100k domains; need durable jobs without blocking HTTP.

## Scope

**In scope:**

- `bulk_jobs` table; job id; status polling
- Redis or DB queue; worker processes
- Extends **T3** with progress and download link
- Rate limits by plan ([entitlements-quotas.md](entitlements-quotas.md))

**Out of scope:**

- Phase 1–3 synchronous bulk (see [bulk-checker.md](../dns-health/bulk-checker.md))

## User flows

- **Anonymous:** Not supported for large jobs.
- **Logged-in (future):** Submit large list → job id → poll progress → CSV download.

## Architecture

Workers call same `bulk_analyze` orchestration ([ARCHITECTURE §9](../../ARCHITECTURE.md)). Object storage for result blobs optional.

## Data model

`bulk_jobs(id, user_id, status, domain_count, created_at, result_url)`.

## API

`POST /api/tools/dns_health` async mode returns `{ job_id }`; `GET /api/jobs/{id}` status - [API.md](../../API.md#planned-internal-tools-and-bff).

## UI

Template **T3** extended - `Progress`, job status `Badge`, download `Button`.

## Limits and abuse

Max domains per plan; worker concurrency global cap; job TTL.

## Monetization

Primary Pro upsell for agencies; free tier stays on sync bulk caps.

## Dependencies

[bulk-checker.md](../dns-health/bulk-checker.md), [entitlements-quotas.md](entitlements-quotas.md), Redis infra.

## Implementation checklist

- [ ] Queue + worker prototype
- [ ] Job API + polling BFF
- [ ] T3 progress UI

## Acceptance criteria

- [ ] 1000+ domain job completes without blocking web workers
- [ ] Failed domains recorded; job reaches terminal state

## References

- [ARCHITECTURE.md §22 scaling](../../ARCHITECTURE.md)
