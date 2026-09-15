# Mockup and UX sign-off plan

Documentation-first gate: complete specs here before [IMPLEMENTATION_ORDER](../roadmap/IMPLEMENTATION_ORDER.md) coding steps.

## Review order

| Step | Artifact | Output |
|------|----------|--------|
| 1 | [CURRENT_UI.md](CURRENT_UI.md) | Agree baseline and migration risks |
| 2 | [FRONTEND_STACK.md](FRONTEND_STACK.md) | Lock Tailwind + shadcn |
| 3 | [INFORMATION_ARCHITECTURE.md](INFORMATION_ARCHITECTURE.md) + [SITE_SHELL.md](SITE_SHELL.md) | Agree nav and chrome |
| 4 | [PAGE_TEMPLATES.md](PAGE_TEMPLATES.md) T6 → T2 → T3 → T1 | Toolbox story |
| 5 | T4, T5 wireframes | Phase 2 readiness |
| 6 | [PHASE_UI_MAP.md](PHASE_UI_MAP.md) | Every feature has route + template |

## Figma (optional)

| Priority | Screen |
|----------|--------|
| P0 | T1 home + SiteHeader/SiteFooter (desktop + mobile) |
| P1 | T6 hub + one T2 example (DMARC) |
| P2 | T3 bulk table |
| Defer | Individual tools beyond one T2 example |

Wireframes in markdown count as sufficient for doc gate; Figma links can be appended to this file later.

## Sign-off checklist (UX doc phase)

- [ ] All `docs/ux/*.md` files exist and cross-link
- [ ] [DOCUMENTATION_STANDARDS.md](../DOCUMENTATION_STANDARDS.md) lists ux authority
- [ ] No unresolved conflicts between IA and PHASE_UI_MAP routes
- [ ] FRONTEND_STACK forbids new MUI
- [ ] Stakeholder review date recorded in [DOC_COMPLETION_CHECKLIST.md](../roadmap/DOC_COMPLETION_CHECKLIST.md)

## Per-tool mockup rule

Do **not** create separate high-fidelity mockups per tool. Only:

- Copy block in feature `## UI` (fields, special widgets)
- Template id from [PAGE_TEMPLATES.md](PAGE_TEMPLATES.md)

## After sign-off

Implementation order: AppShell + T1 migration → Phase 0 backend → first T2/T3 tool ([phase_0 plan](C:/Users/shivs/.cursor/plans/phase_0_implementation_start_addbdc4c.plan.md)).
