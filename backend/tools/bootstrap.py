"""Register all tools at application startup."""
from __future__ import annotations

from tools.dnsbl_lookup.runner import run_dnsbl_lookup
from tools.http_headers.runner import run_http_headers
from tools.http_status.runner import run_http_status
from tools.redirect_chain.runner import run_redirect_chain
from tools.dkim_checker.runner import run_dkim_checker
from tools.dmarc_checker.runner import run_dmarc_checker
from tools.dns_health.runner import run_dns_health
from tools.dns_propagation.runner import run_dns_propagation
from tools.domain_expiry.runner import run_domain_expiry
from tools.mx_lookup.runner import run_mx_lookup
from tools.registry import register
from tools.smtp_test.runner import run_smtp_test
from tools.spf_checker.runner import run_spf_checker
from tools.whois_lookup.runner import run_whois_lookup
from tools.ssl_inspector.runner import run_ssl_inspector


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
    register(
        "dkim_checker",
        run_dkim_checker,
        {"category": "email", "timeout_ms": 30_000},
    )
    register(
        "mx_lookup",
        run_mx_lookup,
        {"category": "email", "timeout_ms": 30_000},
    )
    register(
        "smtp_test",
        run_smtp_test,
        {"category": "email", "timeout_ms": 15_000},
    )
    register(
        "dnsbl_lookup",
        run_dnsbl_lookup,
        {"category": "email", "timeout_ms": 30_000},
    )
    register(
        "http_headers",
        run_http_headers,
        {"category": "website", "timeout_ms": 20_000},
    )
    register(
        "redirect_chain",
        run_redirect_chain,
        {"category": "website", "timeout_ms": 20_000},
    )
    register(
        "http_status",
        run_http_status,
        {"category": "website", "timeout_ms": 20_000},
    )
    register(
        "ssl_inspector",
        run_ssl_inspector,
        {"category": "website", "timeout_ms": 20_000},
    )
    register(
        "whois_lookup",
        run_whois_lookup,
        {"category": "domain", "timeout_ms": 30_000},
    )
    register(
        "domain_expiry",
        run_domain_expiry,
        {"category": "domain", "timeout_ms": 30_000},
    )
    register(
        "dns_propagation",
        run_dns_propagation,
        {"category": "domain", "timeout_ms": 30_000},
    )
