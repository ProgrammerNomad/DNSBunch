"""Parse Received headers into a structured hop chain (mail-tester only)."""
from __future__ import annotations

import re
from email.message import Message
from typing import Any

_RECEIVED_IP = re.compile(r"\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d?\d)\b")
_HELO = re.compile(r"\bfrom\s+(\S+)", re.I)
_BY = re.compile(r"\bby\s+(\S+)", re.I)
_WITH = re.compile(r"\bwith\s+(\S+)", re.I)
_TLS = re.compile(r"\bTLS[^;\)]*", re.I)


def _is_private_ipv4(ip: str) -> bool:
    parts = ip.split(".")
    if len(parts) != 4:
        return True
    try:
        nums = [int(p) for p in parts]
    except ValueError:
        return True
    if any(n < 0 or n > 255 for n in nums):
        return True
    if nums[0] == 10 or nums[0] == 127:
        return True
    if nums[0] == 172 and 16 <= nums[1] <= 31:
        return True
    if nums[0] == 192 and nums[1] == 168:
        return True
    return False


def parse_received_chain(msg: Message) -> list[dict[str, Any]]:
    headers = msg.get_all("Received", []) or []
    hops: list[dict[str, Any]] = []
    for idx, header in enumerate(headers):
        if not isinstance(header, str):
            continue
        ips = _RECEIVED_IP.findall(header)
        public_ips = [ip for ip in ips if not _is_private_ipv4(ip)]
        helo_m = _HELO.search(header)
        by_m = _BY.search(header)
        with_m = _WITH.search(header)
        tls_m = _TLS.search(header)
        hops.append(
            {
                "index": idx,
                "raw": header[:500],
                "from_host": helo_m.group(1) if helo_m else None,
                "by_host": by_m.group(1) if by_m else None,
                "protocol": with_m.group(1) if with_m else None,
                "tls": tls_m.group(0) if tls_m else None,
                "ips": ips,
                "public_ips": public_ips,
            }
        )
    return hops


def sender_from_chain(hops: list[dict[str, Any]]) -> dict[str, Any]:
    connecting_ip: str | None = None
    helo: str | None = None
    for hop in hops:
        if hop.get("public_ips"):
            connecting_ip = hop["public_ips"][0]
            helo = hop.get("from_host")
            break
    return {"ip": connecting_ip, "helo": helo, "received_chain": hops}
