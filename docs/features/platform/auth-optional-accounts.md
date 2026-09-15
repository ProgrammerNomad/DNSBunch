# Feature: Optional Accounts

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P1 |
| **status** | planned |
| **phase** | 2 |
| **access** | both |
| **tool_id** | `_platform` |
| **last_reviewed** | 2026-09-15 |

## Summary

Free accounts for saved history, mail-test sessions, and higher limits-**never required** for public DNS lookups.

## Problem

Users need saved history and mail-test sessions without forcing signup for basic lookups ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)).

## Scope

**In scope:** Optional NextAuth (or Clerk) + PostgreSQL users/sessions; link runs to user when logged in.

**Out of scope:** Required login for public tools; social graph.

## User flows

- **Anonymous:** All Phase 1 tools unchanged.
- **Logged-in (future):** Sign in from header → **T5** dashboard with history.

## Architecture

Next.js auth; Prisma schema `User`, `Session`, `SavedCheck` (high level). BFF attaches optional `user_id` to events.

## Data model

None for v1.

## API

Auth routes via provider; no change to public tool JSON shape.

## UI

Template **T5**, `/dashboard` - shadcn `Tabs`, `Table` ([PHASE_UI_MAP.md](../../ux/PHASE_UI_MAP.md)).

## Limits and abuse

Session fixation protections; GDPR delete account flow documented in privacy doc.

## Monetization

Free public tier by default ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)). Paid experiments only after funnel metrics ([METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)).

## Dependencies

None for DNS health (works without login today).

## Implementation checklist

- [ ] Schema users/sessions
- [ ] Auth routes + dashboard layout

## Acceptance criteria

- [ ] Anonymous health check unchanged when logged out

## References

None for v1.
