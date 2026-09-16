"""SMTP connectivity probe - banner + EHLO only; no mail sent."""
from __future__ import annotations

import asyncio
import socket
from typing import Any

from dns_checker import DNSChecker

from tools.validation import SmtpTarget, assert_public_host, parse_smtp_target

CONNECT_TIMEOUT_S = 10
READ_TIMEOUT_S = 10
EHLO_HOSTNAME = "dnsbunch.local"


def _read_smtp_response(sock: socket.socket) -> str:
    lines: list[str] = []
    while True:
        chunk = b""
        while b"\n" not in chunk:
            part = sock.recv(4096)
            if not part:
                break
            chunk += part
        if not chunk:
            break
        line = chunk.decode("utf-8", errors="replace").strip("\r\n")
        if not line:
            continue
        lines.append(line)
        if len(line) >= 4 and line[3] == " ":
            break
    return "\n".join(lines)


def _resolve_mx_host(domain: str) -> str:
    checker = DNSChecker(domain)
    results = asyncio.run(checker.run_all_checks(["mx"]))
    mx = results.get("checks", {}).get("mx") or {}
    records = mx.get("records") or []
    if not records:
        raise ValueError("No MX records found for this domain")
    first = records[0]
    host = first.get("host") if isinstance(first, dict) else None
    if not host:
        raise ValueError("No MX records found for this domain")
    return str(host).rstrip(".").lower()


def _probe_smtp(host: str, port: int) -> dict[str, Any]:
    assert_public_host(host)
    sock: socket.socket | None = None
    try:
        sock = socket.create_connection((host, port), timeout=CONNECT_TIMEOUT_S)
        sock.settimeout(READ_TIMEOUT_S)
        banner = _read_smtp_response(sock)
        sock.sendall(f"EHLO {EHLO_HOSTNAME}\r\n".encode("ascii"))
        ehlo_response = _read_smtp_response(sock)

        issues: list[str] = []
        status = "pass"
        if not banner.startswith("220"):
            status = "warning"
            issues.append("Unexpected SMTP greeting (expected 220)")
        if ehlo_response and not ehlo_response.splitlines()[0].startswith("250"):
            status = "warning"
            issues.append("EHLO did not return 250")

        return {
            "status": status,
            "banner": banner,
            "ehlo_response": ehlo_response,
            "issues": issues,
            "error": None,
        }
    except socket.timeout:
        return {
            "status": "error",
            "banner": "",
            "ehlo_response": "",
            "issues": [],
            "error": f"Connection timed out after {CONNECT_TIMEOUT_S}s",
        }
    except OSError as exc:
        return {
            "status": "error",
            "banner": "",
            "ehlo_response": "",
            "issues": [],
            "error": f"Connection failed: {exc}",
        }
    finally:
        if sock is not None:
            try:
                sock.close()
            except OSError:
                pass


def run_smtp_test(
    *,
    domain: str = "",
    host: str = "",
    port: int | None = None,
    **_kwargs: Any,
) -> dict[str, Any]:
    target: SmtpTarget = parse_smtp_target(domain=domain, host=host, port=port)
    connect_host = target.host or _resolve_mx_host(target.domain or "")
    probe = _probe_smtp(connect_host, target.port)

    return {
        "domain": target.domain,
        "host": connect_host,
        "port": target.port,
        **probe,
    }
