# DNSBunch 🚀

DNSBunch is a modern, comprehensive, open-source web application for DNS and mail server diagnostics. It empowers anyone to enter a domain name and receive a highly detailed, user-friendly analysis of their DNS configuration, mail server setup, and potential issues affecting domain health, email deliverability, or website accessibility.

Built with modern web technologies including React, Material-UI, and Python Flask, DNSBunch provides an intuitive interface that explains complex DNS concepts in plain language, making it accessible to both technical and non-technical users.

---

## Repository Information

- **GitHub Repository:** [ProgrammerNomad/DNSBunch](https://github.com/ProgrammerNomad/DNSBunch)
- **Primary Developer:** Nomad Programmer ([ProgrammerNomad](https://github.com/ProgrammerNomad))
- **Status:** Active development with modern UI enhancements
- **Last Updated:** 2025-08-07
- **Frontend:** React 18 with Material-UI v5 and modern components
- **Backend:** Python Flask with comprehensive DNS checking capabilities

---

## What is DNSBunch?

DNSBunch is your all-in-one DNS and mail diagnostics platform with a modern, user-friendly interface. It performs deep DNS record lookups, evaluates records for standards and best practices, and returns a categorized report with plain-language explanations.

### ✨ Key Features

- **Modern UI**: Built with React 18 and Material-UI v5 for a responsive, accessible experience
- **User-Friendly Explanations**: Complex DNS concepts explained in plain language for non-technical users
- **Comprehensive Analysis**: Checks 16+ DNS record types including DNSSEC, CAA, SPF, DMARC, and more
- **Categorized Results**: Results organized into logical categories:
  - 🏗️ **DNS Foundation** - Core DNS settings (NS, SOA, A, AAAA)
  - 🌐 **Website & Content** - Website-related configuration (CNAME, TXT, wildcard)
  - 📧 **Email & Communication** - Email delivery and security (MX, SPF, DMARC, DKIM, PTR)
  - 🔒 **Security & Protection** - Advanced security features (DNSSEC, CAA, AXFR)
  - ⚡ **Performance & Optimization** - Speed and efficiency settings (glue records)
- **Visual Status Indicators**: Clear pass/warning/error/info status with color coding
- **Detailed Recommendations**: Actionable advice for fixing issues
- **No Registration Required**: Instant analysis without signup or data storage

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
- **Framework:** Flask 2.3.3
- **Key Libraries:**
  - [`dnspython`](https://www.dnspython.org/) 2.4.2 — DNS queries (A, AAAA, MX, NS, etc.)
  - [`Flask`](https://flask.palletsprojects.com/) 2.3.3 — REST API framework
  - [`Flask-Cors`](https://flask-cors.readthedocs.io/) 4.0.0 — CORS for API
  - [`gunicorn`](https://gunicorn.org/) 21.2.0 — Production WSGI server
  - [`python-dotenv`](https://pypi.org/project/python-dotenv/) 1.0.0 — Environment config
  - [`pytest`](https://docs.pytest.org/) 7.4.2 — Testing framework
  - [`requests`](https://docs.python-requests.org/) 2.31.0 — HTTP library
  - [`geoip2`](https://pypi.org/project/geoip2/) 4.7.0 — Geographic IP lookups

---

### Frontend (`/frontend`)
- **Framework:** React 18.2.0
- **UI Library:** [Material UI (MUI)](https://mui.com/) v5.18.0 — Modern, accessible React components
- **Build Tool:** [Vite](https://vitejs.dev/) — Fast development and build tool
- **Key Libraries:**
  - [`@mui/material`](https://mui.com/) 5.18.0 — Material Design components
  - [`@mui/icons-material`](https://mui.com/material-ui/material-icons/) 5.18.0 — Material Design icons
  - [`@emotion/react`](https://emotion.sh/) 11.14.0 — CSS-in-JS styling
  - [`@emotion/styled`](https://emotion.sh/) 11.14.1 — Styled components
  - [`axios`](https://axios-http.com/) 1.5.0 — HTTP client for API requests
  - [`react-hook-form`](https://react-hook-form.com/) 7.62.0 — Form management and validation
  - [`@hookform/resolvers`](https://github.com/react-hook-form/resolvers) 5.2.1 — Form validation resolvers
  - [`yup`](https://github.com/jquense/yup) 1.7.0 — Schema validation
  - [`@tanstack/react-query`](https://tanstack.com/query/latest) 5.84.1 — Data fetching and caching
  - [`react-toastify`](https://fkhadra.github.io/react-toastify/) 11.0.5 — Toast notifications
  - [`vite`](https://vitejs.dev/) — Development server and build tool
  - [`vitest`](https://vitest.dev/) — Testing framework (Vite-native)
  - [`eslint`](https://eslint.org/) & [`prettier`](https://prettier.io/) — Code linting and formatting

---

## Monorepo Structure

This repository contains both frontend and backend code for DNSBunch:

```
DNSBunch/
├── .github/
│   └── COPILOT_INSTRUCTIONS.md
├── backend/
│   ├── app.py                    # Main Flask application
│   ├── dns_checker.py           # DNS checking logic
│   ├── requirements.txt         # Python dependencies
│   ├── render.yaml             # Render deployment config
│   ├── tests/
│   │   └── test_dns_checker.py # Backend tests
│   └── __pycache__/            # Python cache files
├── frontend/
│   ├── index.html              # Main HTML file
│   ├── package.json            # Node.js dependencies
│   ├── vite.config.js         # Vite configuration
│   ├── vercel.json            # Vercel deployment config
│   └── src/
│       ├── App.jsx            # Main React component
│       ├── main.jsx           # React entry point
│       ├── index.css          # Global styles
│       ├── components/
│       │   ├── DNSResults.jsx        # Enhanced results display
│       │   ├── DomainSearchForm.jsx  # Domain input form
│       │   └── ErrorBoundary.jsx     # Error handling
│       └── services/
│           └── api.js         # API communication
├── README.md                  # This file
├── DEVELOPMENT.md            # Development notes
└── .gitignore               # Git ignore rules
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
