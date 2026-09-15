# States and feedback

Consistent UX for async tools (DNS, HTTP, bulk). Apply across T1–T4 using shadcn components.

## Loading

| Context | Pattern |
|---------|---------|
| Single tool run | Disable submit; `Skeleton` rows or spinner on button (`Loader2`) |
| Bulk run | `Progress` + “Checking domain N of M” |
| Mail tester poll | Indeterminate progress + last checked time |
| Page navigation | Next.js loading.tsx optional for `/tools/*` |

## Empty

| Context | Message |
|---------|---------|
| T1 no search yet | Short hint: enter a domain to analyze |
| T2 no result yet | Run a check to see results |
| T3 no domains | Paste at least one domain |
| T5 history empty | Sign in and run checks to build history (Phase 2) |
| T6 | N/A - always show cards |

Use muted `text-muted-foreground`; no error styling.

## Error

| Source | UI |
|--------|-----|
| Validation (client) | shadcn `Alert` under form |
| API 4xx/5xx | `Alert` with safe message; no stack traces |
| 429 rate limit | `Alert` + retry after [ARCHITECTURE §6](../ARCHITECTURE.md#6-current-security-model-current) reset hint |
| CSRF failure | Prompt refresh page |
| Partial bulk failure | Per-row error in T3 table; job continues |

## Success

- Single tool: render ResultsPanel; optional success toast (defer toast lib until needed)
- Bulk: table with mixed pass/warn/fail badges

## Rate limit display

When BFF exposes `X-RateLimit-Remaining` / `X-RateLimit-Reset`, optional subtle footer line on tool pages (Phase 1 nice-to-have).

## Accessibility

- Form fields: `Label` + `aria-invalid` on errors
- Tables: scope on headers for screen readers
- Focus management: after run, focus results heading or first alert

## Related

- [COMPONENT_LIBRARY.md](COMPONENT_LIBRARY.md) - Alert, Skeleton, Progress
- [API.md](../API.md) - error response shapes
