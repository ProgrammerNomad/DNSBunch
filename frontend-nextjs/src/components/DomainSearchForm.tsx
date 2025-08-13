'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  TextField,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  CircularProgress,
  Box,
  Divider,
  Chip,
  Stack
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Clear as ClearIcon,
  SelectAll as SelectAllIcon
} from '@mui/icons-material';

// Validation schema
const schema = yup.object({
  domain: yup
    .string()
    .required('Domain is required')
    .matches(
      /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/,
      'Please enter a valid domain name'
    ),
});

interface DomainSearchFormProps {
  onSearch: (domain: string, checks?: string[]) => void;
  loading: boolean;
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
    security: { name: 'Security', color: 'error' as const },
    advanced: { name: 'Advanced', color: 'warning' as const }
  };

  const onSubmit = (data: { domain: string }) => {
    const cleanDomain = data.domain.trim().toLowerCase();
    onSearch(cleanDomain, selectedChecks);
  };

  const handleCheckChange = (checkValue: string) => {
    if (checkValue === 'all') {
      setSelectedChecks(['all']);
    } else {
      const newChecks = selectedChecks.filter(c => c !== 'all');
      if (selectedChecks.includes(checkValue)) {
        const filtered = newChecks.filter(c => c !== checkValue);
        setSelectedChecks(filtered.length > 0 ? filtered : ['all']);
      } else {
        setSelectedChecks([...newChecks, checkValue]);
      }
    }
  };

  const handleClear = () => {
    reset();
    setSelectedChecks(['all']);
    onClear?.();
  };

  const getChecksByCategory = (category: string) => {
    return availableChecks.filter(check => check.category === category);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
        DNS & Mail Server Analysis
      </Typography>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box display="grid" gridTemplateColumns={`1fr ${hasResults ? 'auto auto' : 'auto'}`} gap={2} alignItems="end">
          {/* Domain Input */}
          <Controller
            name="domain"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Domain Name"
                placeholder="example.com"
                variant="outlined"
                disabled={loading}
                error={!!errors.domain}
                helperText={
                  errors.domain?.message || 
                  'Enter a domain without http:// or www (e.g., google.com)'
                }
                InputProps={{
                  sx: { fontSize: '1.1rem' }
                }}
              />
            )}
          />
          
          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || !isValid}
            startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
            sx={{ 
              height: '56px',
              fontSize: '1.1rem',
              minWidth: '120px'
            }}
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </Button>

          {/* Clear Button */}
          {hasResults && (
            <Button
              variant="outlined"
              size="large"
              onClick={handleClear}
              startIcon={<ClearIcon />}
              sx={{ 
                height: '56px',
                fontSize: '1.1rem',
                minWidth: '100px'
              }}
            >
              Clear
            </Button>
          )}
        </Box>

        {/* Check Selection */}
        <Box sx={{ mt: 4 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <SelectAllIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">
              Analysis Options
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 3 }} />

          <FormGroup>
            {/* All Checks Option */}
            <Box mb={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedChecks.includes('all')}
                    onChange={() => handleCheckChange('all')}
                    disabled={loading}
                    color="primary"
                    size="medium"
                  />
                }
                label={
                  <Box display="flex" alignItems="center">
                    <Typography variant="h6" sx={{ mr: 1 }}>
                      All Checks
                    </Typography>
                    <Chip 
                      label="Recommended" 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </Box>
                }
              />
            </Box>

            {/* Categorized Checks */}
            {Object.entries(categories).map(([categoryKey, categoryInfo]) => {
              const categoryChecks = getChecksByCategory(categoryKey);
              if (categoryChecks.length === 0 || categoryKey === 'general') return null;

              return (
                <Box key={categoryKey} mb={3}>
                  <Typography variant="subtitle1" color="text.secondary" mb={1}>
                    {categoryInfo.name}
                  </Typography>
                  <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={1}>
                    {categoryChecks.map((check) => (
                      <FormControlLabel
                        key={check.value}
                        control={
                          <Checkbox
                            checked={selectedChecks.includes(check.value)}
                            onChange={() => handleCheckChange(check.value)}
                            disabled={loading || selectedChecks.includes('all')}
                            color={categoryInfo.color}
                            size="small"
                          />
                        }
                        label={
                          <Typography variant="body2">
                            {check.label}
                          </Typography>
                        }
                        sx={{ 
                          width: '100%',
                          opacity: selectedChecks.includes('all') ? 0.6 : 1
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              );
            })}
          </FormGroup>

          {/* Selected Checks Summary */}
          {selectedChecks.length > 0 && !selectedChecks.includes('all') && (
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Selected checks ({selectedChecks.length}):
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {selectedChecks.map((checkValue) => {
                  const check = availableChecks.find(c => c.value === checkValue);
                  if (!check) return null;
                  const category = categories[check.category as keyof typeof categories];
                  return (
                    <Chip
                      key={checkValue}
                      label={check.label}
                      size="small"
                      color={category.color}
                      variant="outlined"
                      onDelete={() => handleCheckChange(checkValue)}
                    />
                  );
                })}
              </Stack>
            </Box>
          )}
        </Box>
      </form>
    </Box>
  );
}
