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

## Support

- **Issues**: [GitHub Issues](https://github.com/ProgrammerNomad/DNSBunch/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ProgrammerNomad/DNSBunch/discussions)
- **Email**: Contact maintainer for security concerns

---

*Last verified against repo: 2026-09-15* (see [ARCHITECTURE.md](ARCHITECTURE.md) for security behavior classes; this file is canonical for HTTP endpoints and payloads per ADR-003.)
