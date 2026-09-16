"""DNS configuration section - calls tool runners only (INV-6)."""
from __future__ import annotations

import re
from typing import Any

from tools.dkim_checker.runner import run_dkim_checker
from tools.dmarc_checker.runner import run_dmarc_checker
from tools.spf_checker.runner import run_spf_checker

_DKIM_SELECTOR = re.compile(r"s=([A-Za-z0-9_-]+)", re.I)


def extract_dkim_selectors(raw: bytes) -> list[str]:
    selectors: list[str] = []
    for match in _DKIM_SELECTOR.finditer(raw.decode("utf-8", errors="replace")):
        sel = match.group(1)
        if sel not in selectors:
            selectors.append(sel)
    return selectors[:3]


def build_dns_configuration(from_domain: str | None, raw: bytes) -> dict[str, Any]:
    if not from_domain:
        return {
            "spf": {"error": "No From domain"},
            "dkim": {"error": "No From domain"},
            "dmarc": {"error": "No From domain"},
        }

    spf = run_spf_checker(domain=from_domain)
    dmarc = run_dmarc_checker(domain=from_domain)

    dkim_entries: list[dict[str, Any]] = []
    for selector in extract_dkim_selectors(raw):
        try:
            dkim_entries.append(run_dkim_checker(domain=from_domain, selector=selector))
        except Exception as exc:  # noqa: BLE001
            dkim_entries.append({"domain": from_domain, "selector": selector, "error": str(exc)})

    dkim_section: dict[str, Any]
    if dkim_entries:
        dkim_section = {"selectors": dkim_entries}
    else:
        dkim_section = {"selectors": [], "note": "No DKIM-Signature selector found in message"}

    return {"spf": spf, "dkim": dkim_section, "dmarc": dmarc}
