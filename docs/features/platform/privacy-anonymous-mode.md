# Feature: Privacy and Anonymous Mode

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | planned |
| **phase** | 2 |
| **access** | both |
| **tool_id** | `_platform` |
| **last_reviewed** | 2026-09-15 |

## Summary

Product policy for anonymous lookups: minimal logging, optional privacy-forward defaults when accounts and analytics ship (FUTURE_IDEAS #16).

## Problem

README claims no registration/no storage; adding analytics and accounts requires clear privacy story.

## Scope

**In scope:**

- Document what is logged (IP rate limit, aggregate tool events without domains)
- User-facing privacy policy updates
- Optional “do not save history” default for logged-in users

**Out of scope:**

- Tor-hidden service; zero-knowledge architecture.

## User flows

- **Anonymous:** Run tools without account; no domain in aggregate analytics per [analytics-events.md](analytics-events.md).
- **Logged-in (future):** Privacy settings on **T5** `/dashboard/settings`.

## Architecture

Cross-cutting: BFF, analytics, PostgreSQL retention TTLs ([ARCHITECTURE.md](../../ARCHITECTURE.md)).

## Data model

User preference `privacy_save_history` boolean optional.

## API

None public beyond settings update when accounts exist.

## UI

**T5** settings toggles; footer Privacy Policy link in [SITE_SHELL.md](../../ux/SITE_SHELL.md).

## Limits and abuse

Compliance copy for mail tester raw `.eml` TTL.

## Monetization

Trust feature; not sold.

## Dependencies

[auth-optional-accounts.md](auth-optional-accounts.md), [analytics-events.md](analytics-events.md).

## Implementation checklist

- [ ] Privacy policy page content
- [ ] Analytics schema review
- [ ] Settings toggle when accounts ship

## Acceptance criteria

- [ ] Default anonymous path stores no domain in aggregate events
- [ ] Policy linked from footer

## References

- [PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)
