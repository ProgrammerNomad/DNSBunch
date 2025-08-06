# Copilot Instructions for DNSBunch

This document provides comprehensive, explicit guidelines for GitHub Copilot (and any AI code assistant) to maintain, extend, and contribute to the DNSBunch repository.

---

## Repository Information

- **GitHub Repository:** [ProgrammerNomad/DNSBunch](https://github.com/ProgrammerNomad/DNSBunch)
- **Primary Developer:** Nomad Programmer ([ProgrammerNomad](https://github.com/ProgrammerNomad))
- **Status:** Active solo development
- **Last Updated:** 2025-08-06

---

## Project Purpose

- DNSBunch is a free, open-source DNS and mail server diagnostics web application.
- It analyzes domain health by performing in-depth DNS record checks and reporting all details in a categorized, actionable report.
- DNSBunch helps users identify, understand, and resolve misconfigurations for better reliability and deliverability.

---

## Tech Stack

- **Backend:** Python 3.9+, Flask (or FastAPI), dnspython, asyncio
- **Frontend:** React.js (recommended), or static HTML/CSS/Bootstrap for MVP
- **Deployment:** Render.com (backend), Vercel/Netlify (frontend)

---

## Monorepo Structure

Both frontend and backend live in this repository.  
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

## Coding Standards

### Backend (Python)
- Use `dnspython` for DNS queries.
- Use `asyncio` for concurrent DNS lookups where possible.
- Organize code modularly: group each DNS check in its own function/class.
- Validate all user input (domain names; use regex or proper libraries).
- Catch and log exceptions for all network operations.
- Return results and errors in structured JSON.
- Use environment variables for sensitive config (API keys, secrets).
- Write descriptive docstrings for all public classes/functions.
- Follow [PEP 8](https://peps.python.org/pep-0008/) code style.

### Frontend (React)
- Use functional components and hooks.
- Fetch backend endpoints asynchronously; handle loading and error states.
- Validate user input (domain format) on submit.
- Organize results clearly by record type and check.
- Display all returned information, including warnings and errors.
- Use Bootstrap or Material UI for styling (optional).

---

## DNSBunch Record Checks: Details and Outputs

For each DNS record type, Copilot should ensure:

### NS (Nameserver) Records
- Lookup: All NS records for the domain.
- Output: Hostnames, IPv4/IPv6 for each, and optionally, geolocation.
- Validations: All resolve to valid IPs; no duplicates; delegation matches parent; all nameservers respond.

### SOA (Start of Authority)
- Lookup: SOA record for the domain.
- Output: Primary nameserver, responsible email, serial, refresh, retry, expire, min TTL.
- Validations: Exists; serial matches across all NS; values within best-practice ranges.

### A and AAAA (IPv4/IPv6)
- Lookup: All A and AAAA records for root and www.
- Output: List of IPs.
- Validations: Exist; not private/reserved; IPs reachable (optional).

### MX (Mail Exchange)
- Lookup: All MX records, priorities, resolved IPs.
- Output: Host, priority, IPs.
- Validations: Exist if email enabled; priorities correct; MX targets resolve to A/AAAA (never CNAME); targets reachable.

### SPF (Sender Policy Framework)
- Lookup: TXT records, extract SPF.
- Output: SPF record value.
- Validations: Exists; syntax valid; <10 DNS lookups; no deprecated mechanisms.

### TXT Records
- Lookup: All TXT records for root.
- Output: All values.
- Validations: SPF/DKIM/DMARC presence; syntax valid.

### CNAME
- Lookup: CNAMEs for www, mail, subdomains.
- Output: CNAME targets.
- Validations: No CNAME at apex; targets resolve; chains not too long.

### PTR (Reverse DNS)
- Lookup: PTR for each mail server IP.
- Output: PTR value.
- Validations: Exists; matches host; not generic.

### CAA
- Lookup: CAA records.
- Output: All values.
- Validations: Syntax valid; at least one CA authorized or none; no conflicts.

### DMARC
- Lookup: DMARC TXT record.
- Output: Record value.
- Validations: Exists; syntax valid; policy set; aligns with SPF/DKIM.

### DKIM
- Lookup: TXT record at selector._domainkey.domain.
- Output: Record value.
- Validations: Exists; syntax and key length valid.

### Glue Records
- Lookup: Glue for in-zone NS.
- Output: Glue IPs.
- Validations: Present; consistent across zones.

### DNSSEC
- Lookup: DS, RRSIG, and other DNSSEC records.
- Output: All relevant records.
- Validations: Exists; valid; consistent; no expired signatures.

### AXFR (Zone Transfer)
- Check: Is AXFR open or closed.
- Output: Status.
- Validations: AXFR must be closed to unauthorized hosts.

### Wildcard Records
- Check: Detect wildcard DNS entries.
- Output: Presence and value.
- Validations: Warn if inappropriate.

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

- Backend should run on port `$PORT` (Render default).
- Enable CORS for frontend’s domain.
- Frontend must point API requests to deployed backend URL.

---

## Documentation

- Keep README detailed and up-to-date, especially on record checks and outputs.
- Document architectural decisions in this file or `/docs`.

---

## Contributing

- Use feature branches for any change.
- Open an issue before major features or breaking changes.
- Write clear commit messages.
- Add/update tests for all new features.
- Update documentation for core changes.

---

## Developer

- Nomad Programmer (GitHub: [ProgrammerNomad](https://github.com/ProgrammerNomad))

---

## License

MIT License applies to all code and contributions.

---

## Contact

For help or questions, open a GitHub Issue or Discussion.

---