# Feature: Generic Tool BFF

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P1 |
| **status** | planned |
| **phase** | 0 |
| **access** | both |
| **tool_id** | `_platform` |
| **last_reviewed** | 2026-09-15 |

## Summary

Single Next.js route pattern `POST /api/tools/[toolId]` validates input, runs `canRun()` stub, emits analytics, signs and proxies to Python internal tool endpoint.

## Problem

Shipped DNS health uses a dedicated [route.ts](../../../frontend/src/app/api/dns/check/route.ts). Every new tool would copy-paste proxy logic without a generic BFF.

## Scope

**In scope:**

- `frontend/src/app/api/tools/[toolId]/route.ts`
- Map `toolId` → internal path `/internal/v1/tools/{tool_id}`
- Request ID header (`X-Request-Id`) for log correlation
- `canRun(session, toolId)` → `{ allowed: true }` stub ([TOOL_PLUGIN_CONTRACT.md](../../TOOL_PLUGIN_CONTRACT.md))
- Integrate [internal-jwt-proxy.md](internal-jwt-proxy.md) signing
- Integrate [analytics-events.md](analytics-events.md)

**Out of scope:**

- Entitlement enforcement (Phase 3)
- Browser direct Flask access

## User flows

- **Anonymous:** Tool page POSTs to same-origin `/api/tools/dmarc_checker` (example); BFF proxies to Python.
- **Logged-in (future):** BFF reads session; `canRun` may apply quotas before proxy.

## Architecture

```text
Browser → POST /api/tools/[toolId] → canRun → analytics → sign → Python internal
```

Legacy: `POST /api/dns/check` remains until T1 optionally switches to `toolId=dns_health&surface=single`.

## Data model

None for v1.

## API

Public BFF documented in [API.md §Planned internal tools and BFF](../../API.md#planned-internal-tools-and-bff).

## UI

None (BFF only). All tool pages **T2+** call this route via `fetch`.

## Limits and abuse

Forward client IP for Flask rate limits. BFF timeout aligned with tool metadata. SSRF validation for URL-taking tools in BFF before proxy ([ARCHITECTURE §20](../../ARCHITECTURE.md)).

## Monetization

Hook point for future quota denial messages to UI.

## Dependencies

[tool-registry.md](tool-registry.md), [internal-jwt-proxy.md](internal-jwt-proxy.md)

## Implementation checklist

- [ ] Route handler + toolId allowlist or registry sync
- [ ] JWT/HMAC signing
- [ ] Analytics hooks
- [ ] Parallel path for `dns_health` (optional dev flag)

## Acceptance criteria

- [ ] Unknown `toolId` → 404 JSON error
- [ ] Valid signed proxy returns tool JSON envelope
- [ ] `canRun` stub allows anonymous for free tools

## References

- [ARCHITECTURE.md §12](../../ARCHITECTURE.md#12-nextjs-bff-architecture-current--planned)
