# Feature: Browser Extension

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P3 |
| **status** | planned |
| **phase** | 5 |
| **access** | free |
| **tool_id** | `browser_extension` |
| **last_reviewed** | 2026-09-15 |

## Summary

MV3 extension for quick domain check from the active tab (FUTURE_IDEAS #8). **Phase 5 ecosystem** extension surface.

## Problem

Power users want one-click check without copy-paste to the website.

## Scope

**In scope:** Popup reads active tab hostname; opens DNSBunch **T1** with domain or triggers check via public BFF policy.

**Out of scope:** Store publication day one; full in-extension results renderer v1.

## User flows

- **Anonymous:** Extension icon → confirm domain → new tab to results on dnsbunch.com.

## Architecture

Separate extension repo or `extension/` folder; calls documented CORS/BFF rules; API keys optional Phase 3.

## Data model

None.

## API

Reuse `POST /api/dns/check` or `/api/tools/dns_health` - document CORS decision in [API.md](../../API.md) when implemented.

## UI

Extension popup (minimal HTML); primary UX remains **T1** on site ([FRONTEND_STACK.md](../../ux/FRONTEND_STACK.md) branding).

## Limits and abuse

Same server rate limits; extension must not bypass CSRF rules (prefer opening site tab).

## Monetization

Free.

## Dependencies

Stable public check API; privacy policy update.

## Implementation checklist

- [ ] MV3 manifest + popup
- [ ] Hostname extraction from active tab
- [ ] Deep link to `/?domain=` or path route

## Acceptance criteria

- [ ] Extension loads on supported Chromium browser
- [ ] Active tab hostname detected for http/https pages
- [ ] User can open DNSBunch results for that domain in one click
- [ ] Invalid pages (chrome://, empty) show friendly message
- [ ] No API secrets embedded in extension bundle
- [ ] Rate limiting still enforced server-side

## References

- FUTURE_IDEAS #8
