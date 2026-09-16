# DNSBunch API Documentation

Complete API reference for DNSBunch backend services.

**Documentation index:** [README.md](README.md) · **As-built single-domain feature:** [features/shipped/dns-health-single.md](features/shipped/dns-health-single.md)

**Architecture (boundaries, security behavior classes, CURRENT vs PLANNED):** [ARCHITECTURE.md](ARCHITECTURE.md) - normative for layers and invariants; this file is canonical for **HTTP endpoints and payloads**.

---

## Next.js BFF (browser-facing)

The production site does **not** call Flask directly from the browser for DNS health. The frontend posts to:

| Method | Path | Proxies to |
|--------|------|------------|
| POST | `/api/dns/check` | `{BACKEND_URL}/api/check` (after CSRF fetch) |

Implementation: [frontend/src/app/api/dns/check/route.ts](../frontend/src/app/api/dns/check/route.ts). Env: `BACKEND_URL` in [frontend/.env.example](../frontend/.env.example).

---

## Base URL

- **Development**: `http://localhost:5000`
- **Production**: `https://api.dnsbunch.com` (or your backend URL)

---

## Authentication

DNSBunch uses CSRF token-based authentication for all POST requests.

### Get CSRF Token

**Endpoint:** `GET /api/csrf-token`

**Response:**
```json
{
  "csrf_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Usage:**
Include the token in all POST requests via the `X-CSRF-Token` header.

---

## Endpoints

### 1. Health Check

**Endpoint:** `GET /`

**Description:** Check if the API server is running.

**Response:**
```json
{
  "status": "ok",
  "message": "DNSBunch API is running",
  "timestamp": "2026-01-02T12:00:00.000000"
}
```

**Status Codes:**
- `200 OK` - Server is healthy

---

### 2. DNS Analysis

**Endpoint:** `POST /api/check`

**Description:** Perform comprehensive DNS analysis on a domain.

**Headers:**
```
Content-Type: application/json
X-CSRF-Token: <your-csrf-token>
```

**Request Body:**
```json
{
  "domain": "example.com",
  "checks": ["ns", "soa", "mx", "www"]  // Optional: specific checks
}
```

**Parameters:**
- `domain` (required, string): Domain name to analyze
- `checks` (optional, array): Specific check types to run. If omitted, all checks are performed.

**Available Check Types** (top-level keys in `checks`; omit `checks` to run all):

- `domain_status` - Domain health / resolution status
- `ns` - Nameserver checks (includes parent delegation, comparison, glue, etc.)
- `soa` - SOA checks
- `a`, `aaaa` - Address records
- `mx` - Mail exchange checks
- `spf`, `txt`, `cname`, `ptr`, `caa`, `dmarc`, `dkim`
- `glue`, `dnssec`, `axfr`, `wildcard`
- `www` - WWW subdomain checks

Source of truth: `all_check_types` in [backend/dns_checker.py](../backend/dns_checker.py). Parent delegation is **not** a separate top-level key; it is part of `ns`.

**Response:**
```json
{
  "domain": "example.com",
  "timestamp": "2026-01-02T12:00:00.000000",
  "status": "completed",
  "checks": {
    "ns": {
      "status": "pass",
      "checks": [...]
    },
    "soa": {
      "status": "warning",
      "checks": [...]
    },
    "mx": {
      "status": "pass",
      "checks": [...]
    },
    "www": {
      "status": "pass",
      "checks": [...]
    }
  },
  "summary": {
    "total": 35,
    "passed": 30,
    "warnings": 4,
    "errors": 1,
    "info": 0
  }
}
```

**Check Object Structure:**
```json
{
  "type": "mx_records",
  "status": "pass",  // pass, warning, error, info
  "message": "Your MX records...",
  "details": "..."  // Can be string, array, or object
}
```

**Status Codes:**
- `200 OK` - Analysis completed successfully
- `400 Bad Request` - Invalid domain or request format
- `403 Forbidden` - Invalid or missing CSRF token
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error during analysis

---

## Sample Complete Response

```json
{
  "domain": "example.com",
  "timestamp": "2026-01-02T12:00:00.000000",
  "status": "completed",
  "checks": {
    "ns": {
      "status": "pass",
      "checks": [
        {
          "type": "parent_delegation",
          "status": "pass",
          "message": "Parent delegation found",
          "details": ["ns1.example.com", "ns2.example.com"]
        },
        {
          "type": "domain_nameservers",
          "status": "pass",
          "message": "Domain nameservers found",
          "details": ["ns1.example.com", "ns2.example.com"]
        },
        {
          "type": "comparison",
          "status": "pass",
          "message": "Parent and domain nameservers match",
          "details": ""
        }
      ]
    },
    "soa": {
      "status": "warning",
      "checks": [
        {
          "type": "soa_record",
          "status": "info",
          "message": "SOA record found",
          "details": "ns1.example.com hostmaster.example.com 2025080601 86400 7200 3600000 172800"
        },
        {
          "type": "soa_serial",
          "status": "warning",
          "message": "SOA serial mismatch detected",
          "details": "ns1: 2025080601, ns2: 2025080602"
        }
      ]
    },
    "mx": {
      "status": "pass",
      "checks": [
        {
          "type": "mx_records",
          "status": "info",
          "message": "Your MX records that were reported by your nameservers are:",
          "details": [
            "10 mx1.example.com 192.0.2.1 (no glue)",
            "20 mx2.example.com 192.0.2.2 (no glue)"
          ]
        },
        {
          "type": "mx_name_validity",
          "status": "pass",
          "message": "All MX records resolve to IP addresses",
          "details": ""
        }
      ]
    },
    "www": {
      "status": "pass",
      "checks": [
        {
          "type": "www_a_record",
          "status": "info",
          "message": "Your www.example.com A record is:<br>www.example.com -> example.com -> [ 192.0.2.1 ]<br><br> [Looks like you have CNAME's]",
          "details": {
            "cname_chain": [
              {"from": "www.example.com", "to": "example.com"}
            ],
            "final_ips": ["192.0.2.1"]
          }
        },
        {
          "type": "www_ip_public",
          "status": "pass",
          "message": "OK. All of your WWW IPs appear to be public IPs.",
          "details": {
            "public_ips": ["192.0.2.1"],
            "private_ips": []
          }
        },
        {
          "type": "www_cname",
          "status": "pass",
          "message": "OK. You do have a CNAME record for www.example.com",
          "details": {
            "has_cname": true,
            "cname_resolves": true
          }
        }
      ]
    }
  },
  "summary": {
    "total": 12,
    "passed": 10,
    "warnings": 1,
    "errors": 0,
    "info": 1
  }
}
```

---

## Rate Limiting

- **Limit**: 50 requests per 300 seconds (5 minutes) per IP address (`RATE_LIMIT_REQUESTS`, `RATE_LIMIT_WINDOW`)
- **Headers** (set by [backend/app.py](../backend/app.py) when the rate limiter runs): `X-RateLimit-Remaining`, `X-RateLimit-Reset` - there is **no** `X-RateLimit-Limit` header in the current implementation.

**Rate Limit Exceeded Response:**
```json
{
  "error": "Rate limit exceeded: 50 requests per 300 seconds.",
  "retry_after": 60,
  "code": "RATE_LIMITED"
}
```

`retry_after` reflects `BLOCK_DURATION` (default **60** seconds) when the IP is temporarily blocked.

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid domain format",
  "message": "Please provide a valid domain name"
}
```

### 403 Forbidden
```json
{
  "error": "CSRF token validation failed",
  "message": "Invalid or missing CSRF token"
}
```

### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later.",
  "retry_after": 300
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An error occurred during DNS analysis"
}
```

---

## Security

See also [ARCHITECTURE.md §6](ARCHITECTURE.md#6-current-security-model-current) for full security model (CURRENT vs PLANNED).

### CSRF Protection
- All POST requests to `/api/check` require a valid CSRF token
- Tokens are bound to IP address and User-Agent (hashed)
- Tokens expire after **1 hour** (`CSRF_TOKEN_EXPIRES`, default 3600 seconds)
- Include token in `X-CSRF-Token` header

### Input Validation
- Domain names validated in [backend/app.py](../backend/app.py) (`is_valid_domain`)
- Suspicious patterns blocked (e.g. `localhost`, `127.0.0.1`, `test.test`, `example.example`)
- Maximum domain length: **253** characters

### Rate Limiting
- **50** requests per **300** seconds (5 minutes) per IP (`RATE_LIMIT_REQUESTS`, `RATE_LIMIT_WINDOW`)
- When exceeded: HTTP **429** and IP blocked for **`BLOCK_DURATION`** (default **60 seconds**, not 1 hour)
- Response may include `retry_after` (seconds)
- Headers: `X-RateLimit-Remaining`, `X-RateLimit-Reset` when applicable

---

## Client Libraries

### JavaScript/TypeScript Example

```typescript
import axios from 'axios';

const API_URL = 'http://localhost:5000';

// Get CSRF token
const getCSRFToken = async () => {
  const response = await axios.get(`${API_URL}/api/csrf-token`);
  return response.data.csrf_token;
};

// Perform DNS check
const checkDomain = async (domain: string) => {
  const csrfToken = await getCSRFToken();
  
  const response = await axios.post(
    `${API_URL}/api/check`,
    { domain },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      }
    }
  );
  
  return response.data;
};

// Usage
checkDomain('example.com')
  .then(result => console.log(result))
  .catch(error => console.error(error));
```

### Python Example

```python
import requests

API_URL = 'http://localhost:5000'

# Get CSRF token
def get_csrf_token():
    response = requests.get(f'{API_URL}/api/csrf-token')
    return response.json()['csrf_token']

# Perform DNS check
def check_domain(domain):
    csrf_token = get_csrf_token()
    
    headers = {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrf_token
    }
    
    response = requests.post(
        f'{API_URL}/api/check',
        json={'domain': domain},
        headers=headers
    )
    
    return response.json()

# Usage
result = check_domain('example.com')
print(result)
```

---

## Environment Variables

### Backend Configuration

```bash
FLASK_ENV=development
FLASK_DEBUG=True
CORS_ORIGINS=http://localhost:3000,https://www.dnsbunch.com
CSRF_SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here
RATE_LIMIT_REQUESTS=50
RATE_LIMIT_WINDOW=300
```

---

## Internal tools and BFF

**Status: SHIPPED (Phase 0)** - generic BFF + HMAC internal proxy. Specs: [generic-tool-bff.md](features/platform/generic-tool-bff.md), [internal-jwt-proxy.md](features/platform/internal-jwt-proxy.md), [TOOL_PLUGIN_CONTRACT.md](TOOL_PLUGIN_CONTRACT.md).

### Internal auth (Next → Python)

HMAC-SHA256 over `timestamp + "." + raw_request_body` (UTF-8 timestamp string, body as received).

| Header | Value |
|--------|--------|
| `X-Internal-Timestamp` | Unix seconds |
| `X-Internal-Signature` | Hex HMAC-SHA256 using `INTERNAL_API_SECRET` |
| `X-Request-Id` | Optional UUID for log correlation (BFF sets if missing) |

Reject if skew > 60s or signature mismatch. Set the same `INTERNAL_API_SECRET` in backend and Next (see `.env.example` files).

**Local dev - single DNS health via BFF:**

```bash
curl -s -X POST http://localhost:3000/api/tools/dns_health \
  -H "Content-Type: application/json" \
  -d '{"domain":"example.com","checks":["ns"]}'
```

**Local dev - bulk DNS health (Bulk 1, sync):**

```bash
curl -s -X POST http://localhost:3000/api/tools/dns_health \
  -H "Content-Type: application/json" \
  -d '{"surface":"bulk","domains":["example.com","example.org"]}'
```

Response: `{ "surface": "bulk", "rows": [...], "meta": { "requested", "completed", "failed" } }`. Max domains: `BULK_MAX_DOMAINS` (default 50).

**T3 CSV (Bulk 2–3):** Import/export of domain lists and rollup results is **client-side** on [`/tools/bulk-dns-health`](../frontend/src/app/tools/bulk-dns-health/page.tsx) - no separate CSV API. Row **View full** opens T1 home with `?domain=` (same single-domain engine).

**Local dev - DMARC checker (T2):**

```bash
curl -s -X POST http://localhost:3000/api/tools/dmarc_checker \
  -H "Content-Type: application/json" \
  -d '{"domain":"example.com"}'
```

Response: `{ "domain", "status", "record", "parsed", "issues", "tags" }`.

**Local dev - SPF checker (T2):**

```bash
curl -s -X POST http://localhost:3000/api/tools/spf_checker \
  -H "Content-Type: application/json" \
  -d '{"domain":"example.com"}'
```

Response: `{ "domain", "status", "record", "issues", "dns_lookups", "dns_lookup_limit", "mechanisms" }`.

**Local dev - DKIM checker (T2):**

```bash
curl -s -X POST http://localhost:3000/api/tools/dkim_checker \
  -H "Content-Type: application/json" \
  -d '{"domain":"example.com","selector":"google"}'
```

Response: `{ "domain", "selector", "host", "status", "record", "parsed", "issues", "tags" }`.

**Local dev - MX lookup (T2):**

```bash
curl -s -X POST http://localhost:3000/api/tools/mx_lookup \
  -H "Content-Type: application/json" \
  -d '{"domain":"example.com"}'
```

Response: `{ "domain", "status", "count", "rows", "issues" }`.

**Local dev - SMTP test (T2):**

```bash
curl -s -X POST http://localhost:3000/api/tools/smtp_test \
  -H "Content-Type: application/json" \
  -d '{"domain":"example.com","port":25}'
```

Or explicit host: `{"host":"aspmx.l.google.com","port":25}` (domain **or** host, not both).

Response: `{ "domain", "host", "port", "status", "banner", "ehlo_response", "issues", "error" }`.

**Local dev - DNSBL lookup (T2):**

```bash
curl -s -X POST http://localhost:3000/api/tools/dnsbl_lookup \
  -H "Content-Type: application/json" \
  -d '{"ip":"8.8.8.8"}'
```

Or domain (public A records): `{"domain":"example.com"}`. Domain **or** IP, not both.

Response: `{ "input", "ips_checked", "status", "rows", "issues" }`.

**Local dev - HTTP headers (T2):**

```bash
curl -s -X POST http://localhost:3000/api/tools/http_headers \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

Response: `{ "input_url", "final_url", "status_code", "status", "headers", "security_headers", "issues", "error" }`.

Private targets (e.g. `http://127.0.0.1`) are rejected at the BFF with **400**.

**Local dev - Redirect chain (T2):**

```bash
curl -s -X POST http://localhost:3000/api/tools/redirect_chain \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

Response: `{ "input_url", "final_url", "final_status_code", "status", "hops", "loop_detected", "issues", "error" }`.

**Local dev - HTTP status (T2):**

```bash
curl -s -X POST http://localhost:3000/api/tools/http_status \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

Response: `{ "input_url", "final_url", "status_code", "latency_ms", "status", "issues", "error" }`.

**Local dev - SSL inspector (T2):**

```bash
curl -s -X POST http://localhost:3000/api/tools/ssl_inspector \
  -H "Content-Type: application/json" \
  -d '{"host":"example.com"}'
```

Response: `{ "host", "status", "tls_version", "subject_cn", "issuer", "sans", "not_before", "not_after", "days_until_expiry", "hostname_match", "issues", "error" }`.

**Local dev - WHOIS lookup (T2):**

```bash
curl -s -X POST http://localhost:3000/api/tools/whois_lookup \
  -H "Content-Type: application/json" \
  -d '{"domain":"example.com"}'
```

**Local dev - Domain expiry (T2):**

```bash
curl -s -X POST http://localhost:3000/api/tools/domain_expiry \
  -H "Content-Type: application/json" \
  -d '{"domain":"example.com"}'
```

**Local dev - DNS propagation (T2):**

```bash
curl -s -X POST http://localhost:3000/api/tools/dns_propagation \
  -H "Content-Type: application/json" \
  -d '{"name":"example.com","type":"A"}'
```

Legacy **`POST /api/dns/check`** (CSRF → `/api/check`) remains unchanged for the home UI until T1 migration.

### Auth (Phase 2 - passwordless)

| Method | Path | Purpose |
|--------|------|---------|
| GET, POST | `/api/auth/*` | Auth.js v5 session, OAuth, magic-link verify |
| GET | `/sign-in` | Social + email magic link UI (no passwords) |
| GET | `/sign-in/verify` | “Check your email” after magic-link request |
| GET | `/dashboard` | Authenticated T5 dashboard (redirects to `/sign-in` if no session) |

Env: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `AUTH_GOOGLE_*`, optional `AUTH_GITHUB_*`, `EMAIL_FROM` + `EMAIL_SERVER` - see [frontend/.env.example](../frontend/.env.example).

**Tool BFF:** `POST /api/tools/[toolId]` accepts anonymous requests unchanged; when a session cookie is present, analytics may include a hashed user id. Entitlement denials (403) are reserved for Phase 3.

### Mail tester (Step 7 - not `/api/tools/mail_tester`)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/mail-test/sessions` | Create session; returns `{ sessionId, address, expiresAt, status, devIngestEnabled }` |
| GET | `/api/mail-test/sessions/[id]` | Poll status and scored `result` |
| POST | `/api/mail-test/sessions/[id]/ingest` | **Dev only** (`MAIL_TESTER_DEV_INGEST=true`); multipart field `file` (.eml) |
| POST | `/api/mail-test/inbound` | Cloudflare Worker / provider webhook → **202 Accepted** (async score). Body: `{ token, to, from, raw (base64), received_at, message_size }`. Header `X-Mail-Test-Secret` or `Authorization: Bearer` |

Session statuses: `pending` | `received` | `scoring` | `scored` | `expired` | `failed`.

**Internal (Next → Python):**

| Method | Path | Body |
|--------|------|------|
| POST | `/internal/v1/mail-test/score` | `{ "raw": "<base64 RFC822>" }` |

Env: `MAIL_TESTER_*` in [frontend/.env.example](../frontend/.env.example).

### Browser → Next BFF

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/tools/[toolId]` | Generic tool run; validates input, `canRun()`, analytics, proxies to Python |

**Example body (conceptual):**

```json
{ "domain": "example.com" }
```

**Tool id** uses snake_case from [TOOL_CATALOG.md](roadmap/TOOL_CATALOG.md) (e.g. `dmarc_checker`, `dns_health`).

**DNS health surfaces:** same `tool_id` `dns_health`; bulk requests include `surface: "bulk"` and domain list per [bulk-checker.md](features/dns-health/bulk-checker.md).

**Errors:**

| Code | Meaning |
|------|---------|
| 400 | Validation failed |
| 403 | Entitlement / quota denied (Phase 3) |
| 404 | Unknown `toolId` |
| 429 | Rate limit |
| 502 | Upstream Python error |

Legacy **`POST /api/dns/check`** remains until T1 migrates to generic BFF.

### Next → Python (internal only)

| Method | Path | Auth |
|--------|------|------|
| POST | `/internal/v1/tools/{tool_id}` | HMAC/JWT `INTERNAL_API_SECRET` |

Browsers must not call this URL ([INV-3](ARCHITECTURE.md)).

### Async jobs (Phase 4)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/tools/dns_health` | Async bulk → `{ "job_id" }` |
| GET | `/api/jobs/{job_id}` | Poll status / download URL |

See [scale-async-jobs.md](features/platform/scale-async-jobs.md).

---

## Support

- **Issues**: [GitHub Issues](https://github.com/ProgrammerNomad/DNSBunch/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ProgrammerNomad/DNSBunch/discussions)
- **Email**: Contact maintainer for security concerns

---

*Last verified against repo: 2026-09-15* (see [ARCHITECTURE.md](ARCHITECTURE.md) for security behavior classes; this file is canonical for HTTP endpoints and payloads per ADR-003.)
