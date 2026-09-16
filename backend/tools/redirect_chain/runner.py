"""Redirect chain tool - list each GET hop up to the redirect cap."""
from __future__ import annotations

from typing import Any

from tools.url_fetch import (
    RedirectChainResult,
    RedirectHop,
    assert_safe_fetch_url,
    fetch_redirect_chain,
    normalize_fetch_url,
)


def _hop_to_dict(hop: RedirectHop) -> dict[str, Any]:
    return {
        "index": hop.index,
        "url": hop.url,
        "status_code": hop.status_code,
        "location": hop.location,
    }


def _issues_from_chain(chain: RedirectChainResult) -> list[str]:
    issues: list[str] = []
    if chain.loop_detected:
        issues.append("Redirect loop detected")
    if chain.redirect_limit_exceeded:
        issues.append("Too many redirects")
    return issues


def run_redirect_chain(*, url: str = "", **_kwargs: Any) -> dict[str, Any]:
    input_url = normalize_fetch_url(url)
    assert_safe_fetch_url(input_url)

    try:
        chain = fetch_redirect_chain(input_url)
    except ValueError as exc:
        message = str(exc)
        return {
            "input_url": input_url,
            "final_url": None,
            "final_status_code": None,
            "status": "error",
            "hops": [],
            "loop_detected": False,
            "issues": [message],
            "error": message,
        }

    issues = _issues_from_chain(chain)
    status = "warning" if issues else "pass"

    return {
        "input_url": input_url,
        "final_url": chain.final_url,
        "final_status_code": chain.final_status_code,
        "status": status,
        "hops": [_hop_to_dict(h) for h in chain.hops],
        "loop_detected": chain.loop_detected,
        "issues": issues,
        "error": None,
    }
