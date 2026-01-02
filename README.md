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
- TLD Parent Check  
- Your nameservers are listed
- DNS Parent sent Glue
- Nameservers A records

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

## Documentation

- **[CHANGELOG.md](CHANGELOG.md)** - Version history and updates
- **[API Documentation](docs/API.md)** - Complete API reference with examples
- **[DNS Records Guide](docs/DNS_RECORDS.md)** - Detailed DNS record type documentation

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

MIT License - Free to use, modify, and distribute. See [LICENSE](LICENSE) file for details.

---

## Support

- **Questions**: [GitHub Discussions](https://github.com/ProgrammerNomad/DNSBunch/discussions)
- **Bugs**: [GitHub Issues](https://github.com/ProgrammerNomad/DNSBunch/issues)
- **Security**: Contact maintainer directly

---

**Made by the open source community**

*DNSBunch - Free DNS Diagnostics for Everyone*
