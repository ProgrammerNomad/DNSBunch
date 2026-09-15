#!/usr/bin/env python3
from __future__ import annotations

import re
from pathlib import Path

FEATURES = Path(__file__).resolve().parents[1] / "features"

UX = {
    "ux/dark-mode.md": {
        "Problem": "Users expect dark theme for long diagnostic sessions (FUTURE_IDEAS #5).",
        "Scope": "**In scope:** `next-themes` + shadcn CSS variables; toggle in SiteHeader.\n\n**Out of scope:** Per-component one-off colors outside design tokens.",
        "User flows": "- **Anonymous:** Toggle theme; preference in localStorage.\n- **Logged-in (future):** Optional sync preference to account.",
        "Architecture": "Root layout `ThemeProvider`; `.dark` on `html` ([FRONTEND_STACK.md](../../ux/FRONTEND_STACK.md)).",
        "API": "None.",
        "UI": "Shell header `Button` with Sun/Moon icons; tokens in [SITE_SHELL.md](../../ux/SITE_SHELL.md).",
        "Limits and abuse": "None.",
    },
    "ux/result-comparison.md": {
        "Problem": "Compare two runs (domains or dates) for regressions (FUTURE_IDEAS #6).",
        "Scope": "**In scope:** Side-by-side or diff view for DNS health results; may attach to **T1/T3**.\n\n**Out of scope:** Arbitrary cross-tool diff v1.",
        "User flows": "- **Anonymous:** Select two cached results in session or paste two domains sequential compare.\n- **Logged-in (future):** Pick from history.",
        "Architecture": "Client diff on `DNSAnalysisResult` JSON structure.",
        "API": "None v1.",
        "UI": "Mode on **T1** or modal `Sheet`; shadcn two-column `Table` with changed rows highlighted.",
        "Limits and abuse": "Client-only memory bounds.",
    },
    "ux/pwa-mobile.md": {
        "Problem": "Mobile users want home-screen install (FUTURE_IDEAS #7).",
        "Scope": "**In scope:** Web manifest, icons, service worker for offline shell (not offline DNS).\n\n**Out of scope:** Native app store apps.",
        "User flows": "- **Anonymous:** Install prompt on supported browsers.",
        "Architecture": "Next PWA plugin or manual manifest in `public/`.",
        "API": "None.",
        "UI": "Install hint `Alert` dismissible; responsive **T1–T6** already required.",
        "Limits and abuse": "SW cache static assets only.",
    },
    "ux/browser-extension.md": {
        "Problem": "Quick check from browser toolbar (FUTURE_IDEAS #8).",
        "Scope": "**In scope:** MV3 extension opens DNSBunch tool or runs check via public BFF.\n\n**Out of scope:** Extension store launch day one.",
        "User flows": "- **Anonymous:** Click extension → popup with domain from active tab → open results on DNSBunch.",
        "Architecture": "Thin extension; API calls same-origin or API keys Phase 3.",
        "API": "Reuse `/api/dns/check` or tool BFF with CORS policy decision documented.",
        "UI": "Extension popup minimal shadcn-not applicable - HTML + brand; links to **T1**.",
        "Limits and abuse": "Extension obeys same rate limits via server.",
    },
}


def patch(content: str, header: str, body: str) -> str:
    pattern = rf"(## {re.escape(header)}\n\n)(.*?)(\n## |\Z)"
    return re.sub(pattern, rf"\1{body}\n\3", content, count=1, flags=re.DOTALL)


def main() -> None:
    for rel, sections in UX.items():
        path = FEATURES / rel
        text = path.read_text(encoding="utf-8")
        for h, b in sections.items():
            text = patch(text, h, b)
        path.write_text(text, encoding="utf-8")
        print("Updated", rel)


if __name__ == "__main__":
    main()
