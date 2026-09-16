"""Standalone DKIM tool - single-selector lookup via DNSChecker."""
from __future__ import annotations

import asyncio
from typing import Any

from dns_checker import DNSChecker

from tools.validation import normalize_dkim_selector, normalize_domain

_DKIM_TAG_LABELS: dict[str, str] = {
    "v": "Version (v)",
    "k": "Key type (k)",
    "p": "Public key (p)",
    "t": "Flags (t)",
    "s": "Service type (s)",
    "h": "Hash algorithms (h)",
}


def _display_value(tag: str, value: str) -> str:
    if tag == "p" and len(value) > 80:
        return f"{value[:80]}… ({len(value)} chars - see raw record)"
    return value


def _tags_from_parsed(parsed: dict[str, str]) -> list[dict[str, str]]:
    tags: list[dict[str, str]] = []
    for key, label in _DKIM_TAG_LABELS.items():
        if key in parsed:
            tags.append(
                {
                    "tag": key,
                    "value": _display_value(key, parsed[key]),
                    "label": label,
                }
            )
    for key, value in parsed.items():
        if key not in _DKIM_TAG_LABELS:
            tags.append({"tag": key, "value": value, "label": key})
    return tags


def run_dkim_checker(
    *,
    domain: str = "",
    selector: str = "",
    **_kwargs: Any,
) -> dict[str, Any]:
    normalized_domain = normalize_domain(domain)
    normalized_selector = normalize_dkim_selector(selector)
    host = f"{normalized_selector}._domainkey.{normalized_domain}"

    checker = DNSChecker(normalized_domain)
    result = asyncio.run(checker.lookup_dkim_selector(normalized_selector))
    parsed = result.get("parsed") or {}
    if not isinstance(parsed, dict):
        parsed = {}

    return {
        "domain": normalized_domain,
        "selector": normalized_selector,
        "host": host,
        "status": result.get("status", "warning"),
        "record": result.get("record") or "",
        "parsed": parsed,
        "issues": list(result.get("issues") or []),
        "tags": _tags_from_parsed({str(k): str(v) for k, v in parsed.items()}),
    }
