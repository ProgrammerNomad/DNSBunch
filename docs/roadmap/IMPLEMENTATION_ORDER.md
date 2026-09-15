# Implementation Order (Reference)

Suggested **coding** sequence after documentation sign-off. This file does not trigger implementation by itself-pick rows from [README.md](../README.md).

## Order

| Step | Feature doc | Rationale |
|------|-------------|-----------|
| 1 | [tool-registry.md](../features/platform/tool-registry.md) | Reusable dispatch |
| 2 | [internal-jwt-proxy.md](../features/platform/internal-jwt-proxy.md) | Secure server-to-server |
| 3 | [analytics-events.md](../features/platform/analytics-events.md) | Measure before Pro |
| 4 | [bulk-checker.md](../features/dns-health/bulk-checker.md) phases 1–3 | Same `run_all_checks` engine |
| 5 | Organic tools | When needed: e.g. [dmarc-checker.md](../features/email/dmarc-checker.md) |
| 6 | [auth-optional-accounts.md](../features/platform/auth-optional-accounts.md) | When history/sessions needed |
| 7 | [mail-tester-inbound.md](../features/email/mail-tester-inbound.md) | High retention |
| 8 | [billing-stripe-ready.md](../features/platform/billing-stripe-ready.md) + entitlements | Only after metrics pick a SKU |
| 9 | Pro experiments | [dns-change-alerts.md](../features/monitoring/dns-change-alerts.md), [developer-api-keys.md](../features/pro-experiments/developer-api-keys.md), bulk phase 4 |

## Do not

- Rewrite [dns_checker.py](../../backend/dns_checker.py) for bulk
- Paywall basic lookups
- Launch Stripe before first chosen experiment

## Workflow

```text
docs/README.md → planned row → feature checklist → code → status shipped → CHANGELOG.md
```
