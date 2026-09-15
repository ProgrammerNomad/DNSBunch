# DNSBunch Documentation Index

Master tracker for shipped and planned features. **Implementation:** follow [roadmap/IMPLEMENTATION_ORDER.md](roadmap/IMPLEMENTATION_ORDER.md); work one doc at a time.

**Authoritative architecture (CURRENT vs PLANNED, invariants, layers):** [ARCHITECTURE.md](ARCHITECTURE.md)

## Foundation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | **Authoritative** boundaries, security classes, bulk §9, ADRs |
| [PRODUCT_STRATEGY.md](PRODUCT_STRATEGY.md) | Free tools, slow growth, metrics-driven Pro |
| [TOOL_PLUGIN_CONTRACT.md](TOOL_PLUGIN_CONTRACT.md) | Adding new tools |
| [API.md](API.md) | **Canonical** HTTP API reference |
| [DNS_RECORDS.md](DNS_RECORDS.md) | **Canonical** record/check descriptions |
| [features/_TEMPLATE.md](features/_TEMPLATE.md) | Template for new feature docs |

## Feature tracker

| Doc path | Feature | Status | Phase | Notes |
|----------|---------|--------|-------|-------|
| [features/shipped/dns-health-single.md](features/shipped/dns-health-single.md) | DNS health (single domain) | **shipped** | - | Verified 2026-09-15 |
| [features/dns-health/bulk-checker.md](features/dns-health/bulk-checker.md) | Bulk DNS health | planned | 1 | `tool_id` dns_health, `surface` bulk - [ARCHITECTURE §9](ARCHITECTURE.md#9-bulk-architecture-planned) |
| [features/platform/tool-registry.md](features/platform/tool-registry.md) | Tool registry | planned | 0 | |
| [features/platform/analytics-events.md](features/platform/analytics-events.md) | Analytics events | planned | 0 | |
| [features/platform/internal-jwt-proxy.md](features/platform/internal-jwt-proxy.md) | Internal JWT proxy | planned | 0 | |
| [features/platform/auth-optional-accounts.md](features/platform/auth-optional-accounts.md) | Optional accounts | planned | 1 | |
| [features/platform/billing-stripe-ready.md](features/platform/billing-stripe-ready.md) | Stripe-ready billing | planned | 1 | |
| [features/platform/entitlements-quotas.md](features/platform/entitlements-quotas.md) | Entitlements | planned | 1 | |
| [features/email/spf-checker.md](features/email/spf-checker.md) | SPF checker | planned | organic | |
| [features/email/dkim-checker.md](features/email/dkim-checker.md) | DKIM checker | planned | organic | |
| [features/email/dmarc-checker.md](features/email/dmarc-checker.md) | DMARC checker | planned | organic | |
| [features/email/mx-lookup.md](features/email/mx-lookup.md) | MX lookup | planned | organic | |
| [features/email/smtp-test.md](features/email/smtp-test.md) | SMTP test | planned | organic | |
| [features/email/dnsbl-blacklist.md](features/email/dnsbl-blacklist.md) | DNSBL | planned | organic | |
| [features/email/mail-tester-inbound.md](features/email/mail-tester-inbound.md) | Mail tester | planned | 2 | Inbound SMTP |
| [features/website/ssl-inspector.md](features/website/ssl-inspector.md) | SSL inspector | planned | organic | |
| [features/website/http-headers.md](features/website/http-headers.md) | HTTP headers | planned | organic | |
| [features/website/redirect-chain.md](features/website/redirect-chain.md) | Redirect chain | planned | organic | |
| [features/website/http-status.md](features/website/http-status.md) | HTTP status | planned | organic | |
| [features/domain/whois-lookup.md](features/domain/whois-lookup.md) | WHOIS | planned | organic | |
| [features/domain/domain-expiry.md](features/domain/domain-expiry.md) | Domain expiry | planned | organic | |
| [features/domain/dns-propagation.md](features/domain/dns-propagation.md) | DNS propagation | planned | organic | |
| [features/domain/dns-history.md](features/domain/dns-history.md) | DNS history | planned | pro | |
| [features/monitoring/dns-change-alerts.md](features/monitoring/dns-change-alerts.md) | DNS change alerts | planned | pro | |
| [features/monitoring/ssl-expiry-alerts.md](features/monitoring/ssl-expiry-alerts.md) | SSL expiry alerts | planned | pro | |
| [features/monitoring/domain-expiry-alerts.md](features/monitoring/domain-expiry-alerts.md) | Domain expiry alerts | planned | pro | |
| [features/monitoring/uptime-checks.md](features/monitoring/uptime-checks.md) | Uptime | planned | pro | |
| [features/monitoring/email-health-watch.md](features/monitoring/email-health-watch.md) | Email health watch | planned | pro | |
| [features/pro-experiments/developer-api-keys.md](features/pro-experiments/developer-api-keys.md) | API keys | planned | pro | |
| [features/pro-experiments/export-pdf-json-csv.md](features/pro-experiments/export-pdf-json-csv.md) | Export | planned | organic | access: both |
| [features/pro-experiments/shareable-result-links.md](features/pro-experiments/shareable-result-links.md) | Share links | planned | organic | access: both |
| [features/pro-experiments/white-label-reports.md](features/pro-experiments/white-label-reports.md) | White label | planned | pro | |
| [features/ux/dark-mode.md](features/ux/dark-mode.md) | Dark mode | planned | ux | |
| [features/ux/result-comparison.md](features/ux/result-comparison.md) | Compare domains | planned | ux | |
| [features/ux/pwa-mobile.md](features/ux/pwa-mobile.md) | PWA | planned | ux | |
| [features/ux/browser-extension.md](features/ux/browser-extension.md) | Browser extension | planned | ux | |

## Roadmap

| Document | Description |
|----------|-------------|
| [roadmap/IMPLEMENTATION_ORDER.md](roadmap/IMPLEMENTATION_ORDER.md) | Suggested build sequence |
| [roadmap/METRICS_DASHBOARD.md](roadmap/METRICS_DASHBOARD.md) | Funnel and Pro decisions |

## FUTURE_IDEAS.md mapping

| FUTURE_IDEAS # | Title | Feature doc |
|----------------|-------|---------------|
| 1 | DNS Monitoring & Alerts | [dns-change-alerts.md](features/monitoring/dns-change-alerts.md) |
| 2 | Export Results | [export-pdf-json-csv.md](features/pro-experiments/export-pdf-json-csv.md), [shareable-result-links.md](features/pro-experiments/shareable-result-links.md) |
| 3 | Batch Domain Checker | [bulk-checker.md](features/dns-health/bulk-checker.md) |
| 4 | DNS Change History | [dns-history.md](features/domain/dns-history.md) |
| 5 | Dark Mode | [dark-mode.md](features/ux/dark-mode.md) |
| 6 | Result Comparison | [result-comparison.md](features/ux/result-comparison.md) |
| 7 | Mobile PWA | [pwa-mobile.md](features/ux/pwa-mobile.md) |
| 8 | Browser Extension | [browser-extension.md](features/ux/browser-extension.md) |
| 9 | Interactive DNS Tutorial | - (deferred; no feature doc) |
| 10 | DNS Best Practices Guide | - (deferred; content/SEO, not a tool spec) |
| 11 | Community Forum | - (deferred; no feature doc) |
| 12 | API Access | [developer-api-keys.md](features/pro-experiments/developer-api-keys.md) |
| 13 | Premium Features | [billing-stripe-ready.md](features/platform/billing-stripe-ready.md), [entitlements-quotas.md](features/platform/entitlements-quotas.md) |
| 14 | White Label | [white-label-reports.md](features/pro-experiments/white-label-reports.md) |
| 15 | DNSSEC | Extend engine / future doc when scoped |
| 16 | Privacy Mode | Product policy-track under [PRODUCT_STRATEGY.md](PRODUCT_STRATEGY.md) |

Legacy brainstorming: [FUTURE_IDEAS.md](../FUTURE_IDEAS.md) (pointer only).

## Status legend

- **shipped** - live in production
- **planned** - specified, not built
- **in-progress** - active development
- **deferred** - intentionally postponed

**Phase column:** `0` | `1` | `2` | `organic` | `pro` | `ux` | `-` (shipped only). Same value must appear in each feature doc Metadata table. **Access** (`free` | `pro` | `both`) is separate-do not put `both` in the Phase column.
