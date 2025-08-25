'use client';

import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Import types from the central types file
import { DNSAnalysisResult } from '../types/dns';

// API Configuration - Direct backend calls for Netlify deployment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const REQUEST_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000');

class DNSApi {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (responseError) => {
        console.error('API Error:', responseError);
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
        const responseData = apiError.response?.data;
        
        // Handle rate limiting specifically
        if (apiError.response?.status === 429 && responseData?.code === 'RATE_LIMITED') {
          const retryAfter = responseData.retry_after || 60;
          throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(retryAfter / 60)} minutes before trying again.`);
        }
        
        const message = responseData?.error || apiError.message;
        throw new Error(`DNS analysis failed: ${message}`);
      }
      throw new Error('Unknown error occurred during DNS analysis');
    }
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await this.client.get('/');
      return response.data;
    } catch {
      throw new Error('Health check failed');
    }
  }
}

// Export singleton instance
export const dnsApi = new DNSApi();
export default dnsApi;

// Re-export types
export type { DNSAnalysisResult } from '../types/dns';
