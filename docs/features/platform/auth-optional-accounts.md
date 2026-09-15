# Feature: Optional Accounts

## Metadata

| Field | Value |
|-------|--------|
| **status** | planned |
| **phase** | 1 |
| **access** | both |
| **tool_id** | `_platform` |

## Summary

Free accounts for saved history, mail-test sessions, and higher limits-**never required** for public DNS lookups.

## Scope

**In:** Register/login, session, dashboard shell.  
**Out:** Paywall on basic lookups.

## Architecture

Next.js (NextAuth or Clerk) + PostgreSQL + Prisma; no auth in Flask for v1.

## Dependencies

None for DNS health (works without login today).

## Implementation checklist

- [ ] Schema users/sessions
- [ ] Auth routes + dashboard layout

## Acceptance criteria

- [ ] Anonymous health check unchanged when logged out
