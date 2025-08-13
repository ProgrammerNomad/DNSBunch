import axios from 'axios';

// Create axios instance with proxy configuration for Netlify
const api = axios.create({
  // Use relative URLs so requests go through Netlify proxy
  baseURL: '/api',
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making API request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API response from: ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.data || error.message);
    
    // Handle different error types
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Unable to connect to the DNS analysis server. Please ensure the backend is running.');
    }
    
    if (error.response?.status === 404) {
      throw new Error('API endpoint not found. Please check the server configuration.');
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

// DNS Analysis API functions
export const dnsApi = {
  /**
   * Analyze DNS records for a domain
   */
  analyzeDomain: async (domain: string): Promise<DNSAnalysisResult> => {
    const response = await api.post('/check', { domain });
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

// TypeScript interfaces for API responses
export interface DNSRecord {
  host?: string;
  ip?: string;
  type?: string;
  value?: string;
  priority?: number;
  target?: string;
  ttl?: number;
  ips?: Array<{ ip: string; type: string }>;
  [key: string]: unknown; // Allow additional properties
}

export interface CheckResult {
  status: 'pass' | 'warning' | 'error' | 'info';
  records: DNSRecord[] | Record<string, unknown>[] | Record<string, unknown>; // More flexible type to handle API variations
  issues: string[];
  count?: number;
  record?: string | Record<string, unknown>; // Single record for some check types
  [key: string]: unknown; // Allow additional properties
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
