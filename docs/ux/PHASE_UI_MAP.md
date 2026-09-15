# Phase UI map

Maps each tracked feature to page template, public route, nav category, and product phase. Source of truth for feature `## UI` sections.

| Feature doc | tool_id | Template | Route | Category | Phase |
|-------------|---------|----------|-------|----------|-------|
| shipped/dns-health-single | dns_health | T1 | `/` | DNS Health | - |
| dns-health/bulk-checker | dns_health | T3 | `/tools/bulk-dns-health` | DNS Health | 1 |
| platform/tool-registry | _platform | - | - | Platform | 0 |
| platform/internal-jwt-proxy | _platform | - | - | Platform | 0 |
| platform/analytics-events | _platform | - | - | Platform | 0 |
| platform/generic-tool-bff | _platform | - | - | Platform | 0 |
| platform/auth-optional-accounts | _platform | T5 | `/dashboard` | Platform | 2 |
| platform/billing-stripe-ready | _platform | T5 | `/dashboard/billing` | Platform | 3 |
| platform/entitlements-quotas | _platform | T5 | `/dashboard` | Platform | 3 |
| platform/scale-async-jobs | _platform | T3 | `/tools/bulk-dns-health` | Platform | 4 |
| platform/privacy-anonymous-mode | _platform | T5 | `/dashboard/settings` | Platform | 2 |
| email/spf-checker | spf_checker | T2 | `/tools/spf-checker` | Email | 1 |
| email/dkim-checker | dkim_checker | T2 | `/tools/dkim-checker` | Email | 1 |
| email/dmarc-checker | dmarc_checker | T2 | `/tools/dmarc-checker` | Email | 1 |
| email/mx-lookup | mx_lookup | T2 | `/tools/mx-lookup` | Email | 1 |
| email/smtp-test | smtp_test | T2 | `/tools/smtp-test` | Email | 1 |
| email/dnsbl-blacklist | dnsbl_lookup | T2 | `/tools/dnsbl-lookup` | Email | 1 |
| email/mail-tester-inbound | mail_tester | T4 | `/tools/mail-tester` | Email | 2 |
| website/ssl-inspector | ssl_inspector | T2 | `/tools/ssl-inspector` | Website | 1 |
| website/http-headers | http_headers | T2 | `/tools/http-headers` | Website | 1 |
| website/redirect-chain | redirect_chain | T2 | `/tools/redirect-chain` | Website | 1 |
| website/http-status | http_status | T2 | `/tools/http-status` | Website | 1 |
| domain/whois-lookup | whois_lookup | T2 | `/tools/whois-lookup` | Domain | 1 |
| domain/domain-expiry | domain_expiry | T2 | `/tools/domain-expiry` | Domain | 1 |
| domain/dns-propagation | dns_propagation | T2 | `/tools/dns-propagation` | Domain | 1 |
| domain/dns-history | dns_history | T2 | `/tools/dns-history` | Domain | 1 |
| monitoring/dns-change-alerts | dns_change_alerts | T5 | `/dashboard/watches` | Monitoring | 3 |
| monitoring/ssl-expiry-alerts | ssl_expiry_alerts | T5 | `/dashboard/watches` | Monitoring | 3 |
| monitoring/domain-expiry-alerts | domain_expiry_alerts | T5 | `/dashboard/watches` | Monitoring | 3 |
| monitoring/uptime-checks | uptime_checks | T5 | `/dashboard/watches` | Monitoring | 3 |
| monitoring/email-health-watch | email_health_watch | T5 | `/dashboard/watches` | Monitoring | 3 |
| pro-experiments/developer-api-keys | api_keys | T5 | `/dashboard/api-keys` | Pro | 3 |
| pro-experiments/export-pdf-json-csv | - | T2/T3 | export actions on tool pages | Pro | 3 |
| pro-experiments/shareable-result-links | - | T2/T1 | share button on results | Pro | 3 |
| pro-experiments/white-label-reports | white_label_reports | T5 | `/dashboard/reports` | Pro | 3 |
| ux/dark-mode | ux_dark_mode | shell | header toggle | Cross-cutting UX | - |
| ux/result-comparison | compare_domains | T1/T3 | compare on results | Product | 2 |
| ux/pwa-mobile | pwa | shell | install prompt | Ecosystem | 5 |
| ux/browser-extension | browser_extension | extension | browser action | Ecosystem | 5 |
| deferred/dnssec-validation | dnssec_checker | T2 | `/tools/dnssec` | Domain | deferred |

Platform rows with template **-** have no public tool page (server/BFF only).

See also [TOOL_CATALOG.md](../roadmap/TOOL_CATALOG.md).
