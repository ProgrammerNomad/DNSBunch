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
  Chip,
  Paper,
  Divider
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
  const [selectedChecks, setSelectedChecks] = useState(['all']); // Default to "all"

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
    // All Checks option - FIRST in the list
    { value: 'all', label: 'All DNS Checks (Recommended)', category: 'general', isAllOption: true },
    
    // Basic DNS Records
    { value: 'ns', label: 'Nameservers (NS)', category: 'basic' },
    { value: 'soa', label: 'Start of Authority (SOA)', category: 'basic' },
    { value: 'a', label: 'IPv4 Addresses (A)', category: 'basic' },
    { value: 'aaaa', label: 'IPv6 Addresses (AAAA)', category: 'basic' },
    
    // Website & Content
    { value: 'cname', label: 'CNAME Records', category: 'content' },
    { value: 'txt', label: 'TXT Records', category: 'content' },
    { value: 'wildcard', label: 'Wildcard Records', category: 'content' },
    
    // Email Configuration
    { value: 'mx', label: 'Mail Exchange (MX)', category: 'email' },
    { value: 'spf', label: 'SPF Records', category: 'email' },
    { value: 'dmarc', label: 'DMARC Records', category: 'email' },
    { value: 'dkim', label: 'DKIM Records', category: 'email' },
    { value: 'ptr', label: 'PTR (Reverse DNS)', category: 'email' },
    
    // Security & Advanced
    { value: 'caa', label: 'CAA Records', category: 'security' },
    { value: 'dnssec', label: 'DNSSEC', category: 'security' },
    { value: 'axfr', label: 'Zone Transfer (AXFR)', category: 'security' },
    { value: 'glue', label: 'Glue Records', category: 'security' }
  ];

  const categories = {
    general: { name: 'General', color: 'primary' as const },
    basic: { name: 'Basic DNS', color: 'info' as const },
    content: { name: 'Website & Content', color: 'secondary' as const },
    email: { name: 'Email Security', color: 'warning' as const },
    security: { name: 'Security & Advanced', color: 'success' as const }
  };

  const handleCheckChange = (checkValue: string) => {
    if (checkValue === 'all') {
      // If "All Checks" is selected, clear all other selections
      setSelectedChecks(['all']);
    } else {
      // If any specific check is selected, remove "all" and toggle the specific check
      setSelectedChecks(prev => {
        const newChecks = prev.filter(check => check !== 'all');
        
        if (newChecks.includes(checkValue)) {
          // Remove the check if it's already selected
          const updated = newChecks.filter(check => check !== checkValue);
          // If no checks remain, default back to "all"
          return updated.length === 0 ? ['all'] : updated;
        } else {
          // Add the check
          return [...newChecks, checkValue];
        }
      });
    }
  };

  const onSubmit = (data: { domain: string }) => {
    const checksToSend = selectedChecks.includes('all') 
      ? [] // Empty array means "run all checks" to the backend
      : selectedChecks;
    
    console.log('Form submitted with checks:', checksToSend);
    onSearch(data.domain.toLowerCase().trim(), checksToSend);
  };

  const handleClear = () => {
    reset();
    setSelectedChecks(['all']); // Reset to default "all" selection
    onClear?.();
  };

  const getSelectedCount = () => {
    if (selectedChecks.includes('all')) {
      return availableChecks.length - 1; // Exclude the "all" option itself
    }
    return selectedChecks.length;
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
          sx={{ mb: 3 }}
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
        <Paper elevation={1} sx={{ p: 3, bgcolor: 'grey.50' }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Select DNS Checks:
            </Typography>
            <Chip 
              icon={<CheckIcon />}
              label={`${getSelectedCount()} check${getSelectedCount() !== 1 ? 's' : ''} selected`}
              size="small" 
              color="primary" 
              variant="outlined"
            />
          </Box>

          {/* Checkbox Grid */}
          <Box 
            display="grid" 
            gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" 
            gap={1}
            sx={{ maxHeight: '300px', overflowY: 'auto' }}
          >
            {availableChecks.map((check) => {
              const category = categories[check.category as keyof typeof categories];
              const isChecked = selectedChecks.includes(check.value);
              const isAllOption = check.value === 'all';
              
              return (
                <FormControlLabel
                  key={check.value}
                  control={
                    <Checkbox
                      checked={isChecked}
                      onChange={() => handleCheckChange(check.value)}
                      disabled={loading}
                      color={isAllOption ? 'primary' : category.color}
                      size="small"
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: '0.875rem',
                          fontWeight: isAllOption ? 600 : 400,
                          color: isAllOption ? 'primary.main' : 'text.primary'
                        }}
                      >
                        {check.label}
                      </Typography>
                      {!isAllOption && (
                        <Chip 
                          label={category.name} 
                          size="small" 
                          color={category.color}
                          variant="outlined"
                          sx={{ fontSize: '0.65rem', height: '20px' }}
                        />
                      )}
                    </Box>
                  }
                  sx={{ 
                    m: 0,
                    p: 1,
                    border: isAllOption ? '2px solid' : '1px solid',
                    borderColor: isAllOption 
                      ? (isChecked ? 'primary.main' : 'primary.light')
                      : 'transparent',
                    borderRadius: 1,
                    bgcolor: isAllOption 
                      ? (isChecked ? 'primary.50' : 'background.paper')
                      : 'transparent',
                    '&:hover': {
                      bgcolor: isAllOption ? 'primary.50' : 'action.hover'
                    }
                  }}
                />
              );
            })}
          </Box>

          {/* Selection Info */}
          <Divider sx={{ my: 2 }} />
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
            <Typography variant="caption" color="text.secondary">
              {selectedChecks.includes('all') 
                ? "All available DNS checks will be performed (comprehensive analysis)"
                : `Selected ${selectedChecks.length} specific check${selectedChecks.length !== 1 ? 's' : ''} (custom analysis)`
              }
            </Typography>
            
            <Button
              size="small"
              variant="text"
              onClick={() => setSelectedChecks(['all'])}
              disabled={loading || selectedChecks.includes('all')}
              startIcon={<SelectAllIcon />}
              sx={{ fontSize: '0.75rem' }}
            >
              Select All
            </Button>
          </Box>
        </Paper>
      </form>
    </Box>
  );
}
