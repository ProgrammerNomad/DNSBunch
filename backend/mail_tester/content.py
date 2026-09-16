"""Lightweight content analysis from MIME."""
from __future__ import annotations

import re
from email import message_from_bytes
from email.message import Message
from typing import Any

_LINK = re.compile(r"https?://[^\s<>\"']+", re.I)


def analyze_content(msg: Message, raw: bytes) -> dict[str, Any]:
    has_html = False
    has_text = False
    link_count = len(_LINK.findall(raw.decode("utf-8", errors="replace")[:500_000]))

    if msg.is_multipart():
        for part in msg.walk():
            ctype = part.get_content_type()
            if ctype == "text/html":
                has_html = True
            if ctype == "text/plain":
                has_text = True
    else:
        ctype = msg.get_content_type()
        has_html = ctype == "text/html"
        has_text = ctype == "text/plain"

    return {"html": has_html, "text": has_text, "links": link_count}


def message_from_raw(raw: bytes) -> Message:
    return message_from_bytes(raw)
