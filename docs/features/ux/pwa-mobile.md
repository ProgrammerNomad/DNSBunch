# Feature: PWA / Mobile

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P3 |
| **status** | planned |
| **phase** | 5 |
| **access** | free |
| **tool_id** | `pwa` |
| **last_reviewed** | 2026-09-15 |

## Summary

Installable PWA and mobile-friendly install path (FUTURE_IDEAS #7). **Phase 5 ecosystem** - after core tools and shell are stable.

## Problem

Mobile users want home-screen install; responsive **T1–T6** alone is not installability.

## Scope

**In scope:** Web manifest, icons, service worker caching static shell (not offline DNS queries).

**Out of scope:** App Store / Play native apps; offline diagnostic engine.

## User flows

- **Anonymous:** Browser install prompt or “Add to Home Screen” guidance on supported devices.

## Architecture

Next.js PWA plugin or hand-rolled `manifest.json` + SW in `public/`.

## Data model

None.

## API

None.

## UI

Dismissible install `Alert` on **T6** or shell; all templates must already meet mobile layout ([SITE_SHELL.md](../../ux/SITE_SHELL.md)).

## Limits and abuse

Service worker caches static assets only; no credential caching in SW.

## Monetization

Free.

## Dependencies

AppShell + shadcn migration complete.

## Implementation checklist

- [ ] manifest + icons
- [ ] SW registration
- [ ] Lighthouse PWA audit pass (best effort)

## Acceptance criteria

- [ ] Valid web app manifest linked from production site
- [ ] Install prompt or iOS “Add to Home Screen” instructions shown where applicable
- [ ] Installed PWA opens to DNS health or tools hub
- [ ] Service worker does not cache authenticated API responses by default
- [ ] Core tool flows usable on viewport width 320px
- [ ] Install banner dismiss state persists for session or localStorage

## References

- FUTURE_IDEAS #7
- [PHASES.md](../../roadmap/PHASES.md) Phase 5
