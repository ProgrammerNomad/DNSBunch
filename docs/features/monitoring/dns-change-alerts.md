# Feature: DNS Change Alerts

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | planned |
| **phase** | pro |
| **access** | both |
| **tool_id** | `dns_watch` |
| **last_reviewed** | 2026-09-15 |

## Summary

Periodic re-run of health or key records; email when NS/MX/SOA serial changes.

## Problem

TBD - align with Summary and [PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md).

## Scope

**In scope:** TBD.

**Out of scope:** None for v1 unless noted.

## User flows

- **Anonymous:** TBD.
- **Logged-in (future):** TBD.

## Architecture

See [ARCHITECTURE.md §11](../../ARCHITECTURE.md#11-tool-execution-contract-current--planned). Feature-specific detail TBD.

**Reuses existing engine?** TBD.

## Data model

None for v1.

## API

TBD. Canonical reference when shipped: [API.md](../../API.md).

## UI

TBD (e.g. `frontend/src/app/tools/...`).

## Limits and abuse

TBD; follow [ARCHITECTURE.md §6](../../ARCHITECTURE.md#6-current-security-model-current) and tool-specific caps.

## Monetization

Strong Pro candidate-validate via [METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md) before SKU.

## Dependencies

[auth-optional-accounts.md](../platform/auth-optional-accounts.md), PostgreSQL, cron/queue, [dns-health-single.md](../shipped/dns-health-single.md) engine.

## Implementation checklist

- [ ] Watch CRUD
- [ ] Scheduler + diff engine
- [ ] SendGrid/email provider

## Acceptance criteria

- [ ] TBD

## References

None for v1.
