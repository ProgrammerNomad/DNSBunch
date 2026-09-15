# DNSBunch Product Strategy

## Mission

Grow DNSBunch slowly from a working **IntoDNS-style DNS health checker** into a **web infrastructure and email diagnostics toolbox** (MXToolbox-like breadth), without forcing an immediate paid product launch.

## Principles

1. **Keep what works** - The live single-domain health check stays the core; extend via reusable platform patterns.
2. **Free tools = SEO and trust** - Public lookups remain available without login; do not paywall basic diagnostics.
3. **Daily tools rule** - Add a tool when you repeatedly need it in your own work.
4. **Evidence-driven monetization** - Do not pre-commit to “users will pay for X”; measure first (see [roadmap/METRICS_DASHBOARD.md](roadmap/METRICS_DASHBOARD.md)).
5. **Architecture reuse** - Next.js for product; Python for all diagnostics; one DNS health engine for single + bulk.

## Freemium posture (future)

| Tier | Intent |
|------|--------|
| Anonymous | IP rate limits; full health check (today) |
| Free account | History, mail-test sessions, slightly higher limits (planned) |
| Pro | Monitoring, API keys, large bulk, exports-only after funnel data (planned) |

**Conversion message (future):** “Watch this domain and alert me when DNS changes”-not “pay to run this lookup.”

## Relationship to other work

DNSBunch can evolve alongside **WhoisExtractor**; DNSBunch profitability is not a day-one requirement.

## Tool roadmap map

See [README.md](README.md) index for every feature doc and status.

## Related docs

- [ARCHITECTURE.md](ARCHITECTURE.md) - authoritative CURRENT vs PLANNED and invariants
- [roadmap/IMPLEMENTATION_ORDER.md](roadmap/IMPLEMENTATION_ORDER.md)
