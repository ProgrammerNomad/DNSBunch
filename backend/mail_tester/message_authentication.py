"""Message-level authentication from headers (no DNS lookups)."""
from __future__ import annotations

import re
from email.message import Message
from typing import Any

_AUTH_LINE = re.compile(r"(spf|dkim|dmarc)\s*=\s*(\w+)", re.I)


def _parse_auth_header(value: str) -> dict[str, str]:
    out: dict[str, str] = {}
    for match in _AUTH_LINE.finditer(value):
        out[match.group(1).lower()] = match.group(2).lower()
    return out


def build_message_authentication(msg: Message, raw: bytes) -> dict[str, Any]:
    auth_header = (
        msg.get("Authentication-Results")
        or msg.get("ARC-Authentication-Results")
        or msg.get("X-Authentication-Results")
        or ""
    )
    parsed = _parse_auth_header(auth_header) if auth_header else {}

    dkim_result = parsed.get("dkim", "none")
    try:
        import dkim  # type: ignore[import-untyped]

        if dkim.verify(raw):
            dkim_result = "pass"
        elif b"dkim-signature:" in raw.lower() and dkim_result == "none":
            dkim_result = "fail"
    except ImportError:
        if dkim_result == "none":
            dkim_result = "unknown"
    except Exception:
        if dkim_result == "none":
            dkim_result = "fail"

    def row(key: str, default: str) -> dict[str, str]:
        val = parsed.get(key, default)
        detail = auth_header[:200] if auth_header else f"No Authentication-Results; inferred {key}={val}"
        return {"result": val, "detail": detail}

    return {
        "spf": row("spf", "none"),
        "dkim": {"result": dkim_result, "detail": auth_header[:200] if auth_header else f"dkim={dkim_result}"},
        "dmarc": row("dmarc", "none"),
    }
