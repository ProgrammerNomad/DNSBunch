# Copilot Instructions for DNSBunch

Guidelines for GitHub Copilot and contributors to maintain, extend, and contribute to [ProgrammerNomad/DNSBunch](https://github.com/ProgrammerNomad/DNSBunch).

---

## Repository Information

- **GitHub Repository:** [ProgrammerNomad/DNSBunch](https://github.com/ProgrammerNomad/DNSBunch)
- **Primary Developer:** Nomad Programmer ([ProgrammerNomad](https://github.com/ProgrammerNomad))
- **Status:** Active solo development
- **Last Updated:** 2025-08-06

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
- **Framework:** Flask (recommended)
- **Key Libraries:**
  - [`dnspython`](https://www.dnspython.org/) — DNS lookups
  - [`Flask`](https://flask.palletsprojects.com/) — REST API
  - [`Flask-Cors`](https://flask-cors.readthedocs.io/) — CORS
  - [`gunicorn`](https://gunicorn.org/) — Production HTTP server
  - [`validators`](https://pypi.org/project/validators/) — Domain validation
  - [`python-dotenv`](https://pypi.org/project/python-dotenv/) — Env config
  - [`pytest`](https://docs.pytest.org/) — Testing

**Optional:**  
- [`asyncio`](https://docs.python.org/3/library/asyncio.html) — For concurrent lookups (Flask supports async in recent versions)
- [`loguru`](https://github.com/Delgan/loguru) — Logging

### Frontend (`/frontend`)
- **Framework:** React.js
- **UI Library:** [Material UI (MUI)](https://mui.com/) — Modern, accessible, popular React component library
- **Key Libraries:**
  - [`Axios`](https://axios-http.com/) — HTTP requests
  - [`react-hook-form`](https://react-hook-form.com/) — Form management & validation
  - [`yup`](https://github.com/jquense/yup) — Input/schema validation
  - [`react-query`](https://tanstack.com/query/latest) — API data management and caching
  - [`react-toastify`](https://fkhadra.github.io/react-toastify/) — Notifications
  - [`vite`](https://vitejs.dev/) — Fast React build tool
  - [`eslint`](https://eslint.org/) & [`prettier`](https://prettier.io/) — Linting/formatting
  - [`Jest`](https://jestjs.io/) & [`React Testing Library`](https://testing-library.com/docs/react-testing-library/intro/) — Testing

---

## Monorepo Structure

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
- Modern UI (Material UI).
- Validate form input.
- Organize results by record type/check.
- Handle loading/error states.
- Show all info, warnings, and errors.

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