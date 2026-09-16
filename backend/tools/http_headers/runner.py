"""HTTP response headers tool with security header highlights."""
from __future__ import annotations

from typing import Any
from urllib.parse import urlparse

from tools.url_fetch import assert_safe_fetch_url, fetch_get_with_redirect_cap, normalize_fetch_url

SECURITY_HEADER_NAMES: tuple[str, ...] = (
    "strict-transport-security",
    "content-security-policy",
    "x-frame-options",
    "x-content-type-options",
    "referrer-policy",
    "permissions-policy",
)


def _header_map(headers: dict[str, str]) -> dict[str, str]:
    mapped: dict[str, str] = {}
    for name, value in headers.items():
        mapped[name.lower()] = value
    return mapped


def _security_rows(header_by_name: dict[str, str]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for name in SECURITY_HEADER_NAMES:
        value = header_by_name.get(name)
        if value is not None:
            rows.append({"name": name, "present": True, "value": value})
        else:
            rows.append({"name": name, "present": False, "value": None})
    return rows


def _table_rows(headers: dict[str, str], security_names: set[str]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for name, value in headers.items():
        lower = name.lower()
        rows.append(
            {
                "name": lower,
                "value": value,
                "security": lower in security_names,
            }
        )
    rows.sort(key=lambda row: row["name"])
    return rows


def run_http_headers(*, url: str = "", **_kwargs: Any) -> dict[str, Any]:
    input_url = normalize_fetch_url(url)
    assert_safe_fetch_url(input_url)

    try:
        fetched = fetch_get_with_redirect_cap(input_url)
    except ValueError as exc:
        return {
            "input_url": input_url,
            "final_url": None,
            "status_code": None,
            "status": "error",
            "headers": [],
            "security_headers": _security_rows({}),
            "issues": [str(exc)],
            "error": str(exc),
        }

    header_by_name = _header_map(fetched.headers)
    security_set = set(SECURITY_HEADER_NAMES)
    security_headers = _security_rows(header_by_name)
    issues: list[str] = []

    parsed_final = urlparse(fetched.final_url)
    if parsed_final.scheme == "https" and not header_by_name.get("strict-transport-security"):
        issues.append("HTTPS response has no Strict-Transport-Security header")

    missing_security = [row["name"] for row in security_headers if not row["present"]]
    if missing_security:
        issues.append(f"Missing security headers: {', '.join(missing_security)}")

    status = "pass"
    if issues:
        status = "warning"

    return {
        "input_url": input_url,
        "final_url": fetched.final_url,
        "status_code": fetched.status_code,
        "status": status,
        "headers": _table_rows(fetched.headers, security_set),
        "security_headers": security_headers,
        "issues": issues,
        "error": None,
    }
