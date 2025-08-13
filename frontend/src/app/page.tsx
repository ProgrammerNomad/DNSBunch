'use client';

import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Chip,
  Stack,
  Alert,
  AlertTitle
} from '@mui/material';
import { 
  Dns as DnsIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';

import { DomainSearchForm } from '@/components/DomainSearchForm';
import { DNSResults } from '@/components/DNSResults';
import { useDNSAnalysis } from '@/hooks/useDNSAnalysis';

export default function HomePage() {
  const {
    results,
    loading,
    error,
    searchDomain,
    clearResults
  } = useDNSAnalysis();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box textAlign="center" mb={6}>
        <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
          <DnsIcon sx={{ fontSize: 48, color: 'primary.main', mr: 2 }} />
          <Typography variant="h2" component="h1" fontWeight="bold" color="primary">
            DNSBunch
          </Typography>
        </Box>
        
        <Typography variant="h5" color="text.secondary" mb={3}>
          Comprehensive DNS & Mail Server Diagnostics
        </Typography>
        
        <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" mb={4}>
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
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <DomainSearchForm 
          onSearch={searchDomain}
          loading={loading}
          onClear={clearResults}
          hasResults={!!results}
        />
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Results Display */}
      {results && (
        <DNSResults 
          results={results}
          loading={loading}
        />
      )}

      {/* Footer */}
      <Box textAlign="center" mt={8} py={3} borderTop={1} borderColor="divider">
        <Typography variant="body2" color="text.secondary">
          DNSBunch - Professional DNS & Mail Server Diagnostics Tool
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Built with Next.js, Material-UI, and Python Flask
        </Typography>
      </Box>
    </Container>
  );
}
