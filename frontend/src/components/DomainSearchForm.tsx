'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Paper,
  Collapse,
  Alert,
  CircularProgress,
  AlertTitle
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

import { DomainSearchFormProps } from '../types/dns';

const DNS_RECORD_TYPES = [
  { id: 'ns', label: 'NS (Nameservers)', description: 'Nameserver records' },
  { id: 'soa', label: 'SOA (Start of Authority)', description: 'Domain authority information' },
  { id: 'a', label: 'A (IPv4)', description: 'IPv4 address records' },
  { id: 'aaaa', label: 'AAAA (IPv6)', description: 'IPv6 address records' },
  { id: 'mx', label: 'MX (Mail Exchange)', description: 'Mail server records' },
  { id: 'spf', label: 'SPF', description: 'Sender Policy Framework' },
  { id: 'txt', label: 'TXT', description: 'Text records' },
  { id: 'cname', label: 'CNAME', description: 'Canonical name records' },
  { id: 'ptr', label: 'PTR (Reverse DNS)', description: 'Reverse DNS lookups' },
  { id: 'caa', label: 'CAA', description: 'Certificate Authority Authorization' },
  { id: 'dmarc', label: 'DMARC', description: 'Email authentication policy' },
  { id: 'dkim', label: 'DKIM', description: 'DomainKeys Identified Mail' },
  { id: 'glue', label: 'Glue Records', description: 'Nameserver glue records' },
  { id: 'dnssec', label: 'DNSSEC', description: 'DNS Security Extensions' },
  { id: 'axfr', label: 'AXFR (Zone Transfer)', description: 'Zone transfer check' },
  { id: 'wildcard', label: 'Wildcard', description: 'Wildcard DNS records' }
];

export function DomainSearchForm({ onSearch, loading = false, error = null }: DomainSearchFormProps) {
  const [domain, setDomain] = useState('');
  const [resultType, setResultType] = useState<'normal' | 'advanced'>('normal');
  const [selectedChecks, setSelectedChecks] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [domainError, setDomainError] = useState<string | null>(null);

  const validateDomain = (value: string): boolean => {
    if (!value.trim()) {
      setDomainError('Domain name is required');
      return false;
    }

    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?)*$/;
    if (!domainRegex.test(value)) {
      setDomainError('Please enter a valid domain name');
      return false;
    }

    // Check for suspicious patterns
    const suspicious = ['localhost', '127.0.0.1', 'test.test', 'example.example'];
    if (suspicious.some(pattern => value.toLowerCase().includes(pattern))) {
      setDomainError('Please enter a real domain name');
      return false;
    }

    setDomainError(null);
    return true;
  };

  const handleDomainChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setDomain(value);
    
    if (value.trim()) {
      validateDomain(value);
    } else {
      setDomainError(null);
    }
  };

  const handleResultTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newResultType = event.target.value as 'normal' | 'advanced';
    setResultType(newResultType);
    
    // Clear selected checks when switching to normal mode
    if (newResultType === 'normal') {
      setSelectedChecks([]);
      setSelectAll(false);
    }
  };

  const handleCheckChange = (checkId: string) => {
    setSelectedChecks(prev => {
      const newChecks = prev.includes(checkId)
        ? prev.filter(id => id !== checkId)
        : [...prev, checkId];
      
      setSelectAll(newChecks.length === DNS_RECORD_TYPES.length);
      return newChecks;
    });
  };

  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedChecks([]);
      setSelectAll(false);
    } else {
      setSelectedChecks(DNS_RECORD_TYPES.map(type => type.id));
      setSelectAll(true);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateDomain(domain)) {
      return;
    }

    // For normal mode, run all checks
    const checksToRun = resultType === 'normal' ? [] : selectedChecks;
    onSearch(domain.trim().toLowerCase(), checksToRun, resultType);
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Domain Input */}
          <Box>
            <TextField
              fullWidth
              label="Domain Name"
              placeholder="example.com"
              value={domain}
              onChange={handleDomainChange}
              error={!!domainError}
              helperText={domainError || 'Enter a domain name to analyze'}
              disabled={loading}
              sx={{ mb: 2 }}
            />
          </Box>

          {/* Result Type Selection */}
          <Box>
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ mb: 1, fontWeight: 'bold' }}>
                Result Format
              </FormLabel>
              <RadioGroup
                row
                value={resultType}
                onChange={handleResultTypeChange}
              >
                <FormControlLabel 
                  value="normal" 
                  control={<Radio disabled={loading} />} 
                  label="Normal (Table Format)"
                  disabled={loading}
                />
                <FormControlLabel 
                  value="advanced" 
                  control={<Radio disabled={loading} />} 
                  label="Advanced (Detailed Analysis)"
                  disabled={loading}
                />
              </RadioGroup>
            </FormControl>
          </Box>

          {/* Advanced Options */}
          <Collapse in={resultType === 'advanced'}>
            <Box>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Select DNS Checks (Optional - leave empty for all checks)
                </FormLabel>
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectAll}
                      onChange={handleSelectAllChange}
                      disabled={loading}
                      color="primary"
                    />
                  }
                  label="Select All"
                  sx={{ mb: 1, fontWeight: 'bold' }}
                  disabled={loading}
                />

                <FormGroup sx={{ ml: 2 }}>
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                    gap: 1 
                  }}>
                    {DNS_RECORD_TYPES.map((type) => (
                      <FormControlLabel
                        key={type.id}
                        control={
                          <Checkbox
                            checked={selectedChecks.includes(type.id)}
                            onChange={() => handleCheckChange(type.id)}
                            disabled={loading}
                            size="small"
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {type.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {type.description}
                            </Typography>
                          </Box>
                        }
                        sx={{ margin: 0 }}
                        disabled={loading}
                      />
                    ))}
                  </Box>
                </FormGroup>
              </FormControl>
            </Box>
          </Collapse>

          {/* Result Type Descriptions */}
          <Box sx={{ mt: 2 }}>
            {resultType === 'normal' && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <AlertTitle>Normal Mode</AlertTitle>
                <Typography variant="body2">
                  Simple table format showing test results with pass/warning/error status. 
                  Perfect for quick domain health checks.
                </Typography>
              </Alert>
            )}
            
            {resultType === 'advanced' && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <AlertTitle>Advanced Mode</AlertTitle>
                <Typography variant="body2">
                  Detailed analysis with categorized results, technical explanations, 
                  and actionable recommendations for each DNS record type.
                </Typography>
              </Alert>
            )}
          </Box>

          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || !!domainError || !domain.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
            sx={{ 
              py: 1.5,
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
              }
            }}
          >
            {loading ? 'Analyzing...' : 'Analyze Domain'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
}
