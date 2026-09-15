# Feature: [Title]

> **Location:** Copy this file to `docs/features/<category>/<name>.md` before filling in. All links below use `../../` for that path.

## Metadata

| Field | Value |
|-------|--------|
| **status** | `shipped` \| `planned` \| `in-progress` \| `deferred` |
| **phase** | `0` \| `1` \| `2` \| `organic` \| `pro` \| `ux` \| `-` (shipped core only; must match [README.md](../../README.md) tracker) |
| **access** | `free` \| `pro` \| `both` |
| **tool_id** | From [TOOL_PLUGIN_CONTRACT.md](../../TOOL_PLUGIN_CONTRACT.md) |
| **surface** | Optional: `single` \| `bulk` \| `api` (only for `dns_health`) |

## Summary

One paragraph: what this feature does and who it is for.

## Problem

Who needs this and in what situation.

## Scope

**In scope:**

- …

**Out of scope:**

- …

## User flows

- **Anonymous:** …
- **Logged-in (future):** …

## Architecture

Layer rules: [ARCHITECTURE.md §11](../../ARCHITECTURE.md#11-tool-execution-contract-current--planned). Do not duplicate full architecture here.

| Layer | Responsibility |
|--------|----------------|
| Next.js | … |
| Python | … |

**Reuses existing engine?** yes/no - if yes, entry function (e.g. `DNSChecker.run_all_checks`).

## Data model

Tables/collections if any (otherwise “none”).

## API

Link canonical reference: [API.md](../../API.md).

- Next.js route (planned or shipped): `POST /api/...`
- Python (planned or shipped): `POST /api/check` or `/internal/v1/tools/{tool_id}`

## UI

- Page: `frontend/src/app/...`
- Components: …

## Limits and abuse

Rate limits, max input size, concurrency.

## Monetization

Default: free. Pro attachment: TBD until [METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md) shows demand.

## Dependencies

Other docs/features that must exist first.

## Implementation checklist

- [ ] …

## Acceptance criteria

- [ ] …

## References

- RFCs, MXToolbox/mail-tester analogs, external links.
