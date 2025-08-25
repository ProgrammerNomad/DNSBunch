'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  InputAdornment,
  IconButton
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

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

export function DomainSearchForm({ onSearch, loading = false, error = null, initialDomain = '' }: DomainSearchFormProps) {
  const [domain, setDomain] = useState(initialDomain);
  const [resultType, setResultType] = useState<'normal' | 'advanced'>('normal');
  const [selectedChecks, setSelectedChecks] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [domainError, setDomainError] = useState<string | null>(null);
  const previousInitialDomainRef = useRef<string>('');

  // Update domain when initialDomain prop changes - always allow updates for better UX
  useEffect(() => {
    // Update domain if initialDomain changes (including from URL)
    if (initialDomain !== previousInitialDomainRef.current) {
      setDomain(initialDomain);
      previousInitialDomainRef.current = initialDomain;
      // Clear any existing error when setting initial domain
      setDomainError(null);
    }
  }, [initialDomain]);

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

  const handleClearDomain = () => {
    setDomain('');
    setDomainError(null);
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

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !loading && !domainError && domain.trim()) {
      handleSubmit(event as unknown as React.FormEvent);
    }
  };

  return (
    <Paper elevation={2} sx={{ px: '25%', py: 4 }}>
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Compact Domain Input + Button Row */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
            <TextField
              fullWidth
              label="Domain Name"
              placeholder="example.com"
              value={domain}
              onChange={handleDomainChange}
              onKeyPress={handleKeyPress}
              error={!!domainError}
              disabled={loading}
              size="medium"
              sx={{ 
                flex: 1,
                minWidth: { xs: '100%', sm: '200px' },
                mb: { xs: 1, sm: 0 }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: domain && (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClearDomain}
                      disabled={loading}
                      size="small"
                      sx={{ 
                        visibility: domain ? 'visible' : 'hidden',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading || !!domainError || !domain.trim()}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
              sx={{ 
                px: { xs: 2, sm: 3 },
                py: 1.75,
                minWidth: { xs: '100%', sm: '140px' },
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                  boxShadow: '0 6px 10px 2px rgba(33, 203, 243, .3)',
                },
                '&:disabled': {
                  background: 'rgba(0, 0, 0, 0.12)',
                  boxShadow: 'none',
                }
              }}
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </Button>
          </Box>

          {/* Domain Error Display */}
          {domainError && (
            <Alert severity="error" sx={{ py: 0.5 }}>
              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                {domainError}
              </Typography>
            </Alert>
          )}

          {/* Result Type Selection - More Compact */}
          <Box>
            <FormControl component="fieldset" size="small">
              <FormLabel component="legend" sx={{ mb: 0.5, fontSize: '0.875rem', fontWeight: 'bold' }}>
                Result Format
              </FormLabel>
              <RadioGroup
                row
                value={resultType}
                onChange={handleResultTypeChange}
                sx={{ gap: 2 }}
              >
                <FormControlLabel 
                  value="normal" 
                  control={<Radio disabled={loading} size="small" />} 
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'medium', fontSize: '0.875rem' }}>
                        Normal
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Table format
                      </Typography>
                    </Box>
                  }
                  disabled={loading}
                  sx={{ mr: 1 }}
                />
                <FormControlLabel 
                  value="advanced" 
                  control={<Radio disabled={loading} size="small" />} 
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'medium', fontSize: '0.875rem' }}>
                        Advanced
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Detailed analysis
                      </Typography>
                    </Box>
                  }
                  disabled={loading}
                />
              </RadioGroup>
            </FormControl>
          </Box>

          {/* Advanced Options - More Compact */}
          <Collapse in={resultType === 'advanced'}>
            <Box sx={{ mt: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend" sx={{ mb: 1, fontSize: '0.875rem', fontWeight: 'bold' }}>
                  DNS Checks (Optional - leave empty for all checks)
                </FormLabel>
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectAll}
                      onChange={handleSelectAllChange}
                      disabled={loading}
                      color="primary"
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
                      Select All
                    </Typography>
                  }
                  sx={{ mb: 1 }}
                  disabled={loading}
                />

                <FormGroup sx={{ ml: 1 }}>
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                    gap: 0.5
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
                            <Typography variant="body2" sx={{ fontWeight: 'medium', fontSize: '0.8rem' }}>
                              {type.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', lineHeight: 1.2 }}>
                              {type.description}
                            </Typography>
                          </Box>
                        }
                        sx={{ margin: 0, alignItems: 'flex-start' }}
                        disabled={loading}
                      />
                    ))}
                  </Box>
                </FormGroup>
              </FormControl>
            </Box>
          </Collapse>

          {/* Result Type Descriptions - More Compact */}
          <Box>
            {resultType === 'normal' && (
              <Alert severity="info" sx={{ py: 1 }}>
                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                  <strong>Normal Mode:</strong> Simple table format with pass/warning/error status. Perfect for quick domain health checks.
                </Typography>
              </Alert>
            )}
            
            {resultType === 'advanced' && (
              <Alert severity="info" sx={{ py: 1 }}>
                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                  <strong>Advanced Mode:</strong> Detailed analysis with categorized results, technical explanations, and actionable recommendations.
                </Typography>
              </Alert>
            )}
          </Box>

          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ py: 1 }}>
              <Typography variant="body2">
                {error}
              </Typography>
            </Alert>
          )}
        </Box>
      </form>
    </Paper>
  );
}
