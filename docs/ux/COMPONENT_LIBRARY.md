# Component library

Maps shadcn/ui primitives and DNSBunch composites. All new UI follows [FRONTEND_STACK.md](FRONTEND_STACK.md).

## shadcn primitives (install as needed)

| Component | Use |
|-----------|-----|
| `Button` | Primary actions, nav |
| `Input` | Domain, host, search |
| `Textarea` | Bulk paste lists |
| `Label` | Form accessibility |
| `Card` | Tool hub tiles, mail tester panels |
| `Table` | Results, bulk summary, history |
| `Tabs` | Normal / advanced DNS results |
| `Alert` | Errors, rate limit, warnings |
| `Badge` | Pass/warn/fail, Pro badge |
| `Skeleton` | Loading rows |
| `Progress` | Bulk run, mail tester wait |
| `Sheet` | Mobile nav, optional drill-down |
| `Dialog` | Confirm delete watch, export |
| `DropdownMenu` | Account menu, export format |
| `Separator` | Footer sections |
| `Tooltip` | Icon hints |
| `ScrollArea` | Long result lists |

Path convention: `frontend/src/components/ui/*` (shadcn CLI).

## Composites (app-level)

| Composite | Template | Description |
|-----------|----------|-------------|
| `AppShell` | all | Header + main + footer |
| `SiteHeader` | all | Nav per [SITE_SHELL.md](SITE_SHELL.md) |
| `SiteFooter` | all | Global footer |
| `ToolPageLayout` | T2–T4 | Title, description, form slot, results slot |
| `ToolRunForm` | T2 | Validated input + submit + loading state |
| `ResultsPanel` | T1,T2,T3 | Empty / loading / error / data |
| `DnsResultsTable` | T1 | Port of logical columns from legacy MUI table |
| `DnsResultsAdvanced` | T1 | Port of advanced view |
| `BulkSummaryTable` | T3 | Rollup columns per domain |
| `RelatedTools` | T2 | Card links |

## Legacy migration (MUI → shadcn)

| Legacy | Target |
|--------|--------|
| MUI `Container`, `Box` | Tailwind layout + `main` |
| MUI `Typography` | semantic HTML + Tailwind type scale |
| MUI `CircularProgress` | `Skeleton` or lucide `Loader2` animate-spin |
| MUI `Alert` | shadcn `Alert` |
| MUI `Table*` | shadcn `Table` |

Preserve **data bindings** to `DNSAnalysisResult` ([dns.ts](../../frontend/src/types/dns.ts)) during T1 migration.

## Icons

**lucide-react** only on new surfaces (e.g. `Copy`, `ExternalLink`, `Moon`, `Sun`).

## Status colors

Align with existing check statuses where possible:

| Status | Suggested class |
|--------|-----------------|
| pass | `text-green-600` / `Badge` variant success |
| warning | `text-amber-600` |
| error | `destructive` / `Alert` variant destructive |
| info | `text-muted-foreground` |

Document theme tokens in `globals.css` when implementing.
