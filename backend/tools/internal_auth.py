"""Server-to-server HMAC verification for /internal/v1/*."""
from __future__ import annotations

import hashlib
import hmac
import os
import time

MAX_SKEW_SECONDS = 60


def get_internal_secret() -> str | None:
    secret = os.environ.get("INTERNAL_API_SECRET", "").strip()
    return secret or None


def compute_signature(secret: str, timestamp: str, body: bytes) -> str:
    message = timestamp.encode("utf-8") + b"." + body
    return hmac.new(secret.encode("utf-8"), message, hashlib.sha256).hexdigest()


def verify_internal_request(timestamp_header: str | None, signature_header: str | None, body: bytes) -> tuple[bool, str]:
    secret = get_internal_secret()
    if not secret:
        return False, "Internal API not configured"

    if not timestamp_header or not signature_header:
        return False, "Missing internal auth headers"

    try:
        ts = int(timestamp_header)
    except ValueError:
        return False, "Invalid timestamp"

    now = int(time.time())
    if abs(now - ts) > MAX_SKEW_SECONDS:
        return False, "Timestamp expired"

    expected = compute_signature(secret, timestamp_header, body)
    if not hmac.compare_digest(expected, signature_header):
        return False, "Invalid signature"

    return True, ""
