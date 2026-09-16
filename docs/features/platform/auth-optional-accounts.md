# Feature: Optional Accounts

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P1 |
| **status** | partial |
| **phase** | 2 |
| **access** | both |
| **tool_id** | `_platform` |
| **last_reviewed** | 2026-09-16 |

## Summary

Free **passwordless** accounts (social OAuth + email magic link) for dashboard and future saved history - **never required** for public DNS lookups.

## Problem

Users need saved history and mail-test sessions without forcing signup for basic lookups ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)).

## Scope

**In scope (slice 1 - shipped):** Auth.js v5 + Prisma + PostgreSQL; Google OAuth; optional GitHub; Nodemailer magic link; `/sign-in`, `/dashboard` (T5); BFF `auth()` + optional `user_id_hash` in tool analytics.

**Out of scope (slice 1):** Passwords, Credentials provider, Stripe, entitlements, writing `SavedCheck` rows, mail tester sessions.

**Policy:** **Passwordless only** - no username/password fields, no local password storage.

## User flows

- **Anonymous:** All Phase 1 tools unchanged; `canRun()` allows free tools without login.
- **Logged-in:** Header → Sign in → social or email link → **T5** `/dashboard` (Overview + Saved checks empty state).

## Architecture

- Next.js: [`frontend/src/auth.ts`](../../../frontend/src/auth.ts), Prisma adapter, **database sessions**.
- DB: self-hosted PostgreSQL on VPS (`DATABASE_URL`); migrations in [`frontend/prisma/`](../../../frontend/prisma/).
- BFF: [`POST /api/tools/[toolId]`](../../../frontend/src/app/api/tools/[toolId]/route.ts) calls `auth()` and `canRun(session?.user, toolId)`.

## Data model

Prisma: `User`, `Account`, `Session`, `VerificationToken`, `SavedCheck` (stub table only).

## API

| Route | Purpose |
|-------|---------|
| `GET/POST /api/auth/*` | Auth.js handlers |
| `/sign-in` | Passwordless UI |
| `/sign-in/verify` | Magic link sent confirmation |

Public tool JSON shape unchanged for anonymous callers.

## UI

Template **T5**, `/dashboard` - shadcn `Tabs` ([PHASE_UI_MAP.md](../../ux/PHASE_UI_MAP.md)). Header: Sign in / Dashboard / Sign out.

## Limits and abuse

Magic link TTL (24h); rely on email provider rate limits for v1. Session fixation: Auth.js defaults + database sessions.

## Monetization

Free public tier by default ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)).

## Dependencies

Phase 1 tools; VPS PostgreSQL reachable from Next.js (Netlify or local dev).

## Implementation checklist

- [x] Prisma schema + initial migration
- [x] Auth.js providers (Google, optional GitHub, Nodemailer email)
- [x] Sign-in page + session provider + header auth nav
- [x] Dashboard auth guard (empty saved checks)
- [x] BFF session + analytics hash
- [ ] Saved check writes (later slice)
- [ ] GDPR delete account flow (document in privacy doc)

## Acceptance criteria

- [x] Anonymous health check unchanged when logged out
- [x] No password or Credentials sign-in in code or UI
- [x] Dashboard requires session

## References

[ARCHITECTURE.md §15–16](../../ARCHITECTURE.md), [API.md](../../API.md).
