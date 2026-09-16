# Cloudflare inbound mail tester (`mail.dnsbunch.com`)

## DNS split

| Host | MX | Purpose |
|------|-----|---------|
| `dnsbunch.com` | Google Workspace | Normal company mail - **do not** enable Cloudflare Email Routing on apex |
| `mail.dnsbunch.com` | Cloudflare Email Routing | Inbound deliverability tests only |

## Setup

1. In Cloudflare DNS, add subdomain `mail` if needed.
2. Enable **Email Routing** for `mail.dnsbunch.com` only.
3. Add MX records Cloudflare provides for that subdomain.
4. Configure **catch-all** `*@mail.dnsbunch.com` → **Email Worker** ([`workers/mail-test-inbound/`](../../workers/mail-test-inbound/)).
5. Worker secrets: `INBOUND_URL`, `MAIL_TESTER_WEBHOOK_SECRET`, `MAIL_TESTER_DOMAIN=mail.dnsbunch.com`.
6. Netlify/production env: `MAIL_TESTER_DOMAIN`, `MAIL_TESTER_WEBHOOK_SECRET`, `MAIL_TESTER_DEV_INGEST=false`.

## Flow

Dynamic address `{24-hex}@mail.dnsbunch.com` - **no per-test routing rules**. Token maps to `MailTestSession` in Postgres.

Worker POSTs JSON to `POST /api/mail-test/inbound` (202 Accepted); scoring runs asynchronously on Next.js + Python.
