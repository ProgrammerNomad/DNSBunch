import axios from 'axios';

// Configure the base URL for API calls
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds timeout for DNS checks
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - DNS check took too long');
    }
    
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error || 'Server error occurred';
      throw new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Unable to connect to DNS service');
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

export const dnsService = {
  /**
   * Check health of the API service
   */
  async checkHealth() {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Perform DNS checks on a domain
   * @param {string} domain - The domain to check
   * @param {string[]} checks - Array of check types to perform (optional)
   */
  async checkDomain(domain, checks = ['all']) {
    try {
      const response = await api.post('/api/check', {
        domain,
        checks
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default api;
