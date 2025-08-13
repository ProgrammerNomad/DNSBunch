'use client';

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { csrfService } from './csrf';

// Import types from the central types file
import { DNSAnalysisResult } from '../types/dns';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const REQUEST_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000');

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
        } catch (err) {
          console.warn('Failed to get CSRF token:', err);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 403 && error.response?.data?.message?.includes('CSRF')) {
          csrfService.handleRefreshRequired();
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Check domain DNS records
   */
  async checkDomain(domain: string, checks: string[] = []): Promise<DNSAnalysisResult> {
    try {
      const response: AxiosResponse<DNSAnalysisResult> = await this.client.post('/api/check-domain', {
        domain,
        checks: checks.length > 0 ? checks : undefined
      });

      return response.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.error || err.message;
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
    } catch (err) {
      throw new Error('Health check failed');
    }
  }
}

// Export singleton instance
export const dnsApi = new DNSApi();
export default dnsApi;

// Re-export types
export type { DNSAnalysisResult } from '../types/dns';
