# DNSBunch development phases

**Phase** = maturity stage a feature belongs to (not build order).  
**Implementation order** = what you code next → [IMPLEMENTATION_ORDER.md](IMPLEMENTATION_ORDER.md) + [README.md](../README.md).

| Phase | Name | Goal |
|-------|------|------|
| **0** | Foundation | Shared platform every tool uses |
| **1** | Free tool platform | Free diagnostic toolbox expansion |
| **2** | Retention and mail | Accounts, persistence, mail tester |
| **3** | Monetization | Pro experiments (data-driven) |
| **4** | Scale and advanced | Bulk 4, queues, Redis, high volume |
| **5** | UX and ecosystem | Dark mode, PWA, extension |

Separate fields (do not mix into phase):

| Field | Values | Meaning |
|-------|--------|---------|
| **status** | shipped, planned, in-progress, deferred | Delivery state |
| **priority** | P0, P1, P2, P3 | Importance / urgency |
| **access** | free, pro, both | Who can use it |
| **surface** | single, bulk, api | Only for `dns_health` |

Shipped core DNS health uses **phase: -** (predates numbered phases).

---

## Phase 0 - Foundation

- [tool-registry.md](../features/platform/tool-registry.md)
- [internal-jwt-proxy.md](../features/platform/internal-jwt-proxy.md)
- [analytics-events.md](../features/platform/analytics-events.md)

Platform work (may not have separate feature files): generic `/api/tools/[toolId]`, shared tool page shell, result contract, request ID, shared errors, rate-limit abstraction - see [TOOL_PLUGIN_CONTRACT.md](../TOOL_PLUGIN_CONTRACT.md), [ARCHITECTURE.md](../ARCHITECTURE.md).

---

## Phase 1 - Free diagnostic expansion

Build when **you need the tool**; order is flexible.

- [bulk-checker.md](../features/dns-health/bulk-checker.md) - **Bulk 1–3 only** (Bulk 4 → Phase 4)
- Email: SPF, DKIM, DMARC, MX, SMTP, DNSBL
- Website: SSL, HTTP headers, redirect chain, HTTP status
- Domain: WHOIS, domain expiry, DNS propagation, DNS history (lookup/history UI may later tie to Phase 2 DB)

---

## Phase 2 - Retention and mail

- [auth-optional-accounts.md](../features/platform/auth-optional-accounts.md)
- [mail-tester-inbound.md](../features/email/mail-tester-inbound.md)
- PostgreSQL, sessions, saved history (infrastructure; documented in [ARCHITECTURE.md §16](../ARCHITECTURE.md))

---

## Phase 3 - Monetization and Pro experiments

Only after Phase 1–2 usage data. Not a commitment to ship every item.

- [entitlements-quotas.md](../features/platform/entitlements-quotas.md)
- [billing-stripe-ready.md](../features/platform/billing-stripe-ready.md)
- Monitoring and alerts (DNS, SSL, domain expiry, uptime, email health watch)
- [developer-api-keys.md](../features/pro-experiments/developer-api-keys.md)
- Export, shareable links, white-label reports

---

## Phase 4 - Scale and advanced

- Bulk 4 (100+ domains): job IDs, queues, workers - see [bulk-checker.md](../features/dns-health/bulk-checker.md)
- Redis, distributed workers, high-volume API

---

## Phase 5 - UX and ecosystem

- Dark mode, result comparison (may move earlier if bulk/history needs it), PWA, browser extension

---

## Examples

```text
DMARC     → phase 1, priority P2, access free
Mail Tester → phase 2, priority P1, access both
DNS watch   → phase 3, priority P2, access both
Dark mode   → phase 5, priority P3, access free
```
