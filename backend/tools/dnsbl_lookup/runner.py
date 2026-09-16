"""DNSBL lookup - query common IPv4 blocklists."""
from __future__ import annotations

from typing import Any

import dns.resolver

from tools.validation import DnsblTarget, is_public_ipv4, parse_dnsbl_target

MAX_IPS_PER_RUN = 5

RBL_ZONES: tuple[dict[str, str], ...] = (
    {"rbl_id": "spamhaus_zen", "zone": "zen.spamhaus.org", "label": "Spamhaus ZEN"},
    {"rbl_id": "spamcop", "zone": "bl.spamcop.net", "label": "SpamCop"},
    {"rbl_id": "barracuda", "zone": "b.barracudacentral.org", "label": "Barracuda"},
)


def _reverse_ipv4(ip: str) -> str:
    parts = ip.split(".")
    if len(parts) != 4:
        raise ValueError("Invalid IPv4 address")
    return ".".join(reversed(parts))


def _public_ipv4s_for_domain(domain: str) -> list[str]:
    resolver = dns.resolver.Resolver()
    try:
        answers = resolver.resolve(domain, "A")
    except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer) as exc:
        raise ValueError(f"No A records found for {domain}") from exc
    except Exception as exc:
        raise ValueError(f"Failed to resolve A records for {domain}: {exc}") from exc

    ips: list[str] = []
    seen: set[str] = set()
    for rdata in answers:
        ip = str(rdata)
        if not is_public_ipv4(ip) or ip in seen:
            continue
        seen.add(ip)
        ips.append(ip)
        if len(ips) >= MAX_IPS_PER_RUN:
            break

    if not ips:
        raise ValueError(f"No public IPv4 addresses found for {domain}")
    return ips


def _query_rbl(ip: str, zone_meta: dict[str, str]) -> dict[str, Any]:
    zone = zone_meta["zone"]
    query = f"{_reverse_ipv4(ip)}.{zone}"
    row: dict[str, Any] = {
        "rbl_id": zone_meta["rbl_id"],
        "label": zone_meta["label"],
        "zone": zone,
        "ip": ip,
        "query": query,
        "result": "clean",
        "response": None,
        "message": None,
    }
    resolver = dns.resolver.Resolver()
    try:
        answers = resolver.resolve(query, "A")
        if not answers:
            return row
        response = str(answers[0])
        row["response"] = response
        if response.startswith("127."):
            row["result"] = "listed"
        else:
            row["result"] = "error"
            row["message"] = f"Unexpected listing response: {response}"
        return row
    except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer):
        return row
    except Exception as exc:
        row["result"] = "error"
        row["message"] = str(exc)
        return row


def _overall_status(rows: list[dict[str, Any]]) -> str:
    if not rows:
        return "error"
    if any(r["result"] == "listed" for r in rows):
        return "warning"
    if all(r["result"] == "error" for r in rows):
        return "error"
    return "pass"


def run_dnsbl_lookup(
    *,
    domain: str = "",
    ip: str = "",
    **_kwargs: Any,
) -> dict[str, Any]:
    target: DnsblTarget = parse_dnsbl_target(domain=domain, ip=ip)
    ips = [target.ip] if target.ip else _public_ipv4s_for_domain(target.domain or "")

    rows: list[dict[str, Any]] = []
    for checked_ip in ips:
        for zone_meta in RBL_ZONES:
            rows.append(_query_rbl(checked_ip, zone_meta))

    status = _overall_status(rows)
    issues: list[str] = []
    listed = [r for r in rows if r["result"] == "listed"]
    if listed:
        issues.append(f"Listed on {len(listed)} blocklist query result(s).")

    return {
        "input": {"domain": target.domain, "ip": target.ip},
        "ips_checked": ips,
        "status": status,
        "rows": rows,
        "issues": issues,
    }
