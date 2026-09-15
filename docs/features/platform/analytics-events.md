# Feature: Analytics Events

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P1 |
| **status** | planned |
| **phase** | 0 |
| **access** | both |
| **tool_id** | `_platform` |
| **last_reviewed** | 2026-09-15 |

## Summary

Lightweight per-tool event logging from Next BFF: views, runs, errors. Privacy-conscious aggregates drive Pro experiments ([METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)).

## Problem

Without measurement, paid features are guesswork. Need funnel data before Stripe or monitoring SKUs ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)).

## Scope

**In scope:**

- Events: `tool_view`, `tool_run`, `tool_error` ([TOOL_PLUGIN_CONTRACT.md](../../TOOL_PLUGIN_CONTRACT.md))
- Fields: `tool_id`, `surface` (optional), `success`, `duration_ms`, `code`, day bucket
- v1 storage: stdout, file, or SQLite - no PII; **no domain names** in anonymous aggregate logs by default

**Out of scope:**

- Full product analytics SaaS integration (defer)
- Per-domain storage for anonymous users

## User flows

- **Anonymous:** Events emitted server-side on BFF; no UI.
- **Logged-in (future):** Optional `user_id` hash on events when account exists.

## Architecture

- Emit from [generic-tool-bff.md](generic-tool-bff.md) after proxy completes
- Optional `tool_view` from server component or client page mount on `/tools/*`
- Batch flush daily aggregates for dashboard (Phase 3)

## Data model

v1: append-only log table or file rotation. Phase 3: PostgreSQL `tool_events_daily(tool_id, day, runs, errors)`.

## API

None public. Internal writer API in Next only.

## UI

None for v1. Internal admin metrics view deferred.

## Limits and abuse

Do not log full request bodies. Sampling under load allowed (document rate if implemented).

## Monetization

Informs which Pro experiment to try; not a paid feature itself.

## Dependencies

[generic-tool-bff.md](generic-tool-bff.md) (hook point)

## Implementation checklist

- [ ] Event schema documented in TOOL_PLUGIN_CONTRACT (already) + TypeScript type
- [ ] BFF emits `tool_run` / `tool_error`
- [ ] Privacy note in PRODUCT_STRATEGY / privacy doc cross-link

## Acceptance criteria

- [ ] Each successful/failed tool proxy produces one aggregate-safe event record
- [ ] Domain strings absent from default event payload

## References

- [METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)
