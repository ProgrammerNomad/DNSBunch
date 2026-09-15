# Feature: DKIM Checker

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | planned |
| **phase** | 1 |
| **access** | free |
| **tool_id** | `dkim_checker` |
| **last_reviewed** | 2026-09-15 |

## Summary

Discover common DKIM selectors and validate DNS records.

## Problem

Operators need to verify DKIM publication without manual dig.

## Scope

**In scope:** Selector input + domain; TXT fetch; show public key metadata and record validity.

**Out of scope:** Signing mail; automatic selector discovery across all selectors.

## User flows

- **Anonymous:** Enter domain and selector → Run → DKIM record or not found.
- **Logged-in (future):** Same.

## Architecture

Python `backend/tools/dkim_checker/`; DNS TXT.

## Data model

None for v1.

## API

POST `/api/tools/dkim_checker` `{ "domain", "selector"? }`.

## UI

Template **T2**, `/tools/dkim-checker` - selector `Input` + domain.

## Limits and abuse

Rate limits per IP; validate domain/selector charset.

## Monetization

Free public tier by default ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)). Paid experiments only after funnel metrics ([METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)).

## Dependencies

Optional [tool-registry.md](../platform/tool-registry.md).

## Implementation checklist

- [ ] Selector list + user-provided selector
- [ ] Results UI

## Acceptance criteria

- [ ] Record shown when present
- [ ] Invalid selector rejected client-side
- [ ] Clear not-found state

## References

None for v1.
