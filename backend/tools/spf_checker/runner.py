"""Standalone SPF tool - reuses DNSChecker SPF check only."""
from __future__ import annotations

import asyncio
from typing import Any

from dns_checker import DNSChecker

from tools.validation import normalize_domain

DNS_LOOKUP_LIMIT = 10


def _mechanisms_from_record(record: str) -> list[str]:
    trimmed = (record or "").strip()
    if not trimmed.lower().startswith("v=spf1"):
        return []
    parts = trimmed.split()
    return parts[1:] if len(parts) > 1 else []


def run_spf_checker(*, domain: str = "", **_kwargs: Any) -> dict[str, Any]:
    normalized = normalize_domain(domain)
    checker = DNSChecker(normalized)
    results = asyncio.run(checker.run_all_checks(["spf"]))
    spf = results.get("checks", {}).get("spf") or {}
    record = spf.get("record") or ""
    dns_lookups = spf.get("dns_lookups")
    if dns_lookups is None:
        dns_lookups = 0

    return {
        "domain": normalized,
        "status": spf.get("status", "warning"),
        "record": record,
        "issues": list(spf.get("issues") or []),
        "dns_lookups": int(dns_lookups),
        "dns_lookup_limit": DNS_LOOKUP_LIMIT,
        "mechanisms": _mechanisms_from_record(record),
    }
