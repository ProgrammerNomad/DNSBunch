'use client';

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { csrfService } from './csrf';

// Import types from the central types file
import { DNSAnalysisResult } from '../types/dns';

// API Configuration - NO FALLBACKS, must be set in environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const REQUEST_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000');

// Validate required environment variables
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is required');
}

class DNSApi {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: REQUEST_TIMEOUT,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Request interceptor to add CSRF token
    this.client.interceptors.request.use(
      async (config) => {
        try {
          const token = await csrfService.getToken();
          if (token) {
            config.headers['X-CSRF-Token'] = token;
          }
        } catch (csrfError) {
          console.warn('Failed to get CSRF token:', csrfError);
        }
        return config;
      },
      (requestError) => {
        return Promise.reject(requestError);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (responseError) => {
        if (responseError.response?.status === 403 && responseError.response?.data?.message?.includes('CSRF')) {
          csrfService.handleRefreshRequired();
        }
        return Promise.reject(responseError);
      }
    );
  }

  /**
   * Check domain DNS records
   */
  async checkDomain(domain: string, checks: string[] = []): Promise<DNSAnalysisResult> {
    try {
      const response: AxiosResponse<DNSAnalysisResult> = await this.client.post('/api/check', {
        domain,
        checks: checks.length > 0 ? checks : undefined
      });

      return response.data;
    } catch (apiError) {
      if (axios.isAxiosError(apiError)) {
        const message = apiError.response?.data?.error || apiError.message;
        throw new Error(`DNS analysis failed: ${message}`);
      }
      throw new Error('Unknown error occurred during DNS analysis');
    }
  }

  /**
   * Get CSRF token
   */
  async getCsrfToken(): Promise<string> {
    return await csrfService.getToken();
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await this.client.get('/api/health');
      return response.data;
    } catch (healthError) {
      throw new Error('Health check failed');
    }
  }
}

// Export singleton instance
export const dnsApi = new DNSApi();
export default dnsApi;

// Re-export types
export type { DNSAnalysisResult } from '../types/dns';
