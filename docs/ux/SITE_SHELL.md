# Site shell (AppShell)

Global chrome for all public pages. Implemented in code as `AppShell` wrapping `{children}` in root layout ([FRONTEND_STACK.md](FRONTEND_STACK.md): Tailwind + shadcn).

## Structure

```text
┌─────────────────────────────────────────────┐
│ SiteHeader (sticky)                           │
├─────────────────────────────────────────────┤
│ main (max-w-7xl mx-auto px-4 py-6)          │
│   {page content - T1/T2/T3/T6}                │
├─────────────────────────────────────────────┤
│ SiteFooter                                    │
└─────────────────────────────────────────────┘
```

## SiteHeader

| Element | Behavior |
|---------|----------|
| Logo + wordmark | Link to `/` |
| Nav links | Tools → `/tools`; optional featured tool links (max 3) |
| Theme toggle | Cross-cutting UX ([dark-mode.md](../features/ux/dark-mode.md)); ship with AppShell, not Phase 5 |
| Account | Phase 2 - Sign in / avatar menu → dashboard |
| Mobile | shadcn `Sheet` hamburger for nav |

**Components:** shadcn `Button` (ghost), `NavigationMenu` or simple flex nav, `Sheet` (mobile).

## SiteFooter

Migrate content from legacy [Footer.tsx](../../frontend/src/components/Footer.tsx):

- Copyright, version ([APP_VERSION](../../frontend/src/config/version.md))
- GitHub / links
- Short tagline: DNS & email diagnostics
- Legal placeholders (Privacy, Terms) when accounts ship

**Components:** muted text, `Separator`, external links.

## Layout tokens

- Max width: `max-w-7xl` for tool content; full bleed allowed for wide bulk tables (T3) inside main.
- Vertical rhythm: `space-y-6` between page sections.
- Use shadcn semantic colors (`bg-background`, `text-muted-foreground`).

## ToolPageLayout (composite)

Used by T2, T3, T4 (not T1 home):

| Slot | Content |
|------|---------|
| Title | `h1` + optional `Badge` (Free / Pro) |
| Description | SEO paragraph, 1–2 sentences |
| ToolRunForm | Input + submit |
| ResultsPanel | Tables, alerts, empty states |
| RelatedTools | Links to 2–3 tools same category |

## Phase rollout

| Phase | Shell deliverable |
|-------|-------------------|
| 0 (code, post-docs) | AppShell + footer global; T1 still MUI until migrated in same sprint |
| 1 | T6 `/tools` + T2/T3 pages use shell |
| 2 | Account entry in header |
| 5 | Theme toggle wired |

## Acceptance (documentation)

- [ ] Every template T1–T6 specifies which shell slots it uses
- [ ] Header nav matches [INFORMATION_ARCHITECTURE.md](INFORMATION_ARCHITECTURE.md)
