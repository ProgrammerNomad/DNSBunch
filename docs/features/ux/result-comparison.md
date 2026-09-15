# Feature: Result Comparison

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P3 |
| **status** | planned |
| **phase** | 2 |
| **access** | free |
| **tool_id** | `compare_domains` |
| **last_reviewed** | 2026-09-15 |

## Summary

Diff two DNS health runs (domains or two points in time) for regressions (FUTURE_IDEAS #6). **Phase 2** default: best with [bulk-checker.md](../dns-health/bulk-checker.md) + optional [auth-optional-accounts.md](../platform/auth-optional-accounts.md) history. Minimal compare-after-bulk can ship in Phase 1 without accounts.

## Problem

Operators need to see what changed between checks - especially after bulk runs or before/after DNS changes.

## Scope

**In scope:** Side-by-side or diff view for `DNSAnalysisResult` JSON; entry from **T1** or **T3**; highlight changed check rows.

**Out of scope:** Cross-tool diff (DMARC vs SPF); arbitrary JSON diff for non-health tools v1.

## User flows

- **Anonymous:** Compare two domains in session (two runs) or two rows from bulk **T3**.
- **Logged-in (future):** Pick any two saved runs from history on **T5**.

## Architecture

Client-side diff on nested `checks` map; optional server snapshot ids when share/history exists.

## Data model

Uses saved checks when Phase 2 history exists; session-only pair for anonymous v1.

## API

None v1 (client holds two result objects). Optional `GET` snapshots Phase 2+.

## UI

**T1** / **T3** affordance - “Compare” opens `Sheet` or dedicated view; shadcn two-column `Table`, changed rows highlighted ([PAGE_TEMPLATES.md](../../ux/PAGE_TEMPLATES.md), [STATES_AND_FEEDBACK.md](../../ux/STATES_AND_FEEDBACK.md)).

## Limits and abuse

Cap result payload size in browser; no server storage for anonymous compare pairs.

## Monetization

Free public tier by default ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)).

## Dependencies

[dns-health-single.md](../shipped/dns-health-single.md), [bulk-checker.md](../dns-health/bulk-checker.md); [auth-optional-accounts.md](../platform/auth-optional-accounts.md) for history-powered compare.

## Implementation checklist

- [ ] Diff utility for `DNSAnalysisResult`
- [ ] UI entry on T1 and T3
- [ ] History picker when Phase 2 ships

## Acceptance criteria

- [ ] User can select two health results and see a diff view
- [ ] Changed checks/ statuses are visually distinct from unchanged rows
- [ ] Works for two different domains (anonymous session)
- [ ] Works from bulk table selecting two rows (T3)
- [ ] With history enabled, user can compare two saved runs for same domain
- [ ] Empty or incomplete result handled with clear error state
- [ ] Compare view readable in light and dark themes

## References

- FUTURE_IDEAS #6
