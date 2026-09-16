"""Shared input validation for tools (single source with app routes)."""
from __future__ import annotations

import ipaddress
import os
import re
import socket
from dataclasses import dataclass
from typing import Any

MAX_DOMAIN_LENGTH = int(os.environ.get("MAX_DOMAIN_LENGTH", "253"))


def is_valid_domain(domain: str) -> bool:
    """Validate domain format (same rules as legacy /api/check)."""
    if not domain or len(domain) > MAX_DOMAIN_LENGTH:
        return False

    domain_pattern = (
        r"^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?"
        r"(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$"
    )
    if not re.match(domain_pattern, domain):
        return False

    suspicious = ["localhost", "127.0.0.1", "test.test", "example.example"]
    if any(pattern in domain.lower() for pattern in suspicious):
        return False

    return True


_DKIM_SELECTOR_PATTERN = re.compile(r"^[a-z0-9]([a-z0-9-]{0,62})?$")


def is_valid_dkim_selector(selector: str) -> bool:
    if not selector or len(selector) > 63:
        return False
    return bool(_DKIM_SELECTOR_PATTERN.match(selector))


def normalize_dkim_selector(selector: str) -> str:
    """Strip and lowercase DKIM selector; raises ValueError if invalid."""
    normalized = (selector or "").strip().lower()
    if not normalized:
        raise ValueError("Selector is required")
    if not is_valid_dkim_selector(normalized):
        raise ValueError("Invalid selector format")
    return normalized


def normalize_domain(domain: str) -> str:
    """Strip and lowercase domain; raises ValueError if invalid."""
    normalized = (domain or "").strip().lower()
    if not normalized:
        raise ValueError("Domain is required")
    if not is_valid_domain(normalized):
        raise ValueError("Invalid domain format")
    return normalized


_HOSTNAME_PATTERN = re.compile(
    r"^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,62})?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,62})?)*$"
)

ALLOWED_SMTP_PORTS = frozenset({25, 587})


def is_valid_hostname(host: str) -> bool:
    if not host or len(host) > 253:
        return False
    if host.lower() in ("localhost", "localhost.localdomain"):
        return False
    return bool(_HOSTNAME_PATTERN.match(host))


def _ip_is_blocked(ip_str: str) -> bool:
    try:
        addr = ipaddress.ip_address(ip_str)
    except ValueError:
        return False
    return bool(
        addr.is_private
        or addr.is_loopback
        or addr.is_link_local
        or addr.is_reserved
        or addr.is_multicast
    )


def assert_public_host(host: str) -> None:
    """Reject hosts that resolve only to private/reserved addresses."""
    cleaned = (host or "").strip().lower().rstrip(".")
    if not cleaned:
        raise ValueError("Host is required")

    try:
        ipaddress.ip_address(cleaned)
        is_literal_ip = True
    except ValueError:
        is_literal_ip = False

    if is_literal_ip:
        if _ip_is_blocked(cleaned):
            raise ValueError("Target host is not allowed (private or reserved address)")
        return

    if not is_valid_hostname(cleaned):
        raise ValueError("Invalid host format")

    try:
        infos = socket.getaddrinfo(
            cleaned,
            None,
            type=socket.SOCK_STREAM,
            proto=socket.IPPROTO_TCP,
        )
    except socket.gaierror as exc:
        raise ValueError(f"Could not resolve host: {cleaned}") from exc

    if not infos:
        raise ValueError(f"Could not resolve host: {cleaned}")

    for info in infos:
        sockaddr = info[4]
        if sockaddr and _ip_is_blocked(sockaddr[0]):
            raise ValueError("Target host resolves to a private or reserved address")


@dataclass(frozen=True)
class SmtpTarget:
    domain: str | None
    host: str | None
    port: int


def parse_smtp_target(
    *,
    domain: str = "",
    host: str = "",
    port: int | None = None,
    **_kwargs: Any,
) -> SmtpTarget:
    domain_trimmed = (domain or "").strip()
    host_trimmed = (host or "").strip()

    if domain_trimmed and host_trimmed:
        raise ValueError("Provide domain or host, not both")
    if not domain_trimmed and not host_trimmed:
        raise ValueError("Domain or host is required")

    resolved_port = 25 if port is None else int(port)
    if resolved_port not in ALLOWED_SMTP_PORTS:
        raise ValueError("Port must be 25 or 587")

    if domain_trimmed:
        return SmtpTarget(domain=normalize_domain(domain_trimmed), host=None, port=resolved_port)

    cleaned_host = host_trimmed.lower().rstrip(".")
    if not is_valid_hostname(cleaned_host):
        raise ValueError("Invalid host format")
    return SmtpTarget(domain=None, host=cleaned_host, port=resolved_port)


@dataclass(frozen=True)
class DnsblTarget:
    domain: str | None
    ip: str | None


def normalize_ipv4(ip: str) -> str:
    """Validate public IPv4 for DNSBL queries."""
    cleaned = (ip or "").strip()
    if not cleaned:
        raise ValueError("IP is required")
    try:
        addr = ipaddress.ip_address(cleaned)
    except ValueError as exc:
        raise ValueError("Invalid IPv4 address") from exc
    if addr.version != 4:
        raise ValueError("IPv4 only in v1")
    normalized = str(addr)
    if _ip_is_blocked(normalized):
        raise ValueError("Private or reserved IP addresses are not allowed")
    return normalized


def is_public_ipv4(ip_str: str) -> bool:
    try:
        addr = ipaddress.ip_address(ip_str)
    except ValueError:
        return False
    return addr.version == 4 and not _ip_is_blocked(ip_str)


def parse_dnsbl_target(
    *,
    domain: str = "",
    ip: str = "",
    **_kwargs: Any,
) -> DnsblTarget:
    domain_trimmed = (domain or "").strip()
    ip_trimmed = (ip or "").strip()

    if domain_trimmed and ip_trimmed:
        raise ValueError("Provide domain or IP, not both")
    if not domain_trimmed and not ip_trimmed:
        raise ValueError("Domain or IP is required")

    if domain_trimmed:
        return DnsblTarget(domain=normalize_domain(domain_trimmed), ip=None)
    return DnsblTarget(domain=None, ip=normalize_ipv4(ip_trimmed))
