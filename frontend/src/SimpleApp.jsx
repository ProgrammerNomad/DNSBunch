import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { dnsService } from './services/api';

// Create QueryClient for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function SimpleApp() {
  const [apiStatus, setApiStatus] = useState('checking');
  const [error, setError] = useState('');

  // Check API health on component mount
  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      await dnsService.checkHealth();
      setApiStatus('healthy');
    } catch (error) {
      console.error('API health check failed:', error);
      setApiStatus('unhealthy');
      setError(error.message);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>🔍 DNSBunch</h1>
        <p>DNS & Mail Server Diagnostics</p>
        
        {apiStatus === 'checking' && (
          <div style={{ color: 'blue' }}>
            ⏳ Checking API service status...
          </div>
        )}
        
        {apiStatus === 'healthy' && (
          <div style={{ color: 'green' }}>
            ✅ API Service is healthy
          </div>
        )}
        
        {apiStatus === 'unhealthy' && (
          <div style={{ color: 'red' }}>
            ❌ API Service unavailable: {error}
          </div>
        )}
        
        <ToastContainer />
      </div>
    </QueryClientProvider>
  );
}

export default SimpleApp;
