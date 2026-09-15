#!/usr/bin/env python3
"""Fail if feature docs contain forbidden bare TBD in key sections."""
from __future__ import annotations

import re
import sys
from pathlib import Path

DOCS = Path(__file__).resolve().parents[1]
FEATURES = DOCS / "features"

FORBIDDEN_SECTIONS = (
    "Problem",
    "Scope",
    "User flows",
    "API",
    "UI",
    "Limits and abuse",
)

TBD_PATTERN = re.compile(r"\bTBD\b", re.IGNORECASE)


def check_file(path: Path) -> list[str]:
    if path.name == "_TEMPLATE.md":
        return []
    text = path.read_text(encoding="utf-8")
    errors: list[str] = []
    for section in FORBIDDEN_SECTIONS:
        m = re.search(
            rf"## {section}\n\n(.*?)(\n## |\Z)",
            text,
            re.DOTALL,
        )
        if not m:
            errors.append(f"{path.name}: missing ## {section}")
            continue
        body = m.group(1)
        if TBD_PATTERN.search(body):
            errors.append(f"{path.relative_to(FEATURES)}: TBD in ## {section}")
        if not body.strip():
            errors.append(f"{path.relative_to(FEATURES)}: empty ## {section}")

    ac = re.search(r"## Acceptance criteria\n\n(.*?)(\n## |\Z)", text, re.DOTALL)
    if not ac:
        errors.append(f"{path.relative_to(FEATURES)}: missing ## Acceptance criteria")
    else:
        ac_body = ac.group(1).strip()
        if not ac_body or not re.search(r"- \[[ xX]\]", ac_body):
            errors.append(
                f"{path.relative_to(FEATURES)}: Acceptance criteria needs at least one checkbox item"
            )
    return errors


def main() -> int:
    all_errors: list[str] = []
    for path in sorted(FEATURES.rglob("*.md")):
        all_errors.extend(check_file(path))

    ux_readme = DOCS / "ux" / "README.md"
    if not ux_readme.exists():
        all_errors.append("docs/ux/README.md missing")

    if all_errors:
        for e in all_errors:
            print("ERROR:", e)
        return 1
    print("OK: feature docs lint passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
