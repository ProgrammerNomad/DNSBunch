# Feature: Internal JWT Proxy

## Metadata

| Field | Value |
|-------|--------|
| **status** | planned |
| **phase** | 0 |
| **access** | both |
| **tool_id** | `_platform` |

## Summary

Next.js server routes call Python with short-lived HMAC/JWT (`INTERNAL_API_SECRET`); browser never calls Python tool URLs directly for new tools.

## Scope

**In:** Sign requests from Next; verify in Flask middleware on `/internal/v1/*`.  
**Out:** Public API keys for developers (separate doc).

## Architecture

Reuse pattern from CSRF in [app.py](../../../backend/app.py) but server-to-server only; drop browser CORS on internal routes.

## Dependencies

[tool-registry.md](tool-registry.md)

## Implementation checklist

- [ ] Env `INTERNAL_API_SECRET` both sides
- [ ] Middleware + sample `/internal/v1/tools/dns_health`

## Acceptance criteria

- [ ] Unsigned internal requests rejected
