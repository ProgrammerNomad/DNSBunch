# Changelog

All notable changes to DNSBunch will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.0.2] - 2026-01-02

### Summary
Enhanced DNS checking capabilities to match IntoDNS industry standards. Increased check granularity from ~60% to ~95% parity with comprehensive validation across NS, SOA, and MX records.

### Added
**NS Section (8 new checks):**
- Recursive queries security check
- Same class validation
- Different subnets verification
- DNS server response testing
- Detailed glue records with IP addresses
- Nameserver hostname format validation (RFC compliant)
- ICMP ping reachability test
- Multiple nameservers count validation

**SOA Section (6 individual checks):**
- SOA record display
- Serial consistency across nameservers
- REFRESH interval validation (3600-86400s)
- RETRY interval validation (1800-7200s)
- EXPIRE time validation (604800-2419200s)
- MINIMUM (negative cache TTL) validation (300-86400s)

**MX Section (5 individual checks):**
- MX records display
- MX hostname validity
- MX record count validation
- MX CNAME check (RFC 2181 compliance)
- Duplicate priority detection

**Documentation:**
- BUGFIXES.md - Detailed bug tracking
- CHANGELOG.md - Version history
- TESTING_REPORT.md - Comprehensive test results

### Changed
- Enhanced NS check granularity: 5-6 checks → 13-15 checks
- Improved error severity classification (ERROR vs WARNING)
- Updated Next.js: 15.4.6 → 15.5.9
- Frontend now dynamically renders individual check items

### Fixed
- NS record mismatch severity (WARNING → ERROR)
- TypeScript build errors (removed all `any` types)
- Variable scope error in all_records construction
- Next.js security vulnerability CVE-2025-55182

### Technical
- Added DNSCheck TypeScript interface
- Platform-aware ICMP ping implementation (Windows/Linux)
- RFC-compliant hostname validation with regex
- API response time: ~5-8 seconds for full analysis
- Build time: ~4-14 seconds

---

## [0.0.1] - 2025-12-15

### Initial Release
First public version of DNSBunch - DNS Analysis & Mail Server Diagnostics tool.

**Features:**
- 18 DNS record type checks (NS, SOA, A, AAAA, MX, TXT, SPF, DMARC, DKIM, CAA, etc.)
- Domain status checking
- WWW subdomain analysis with CNAME chain resolution
- DNSSEC validation
- AXFR zone transfer testing
- Modern Next.js 15 + React 19 frontend
- Flask backend with CSRF protection and rate limiting
- Support for Normal (table) and Advanced (accordion) views

**Technologies:**
- Frontend: Next.js 15.4.6, React 19, Material-UI 7, TypeScript 5.9
- Backend: Python 3.x, Flask 2.3.3, dnspython 2.4.2
- Security: CSRF tokens, rate limiting (50 req/5min), input validation

---

## Links
- **GitHub:** [DNSBunch Repository](https://github.com/yourusername/dnsbunch)
- **Live Demo:** [https://dnsbunch.com](https://dnsbunch.com)
- **Documentation:** See README.md for setup and usage

---

**Maintained by:** Nomad Programmer  
**License:** MIT

### Added - Core Features

#### DNS Record Checks (18 types)
- Domain Status Check - Detect suspended/expired/parked domains
- NS (Nameserver) Records - Parent delegation and domain NS validation
- SOA (Start of Authority) - Serial number, timing validation
- A (IPv4) Records - Root and www subdomain
- AAAA (IPv6) Records - IPv6 address validation
- MX (Mail Exchange) - Mail server priority and resolution
- SPF (Sender Policy Framework) - Email authentication
- TXT Records - All text records with categorization
- CNAME Records - Canonical name validation
- PTR (Reverse DNS) - Reverse lookups for mail servers
- CAA Records - Certificate Authority Authorization
- DMARC - Email authentication policy
- DKIM - DomainKeys Identified Mail
- Glue Records - In-bailiwick nameserver glue validation
- DNSSEC - DNS Security Extensions validation
- AXFR - Zone transfer security check
- Wildcard Records - Wildcard DNS detection
- WWW Records - Comprehensive www subdomain analysis with CNAME chain

#### Frontend Features
- Modern React 18 with TypeScript
- Material-UI v5 components
- Responsive mobile-first design
- Domain search with real-time validation
- Two result display modes: Normal and Advanced
- Categorized results display:
  - DNS Foundation (NS, SOA, A, AAAA)
  - Website & Content (CNAME, TXT, Wildcard, WWW)
  - Email & Communication (MX, SPF, DMARC, DKIM, PTR)
  - Security & Protection (DNSSEC, CAA, AXFR)
  - Performance & Optimization (Glue records)
- Visual status indicators (Pass/Warning/Error/Info)
- URL-based domain search (e.g., /example.com)
- Clear error messages and recommendations

#### Backend Features
- Python Flask REST API
- Async DNS operations using dnspython
- Comprehensive DNS validation logic
- TLD parent server delegation checking
- Real nameserver IP resolution
- CSRF protection with JWT tokens
- Rate limiting (50 requests per 5 minutes)
- IP-based blocking for abuse prevention
- Multi-factor CSRF token binding (IP + User-Agent)
- CORS configuration for production deployment

#### Security Features
- CSRF token generation and validation
- JWT-based secure tokens
- Rate limiting per IP address
- Request validation and sanitization
- Domain format validation
- Suspicious pattern detection
- User-Agent and Origin validation
- IP reputation checking

#### Deployment
- Frontend: Netlify-ready with netlify.toml
- Backend: Render.com-ready with render.yaml
- Environment-based configuration
- Production CORS settings
- Gunicorn WSGI server support

### Documentation
- Comprehensive README.md
- API documentation
- Quick start guide
- Deployment instructions
- Security considerations
- Browser compatibility list
- Sample API output examples

### Design
- Clean, modern UI with Material-UI
- Blue color scheme (#1976d2 primary)
- Responsive layout for all screen sizes
- Intuitive domain search form
- Clear status indicators with color coding
- Footer with GitHub link

### Technical Stack
- Frontend: React 18, Next.js 14, TypeScript, Material-UI 7, Axios
- Backend: Python 3.9+, Flask 2.3, dnspython 2.4, PyJWT 2.8
- Infrastructure: Netlify (frontend), Render.com (backend)
- Version Control: Git/GitHub

---

## Version Numbering

DNSBunch follows Semantic Versioning (SemVer):

- **MAJOR** version (X.0.0): Incompatible API changes
- **MINOR** version (0.X.0): New features, backward compatible
- **PATCH** version (0.0.X): Bug fixes, backward compatible

### Current Phase: Early Development (0.0.x)
During the 0.0.x phase:
- Rapid iteration and improvements
- API may change without notice
- Focus on feature parity with industry standards
- User feedback actively incorporated

### Planned Milestones
- **0.1.0**: Feature complete with IntoDNS parity
- **0.5.0**: Additional features (export, history, comparison)
- **1.0.0**: Stable API, production-ready, full documentation

---

## Links

- **GitHub Repository**: https://github.com/ProgrammerNomad/DNSBunch
- **Bug Tracker**: See BUGFIXES.md
- **Documentation**: See README.md
- **Developer**: [ProgrammerNomad](https://github.com/ProgrammerNomad)

---

**Note**: Dates use ISO 8601 format (YYYY-MM-DD). All times are in UTC.
