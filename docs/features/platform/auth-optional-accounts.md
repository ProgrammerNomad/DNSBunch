# Feature: Optional Accounts

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P1 |
| **status** | planned |
| **phase** | 1 |
| **access** | both |
| **tool_id** | `_platform` |
| **last_reviewed** | 2026-09-15 |

## Summary

Free accounts for saved history, mail-test sessions, and higher limits-**never required** for public DNS lookups.

## Problem

TBD - align with Summary and [PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md).

## Scope

**In:** Register/login, session, dashboard shell.  
**Out:** Paywall on basic lookups.

## User flows

- **Anonymous:** TBD.
- **Logged-in (future):** TBD.

## Architecture

Next.js (NextAuth or Clerk) + PostgreSQL + Prisma; no auth in Flask for v1.

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

None for DNS health (works without login today).

## Implementation checklist

- [ ] Schema users/sessions
- [ ] Auth routes + dashboard layout

## Acceptance criteria

- [ ] Anonymous health check unchanged when logged out

## References

None for v1.
