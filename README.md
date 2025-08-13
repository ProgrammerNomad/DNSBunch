# DNSBunch

A comprehensive DNS analysis and mail server diagnostics tool built with React, TypeScript, and Python Flask.

---

## Repository Information

- **GitHub Repository:** [ProgrammerNomad/DNSBunch](https://github.com/ProgrammerNomad/DNSBunch)
- **Primary Developer:** Nomad Programmer ([ProgrammerNomad](https://github.com/ProgrammerNomad))
- **Status:** Active development with modern UI enhancements
- **Last Updated:** 2025-08-13
- **Frontend:** React 18 with Material-UI v5 and modern components
- **Backend:** Python Flask with comprehensive DNS checking capabilities

---

## What is DNSBunch?

DNSBunch is your all-in-one DNS and mail diagnostics platform with a modern, user-friendly interface. It performs deep DNS record lookups, evaluates records for standards and best practices, and returns a categorized report with plain-language explanations.

### Key Features

- **Modern UI**: Built with React 18 and Material-UI v5 for a responsive, accessible experience
- **User-Friendly Explanations**: Complex DNS concepts explained in plain language for non-technical users
- **Comprehensive Analysis**: Checks 16+ DNS record types including DNSSEC, CAA, SPF, DMARC, and more
- **Categorized Results**: Results organized into logical categories:
  - **DNS Foundation** - Core DNS settings (NS, SOA, A, AAAA)
  - **Website & Content** - Website-related configuration (CNAME, TXT, wildcard)
  - **Email & Communication** - Email delivery and security (MX, SPF, DMARC, DKIM, PTR)
  - **Security & Protection** - Advanced security features (DNSSEC, CAA, AXFR)
  - **Performance & Optimization** - Speed and efficiency settings (glue records)
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

## Security Features

### CSRF Protection
- Multi-factor token binding (IP + User Agent fingerprinting)
- JWT-based tokens with HMAC-SHA256 signing
- Automatic token refresh and validation
- Short-lived tokens (1 hour expiration)
- Usage counting and abuse prevention

### Rate Limiting
- 10 requests per 5-minute window per IP
- Automatic IP blocking for violations (1 hour)
- Client-side rate limiting for better UX
- Progressive retry mechanisms

### Request Validation
- Domain format validation and sanitization
- Suspicious pattern detection and blocking
- User-Agent and Origin validation
- Content-Type enforcement for API requests

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Next.js 14** (App Router)
- **Material-UI (MUI)** for components
- **Axios** for HTTP requests with CSRF integration
- **React Hook Form** with Yup validation

### Backend
- **Python Flask** with async DNS operations
- **dnspython** for DNS queries
- **PyJWT** for secure token management
- **Flask-CORS** for cross-origin resource sharing
- **Gunicorn** for production deployment

### Infrastructure
- **Frontend**: Deployed on Netlify with custom domain
- **Backend**: Deployed on Render.com with auto-scaling
- **DNS**: Cloudflare for domain management and security

## Project Structure

```
DNSBunch/
├── frontend/                  # React TypeScript frontend
│   ├── src/
│   │   ├── app/              # Next.js app directory
│   │   │   ├── layout.tsx    # Root layout component
│   │   │   └── page.tsx      # Home page component
│   │   ├── components/
│   │   │   ├── DomainSearchForm.tsx  # Search form with validation
│   │   │   ├── DNSResults.tsx        # Results display component
│   │   │   ├── ErrorBoundary.tsx     # Error handling component
│   │   │   └── Footer.tsx            # Footer component
│   │   ├── services/
│   │   │   ├── api.ts        # API client with CSRF protection
│   │   │   └── csrf.ts       # CSRF token management
│   │   ├── hooks/
│   │   │   └── useDNSAnalysis.ts     # DNS analysis hook
│   │   ├── theme/
│   │   │   └── theme.ts      # Material-UI theme configuration
│   │   └── providers/
│   │       └── QueryProvider.tsx     # React Query provider
│   ├── public/               # Static assets
│   ├── package.json          # Dependencies and scripts
│   └── netlify.toml          # Netlify deployment configuration
├── backend/                   # Python Flask backend
│   ├── app.py                # Main Flask application with security
│   ├── dns_checker.py        # DNS analysis engine
│   ├── requirements.txt      # Python dependencies
│   └── render.yaml           # Render deployment configuration
├── README.md                 # Project documentation
├── COPILOT_INSTRUCTIONS.md   # Development guidelines
└── .gitignore               # Git ignore rules
```

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+ and pip
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/ProgrammerNomad/DNSBunch.git
   cd DNSBunch
   ```

2. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend will be available at `http://localhost:3000`

3. **Setup Backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   python app.py
   ```
   Backend will be available at `http://localhost:5000`

### Environment Variables

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

#### Backend (.env)
```bash
FLASK_ENV=development
FLASK_DEBUG=True
CORS_ORIGINS=http://localhost:3000,https://www.dnsbunch.com
CSRF_SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here
RATE_LIMIT_REQUESTS=10
RATE_LIMIT_WINDOW=300
```

## Deployment

### Frontend (Netlify)
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Configure environment variables in Netlify dashboard
5. Deploy with custom domain configuration

### Backend (Render.com)
1. Connect your GitHub repository to Render
2. Choose "Web Service" and select Python environment
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `gunicorn app:app`
5. Configure environment variables in Render dashboard

## API Documentation

### Health Check
```http
GET /
```
Returns server status and timestamp.

### Get CSRF Token
```http
GET /api/csrf-token
```
Returns a secure CSRF token for protected requests.

### DNS Analysis
```http
POST /api/check
Content-Type: application/json
X-CSRF-Token: <token>

{
  "domain": "example.com",
  "checks": ["ns", "mx", "a"]  // Optional: specific checks
}
```

Returns comprehensive DNS analysis results.

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

## How to Use

1. **Enter a domain name** in the search field.
2. **Submit** to begin diagnostics.
3. **Read the detailed report** organized by record type.
4. **Follow recommendations** to fix any warnings or errors.

## Security Considerations

### Input Validation
- Domain names are validated against RFC standards
- Suspicious patterns (localhost, private IPs) are blocked
- Request payloads are sanitized and validated

### Rate Limiting
- Per-IP rate limiting prevents abuse
- Progressive blocking for repeated violations
- Client-side limiting for better user experience

### CSRF Protection
- Tokens bound to IP address and User-Agent
- Short-lived tokens with automatic refresh
- Secure storage and transmission

## Contributing

We welcome contributions! Please follow these guidelines:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes with proper testing
4. Commit with descriptive messages
5. Push and create a pull request

### Code Standards
- Use TypeScript for frontend components
- Follow Material-UI design patterns
- Write comprehensive error handling
- Add proper TypeScript interfaces
- Include security considerations

### Testing
- Test all DNS record types
- Verify error handling scenarios
- Check mobile responsiveness
- Validate security features

## Performance

### Frontend Optimization
- Code splitting with Next.js
- Lazy loading of components
- Optimized Material-UI bundle
- Client-side caching of results

### Backend Optimization
- Async DNS operations
- Request timeout handling
- Memory-efficient rate limiting
- Connection pooling for DNS queries

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Limitations

- DNS propagation may take time to reflect recent changes
- Some DNS servers may not respond to certain query types
- Rate limiting may affect high-volume usage
- DNSSEC validation requires properly configured resolvers

## License

MIT License - see LICENSE file for details.

## Support

- GitHub Issues: Report bugs and feature requests
- Documentation: Check README and code comments
- Security Issues: Contact maintainers directly

## Acknowledgments

- Built with modern web technologies
- DNS analysis powered by dnspython
- UI components from Material-UI
- Deployment on Netlify and Render

## Developer

**Nomad Programmer**
- GitHub: [ProgrammerNomad](https://github.com/ProgrammerNomad)
- Project: [DNSBunch](https://github.com/ProgrammerNomad/DNSBunch)

---

**Disclaimer**: DNSBunch is for informational purposes only. Always verify critical DNS configurations with authoritative sources and multiple tools.
