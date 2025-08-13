'use client';

import { useState } from 'react';
import { Container, Typography, Box, Stack, Chip, Alert, AlertTitle } from '@mui/material';
import { 
  Dns as DnsIcon, 
  Security as SecurityIcon, 
  Speed as SpeedIcon, 
  Check as CheckIcon 
} from '@mui/icons-material';

import { DomainSearchForm } from '../components/DomainSearchForm';
import { DNSResults } from '../components/DNSResults';
import { Footer } from '../components/Footer';
import { useDNSAnalysis } from '../hooks/useDNSAnalysis';

export default function HomePage() {
  const { results, loading, error, searchDomain, clearResults } = useDNSAnalysis();
  const [resultType, setResultType] = useState<'normal' | 'advanced'>('normal');

  const handleSearch = async (domain: string, checks: string[], type: 'normal' | 'advanced') => {
    setResultType(type);
    await searchDomain(domain, checks);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}
        >
          DNSBunch
        </Typography>
        
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Comprehensive DNS Analysis & Mail Server Diagnostics
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Analyze DNS records, check mail server configuration, and validate email security settings. 
          Get detailed reports with actionable recommendations.
        </Typography>
      </Box>

      {/* Feature highlights */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" useFlexGap>
          <Chip 
            icon={<DnsIcon />} 
            label="DNS Records" 
            variant="outlined" 
            color="primary" 
          />
          <Chip 
            icon={<SecurityIcon />} 
            label="SPF/DMARC/DKIM" 
            variant="outlined" 
            color="secondary" 
          />
          <Chip 
            icon={<SpeedIcon />} 
            label="Performance Analysis" 
            variant="outlined" 
            color="success" 
          />
          <Chip 
            icon={<CheckIcon />} 
            label="Mail Server Check" 
            variant="outlined" 
            color="info" 
          />
        </Stack>
      </Box>

      {/* Features Alert */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <AlertTitle>Comprehensive DNS Analysis</AlertTitle>
        Analyze NS, SOA, MX, A, AAAA, CNAME, TXT records. Check SPF, DMARC, DKIM configuration. 
        Perform mail server diagnostics and DNS propagation analysis.
      </Alert>

      {/* Search Form */}
      <DomainSearchForm 
        onSearch={handleSearch}
        loading={loading} 
        error={error} 
      />

      {/* Results */}
      {results && (
        <DNSResults 
          data={results} 
          resultType={resultType}
          onClear={clearResults} 
        />
      )}

      {/* Footer */}
      <Footer />
    </Container>
  );
}
