# Feature: SSL Inspector

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | planned |
| **phase** | 1 |
| **access** | free |
| **tool_id** | `ssl_inspector` |
| **last_reviewed** | 2026-09-15 |

## Summary

Certificate expiry, issuer, chain, TLS versions for HTTPS host.

## Problem

TBD - align with Summary and [PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md).

## Scope

**In scope:** TBD.

**Out of scope:** None for v1 unless noted.

## User flows

- **Anonymous:** TBD.
- **Logged-in (future):** TBD.

## Architecture

Python (`ssl`/`cryptography`) or Next edge fetch with cert parse; prefer Python for consistency. SSRF rules: [ARCHITECTURE.md §20](../../ARCHITECTURE.md#20-http--website-tool-security-planned).

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

Platform skeleton recommended.

## Implementation checklist

- [ ] Host input validation
- [ ] Expiry warning thresholds

## Acceptance criteria

- [ ] Valid/invalid/expired clearly shown

## References

None for v1.
