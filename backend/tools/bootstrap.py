"""Register all tools at application startup."""
from __future__ import annotations

from tools.dmarc_checker.runner import run_dmarc_checker
from tools.dns_health.runner import run_dns_health
from tools.registry import register
from tools.spf_checker.runner import run_spf_checker


def register_all_tools() -> None:
    register(
        "dns_health",
        run_dns_health,
        {"category": "dns_health", "timeout_ms": 30_000},
    )
    register(
        "dmarc_checker",
        run_dmarc_checker,
        {"category": "email", "timeout_ms": 30_000},
    )
    register(
        "spf_checker",
        run_spf_checker,
        {"category": "email", "timeout_ms": 30_000},
    )
