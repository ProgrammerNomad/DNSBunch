# DNSBunch

DNSBunch is a comprehensive, open-source web application for DNS and mail server diagnostics. It empowers anyone to enter a domain name and receive a highly detailed analysis of its DNS configuration, mail server setup, and potential issues affecting domain health, email deliverability, or website accessibility.

---

## Repository Information

- **GitHub Repository:** [ProgrammerNomad/DNSBunch](https://github.com/ProgrammerNomad/DNSBunch)
- **Primary Developer:** Nomad Programmer ([ProgrammerNomad](https://github.com/ProgrammerNomad))
- **Status:** Active solo development
- **Last Updated:** 2025-08-06

---

## What is DNSBunch?

DNSBunch is your all-in-one DNS and mail diagnostics platform. It performs deep DNS record lookups, evaluates records for standards and best practices, and returns a categorized report. This helps you catch misconfigurations before they cause downtime or email issues.

---

## DNS Record Checks: Maximum Detail

Below is a complete list of DNS record types checked, **what information is returned for each**, and **the validations performed**:

### 1. **NS (Nameserver) Records**
- **Returned Information:**
  - All authoritative nameservers for the domain.
  - IPv4 and IPv6 addresses for each nameserver.
  - (Optional) Geolocation of each nameserver.
- **Validations:**
  - All NS records resolve to valid IPs.
  - All nameservers are reachable and respond to DNS queries.
  - No duplicate or missing NS entries.
  - Delegation is consistent between parent and child zones.
  - No single point of failure.

---

### 2. **SOA (Start of Authority) Record**
- **Returned Information:**
  - Primary master nameserver.
  - Responsible person/email.
  - Serial number.
  - Refresh, retry, expire, and minimum TTL values.
- **Validations:**
  - SOA record exists and is correct.
  - Serial numbers match across all nameservers.
  - SOA timings are within recommended ranges.
  - Responsible email is valid.

---

### 3. **A (IPv4 Address) Records**
- **Returned Information:**
  - All IPv4 addresses for the domain and key subdomains (e.g., root, www).
- **Validations:**
  - A records are present for domain and www.
  - No private or reserved IPs.
  - IPs are reachable (optional ping check).

---

### 4. **AAAA (IPv6 Address) Records**
- **Returned Information:**
  - All IPv6 addresses for the domain and key subdomains.
- **Validations:**
  - AAAA records exist where expected.
  - No invalid or reserved IPv6 blocks.
  - IPs are reachable (optional).

---

### 5. **MX (Mail Exchange) Records**
- **Returned Information:**
  - List of all MX hosts, their priorities, and resolved IPs.
- **Validations:**
  - MX records are present if email is enabled.
  - No duplicate or mis-prioritized records.
  - Each MX host resolves to valid A/AAAA (never CNAME).
  - MX targets are reachable (optional SMTP check).

---

### 6. **SPF (Sender Policy Framework)**
- **Returned Information:**
  - SPF record value (via TXT type).
- **Validations:**
  - SPF record exists.
  - Syntax is valid.
  - No more than 10 DNS lookups.
  - No deprecated mechanisms.

---

### 7. **TXT Records**
- **Returned Information:**
  - All TXT records for the domain.
- **Validations:**
  - Presence of SPF, DKIM, DMARC (where appropriate).
  - TXT syntax is valid.

---

### 8. **CNAME (Canonical Name) Records**
- **Returned Information:**
  - CNAMEs for www, mail, and other key subdomains.
- **Validations:**
  - No CNAME at zone apex.
  - CNAME chains are not too long and targets resolve.

---

### 9. **PTR (Reverse DNS) Records**
- **Returned Information:**
  - PTR records for each mail server IP (each MX target).
- **Validations:**
  - PTR exists for every mail server IP.
  - PTR matches sending hostname.
  - No generic PTR/reverse DNS mismatches.

---

### 10. **CAA (Certification Authority Authorization) Records**
- **Returned Information:**
  - All CAA records for the domain.
- **Validations:**
  - Syntax is valid.
  - At least one CA authorized or explicitly none.
  - No conflicting entries.

---

### 11. **DMARC (Domain-based Message Authentication, Reporting & Conformance)**
- **Returned Information:**
  - DMARC TXT record value.
- **Validations:**
  - DMARC record exists.
  - Syntax is valid; policy set to none/quarantine/reject.
  - Alignment with SPF/DKIM.

---

### 12. **DKIM (DomainKeys Identified Mail)**
- **Returned Information:**
  - DKIM selector records (user can provide or common ones are attempted).
- **Validations:**
  - DKIM record exists for given selector.
  - Syntax and key length are valid.

---

### 13. **Glue Records**
- **Returned Information:**
  - Presence and correctness of glue records for in-zone nameservers.
- **Validations:**
  - Glue records are present for all in-bailiwick nameservers.
  - Consistency between parent and child zones.

---

### 14. **DNSSEC (Domain Name System Security Extensions)**
- **Returned Information:**
  - DS, RRSIG, and other DNSSEC records if present.
- **Validations:**
  - DNSSEC is present and valid.
  - Consistency between DS and DNSKEY.
  - No expired signatures.

---

### 15. **Zone Transfer (AXFR)**
- **Returned Information:**
  - AXFR status (open/closed).
- **Validations:**
  - Zone transfers (AXFR) are not allowed to unauthorized hosts.

---

### 16. **Wildcard Records**
- **Returned Information:**
  - Detection of wildcard DNS entries.
- **Validations:**
  - Report if wildcards exist; warn if inappropriate.

---

## Sample API Output

```json
{
  "domain": "example.com",
  "checks": {
    "ns": {
      "status": "pass",
      "records": [
        {"host": "ns1.example.com", "ip": "192.0.2.1"},
        {"host": "ns2.example.com", "ip": "198.51.100.1"}
      ],
      "issues": []
    },
    "soa": {
      "status": "warning",
      "record": {
        "mname": "ns1.example.com",
        "rname": "hostmaster.example.com",
        "serial": 2025080601,
        "refresh": 86400,
        "retry": 7200,
        "expire": 3600000,
        "minimum": 172800
      },
      "issues": ["SOA serial mismatch between nameservers"]
    }
    // ... Other records
  }
}
```

---

## How to Use

1. **Enter a domain name** in the search field.
2. **Submit** to begin diagnostics.
3. **Read the detailed report** organized by record type.
4. **Follow recommendations** to fix any warnings or errors.

---

## Monorepo Structure

This repository contains both frontend and backend code for DNSBunch.  
Recommended structure:

```
DNSBunch/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── ... (other backend files)
├── frontend/
│   ├── package.json
│   ├── src/
│   └── ... (other frontend files)
├── README.md
├── COPILOT_INSTRUCTIONS.md
└── .gitignore
```

---

## Tech Stack

- **Backend:** Python 3.9+ (Flask or FastAPI), dnspython, asyncio
- **Frontend:** React, Vue, or HTML/Bootstrap
- **Deployment:** [Render.com](https://render.com/) for backend, [Vercel](https://vercel.com/) or [Netlify](https://netlify.com/) for frontend

---

## Deployment Instructions

### Deploy Backend (Render.com)
1. Push backend code to GitHub.
2. Create a new Web Service on Render, connect your repo.
3. Build command: `pip install -r requirements.txt`
4. Start command: `gunicorn app:app`
5. Deploy and get your backend URL (e.g. `https://dnsbunch.onrender.com`).

### Deploy Frontend (Vercel/Netlify)
1. Push frontend code to GitHub.
2. Import your repo to Vercel or Netlify and deploy.
3. Set backend API URL in frontend config (`.env` or similar).

---

## Security & Best Practices

- Rigorous domain input validation.
- No shell execution or untrusted code on server.
- Rate limiting to prevent abuse.
- Only public DNS data is fetched; no user data stored.

---

## Contribution

Contributions are welcome! Please open issues or submit pull requests with improvements, bug fixes, or features.

**Developer:**  
- Nomad Programmer (GitHub: [ProgrammerNomad](https://github.com/ProgrammerNomad))

See `COPILOT_INSTRUCTIONS.md` for technical guidelines.

---

## License

MIT License.

---

## Disclaimer

DNSBunch is for informational purposes only. Always verify important results with authoritative sources.