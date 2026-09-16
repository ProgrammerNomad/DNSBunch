# Feature: Mail Tester (Inbound)



## Metadata



| Field | Value |

|-------|--------|

| **status** | partial |

| **priority** | P1 |

| **phase** | 2 |

| **access** | both |

| **tool_id** | `mail_tester` |

| **last_reviewed** | 2026-09-16 |



## Summary



Mail-Tester-style **inbound deliverability test**: dynamic `{token}@mail.dnsbunch.com`, async scoring, v2 **report JSON** UI. **No VPS SMTP.** Production inbound via **Cloudflare Email Routing** (subdomain only) + thin Email Worker → `POST /api/mail-test/inbound`.



## Problem



mail-tester.com-style inbound scoring is highest retention potential vs another DNS lookup.



## Scope



**Shipped (v2):** Session statuses `pending` → `received` → `scoring` → `scored`; async ingest; v2 report (message auth vs DNS config, Received chain, DNSBL via tool runner, optional SpamAssassin); shareable `/tools/mail-tester/[sessionId]`; dashboard mail tab; Cloudflare Worker artifact + [ops runbook](../../ops/cloudflare-mail-tester-inbound.md).



**Out of scope:** Inbox placement guarantees; self-hosted port 25 on VPS; duplicate DNS logic outside tool runners (see INV-6).



## User flows



- Start session → copy address → send mail (or dev `.eml`) → poll until **deliverability test score** (not “will reach inbox”).

- Logged-in: recent sessions on dashboard **Mail tests** tab.



## Architecture



- DNS: apex `dnsbunch.com` → Google Workspace; **`mail.dnsbunch.com` only** → Cloudflare catch-all → Worker.

- BFF: [`/api/mail-test/*`](../../../frontend/src/app/api/mail-test/); inbound returns **202** when accepted.

- Python: [`mail_tester/`](../../../backend/mail_tester/) composer + [`dns_configuration.py`](../../../backend/mail_tester/dns_configuration.py) calling tool runners only.



## Data model



`MailTestSession`: token, statuses including `received`, optional `rawMessageBase64` (cleared after score), `resultJson` v2 report.



## API



[API.md](../../API.md) - inbound JSON includes `token`, `to`, `from`, `raw` (base64), `received_at`, `message_size`.



## UI



T4 `/tools/mail-tester`, session URL `/tools/mail-tester/[sessionId]`. UI renders report JSON only (no parallel tool API calls on results page).



## Limits and abuse



Session TTL; IP rate limit on create; webhook secret; max message 2.5 MB.



## Implementation checklist



- [x] v2 report model + async pipeline

- [x] Cloudflare Worker + ops doc

- [x] Dashboard mail history (basic)

- [ ] Operator enables Cloudflare MX on `mail.dnsbunch.com` in production



## Acceptance criteria



- [x] Dev ingest → full v2 report

- [x] Inbound contract + 202 async

- [x] INV-6: DNS via tool runners only



## References



- [mail-tester.com](http://www.mail-tester.com)

- [ARCHITECTURE.md §19](../../ARCHITECTURE.md)


