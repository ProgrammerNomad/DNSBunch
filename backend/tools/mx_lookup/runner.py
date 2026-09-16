"""Standalone MX lookup - reuses DNSChecker MX check only."""
from __future__ import annotations

import asyncio
from typing import Any

from dns_checker import DNSChecker

from tools.validation import normalize_domain

_MAX_ISSUES = 5


def _issues_from_mx_checks(mx_check: dict[str, Any]) -> list[str]:
    sub_checks = mx_check.get("checks") or []
    issues: list[str] = []
    for item in sub_checks:
        if not isinstance(item, dict):
            continue
        status = item.get("status")
        if status not in ("error", "warning"):
            continue
        message = item.get("message")
        if isinstance(message, str) and message.strip():
            issues.append(message.strip())
        if len(issues) >= _MAX_ISSUES:
            break
    return issues


def _rows_from_records(records: list[Any]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for record in records:
        if not isinstance(record, dict):
            continue
        ips_raw = record.get("ips") or []
        ips: list[str] = []
        for ip_info in ips_raw:
            if isinstance(ip_info, dict) and ip_info.get("ip"):
                ips.append(str(ip_info["ip"]))
        error = record.get("error")
        rows.append(
            {
                "priority": int(record.get("priority", 0)),
                "host": str(record.get("host") or ""),
                "ips": ips,
                "error": str(error) if error else None,
            }
        )
    rows.sort(key=lambda r: r["priority"])
    return rows


def run_mx_lookup(*, domain: str = "", **_kwargs: Any) -> dict[str, Any]:
    normalized = normalize_domain(domain)
    checker = DNSChecker(normalized)
    results = asyncio.run(checker.run_all_checks(["mx"]))
    mx = results.get("checks", {}).get("mx") or {}
    records = mx.get("records") or []
    if not isinstance(records, list):
        records = []
    rows = _rows_from_records(records)
    count = mx.get("count")
    if count is None:
        count = len(rows)

    return {
        "domain": normalized,
        "status": mx.get("status", "warning"),
        "count": int(count),
        "rows": rows,
        "issues": _issues_from_mx_checks(mx),
    }
