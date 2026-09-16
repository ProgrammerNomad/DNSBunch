"""Reverse DNS (PTR) lookup - single implementation for mail tester."""
from __future__ import annotations

import dns.resolver


def lookup_ptr(ip: str) -> str | None:
    if not ip:
        return None
    reversed_name = ".".join(reversed(ip.split("."))) + ".in-addr.arpa"
    resolver = dns.resolver.Resolver()
    try:
        answers = resolver.resolve(reversed_name, "PTR")
        if answers:
            return str(answers[0]).rstrip(".")
    except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer, dns.resolver.Timeout, Exception):
        return None
    return None
