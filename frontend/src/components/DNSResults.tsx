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

import { DNSResultsProps, CheckResult } from '../types/dns';
import { NormalResults } from './NormalResults';

export function DNSResults({ 
  data, 
  loading = false, 
  resultType = 'advanced'
}: DNSResultsProps) {
  const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>({});
  const [clientTimestamp, setClientTimestamp] = useState<string>('');

  useEffect(() => {
    // Format timestamp on client side to avoid hydration mismatch
    if (data?.timestamp) {
      setClientTimestamp(new Date(data.timestamp).toLocaleString());
    }
  }, [data]);

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

  if (!data || !data.checks) {
    return null;
  }

  // If normal mode, use the table format
  if (resultType === 'normal') {
    return <NormalResults data={data} />;
  }

  const results = data;

  const handlePanelChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPanels(prev => ({
      ...prev,
      [panel]: isExpanded
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  };

  // Categorize checks
  const categories = [
    {
      title: 'DNS Foundation', 
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

  // Filter categories to only show those with results
  const categoriesWithResults = categories.filter(category => category.checks.length > 0);

  // Find issues (warnings and errors) across all checks
  const issuesData = Object.entries(results.checks)
    .filter(([, check]) => check.status === 'error' || check.status === 'warning')
    .filter(([, check]) => check.issues && check.issues.length > 0);

  const formatRecordData = (data: unknown): string => {
    if (typeof data === 'string') {
      return data;
    }
    if (typeof data === 'object' && data !== null) {
      return JSON.stringify(data, null, 2);
    }
    return String(data);
  };

  return (
    <Box sx={{ mt: 3 }}>
      {/* Header Card */}
      <Card sx={{ 
        mb: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
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

      {/* Summary Card */}
      {results.summary && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
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

      {/* DNS Records by Category - Only show categories with results */}
      {categoriesWithResults.map((category, index) => {
        const overallStatus = category.checks.some((check: CheckResult) => check.status === 'error') 
          ? 'error' 
          : category.checks.some((check: CheckResult) => check.status === 'warning') 
          ? 'warning' 
          : 'pass';

        return (
          <Accordion 
            key={index}
            expanded={expandedPanels[category.title] || false}
            onChange={handlePanelChange(category.title)}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={2} width="100%">
                <Box display="flex" alignItems="center" gap={1} flex={1}>
                  <Avatar sx={{ bgcolor: category.color, width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 } }}>
                    {category.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color={category.color} fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                      {category.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      {category.description}
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                  {getStatusIcon(overallStatus)}
                  <Chip 
                    label={`${category.checks.length} check${category.checks.length !== 1 ? 's' : ''}`}
                    size="small"
                    color={getStatusColor(overallStatus) as 'success' | 'warning' | 'error' | 'info'}
                    variant="outlined"
                    sx={{ fontSize: { xs: '0.6rem', sm: '0.75rem' } }}
                  />
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ mt: 1 }}>
                {category.checkTypes.map((checkType) => {
                  const check = results.checks[checkType];
                  if (!check) return null;

                  return (
                    <Card key={checkType} variant="outlined" sx={{ mb: 2 }}>
                      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Box display="flex" alignItems="center" gap={2} mb={2} flexWrap="wrap">
                          {getStatusIcon(check.status)}
                          <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                            {checkType.toUpperCase()} Records
                          </Typography>
                          <Chip 
                            label={check.status} 
                            color={getStatusColor(check.status) as 'success' | 'warning' | 'error' | 'info'} 
                            size="small"
                            sx={{ fontSize: { xs: '0.6rem', sm: '0.75rem' } }}
                          />
                        </Box>

                        {/* Show records if available */}
                        {check.records && check.records.length > 0 && (
                          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Record</TableCell>
                                  <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Value</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {check.records.map((record, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                      {checkType.toUpperCase()} #{idx + 1}
                                    </TableCell>
                                    <TableCell sx={{ 
                                      fontFamily: 'monospace', 
                                      fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                      wordBreak: 'break-all'
                                    }}>
                                      {formatRecordData(record)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        )}

                        {/* Show single record if available */}
                        {check.record && (
                          <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                            <Typography variant="subtitle2" gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                              Record Data:
                            </Typography>
                            <Typography 
                              component="pre" 
                              sx={{ 
                                fontFamily: 'monospace', 
                                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-all'
                              }}
                            >
                              {formatRecordData(check.record)}
                            </Typography>
                          </Paper>
                        )}

                        {/* Show issues if any */}
                        {check.issues && check.issues.length > 0 && (
                          <Alert severity={check.status === 'error' ? 'error' : 'warning'} sx={{ mt: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                              Issues Found:
                            </Typography>
                            <List dense>
                              {check.issues.map((issue, idx) => (
                                <ListItem key={idx} sx={{ padding: { xs: '2px 0', sm: '4px 0' } }}>
                                  <ListItemText 
                                    primary={issue} 
                                    primaryTypographyProps={{ 
                                      fontSize: { xs: '0.75rem', sm: '0.875rem' } 
                                    }}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}

      {/* Issues Summary */}
      {issuesData.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom color="error" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Issues Requiring Attention
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {issuesData.map(([checkType, check]) => (
                <Alert key={checkType} severity={check.status === 'error' ? 'error' : 'warning'} sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    {checkType.toUpperCase()}
                  </Typography>
                  <List dense>
                    {check.issues?.map((issue, idx) => (
                      <ListItem key={idx} sx={{ padding: { xs: '2px 0', sm: '4px 0' } }}>
                        <ListItemText 
                          primary={issue} 
                          primaryTypographyProps={{ 
                            fontSize: { xs: '0.75rem', sm: '0.875rem' } 
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Alert>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
