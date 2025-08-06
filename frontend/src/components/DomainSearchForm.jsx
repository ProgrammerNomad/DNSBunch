import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Container,
  Grid,
  Paper,
  TextField,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Alert,
  CircularProgress,
  Box
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

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

const DomainSearchForm = ({ onSearch, loading, error }) => {
  const [selectedChecks, setSelectedChecks] = useState(['all']);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      domain: ''
    }
  });

  const availableChecks = [
    { value: 'all', label: 'All Checks' },
    { value: 'ns', label: 'Nameservers (NS)' },
    { value: 'soa', label: 'Start of Authority (SOA)' },
    { value: 'a', label: 'IPv4 Addresses (A)' },
    { value: 'aaaa', label: 'IPv6 Addresses (AAAA)' },
    { value: 'mx', label: 'Mail Exchange (MX)' },
    { value: 'spf', label: 'SPF Records' },
    { value: 'txt', label: 'TXT Records' },
    { value: 'cname', label: 'CNAME Records' },
    { value: 'ptr', label: 'PTR (Reverse DNS)' },
    { value: 'caa', label: 'CAA Records' },
    { value: 'dmarc', label: 'DMARC Records' },
    { value: 'dkim', label: 'DKIM Records' },
    { value: 'glue', label: 'Glue Records' },
    { value: 'dnssec', label: 'DNSSEC' },
    { value: 'axfr', label: 'Zone Transfer (AXFR)' },
    { value: 'wildcard', label: 'Wildcard Records' }
  ];

  const onSubmit = (data) => {
    const cleanDomain = data.domain.trim().toLowerCase();
    onSearch(cleanDomain, selectedChecks);
  };

  const handleCheckChange = (checkValue) => {
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

  return (
    <Container maxWidth="md" sx={{ mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
          Enter Domain for DNS Analysis
        </Typography>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Domain Input */}
            <Grid item xs={12} md={8}>
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
                    size="large"
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
            </Grid>
            
            {/* Submit Button */}
            <Grid item xs={12} md={4}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading || !isValid}
                startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                sx={{ 
                  height: '56px',
                  fontSize: '1.1rem'
                }}
              >
                {loading ? 'Analyzing...' : 'Analyze DNS'}
              </Button>
            </Grid>
          </Grid>

          {/* Check Selection */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Select Checks to Perform
            </Typography>
            <FormGroup>
              <Grid container spacing={1}>
                {availableChecks.map((check) => (
                  <Grid item xs={12} sm={6} md={4} key={check.value}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedChecks.includes(check.value)}
                          onChange={() => handleCheckChange(check.value)}
                          disabled={loading}
                          color="primary"
                        />
                      }
                      label={check.label}
                      sx={{ width: '100%' }}
                    />
                  </Grid>
                ))}
              </Grid>
            </FormGroup>
          </Box>

          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              <Typography variant="h6">Error</Typography>
              {error}
            </Alert>
          )}
        </form>
      </Paper>
    </Container>
  );
};

export default DomainSearchForm;
