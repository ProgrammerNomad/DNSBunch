'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Container, Box, Typography, Alert, CircularProgress } from '@mui/material';
import { useSearchParams } from 'next/navigation';

import { DomainSearchForm } from '../components/DomainSearchForm';
import { DNSResultsTable } from '../components/DNSResultsTable';
import { DNSResultsAdvanced } from '../components/DNSResultsAdvanced';
import { Footer } from '../components/Footer';
import { dnsApi } from '../services/api';
import { DNSAnalysisResult } from '../types/dns';

function HomePageContent() {
  const [results, setResults] = useState<DNSAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchDomain, setLastSearchDomain] = useState<string>('');
  const [resultFormat, setResultFormat] = useState<'normal' | 'advanced'>('normal');
  
  const searchParams = useSearchParams();

  // Function to extract domain from URL or validate if it's already a domain
  const extractDomainFromUrl = (input: string): string | null => {
    try {
      // Remove any leading/trailing whitespace
      input = input.trim();
      
      // If it starts with http/https, extract the hostname
      if (input.startsWith('http://') || input.startsWith('https://')) {
        const url = new URL(input);
        return url.hostname;
      }
      
      // If it looks like a domain (contains dots and valid characters)
      if (/^[a-zA-Z0-9][a-zA-Z0-9-_.]*[a-zA-Z0-9]$/.test(input) && input.includes('.')) {
        return input;
      }
      
      return null;
    } catch {
      return null;
    }
  };

  // Handle URL parameter on component mount and when search params change
  useEffect(() => {
    const domainParam = searchParams.get('domain');
    
    if (domainParam) {
      const extractedDomain = extractDomainFromUrl(domainParam);
      if (extractedDomain && extractedDomain !== lastSearchDomain) {
        // Auto-trigger search for the domain from URL
        handleSearch(extractedDomain, [], 'normal');
      }
    }
  }, [searchParams]); // Remove lastSearchDomain and handleSearch from dependencies to avoid infinite loops

  const handleSearch = async (domain: string, checks: string[], format: 'normal' | 'advanced') => {
    setLoading(true);
    setError(null);
    setResults(null);
    setLastSearchDomain(domain);
    setResultFormat(format);

    // Update URL to path-based format for clean sharing URLs
    // Use replaceState to update URL without triggering navigation
    window.history.replaceState({}, '', `/${encodeURIComponent(domain)}`);

    try {
      const data = await dnsApi.checkDomain(domain, checks);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults(null);
    setError(null);
    setLastSearchDomain('');
    
    // Clear the path-based URL and return to home
    window.history.replaceState({}, '', '/');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ 
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 2
        }}>
          DNSBunch
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          DNS Analysis & Mail Server Diagnostics
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
          Comprehensive DNS record analysis, mail server diagnostics, and email security validation tool. 
          Check SPF, DMARC, DKIM, and more with detailed explanations.
        </Typography>
      </Box>

      {/* Search Form */}
      <DomainSearchForm 
        onSearch={handleSearch} 
        loading={loading} 
        error={error}
        initialDomain={lastSearchDomain}
      />

      {/* Results */}
      <Box sx={{ flex: 1 }}>
        {results && (
          <>
            {resultFormat === 'normal' ? (
              <DNSResultsTable 
                results={results} 
                domain={lastSearchDomain}
              />
            ) : (
              <DNSResultsAdvanced 
                results={results} 
                domain={lastSearchDomain}
                onClear={clearResults}
              />
            )}
          </>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Analysis Failed
            </Typography>
            <Typography variant="body2">
              {error}
            </Typography>
          </Alert>
        )}
      </Box>

      {/* Footer */}
      <Footer />
    </Container>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <Container maxWidth="xl" sx={{ py: 4, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={40} />
      </Container>
    }>
      <HomePageContent />
    </Suspense>
  );
}
