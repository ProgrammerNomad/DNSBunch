#!/usr/bin/env python3
"""Reorder feature doc sections: Metadata stays after title, then ORDER sections."""
from __future__ import annotations

import re
from pathlib import Path

DOCS = Path(__file__).resolve().parents[1]
FEATURES = DOCS / "features"

ORDER = [
    "Summary",
    "Problem",
    "Scope",
    "User flows",
    "Architecture",
    "Data model",
    "API",
    "UI",
    "Limits and abuse",
    "Monetization",
    "Dependencies",
    "Implementation checklist",
    "Acceptance criteria",
    "References",
]


def parse(text: str) -> tuple[str, dict[str, str]]:
    """Preamble = title + Metadata block. Body sections keyed by heading."""
    m = re.search(r"^## Summary\s*$", text, re.M)
    if not m:
        return text.rstrip() + "\n", {}
    preamble = text[: m.start()].rstrip()
    rest = text[m.start() :]
    parts = re.split(r"\n(?=## )", rest)
    sections: dict[str, str] = {}
    for part in parts:
        if not part.startswith("## "):
            continue
        first_line, _, body = part.partition("\n")
        name = first_line[3:].strip()
        if name == "Metadata":
            continue
        sections[name] = body.strip()
    # Metadata may have been wrongly placed at end - recover into preamble
    meta_m = re.search(r"^## Metadata\s*\n([\s\S]*?)(?=\n## |\Z)", text, re.M)
    if meta_m and "## Metadata" not in preamble:
        preamble = preamble + "\n\n## Metadata\n\n" + meta_m.group(1).strip()
    return preamble + "\n", sections


def reorder_file(path: Path) -> bool:
    if path.name == "_TEMPLATE.md":
        return False
    text = path.read_text(encoding="utf-8")
    preamble, sections = parse(text)
    out = [preamble.rstrip(), ""]
    for name in ORDER:
        if name in sections:
            out.append(f"## {name}\n\n{sections[name]}\n")
    for name, body in sections.items():
        if name not in ORDER:
            out.append(f"## {name}\n\n{body}\n")
    new_text = "\n".join(out).rstrip() + "\n"
    if new_text != text:
        path.write_text(new_text, encoding="utf-8")
        return True
    return False


def main() -> None:
    n = sum(1 for p in FEATURES.rglob("*.md") if reorder_file(p))
    print(f"Reordered {n} files")


if __name__ == "__main__":
    main()
