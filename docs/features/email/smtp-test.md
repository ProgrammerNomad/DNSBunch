# Feature: SMTP Test

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | planned |
| **phase** | 1 |
| **access** | free |
| **tool_id** | `smtp_test` |
| **last_reviewed** | 2026-09-15 |

## Summary

TCP connect to MX hosts, read banner, optional STARTTLS-timeout capped.

## Problem

TBD - align with Summary and [PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md).

## Scope

**In:** Banner, TLS support hint.  
**Out:** Auth, sending message body.

## User flows

- **Anonymous:** TBD.
- **Logged-in (future):** TBD.

## Architecture

Python asyncio/socket; strict timeouts and rate limits.

## Data model

None for v1.

## API

TBD. Canonical reference when shipped: [API.md](../../API.md).

## UI

TBD (e.g. `frontend/src/app/tools/...`).

## Limits and abuse

TBD; follow [ARCHITECTURE.md §6](../../ARCHITECTURE.md#6-current-security-model-current) and tool-specific caps.

## Monetization

Default free unless noted; Pro TBD per [METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md).

## Dependencies

[mx-lookup.md](mx-lookup.md) or inline MX resolve.

## Implementation checklist

- [ ] Connect to port 25/587 with timeout
- [ ] Abuse limits per IP

## Acceptance criteria

- [ ] No hung connections; errors surfaced clearly

## References

None for v1.
