# Documentation completion checklist

Gate before any AppShell, Tailwind/shadcn, or Phase 0 backend implementation. Check boxes when verified.

**Last full pass:** 2026-09-15

## UX pack (`docs/ux/`)

- [x] [README.md](../ux/README.md) index
- [x] [CURRENT_UI.md](../ux/CURRENT_UI.md)
- [x] [FRONTEND_STACK.md](../ux/FRONTEND_STACK.md) - Tailwind + shadcn locked
- [x] [INFORMATION_ARCHITECTURE.md](../ux/INFORMATION_ARCHITECTURE.md)
- [x] [SITE_SHELL.md](../ux/SITE_SHELL.md)
- [x] [PAGE_TEMPLATES.md](../ux/PAGE_TEMPLATES.md) T1–T6
- [x] [PHASE_UI_MAP.md](../ux/PHASE_UI_MAP.md)
- [x] [COMPONENT_LIBRARY.md](../ux/COMPONENT_LIBRARY.md)
- [x] [MOCKUP_PLAN.md](../ux/MOCKUP_PLAN.md)
- [x] [STATES_AND_FEEDBACK.md](../ux/STATES_AND_FEEDBACK.md)

## Standards and index

- [x] [DOCUMENTATION_STANDARDS.md](../DOCUMENTATION_STANDARDS.md) - level 1.5 UX
- [x] [README.md](../README.md) - ux link, new platform rows, doc gate link
- [x] [ARCHITECTURE.md](../ARCHITECTURE.md) §12 - MUI current / shadcn planned

## Feature specs

- [x] Platform Phase 0 docs filled (+ generic-tool-bff)
- [x] Phase 1 tool docs filled (bulk + 14 tools)
- [x] Phase 2–3 docs filled (auth, mail, billing, monitoring, pro)
- [x] Phase 5 UX feature docs filled
- [x] Gap docs: scale-async-jobs, privacy-anonymous-mode, deferred stubs
- [x] Shipped dns-health UI references T1 + FRONTEND_STACK

## Roadmap artifacts

- [x] [TOOL_CATALOG.md](TOOL_CATALOG.md)
- [x] [API.md](../API.md) - planned BFF/internal section
- [x] [IMPLEMENTATION_ORDER.md](IMPLEMENTATION_ORDER.md) - Step 0 doc gate

## Automated lint

- [x] `python docs/scripts/lint_feature_docs.py` exits 0

## Sign-off

- [ ] Product owner review date: __________
- [ ] **Implementation allowed** (check when starting code)

Run lint after edits:

```bash
python docs/scripts/lint_feature_docs.py
```
