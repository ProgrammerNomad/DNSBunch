"""Query fixed public resolvers and compare DNS answers."""
from __future__ import annotations

import re
from collections import Counter
from typing import Any

import dns.exception
import dns.resolver

ALLOWED_RECORD_TYPES = frozenset({"A", "AAAA", "MX", "NS", "TXT", "CNAME"})

PUBLIC_RESOLVERS: tuple[tuple[str, str], ...] = (
    ("google", "8.8.8.8"),
    ("cloudflare", "1.1.1.1"),
    ("quad9", "9.9.9.9"),
)

_QUERY_NAME_PATTERN = re.compile(
    r"^[a-z0-9]([a-z0-9-]{0,61})?(\.[a-z0-9]([a-z0-9-]{0,61})?)*$"
)


def normalize_query_name(name: str) -> str:
    """FQDN for DNS queries (domain or host under a domain)."""
    cleaned = (name or "").strip().lower().rstrip(".")
    if not cleaned or len(cleaned) > 253:
        raise ValueError("Name is required")
    if not _QUERY_NAME_PATTERN.match(cleaned):
        raise ValueError("Invalid DNS name format")
    return cleaned


def normalize_record_type(record_type: str) -> str:
    cleaned = (record_type or "").strip().upper()
    if cleaned not in ALLOWED_RECORD_TYPES:
        raise ValueError("Record type must be one of: A, AAAA, MX, NS, TXT, CNAME")
    return cleaned


def _format_rdata(record_type: str, rdata: Any) -> str:
    if record_type == "MX":
        return f"{rdata.preference} {rdata.exchange}".lower().rstrip(".")
    if record_type == "TXT":
        return rdata.to_text().strip('"')
    return str(rdata).lower().rstrip(".")


def _query_resolver(resolver_ip: str, name: str, record_type: str) -> tuple[list[str], str | None]:
    resolver = dns.resolver.Resolver(configure=False)
    resolver.nameservers = [resolver_ip]
    resolver.lifetime = 10
    try:
        answers = resolver.resolve(name, record_type)
    except dns.exception.DNSException as exc:
        return [], str(exc)
    values = sorted({_format_rdata(record_type, rdata) for rdata in answers})
    return values, None


def run_dns_propagation(
    *,
    domain: str = "",
    name: str = "",
    type: str = "",
    record_type: str = "",
    **_kwargs: Any,
) -> dict[str, Any]:
    # Accept `domain` as alias for bare name input from BFF consistency.
    name_input = name or domain
    if not name_input:
        raise ValueError("Name is required")
    query_name = normalize_query_name(name_input)
    rtype = normalize_record_type(record_type or type)

    rows: list[dict[str, Any]] = []
    answer_sets: list[tuple[str, ...]] = []

    for resolver_id, resolver_ip in PUBLIC_RESOLVERS:
        answers, error = _query_resolver(resolver_ip, query_name, rtype)
        rows.append(
            {
                "resolver_id": resolver_id,
                "resolver_ip": resolver_ip,
                "answers": answers,
                "error": error,
            }
        )
        if answers:
            answer_sets.append(tuple(answers))

    signatures = [tuple(row["answers"]) for row in rows]
    if not signatures:
        agreement = 0
    else:
        agreement = int(round(100 * Counter(signatures).most_common(1)[0][1] / len(signatures)))
    unique_answers = set(signatures)

    issues: list[str] = []
    status = "pass"
    if len(unique_answers) > 1:
        status = "warning"
        issues.append("Resolvers returned different answers")
    if not any(row["answers"] for row in rows):
        status = "warning"
        issues.append("No resolver returned answers")

    return {
        "name": query_name,
        "record_type": rtype,
        "agreement_percent": agreement,
        "status": status,
        "rows": rows,
        "issues": issues,
        "error": None,
    }
