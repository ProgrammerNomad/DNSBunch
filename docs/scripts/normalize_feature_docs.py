#!/usr/bin/env python3
"""Add missing mandatory sections and metadata rows to feature docs. Idempotent."""
from __future__ import annotations

import re
from pathlib import Path

DOCS = Path(__file__).resolve().parents[1]
FEATURES = DOCS / "features"

SECTIONS = [
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

STUB = {
    "Problem": "TBD - align with Summary and [PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md).",
    "Scope": "**In scope:** TBD.\n\n**Out of scope:** None for v1 unless noted.",
    "User flows": "- **Anonymous:** TBD.\n- **Logged-in (future):** TBD.",
    "Architecture": "See [ARCHITECTURE.md §11](../../ARCHITECTURE.md#11-tool-execution-contract-current--planned). Feature-specific detail TBD.\n\n**Reuses existing engine?** TBD.",
    "Data model": "None for v1.",
    "API": "TBD. Canonical reference when shipped: [API.md](../../API.md).",
    "UI": "TBD (e.g. `frontend/src/app/tools/...`).",
    "Limits and abuse": "TBD; follow [ARCHITECTURE.md §6](../../ARCHITECTURE.md#6-current-security-model-current) and tool-specific caps.",
    "Monetization": "Default free unless noted; Pro TBD per [METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md).",
    "Dependencies": "None for v1 unless listed elsewhere in this doc.",
    "Implementation checklist": "- [ ] TBD",
    "Acceptance criteria": "- [ ] TBD",
    "References": "None for v1.",
}


def priority_for(phase: str, status: str) -> str:
    if status == "shipped":
        return "P0"
    if phase in ("0", "1", "2"):
        return "P1"
    if phase == "organic":
        return "P2"
    if phase == "pro":
        return "P2"
    if phase == "ux":
        return "P3"
    return "P2"


def has_section(text: str, name: str) -> bool:
    return re.search(rf"^## {re.escape(name)}\s*$", text, re.M) is not None


def insert_after_metadata(text: str, block: str) -> str:
    if "## Summary" in text:
        return text
    return re.sub(r"(## Metadata\n\n[\s\S]*?\n\n)", r"\1" + block, text, count=1)


def ensure_metadata_rows(text: str, status: str, phase: str) -> str:
    if "**priority**" not in text:
        pri = priority_for(phase, status)
        text = text.replace(
            "| **status** |",
            f"| **priority** | {pri} |\n| **status** |",
            1,
        )
    if status == "shipped" and "**last_verified_against_repo**" not in text:
        text = text.replace(
            "| **tool_id** |",
            "| **last_verified_against_repo** | 2026-09-15 |\n| **tool_id** |",
            1,
        )
    if status != "shipped" and "**last_reviewed**" not in text:
        # insert before closing of metadata table (last row before blank line)
        if "**last_reviewed**" not in text:
            text = re.sub(
                r"(\| \*\*tool_id\*\* \|[^\n]+\n)(\n## )",
                r"\1| **last_reviewed** | 2026-09-15 |\n\2",
                text,
                count=1,
            )
    return text


def parse_phase_status(text: str) -> tuple[str, str]:
    status = "planned"
    phase = "organic"
    m = re.search(r"\| \*\*status\*\* \| ([^\n|]+)", text)
    if m:
        status = m.group(1).strip()
    m = re.search(r"\| \*\*phase\*\* \| ([^\n|]+)", text)
    if m:
        phase = m.group(1).strip().strip("`")
    return status, phase


def normalize_file(path: Path) -> bool:
    if path.name == "_TEMPLATE.md":
        return False
    text = path.read_text(encoding="utf-8")
    orig = text
    status, phase = parse_phase_status(text)
    text = ensure_metadata_rows(text, status, phase)

    for sec in SECTIONS:
        if has_section(text, sec):
            continue
        body = STUB.get(sec, "TBD.")
        block = f"## {sec}\n\n{body}\n\n"
        if sec == "Summary" and "## Metadata" in text:
            text = insert_after_metadata(text, block)
        else:
            text = text.rstrip() + "\n\n" + block

    if text != orig:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> None:
    changed = []
    for path in sorted(FEATURES.rglob("*.md")):
        if normalize_file(path):
            changed.append(path.relative_to(DOCS))
    print(f"Updated {len(changed)} files")
    for p in changed:
        print(f"  - {p}")


if __name__ == "__main__":
    main()
