#!/usr/bin/env python3
"""Patch Phase 2-3 feature docs - run from docs/scripts."""
from __future__ import annotations

import re
from pathlib import Path

FEATURES = Path(__file__).resolve().parents[1] / "features"

SPECS: dict[str, dict[str, str]] = {
    "platform/auth-optional-accounts.md": {
        "Problem": "Users need saved history and mail-test sessions without forcing signup for basic lookups ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)).",
        "Scope": "**In scope:** Optional NextAuth (or Clerk) + PostgreSQL users/sessions; link runs to user when logged in.\n\n**Out of scope:** Required login for public tools; social graph.",
        "User flows": "- **Anonymous:** All Phase 1 tools unchanged.\n- **Logged-in (future):** Sign in from header → **T5** dashboard with history.",
        "Architecture": "Next.js auth; Prisma schema `User`, `Session`, `SavedCheck` (high level). BFF attaches optional `user_id` to events.",
        "API": "Auth routes via provider; no change to public tool JSON shape.",
        "UI": "Template **T5**, `/dashboard` - shadcn `Tabs`, `Table` ([PHASE_UI_MAP.md](../../ux/PHASE_UI_MAP.md)).",
        "Limits and abuse": "Session fixation protections; GDPR delete account flow documented in privacy doc.",
    },
    "email/mail-tester-inbound.md": {
        "Problem": "mail-tester.com-style inbound scoring is highest retention potential vs another DNS lookup.",
        "Scope": "**In scope:** Session-bound address `@mail.dnsbunch.com`, inbound SMTP receiver, scoring worker, results UI.\n\n**Out of scope:** Outbound bulk mail; unlimited free abuse.",
        "User flows": "- **Anonymous:** Start session → copy address → send email → poll score on **T4**.\n- **Logged-in (future):** History of tests on **T5**.",
        "Architecture": "Separate Python SMTP ingress + worker; PostgreSQL sessions; Next polls BFF.",
        "API": "Session create, status poll, result fetch - [API.md](../../API.md#planned-internal-tools-and-bff).",
        "UI": "Template **T4**, `/tools/mail-tester` - `Card`, copy `Button`, `Progress`, score `Table`.",
        "Limits and abuse": "RCPT TO session-bound; TTL expiry; rate limit new sessions per IP.",
    },
    "platform/billing-stripe-ready.md": {
        "Problem": "When metrics justify a SKU, billing must not require architecture rewrite.",
        "Scope": "**In scope:** Stripe Checkout + Customer portal wiring in Next; webhook handler; inactive until experiment flag.\n\n**Out of scope:** Launching paid plans day one.",
        "User flows": "- **Anonymous:** N/A.\n- **Logged-in (future):** Upgrade from dashboard billing tab.",
        "Architecture": "Stripe in Next only; webhooks update entitlements table.",
        "API": "Stripe webhooks internal; checkout session create authenticated.",
        "UI": "Template **T5**, `/dashboard/billing` - pricing `Card`, manage subscription link.",
        "Limits and abuse": "Verify webhook signatures; idempotent event handling.",
    },
    "platform/entitlements-quotas.md": {
        "Problem": "Pro experiments need `canRun(user, toolId)` beyond stub.",
        "Scope": "**In scope:** Plan tiers, feature flags per tool, quota counters (daily runs, bulk size).\n\n**Out of scope:** Paywall on basic Phase 1 free lookups.",
        "User flows": "- **Anonymous:** Free tier limits only.\n- **Logged-in (future):** Pro unlocks watches, API, larger bulk.",
        "Architecture": "Next `canRun()` reads DB + Stripe subscription state; BFF enforces before proxy.",
        "API": "403 JSON `{ allowed: false, reason }` from BFF when quota exceeded.",
        "UI": "Upgrade prompts on **T2/T3** via `Alert`; manage on **T5**.",
        "Limits and abuse": "Fail closed for paid features; soft messaging for free tier 429.",
    },
    "monitoring/dns-change-alerts.md": {
        "Problem": "Users want notification when DNS records change after initial check.",
        "Scope": "**In scope:** Watch definition (domain + record types); scheduled poller; email/webhook alert (experiment).\n\n**Out of scope:** Guaranteed SLA monitoring day one.",
        "User flows": "- **Anonymous:** CTA to sign in to create watch.\n- **Logged-in (future):** Create watch on **T5** → alerts on change.",
        "Architecture": "Worker cron + PostgreSQL watches; compare hashes; queue notifications.",
        "API": "CRUD watches authenticated - planned REST under `/api/watches`.",
        "UI": "Template **T5**, `/dashboard/watches` - create form + list `Table`.",
        "Limits and abuse": "Cap watches per plan; poller backoff; no amplification DNS queries.",
    },
    "monitoring/ssl-expiry-alerts.md": {
        "Problem": "Certificate expiry causes outages; proactive alerts add Pro value.",
        "Scope": "**In scope:** Watch host:443 cert expiry; alert thresholds (30/7/1 days).\n\n**Out of scope:** Full cert inventory for all SANs enterprise-wide.",
        "User flows": "- **Logged-in (future):** Add SSL watch from ssl-inspector or dashboard.",
        "Architecture": "Reuse ssl_inspector engine on schedule; store next expiry.",
        "API": "Same watch API as DNS alerts with type `ssl`.",
        "UI": "**T5** watches list; create from **T2** ssl-inspector optional button.",
        "Limits and abuse": "Poll interval minimum 24h free tier.",
    },
    "monitoring/domain-expiry-alerts.md": {
        "Problem": "Domain renewal misses are costly; alert complements domain-expiry tool.",
        "Scope": "**In scope:** WHOIS expiry watch; email alert before expiry.\n\n**Out of scope:** Auto-renew at registrar.",
        "User flows": "- **Logged-in (future):** Watch from domain-expiry tool or dashboard.",
        "Architecture": "Scheduled WHOIS/RDAP; compare expiry date.",
        "API": "Watch API type `domain_expiry`.",
        "UI": "**T5** watches; link from **T2** domain-expiry.",
        "Limits and abuse": "WHOIS rate limits; max watches per user.",
    },
    "monitoring/uptime-checks.md": {
        "Problem": "HTTP uptime monitoring monetizes well but usage is lower - experiment only.",
        "Scope": "**In scope:** HTTP GET watch URL; interval check; down/up alert.\n\n**Out of scope:** Global multi-region SLA v1.",
        "User flows": "- **Logged-in (future):** Add URL watch on dashboard.",
        "Architecture": "Worker HTTP checks; store last status.",
        "API": "Watch API type `uptime`.",
        "UI": "**T5** watches table with last status `Badge`.",
        "Limits and abuse": "Min interval 5m Pro; block internal IPs in URL.",
    },
    "monitoring/email-health-watch.md": {
        "Problem": "Combine SPF/DMARC/DKIM/MX signals over time for a domain.",
        "Scope": "**In scope:** Scheduled re-run email tools; diff summary alert.\n\n**Out of scope:** Inbox placement tests.",
        "User flows": "- **Logged-in (future):** Enable email health watch per domain.",
        "Architecture": "Orchestrate existing tool runners; store snapshots.",
        "API": "Watch API type `email_health`.",
        "UI": "**T5** detail view with trend badges.",
        "Limits and abuse": "Weekly schedule free; daily Pro.",
    },
    "pro-experiments/developer-api-keys.md": {
        "Problem": "Developers request programmatic access after web tool traction.",
        "Scope": "**In scope:** API keys in dashboard; rate limits per key; public REST facade in Next.\n\n**Out of scope:** Unlimited free API.",
        "User flows": "- **Logged-in (future):** Create/revoke keys on **T5** `/dashboard/api-keys`.",
        "Architecture": "Next validates `Authorization: Bearer`; maps to plan quotas.",
        "API": "Document public REST in API.md Phase 3 section.",
        "UI": "**T5** keys table; masked secret shown once on create.",
        "Limits and abuse": "Key rotation; abuse revoke; per-key rate limit.",
    },
    "pro-experiments/export-pdf-json-csv.md": {
        "Problem": "Users want to share or archive results offline.",
        "Scope": "**In scope:** Export buttons on **T1/T2/T3** results - JSON/CSV free; PDF Pro optional.\n\n**Out of scope:** Branded report design (white-label separate).",
        "User flows": "- **Anonymous:** JSON/CSV export where enabled.\n- **Logged-in (future):** PDF export if Pro.",
        "Architecture": "Client-side JSON/CSV generation; server PDF render optional.",
        "API": "None or POST generate PDF authenticated.",
        "UI": "`DropdownMenu` on ResultsPanel - Export.",
        "Limits and abuse": "PDF rate limit; no massive bulk export free.",
    },
    "pro-experiments/shareable-result-links.md": {
        "Problem": "Teams share one-off results without account collab.",
        "Scope": "**In scope:** Signed URL or short id storing result snapshot TTL 7d.\n\n**Out of scope:** Permanent public indexing of all checks.",
        "User flows": "- **Anonymous:** Copy share link after run.\n- **Logged-in (future):** Longer TTL Pro.",
        "Architecture": "PostgreSQL or object store snapshot; Next `/r/{id}` read-only page.",
        "API": "POST create share link; GET public read.",
        "UI": "Share `Button` on **T1/T2** results; public read-only **T2** layout.",
        "Limits and abuse": "TTL; no secrets in snapshot; rate limit link creation.",
    },
    "pro-experiments/white-label-reports.md": {
        "Problem": "Agencies want PDF with their logo for clients.",
        "Scope": "**In scope:** Upload logo + brand color; PDF template for DNS health summary.\n\n**Out of scope:** Full custom domain hosting.",
        "User flows": "- **Logged-in Pro:** Configure brand on **T5** `/dashboard/reports`.",
        "Architecture": "Store brand assets; PDF worker.",
        "API": "Brand settings CRUD authenticated.",
        "UI": "**T5** report settings form; preview `Card`.",
        "Limits and abuse": "Asset size limits; scan uploads.",
    },
}


def patch(content: str, header: str, body: str) -> str:
    pattern = rf"(## {re.escape(header)}\n\n)(.*?)(\n## |\Z)"
    new_content, n = re.subn(pattern, rf"\1{body}\n\3", content, count=1, flags=re.DOTALL)
    if n == 0:
        raise ValueError(header)
    return new_content


def main() -> None:
    for rel, sections in SPECS.items():
        path = FEATURES / rel.replace("/", "\\")
        if not path.exists():
            path = FEATURES / rel
        text = path.read_text(encoding="utf-8")
        for header, body in sections.items():
            text = patch(text, header, body)
        path.write_text(text, encoding="utf-8")
        print("Updated", rel)


if __name__ == "__main__":
    main()
