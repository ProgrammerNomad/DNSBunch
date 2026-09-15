# Feature: Dark Mode

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P3 |
| **status** | shipped |
| **phase** | - |
| **access** | free |
| **tool_id** | `ux_dark_mode` |
| **last_reviewed** | 2026-09-15 |

## Summary

Cross-cutting UX: `next-themes` + shadcn CSS variables; system preference; persisted toggle in site shell (FUTURE_IDEAS #5). **Not a Phase 5 product feature** - ships with [SITE_SHELL.md](../../ux/SITE_SHELL.md) / AppShell when UI migrates to shadcn.

## Problem

Users expect dark theme for long diagnostic sessions (FUTURE_IDEAS #5). Waiting until “ecosystem phase” delays a basic presentation improvement.

## Scope

**In scope:** Light/dark/system modes; header toggle; tokens in `globals.css`; readable tables and alerts in both themes.

**Out of scope:** Per-tool custom palettes outside design tokens; MUI dual-theme (legacy home removed on migration).

## User flows

- **Anonymous:** Toggle theme in header; preference in `localStorage` via `next-themes`.
- **Logged-in (future):** Optional sync preference to account settings on **T5**.

## Architecture

Root layout `ThemeProvider` from `next-themes`; `.dark` class on `<html>` ([FRONTEND_STACK.md](../../ux/FRONTEND_STACK.md)).

## Data model

Optional `User.theme_preference` when accounts exist; none for v1.

## API

None.

## UI

Cross-cutting - not a standalone route. Shell header `Button` (Sun/Moon); applies to **T1–T6** ([SITE_SHELL.md](../../ux/SITE_SHELL.md)). See [STATES_AND_FEEDBACK.md](../../ux/STATES_AND_FEEDBACK.md) for contrast/readability.

## Limits and abuse

None.

## Monetization

Free. Not a paid feature.

## Dependencies

[FRONTEND_STACK.md](../../ux/FRONTEND_STACK.md), AppShell implementation (Step 0b in [IMPLEMENTATION_ORDER.md](../../roadmap/IMPLEMENTATION_ORDER.md)).

## Implementation checklist

- [x] Install `next-themes` + shadcn dark CSS variables
- [x] Header toggle wired ([theme-toggle.tsx](../../frontend/src/components/layout/theme-toggle.tsx))
- [x] Remove MUI theme when T1 migrated

## Acceptance criteria

- [x] Light theme renders correctly on T1 + `/tools` (T2–T6 as they ship)
- [x] Dark theme renders correctly on T1 + `/tools`
- [x] System preference respected (`defaultTheme="system"`)
- [x] User can manually toggle light / dark via header
- [x] Preference persists across browser sessions (`next-themes`)
- [x] Diagnostic result **data** unchanged between themes (presentation only)
- [x] Result tables and badges remain readable in both themes
- [x] Mobile header and nav remain usable in both themes (Sheet menu)

## References

- FUTURE_IDEAS #5
- [PHASES.md](../../roadmap/PHASES.md) - cross-cutting UX
