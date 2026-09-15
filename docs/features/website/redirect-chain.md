# Feature: Redirect Chain

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | planned |
| **phase** | organic |
| **access** | free |
| **tool_id** | `redirect_chain` |
| **last_reviewed** | 2026-09-15 |

## Summary

Follow redirects up to N hops; show status codes and final URL.

## Problem

TBD - align with Summary and [PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md).

## Scope

**In scope:** TBD.

**Out of scope:** None for v1 unless noted.

## User flows

- **Anonymous:** TBD.
- **Logged-in (future):** TBD.

## Architecture

Python httpx HEAD/GET chain. SSRF: [ARCHITECTURE.md §20](../../ARCHITECTURE.md#20-http--website-tool-security-planned).

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

None for v1 unless listed elsewhere in this doc.

## Implementation checklist

- [ ] TBD

## Acceptance criteria

- [ ] Loop detection; max hops enforced

## References

None for v1.
