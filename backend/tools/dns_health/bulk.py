"""Bulk DNS health orchestration - same engine as single-domain checks."""
from __future__ import annotations

import asyncio
import os
from typing import Any

from dns_checker import DNSChecker

from tools.validation import normalize_domain

BULK_MAX_DOMAINS = int(os.environ.get("BULK_MAX_DOMAINS", "50"))
BULK_CONCURRENCY = int(os.environ.get("BULK_CONCURRENCY", "10"))

ROLLUP_KEYS = ("ns", "soa", "mx", "www")
STATUS_RANK = {
    "error": 4,
    "fail": 4,
    "warning": 3,
    "info": 2,
    "pass": 1,
    "success": 1,
}


def _status_rank(status: str | None) -> int:
    if not status:
        return 0
    return STATUS_RANK.get(status, 2)


def _worst_status(*statuses: str | None) -> str:
    ranked = [(_status_rank(s), s) for s in statuses if s]
    if not ranked:
        return "info"
    ranked.sort(key=lambda x: x[0], reverse=True)
    worst = ranked[0][1] or "info"
    if worst in ("success",):
        return "pass"
    if worst in ("fail",):
        return "error"
    return worst


def rollup_for_bulk(full_result: dict[str, Any]) -> dict[str, Any]:
    """Derive summary columns from a single-domain engine result (no extra I/O)."""
    checks = full_result.get("checks") or {}
    summary = full_result.get("summary") or {}

    column_statuses: list[str | None] = []
    for key in ROLLUP_KEYS:
        check = checks.get(key)
        if isinstance(check, dict) and check.get("status"):
            column_statuses.append(str(check["status"]))
        else:
            column_statuses.append(None)

    summary_overall: str | None = None
    if summary.get("errors", 0) > 0:
        summary_overall = "error"
    elif summary.get("warnings", 0) > 0:
        summary_overall = "warning"
    elif summary.get("passed", 0) > 0 or summary.get("total", 0) > 0:
        summary_overall = "pass"

    overall = _worst_status(summary_overall, *column_statuses)

    row: dict[str, Any] = {
        "domain": full_result.get("domain", ""),
        "overall": overall,
        "error": None,
    }
    for key in ROLLUP_KEYS:
        check = checks.get(key)
        if isinstance(check, dict) and check.get("status"):
            st = str(check["status"])
            row[key] = "pass" if st == "success" else ("error" if st == "fail" else st)
        else:
            row[key] = "-"
    return row


def error_row(domain: str, message: str) -> dict[str, Any]:
    return {
        "domain": domain,
        "overall": "error",
        "ns": "-",
        "soa": "-",
        "mx": "-",
        "www": "-",
        "error": message,
    }


async def analyze_domain(domain: str) -> dict[str, Any]:
    """Run full health check for one domain."""
    normalized = normalize_domain(domain)
    checker = DNSChecker(normalized)
    return await checker.run_all_checks([])


async def _analyze_one(raw_domain: str, sem: asyncio.Semaphore) -> dict[str, Any]:
    display = (raw_domain or "").strip().lower() or raw_domain
    async with sem:
        try:
            full = await analyze_domain(raw_domain)
            row = rollup_for_bulk(full)
            row["domain"] = full.get("domain", display)
            return row
        except ValueError as exc:
            return error_row(display, str(exc))
        except Exception as exc:
            return error_row(display, str(exc) or "Analysis failed")


async def bulk_analyze(domains: list[str], *, concurrency: int | None = None) -> list[dict[str, Any]]:
    limit = concurrency if concurrency is not None else BULK_CONCURRENCY
    sem = asyncio.Semaphore(max(1, limit))
    tasks = [_analyze_one(d, sem) for d in domains]
    return list(await asyncio.gather(*tasks))


def _dedupe_domains(domains: list[str]) -> list[str]:
    seen: set[str] = set()
    ordered: list[str] = []
    for raw in domains:
        key = (raw or "").strip().lower()
        if not key or key in seen:
            continue
        seen.add(key)
        ordered.append(raw.strip())
    return ordered


def run_dns_health_bulk(domains: list[str] | None) -> dict[str, Any]:
    """Sync entry: validate list size, run bounded concurrent checks, return rollup rows."""
    if domains is None:
        domains = []
    if not isinstance(domains, list):
        raise ValueError("domains must be an array")

    cleaned = _dedupe_domains([str(d) for d in domains])
    if not cleaned:
        raise ValueError("At least one domain is required")
    if len(cleaned) > BULK_MAX_DOMAINS:
        raise ValueError(f"Maximum {BULK_MAX_DOMAINS} domains per bulk request")

    rows = asyncio.run(bulk_analyze(cleaned))
    failed = sum(1 for r in rows if r.get("error"))
    return {
        "surface": "bulk",
        "rows": rows,
        "meta": {
            "requested": len(cleaned),
            "completed": len(rows),
            "failed": failed,
        },
    }
