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

## Project Functionality

### What DNSBunch Does

- Accepts a domain name as input through a modern web interface.
- Performs **in-depth DNS and mail server analysis** using a variety of DNS record queries.
- Analyzes nameserver delegation, record consistency, mail configuration, DNSSEC, zone transfer risks, and more.
- Returns a **detailed, categorized report** for each DNS record type, showing values, issues, and best practice guidance.
- Highlights **warnings and errors** for each aspect of DNS configuration and mail deliverability.
- No login or signup required; no data is stored beyond the current check.

---

## DNS Record Checks: Maximum Detail

Below is a complete list of DNS record types checked, **what information is returned for each**, and **the validations performed**:

### 1. **NS (Nameserver) Records**
- **Information Returned:** All authoritative nameservers for the domain, IPv4/IPv6 addresses, (Optional) geolocation.
- **Checks:** Valid IPs, reachability, duplicates, parent/child delegation, no single point of failure.

### 2. **SOA (Start of Authority) Record**
- **Information Returned:** Primary master nameserver, responsible email, serial, refresh, retry, expire, and minimum TTL values.
- **Checks:** Exists, serial matches across nameservers, recommended values, valid email.

### 3. **A (IPv4 Address) Records**
- **Information Returned:** All IPv4 addresses assigned to the domain (including root and www).
- **Checks:** Records exist, no private/reserved IPs, IPs reachable (optional ping).

### 4. **AAAA (IPv6 Address) Records**
- **Information Returned:** All IPv6 addresses assigned to the domain (including root and www).
- **Checks:** Records exist, no invalid/reserved blocks, IPs reachable (optional ping).

### 5. **MX (Mail Exchange) Records**
- **Information Returned:** List of all MX hosts, priorities, and resolved IPs.
- **Checks:** Records exist, no duplicate/misprioritized entries, valid A/AAAA (no CNAME for MX), reachable targets.

### 6. **SPF (Sender Policy Framework)**
- **Information Returned:** SPF record (TXT type) value.
- **Checks:** Exists, valid syntax, max 10 DNS lookups, no deprecated mechanisms.

### 7. **TXT Records**
- **Information Returned:** All TXT records for the root domain.
- **Checks:** Presence of SPF, DKIM, DMARC, valid syntax.

### 8. **CNAME (Canonical Name) Records**
- **Information Returned:** CNAMEs for key subdomains (e.g., www, mail).
- **Checks:** No CNAME at apex, chain length, target exists and resolves.

### 9. **PTR (Reverse DNS) Records**
- **Information Returned:** PTR records for each mail server IP (MX targets).
- **Checks:** PTR exists, matches hostname, not generic.

### 10. **CAA (Certification Authority Authorization) Records**
- **Information Returned:** List of CAA records.
- **Checks:** Valid syntax, at least one CA allowed or none, no conflicts.

### 11. **DMARC (Domain-based Message Authentication, Reporting & Conformance)**
- **Information Returned:** DMARC TXT record value.
- **Checks:** Record exists, syntax valid, policy set, aligns with SPF/DKIM.

### 12. **DKIM (DomainKeys Identified Mail)**
- **Information Returned:** DKIM selector records (user-provided or common).
- **Checks:** Record exists, valid syntax, key length.

### 13. **Glue Records**
- **Information Returned:** Presence and correctness of glue records for in-zone nameservers.
- **Checks:** Glue present for all in-bailiwick nameservers, consistent.

### 14. **DNSSEC (Domain Name System Security Extensions)**
- **Information Returned:** DS, RRSIG, and other DNSSEC records if present.
- **Checks:** Present, valid, consistent, not expired.

### 15. **Zone Transfer (AXFR)**
- **Information Returned:** AXFR status (open/closed).
- **Checks:** AXFR not allowed to unauthorized hosts.

### 16. **Wildcard Records**
- **Information Returned:** Detection of wildcard DNS entries.
- **Checks:** Report if wildcards exist; warn if inappropriate.

---

## Tech Stack and Plugin/Library Choices

### Backend (`/backend`)
- **Language:** Python 3.9+
- **Framework:** Flask (recommended for simplicity)
- **Key Libraries:**
  - [`dnspython`](https://www.dnspython.org/) — DNS queries (A, AAAA, MX, NS, etc.)
  - [`Flask`](https://flask.palletsprojects.com/) — REST API
  - [`Flask-Cors`](https://flask-cors.readthedocs.io/) — CORS for API
  - [`gunicorn`](https://gunicorn.org/) — Production server
  - [`validators`](https://pypi.org/project/validators/) — Domain validation
  - [`python-dotenv`](https://pypi.org/project/python-dotenv/) — Environment config
  - [`pytest`](https://docs.pytest.org/) — Testing

**Optional:**  
- [`asyncio`](https://docs.python.org/3/library/asyncio.html) — For concurrent lookups (Flask supports async in recent versions)
- [`loguru`](https://github.com/Delgan/loguru) — Logging

---

### Frontend (`/frontend`)
- **Framework:** React.js
- **UI Library:** [Material UI (MUI)](https://mui.com/) — Modern, accessible, and popular React component library (recommended and used by many top projects)
- **Key Libraries:**
  - [`Axios`](https://axios-http.com/) — HTTP requests
  - [`react-hook-form`](https://react-hook-form.com/) — Form management and validation
  - [`yup`](https://github.com/jquense/yup) — Input/schema validation
  - [`react-query`](https://tanstack.com/query/latest) — API data management and caching
  - [`react-toastify`](https://fkhadra.github.io/react-toastify/) — User notifications
  - [`vite`](https://vitejs.dev/) — Fast React build tool (recommended for new projects)
  - [`eslint`](https://eslint.org/) & [`prettier`](https://prettier.io/) — Linting/formatting
  - [`Jest`](https://jestjs.io/) & [`React Testing Library`](https://testing-library.com/docs/react-testing-library/intro/) — Testing

---

## Monorepo Structure

This repository contains both frontend and backend code for DNSBunch:

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

## Deployment Instructions

### Backend (Render.com)
1. Push backend code to GitHub.
2. Create a new Web Service on Render, connect your repo.
3. Build command: `pip install -r requirements.txt`
4. Start command: `gunicorn app:app`
5. Deploy and get your backend URL (e.g. `https://dnsbunch.onrender.com`).

### Frontend (Vercel/Netlify)
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