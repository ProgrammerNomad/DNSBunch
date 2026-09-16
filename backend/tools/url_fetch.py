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


@dataclass(frozen=True)
class RedirectHop:
    index: int
    url: str
    status_code: int
    location: str | None


@dataclass(frozen=True)
class RedirectChainResult:
    hops: tuple[RedirectHop, ...]
    final_url: str
    final_status_code: int
    loop_detected: bool
    redirect_limit_exceeded: bool
    headers: dict[str, str]


@dataclass(frozen=True)
class _ManualGetResult:
    hops: tuple[RedirectHop, ...]
    final_headers: dict[str, str] | None
    loop_detected: bool
    redirect_limit_exceeded: bool


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


def _manual_redirect_get(
    url: str,
    session: requests.Session,
    *,
    max_redirects: int,
    timeout: float,
) -> _ManualGetResult:
    if max_redirects < 0:
        raise ValueError("max_redirects must be non-negative")

    current = assert_safe_fetch_url(url)
    redirects = 0
    hops_list: list[RedirectHop] = []
    loop_detected = False
    visited: set[str] = set()

    while True:
        safe_current = assert_safe_fetch_url(current)
        if safe_current in visited:
            loop_detected = True
            break
        visited.add(safe_current)

        try:
            response = session.get(
                safe_current,
                allow_redirects=False,
                timeout=timeout,
                headers={"User-Agent": USER_AGENT},
                stream=True,
            )
        except requests.RequestException as exc:
            raise ValueError(f"Request failed: {exc}") from exc

        status_code = int(response.status_code)

        if status_code in _REDIRECT_STATUS:
            location_raw = response.headers.get("Location") or response.headers.get("location")
            response.close()
            location = location_raw.strip() if location_raw else None
            hops_list.append(
                RedirectHop(
                    index=len(hops_list) + 1,
                    url=safe_current,
                    status_code=status_code,
                    location=location,
                )
            )
            if not location:
                raise ValueError("Redirect response missing Location header")

            next_url = urljoin(safe_current, location)
            safe_next = assert_safe_fetch_url(next_url)
            hop_urls = {hop.url for hop in hops_list}
            if safe_next in visited or safe_next in hop_urls:
                loop_detected = True
                break

            redirects += 1
            if redirects > max_redirects:
                return _ManualGetResult(
                    hops=tuple(hops_list),
                    final_headers=None,
                    loop_detected=False,
                    redirect_limit_exceeded=True,
                )
            current = next_url
            continue

        headers = {str(k): str(v) for k, v in response.headers.items()}
        response.close()
        hops_list.append(
            RedirectHop(
                index=len(hops_list) + 1,
                url=safe_current,
                status_code=status_code,
                location=None,
            )
        )
        return _ManualGetResult(
            hops=tuple(hops_list),
            final_headers=headers,
            loop_detected=loop_detected,
            redirect_limit_exceeded=False,
        )

    return _ManualGetResult(
        hops=tuple(hops_list),
        final_headers=None,
        loop_detected=True,
        redirect_limit_exceeded=False,
    )


def fetch_get_with_redirect_cap(
    url: str,
    *,
    max_redirects: int = DEFAULT_MAX_REDIRECTS,
    timeout: float = DEFAULT_TIMEOUT_SEC,
) -> FetchGetResult:
    """GET with manual redirects; re-validates host on each hop."""
    with requests.Session() as session:
        result = _manual_redirect_get(
            url,
            session,
            max_redirects=max_redirects,
            timeout=timeout,
        )

    if result.loop_detected:
        raise ValueError("Redirect loop detected")
    if result.redirect_limit_exceeded:
        raise ValueError("Too many redirects")
    if not result.hops or result.final_headers is None:
        raise ValueError("Request did not complete")

    terminal = result.hops[-1]
    return FetchGetResult(
        final_url=terminal.url,
        status_code=terminal.status_code,
        headers=result.final_headers,
    )


def fetch_redirect_chain(
    url: str,
    *,
    max_redirects: int = DEFAULT_MAX_REDIRECTS,
    timeout: float = DEFAULT_TIMEOUT_SEC,
) -> RedirectChainResult:
    """GET following redirects manually; records each hop and detects loops."""
    with requests.Session() as session:
        result = _manual_redirect_get(
            url,
            session,
            max_redirects=max_redirects,
            timeout=timeout,
        )

    if not result.hops:
        raise ValueError("Request did not complete")

    terminal = result.hops[-1]
    headers = result.final_headers or {}
    return RedirectChainResult(
        hops=result.hops,
        final_url=terminal.url,
        final_status_code=terminal.status_code,
        loop_detected=result.loop_detected,
        redirect_limit_exceeded=result.redirect_limit_exceeded,
        headers=headers,
    )
