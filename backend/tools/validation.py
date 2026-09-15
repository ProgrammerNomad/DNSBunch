"""Shared input validation for tools (single source with app routes)."""
from __future__ import annotations

import os
import re

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


def normalize_domain(domain: str) -> str:
    """Strip and lowercase domain; raises ValueError if invalid."""
    normalized = (domain or "").strip().lower()
    if not normalized:
        raise ValueError("Domain is required")
    if not is_valid_domain(normalized):
        raise ValueError("Invalid domain format")
    return normalized
