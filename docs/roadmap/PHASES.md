# DNSBunch development phases

**Phase** = product maturity stage (not build order, not UX layout).  
**Implementation order** = what you code next → [IMPLEMENTATION_ORDER.md](IMPLEMENTATION_ORDER.md) + [README.md](../README.md).

**UX is cross-cutting:** templates **T1–T6**, shell, states, dark mode, and responsive rules live in [ux/](../ux/) and apply in every phase - not only Phase 5. See [ux/README.md](../ux/README.md#three-dimensions-do-not-mix).

| Phase | Name | Goal |
|-------|------|------|
| **0** | Foundation | Shared platform every tool uses |
| **1** | Free tool platform | Free diagnostic toolbox expansion |
| **2** | Retention and mail | Accounts, persistence, mail tester, saved results |
| **3** | Monetization | Pro experiments (data-driven) |
| **4** | Scale and advanced | Bulk 4, queues, Redis, high volume |
| **5** | Ecosystem and extensions | PWA, browser extension, community, education, integrations |

Separate fields (do not mix into phase):

| Field | Values | Meaning |
|-------|--------|---------|
| **status** | shipped, planned, in-progress, deferred | Delivery state |
| **priority** | P0, P1, P2, P3 | Importance / urgency |
| **access** | free, pro, both | Who can use it |
| **surface** | single, bulk, api | Only for `dns_health` |

Use **phase: -** for shipped core or **cross-cutting UX** features that ship with the shell (e.g. dark mode), not a late product phase.

Shipped core DNS health uses **phase: -** (predates numbered phases).

---

## Phase 0 - Foundation

- [tool-registry.md](../features/platform/tool-registry.md)
- [internal-jwt-proxy.md](../features/platform/internal-jwt-proxy.md)
- [analytics-events.md](../features/platform/analytics-events.md)
- [generic-tool-bff.md](../features/platform/generic-tool-bff.md)

Platform work (may not have separate feature files): shared tool page shell, result contract, request ID - see [TOOL_PLUGIN_CONTRACT.md](../TOOL_PLUGIN_CONTRACT.md), [ARCHITECTURE.md](../ARCHITECTURE.md), [SITE_SHELL.md](../ux/SITE_SHELL.md).

---

## Phase 1 - Free diagnostic expansion

Build when **you need the tool**; order is flexible. Present with **T1/T2/T3** per [PAGE_TEMPLATES.md](../ux/PAGE_TEMPLATES.md).

- [bulk-checker.md](../features/dns-health/bulk-checker.md) - **Bulk 1–3 only** (Bulk 4 → Phase 4)
- Email: SPF, DKIM, DMARC, MX, SMTP, DNSBL
- Website: SSL, HTTP headers, redirect chain, HTTP status
- Domain: WHOIS, domain expiry, DNS propagation, DNS history (UI; DB may tie to Phase 2)

Optional Phase 1 product feature: [result-comparison.md](../features/ux/result-comparison.md) after bulk (**phase 2** if history required).

---

## Phase 2 - Retention and mail

- [auth-optional-accounts.md](../features/platform/auth-optional-accounts.md)
- [mail-tester-inbound.md](../features/email/mail-tester-inbound.md)
- [result-comparison.md](../features/ux/result-comparison.md) - full value with history
- [privacy-anonymous-mode.md](../features/platform/privacy-anonymous-mode.md)
- PostgreSQL, sessions, saved history ([ARCHITECTURE.md §16](../ARCHITECTURE.md))

---

## Phase 3 - Monetization and Pro experiments

Only after Phase 1–2 usage data. Not a commitment to ship every item.

- [entitlements-quotas.md](../features/platform/entitlements-quotas.md)
- [billing-stripe-ready.md](../features/platform/billing-stripe-ready.md)
- Monitoring and alerts
- [developer-api-keys.md](../features/pro-experiments/developer-api-keys.md)
- Export, shareable links, white-label reports

---

## Phase 4 - Scale and advanced

- Bulk 4: [scale-async-jobs.md](../features/platform/scale-async-jobs.md), [bulk-checker.md](../features/dns-health/bulk-checker.md)
- Redis, distributed workers, high-volume API

---

## Phase 5 - Ecosystem and extensions

Not “UX phase” - UX is ongoing in [ux/](../ux/).

- [pwa-mobile.md](../features/ux/pwa-mobile.md)
- [browser-extension.md](../features/ux/browser-extension.md)
- Deferred: [community-forum.md](../features/deferred/community-forum.md), [interactive-tutorial.md](../features/deferred/interactive-tutorial.md), [dns-best-practices-guide.md](../features/deferred/dns-best-practices-guide.md)

---

## Cross-cutting UX (not a product phase)

Implement with AppShell and templates; see feature specs for tracking.

| Topic | Doc |
|-------|-----|
| Site shell, nav | [SITE_SHELL.md](../ux/SITE_SHELL.md) |
| Templates T1–T6 | [PAGE_TEMPLATES.md](../ux/PAGE_TEMPLATES.md) |
| Tailwind + shadcn | [FRONTEND_STACK.md](../ux/FRONTEND_STACK.md) |
| Loading / error / 429 | [STATES_AND_FEEDBACK.md](../ux/STATES_AND_FEEDBACK.md) |
| Dark mode | [dark-mode.md](../features/ux/dark-mode.md) - **phase: -**, priority P3 |

---

## Examples

```text
DMARC            → phase 1, priority P2, access free, template T2
Mail Tester      → phase 2, priority P1, access both, template T4
DNS watch        → phase 3, priority P2, access both, template T5
Bulk health      → phase 1, priority P1, surface bulk, template T3 + T1 drill-down
Dark mode        → phase -, priority P3 (cross-cutting UX)
Result compare   → phase 2, priority P3 (after bulk; history optional)
PWA              → phase 5, priority P3 (ecosystem)
```
