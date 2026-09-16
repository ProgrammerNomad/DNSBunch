"""WHOIS-style domain registration data via RDAP."""
from __future__ import annotations

from typing import Any

from tools.rdap import RdapError, fetch_domain_rdap


def _fields_from_rdap(data: dict[str, Any]) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    mapping = (
        ("Registrar", data.get("registrar")),
        ("Created", data.get("created")),
        ("Updated", data.get("updated")),
        ("Expires", data.get("expires")),
    )
    for label, value in mapping:
        if value:
            rows.append({"label": label, "value": str(value)})
    if data.get("nameservers"):
        rows.append({"label": "Nameservers", "value": ", ".join(data["nameservers"])})
    if data.get("statuses"):
        rows.append({"label": "Status", "value": ", ".join(data["statuses"])})
    return rows


def run_whois_lookup(*, domain: str = "", **_kwargs: Any) -> dict[str, Any]:
    try:
        data = fetch_domain_rdap(domain)
    except RdapError as exc:
        message = str(exc)
        code = "RATE_LIMIT" if "Rate limit" in message else "RDAP_ERROR"
        return {
            "domain": (domain or "").strip().lower(),
            "status": "error",
            "registrar": None,
            "created": None,
            "updated": None,
            "expires": None,
            "nameservers": [],
            "fields": [],
            "issues": [message],
            "error": message,
            "code": code,
        }

    fields = _fields_from_rdap(data)
    status = "pass" if fields else "warning"
    issues: list[str] = []
    if not fields:
        issues.append("No registration fields returned from RDAP")

    return {
        "domain": data["domain"],
        "status": status,
        "registrar": data.get("registrar"),
        "created": data.get("created"),
        "updated": data.get("updated"),
        "expires": data.get("expires"),
        "nameservers": data.get("nameservers") or [],
        "fields": fields,
        "issues": issues,
        "error": None,
        "code": None,
    }
