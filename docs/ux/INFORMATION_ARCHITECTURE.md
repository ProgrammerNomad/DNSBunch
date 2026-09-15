# Information architecture

URL and navigation model for DNSBunch. SEO-friendly tool pages under `/tools/`; DNS health remains primary entry at `/`.

## Sitemap

```text
/                           DNS health (T1) - primary product home
/{domain}                   SEO alias → T1 with domain pre-filled
/tools                      Tools hub (T6)
/tools/bulk-dns-health      Bulk DNS health (T3)
/tools/dmarc-checker        Example Phase 1 tool (T2)
/tools/{slug}               One slug per tool_id (see PHASE_UI_MAP)
/dashboard                  Phase 2 - saved history (T5), auth required
/dashboard/settings         Account settings (Phase 2+)
/pricing                    Phase 3 - optional experiment page
```

**Slug rule:** lowercase kebab-case matching public SEO path; maps 1:1 to `tool_id` snake_case via [TOOL_CATALOG.md](../roadmap/TOOL_CATALOG.md).

## Navigation (primary)

| Label | Destination | Phase |
|-------|-------------|-------|
| DNSBunch (logo) | `/` | shipped |
| Tools | `/tools` | 1 |
| Bulk check | `/tools/bulk-dns-health` | 1 |
| Sign in | `/dashboard` or auth provider | 2 |
| Theme toggle | client only | 5 |

Category groupings on **T6** (not top-level mega-menu v1): Email, Website, Domain, DNS Health.

## Breadcrumbs (T2+)

`Home / Tools / {Tool name}` - shadcn optional breadcrumb on tool pages.

## Auth boundaries

- **Public:** `/`, `/tools/*` lookups (rate limited)
- **Optional account:** `/dashboard` - history, mail tester sessions, watches (Phase 2+)

## Internal (not in IA)

- `/api/*` - BFF only
- Python Flask - not linked from browser for new tools ([INV-3](../ARCHITECTURE.md))

## Related

- [SITE_SHELL.md](SITE_SHELL.md) - header implements this nav
- [PHASE_UI_MAP.md](PHASE_UI_MAP.md) - every feature route
