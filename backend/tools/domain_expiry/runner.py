"""Domain registration expiry from RDAP."""
from __future__ import annotations

from typing import Any

from tools.rdap import RdapError, days_until, fetch_domain_rdap


def run_domain_expiry(*, domain: str = "", **_kwargs: Any) -> dict[str, Any]:
    try:
        data = fetch_domain_rdap(domain)
    except RdapError as exc:
        message = str(exc)
        return {
            "domain": (domain or "").strip().lower(),
            "expiry_date": None,
            "days_until_expiry": None,
            "status": "error",
            "issues": [message],
            "error": message,
        }

    expiry = data.get("expires")
    remaining = days_until(expiry)
    issues: list[str] = []
    status = "pass"

    if not expiry:
        status = "warning"
        issues.append("Expiry date not available from RDAP")
    elif remaining is not None and remaining < 0:
        status = "warning"
        issues.append("Domain registration appears expired")
    elif remaining is not None and remaining <= 30:
        status = "warning"
        issues.append(f"Domain expires in {remaining} day(s)")

    return {
        "domain": data["domain"],
        "expiry_date": expiry,
        "days_until_expiry": remaining,
        "status": status,
        "issues": issues,
        "error": None,
    }
