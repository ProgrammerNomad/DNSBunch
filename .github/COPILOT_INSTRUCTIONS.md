# Copilot Instructions for DNSBunch

## Project Overview

DNSBunch is a comprehensive DNS analysis and mail server diagnostics tool built with React TypeScript frontend and Python Flask backend. The application provides detailed DNS record analysis, email security validation, and advanced security features including CSRF protection and rate limiting.

---

## What is DNSBunch?

DNSBunch is your all-in-one DNS and mail diagnostics platform with a modern, user-friendly interface. It performs deep DNS record lookups, evaluates records for standards and best practices, and returns a categorized report with plain-language explanations.

### Key Features
- **Modern UI**: Built with React 18 and Material-UI v5 for responsive, accessible experience
- **User-Friendly Explanations**: Complex DNS concepts explained in plain language for non-technical users
- **Comprehensive Analysis**: Checks 16+ DNS record types including DNSSEC, CAA, SPF, DMARC, and more
- **Categorized Results**: Results organized into logical categories (DNS Foundation, Website & Content, Email & Communication, Security & Protection, Performance & Optimization)
- **Visual Status Indicators**: Clear pass/warning/error/info status with color coding
- **Detailed Recommendations**: Actionable advice for fixing issues
- **No Registration Required**: Instant analysis without signup or data storage

---

## Project Functionality

### What DNSBunch Does
- Accepts a domain name as input through a modern web interface
- Performs **in-depth DNS and mail server analysis** using a variety of DNS record queries
- Analyzes nameserver delegation, record consistency, mail configuration, DNSSEC, zone transfer risks, and more
- Returns a **detailed, categorized report** for each DNS record type, showing values, issues, and best practice guidance
- Highlights **warnings and errors** for each aspect of DNS configuration and mail deliverability
- No login or signup required; no data is stored beyond the current check

---

## DNS Record Checks: Maximum Detail

Below is a complete list of DNS record types checked, **what information is returned for each**, and **the validations performed**:

### 1. **NS (Nameserver) Records**
- **Information Returned:** All authoritative nameservers for the domain, IPv4/IPv6 addresses, (Optional) geolocation
- **Checks:** Valid IPs, reachability, duplicates, parent/child delegation, no single point of failure
- **Implementation:** `_check_ns_records()` in `dns_checker.py`
- **Validation:** Minimum 2 nameservers, IP resolution, no duplicates

### 2. **SOA (Start of Authority) Record**
- **Information Returned:** Primary master nameserver, responsible email, serial, refresh, retry, expire, and minimum TTL values
- **Checks:** Exists, serial matches across nameservers, recommended values, valid email
- **Implementation:** `_check_soa_record()` in `dns_checker.py`
- **Validation:** Serial number consistency, reasonable TTL values, valid email format

### 3. **A (IPv4 Address) Records**
- **Information Returned:** All IPv4 addresses assigned to the domain (including root and www)
- **Checks:** Records exist, no private/reserved IPs, IPs reachable (optional ping)
- **Implementation:** `_check_a_records()` in `dns_checker.py`
- **Validation:** Public IP addresses, reachability testing, no RFC1918 addresses

### 4. **AAAA (IPv6 Address) Records**
- **Information Returned:** All IPv6 addresses assigned to the domain (including root and www)
- **Checks:** Records exist, no invalid/reserved blocks, IPs reachable (optional ping)
- **Implementation:** `_check_aaaa_records()` in `dns_checker.py`
- **Validation:** Valid IPv6 format, no reserved ranges, reachability testing

### 5. **MX (Mail Exchange) Records**
- **Information Returned:** List of all MX hosts, priorities, and resolved IPs
- **Checks:** Records exist, no duplicate/misprioritized entries, valid A/AAAA (no CNAME for MX), reachable targets
- **Implementation:** `_check_mx_records()` in `dns_checker.py`
- **Validation:** Priority ordering, A/AAAA resolution, no CNAME targets

### 6. **SPF (Sender Policy Framework)**
- **Information Returned:** SPF record (TXT type) value
- **Checks:** Exists, valid syntax, max 10 DNS lookups, no deprecated mechanisms
- **Implementation:** `_check_spf_record()` in `dns_checker.py`
- **Validation:** Syntax parsing, DNS lookup counting, mechanism validation

### 7. **TXT Records**
- **Information Returned:** All TXT records for the root domain
- **Checks:** Presence of SPF, DKIM, DMARC, valid syntax
- **Implementation:** `_check_txt_records()` in `dns_checker.py`
- **Validation:** Record format, special record identification

### 8. **CNAME (Canonical Name) Records**
- **Information Returned:** CNAMEs for key subdomains (e.g., www, mail)
- **Checks:** No CNAME at apex, chain length, target exists and resolves
- **Implementation:** `_check_cname_records()` in `dns_checker.py`
- **Validation:** Apex domain restrictions, chain resolution, target validation

### 9. **PTR (Reverse DNS) Records**
- **Information Returned:** PTR records for each mail server IP (MX targets)
- **Checks:** PTR exists, matches hostname, not generic
- **Implementation:** `_check_ptr_records()` in `dns_checker.py`
- **Validation:** Reverse resolution, hostname matching, generic detection

### 10. **CAA (Certification Authority Authorization) Records**
- **Information Returned:** List of CAA records
- **Checks:** Valid syntax, at least one CA allowed or none, no conflicts
- **Implementation:** `_check_caa_records()` in `dns_checker.py`
- **Validation:** Tag validation, CA authorization, conflict detection

### 11. **DMARC (Domain-based Message Authentication, Reporting & Conformance)**
- **Information Returned:** DMARC TXT record value
- **Checks:** Record exists, syntax valid, policy set, aligns with SPF/DKIM
- **Implementation:** `_check_dmarc_record()` in `dns_checker.py`
- **Validation:** Policy syntax, alignment settings, reporting configuration

### 12. **DKIM (DomainKeys Identified Mail)**
- **Information Returned:** DKIM selector records (user-provided or common)
- **Checks:** Record exists, valid syntax, key length
- **Implementation:** `_check_dkim_records()` in `dns_checker.py`
- **Validation:** Key format, cryptographic strength, selector discovery

### 13. **Glue Records**
- **Information Returned:** Presence and correctness of glue records for in-zone nameservers
- **Checks:** Glue present for all in-bailiwick nameservers, consistent
- **Implementation:** `_check_glue_records()` in `dns_checker.py`
- **Validation:** In-zone nameserver detection, glue consistency

### 14. **DNSSEC (Domain Name System Security Extensions)**
- **Information Returned:** DS, RRSIG, and other DNSSEC records if present
- **Checks:** Present, valid, consistent, not expired
- **Implementation:** `_check_dnssec()` in `dns_checker.py`
- **Validation:** Signature verification, key rollover, expiration checking

### 15. **Zone Transfer (AXFR)**
- **Information Returned:** AXFR status (open/closed)
- **Checks:** AXFR not allowed to unauthorized hosts
- **Implementation:** `_check_axfr()` in `dns_checker.py`
- **Validation:** Zone transfer attempts, vulnerability detection

### 16. **Wildcard Records**
- **Information Returned:** Detection of wildcard DNS entries
- **Checks:** Report if wildcards exist; warn if inappropriate
- **Implementation:** `_check_wildcard_records()` in `dns_checker.py`
- **Validation:** Wildcard detection, security implications

---

## Architecture Details

### Frontend Architecture (React + TypeScript + Next.js)
- **Framework**: Next.js 14 with App Router for modern routing and SSR capabilities
- **Language**: TypeScript with strict type checking and comprehensive interfaces
- **UI Library**: Material-UI (MUI) v5 for consistent, accessible design system
- **State Management**: React hooks with custom `useDNSAnalysis` hook for DNS operations
- **API Client**: Axios with CSRF token integration and comprehensive error handling
- **Form Management**: React Hook Form with Yup validation schemas
- **Styling**: Material-UI's sx prop system with responsive breakpoints

### Backend Architecture (Python Flask)
- **Framework**: Flask with async DNS operations using dnspython
- **DNS Library**: dnspython for comprehensive DNS query capabilities
- **Security**: Multi-layered security with CSRF protection, rate limiting, and input validation
- **Token Management**: JWT with HMAC-SHA256 signing for secure CSRF tokens
- **Deployment**: Gunicorn WSGI server for production environments
- **Rate Limiting**: In-memory store with Redis option for scaling

### Security Architecture
- **CSRF Protection**: Multi-factor token binding with IP and User-Agent fingerprinting
- **Rate Limiting**: IP-based limiting with progressive blocking mechanisms
- **Input Validation**: Domain format validation, suspicious pattern detection
- **Request Validation**: User-Agent, Origin, and Content-Type enforcement
- **Token Security**: Short-lived tokens with automatic refresh and usage counting

---

## Code Standards and Patterns

### TypeScript Guidelines
```typescript
// Comprehensive interface definitions
interface DNSAnalysisResult {
  domain: string;
  status: 'completed' | 'error';
  timestamp: string;
  checks: Record<string, CheckResult>;
  summary: AnalysisSummary;
}

// Strict type checking for DNS record types
const DNS_RECORD_TYPES = [
  'ns', 'soa', 'a', 'aaaa', 'mx', 'spf', 'txt', 'cname',
  'ptr', 'caa', 'dmarc', 'dkim', 'glue', 'dnssec', 'axfr', 'wildcard'
] as const;
type DNSRecordType = typeof DNS_RECORD_TYPES[number];

// Comprehensive error handling
try {
  const result = await dnsApi.analyzeDomain(domain, checks);
  return result;
} catch (error) {
  if (error instanceof Error) {
    throw new Error(`DNS analysis failed: ${error.message}`);
  }
  throw new Error('Unknown error occurred during DNS analysis');
}
```

### React Component Architecture
```typescript
// Proper component typing with comprehensive props
interface DNSResultsProps {
  data: DNSAnalysisResult;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onClear?: () => void;
}

export function DNSResults({ 
  data, 
  loading = false, 
  error = null,
  onRetry,
  onClear 
}: DNSResultsProps) {
  // Component implementation with proper error boundaries
}

// Custom hooks for state management
export function useDNSAnalysis() {
  const [results, setResults] = useState<DNSAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const searchDomain = async (domain: string, checks: string[] = []) => {
    // Implementation with comprehensive error handling
  };
  
  return { results, loading, error, searchDomain, clearResults };
}
```

### Material-UI Best Practices
```typescript
// Responsive design with theme breakpoints
sx={{
  display: 'grid',
  gridTemplateColumns: {
    xs: '1fr',
    sm: 'repeat(2, 1fr)',
    md: 'repeat(3, 1fr)',
    lg: 'repeat(4, 1fr)'
  },
  gap: { xs: 1, sm: 2, md: 3 },
  padding: { xs: 1, sm: 2, md: 3 }
}}

// Theme-based styling
sx={{
  bgcolor: 'primary.main',
  color: 'primary.contrastText',
  borderColor: 'divider',
  '&:hover': {
    bgcolor: 'primary.dark'
  }
}}
```

---

## Security Implementation Details

### CSRF Protection System
```typescript
// Multi-factor token binding
class CSRFService {
  private token: string | null = null;
  private expiresAt: number = 0;
  
  async getToken(): Promise<string> {
    if (!this.token || this.isTokenExpired()) {
      await this.refreshToken();
    }
    return this.token!;
  }
  
  private async refreshToken(): Promise<void> {
    // Secure token refresh with IP and User-Agent binding
  }
}

// Automatic CSRF token injection
api.interceptors.request.use(async (config) => {
  if (config.method === 'post' || config.method === 'put' || config.method === 'delete') {
    const csrfToken = await csrfService.getToken();
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});
```

### Backend Security Patterns
```python
# Comprehensive security decorators
@app.route('/api/check', methods=['POST'])
@rate_limit           # IP-based rate limiting
@validate_request     # Request validation (User-Agent, Origin, Content-Type)
@csrf_required        # CSRF token validation
def check_dns():
    # Secure DNS checking implementation
    pass

# Multi-factor CSRF token validation
def validate_token(self, token: str, client_ip: str, user_agent: str) -> bool:
    # IP binding, User-Agent fingerprinting, expiration checking
    # JWT signature verification, usage counting
    pass
```

### Input Validation Patterns
```python
# Domain validation
def validate_domain(domain: str) -> bool:
    if not domain or len(domain) > 253:
        return False
    
    # RFC-compliant domain validation
    pattern = r'^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$'
    return bool(re.match(pattern, domain))

# Suspicious pattern detection
suspicious_patterns = [
    'localhost', '127.0.0.1', '0.0.0.0', '10.', '192.168.', '172.',
    'test.test', 'example.example', 'admin', 'root', 'api'
]
```

---

## API Design and Implementation

### Request/Response Structure
```typescript
// Comprehensive API interfaces
interface DNSAnalysisRequest {
  domain: string;
  checks?: string[];  // Optional specific checks array
}

interface DNSAnalysisResult {
  domain: string;
  status: 'completed' | 'error';
  timestamp: string;
  checks: Record<string, CheckResult>;
  summary: {
    total: number;
    passed: number;
    warnings: number;
    errors: number;
    info: number;
  };
}

interface CheckResult {
  status: 'pass' | 'warning' | 'error' | 'info';
  records: DNSRecord[] | Record<string, unknown>[] | Record<string, unknown>;
  issues: string[];
  count?: number;
  record?: string | Record<string, unknown>;
  [key: string]: unknown;
}
```

### DNS Checker Implementation
```python
class DNSChecker:
    """Comprehensive DNS analysis engine"""
    
    def __init__(self, domain: str):
        self.domain = domain.lower().strip()
        self.resolver = dns.resolver.Resolver()
        self.resolver.timeout = 10
        self.resolver.lifetime = 30
    
    async def run_all_checks(self, requested_checks: List[str] = None) -> Dict[str, Any]:
        """Run DNS checks - all or specific ones"""
        all_check_types = [
            'ns', 'soa', 'a', 'aaaa', 'mx', 'spf', 'txt', 'cname',
            'ptr', 'caa', 'dmarc', 'dkim', 'glue', 'dnssec', 'axfr', 'wildcard'
        ]
        
        # Determine which checks to run
        checks_to_run = requested_checks if requested_checks else all_check_types
        
        # Execute checks with error handling
        for check_type in checks_to_run:
            try:
                if check_type == 'ns':
                    results['checks']['ns'] = await self._check_ns_records()
                elif check_type == 'soa':
                    results['checks']['soa'] = await self._check_soa_record()
                # ... other checks
            except Exception as e:
                results['checks'][check_type] = {
                    'status': 'error',
                    'records': [],
                    'issues': [f"Check failed: {str(e)}"]
                }
```

---

## File Organization and Project Structure

### Frontend Structure
```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with providers and theme
│   ├── page.tsx           # Main application page
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── DomainSearchForm.tsx   # Domain input form with validation
│   ├── DNSResults.tsx         # Results display with categorization
│   ├── ErrorBoundary.tsx      # Error handling component
│   └── Footer.tsx             # Application footer
├── services/              # External services and API clients
│   ├── api.ts             # Axios client with CSRF integration
│   └── csrf.ts            # CSRF token management service
├── hooks/                 # Custom React hooks
│   └── useDNSAnalysis.ts  # DNS analysis state management
├── theme/                 # Material-UI theme configuration
│   └── theme.ts           # Custom theme with responsive breakpoints
├── providers/             # Context providers
│   └── QueryProvider.tsx # React Query configuration
└── types/                 # TypeScript type definitions
    └── dns.ts             # DNS-related interfaces
```

### Backend Structure
```
backend/
├── app.py                 # Main Flask application with security
├── dns_checker.py         # DNS analysis engine with all checks
├── requirements.txt       # Python dependencies with versions
├── render.yaml           # Render deployment configuration
└── .env.example          # Environment variables template
```

---

## Testing Guidelines and Patterns

### Frontend Testing
```typescript
// Component testing with React Testing Library
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DomainSearchForm } from './DomainSearchForm';

describe('DomainSearchForm', () => {
  test('validates domain input correctly', async () => {
    const mockOnSearch = jest.fn();
    render(<DomainSearchForm onSearch={mockOnSearch} />);
    
    const input = screen.getByLabelText('Domain Name');
    fireEvent.change(input, { target: { value: 'invalid domain' } });
    
    await waitFor(() => {
      expect(screen.getByText('Invalid domain format')).toBeInTheDocument();
    });
  });
  
  test('submits form with selected checks', async () => {
    const mockOnSearch = jest.fn();
    render(<DomainSearchForm onSearch={mockOnSearch} />);
    
    // Test form submission logic
  });
});
```

### Backend Testing
```python
import pytest
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['CSRF_SECRET_KEY'] = 'test-key'
    with app.test_client() as client:
        yield client

def test_health_check(client):
    response = client.get('/')
    assert response.status_code == 200
    assert 'healthy' in response.get_json()['status']

def test_dns_check_with_csrf(client):
    # Get CSRF token
    token_response = client.get('/api/csrf-token')
    token = token_response.get_json()['csrf_token']
    
    # Make DNS check request
    response = client.post('/api/check', 
        json={'domain': 'example.com'},
        headers={'X-CSRF-Token': token}
    )
    assert response.status_code == 200
```

---

## Deployment Configuration

### Environment Variables
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://api2.dnsbunch.com
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_SITE_URL=https://www.dnsbunch.com
NODE_ENV=production

# Backend (production)
FLASK_ENV=production
FLASK_DEBUG=False
CORS_ORIGINS=https://www.dnsbunch.com,https://dnsbunch.com
CSRF_SECRET_KEY=<secure-random-32-char-key>
JWT_SECRET_KEY=<secure-random-32-char-key>
CSRF_TOKEN_EXPIRES=3600
CSRF_REFRESH_THRESHOLD=1800
RATE_LIMIT_REQUESTS=10
RATE_LIMIT_WINDOW=300
BLOCK_DURATION=3600
MAX_DOMAIN_LENGTH=253
```

### Build and Deployment Scripts
```json
// package.json scripts
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

### Netlify Configuration
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
  NEXT_PUBLIC_API_URL = "https://api2.dnsbunch.com"

# API Proxy with security headers
[[redirects]]
  from = "/api/*"
  to = "https://api2.dnsbunch.com/api/:splat"
  status = 200
  force = true
  headers = {X-Frame-Options = "DENY", X-Content-Type-Options = "nosniff"}
```

---

## Performance Optimization

### Frontend Optimization Strategies
- **Code Splitting**: Next.js automatic code splitting for optimal bundle sizes
- **Lazy Loading**: Component-level lazy loading for better initial load times
- **Material-UI Optimization**: Tree shaking and selective imports
- **Client-side Caching**: Session storage for CSRF tokens and result caching
- **Image Optimization**: Next.js Image component for responsive images
- **Bundle Analysis**: Regular bundle size monitoring and optimization

### Backend Optimization Techniques
- **Async DNS Operations**: Non-blocking DNS queries using asyncio
- **Connection Pooling**: Efficient DNS resolver connection management
- **Timeout Handling**: Proper timeouts to prevent hanging requests
- **Memory Management**: Efficient data structures for rate limiting
- **Caching Strategy**: In-memory caching with Redis option for scaling
- **Request Optimization**: Minimal data transfer and response compression

---

## Error Handling and Logging

### Frontend Error Handling
```typescript
// Error boundary implementation
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('DNS Analysis Error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### Backend Error Handling
```python
# Comprehensive error handling
@app.errorhandler(400)
def bad_request(error):
    return jsonify({
        'error': 'Invalid request format',
        'code': 'BAD_REQUEST'
    }), 400

@app.errorhandler(429)
def rate_limited(error):
    return jsonify({
        'error': 'Rate limit exceeded',
        'retry_after': 300,
        'code': 'RATE_LIMITED'
    }), 429

@app.errorhandler(403)
def forbidden(error):
    return jsonify({
        'error': 'Access denied - invalid CSRF token',
        'code': 'CSRF_TOKEN_INVALID'
    }), 403
```

---

## Browser Compatibility and Support

### Supported Browsers
- **Chrome 90+**: Full feature support with modern JavaScript
- **Firefox 88+**: Complete compatibility with all features
- **Safari 14+**: Full support including CSRF and modern APIs
- **Edge 90+**: Complete feature compatibility
- **Mobile browsers**: iOS Safari 14+, Chrome Mobile 90+

### Progressive Enhancement
- **Core functionality**: Works on all supported browsers
- **Enhanced features**: Modern APIs with fallbacks
- **Responsive design**: Mobile-first approach with breakpoints
- **Accessibility**: WCAG 2.1 AA compliance with screen reader support

---

## Security Best Practices

### Frontend Security Checklist
- [ ] CSRF tokens in all POST/PUT/DELETE requests
- [ ] Input validation on all user inputs
- [ ] XSS protection in dynamic content rendering
- [ ] Secure HTTP headers configuration
- [ ] No sensitive data in client-side storage
- [ ] Content Security Policy implementation
- [ ] HTTPS enforcement with HSTS headers

### Backend Security Checklist
- [ ] Rate limiting with progressive blocking
- [ ] Comprehensive input sanitization and validation
- [ ] CORS configuration for specific allowed origins
- [ ] Error messages don't leak sensitive information
- [ ] Security headers in all responses
- [ ] JWT token security with proper signing
- [ ] IP-based request tracking and blocking

---

## Development Workflow

### Git Workflow and Standards
```bash
# Branch naming conventions
feature/csrf-token-implementation
fix/dns-timeout-handling
docs/api-documentation-update
refactor/component-optimization
test/comprehensive-testing-suite

# Commit message format
feat: implement CSRF protection with multi-factor binding
fix: resolve DNS timeout issues in AXFR checks
docs: update API documentation with security details
refactor: optimize DNS checker performance
test: add comprehensive component testing
```

### Code Review Guidelines
#### Frontend Review Points
- TypeScript usage and comprehensive type safety
- Component reusability and proper composition
- Performance implications and optimization
- Accessibility considerations and WCAG compliance
- Security best practices and CSRF implementation
- Material-UI best practices and responsive design

#### Backend Review Points
- Input validation and comprehensive sanitization
- Error handling and proper logging
- Security implications and CSRF validation
- Performance and scalability considerations
- API design consistency and documentation
- DNS analysis accuracy and completeness

---

## Troubleshooting Common Issues

### CSRF Token Issues
```javascript
// Browser shows "Refused to set unsafe header User-Agent"
// This is normal - browsers block User-Agent header modification
// Solution: Remove User-Agent from axios headers for browser requests

// CSRF token expired errors
// Solution: Implement automatic token refresh on 403 responses
if (error.response?.status === 403 && error.response?.data?.code === 'CSRF_TOKEN_INVALID') {
  await csrfService.refreshToken();
  // Retry the request
}
```

### DNS Analysis Issues
```python
# Timeout handling for slow DNS servers
try:
    answer = await asyncio.wait_for(
        self.resolver.resolve(domain, record_type),
        timeout=10
    )
except asyncio.TimeoutError:
    return {
        'status': 'error',
        'issues': ['DNS query timeout - server may be slow or unreachable']
    }
```

### Rate Limiting Issues
```python
# Handle rate limit violations gracefully
if len(requests) >= RATE_LIMIT_REQUESTS:
    blocked_ips[client_ip] = current_time + BLOCK_DURATION
    return jsonify({
        'error': f'Rate limit exceeded: {RATE_LIMIT_REQUESTS} requests per {RATE_LIMIT_WINDOW} seconds',
        'retry_after': BLOCK_DURATION
    }), 429
```

Remember to always prioritize security, performance, and user experience when making changes to the DNSBunch codebase. The project implements comprehensive security measures including CSRF protection, rate limiting, and input validation to ensure safe operation while providing detailed DNS analysis capabilities.
