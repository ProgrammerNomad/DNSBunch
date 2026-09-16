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

## Production deploy checklist

1. **Database:** On the VPS (or managed Postgres), run `npx prisma migrate deploy` from `frontend/` with production `DATABASE_URL`.
2. **Netlify env:** `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL` (production site URL), OAuth + `EMAIL_*` (Zepto), `MAIL_TESTER_DOMAIN=mail.dnsbunch.com`, `MAIL_TESTER_WEBHOOK_SECRET`, `MAIL_TESTER_DEV_INGEST=false`, `INTERNAL_API_SECRET`, `BACKEND_URL` (Python API).
3. **Python API:** Deploy backend; ensure SpamAssassin optional; same `INTERNAL_API_SECRET` as frontend.
4. **Cloudflare Worker:** Deploy [`workers/mail-test-inbound/`](../../workers/mail-test-inbound/); set secrets `INBOUND_URL` (Netlify `/api/mail-test/inbound`), `MAIL_TESTER_WEBHOOK_SECRET`, `MAIL_TESTER_DOMAIN`.
5. **DNS:** MX on **`mail.dnsbunch.com` only**; apex MX unchanged (Google Workspace).
6. **Smoke test:** Start mail test while logged in → send or webhook test message → session reaches `scored` → report DNS section shows SPF/DMARC/DKIM panels (not raw JSON) → dashboard Mail tests lists session; run DMARC checker logged in → Saved checks row appears.
