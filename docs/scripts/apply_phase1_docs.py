#!/usr/bin/env python3
"""Apply phase1_feature_content.TOOLS to feature markdown files."""
from __future__ import annotations

import re
from pathlib import Path

from phase1_feature_content import TOOLS

FEATURES = Path(__file__).resolve().parents[1] / "features"


def patch_section(content: str, header: str, body: str) -> str:
    pattern = rf"(## {re.escape(header)}\n\n)(.*?)(\n## |\Z)"
    repl = rf"\1{body}\n\3"
    new_content, n = re.subn(pattern, repl, content, count=1, flags=re.DOTALL)
    if n == 0:
        raise ValueError(f"Section ## {header} not found")
    return new_content


def apply(path_key: str, data: dict) -> None:
    path = FEATURES / path_key.replace("/", "\\") if False else FEATURES / path_key
    text = path.read_text(encoding="utf-8")

    text = patch_section(
        text,
        "Problem",
        data["problem"],
    )
    in_scope = data["in_scope"]
    out_scope = data.get("out_scope", "None for v1 unless noted.")
    text = patch_section(
        text,
        "Scope",
        f"**In scope:** {in_scope}\n\n**Out of scope:** {out_scope}",
    )
    text = patch_section(
        text,
        "User flows",
        f"- **Anonymous:** {data['anon_flow']}\n- **Logged-in (future):** {data['logged_flow']}",
    )
    text = patch_section(text, "Architecture", data["architecture"])
    text = patch_section(text, "API", data["api"])
    text = patch_section(text, "UI", data["ui"])
    text = patch_section(text, "Limits and abuse", data["limits"])

    ac = data.get("acceptance", [])
    ac_body = "\n".join(f"- [ ] {line}" for line in ac)
    text = patch_section(text, "Acceptance criteria", ac_body)

    path.write_text(text, encoding="utf-8")
    print(f"Updated {path_key}")


def main() -> None:
    for key, data in TOOLS.items():
        apply(key, data)


if __name__ == "__main__":
    main()
