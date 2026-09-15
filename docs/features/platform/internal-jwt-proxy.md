# Feature: Internal JWT Proxy

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

Next.js server routes call Python with short-lived HMAC/JWT (`INTERNAL_API_SECRET`); browser never calls Python tool URLs directly for new tools.

## Problem

TBD - align with Summary and [PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md).

## Scope

**In:** Sign requests from Next; verify in Flask middleware on `/internal/v1/*`.  
**Out:** Public API keys for developers (separate doc).

## User flows

- **Anonymous:** TBD.
- **Logged-in (future):** TBD.

## Architecture

Reuse pattern from CSRF in [app.py](../../../backend/app.py) but server-to-server only; drop browser CORS on internal routes.

## Data model

None for v1.

## API

TBD. Canonical reference when shipped: [API.md](../../API.md).

## UI

TBD (e.g. `frontend/src/app/tools/...`).

## Limits and abuse

TBD; follow [ARCHITECTURE.md §6](../../ARCHITECTURE.md#6-current-security-model-current) and tool-specific caps.

## Monetization

Default free unless noted; Pro TBD per [METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md).

## Dependencies

[tool-registry.md](tool-registry.md)

## Implementation checklist

- [ ] Env `INTERNAL_API_SECRET` both sides
- [ ] Middleware + sample `/internal/v1/tools/dns_health`

## Acceptance criteria

- [ ] Unsigned internal requests rejected

## References

None for v1.
