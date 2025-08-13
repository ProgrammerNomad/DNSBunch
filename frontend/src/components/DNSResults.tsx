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

  const formatRecordDisplay = (check: CheckResult, checkType: string): React.ReactNode[] => {
    // Handle array of records
    if (check.records && Array.isArray(check.records) && check.records.length > 0) {
      return check.records.map((record: APIRecord, idx: number) => (
        <TableRow key={`${checkType}-${idx}`} hover>
          <TableCell>
            <Chip 
              label={checkType.toUpperCase()} 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          </TableCell>
          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
            {record?.host && record?.priority 
              ? `${record.priority} ${record.host}`
              : record?.host || record?.value || JSON.stringify(record)
            }
          </TableCell>
          <TableCell>
            {record?.ips ? record.ips.map((ip: { ip: string; type: string }) => ip?.ip).join(', ') : 
             record?.ip || record?.ttl || '-'}
          </TableCell>
        </TableRow>
      ));
    }

    // Handle single record
    if (check.record) {
      return [
        <TableRow key={`${checkType}-single`} hover>
          <TableCell>
            <Chip 
              label={checkType.toUpperCase()} 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          </TableCell>
          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
            {typeof check.record === 'string' 
              ? check.record 
              : JSON.stringify(check.record)
            }
          </TableCell>
          <TableCell>-</TableCell>
        </TableRow>
      ];
    }

    // Handle no records found
    return [
      <TableRow key={`${checkType}-empty`}>
        <TableCell colSpan={3}>
          <Alert severity="info">
            No records found for {checkType.toUpperCase()}
          </Alert>
        </TableCell>
      </TableRow>
    ];
  };

  return (
    <Box>
      {/* Header */}
      <Card elevation={2} sx={{ mb: 4, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)' }}>
        <CardContent sx={{ color: 'white' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
              <PublicIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box flex={1}>
              <Typography variant="h4" fontWeight="bold">
                {results.domain}
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                DNS Analysis Report - {results.status}
              </Typography>
              <Stack direction="row" spacing={1} mt={1}>
                <Chip 
                  icon={<TimeIcon />} 
                  label={clientTimestamp || 'Loading...'} 
                  size="small" 
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                {results.summary && (
                  <Chip 
                    label={`${results.summary.total} checks performed`}
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
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
          <CardContent>
            <Typography variant="h6" gutterBottom>Check Summary</Typography>
            <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2}>
              <Box display="flex" alignItems="center">
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography>Passed: {results.summary.passed}</Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <WarningIcon color="warning" sx={{ mr: 1 }} />
                <Typography>Warnings: {results.summary.warnings}</Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <ErrorIcon color="error" sx={{ mr: 1 }} />
                <Typography>Errors: {results.summary.errors}</Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <InfoIcon color="info" sx={{ mr: 1 }} />
                <Typography>Total: {results.summary.total}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* DNS Records by Category */}
      <Box display="grid" gap={3}>
        {categories.map((category, index) => {
          if (category.checks.length === 0) return null;
          
          const panelKey = `panel-${index}`;
          const hasErrors = category.checks.some(check => check.status === 'error');
          const hasWarnings = category.checks.some(check => check.status === 'warning');
          const overallStatus = hasErrors ? 'error' : hasWarnings ? 'warning' : 'success';
          
          return (
            <Accordion 
              key={index}
              expanded={expandedPanels[panelKey] || false}
              onChange={() => handlePanelChange(panelKey)}
              elevation={2}
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  bgcolor: `${category.color}10`,
                  '&:hover': { bgcolor: `${category.color}20` }
                }}
              >
                <Box display="flex" alignItems="center" width="100%">
                  <Avatar sx={{ bgcolor: category.color, mr: 2, width: 40, height: 40 }}>
                    {category.icon}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="h6" color={category.color} fontWeight="bold">
                      {category.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.description}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mr={2}>
                    {getStatusIcon(overallStatus)}
                    <Chip 
                      label={`${category.checks.length} check${category.checks.length !== 1 ? 's' : ''}`}
                      size="small"
                      sx={{ ml: 1 }}
                      color={overallStatus === 'success' ? 'success' : overallStatus === 'error' ? 'error' : 'warning'}
                    />
                  </Box>
                </Box>
              </AccordionSummary>
              
              <AccordionDetails>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Type</strong></TableCell>
                        <TableCell><strong>Value</strong></TableCell>
                        <TableCell><strong>Details</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {category.checkTypes.flatMap((checkType) => {
                        const check = results.checks[checkType];
                        if (!check) return [];
                        return formatRecordDisplay(check, checkType);
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Issues for this category */}
                {category.checks.some(check => check.issues && check.issues.length > 0) && (
                  <Box mt={2}>
                    <Typography variant="h6" gutterBottom>Issues Found:</Typography>
                    {category.checkTypes.map((checkType) => {
                      const check = results.checks[checkType];
                      if (!check?.issues || check.issues.length === 0) return null;
                      
                      return (
                        <Alert key={checkType} severity={check.status === 'error' ? 'error' : 'warning'} sx={{ mb: 1 }}>
                          <Typography variant="subtitle2">{checkType.toUpperCase()}</Typography>
                          <List dense>
                            {check.issues.map((issue, idx) => (
                              <ListItem key={idx}>
                                <ListItemText primary={issue} />
                              </ListItem>
                            ))}
                          </List>
                        </Alert>
                      );
                    })}
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    </Box>
  );
}
