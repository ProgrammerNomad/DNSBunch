# Feature: [Title]

> Copy to `docs/features/<category>/<name>.md`. All links use `../../`. **Every section below is required** ([DOCUMENTATION_STANDARDS.md](../../DOCUMENTATION_STANDARDS.md)).

## Metadata

| Field | Value |
|-------|--------|
| **status** | `shipped` \| `planned` \| `in-progress` \| `deferred` |
| **priority** | `P0` \| `P1` \| `P2` \| `P3` |
| **phase** | `0` \| `1` \| `2` \| `organic` \| `pro` \| `ux` \| `-` (match [README.md](../../README.md)) |
| **access** | `free` \| `pro` \| `both` |
| **tool_id** | From [TOOL_PLUGIN_CONTRACT.md](../../TOOL_PLUGIN_CONTRACT.md) |
| **surface** | Optional: `single` \| `bulk` \| `api` (only `dns_health`) |
| **last_verified_against_repo** | Shipped only: `YYYY-MM-DD` |
| **last_reviewed** | Planned/in-progress: `YYYY-MM-DD` |

## Summary

One paragraph.

## Problem

Who needs this and when.

## Scope

**In scope:**

- …

**Out of scope:**

- …

## User flows

- **Anonymous:** …
- **Logged-in (future):** …

## Architecture

[ARCHITECTURE.md §11](../../ARCHITECTURE.md#11-tool-execution-contract-current--planned). Feature-specific detail only.

| Layer | Responsibility |
|--------|----------------|
| Next.js | … |
| Python | … |

**Reuses existing engine?** yes/no - entry function if yes.

## Data model

PostgreSQL / storage, or `None for v1.`

## API

[API.md](../../API.md) when endpoints exist; else `TBD`.

## UI

Routes and components, or `TBD`.

## Limits and abuse

Rate limits, caps, SSRF (HTTP tools), or `TBD`.

## Monetization

Default free; Pro TBD per [METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md).

## Dependencies

Other features or `None`.

## Implementation checklist

- [ ] …

## Acceptance criteria

- [ ] …

## References

RFCs, external tools, or `None for v1.`
