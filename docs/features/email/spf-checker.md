# Feature: SPF Checker

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | planned |
| **phase** | organic |
| **access** | free |
| **tool_id** | `spf_checker` |
| **last_reviewed** | 2026-09-15 |

## Summary

Standalone SPF record lookup and syntax validation for a domain (SEO: “check SPF record”).

## Problem

TBD - align with Summary and [PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md).

## Scope

**In:** TXT at root, parse mechanisms, note DNS lookup count / common errors.  
**Out:** Sending live test mail (see mail-tester).

## User flows

- **Anonymous:** TBD.
- **Logged-in (future):** TBD.

## Architecture

Python: dnspython TXT parse; optional reuse of `_check_spf_record` from [dns_checker.py](../../../backend/dns_checker.py). Next: `/tools/spf-checker`.

## Data model

None for v1.

## API

Extend via [TOOL_PLUGIN_CONTRACT.md](../../TOOL_PLUGIN_CONTRACT.md); [API.md](../../API.md) when shipped.

## UI

TBD (e.g. `frontend/src/app/tools/...`).

## Limits and abuse

TBD; follow [ARCHITECTURE.md §6](../../ARCHITECTURE.md#6-current-security-model-current) and tool-specific caps.

## Monetization

Default free unless noted; Pro TBD per [METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md).

## Dependencies

Platform skeleton recommended, not required.

## Implementation checklist

- [ ] Extract or wrap SPF logic from engine
- [ ] SEO page + event `tool_id=spf_checker`

## Acceptance criteria

- [ ] Output matches health check SPF section for same domain

## References

None for v1.
