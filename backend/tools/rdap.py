"""RDAP domain lookups (shared by WHOIS and domain expiry tools)."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

import requests

from tools.validation import normalize_domain

RDAP_TIMEOUT_SEC = 15
USER_AGENT = "DNSBunch/1.0"


class RdapError(ValueError):
    """RDAP lookup failed."""


def _parse_rdap_datetime(value: str | None) -> str | None:
    if not value:
        return None
    try:
        if value.endswith("Z"):
            dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
        else:
            dt = datetime.fromisoformat(value)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc).isoformat()
    except ValueError:
        return value


def _event_dates(events: list[dict[str, Any]]) -> dict[str, str | None]:
    created: str | None = None
    updated: str | None = None
    expires: str | None = None
    for event in events:
        action = (event.get("eventAction") or "").lower()
        when = _parse_rdap_datetime(event.get("eventDate"))
        if not when:
            continue
        if action == "registration" and not created:
            created = when
        elif action == "last changed" and not updated:
            updated = when
        elif action in ("expiration", "registrar expiration") and not expires:
            expires = when
    return {"created": created, "updated": updated, "expires": expires}


def _registrar_name(data: dict[str, Any]) -> str | None:
    for entity in data.get("entities") or []:
        roles = [str(r).lower() for r in entity.get("roles") or []]
        if "registrar" not in roles:
            continue
        vcard = entity.get("vcardArray")
        if isinstance(vcard, list) and len(vcard) > 1:
            for entry in vcard[1]:
                if isinstance(entry, list) and len(entry) >= 4 and entry[0] == "fn":
                    return str(entry[3])
        if entity.get("handle"):
            return str(entity["handle"])
    return None


def _nameservers(data: dict[str, Any]) -> list[str]:
    names: list[str] = []
    for ns in data.get("nameservers") or []:
        ldh = ns.get("ldhName")
        if ldh:
            names.append(str(ldh).lower().rstrip("."))
    return sorted(set(names))


def fetch_domain_rdap(domain: str) -> dict[str, Any]:
    """Fetch and normalize RDAP data for a domain."""
    normalized = normalize_domain(domain)
    url = f"https://rdap.org/domain/{normalized}"
    try:
        response = requests.get(
            url,
            timeout=RDAP_TIMEOUT_SEC,
            headers={"Accept": "application/rdap+json", "User-Agent": USER_AGENT},
        )
    except requests.RequestException as exc:
        raise RdapError(f"RDAP request failed: {exc}") from exc

    if response.status_code == 429:
        raise RdapError("Rate limit exceeded; try again later")
    if response.status_code == 404:
        raise RdapError(f"No RDAP data found for {normalized}")
    if not response.ok:
        raise RdapError(f"RDAP returned HTTP {response.status_code}")

    try:
        payload = response.json()
    except ValueError as exc:
        raise RdapError("Invalid RDAP response") from exc

    dates = _event_dates(list(payload.get("events") or []))
    return {
        "domain": normalized,
        "registrar": _registrar_name(payload),
        "created": dates["created"],
        "updated": dates["updated"],
        "expires": dates["expires"],
        "nameservers": _nameservers(payload),
        "statuses": [str(s) for s in payload.get("status") or []],
    }


def days_until(iso_date: str | None) -> int | None:
    if not iso_date:
        return None
    try:
        dt = datetime.fromisoformat(iso_date.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        delta = dt - datetime.now(timezone.utc)
        return int(delta.total_seconds() // 86400)
    except ValueError:
        return None
