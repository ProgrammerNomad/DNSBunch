"""Single execution entry for dns_health - used by /api/check and internal routes."""
from __future__ import annotations

import asyncio
from typing import Any

from dns_checker import DNSChecker

from tools.validation import normalize_domain


def run_dns_health(*, domain: str, checks: list[str] | None = None) -> dict[str, Any]:
    """
    Run full DNS health analysis for one domain.
    Raises ValueError for invalid domain input.
    """
    normalized = normalize_domain(domain)
    checker = DNSChecker(normalized)
    requested = checks if checks is not None else []
    return asyncio.run(checker.run_all_checks(requested))
