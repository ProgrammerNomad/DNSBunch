"""Standalone DMARC tool - reuses DNSChecker dmarc check only."""
from __future__ import annotations

import asyncio
from typing import Any

from dns_checker import DNSChecker

from tools.validation import normalize_domain

_DMARC_TAG_LABELS: dict[str, str] = {
    "p": "Policy (p)",
    "sp": "Subdomain policy (sp)",
    "adkim": "DKIM alignment (adkim)",
    "aspf": "SPF alignment (aspf)",
    "rua": "Aggregate reports (rua)",
    "ruf": "Forensic reports (ruf)",
    "pct": "Sampling (pct)",
}


def _tags_from_parsed(parsed: dict[str, str]) -> list[dict[str, str]]:
    tags: list[dict[str, str]] = []
    for key, label in _DMARC_TAG_LABELS.items():
        if key in parsed:
            tags.append({"tag": key, "value": parsed[key], "label": label})
    for key, value in parsed.items():
        if key not in _DMARC_TAG_LABELS:
            tags.append({"tag": key, "value": value, "label": key})
    return tags


def run_dmarc_checker(*, domain: str = "", **_kwargs: Any) -> dict[str, Any]:
    normalized = normalize_domain(domain)
    checker = DNSChecker(normalized)
    results = asyncio.run(checker.run_all_checks(["dmarc"]))
    dmarc = results.get("checks", {}).get("dmarc") or {}
    parsed = dmarc.get("parsed") or {}
    if not isinstance(parsed, dict):
        parsed = {}

    return {
        "domain": normalized,
        "status": dmarc.get("status", "warning"),
        "record": dmarc.get("record") or "",
        "parsed": parsed,
        "issues": list(dmarc.get("issues") or []),
        "tags": _tags_from_parsed({str(k): str(v) for k, v in parsed.items()}),
    }
