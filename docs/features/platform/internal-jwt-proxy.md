# Feature: Internal JWT Proxy

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P1 |
| **status** | shipped |
| **phase** | 0 |
| **access** | both |
| **tool_id** | `_platform` |
| **last_reviewed** | 2026-09-15 |

## Summary

Next.js BFF signs server-to-server requests to Python `/internal/v1/*`; Flask verifies signature. Browsers never call internal tool URLs directly ([INV-3](../../ARCHITECTURE.md)).

## Problem

New tools must not expose Flask on the public internet with only CORS. CSRF protects legacy browser POST to `/api/check`; internal tools need a server-only trust boundary.

## Scope

**In scope:**

- Shared secret `INTERNAL_API_SECRET` (Next + Python)
- Sign: HMAC or short-lived JWT on BFF outbound requests
- Verify: middleware on `/internal/v1/tools/<tool_id>`
- Sample route: `POST /internal/v1/tools/dns_health`

**Out of scope:**

- Developer API keys (public API) - [developer-api-keys.md](../pro-experiments/developer-api-keys.md)
- mTLS (future hardening)

## User flows

- **Anonymous:** N/A (browser uses `/api/tools/[toolId]` BFF only).
- **Logged-in (future):** Same; session handled in Next before proxy.

## Architecture

- Next: `signInternalRequest(body)` in shared lib
- Flask: `@before_request` on `/internal/v1/*` - 401 if invalid/missing
- No CORS allowlist required for internal routes (not browser-facing)
- Legacy `/api/check` + CSRF unchanged until T1 migrates BFF path

## Data model

None for v1.

## API

Documented in [API.md §Planned internal tools](../../API.md#planned-internal-tools-and-bff).

## UI

None for v1.

## Limits and abuse

Reject replay: include timestamp in signed payload; max skew e.g. 60s (implementation detail). Rate limits still apply at BFF edge.

## Monetization

N/A.

## Dependencies

[tool-registry.md](tool-registry.md)

## Implementation checklist

- [x] Env vars documented in `.env.example`
- [x] Flask middleware + tests (unsigned → 401)
- [x] Next signing helper used by generic BFF

## Acceptance criteria

- [x] Unsigned or tampered internal request rejected
- [x] Signed `dns_health` call returns equivalent result to legacy check for same domain

## References

- [generic-tool-bff.md](generic-tool-bff.md)
- [backend/app.py](../../../backend/app.py) CSRF pattern (browser-only contrast)
