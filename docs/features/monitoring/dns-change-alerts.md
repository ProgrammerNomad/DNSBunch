# Feature: DNS Change Alerts

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | planned |
| **phase** | 3 |
| **access** | both |
| **tool_id** | `dns_watch` |
| **last_reviewed** | 2026-09-15 |

## Summary

Periodic re-run of health or key records; email when NS/MX/SOA serial changes.

## Problem

Users want notification when DNS records change after initial check.

## Scope

**In scope:** Watch definition (domain + record types); scheduled poller; email/webhook alert (experiment).

**Out of scope:** Guaranteed SLA monitoring day one.

## User flows

- **Anonymous:** CTA to sign in to create watch.
- **Logged-in (future):** Create watch on **T5** → alerts on change.

## Architecture

Worker cron + PostgreSQL watches; compare hashes; queue notifications.

## Data model

None for v1.

## API

CRUD watches authenticated - planned REST under `/api/watches`.

## UI

Template **T5**, `/dashboard/watches` - create form + list `Table`.

## Limits and abuse

Cap watches per plan; poller backoff; no amplification DNS queries.

## Monetization

Strong Pro candidate-validate via [METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md) before SKU.

## Dependencies

[auth-optional-accounts.md](../platform/auth-optional-accounts.md), PostgreSQL, cron/queue, [dns-health-single.md](../shipped/dns-health-single.md) engine.

## Implementation checklist

- [ ] Watch CRUD
- [ ] Scheduler + diff engine
- [ ] SendGrid/email provider

## Acceptance criteria

- [ ] User receives alert when watched record changes
- [ ] Poller respects minimum interval and rate limits

## References

None for v1.
