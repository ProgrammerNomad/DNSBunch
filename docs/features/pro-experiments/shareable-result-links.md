# Feature: Shareable Result Links

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | planned |
| **phase** | 3 |
| **access** | both |
| **tool_id** | `share_link` |
| **last_reviewed** | 2026-09-15 |

## Summary

Short-lived URL with stored result snapshot (e.g. 7 days)-FUTURE_IDEAS #2.

## Problem

Teams share one-off results without account collab.

## Scope

**In scope:** Signed URL or short id storing result snapshot TTL 7d.

**Out of scope:** Permanent public indexing of all checks.

## User flows

- **Anonymous:** Copy share link after run.
- **Logged-in (future):** Longer TTL Pro.

## Architecture

PostgreSQL or object store snapshot; Next `/r/{id}` read-only page.

## Data model

None for v1.

## API

POST create share link; GET public read.

## UI

Share `Button` on **T1/T2** results; public read-only **T2** layout.

## Limits and abuse

TTL; no secrets in snapshot; rate limit link creation.

## Monetization

Free public tier by default ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)). Paid experiments only after funnel metrics ([METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)).

## Dependencies

Object storage or DB blob; privacy policy update.

## Implementation checklist

- [ ] Entitlement gate
- [ ] UI affordance on tool or dashboard
- [ ] Metrics event

## Acceptance criteria

- [ ] Link expires; no index by default

## References

None for v1.
