"""TLS certificate inspector for public HTTPS hosts."""
from __future__ import annotations

import socket
import ssl
from datetime import datetime, timezone
from typing import Any
from urllib.parse import urlparse

from tools.validation import assert_public_host, is_valid_hostname

SSL_TIMEOUT_SEC = 15
EXPIRY_WARNING_DAYS = 30


def normalize_ssl_host(host: str) -> str:
    """Accept hostname or https URL; port 443 only in v1."""
    raw = (host or "").strip()
    if not raw:
        raise ValueError("Host is required")

    candidate = raw
    if "://" in candidate:
        parsed = urlparse(candidate)
        if parsed.scheme.lower() not in ("http", "https"):
            raise ValueError("URL scheme must be http or https")
        candidate = parsed.hostname or ""
        if parsed.port is not None and parsed.port != 443:
            raise ValueError("Only port 443 supported in v1")

    cleaned = candidate.lower().rstrip(".")
    if not cleaned:
        raise ValueError("Host is required")

    if cleaned.count(":") == 1 and not cleaned.startswith("["):
        host_part, port_part = cleaned.rsplit(":", 1)
        if port_part.isdigit():
            if int(port_part) != 443:
                raise ValueError("Only port 443 supported in v1")
            cleaned = host_part

    if not is_valid_hostname(cleaned):
        raise ValueError("Invalid host format")

    assert_public_host(cleaned)
    return cleaned


def _parse_cert_datetime(value: str) -> datetime:
    return datetime.strptime(value, "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)


def _issuer_display(cert: dict[str, Any]) -> str:
    parts: list[str] = []
    for item in cert.get("issuer") or ():
        for _key, val in item:
            parts.append(str(val))
    return ", ".join(parts) if parts else ""


def _subject_cn(cert: dict[str, Any]) -> str | None:
    for item in cert.get("subject") or ():
        for key, val in item:
            if key == "commonName":
                return str(val)
    return None


def _dns_names(cert: dict[str, Any]) -> list[str]:
    names: list[str] = []
    cn = _subject_cn(cert)
    if cn:
        names.append(cn)
    for typ, val in cert.get("subjectAltName") or ():
        if typ == "DNS" and val not in names:
            names.append(str(val))
    return names


def _hostname_matches(host: str, cert: dict[str, Any]) -> bool:
    host_lower = host.lower()
    for name in _dns_names(cert):
        name_lower = name.lower()
        if name_lower == host_lower:
            return True
        if name_lower.startswith("*."):
            suffix = name_lower[1:]
            if host_lower.endswith(suffix) and host_lower != suffix.lstrip("."):
                return True
    return False


def _inspect_tls(host: str) -> dict[str, Any]:
    context = ssl.create_default_context()
    with socket.create_connection((host, 443), timeout=SSL_TIMEOUT_SEC) as sock:
        with context.wrap_socket(sock, server_hostname=host) as tls_sock:
            cert = tls_sock.getpeercert() or {}
            tls_version = tls_sock.version() or ""

    if not cert:
        raise ValueError("No certificate returned by server")

    not_before = _parse_cert_datetime(cert["notBefore"])
    not_after = _parse_cert_datetime(cert["notAfter"])
    now = datetime.now(timezone.utc)
    days_until = int((not_after - now).total_seconds() // 86400)
    hostname_match = _hostname_matches(host, cert)

    issues: list[str] = []
    status = "pass"
    if not hostname_match:
        issues.append("Certificate does not match the requested hostname")
        status = "warning"
    if days_until < 0:
        issues.append("Certificate has expired")
        status = "error"
    elif days_until <= EXPIRY_WARNING_DAYS:
        issues.append(f"Certificate expires in {days_until} day(s)")
        if status != "error":
            status = "warning"

    return {
        "host": host,
        "status": status,
        "tls_version": tls_version,
        "subject_cn": _subject_cn(cert),
        "issuer": _issuer_display(cert),
        "sans": _dns_names(cert),
        "not_before": not_before.isoformat(),
        "not_after": not_after.isoformat(),
        "days_until_expiry": days_until,
        "hostname_match": hostname_match,
        "issues": issues,
        "error": None,
    }


def run_ssl_inspector(*, host: str = "", **_kwargs: Any) -> dict[str, Any]:
    normalized = normalize_ssl_host(host)
    try:
        return _inspect_tls(normalized)
    except (OSError, ssl.SSLError, socket.timeout, ValueError) as exc:
        message = str(exc) or "TLS connection failed"
        return {
            "host": normalized,
            "status": "error",
            "tls_version": None,
            "subject_cn": None,
            "issuer": None,
            "sans": [],
            "not_before": None,
            "not_after": None,
            "days_until_expiry": None,
            "hostname_match": False,
            "issues": [message],
            "error": message,
        }
