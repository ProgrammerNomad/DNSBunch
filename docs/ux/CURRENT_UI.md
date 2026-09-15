# Current UI (as-built)

Snapshot of production UI before AppShell and shadcn migration. Verified against repo layout; update when shipping T1 rewrite.

## Routes

| Route | File | Behavior |
|-------|------|----------|
| `/` | [page.tsx](../../frontend/src/app/page.tsx) | Client page: hero, search, inline results |
| `/[...domain]` | [[...domain]/page.tsx](../../frontend/src/app/[...domain]/page.tsx) | Redirects to home with domain query / path handling |
| `/api/dns/check` | BFF | Not UI; powers check |

**Missing today:** `/tools`, `/tools/[slug]`, global header, dashboard.

## Layout

| Layer | Implementation |
|-------|----------------|
| Root | [layout.tsx](../../frontend/src/app/layout.tsx) - MUI `ThemeProvider`, `CssBaseline`, Inter font |
| Page chrome | Hero title + tagline **inside** home page only (not shared Header) |
| Footer | [Footer.tsx](../../frontend/src/components/Footer.tsx) - rendered **only** on home, not in root layout |

## Components (MUI)

| Component | Role |
|-----------|------|
| `DomainSearchForm` | Domain input, check options, submit |
| `DNSResultsTable` | Normal results grid |
| `DNSResultsAdvanced` | Advanced results + clear |
| `Footer` | GitHub link, version chip, tech badges |

## User flow (shipped)

1. User lands on `/` or domain path.
2. Enters domain → `dnsApi.checkDomain` → `POST /api/dns/check`.
3. Results render below form (normal or advanced).
4. URL may update to `/encoded-domain` via `history.replaceState`.

## Gaps vs target

| Gap | Target doc |
|-----|------------|
| No site-wide navigation | [SITE_SHELL.md](SITE_SHELL.md) |
| No tools catalog | [PAGE_TEMPLATES.md](PAGE_TEMPLATES.md) **T6** |
| MUI instead of shadcn | [FRONTEND_STACK.md](FRONTEND_STACK.md) |
| Per-tool SEO pages | **T2** + [PHASE_UI_MAP.md](PHASE_UI_MAP.md) |

## Preservation requirements (migration)

When rewriting **T1**, preserve:

- Same API contract and CSRF flow ([dns-health-single.md](../features/shipped/dns-health-single.md))
- Domain URL behavior for SEO
- Normal vs advanced result **data** (presentation may change to shadcn `Table` / `Tabs`)
