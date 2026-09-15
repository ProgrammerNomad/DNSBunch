# DNSBunch UX documentation

**Authority level 1.5** - product UX and frontend stack. Normative for layout, templates, and shadcn usage. Feature specs link here from `## UI`; they do not duplicate wireframes.

| Doc | Purpose |
|-----|---------|
| [CURRENT_UI.md](CURRENT_UI.md) | As-built UI (legacy MUI home) |
| [FRONTEND_STACK.md](FRONTEND_STACK.md) | Tailwind + shadcn/ui (target stack) |
| [INFORMATION_ARCHITECTURE.md](INFORMATION_ARCHITECTURE.md) | URLs, sitemap, navigation |
| [SITE_SHELL.md](SITE_SHELL.md) | Global header, footer, AppShell |
| [PAGE_TEMPLATES.md](PAGE_TEMPLATES.md) | T1–T6 page patterns |
| [PHASE_UI_MAP.md](PHASE_UI_MAP.md) | Feature → template → route |
| [COMPONENT_LIBRARY.md](COMPONENT_LIBRARY.md) | shadcn components and composites |
| [MOCKUP_PLAN.md](MOCKUP_PLAN.md) | Design review order and sign-off |
| [STATES_AND_FEEDBACK.md](STATES_AND_FEEDBACK.md) | Loading, errors, empty, rate limits |

**Upstream:** [ARCHITECTURE.md §11](../ARCHITECTURE.md#11-tool-execution-contract-current--planned), [TOOL_PLUGIN_CONTRACT.md](../TOOL_PLUGIN_CONTRACT.md).

**Downstream:** Every [features/](../features/) `## UI` section references a template id (T1–T6) and route from [PHASE_UI_MAP.md](PHASE_UI_MAP.md).

## Three dimensions (do not mix)

| Dimension | Where it lives | Meaning |
|-----------|----------------|---------|
| **Phase** | Feature metadata, [PHASES.md](../roadmap/PHASES.md) | Product maturity (0–5, or `-`) |
| **Priority** | Feature metadata | P0–P3 importance |
| **UX template** | This folder (T1–T6), shell, states | How the feature is presented |

Example - Bulk DNS health: **phase 1**, **priority P1**, **template T3** (+ T1 drill-down), states per [STATES_AND_FEEDBACK.md](STATES_AND_FEEDBACK.md). Architecture owns `bulk_analyze()`; product strategy owns free tier; implementation order owns *when* you code it.

**UX is cross-cutting:** dark mode, responsive layout, and loading states are not “Phase 5 only.” Phase 5 is **ecosystem** (PWA, extension, community) - see [PHASES.md § Phase 5](../roadmap/PHASES.md).

**Doc completion gate:** [roadmap/DOC_COMPLETION_CHECKLIST.md](../roadmap/DOC_COMPLETION_CHECKLIST.md).
