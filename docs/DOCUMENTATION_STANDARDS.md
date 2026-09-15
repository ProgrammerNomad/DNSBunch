# DNSBunch documentation standards

How the doc system stays precise and consistent over months of development. **Do not add new feature folders until existing specs meet this bar.**

## Three levels of authority

| Level | Paths | Purpose |
|-------|--------|---------|
| **1 - Source of truth** | [ARCHITECTURE.md](ARCHITECTURE.md), [TOOL_PLUGIN_CONTRACT.md](TOOL_PLUGIN_CONTRACT.md), [PRODUCT_STRATEGY.md](PRODUCT_STRATEGY.md), [API.md](API.md), [DNS_RECORDS.md](DNS_RECORDS.md) | Global rules, boundaries, CURRENT vs PLANNED, HTTP payloads |
| **2 - Feature specifications** | [features/**/*.md](features/) | Per-feature behavior, checklists, acceptance criteria |
| **3 - Execution tracking** | [README.md](README.md), [roadmap/IMPLEMENTATION_ORDER.md](roadmap/IMPLEMENTATION_ORDER.md), [roadmap/METRICS_DASHBOARD.md](roadmap/METRICS_DASHBOARD.md) | What to work on next |

Feature docs **link upward** to Level 1; they do not restate full architecture or duplicate API reference bodies.

## Mandatory feature sections

Every file under `features/<category>/<name>.md` (not `_TEMPLATE.md`) must include **all** sections from [_TEMPLATE.md](features/_TEMPLATE.md), in order:

1. Metadata  
2. Summary  
3. Problem  
4. Scope  
5. User flows  
6. Architecture  
7. Data model  
8. API  
9. UI  
10. Limits and abuse  
11. Monetization  
12. Dependencies  
13. Implementation checklist  
14. Acceptance criteria  
15. References  

If a section does not apply yet, write **`None for v1.`**, **`TBD`**, or **`See ARCHITECTURE.md §X`** - do not omit the heading.

**Exception:** Architecturally unique features (e.g. Mail Tester) may add **extra** subsections after Architecture (e.g. inbound SMTP diagram) but must still include every standard section.

## Metadata fields

| Field | Required | Notes |
|-------|----------|--------|
| status | Yes | `shipped` \| `planned` \| `in-progress` \| `deferred` |
| priority | Yes | `P0` (live core) \| `P1` (platform / bulk / mail) \| `P2` (organic / pro tools) \| `P3` (ux / deferred) |
| phase | Yes | Must match [README.md](README.md) tracker: `0` \| `1` \| `2` \| `organic` \| `pro` \| `ux` \| `-` |
| access | Yes | `free` \| `pro` \| `both` |
| tool_id | Yes | See [TOOL_PLUGIN_CONTRACT.md](TOOL_PLUGIN_CONTRACT.md) |
| surface | If applicable | `single` \| `bulk` \| `api` for `dns_health` only |
| last_verified_against_repo | Shipped only | Date when checked against git |
| last_reviewed | Planned / in-progress | Date spec was last aligned with Level 1 docs |

## Shipped vs planned maintenance

- **Shipped:** Re-verify against repo when code changes; update `last_verified_against_repo`.
- **Planned:** Update `last_reviewed` when ARCHITECTURE or plugin contract changes; no claim of deployed behavior.

## Workflow

```text
README (Level 3) → pick planned row → feature doc (Level 2) → implement checklist → test → status shipped → CHANGELOG
```

## Quality gate before new features

Before adding a new `features/*/*.md` file:

1. Copy [_TEMPLATE.md](features/_TEMPLATE.md) into the correct category folder.  
2. Fill every section (stubs allowed).  
3. Add a row to [README.md](README.md).  
4. Do not duplicate Level 1 content-link instead.
