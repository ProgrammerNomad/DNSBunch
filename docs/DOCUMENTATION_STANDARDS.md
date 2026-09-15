# DNSBunch documentation standards

How the doc system stays precise and consistent over months of development. **Do not add new feature folders until existing specs meet this bar.**

## Three levels of authority

| Level | Paths | Purpose |
|-------|--------|---------|
| **1 - Source of truth** | [ARCHITECTURE.md](ARCHITECTURE.md), [TOOL_PLUGIN_CONTRACT.md](TOOL_PLUGIN_CONTRACT.md), [PRODUCT_STRATEGY.md](PRODUCT_STRATEGY.md), [API.md](API.md), [DNS_RECORDS.md](DNS_RECORDS.md) | Global rules; CURRENT vs PLANNED |
| **1.5 - Product UX** | [ux/**/*.md](ux/) | IA, templates T1–T6, Tailwind + shadcn stack, shell |
| **2 - Feature specifications** | [features/**/*.md](features/) | Per-feature behavior and checklists |
| **3 - Execution tracking** | [README.md](README.md), [roadmap/](roadmap/) | What to build next |

Feature docs **link upward** to Level 1; they do not restate full architecture or duplicate API reference bodies.

## Development phases (0–5)

**Phase** = maturity stage ([roadmap/PHASES.md](roadmap/PHASES.md)). **Not** the same as priority or access.

| Phase | Name |
|-------|------|
| 0 | Foundation (platform) |
| 1 | Free tool platform |
| 2 | Retention and mail |
| 3 | Monetization (Pro experiments) |
| 4 | Scale and advanced (Bulk 4, queues) |
| 5 | Ecosystem and extensions (PWA, extension - not “UX phase”) |

**Implementation order** (what you code next) lives in [roadmap/IMPLEMENTATION_ORDER.md](roadmap/IMPLEMENTATION_ORDER.md)-it can pick any Phase 1 tool when you need it.

## Mandatory feature sections

Every file under `features/<category>/<name>.md` (not `_TEMPLATE.md`) must include **all** sections from [_TEMPLATE.md](features/_TEMPLATE.md), in order. Use concrete text or `None for v1` - **no bare `TBD`** in Problem, Scope, User flows, API, UI, or Limits (doc completion gate).

Feature `## UI` must cite template **T1–T6** and route from [ux/PHASE_UI_MAP.md](ux/PHASE_UI_MAP.md). Frontend: [ux/FRONTEND_STACK.md](ux/FRONTEND_STACK.md) (Tailwind + shadcn only for new UI).

**Do not confuse phase with UX:** phase = product stage ([PHASES.md](roadmap/PHASES.md)); templates/shell/states = [ux/](ux/) (cross-cutting). Use **phase: -** for dark mode and similar shell-wide UX.

**Acceptance criteria:** at least one `- [ ]` or `- [x]` item; never leave the section empty.

## Metadata fields

| Field | Required | Notes |
|-------|----------|--------|
| status | Yes | `shipped` \| `planned` \| `in-progress` \| `deferred` |
| priority | Yes | `P0` (live core) \| `P1` \| `P2` \| `P3` - importance, independent of phase |
| phase | Yes | `0`–`5` or `-` (shipped predating phases); must match [README.md](README.md) |
| access | Yes | `free` \| `pro` \| `both` - **not** a phase |
| tool_id | Yes | [TOOL_PLUGIN_CONTRACT.md](TOOL_PLUGIN_CONTRACT.md) |
| surface | If applicable | `dns_health` only |
| last_verified_against_repo | Shipped only | Date verified against git |
| last_reviewed | Planned / in-progress | Date aligned with Level 1 docs |

Example:

```text
status: planned | priority: P2 | phase: 1 | access: free | tool_id: dmarc_checker
```

## Workflow

```text
README → pick row → feature doc → implement → shipped → CHANGELOG
```

## Quality gate

Copy [_TEMPLATE.md](features/_TEMPLATE.md) into `features/<category>/`, fill every section, set phase per [PHASES.md](roadmap/PHASES.md), add README row.
