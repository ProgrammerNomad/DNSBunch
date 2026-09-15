# Frontend stack

**Decision (locked):** all **new and migrated** DNSBunch UI uses **Tailwind CSS** + **[shadcn/ui](https://ui.shadcn.com/)**. Do not add MUI, Chakra, Mantine, or other full component libraries for new surfaces.

## Allowed

| Piece | Role |
|-------|------|
| **Tailwind CSS** | Utility styling, responsive layout |
| **shadcn/ui** | Copy-in components under `frontend/src/components/ui/` |
| **Radix UI** | Via shadcn primitives (accessible behavior) |
| **class-variance-authority**, **tailwind-merge**, **clsx** | shadcn conventions (`lib/utils.ts`) |
| **next-themes** | Dark mode with `class` strategy on `<html>` |
| **lucide-react** | Icons (shadcn default) |

## Forbidden (new work)

- `@mui/material`, `@mui/icons-material`, and similar UI kits
- Adding a second parallel design system alongside shadcn

## Legacy (removed)

| Item | Status |
|------|--------|
| MUI `@mui/*` | Removed from [package.json](../../frontend/package.json) (Step 0b) |
| Per-page footer | Migrated to [SiteFooter.tsx](../../frontend/src/components/layout/SiteFooter.tsx) |

**CURRENT:** single stack (Tailwind + shadcn) on T1, AppShell, and minimal T6 `/tools`.

## Theming

- Use shadcn CSS variables in `globals.css` (`--background`, `--foreground`, `--primary`, etc.).
- Dark mode: [dark-mode.md](../features/ux/dark-mode.md) - `next-themes` + `.dark` on root; toggle in [SITE_SHELL.md](SITE_SHELL.md) header.
- Do not implement dark mode with MUI `createTheme`.

## Feature doc convention

In each feature `## UI` section:

1. Template id: **T1**–**T6** ([PAGE_TEMPLATES.md](PAGE_TEMPLATES.md))
2. Route from [PHASE_UI_MAP.md](PHASE_UI_MAP.md)
3. Named shadcn components (e.g. `Table`, `Alert`, `Card`) from [COMPONENT_LIBRARY.md](COMPONENT_LIBRARY.md)

## Level 1 sync

[ARCHITECTURE.md §12](../ARCHITECTURE.md#12-nextjs-bff-architecture-current--planned) documents **CURRENT** MUI on shipped home and **PLANNED** Tailwind + shadcn for new surfaces.
