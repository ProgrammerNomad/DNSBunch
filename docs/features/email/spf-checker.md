# Feature: SPF Checker

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | planned |
| **phase** | 1 |
| **access** | free |
| **tool_id** | `spf_checker` |
| **last_reviewed** | 2026-09-15 |

## Summary

Standalone SPF record lookup and syntax validation for a domain (SEO: “check SPF record”).

## Problem

Senders need a fast SPF validation without running full DNS health.

## Scope

**In scope:** TXT lookup for SPF record; parse `v=spf1`; count DNS lookups (warn >10); display mechanisms and modifiers.

**Out of scope:** Sending test mail; DMARC/DKIM combined report (link to other tools).

## User flows

- **Anonymous:** Enter domain → Run → see SPF record, pass/warn/fail, mechanism list.
- **Logged-in (future):** Same; optional save to history (Phase 2).

## Architecture

Python `backend/tools/spf_checker/` - DNS TXT only; register in tool registry. May reuse TXT helpers from dns_checker later.

## Data model

None for v1.

## API

POST `/api/tools/spf_checker` body `{ "domain": "example.com" }` - see [API.md](../../API.md#planned-internal-tools-and-bff).

## UI

Template **T2**, route `/tools/spf-checker` - shadcn `Input`, `Button`, `Table`, `Alert` ([PAGE_TEMPLATES.md](../../ux/PAGE_TEMPLATES.md#t2--generic-tool-page)).

## Limits and abuse

Same IP rate limits as DNS health; max one domain per run.

## Monetization

Free public tier by default ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)). Paid experiments only after funnel metrics ([METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)).

## Dependencies

Platform skeleton recommended, not required.

## Implementation checklist

- [ ] Extract or wrap SPF logic from engine
- [ ] SEO page + event `tool_id=spf_checker`

## Acceptance criteria

- [ ] Valid SPF record parsed and displayed
- [ ] Missing SPF reported clearly
- [ ] Too many DNS lookups flagged as warning

## References

None for v1.
