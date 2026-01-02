# Changelog

All notable changes to DNSBunch will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.0.2] - 2026-01-02 (COMPLETED)

### Focus
Alignment with IntoDNS industry standards and enhanced check granularity.

**Status:** Backend and Frontend implementations complete. Both servers running successfully.

### Changed
- Updated project version from 0.0.1 to 0.0.2
- Enhanced NS section to match IntoDNS check structure (COMPLETED)
- Improved SOA validation with individual check items (COMPLETED)
- Enhanced MX validation with separate checks (COMPLETED)
- Better error severity classification (ERROR vs WARNING)

### Added
- Created BUGFIXES.md for detailed bug tracking
- Created CHANGELOG.md for version history
- **NS Section Enhancements:**
  - Recursive Queries check - Security validation
  - Same Class check - Verify all NS are class IN
  - Different subnets check - Geographic distribution validation
  - DNS servers responded check - Individual reachability tests
  - Multiple nameservers count validation
- **SOA Section Enhancements:**
  - Individual SOA record display
  - SOA serial consistency check across nameservers
  - SOA REFRESH interval validation
  - SOA RETRY interval validation
  - SOA EXPIRE time validation
  - SOA MINIMUM (negative cache TTL) validation
- **MX Section Enhancements:**
  - MX Records info display
  - MX name validity check
  - Number of MX records validation
  - MX CNAME check (RFC 2181 compliance)
  - Duplicate priority detection

### Frontend Improvements
- Updated DNSResultsTable to dynamically render checks from backend
- NS, SOA, and MX sections now display all individual check items
- Each check renders with its own status icon and detailed message
- Support for both Normal (table) and Advanced (accordion) views
- Improved check detail display with formatted JSON for complex data
- Better error message presentation with color-coded backgrounds

### Fixed
- NS record mismatch now correctly shows as ERROR (was WARNING)
- Parent delegation comparison logic improved
- Frontend now dynamically renders individual check items from backend
- Normal and Advanced result formats both support new granular checks
- Status icons correctly reflect error severity (pass/warning/error/info)

### Documentation
- Added comprehensive bug analysis comparing IntoDNS vs DNSBunch
- Documented 7 critical issues for improvement
- Created implementation checklist for v0.0.2

### Technical Improvements
- Backend check granularity increased to match industry standards
- Frontend prepared for displaying multiple individual checks per category

---

## [0.0.1] - 2025-12-15

### Initial Release
First public version of DNSBunch - DNS Analysis & Mail Server Diagnostics tool.

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
