# Copilot Instructions for DNSBunch 🚀

Guidelines for GitHub Copilot and contributors to maintain, extend, and contribute to [ProgrammerNomad/DNSBunch](https://github.com/ProgrammerNomad/DNSBunch).

---

## Repository Information

- **GitHub Repository:** [ProgrammerNomad/DNSBunch](https://github.com/ProgrammerNomad/DNSBunch)
- **Primary Developer:** Nomad Programmer ([ProgrammerNomad](https://github.com/ProgrammerNomad))
- **Status:** Active development with modern UI enhancements
- **Last Updated:** 2025-08-07
- **Frontend:** React 18 with Material-UI v5 and enhanced user experience
- **Backend:** Python Flask with comprehensive DNS checking capabilities

---

## Project Overview

DNSBunch is a modern DNS diagnostics platform with a user-friendly interface that explains complex DNS concepts in plain language. The project emphasizes accessibility for both technical and non-technical users while maintaining comprehensive DNS analysis capabilities.

### Recent Enhancements

- **Modern UI**: Complete redesign using Material-UI v5 components
- **Enhanced UX**: User-friendly explanations for all DNS concepts
- **Categorized Results**: Organized into 5 logical categories with priority indicators
- **Visual Design**: Color-coded status indicators, progress bars, and modern layouts
- **Accessibility**: Proper ARIA labels, keyboard navigation, and screen reader support

---

## Project Functionality

### What DNSBunch Does

- Accepts a domain name as input through a modern web interface.
- Performs **in-depth DNS and mail server analysis** using a wide range of DNS queries.
- Checks NS, SOA, A, AAAA, MX, SPF, TXT, CNAME, PTR, CAA, DMARC, DKIM, glue records, DNSSEC, AXFR, and wildcard records.
- Analyzes nameserver delegation, record consistency, mail configuration, DNSSEC, zone transfer risks, and more.
- Returns a **detailed, categorized report** for each DNS record type, showing values, issues, and best practice guidance.
- Highlights **warnings and errors** for each aspect of DNS configuration and mail deliverability.
- No login or signup required; no data is stored beyond the current check.

---

## DNS Record Checks: Details and Outputs

### NS (Nameserver) Records
- **Information Returned:** All authoritative nameservers, their IPv4/IPv6, (optional) geolocation.
- **Checks:** Valid IPs, reachability, duplicates, parent/child delegation, no single point of failure.

### SOA (Start of Authority)
- **Information Returned:** Primary nameserver, responsible email, serial, refresh, retry, expire, min TTL.
- **Checks:** Record exists, serial matches, recommended values, valid email.

### A (IPv4) and AAAA (IPv6)
- **Information Returned:** All IPs for domain/root/www.
- **Checks:** Presence, no private/reserved/invalid IPs, reachability.

### MX (Mail Exchange)
- **Information Returned:** All MX hosts, priorities, resolved IPs.
- **Checks:** Existence, duplicates, priorities, valid A/AAAA (no CNAME), reachability.

### SPF (Sender Policy Framework)
- **Information Returned:** SPF record value (TXT).
- **Checks:** Exists, valid syntax, max 10 lookups, no deprecated terms.

### TXT
- **Information Returned:** All TXT records for domain.
- **Checks:** SPF, DKIM, DMARC presence; syntax valid.

### CNAME
- **Information Returned:** CNAMEs for www, mail, subdomains.
- **Checks:** No apex CNAME, targets resolve, chain not too long.

### PTR (Reverse DNS)
- **Information Returned:** PTR for each mail server IP.
- **Checks:** Exists, matches hostname, not generic.

### CAA
- **Information Returned:** All CAA records.
- **Checks:** Syntax valid, at least one CA or none, no conflicts.

### DMARC
- **Information Returned:** DMARC TXT record.
- **Checks:** Exists, valid syntax/policy, SPF/DKIM alignment.

### DKIM
- **Information Returned:** DKIM selector records (user/common).
- **Checks:** Exists, valid syntax, key length.

### Glue Records
- **Information Returned:** In-zone glue presence and correctness.
- **Checks:** Present for all in-bailiwick nameservers, consistent.

### DNSSEC
- **Information Returned:** DS, RRSIG, etc.
- **Checks:** Present, valid, consistent, no expired signatures.

### AXFR (Zone Transfer)
- **Information Returned:** AXFR status.
- **Checks:** Not open to unauthorized hosts.

### Wildcard Records
- **Information Returned:** Detection of wildcards.
- **Checks:** Warn if inappropriate.

---

## Tech Stack and Library Choices

### Backend (`/backend`)
- **Language:** Python 3.9+
- **Framework:** Flask 2.3.3
- **Key Libraries:**
  - [`dnspython`](https://www.dnspython.org/) 2.4.2 — DNS lookups
  - [`Flask`](https://flask.palletsprojects.com/) 2.3.3 — REST API framework
  - [`Flask-Cors`](https://flask-cors.readthedocs.io/) 4.0.0 — CORS handling
  - [`gunicorn`](https://gunicorn.org/) 21.2.0 — Production WSGI server
  - [`python-dotenv`](https://pypi.org/project/python-dotenv/) 1.0.0 — Environment config
  - [`pytest`](https://docs.pytest.org/) 7.4.2 — Testing framework
  - [`requests`](https://docs.python-requests.org/) 2.31.0 — HTTP requests
  - [`geoip2`](https://pypi.org/project/geoip2/) 4.7.0 — Geographic IP data

### Frontend (`/frontend`)
- **Framework:** React 18.2.0
- **UI Library:** [Material UI (MUI)](https://mui.com/) v5.18.0 — Modern, accessible React components
- **Build Tool:** [Vite](https://vitejs.dev/) — Fast development and build
- **Key Libraries:**
  - [`@mui/material`](https://mui.com/) 5.18.0 — Material Design components
  - [`@mui/icons-material`](https://mui.com/material-ui/material-icons/) 5.18.0 — Material icons
  - [`@emotion/react`](https://emotion.sh/) 11.14.0 — CSS-in-JS styling
  - [`@emotion/styled`](https://emotion.sh/) 11.14.1 — Styled components
  - [`axios`](https://axios-http.com/) 1.5.0 — HTTP client
  - [`react-hook-form`](https://react-hook-form.com/) 7.62.0 — Form management
  - [`@hookform/resolvers`](https://github.com/react-hook-form/resolvers) 5.2.1 — Form validation
  - [`yup`](https://github.com/jquense/yup) 1.7.0 — Schema validation
  - [`@tanstack/react-query`](https://tanstack.com/query/latest) 5.84.1 — Data fetching/caching
  - [`react-toastify`](https://fkhadra.github.io/react-toastify/) 11.0.5 — Notifications
  - [`vitest`](https://vitest.dev/) — Testing framework

---

## Monorepo Structure

```
DNSBunch/
├── .github/
│   └── COPILOT_INSTRUCTIONS.md    # This file
├── backend/
│   ├── app.py                     # Main Flask application
│   ├── dns_checker.py            # DNS checking logic
│   ├── requirements.txt          # Python dependencies
│   ├── render.yaml              # Render deployment config
│   ├── tests/
│   │   └── test_dns_checker.py  # Backend tests
│   └── __pycache__/             # Python cache files
├── frontend/
│   ├── index.html               # Main HTML file
│   ├── package.json             # Node.js dependencies
│   ├── vite.config.js          # Vite configuration
│   ├── vercel.json             # Vercel deployment config
│   └── src/
│       ├── App.jsx             # Main React component
│       ├── main.jsx            # React entry point
│       ├── index.css           # Global styles
│       ├── components/
│       │   ├── DNSResults.jsx        # Enhanced results display
│       │   ├── DomainSearchForm.jsx  # Domain input form
│       │   └── ErrorBoundary.jsx     # Error handling
│       └── services/
│           └── api.js          # API communication
├── README.md                   # Project documentation
├── DEVELOPMENT.md             # Development notes
└── .gitignore                # Git ignore rules
```

---

## Coding Standards

### Backend (Python)
- Modular code: each DNS check in its own function/class.
- Validate all user input.
- Catch/log exceptions for network ops.
- Return results/errors in structured JSON.
- Use environment variables for sensitive config.
- Descriptive docstrings.
- Follow [PEP 8](https://peps.python.org/pep-0008/).

### Frontend (React)
- Functional components/hooks.
- Modern UI (Material UI v5).
- Validate form input with react-hook-form and yup.
- Organize results by category with user-friendly explanations.
- Handle loading/error states gracefully.
- Show comprehensive info, warnings, and errors with visual indicators.
- Use proper accessibility attributes (ARIA labels, keyboard navigation).
- Implement responsive design for mobile/desktop compatibility.

### UI/UX Guidelines
- **Category Organization**: Results organized into 5 categories (DNS Foundation, Website & Content, Email & Communication, Security & Protection, Performance & Optimization)
- **Status Indicators**: Clear visual indicators for pass (green), warning (orange), error (red), info (blue)
- **User-Friendly Language**: Technical concepts explained in plain language for non-technical users
- **Progressive Disclosure**: Basic information visible by default, technical details expandable
- **Visual Hierarchy**: Important information highlighted, less critical details subdued
- **Help Integration**: Contextual help and recommendations for each DNS check

---

## Error Handling

- All errors must be caught and returned as structured JSON (API) or clear UI messages (frontend).
- Never expose stack traces or sensitive server details to users.

---

## Security

- Validate all input; never accept raw shell input.
- No shell command execution.
- Protect sensitive settings with environment variables.
- Implement basic rate limiting.

---

## Testing

- Backend: Use `pytest` or `unittest`. Store tests in `/tests`.
- Frontend: Use React Testing Library and Jest.

---

## Deployment

- Backend runs on `$PORT` (Render default).
- Enable CORS for frontend’s domain.
- Frontend points API requests to deployed backend URL.

---

## Documentation

- Keep README detailed and up-to-date, especially on record checks and outputs.
- Document architectural decisions in this file or `/docs`.

---

## Contributing

- Use feature branches for changes.
- Open an issue before major/breaking changes.
- Write clear commit messages.
- Add/update tests for new features.
- Update documentation for core changes.

---

## Developer

- Nomad Programmer ([ProgrammerNomad](https://github.com/ProgrammerNomad))

---

## License

MIT License applies to all code and contributions.

---

## Contact

For help or questions, open a GitHub Issue or Discussion.

---
