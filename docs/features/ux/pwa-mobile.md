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

Installable PWA, offline cached results (FUTURE_IDEAS #7).

## Problem

Mobile users want home-screen install (FUTURE_IDEAS #7).

## Scope

**In scope:** Web manifest, icons, service worker for offline shell (not offline DNS).

**Out of scope:** Native app store apps.

## User flows

- **Anonymous:** Install prompt on supported browsers.

## Architecture

Next PWA plugin or manual manifest in `public/`.

## Data model

None for v1.

## API

None.

## UI

Install hint `Alert` dismissible; responsive **T1–T6** already required.

## Limits and abuse

SW cache static assets only.

## Monetization

Free public tier by default ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)). Paid experiments only after funnel metrics ([METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)).

## Dependencies

Next.js PWA config.

## Implementation checklist

- [ ] Spec implemented per FRONTEND_STACK
- [ ] Document in CHANGELOG when shipped

## Acceptance criteria


## References

None for v1.
