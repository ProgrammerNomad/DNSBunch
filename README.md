# DNSBunch

**Free & Open Source DNS Analysis Tool** | [Live Site](https://www.dnsbunch.com/)

A comprehensive DNS analysis and mail server diagnostics tool built with Next.js, TypeScript, and Python Flask. Achieve 95% parity with IntoDNS while remaining completely free and open source.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.9-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.9+-green)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-2.3.3-lightgrey)](https://flask.palletsprojects.com/)

---

## Why DNSBunch?

DNSBunch is a **completely free alternative to IntoDNS**, providing professional-grade DNS diagnostics without any cost or registration requirements. Perfect for:

- **System Administrators** - Validate DNS configurations
- **Email Administrators** - Troubleshoot mail delivery issues
- **Security Professionals** - Audit DNS security settings
- **Developers** - Debug domain setup for projects
- **Students & Learners** - Understand DNS infrastructure

**100% Free** | **No Registration** | **No Data Storage** | **Open Source**

---

## Repository Information

- **Live Site:** [https://www.dnsbunch.com/](https://www.dnsbunch.com/)
- **GitHub Repository:** [ProgrammerNomad/DNSBunch](https://github.com/ProgrammerNomad/DNSBunch)
- **Primary Developer:** Nomad Programmer ([ProgrammerNomad](https://github.com/ProgrammerNomad))
- **Version:** 0.0.2
- **Status:** Production Ready (95% IntoDNS Parity)
- **Last Updated:** 2026-01-02
- **License:** MIT (Free to use, modify, and distribute)

---

## Key Features

### Comprehensive DNS Checks (30+ Individual Checks)
- **15+ NS (Nameserver) Checks** - Parent delegation, comparison, recursive queries, same class, response testing, subnet diversity, glue records, hostname validation, ping tests
- **6 SOA Checks** - Record display, serial consistency, REFRESH/RETRY/EXPIRE/MINIMUM validation
- **10 MX Checks** - Record display, name validity, count validation, CNAME check, IP publicity, duplicate detection, PTR records
- **Missing Nameserver Detection** - Separate checks for "Missing At Domain" and "Missing At Parent"

### Modern UI/UX
- **Material-UI v7** with responsive design
- **Dual Display Modes** - Normal (simple) and Advanced (detailed) formats
- **Clean Output** - No JSON/arrays, human-readable text formatting
- **Compact Footer** - Real technology logos (React, TypeScript, Material-UI, Python, Flask)
- **Version Badge** - Linked to CHANGELOG for transparency

### Enterprise-Grade Security
- **CSRF Protection** - JWT tokens with IP + User-Agent binding
- **Rate Limiting** - 50 requests per 5 minutes to prevent abuse
- **Input Validation** - RFC-compliant domain validation
- **No Data Storage** - Complete privacy, no logging of queries

### Performance
- **Async DNS Operations** - Fast parallel queries
- **Auto-Reload** - Development mode with instant updates
- **Production Optimized** - Next.js SSR with code splitting
- **CDN Ready** - Netlify deployment with global edge network

---

## DNS Check Coverage

### Parent Section (5 Checks)
- Domain NS records display
- ✅ TLD Parent Check  
- ✅ Your nameservers are listed
- ✅ DNS Parent sent Glue
- ✅ Nameservers A records

### NS Section (13-15 Checks)
- Parent Delegation - NS records from TLD servers
- Domain Nameservers - NS records from domain servers  
- **Comparison** - Parent vs Domain NS mismatch detection
- **Missing At Domain** - NSes at parent but not at domain (NEW!)
- **Missing At Parent** - NSes at domain but not at parent (NEW!)
- Recursive Queries - Test if NS allows recursive queries
- Same Class - Verify all NS are class IN
- DNS Servers Responded - Test each NS response
- Different Subnets - Geographic distribution validation
- Glue For NS Records - IP addresses for each nameserver
- Name Of Nameservers Valid - RFC-compliant hostname validation
- Is Ping Nameservers Work - ICMP ping test
- Multiple Nameservers - Redundancy check

### SOA Section (6 Checks)
- SOA Record - Display primary nameserver, hostmaster, serial, etc.
- SOA Serial Consistency - All NS agree on serial number
- SOA Refresh - Recommended: 86400 (24 hours)
- SOA Retry - Recommended: 7200 (2 hours)
- SOA Expire - Recommended: 3600000 (~6 weeks)
- SOA Minimum - Default TTL validation

### MX Section (10 Checks)
- MX Records - Display with priority, hostname, IP, glue status
- MX Name Validity - All MX resolve to IP addresses
- MX Count - Multiple MX for redundancy
- MX CNAME Check - No CNAME pointing (RFC 2181)
- MX IPs are Public - No private IP addresses
- MX is not IP - All are hostnames, not IPs
- Different MX Records - Consistency across nameservers
- Mismatched MX A - No differing IPs for same hostname
- Duplicate MX A - No duplicate IPs across MX
- Reverse MX A (PTR) - PTR records for all MX IPs

### WWW Section
- WWW A Record - Resolution and IP display
- IPs are public - Public IP validation
- WWW CNAME - CNAME record validation

---

## Quick Start

### Prerequisites
- **Backend**: Python 3.9+, pip, virtualenv
- **Frontend**: Node.js 18+, npm

### Installation

```bash
# Clone repository
git clone https://github.com/ProgrammerNomad/DNSBunch.git
cd DNSBunch

# Backend setup
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python app.py  # Runs on http://localhost:5000

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev  # Runs on http://localhost:3000
```

### Production Build

```bash
# Frontend production build
cd frontend
npm run build
npm start

# Backend production (with Gunicorn)
cd backend
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

---

## Technology Stack

### Frontend
- **Framework**: Next.js 15.5.9 (React 19.1.1)
- **Language**: TypeScript 5.9.2
- **UI Library**: Material-UI 7.3.1
- **HTTP Client**: Axios with CSRF integration
- **Query Management**: TanStack Query
- **Deployment**: Netlify

### Backend
- **Framework**: Python Flask 2.3.3
- **DNS Library**: dnspython 2.4.2
- **Security**: PyJWT, Flask-CORS
- **Async**: asyncio for parallel DNS queries
- **Deployment**: Render.com / VPS

---

## Comparison with IntoDNS

| Feature | IntoDNS | DNSBunch | Status |
|---------|---------|----------|--------|
| NS Checks | 12-15 | 13-15 | 100% |
| SOA Checks | 6 | 6 | 100% |
| MX Checks | 11 | 10 | 95% |
| Output Format | Clean text | Clean text | Matched |
| Missing NS Detection | Separate checks | Separate checks | Matched |
| Free to Use | Yes | Yes | Yes |
| Open Source | No | Yes | Better! |
| Modern UI | No | Yes | Better! |
| API Available | No | Yes | Better! |

**Overall Parity: ~95%**

---

## Roadmap & Future Ideas

### Phase 1: Core Features - COMPLETE
- 30+ DNS checks across NS/SOA/MX
- Clean text formatting (no JSON)
- Missing nameserver detection
- Production deployment

### Phase 2: Enhanced Checks (Next Up)
- [ ] **DNSSEC Validation** - Full chain of trust verification
- [ ] **SPF/DMARC/DKIM** - Email authentication checks
- [ ] **CAA Records** - Certificate authority validation
- [ ] **IPv6 Support** - AAAA record analysis
- [ ] **AXFR Test** - Zone transfer security check

### Phase 3: User Experience
- [ ] **Dark Mode** - Eye-friendly theme toggle
- [ ] **Export Results** - PDF/JSON/CSV export
- [ ] **Result Sharing** - Shareable links with unique IDs
- [ ] **Multi-Domain Batch** - Check multiple domains at once
- [ ] **History** - Browser-based result history (localStorage)

### Phase 4: Advanced Features
- [ ] **DNS Monitoring** - Schedule periodic checks with alerts
- [ ] **Comparison Tool** - Compare 2 domains side-by-side
- [ ] **API Access** - RESTful API for integrations
- [ ] **Webhooks** - Real-time notifications for changes
- [ ] **TTL Tracker** - Monitor DNS propagation progress

### Phase 5: Community & Education
- [ ] **Knowledge Base** - DNS tutorials and best practices
- [ ] **Video Tutorials** - Screen recordings for common tasks
- [ ] **Blog** - DNS tips, tricks, and news
- [ ] **Community Forum** - Q&A and discussions
- [ ] **Certification Guide** - DNS administration learning path

### Phase 6: Enterprise Features (Optional)
- [ ] **White Label** - Custom branding for businesses
- [ ] **Team Collaboration** - Shared workspaces
- [ ] **RBAC** - Role-based access control
- [ ] **Audit Logs** - Compliance tracking
- [ ] **SLA Monitoring** - Uptime and performance metrics

---

## How You Can Help

DNSBunch is **free forever** and **open source**. Here's how you can contribute:

### For Users
- **Star the repo** on GitHub
- **Report bugs** via GitHub Issues  
- **Suggest features** you'd like to see
- **Share** with colleagues and on social media
- **Write testimonials** about how DNSBunch helped you

### For Developers
- **Fix bugs** and submit pull requests
- **Add features** from the roadmap
- **Improve documentation**
- **Enhance UI/UX**
- **Write tests** for better coverage

### For Content Creators
- **Create tutorials** on YouTube
- **Write blog posts** about DNS diagnostics
- **Mention in podcasts** or livestreams
- **Share on social media**

### For Sponsors
DNSBunch is currently **sponsored by friends** who use it daily. If your organization benefits from DNSBunch:
- **GitHub Sponsors** - Support ongoing development
- **Buy Me a Coffee** - One-time contributions
- **Corporate Sponsorship** - Logo placement, priority support

---
- **Information Returned:** Overall domain health assessment, DNS resolution status, authoritative response validation, suspicious pattern detection, parking/suspension indicators, detailed technical diagnostics.
- **Checks:** Nameserver resolution capability, authoritative DNS responses, domain suspension/expiration detection, parking service identification, DNS error pattern analysis, critical infrastructure validation.
- **Validations:** Domain accessibility verification, DNS configuration integrity, suspension/hold status detection, expired domain identification, parking service recognition, DNS server responsiveness.
- **Critical Issues Detected:** 
  - **Domain Suspended/Expired:** Identifies domains with clientHold status, expired registrations, or suspended services
  - **DNS Resolution Failure:** Detects NXDOMAIN responses, failed nameserver queries, and configuration issues  
  - **Authoritative Response Problems:** Identifies non-responsive or misconfigured authoritative servers
- **Recommendations Provided:** Domain registrar contact guidance, DNS provider troubleshooting steps, configuration fix suggestions, renewal payment verification steps.

### 2. **NS (Nameserver) Records**
- **Information Returned:** All authoritative nameservers for the domain, IPv4/IPv6 addresses, geolocation data, TTL values, response times.
- **Checks:** Valid IPs, reachability test, no duplicates, parent/child delegation consistency, geographical distribution, no single point of failure, authoritative response validation, recursive query handling.
- **Validations:** Nameserver accessibility, IP address validity, delegation consistency between parent and child zones, glue record requirements, response time analysis.

### 3. **SOA (Start of Authority) Record**
- **Information Returned:** Primary master nameserver (MNAME), responsible email address (RNAME), serial number, refresh interval, retry interval, expire time, minimum TTL values.
- **Checks:** Record exists, serial number consistency across all nameservers, recommended timing values validation, valid email format, MNAME exists in NS records.
- **Validations:** Serial number synchronization, refresh/retry/expire values within best practice ranges, responsible email accessibility, primary nameserver authority validation.

### 4. **A (IPv4 Address) Records**
- **Information Returned:** All IPv4 addresses assigned to the domain (root domain and www subdomain), TTL values, geographic location of IPs.
- **Checks:** Records exist for both root and www, no private/reserved/loopback IPs, IP reachability tests, load balancing configuration, CDN detection.
- **Validations:** Public IP address verification, connectivity tests, geographic distribution analysis, duplicate IP detection, hosting provider identification.

### 5. **AAAA (IPv6 Address) Records**
- **Information Returned:** All IPv6 addresses assigned to the domain (root domain and www subdomain), TTL values, IPv6 address blocks, dual-stack configuration.
- **Checks:** Records exist, no invalid/reserved IPv6 blocks, IPv6 connectivity tests, dual-stack compatibility, proper IPv6 configuration.
- **Validations:** Valid IPv6 address format, reserved address block detection, connectivity verification, IPv6 readiness assessment.

### 6. **MX (Mail Exchange) Records**
- **Information Returned:** Complete list of mail servers, priority values, resolved IPv4/IPv6 addresses, mail server software detection, anti-spam configurations.
- **Checks:** Records exist, no duplicate priorities, valid A/AAAA records (no CNAME for MX targets), mail server reachability, priority distribution, backup MX configuration.
- **Validations:** Mail server connectivity, priority ordering validation, target hostname resolution, redundancy analysis, mail server response testing.

### 7. **SPF (Sender Policy Framework)**
- **Information Returned:** Complete SPF record value, parsed mechanisms and modifiers, included domains, DNS lookup count, policy strictness.
- **Checks:** Record exists, valid syntax, maximum 10 DNS lookups, no deprecated mechanisms, proper policy configuration, include chain validation.
- **Validations:** Syntax compliance with RFC 7208, DNS lookup optimization, mechanism effectiveness, policy completeness, security strength assessment.

### 8. **TXT Records**
- **Information Returned:** All TXT records for the root domain, SPF/DKIM/DMARC identification, domain verification records, custom configurations.
- **Checks:** Presence of security records (SPF, DKIM, DMARC), valid syntax for each type, no conflicting records, proper formatting.
- **Validations:** Record syntax verification, security configuration completeness, conflicting record detection, best practice compliance.

### 9. **CNAME (Canonical Name) Records**
- **Information Returned:** CNAME records for key subdomains (www, mail, ftp, blog, shop), target domains, chain resolution, TTL values.
- **Checks:** No CNAME at zone apex, chain length validation, target existence and resolution, circular reference detection, subdomain coverage.
- **Validations:** Zone apex compliance, resolution chain integrity, target accessibility, performance impact assessment.

### 10. **PTR (Reverse DNS) Records**
- **Information Returned:** PTR records for each mail server IP address, reverse hostname resolution, forward-reverse consistency.
- **Checks:** PTR record exists for all MX server IPs, hostname matches forward lookup, not generic/default hostnames, proper domain alignment.
- **Validations:** Reverse DNS completeness, forward-reverse consistency, hostname authenticity, mail server reputation factors.

### 10. **CAA (Certification Authority Authorization) Records**
- **Information Returned:** Complete list of CAA records, authorized certificate authorities, policy tags, critical flags, wildcard permissions.
- **Checks:** Valid syntax according to RFC 6844, at least one CA authorized or explicit denial, no conflicting policies, proper flag usage.
- **Validations:** Syntax compliance, security policy effectiveness, CA authorization completeness, wildcard certificate controls.

### 11. **DMARC (Domain-based Message Authentication, Reporting & Conformance)**
- **Information Returned:** Complete DMARC policy record, alignment settings, reporting configuration, policy strictness, aggregate/forensic report addresses.
- **Checks:** Record exists at _dmarc subdomain, valid syntax, proper policy configuration, SPF/DKIM alignment settings, reporting setup.
- **Validations:** Policy effectiveness, alignment configuration, reporting mechanism setup, security level assessment, gradual deployment validation.

### 12. **DKIM (DomainKeys Identified Mail)**
- **Information Returned:** DKIM selector records (user-provided or common selectors), public key data, key algorithms, key length, service configuration.
- **Checks:** Records exist for provided/common selectors, valid public key format, appropriate key length (1024+ bits), proper algorithm usage.
- **Validations:** Key strength assessment, algorithm security, selector configuration, service integration verification.

### 13. **Glue Records**
- **Information Returned:** Presence and accuracy of glue records for in-zone nameservers, IPv4/IPv6 glue data, consistency across parent servers.
- **Checks:** Glue records present for all in-bailiwick nameservers, IP address consistency, parent-child synchronization, redundancy coverage.
- **Validations:** Delegation integrity, glue record necessity, consistency verification, resolution path optimization.

### 14. **DNSSEC (Domain Name System Security Extensions)**
- **Information Returned:** DS records in parent zone, DNSKEY records, RRSIG signatures, NSEC/NSEC3 records, chain of trust validation.
- **Checks:** DNSSEC signing status, valid signatures, proper key algorithms, signature expiration, chain of trust integrity.
- **Validations:** Cryptographic signature verification, key rollover status, algorithm strength, trust chain completeness, temporal validity.

### 15. **AXFR (Zone Transfer)**
- **Information Returned:** Zone transfer availability status, transfer restrictions, secondary server configuration, security assessment.
- **Checks:** AXFR requests properly restricted to authorized hosts, no open zone transfers, secondary nameserver access control.
- **Validations:** Transfer security, access control effectiveness, information disclosure prevention, authorized server verification.

### 16. **Wildcard Records**
- **Information Returned:** Detection of wildcard DNS entries for various record types, wildcard coverage, subdomain behavior analysis.
- **Checks:** Wildcard presence detection, appropriate usage assessment, security implications, subdomain resolution behavior.
- **Validations:** Wildcard necessity, security risk assessment, resolution behavior analysis, best practice compliance.

### 17. **WWW (CNAME/A Records) - NEW**
- **Information Returned:** Complete WWW subdomain analysis including CNAME chain resolution, final A record destinations, IP addresses, public/private IP validation.
- **Checks:** WWW subdomain existence, CNAME record presence and chain following, A record resolution through CNAME chain, IP address publicity validation, subdomain accessibility.
- **Validations:** CNAME chain integrity, A record resolution accuracy, public IP verification, subdomain configuration completeness, web accessibility assessment.
- **Output Format:** 
  - **WWW A Record**: Displays complete resolution chain (e.g., `www.domain.com -> domain.com -> [ 192.0.2.1 ]` with CNAME indication)
  - **IPs are public**: Validates all resolved IPs are public (not private/reserved/loopback)
  - **WWW CNAME**: Confirms CNAME record existence and proper A record resolution

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
  "timestamp": "2025-08-26T12:00:00.000000",
  "status": "completed",
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
    },
    "www": {
      "status": "pass",
      "checks": [
        {
          "type": "www_a_record",
          "status": "info",
          "message": "Your www.example.com A record is:<br>www.example.com -&gt; example.com -&gt; [ 192.0.2.1 ]<br><br> [Looks like you have CNAME's]",
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
          "message": "OK. You do have a CNAME record for www.example.com.Your CNAME entry also returns the A record for the CNAME entry, which is good.",
          "details": {
            "has_cname": true,
            "cname_resolves": true
          }
        }
      ]
    }
    // ... Other records
  },
  "summary": {
    "total": 3,
    "passed": 2,
    "warnings": 1,
    "errors": 0,
    "info": 0
  }
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

---

## Documentation

- **[CHANGELOG.md](CHANGELOG.md)** - Version history and updates

---

## Acknowledgments

### Free Services Used
- **Domain**: Sponsored by friends who use DNSBunch daily
- **Frontend Hosting**: Netlify (Free tier)
- **Backend Hosting**: Render.com / VPS
- **CDN**: jsDelivr for technology logos

### Open Source Libraries
- **Next.js** - React framework
- **Material-UI** - Component library
- **dnspython** - DNS query library
- **Flask** - Python web framework

### Inspiration
- **IntoDNS** - Industry standard for DNS checking
- **DNS Community** - RFCs and best practices

---

## Contributing

We welcome contributions! See our roadmap above for ideas.

### Development Guidelines
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Standards
- TypeScript for all frontend code
- Python type hints for backend
- Material-UI for UI components
- Comprehensive error handling
- Security-first approach

---

## License

MIT License - Free to use, modify, and distribute.

See [LICENSE](LICENSE) file for full details.

---

## Links

- **Live Site**: [https://www.dnsbunch.com/](https://www.dnsbunch.com/)
- **GitHub**: [https://github.com/ProgrammerNomad/DNSBunch](https://github.com/ProgrammerNomad/DNSBunch)
- **Issues**: [Report bugs](https://github.com/ProgrammerNomad/DNSBunch/issues)
- **Discussions**: [Feature requests](https://github.com/ProgrammerNomad/DNSBunch/discussions)

---

## Developer

**Nomad Programmer**  
- GitHub: [@ProgrammerNomad](https://github.com/ProgrammerNomad)
- Project: [DNSBunch](https://github.com/ProgrammerNomad/DNSBunch)

---

## Disclaimer

DNSBunch is for informational and diagnostic purposes only. While we strive for accuracy:
- Always verify critical DNS configurations with multiple tools
- DNS propagation can take 24-48 hours
- Some checks may not work with all DNS providers
- Results are point-in-time and may change

For production environments, consult with qualified DNS administrators.

---

## Support & Feedback

- **Questions**: Open a [GitHub Discussion](https://github.com/ProgrammerNomad/DNSBunch/discussions)
- **Bugs**: Report via [GitHub Issues](https://github.com/ProgrammerNomad/DNSBunch/issues)
- **Security**: Email maintainer directly for security concerns
- **Feature Requests**: Use [GitHub Discussions](https://github.com/ProgrammerNomad/DNSBunch/discussions)

---

**Made by the open source community**

*DNSBunch - Free DNS Diagnostics for Everyone*
