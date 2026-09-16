"""Single execution entry for dns_health - used by /api/check and internal routes."""
from __future__ import annotations

import asyncio
from typing import Any

from dns_checker import DNSChecker

from tools.dns_health.bulk import run_dns_health_bulk
from tools.validation import normalize_domain


def run_dns_health(
    *,
    domain: str = "",
    checks: list[str] | None = None,
    surface: str = "single",
    domains: list[str] | None = None,
    **_kwargs: Any,
) -> dict[str, Any]:
    """
    Run DNS health for single domain (default) or bulk surface.
    Raises ValueError for invalid domain input (single) or bulk list errors.
    """
    if surface == "bulk":
        return run_dns_health_bulk(domains)

    normalized = normalize_domain(domain)
    checker = DNSChecker(normalized)
    requested = checks if checks is not None else []
    return asyncio.run(checker.run_all_checks(requested))
