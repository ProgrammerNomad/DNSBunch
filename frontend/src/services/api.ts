import axios from 'axios';
import csrfService from './csrf';

// Create axios instance with enhanced security
const api = axios.create({
  baseURL: '/api',
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'DNSBunch-Frontend/1.0.0',
    'X-Client-Version': '1.0.0',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true, // Important for CSRF protection
});

// Request rate limiting on frontend
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests = 5;
  private readonly windowMs = 60000; // 1 minute

  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }

  getRetryAfter(): number {
    if (this.requests.length === 0) return 0;
    const oldestRequest = Math.min(...this.requests);
    return Math.max(0, this.windowMs - (Date.now() - oldestRequest));
  }
}

const rateLimiter = new RateLimiter();

// Request interceptor with CSRF token injection
api.interceptors.request.use(
  async (config) => {
    // Client-side rate limiting
    if (!rateLimiter.canMakeRequest()) {
      const retryAfter = rateLimiter.getRetryAfter();
      throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(retryAfter / 1000)} seconds before trying again.`);
    }

    // Add CSRF token for protected requests
    if (config.method === 'post' || config.method === 'put' || config.method === 'delete') {
      try {
        const csrfToken = await csrfService.getToken();
        config.headers['X-CSRF-Token'] = csrfToken;
      } catch (error) {
        console.error('Failed to get CSRF token:', error);
        throw new Error('Security token unavailable. Please refresh the page.');
      }
    }

    // Add request fingerprinting
    config.headers['X-Request-ID'] = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`Making API request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor with CSRF handling
api.interceptors.response.use(
  (response) => {
    // Check if server wants us to refresh CSRF token
    if (response.headers['x-csrf-refresh-required']) {
      csrfService.handleRefreshRequired();
    }

    console.log(`API response from: ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.data || error.message);
    
    // Handle CSRF errors
    if (error.response?.status === 403) {
      const errorData = error.response.data;
      if (errorData?.code === 'CSRF_TOKEN_MISSING' || errorData?.code === 'CSRF_TOKEN_INVALID') {
        csrfService.handleRefreshRequired();
        throw new Error('Security token expired. Please refresh the page and try again.');
      }
      throw new Error('Access denied. Please refresh the page and try again.');
    }
    
    // Handle rate limiting
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 60;
      throw new Error(`Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`);
    }
    
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Unable to connect to the DNS analysis server. Please check your connection.');
    }
    
    if (error.response?.status === 404) {
      throw new Error('API endpoint not found.');
    }
    
    if (error.response?.status >= 500) {
      throw new Error('Server error occurred. Please try again later.');
    }
    
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    
    throw new Error(error.message || 'An unexpected error occurred');
  }
);

// Input validation functions
function validateDomain(domain: string): void {
  if (!domain || typeof domain !== 'string') {
    throw new Error('Domain is required and must be a string');
  }
  
  if (domain.length > 253) {
    throw new Error('Domain name is too long');
  }
  
  const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!domainPattern.test(domain)) {
    throw new Error('Invalid domain format');
  }
  
  // Block suspicious domains
  const suspiciousPatterns = ['localhost', '127.0.0.1', 'test.test', 'example.example'];
  if (suspiciousPatterns.some(pattern => domain.includes(pattern))) {
    throw new Error('This domain is not allowed for analysis');
  }
}

function validateChecks(checks: string[]): void {
  if (!Array.isArray(checks)) {
    throw new Error('Checks must be an array');
  }
  
  const validChecks = [
    'ns', 'soa', 'a', 'aaaa', 'mx', 'spf', 'txt', 'cname',
    'ptr', 'caa', 'dmarc', 'dkim', 'glue', 'dnssec', 'axfr', 'wildcard'
  ];
  
  const invalidChecks = checks.filter(check => !validChecks.includes(check));
  if (invalidChecks.length > 0) {
    throw new Error(`Invalid check types: ${invalidChecks.join(', ')}`);
  }
}

// DNS Analysis API functions
export const dnsApi = {
  /**
   * Analyze DNS records for a domain with specific checks
   */
  analyzeDomain: async (domain: string, checks: string[] = []): Promise<DNSAnalysisResult> => {
    // Validate inputs
    validateDomain(domain);
    validateChecks(checks);
    
    const payload: { domain: string; checks?: string[] } = { 
      domain: domain.toLowerCase().trim() 
    };
    
    // Only send checks array if specific checks are requested
    if (checks.length > 0) {
      payload.checks = checks;
      console.log('Sending DNS analysis request with specific checks:', payload);
    } else {
      console.log('Sending DNS analysis request for all checks:', payload);
    }
    
    const response = await api.post('/check', payload);
    return response.data;
  },

  /**
   * Health check for the API
   */
  healthCheck: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await api.get('/');
    return response.data;
  },
};

// TypeScript interfaces
export interface DNSRecord {
  host?: string;
  ip?: string;
  type?: string;
  value?: string;
  priority?: number;
  target?: string;
  ttl?: number;
  ips?: Array<{ ip: string; type: string }>;
  [key: string]: unknown;
}

export interface CheckResult {
  status: 'pass' | 'warning' | 'error' | 'info';
  records: DNSRecord[] | Record<string, unknown>[] | Record<string, unknown>;
  issues: string[];
  count?: number;
  record?: string | Record<string, unknown>;
  [key: string]: unknown;
}

export interface DNSAnalysisResult {
  domain: string;
  status: string;
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

export default api;
