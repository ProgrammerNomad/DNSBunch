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
  Divider,
  FormGroup
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
    { value: 'all', label: 'All DNS Checks', category: 'general', isAllOption: true },
    
    // Basic DNS Records
    { value: 'ns', label: 'NS', category: 'basic' },
    { value: 'soa', label: 'SOA', category: 'basic' },
    { value: 'a', label: 'A Records', category: 'basic' },
    { value: 'aaaa', label: 'AAAA', category: 'basic' },
    
    // Website & Content
    { value: 'cname', label: 'CNAME', category: 'content' },
    { value: 'txt', label: 'TXT', category: 'content' },
    { value: 'wildcard', label: 'Wildcard', category: 'content' },
    
    // Email Configuration
    { value: 'mx', label: 'MX', category: 'email' },
    { value: 'spf', label: 'SPF', category: 'email' },
    { value: 'dmarc', label: 'DMARC', category: 'email' },
    { value: 'dkim', label: 'DKIM', category: 'email' },
    { value: 'ptr', label: 'PTR', category: 'email' },
    
    // Security & Advanced
    { value: 'caa', label: 'CAA', category: 'security' },
    { value: 'dnssec', label: 'DNSSEC', category: 'security' },
    { value: 'axfr', label: 'AXFR', category: 'security' },
    { value: 'glue', label: 'Glue', category: 'security' }
  ];

  const categories = {
    general: { name: 'General', color: 'primary' as const },
    basic: { name: 'Basic', color: 'info' as const },
    content: { name: 'Content', color: 'secondary' as const },
    email: { name: 'Email', color: 'warning' as const },
    security: { name: 'Security', color: 'success' as const }
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
                size="medium"
                sx={{ 
                  flex: 1, 
                  flexShrink: 1,
                  '& .MuiInputBase-root': {
                    height: '56px' // Match button height
                  }
                }}
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
              sx={{ 
                whiteSpace: 'nowrap', 
                minWidth: '120px',
                height: '56px' // Explicit height to match input
              }}
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
                sx={{ 
                  whiteSpace: 'nowrap',
                  height: '56px' // Match other elements
                }}
              >
                Clear
              </Button>
            )}
          </Box>
        </Box>

        {/* DNS Check Selection - Compact Version */}
        <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
              DNS Checks
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Chip 
                icon={<CheckIcon />}
                label={`${getSelectedCount()} selected`}
                size="small" 
                color="primary" 
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
              <Button
                size="small"
                variant="text"
                onClick={() => setSelectedChecks(['all'])}
                disabled={loading || selectedChecks.includes('all')}
                startIcon={<SelectAllIcon />}
                sx={{ fontSize: '0.7rem', minWidth: 'auto', px: 1 }}
              >
                All
              </Button>
            </Box>
          </Box>

          {/* Compact Checkbox Grid */}
          <Box 
            display="grid" 
            gridTemplateColumns="repeat(auto-fit, minmax(100px, 1fr))" 
            gap={0.5}
            sx={{ maxHeight: '200px', overflowY: 'auto' }}
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
                      sx={{ 
                        py: 0.25,
                        '& .MuiSvgIcon-root': { fontSize: '1rem' }
                      }}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontSize: '0.75rem',
                          fontWeight: isAllOption ? 600 : 400,
                          color: isAllOption ? 'primary.main' : 'text.primary',
                          lineHeight: 1.2
                        }}
                      >
                        {check.label}
                      </Typography>
                      {!isAllOption && (
                        <Chip 
                          label={category.name.charAt(0)} // Just first letter for compactness
                          size="small" 
                          color={category.color}
                          variant="outlined"
                          sx={{ 
                            fontSize: '0.6rem', 
                            height: '16px', 
                            minWidth: '16px',
                            '& .MuiChip-label': { px: 0.5 }
                          }}
                        />
                      )}
                    </Box>
                  }
                  sx={{ 
                    m: 0,
                    py: 0.25,
                    px: 0.5,
                    border: isAllOption ? '1px solid' : 'none',
                    borderColor: isAllOption 
                      ? (isChecked ? 'primary.main' : 'primary.light')
                      : 'transparent',
                    borderRadius: 0.5,
                    bgcolor: isAllOption 
                      ? (isChecked ? 'primary.50' : 'background.paper')
                      : 'transparent',
                    '&:hover': {
                      bgcolor: isAllOption ? 'primary.50' : 'action.hover'
                    },
                    '& .MuiFormControlLabel-label': {
                      fontSize: '0.75rem'
                    }
                  }}
                />
              );
            })}
          </Box>

          {/* Compact Selection Info */}
          <Divider sx={{ my: 1.5 }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            {selectedChecks.includes('all') 
              ? "All available DNS checks will be performed"
              : `${selectedChecks.length} custom check${selectedChecks.length !== 1 ? 's' : ''} selected`
            }
          </Typography>
        </Paper>
      </form>
    </Box>
  );
}
