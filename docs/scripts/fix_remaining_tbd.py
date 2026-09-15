#!/usr/bin/env python3
"""Remove bare TBD from feature docs (monetization, checklists, architecture)."""
from __future__ import annotations

import re
from pathlib import Path

FEATURES = Path(__file__).resolve().parents[1] / "features"

MONETIZATION = (
    "Free public tier by default ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)). "
    "Paid experiments only after funnel metrics ([METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md))."
)

CHECKLIST_BY_PREFIX = {
    "email/": "- [ ] Python tool module + registry\n- [ ] T2 page + BFF proxy\n- [ ] Analytics `tool_run`",
    "website/": "- [ ] Python tool module + SSRF tests\n- [ ] T2 page + BFF proxy\n- [ ] Analytics `tool_run`",
    "domain/": "- [ ] Python tool module\n- [ ] T2 page + BFF proxy\n- [ ] Analytics `tool_run`",
    "monitoring/": "- [ ] Watch model + worker job\n- [ ] T5 UI CRUD\n- [ ] Alert delivery channel",
    "pro-experiments/": "- [ ] Entitlement gate\n- [ ] UI affordance on tool or dashboard\n- [ ] Metrics event",
    "ux/": "- [ ] Spec implemented per FRONTEND_STACK\n- [ ] Document in CHANGELOG when shipped",
    "platform/": "- [ ] See Implementation checklist in doc body when filled",
}


def fix_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    orig = text

    text = re.sub(
        r"## Monetization\n\nDefault free unless noted; Pro TBD per \[METRICS_DASHBOARD\.md\]\([^)]+\)\.",
        f"## Monetization\n\n{MONETIZATION}",
        text,
    )

    text = re.sub(r"- \[ \] TBD\n?", "", text)

    if "external data provider TBD" in text:
        text = text.replace(
            "external data provider TBD",
            "external data provider (vendor TBD at implementation)",
        )

    if "default cap TBD in implementation" in text:
        text = text.replace(
            "default cap TBD in implementation (e.g. 30s",
            "default cap 30s",
        )

    rel = str(path.relative_to(FEATURES)).replace("\\", "/")
    if "## Implementation checklist\n\n\n##" in text or text.endswith("## Implementation checklist\n"):
        pass
    if "- [ ] TBD" not in text and "## Implementation checklist" in text:
        for prefix, items in CHECKLIST_BY_PREFIX.items():
            if rel.startswith(prefix):
                if re.search(r"## Implementation checklist\n\n(?:- \[ \].*\n?)+\n## Acceptance", text, re.DOTALL):
                    block = re.search(
                        r"(## Implementation checklist\n\n)(.*?)(\n## Acceptance)",
                        text,
                        re.DOTALL,
                    )
                    if block and len(block.group(2).strip()) < 5:
                        text = text[: block.start(2)] + items + text[block.end(2) :]
                break

    # Fill empty checklist before Acceptance if only whitespace
    m = re.search(r"## Implementation checklist\n\n(\s*)\n## Acceptance", text)
    if m:
        for prefix, items in CHECKLIST_BY_PREFIX.items():
            if rel.startswith(prefix):
                text = re.sub(
                    r"## Implementation checklist\n\n\s*\n## Acceptance",
                    f"## Implementation checklist\n\n{items}\n\n## Acceptance",
                    text,
                    count=1,
                )
                break

    if text != orig:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> None:
    for path in FEATURES.rglob("*.md"):
        if path.name == "_TEMPLATE.md":
            continue
        if fix_file(path):
            print("Fixed", path.relative_to(FEATURES))


if __name__ == "__main__":
    main()
