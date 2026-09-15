# Feature: Dark Mode

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P3 |
| **status** | planned |
| **phase** | 5 |
| **access** | free |
| **tool_id** | `ux_dark_mode` |
| **last_reviewed** | 2026-09-15 |

## Summary

`next-themes` + shadcn CSS variables; system preference; localStorage (FUTURE_IDEAS #5).

## Problem

Users expect dark theme for long diagnostic sessions (FUTURE_IDEAS #5).

## Scope

**In scope:** `next-themes` + shadcn CSS variables; toggle in SiteHeader.

**Out of scope:** Per-component one-off colors outside design tokens.

## User flows

- **Anonymous:** Toggle theme; preference in localStorage.
- **Logged-in (future):** Optional sync preference to account.

## Architecture

Root layout `ThemeProvider`; `.dark` on `html` ([FRONTEND_STACK.md](../../ux/FRONTEND_STACK.md)).

## Data model

None for v1.

## API

None.

## UI

Shell header `Button` with Sun/Moon icons; tokens in [SITE_SHELL.md](../../ux/SITE_SHELL.md).

## Limits and abuse

None.

## Monetization

Free public tier by default ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)). Paid experiments only after funnel metrics ([METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)).

## Dependencies

None.

## Implementation checklist

- [ ] Theme provider dual palette
- [ ] Persist preference

## Acceptance criteria


## References

None for v1.
