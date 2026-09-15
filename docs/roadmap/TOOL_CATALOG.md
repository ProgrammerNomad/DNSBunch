# Tool catalog

Single reference: `tool_id`, SEO slug, category, UI template, phase. Nav and [PHASE_UI_MAP.md](../ux/PHASE_UI_MAP.md) must stay aligned.

| tool_id | Slug | Category | Template | Phase | Access |
|---------|------|----------|----------|-------|--------|
| dns_health | - (home) | DNS Health | T1 | - | free |
| dns_health | bulk-dns-health | DNS Health | T3 | 1 | both |
| spf_checker | spf-checker | Email | T2 | 1 | free |
| dkim_checker | dkim-checker | Email | T2 | 1 | free |
| dmarc_checker | dmarc-checker | Email | T2 | 1 | free |
| mx_lookup | mx-lookup | Email | T2 | 1 | free |
| smtp_test | smtp-test | Email | T2 | 1 | free |
| dnsbl_lookup | dnsbl-lookup | Email | T2 | 1 | free |
| mail_tester | mail-tester | Email | T4 | 2 | both |
| ssl_inspector | ssl-inspector | Website | T2 | 1 | free |
| http_headers | http-headers | Website | T2 | 1 | free |
| redirect_chain | redirect-chain | Website | T2 | 1 | free |
| http_status | http-status | Website | T2 | 1 | free |
| whois_lookup | whois-lookup | Domain | T2 | 1 | free |
| domain_expiry | domain-expiry | Domain | T2 | 1 | free |
| dns_propagation | dns-propagation | Domain | T2 | 1 | free |
| dns_history | dns-history | Domain | T2 | 1 | pro |
| dnssec_checker | dnssec | Domain | T2 | deferred | free |

Platform `tool_id` `_platform` has no public slug. Pro cross-cutting features (export, share links) attach to T1/T2/T3.
