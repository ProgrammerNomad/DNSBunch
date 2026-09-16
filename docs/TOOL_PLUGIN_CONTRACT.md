# Tool Plugin Contract

Standard for adding new DNSBunch tools so each can share proxies, limits, analytics, and future entitlements.

**Normative layer boundaries and invariants:** [ARCHITECTURE.md §11](ARCHITECTURE.md#11-tool-execution-contract-current--planned) and [INV-1–INV-5](ARCHITECTURE.md#architecture-invariants).

## Status

**Planned** - contract describes target shape; only DNS health (`dns_health`) is shipped today.

## tool_id naming

- Lowercase snake_case: `dns_health`, `dmarc_checker`, `dnsbl_lookup`, `mail_tester`.
- One `tool_id` per user-facing tool page.
- **DNS health bulk/API:** same `tool_id` = `dns_health`; use **`surface`**: `single` | `bulk` | `api` ([ADR-001](ARCHITECTURE.md#adr-001-dns-health-bulk-is-a-surface-not-a-separate-tool_id)). Do not use `dns_health_bulk` as a tool_id.

## Shared response shape (target)

```json
{
  "tool_id": "dmarc_checker",
  "input": { "domain": "example.com" },
  "status": "completed",
  "timestamp": "2026-09-15T12:00:00",
  "checks": [],
  "summary": { "total": 0, "passed": 0, "warnings": 0, "errors": 0 },
  "meta": { "duration_ms": 120 }
}
```

**Shipped DNS health** uses a compatible but older top-level shape (`domain`, `checks` as map of categories)-see [features/shipped/dns-health-single.md](features/shipped/dns-health-single.md). New tools should adopt the shape above; health check may gain a thin adapter later.

## Python layout (target)

```text
backend/
  dns_checker.py          # shipped monolith engine
  tools/                  # planned
    registry.py
    dns_health/
    dmarc_checker/
```

Execution entry for health (shipped):

```python
checker = DNSChecker(domain)
result = await checker.run_all_checks(requested_checks)
```

## Next.js layout (target)

```text
frontend/src/app/
  api/dns/check/route.ts           # shipped BFF for health
  api/tools/[toolId]/route.ts      # planned generic proxy
  tools/[toolSlug]/page.tsx        # planned SEO tool pages
```

Each API route should:

1. Validate input
2. Call `canRun(session, toolId)` (stub: always allow anonymous for free tools)
3. Emit analytics event
4. Proxy to Python with internal JWT (planned)

## Entitlements hook (planned)

```typescript
canRun(user, toolId): { allowed: boolean; reason?: string }
```

Default for public tools: `allowed: true` with IP rate limits enforced in Flask/Next.

## Analytics events (planned)

| Event | Fields |
|-------|--------|
| `tool_view` | tool_id, path |
| `tool_run` | tool_id, success, duration_ms |
| `tool_error` | tool_id, code |

No domain names in anonymous aggregate logs by default.

## mail_tester (inbound - not registry proxy)

`mail_tester` uses [`/api/mail-test/*`](../frontend/src/app/api/mail-test/) and [`backend/mail_tester/`](../backend/mail_tester/). Scoring **orchestrates** `run_spf_checker`, `run_dmarc_checker`, `run_dkim_checker`, and `run_dnsbl_lookup` only ([INV-6](ARCHITECTURE.md)). Do not add `mail_tester` to the generic tools proxy allowlist.

## Related docs

- [ARCHITECTURE.md](ARCHITECTURE.md)
- [features/platform/tool-registry.md](features/platform/tool-registry.md)
