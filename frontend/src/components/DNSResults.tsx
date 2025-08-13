'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Avatar,
  List,
  ListItem,
  ListItemText,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Dns as DnsIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  Language as WebIcon,
  AccessTime as TimeIcon,
  Public as PublicIcon
} from '@mui/icons-material';

import { DNSAnalysisResult, CheckResult } from '../services/api';

interface DNSResultsProps {
  results: DNSAnalysisResult;
  loading?: boolean;
}

interface RecordCategory {
  title: string;
  icon: React.ReactNode;
  color: string;
  checks: CheckResult[];
  description: string;
  checkTypes: string[];
}

// Type for API record objects
interface APIRecord {
  host?: string;
  ip?: string;
  type?: string;
  value?: string;
  priority?: number;
  target?: string;
  ttl?: number;
  ips?: Array<{ ip: string; type: string }>;
  [key: string]: unknown;
}

export function DNSResults({ results, loading = false }: DNSResultsProps) {
  const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>({});
  const [clientTimestamp, setClientTimestamp] = useState<string>('');

  useEffect(() => {
    // Format timestamp on client side to avoid hydration mismatch
    if (results?.timestamp) {
      setClientTimestamp(new Date(results.timestamp).toLocaleString());
    }
  }, [results?.timestamp]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2, alignSelf: 'center' }}>
          Analyzing DNS records...
        </Typography>
      </Box>
    );
  }

  if (!results || !results.checks) {
    return null;
  }

  const handlePanelChange = (panel: string) => {
    setExpandedPanels(prev => ({
      ...prev,
      [panel]: !prev[panel]
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircleIcon color="success" />;
      case 'warning': return <WarningIcon color="warning" />;
      case 'error': return <ErrorIcon color="error" />;
      default: return <InfoIcon color="info" />;
    }
  };

  // Group checks by category
  const categories: RecordCategory[] = [
    {
      title: 'Basic DNS Records',
      icon: <DnsIcon />,
      color: '#1976d2',
      description: 'Core DNS settings that make your domain work',
      checkTypes: ['ns', 'soa', 'a', 'aaaa'],
      checks: ['ns', 'soa', 'a', 'aaaa'].map(type => results.checks[type]).filter(Boolean)
    },
    {
      title: 'Website & Content', 
      icon: <WebIcon />,
      color: '#9c27b0',
      description: 'Records that control website access and content',
      checkTypes: ['cname', 'txt', 'wildcard'],
      checks: ['cname', 'txt', 'wildcard'].map(type => results.checks[type]).filter(Boolean)
    },
    {
      title: 'Email Configuration',
      icon: <EmailIcon />,
      color: '#d32f2f', 
      description: 'Email servers and security settings',
      checkTypes: ['mx', 'spf', 'dmarc', 'dkim', 'ptr'],
      checks: ['mx', 'spf', 'dmarc', 'dkim', 'ptr'].map(type => results.checks[type]).filter(Boolean)
    },
    {
      title: 'Security & Advanced',
      icon: <SecurityIcon />,
      color: '#388e3c',
      description: 'Security features and advanced configurations',
      checkTypes: ['dnssec', 'caa', 'axfr', 'glue'],
      checks: ['dnssec', 'caa', 'axfr', 'glue'].map(type => results.checks[type]).filter(Boolean)
    }
  ];

  // Helper function to truncate long text with tooltip-like display
  const formatValue = (value: string, maxLength: number = 50) => {
    if (!value) return '-';
    if (value.length <= maxLength) return value;
    return (
      <Box component="span" title={value}>
        {value.substring(0, maxLength)}...
      </Box>
    );
  };

  const formatRecordDisplay = (check: CheckResult, checkType: string): React.ReactNode[] => {
    // Handle array of records
    if (check.records && Array.isArray(check.records) && check.records.length > 0) {
      return check.records.map((record: APIRecord, idx: number) => {
        let displayValue = '';
        let detailValue = '';

        if (record?.host && record?.priority) {
          displayValue = `${record.priority} ${record.host}`;
        } else {
          displayValue = record?.host || record?.value || JSON.stringify(record);
        }

        if (record?.ips) {
          detailValue = record.ips.map((ip: { ip: string; type: string }) => ip?.ip).join(', ');
        } else {
          detailValue = record?.ip || record?.ttl?.toString() || '-';
        }

        return (
          <TableRow key={`${checkType}-${idx}`} hover>
            <TableCell 
              sx={{ 
                minWidth: '80px',
                maxWidth: '120px',
                padding: { xs: '8px 4px', sm: '16px' }
              }}
            >
              <Chip 
                label={checkType.toUpperCase()} 
                size="small" 
                color="primary" 
                variant="outlined"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              />
            </TableCell>
            <TableCell 
              sx={{ 
                fontFamily: 'monospace', 
                fontSize: { xs: '0.75rem', sm: '0.9rem' },
                wordBreak: 'break-all',
                maxWidth: { xs: '200px', sm: '300px', md: '400px' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                padding: { xs: '8px 4px', sm: '16px' }
              }}
            >
              {formatValue(displayValue, 60)}
            </TableCell>
            <TableCell 
              sx={{ 
                maxWidth: { xs: '150px', sm: '200px' },
                wordBreak: 'break-all',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                padding: { xs: '8px 4px', sm: '16px' }
              }}
            >
              {formatValue(detailValue, 40)}
            </TableCell>
          </TableRow>
        );
      });
    }

    // Handle single record
    if (check.record) {
      const recordValue = typeof check.record === 'string' 
        ? check.record 
        : JSON.stringify(check.record);

      return [
        <TableRow key={`${checkType}-single`} hover>
          <TableCell sx={{ minWidth: '80px', maxWidth: '120px', padding: { xs: '8px 4px', sm: '16px' } }}>
            <Chip 
              label={checkType.toUpperCase()} 
              size="small" 
              color="primary" 
              variant="outlined"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
            />
          </TableCell>
          <TableCell 
            sx={{ 
              fontFamily: 'monospace', 
              fontSize: { xs: '0.75rem', sm: '0.9rem' },
              wordBreak: 'break-all',
              maxWidth: { xs: '200px', sm: '300px', md: '400px' },
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              padding: { xs: '8px 4px', sm: '16px' }
            }}
          >
            {formatValue(recordValue, 60)}
          </TableCell>
          <TableCell sx={{ padding: { xs: '8px 4px', sm: '16px' } }}>-</TableCell>
        </TableRow>
      ];
    }

    // Handle no records found
    return [
      <TableRow key={`${checkType}-empty`}>
        <TableCell colSpan={3} sx={{ padding: { xs: '8px 4px', sm: '16px' } }}>
          <Alert severity="info">
            No records found for {checkType.toUpperCase()}
          </Alert>
        </TableCell>
      </TableRow>
    ];
  };

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Card elevation={2} sx={{ mb: 4, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)' }}>
        <CardContent sx={{ color: 'white', padding: { xs: 2, sm: 3 } }}>
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: { xs: 48, sm: 56 }, height: { xs: 48, sm: 56 } }}>
              <PublicIcon sx={{ fontSize: { xs: 24, sm: 32 } }} />
            </Avatar>
            <Box flex={1} minWidth="200px">
              <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
                {results.domain}
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                DNS Analysis Report - {results.status}
              </Typography>
              <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" gap={1}>
                <Chip 
                  icon={<TimeIcon />} 
                  label={clientTimestamp || 'Loading...'} 
                  size="small" 
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                  }}
                />
                {results.summary && (
                  <Chip 
                    label={`${results.summary.total} checks performed`}
                    size="small"
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      fontSize: { xs: '0.7rem', sm: '0.75rem' }
                    }}
                  />
                )}
              </Stack>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {results.summary && (
        <Card elevation={1} sx={{ mb: 3 }}>
          <CardContent sx={{ padding: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Check Summary
            </Typography>
            <Box 
              display="grid" 
              gridTemplateColumns={{ xs: 'repeat(2, 1fr)', sm: 'repeat(auto-fit, minmax(180px, 1fr))' }} 
              gap={2}
            >
              <Box display="flex" alignItems="center">
                <CheckCircleIcon color="success" sx={{ mr: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  Passed: {results.summary.passed}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <WarningIcon color="warning" sx={{ mr: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  Warnings: {results.summary.warnings}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <ErrorIcon color="error" sx={{ mr: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  Errors: {results.summary.errors}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <InfoIcon color="info" sx={{ mr: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  Total: {results.summary.total}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* DNS Records by Category */}
      <Box display="grid" gap={3} sx={{ width: '100%' }}>
        {categories.map((category, index) => {
          if
