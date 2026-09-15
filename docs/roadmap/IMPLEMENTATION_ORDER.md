# Implementation order (reference)

What to **code next**-independent of **phase** (maturity stage). Phases: [PHASES.md](PHASES.md). Tracker: [README.md](../README.md).

## Step 0 - Documentation gate (before code)

Complete [DOC_COMPLETION_CHECKLIST.md](DOC_COMPLETION_CHECKLIST.md) and sign off. Includes full [ux/](../ux/) pack and filled feature specs.

## Suggested sequence (after gate)

| Step | Phase | Feature doc | Rationale |
|------|-------|-------------|-----------|
| 0b | - | [ux/SITE_SHELL.md](../ux/SITE_SHELL.md) + [FRONTEND_STACK.md](../ux/FRONTEND_STACK.md) | AppShell + Tailwind/shadcn T1 migration |
| 1 | 0 | [tool-registry.md](../features/platform/tool-registry.md) | Shared dispatch |
| 2 | 0 | [internal-jwt-proxy.md](../features/platform/internal-jwt-proxy.md) | Server-to-server security |
| 3 | 0 | [analytics-events.md](../features/platform/analytics-events.md) | Measure before Pro |
| 4 | 1 | [bulk-checker.md](../features/dns-health/bulk-checker.md) Bulk 1–3 | Same `run_all_checks` engine |
| 5 | 1 | Phase 1 tools | **Pick by need** (e.g. [dmarc-checker.md](../features/email/dmarc-checker.md))-not a fixed list order |
| 6 | 2 | [auth-optional-accounts.md](../features/platform/auth-optional-accounts.md) | When history/sessions matter |
| 7 | 2 | [mail-tester-inbound.md](../features/email/mail-tester-inbound.md) | Retention |
| 8 | 3 | [billing-stripe-ready.md](../features/platform/billing-stripe-ready.md) + [entitlements-quotas.md](../features/platform/entitlements-quotas.md) | Only after metrics justify a SKU |
| 9 | 3 | Pro experiments | e.g. [dns-change-alerts.md](../features/monitoring/dns-change-alerts.md), [developer-api-keys.md](../features/pro-experiments/developer-api-keys.md) |
| 10 | 4 | Bulk 4 / scale | Queues, Redis-see [PHASES.md](PHASES.md) |
| 11 | 5 | Ecosystem | [pwa-mobile.md](../features/ux/pwa-mobile.md), [browser-extension.md](../features/ux/browser-extension.md) |
| - | - | Cross-cutting UX | [dark-mode.md](../features/ux/dark-mode.md) with AppShell (0b); [result-comparison.md](../features/ux/result-comparison.md) after bulk/history |

## Do not

- Rewrite [dns_checker.py](../../backend/dns_checker.py) for bulk
- Paywall basic Phase 1 lookups
- Build Bulk 4 or Stripe before usage data says so

## Workflow

```text
docs/README.md → planned row → feature doc → implement → shipped → CHANGELOG.md
```
