"""HTTP status check - final status code and request latency."""
from __future__ import annotations

import time
from typing import Any

from tools.url_fetch import assert_safe_fetch_url, fetch_get_with_redirect_cap, normalize_fetch_url


def _status_from_code(status_code: int) -> str:
    if 200 <= status_code < 400:
        return "pass"
    return "warning"


def run_http_status(*, url: str = "", **_kwargs: Any) -> dict[str, Any]:
    input_url = normalize_fetch_url(url)
    assert_safe_fetch_url(input_url)

    started = time.perf_counter()
    try:
        fetched = fetch_get_with_redirect_cap(input_url)
    except ValueError as exc:
        elapsed_ms = int((time.perf_counter() - started) * 1000)
        message = str(exc)
        return {
            "input_url": input_url,
            "final_url": None,
            "status_code": None,
            "latency_ms": elapsed_ms,
            "status": "error",
            "issues": [message],
            "error": message,
        }

    elapsed_ms = int((time.perf_counter() - started) * 1000)
    status = _status_from_code(fetched.status_code)
    issues: list[str] = []
    if status == "warning":
        issues.append(f"HTTP {fetched.status_code} response")

    return {
        "input_url": input_url,
        "final_url": fetched.final_url,
        "status_code": fetched.status_code,
        "latency_ms": elapsed_ms,
        "status": status,
        "issues": issues,
        "error": None,
    }
