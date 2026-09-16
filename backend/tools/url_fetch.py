"""Safe HTTP GET for website tools (SSRF controls, redirect cap)."""
from __future__ import annotations

import os
import re
from dataclasses import dataclass
from typing import Any
from urllib.parse import urljoin, urlparse, urlunparse

import requests

from tools.validation import assert_public_host

MAX_FETCH_URL_LENGTH = int(os.environ.get("MAX_FETCH_URL_LENGTH", "2048"))
DEFAULT_MAX_REDIRECTS = 5
DEFAULT_TIMEOUT_SEC = 15
USER_AGENT = "DNSBunch/1.0"

_REDIRECT_STATUS = frozenset({301, 302, 303, 307, 308})
_BLOCKED_HOSTNAMES = frozenset(
    {
        "localhost",
        "localhost.localdomain",
        "metadata.google.internal",
        "metadata",
    }
)


@dataclass(frozen=True)
class FetchGetResult:
    final_url: str
    status_code: int
    headers: dict[str, str]


def normalize_fetch_url(url: str) -> str:
    """Strip, optional https default, validate length and parse."""
    raw = (url or "").strip()
    if not raw:
        raise ValueError("URL is required")
    if len(raw) > MAX_FETCH_URL_LENGTH:
        raise ValueError("URL is too long")

    if re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*://", raw):
        candidate = raw
    else:
        candidate = f"https://{raw}"

    parsed = urlparse(candidate)
    if not parsed.scheme or not parsed.netloc:
        raise ValueError("Invalid URL format")

    scheme = parsed.scheme.lower()
    if scheme not in ("http", "https"):
        raise ValueError("URL scheme must be http or https")

    # Reject embedded credentials in URL (SSRF / abuse surface).
    if parsed.username or parsed.password:
        raise ValueError("URL must not include userinfo")

    normalized = urlunparse(
        (
            scheme,
            parsed.netloc.lower(),
            parsed.path or "",
            parsed.params,
            parsed.query,
            parsed.fragment,
        )
    )
    return normalized


def assert_safe_fetch_url(url: str) -> str:
    """Normalize URL and ensure the target host is allowed (public, not localhost)."""
    normalized = normalize_fetch_url(url)
    parsed = urlparse(normalized)
    host = parsed.hostname
    if not host:
        raise ValueError("URL host is required")

    host_lower = host.lower().rstrip(".")
    if host_lower in _BLOCKED_HOSTNAMES or host_lower.endswith(".localhost"):
        raise ValueError("Target host is not allowed")

    assert_public_host(host)
    return normalized


def fetch_get_with_redirect_cap(
    url: str,
    *,
    max_redirects: int = DEFAULT_MAX_REDIRECTS,
    timeout: float = DEFAULT_TIMEOUT_SEC,
) -> FetchGetResult:
    """GET with manual redirects; re-validates host on each hop."""
    if max_redirects < 0:
        raise ValueError("max_redirects must be non-negative")

    current = assert_safe_fetch_url(url)
    redirects = 0

    with requests.Session() as session:
        while True:
            assert_safe_fetch_url(current)
            try:
                response = session.get(
                    current,
                    allow_redirects=False,
                    timeout=timeout,
                    headers={"User-Agent": USER_AGENT},
                    stream=True,
                )
            except requests.RequestException as exc:
                raise ValueError(f"Request failed: {exc}") from exc

            if response.status_code in _REDIRECT_STATUS:
                location = response.headers.get("Location") or response.headers.get("location")
                response.close()
                if not location:
                    raise ValueError("Redirect response missing Location header")
                next_url = urljoin(current, location.strip())
                redirects += 1
                if redirects > max_redirects:
                    raise ValueError("Too many redirects")
                current = next_url
                continue

            headers = {str(k): str(v) for k, v in response.headers.items()}
            status_code = int(response.status_code)
            response.close()
            return FetchGetResult(
                final_url=current,
                status_code=status_code,
                headers=headers,
            )
