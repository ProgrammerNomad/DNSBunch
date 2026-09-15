# DNSBunch Documentation Index

Master tracker for shipped and planned features. **Implementation:** follow [roadmap/IMPLEMENTATION_ORDER.md](roadmap/IMPLEMENTATION_ORDER.md); work one doc at a time.

## Three levels of authority

| Level | Documents | Role |
|-------|-----------|------|
| **1 - Source of truth** | [ARCHITECTURE.md](ARCHITECTURE.md), [TOOL_PLUGIN_CONTRACT.md](TOOL_PLUGIN_CONTRACT.md), [PRODUCT_STRATEGY.md](PRODUCT_STRATEGY.md), [API.md](API.md), [DNS_RECORDS.md](DNS_RECORDS.md) | Global rules; CURRENT vs PLANNED |
| **2 - Feature specs** | [features/](features/) | Per-feature behavior and checklists |
| **3 - Execution tracking** | This README, [roadmap/](roadmap/) | What to build next |

Feature quality rules: [DOCUMENTATION_STANDARDS.md](DOCUMENTATION_STANDARDS.md) (mandatory sections, metadata, no new features until specs are consistent).

## Foundation

| Document | Description |
|----------|-------------|
| [DOCUMENTATION_STANDARDS.md](DOCUMENTATION_STANDARDS.md) | Mandatory sections, metadata, three-level model |
| [roadmap/PHASES.md](roadmap/PHASES.md) | **Phase 0–5** definitions (not build order) |
| [ARCHITECTURE.md](ARCHITECTURE.md) | **Authoritative** boundaries, security classes, bulk §9, ADRs |
| [PRODUCT_STRATEGY.md](PRODUCT_STRATEGY.md) | Free tools, slow growth, metrics-driven Pro |
| [TOOL_PLUGIN_CONTRACT.md](TOOL_PLUGIN_CONTRACT.md) | Adding new tools |
| [API.md](API.md) | **Canonical** HTTP API reference |
| [DNS_RECORDS.md](DNS_RECORDS.md) | **Canonical** record/check descriptions |
| [features/_TEMPLATE.md](features/_TEMPLATE.md) | Template for new feature docs |

## Feature tracker

| Doc path | Feature | Status | Phase | Priority | Notes |
|----------|---------|--------|-------|----------|-------|
| [features/shipped/dns-health-single.md](features/shipped/dns-health-single.md) | DNS health (single domain) | **shipped** | - | P0 | verified 2026-09-15 |
| [features/dns-health/bulk-checker.md](features/dns-health/bulk-checker.md) | Bulk DNS health | planned | 1 | P1 | `surface` bulk - [§9](ARCHITECTURE.md#9-bulk-architecture-planned) |
| [features/platform/tool-registry.md](features/platform/tool-registry.md) | Tool registry | planned | 0 | P1 | |
| [features/platform/analytics-events.md](features/platform/analytics-events.md) | Analytics events | planned | 0 | P1 | |
| [features/platform/internal-jwt-proxy.md](features/platform/internal-jwt-proxy.md) | Internal JWT proxy | planned | 0 | P1 | |
| [features/platform/auth-optional-accounts.md](features/platform/auth-optional-accounts.md) | Optional accounts | planned | 2 | P1 | retention |
| [features/platform/billing-stripe-ready.md](features/platform/billing-stripe-ready.md) | Stripe-ready billing | planned | 3 | P1 | experiment |
| [features/platform/entitlements-quotas.md](features/platform/entitlements-quotas.md) | Entitlements | planned | 3 | P1 | experiment |
| [features/email/spf-checker.md](features/email/spf-checker.md) | SPF checker | planned | 1 | P2 | |
| [features/email/dkim-checker.md](features/email/dkim-checker.md) | DKIM checker | planned | 1 | P2 | |
| [features/email/dmarc-checker.md](features/email/dmarc-checker.md) | DMARC checker | planned | 1 | P2 | |
| [features/email/mx-lookup.md](features/email/mx-lookup.md) | MX lookup | planned | 1 | P2 | |
| [features/email/smtp-test.md](features/email/smtp-test.md) | SMTP test | planned | 1 | P2 | |
| [features/email/dnsbl-blacklist.md](features/email/dnsbl-blacklist.md) | DNSBL | planned | 1 | P2 | |
| [features/email/mail-tester-inbound.md](features/email/mail-tester-inbound.md) | Mail tester | planned | 2 | P1 | inbound SMTP |
| [features/website/ssl-inspector.md](features/website/ssl-inspector.md) | SSL inspector | planned | 1 | P2 | |
| [features/website/http-headers.md](features/website/http-headers.md) | HTTP headers | planned | 1 | P2 | |
| [features/website/redirect-chain.md](features/website/redirect-chain.md) | Redirect chain | planned | 1 | P2 | |
| [features/website/http-status.md](features/website/http-status.md) | HTTP status | planned | 1 | P2 | |
| [features/domain/whois-lookup.md](features/domain/whois-lookup.md) | WHOIS | planned | 1 | P2 | |
| [features/domain/domain-expiry.md](features/domain/domain-expiry.md) | Domain expiry | planned | 1 | P2 | |
| [features/domain/dns-propagation.md](features/domain/dns-propagation.md) | DNS propagation | planned | 1 | P2 | |
| [features/domain/dns-history.md](features/domain/dns-history.md) | DNS history | planned | 1 | P2 | access pro |
| [features/monitoring/dns-change-alerts.md](features/monitoring/dns-change-alerts.md) | DNS change alerts | planned | 3 | P2 | experiment |
| [features/monitoring/ssl-expiry-alerts.md](features/monitoring/ssl-expiry-alerts.md) | SSL expiry alerts | planned | 3 | P2 | experiment |
| [features/monitoring/domain-expiry-alerts.md](features/monitoring/domain-expiry-alerts.md) | Domain expiry alerts | planned | 3 | P2 | experiment |
| [features/monitoring/uptime-checks.md](features/monitoring/uptime-checks.md) | Uptime | planned | 3 | P2 | experiment |
| [features/monitoring/email-health-watch.md](features/monitoring/email-health-watch.md) | Email health watch | planned | 3 | P2 | experiment |
| [features/pro-experiments/developer-api-keys.md](features/pro-experiments/developer-api-keys.md) | API keys | planned | 3 | P2 | experiment |
| [features/pro-experiments/export-pdf-json-csv.md](features/pro-experiments/export-pdf-json-csv.md) | Export | planned | 3 | P2 | access both |
| [features/pro-experiments/shareable-result-links.md](features/pro-experiments/shareable-result-links.md) | Share links | planned | 3 | P2 | access both |
| [features/pro-experiments/white-label-reports.md](features/pro-experiments/white-label-reports.md) | White label | planned | 3 | P2 | experiment |
| [features/ux/dark-mode.md](features/ux/dark-mode.md) | Dark mode | planned | 5 | P3 | |
| [features/ux/result-comparison.md](features/ux/result-comparison.md) | Compare domains | planned | 5 | P3 | may move earlier |
| [features/ux/pwa-mobile.md](features/ux/pwa-mobile.md) | PWA | planned | 5 | P3 | |
| [features/ux/browser-extension.md](features/ux/browser-extension.md) | Browser extension | planned | 5 | P3 | |

## Roadmap

| Document | Description |
|----------|-------------|
| [roadmap/PHASES.md](roadmap/PHASES.md) | Phase 0–5 map (maturity; not build order) |
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

**Phase column:** `0`–`5` or `-` (shipped core)-see [roadmap/PHASES.md](roadmap/PHASES.md). **Priority** (P0–P3) and **access** (free/pro/both) are separate fields; phase is maturity stage, not category.
