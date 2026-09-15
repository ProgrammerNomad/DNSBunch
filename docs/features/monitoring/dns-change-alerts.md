# Feature: DNS Change Alerts

## Metadata

| Field | Value |
|-------|--------|
| **status** | planned |
| **phase** | pro |
| **access** | both |
| **tool_id** | `dns_watch` |

## Summary

Periodic re-run of health or key records; email when NS/MX/SOA serial changes.

## Dependencies

[auth-optional-accounts.md](../platform/auth-optional-accounts.md), PostgreSQL, cron/queue, [dns-health-single.md](../shipped/dns-health-single.md) engine.

## Monetization

Strong Pro candidate-validate via [METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md) before SKU.

## Implementation checklist

- [ ] Watch CRUD
- [ ] Scheduler + diff engine
- [ ] SendGrid/email provider
