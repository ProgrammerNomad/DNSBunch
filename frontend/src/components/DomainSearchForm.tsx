'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Typography,
  CircularProgress,
  Box,
  Chip
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Clear as ClearIcon,
  SelectAll as SelectAllIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';

// Validation schema
const schema = yup.object({
  domain: yup
    .string()
    .required('Domain is required')
    .matches(
      /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/,
      'Please enter a valid domain name'
    )
    .max(253, 'Domain name is too long'),
});

// Component props interface
interface DomainSearchFormProps {
  onSearch: (domain: string, checks: string[]) => void;
  loading?: boolean;
  onClear?: () => void;
  hasResults?: boolean;
}

export function DomainSearchForm({ 
  onSearch, 
  loading, 
  onClear, 
  hasResults = false 
}: DomainSearchFormProps) {
  const [selectedChecks, setSelectedChecks] = useState(['all']);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      domain: ''
    }
  });

  const availableChecks = [
    { value: 'all', label: 'All Checks', category: 'general' },
    { value: 'ns', label: 'Nameservers (NS)', category: 'basic' },
    { value: 'soa', label: 'Start of Authority (SOA)', category: 'basic' },
    { value: 'a', label: 'IPv4 Addresses (A)', category: 'basic' },
    { value: 'aaaa', label: 'IPv6 Addresses (AAAA)', category: 'basic' },
    { value: 'mx', label: 'Mail Exchange (MX)', category: 'email' },
    { value: 'spf', label: 'SPF Records', category: 'email' },
    { value: 'dmarc', label: 'DMARC Records', category: 'email' },
    { value: 'dkim', label: 'DKIM Records', category: 'email' },
    { value: 'txt', label: 'TXT Records', category: 'advanced' },
    { value: 'cname', label: 'CNAME Records', category: 'basic' },
    { value: 'ptr', label: 'PTR (Reverse DNS)', category: 'advanced' },
    { value: 'caa', label: 'CAA Records', category: 'security' },
    { value: 'dnssec', label: 'DNSSEC', category: 'security' },
    { value: 'axfr', label: 'Zone Transfer (AXFR)', category: 'advanced' },
    { value: 'wildcard', label: 'Wildcard Records', category: 'advanced' },
    { value: 'glue', label: 'Glue Records', category: 'advanced' }
  ];

  const categories = {
    general: { name: 'General', color: 'primary' as const },
    basic: { name: 'Basic DNS', color: 'info' as const },
    email: { name: 'Email Security', color: 'secondary' as const },
    security: { name: 'Security', color: 'success' as const },
    advanced: { name: 'Advanced', color: 'warning' as const }
  };

  const handleCheckChange = (checkValue: string) => {
    if (checkValue === 'all') {
      setSelectedChecks(['all']);
    } else {
      setSelectedChecks(prev => {
        const newChecks = prev.filter(check => check !== 'all');
        if (newChecks.includes(checkValue)) {
          return newChecks.filter(check => check !== checkValue);
        } else {
          return [...newChecks, checkValue];
        }
      });
    }
  };

  const onSubmit = (data: { domain: string }) => {
    const checksToSend = selectedChecks.includes('all') 
      ? availableChecks.map(check => check.value).filter(check => check !== 'all')
      : selectedChecks;
    
    onSearch(data.domain.toLowerCase().trim(), checksToSend);
  };

  const handleClear = () => {
    reset();
    setSelectedChecks(['all']);
    onClear?.();
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
        DNS & Mail Server Analysis
      </Typography>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Domain Input and Buttons Row */}
        <Box 
          display="flex" 
          gap={2} 
          alignItems="flex-start"
          flexWrap={{ xs: 'wrap', sm: 'nowrap' }}
          sx={{ mb: 2 }}
        >
          {/* Domain Input */}
          <Controller
            name="domain"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Domain Name"
                placeholder="example.com"
                variant="outlined"
                fullWidth
                error={!!errors.domain}
                helperText={errors.domain?.message}
                disabled={loading}
                sx={{ flex: 1, flexShrink: 1 }}
              />
            )}
          />

          {/* Action Buttons */}
          <Box display="flex" gap={1} flexShrink={0}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={!isValid || loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
              sx={{ whiteSpace: 'nowrap', minWidth: '120px' }}
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </Button>

            {hasResults && (
              <Button
                variant="outlined"
                color="secondary"
                size="large"
                onClick={handleClear}
                disabled={loading}
                startIcon={<ClearIcon />}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Clear
              </Button>
            )}
          </Box>
        </Box>

        {/* DNS Check Selection */}
        <Box mt={2}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              Select Checks:
            </Typography>
            <Box display="flex" gap={1}>
              <Button
                size="small"
                variant={selectedChecks.includes('all') ? 'contained' : 'outlined'}
                onClick={() => setSelectedChecks(['all'])}
                disabled={loading}
                startIcon={<SelectAllIcon />}
                sx={{ fontSize: '0.75rem', py: 0.5 }}
              >
                All Checks
              </Button>
              <Button
                size="small"
                variant={!selectedChecks.includes('all') ? 'contained' : 'outlined'}
                onClick={() => setSelectedChecks(['ns', 'a', 'mx', 'spf'])}
                disabled={loading}
                sx={{ fontSize: '0.75rem', py: 0.5 }}
              >
                Basic Only
              </Button>
            </Box>
          </Box>

          {/* Compact Checkbox Grid - Only show if not "All Checks" */}
          {!selectedChecks.includes('all') && (
            <>
              <Box 
                display="grid" 
                gridTemplateColumns="repeat(auto-fit, minmax(160px, 1fr))" 
                gap={0.5}
                sx={{ 
                  maxHeight: '120px', 
                  overflowY: 'auto', 
                  pr: 1,
                  bgcolor: 'grey.50',
                  p: 1,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}
              >
                {availableChecks.filter(check => check.value !== 'all').map((check) => {
                  const category = categories[check.category as keyof typeof categories];
                  return (
                    <FormControlLabel
                      key={check.value}
                      control={
                        <Checkbox
                          checked={selectedChecks.includes(check.value)}
                          onChange={() => handleCheckChange(check.value)}
                          disabled={loading}
                          color={category.color}
                          size="small"
                        />
                      }
                      label={
                        <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                          {check.label.replace(/\s*\([^)]*\)/g, '')} {/* Remove parentheses content */}
                        </Typography>
                      }
                      sx={{ 
                        m: 0,
                        height: '28px',
                        '& .MuiFormControlLabel-label': { fontSize: '0.75rem' }
                      }}
                    />
                  );
                })}
              </Box>
              
              {/* Selected Count */}
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {selectedChecks.length} checks selected
              </Typography>
            </>
          )}

          {/* Show recommended message when All Checks is selected */}
          {selectedChecks.includes('all') && (
            <Chip 
              label="All 16 DNS checks will be performed" 
              size="small" 
              color="primary" 
              variant="outlined"
              icon={<CheckIcon />}
              sx={{ mt: 1, fontSize: '0.75rem' }}
            />
          )}
        </Box>
      </form>
    </Box>
  );
}
