"""Compose mail-tester v2 report from orchestrated modules (no duplicate DNS)."""
from __future__ import annotations

import base64
import email.utils
from email import message_from_bytes
from typing import Any

from mail_tester.content import analyze_content
from mail_tester.dns_configuration import build_dns_configuration
from mail_tester.message_authentication import build_message_authentication
from mail_tester.ptr import lookup_ptr
from mail_tester.received import parse_received_chain, sender_from_chain
from mail_tester.spamassassin import analyze_spamassassin
from tools.dnsbl_lookup.runner import run_dnsbl_lookup
from tools.validation import normalize_domain

VERDICT = "Deliverability test score - not a guarantee of inbox placement."

WEIGHTS = {
    "authentication": 0.4,
    "spam_analysis": 0.3,
    "blacklists": 0.2,
    "message_quality": 0.1,
}


def _domain_from_address(value: str) -> str | None:
    if not value:
        return None
    _, addr = email.utils.parseaddr(value)
    if not addr or "@" not in addr:
        return None
    domain = addr.rsplit("@", 1)[-1].strip().lower()
    try:
        return normalize_domain(domain)
    except ValueError:
        return None


def _auth_partial(msg_auth: dict[str, Any], dns_cfg: dict[str, Any]) -> float:
    msg_scores = []
    for key in ("spf", "dkim", "dmarc"):
        result = str(msg_auth.get(key, {}).get("result", "none")).lower()
        msg_scores.append(1.0 if result == "pass" else 0.5 if result in ("neutral", "none") else 0.0)

    dns_scores = []
    spf = dns_cfg.get("spf") or {}
    dmarc = dns_cfg.get("dmarc") or {}
    if spf.get("record"):
        dns_scores.append(1.0 if str(spf.get("status")) in ("success", "ok", "pass", "warning") else 0.5)
    else:
        dns_scores.append(0.0)
    if dmarc.get("record"):
        dns_scores.append(1.0 if str(dmarc.get("status")) in ("success", "ok", "pass") else 0.5)
    else:
        dns_scores.append(0.0)
    dkim_cfg = dns_cfg.get("dkim") or {}
    selectors = dkim_cfg.get("selectors") or []
    if selectors and any(s.get("status") in ("success", "ok", "pass") for s in selectors if isinstance(s, dict)):
        dns_scores.append(1.0)
    elif selectors:
        dns_scores.append(0.5)
    else:
        dns_scores.append(0.3)

    return (sum(msg_scores) / len(msg_scores) * 0.5 + sum(dns_scores) / max(len(dns_scores), 1) * 0.5)


def _spam_partial(sa: dict[str, Any]) -> float:
    if not sa.get("available"):
        return 0.7
    score = sa.get("score")
    if score is None:
        return 0.7
    try:
        val = float(score)
    except (TypeError, ValueError):
        return 0.7
    if val <= 0:
        return 1.0
    if val >= 5:
        return 0.2
    return max(0.0, 1.0 - val / 5.0)


def _blacklist_partial(bl: dict[str, Any]) -> float:
    total = int(bl.get("total") or 0)
    listed = int(bl.get("listed") or 0)
    if total <= 0:
        return 1.0
    return max(0.0, 1.0 - listed / total)


def _quality_partial(content: dict[str, Any], msg) -> float:
    score = 0.0
    if content.get("text") or content.get("html"):
        score += 0.5
    if msg.get("Subject"):
        score += 0.25
    if msg.get("Message-ID"):
        score += 0.25
    return min(1.0, score)


def _summary_status(score: float) -> str:
    if score >= 8:
        return "good"
    if score >= 5:
        return "fair"
    return "poor"


def score_raw_message(raw: bytes) -> dict[str, Any]:
    if not raw or len(raw) > 2_500_000:
        raise ValueError("Message empty or too large (max 2.5 MB)")

    msg = message_from_bytes(raw)
    from_domain = _domain_from_address(msg.get("From", "") or "")

    hops = parse_received_chain(msg)
    sender = sender_from_chain(hops)
    ptr = lookup_ptr(sender["ip"]) if sender.get("ip") else None
    sender["ptr"] = ptr

    msg_auth = build_message_authentication(msg, raw)
    dns_cfg = build_dns_configuration(from_domain, raw)

    bl_data: dict[str, Any] = {"listed": 0, "total": 0, "results": []}
    if sender.get("ip"):
        try:
            bl_data = run_dnsbl_lookup(ip=sender["ip"])
            rows = bl_data.get("rows") or []
            bl_data = {
                "listed": sum(1 for r in rows if r.get("result") == "listed"),
                "total": len(rows),
                "results": rows,
            }
        except Exception as exc:  # noqa: BLE001
            bl_data = {"listed": 0, "total": 0, "results": [], "error": str(exc)}

    sa = analyze_spamassassin(raw)
    content = analyze_content(msg, raw)

    partials = {
        "authentication": _auth_partial(msg_auth, dns_cfg),
        "spam_analysis": _spam_partial(sa),
        "blacklists": _blacklist_partial(bl_data),
        "message_quality": _quality_partial(content, msg),
    }

    weighted = sum(partials[k] * WEIGHTS[k] for k in WEIGHTS)
    score = round(weighted * 10, 1)

    raw_headers = raw.decode("utf-8", errors="replace")
    if len(raw_headers) > 120_000:
        raw_headers = raw_headers[:120_000] + "\n… [truncated]"

    return {
        "score": score,
        "summary": {"status": _summary_status(score), "verdict": VERDICT},
        "categories": {k: {"weight": WEIGHTS[k], "partial": round(partials[k], 3)} for k in WEIGHTS},
        "message_authentication": msg_auth,
        "dns_configuration": dns_cfg,
        "sender": sender,
        "spamassassin": sa,
        "blacklists": bl_data,
        "headers": {"raw": raw_headers},
        "content": content,
        "from_domain": from_domain,
    }


def score_from_payload(data: dict[str, Any]) -> dict[str, Any]:
    raw_b64 = data.get("raw")
    if not isinstance(raw_b64, str) or not raw_b64.strip():
        raise ValueError("Missing base64 field 'raw'")
    try:
        raw = base64.b64decode(raw_b64, validate=True)
    except Exception as exc:
        raise ValueError("Invalid base64 in 'raw'") from exc
    return score_raw_message(raw)
