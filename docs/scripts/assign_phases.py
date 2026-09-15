#!/usr/bin/env python3
"""Set phase field in feature doc metadata per docs/roadmap/PHASES.md."""
from __future__ import annotations

import re
from pathlib import Path

DOCS = Path(__file__).resolve().parents[1]
FEATURES = DOCS / "features"

# path suffix -> phase (string as in docs)
PHASE_BY_FILE = {
    "platform/tool-registry.md": "0",
    "platform/internal-jwt-proxy.md": "0",
    "platform/analytics-events.md": "0",
    "platform/auth-optional-accounts.md": "2",
    "platform/billing-stripe-ready.md": "3",
    "platform/entitlements-quotas.md": "3",
    "dns-health/bulk-checker.md": "1",
    "shipped/dns-health-single.md": "-",
    "email/mail-tester-inbound.md": "2",
    "email/spf-checker.md": "1",
    "email/dkim-checker.md": "1",
    "email/dmarc-checker.md": "1",
    "email/mx-lookup.md": "1",
    "email/smtp-test.md": "1",
    "email/dnsbl-blacklist.md": "1",
    "website/ssl-inspector.md": "1",
    "website/http-headers.md": "1",
    "website/redirect-chain.md": "1",
    "website/http-status.md": "1",
    "domain/whois-lookup.md": "1",
    "domain/domain-expiry.md": "1",
    "domain/dns-propagation.md": "1",
    "domain/dns-history.md": "1",
    "monitoring/dns-change-alerts.md": "3",
    "monitoring/ssl-expiry-alerts.md": "3",
    "monitoring/domain-expiry-alerts.md": "3",
    "monitoring/uptime-checks.md": "3",
    "monitoring/email-health-watch.md": "3",
    "pro-experiments/developer-api-keys.md": "3",
    "pro-experiments/export-pdf-json-csv.md": "3",
    "pro-experiments/shareable-result-links.md": "3",
    "pro-experiments/white-label-reports.md": "3",
    "ux/dark-mode.md": "5",
    "ux/result-comparison.md": "5",
    "ux/pwa-mobile.md": "5",
    "ux/browser-extension.md": "5",
}


def rel_key(path: Path) -> str:
    return str(path.relative_to(FEATURES)).replace("\\", "/")


def set_phase(content: str, phase: str) -> str:
    def repl(m: re.Match[str]) -> str:
        return f"{m.group(1)}{phase} "

    return re.sub(
        r"(\| \*\*phase\*\* \| )[^\n|]+",
        repl,
        content,
        count=1,
    )


def main() -> None:
    for path in sorted(FEATURES.rglob("*.md")):
        if path.name == "_TEMPLATE.md":
            continue
        key = rel_key(path)
        phase = PHASE_BY_FILE.get(key)
        if phase is None:
            print(f"SKIP (no mapping): {key}")
            continue
        text = path.read_text(encoding="utf-8")
        new_text = set_phase(text, phase)
        if new_text != text:
            path.write_text(new_text, encoding="utf-8")
            print(f"Updated {key} -> phase {phase}")


if __name__ == "__main__":
    main()
