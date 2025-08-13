'use client';

import React, { useState } from 'react';
import { Container, Box, Typography, Alert } from '@mui/material';

import { DomainSearchForm } from '../components/DomainSearchForm';
import { DNSResultsTable } from '../components/DNSResultsTable';
import { DNSResultsAdvanced } from '../components/DNSResultsAdvanced';
import { Footer } from '../components/Footer';
import { dnsApi } from '../services/api';
import { DNSAnalysisResult } from '../types/dns';

export default function HomePage() {
  const [results, setResults] = useState<DNSAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchDomain, setLastSearchDomain] = useState<string>('');
  const [resultFormat, setResultFormat] = useState<'normal' | 'advanced'>('normal');

  const handleSearch = async (domain: string, checks: string[], format: 'normal' | 'advanced') => {
    setLoading(true);
    setError(null);
    setResults(null);
    setLastSearchDomain(domain);
    setResultFormat(format);

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
