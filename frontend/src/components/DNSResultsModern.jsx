import React, { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
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
  List,
  ListItem,
  ListItemText,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Collapse,
  IconButton,
  Tooltip,
  Stack
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  HelpOutline as HelpIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Dns as DnsIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  Language as WebIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';

const DNSResults = ({ results }) => {
  const [expandedSections, setExpandedSections] = useState({});

  if (!results || !results.checks) {
    return null;
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Define check categories with user-friendly information
  const checkCategories = {
    'Basic Configuration': {
      icon: <DnsIcon />,
      color: '#1976d2',
      description: 'Essential DNS settings that make your domain work',
      checks: ['ns', 'soa', 'a', 'aaaa', 'cname'],
      explanations: {
        ns: {
          title: 'Nameservers (NS Records)',
          description: 'These are like the phone book operators for your domain. They tell the internet where to find information about your domain.',
          importance: 'Critical - Without working nameservers, your website and email won\'t work.',
          goodStatus: 'Your domain has properly configured nameservers that respond correctly.',
          issues: {
            error: 'Your nameservers are not responding or misconfigured. This will prevent your website and email from working.',
            warning: 'There may be issues with your nameserver configuration that could cause problems.',
          }
        },
        soa: {
          title: 'Start of Authority (SOA Record)',
          description: 'This record contains important administrative information about your domain, like refresh intervals and contact details.',
          importance: 'Important - Ensures proper DNS synchronization and management.',
          goodStatus: 'Your SOA record is properly configured with appropriate values.',
          issues: {
            error: 'SOA record has serious issues that could affect DNS propagation.',
            warning: 'SOA record values could be optimized for better performance.',
          }
        },
        a: {
          title: 'IPv4 Addresses (A Records)',
          description: 'These point your domain name to the actual server IP addresses where your website is hosted.',
          importance: 'Critical - Without A records, visitors can\'t reach your website.',
          goodStatus: 'Your domain correctly points to valid IP addresses.',
          issues: {
            error: 'No A records found or they point to invalid addresses. Your website won\'t be accessible.',
            warning: 'Some A record issues detected that may affect website accessibility.',
          }
        },
        aaaa: {
          title: 'IPv6 Addresses (AAAA Records)',
          description: 'These are the newer IPv6 addresses for your website. Not required but recommended for future compatibility.',
          importance: 'Optional - Improves accessibility for IPv6-enabled users.',
          goodStatus: 'Your domain supports IPv6 connectivity.',
          issues: {
            error: 'IPv6 records are misconfigured.',
            warning: 'Consider adding IPv6 support for better future compatibility.',
          }
        },
        cname: {
          title: 'Canonical Names (CNAME Records)',
          description: 'These create aliases for your domain, like making "www.yourdomain.com" point to "yourdomain.com".',
          importance: 'Important - Ensures all variations of your domain work correctly.',
          goodStatus: 'CNAME records are properly configured.',
          issues: {
            error: 'CNAME records have conflicts or are misconfigured.',
            warning: 'CNAME setup could be improved.',
          }
        }
      }
    },
    'Email Configuration': {
      icon: <EmailIcon />,
      color: '#d32f2f',
      description: 'Settings that control email delivery and security for your domain',
      checks: ['mx', 'spf', 'dmarc', 'dkim', 'ptr'],
      explanations: {
        mx: {
          title: 'Mail Exchange (MX Records)',
          description: 'These tell other email servers where to deliver email for your domain.',
          importance: 'Critical for email - Without MX records, you won\'t receive email.',
          goodStatus: 'Your email servers are properly configured and reachable.',
          issues: {
            error: 'No MX records found or email servers are unreachable. You won\'t receive email.',
            warning: 'Email configuration could be improved for better reliability.',
          }
        },
        spf: {
          title: 'SPF (Sender Policy Framework)',
          description: 'This helps prevent spammers from sending fake emails that appear to come from your domain.',
          importance: 'Important for email security - Prevents email spoofing.',
          goodStatus: 'SPF record is properly configured to prevent email spoofing.',
          issues: {
            error: 'SPF record is missing or has serious errors. Your emails may be marked as spam.',
            warning: 'SPF record could be improved for better email deliverability.',
          }
        },
        dmarc: {
          title: 'DMARC Policy',
          description: 'This advanced email security setting tells other servers what to do with suspicious emails from your domain.',
          importance: 'Important for email security and deliverability.',
          goodStatus: 'DMARC policy is properly configured.',
          issues: {
            error: 'DMARC policy has errors that could affect email security.',
            warning: 'Consider implementing DMARC for better email security.',
          }
        },
        dkim: {
          title: 'DKIM Signatures',
          description: 'This digitally signs your emails to prove they really came from your domain.',
          importance: 'Important for email security and deliverability.',
          goodStatus: 'DKIM signatures are properly configured.',
          issues: {
            error: 'DKIM configuration has errors.',
            warning: 'Consider implementing DKIM for better email authentication.',
          }
        },
        ptr: {
          title: 'Reverse DNS (PTR Records)',
          description: 'These help email servers verify that your mail servers are legitimate.',
          importance: 'Important for email deliverability - Some servers require this.',
          goodStatus: 'Reverse DNS is properly configured for your mail servers.',
          issues: {
            error: 'Reverse DNS is missing or incorrect. This may affect email deliverability.',
            warning: 'Reverse DNS could be improved.',
          }
        }
      }
    },
    'Security & Advanced': {
      icon: <SecurityIcon />,
      color: '#388e3c',
      description: 'Advanced security features and configurations',
      checks: ['dnssec', 'caa', 'axfr', 'txt'],
      explanations: {
        dnssec: {
          title: 'DNSSEC (DNS Security)',
          description: 'This cryptographically signs your DNS records to prevent tampering and ensure authenticity.',
          importance: 'Advanced security - Protects against DNS hijacking attacks.',
          goodStatus: 'DNSSEC is properly configured, providing enhanced security.',
          issues: {
            error: 'DNSSEC configuration has errors that could compromise security.',
            warning: 'Consider implementing DNSSEC for enhanced security.',
          }
        },
        caa: {
          title: 'CAA (Certificate Authority Authorization)',
          description: 'This controls which companies can issue SSL certificates for your domain.',
          importance: 'Security feature - Prevents unauthorized SSL certificate issuance.',
          goodStatus: 'CAA records properly restrict certificate issuance.',
          issues: {
            error: 'CAA records have configuration errors.',
            warning: 'Consider adding CAA records for better SSL security.',
          }
        },
        axfr: {
          title: 'Zone Transfer Security',
          description: 'This checks if your DNS server accidentally allows unauthorized copying of all your DNS records.',
          importance: 'Security check - Prevents information disclosure.',
          goodStatus: 'Zone transfers are properly restricted.',
          issues: {
            error: 'Your DNS server allows unauthorized zone transfers. This is a security risk.',
            warning: 'Zone transfer configuration should be reviewed.',
          }
        },
        txt: {
          title: 'TXT Records',
          description: 'These contain various text-based information, often used for domain verification and services.',
          importance: 'Various purposes - Often required for third-party services.',
          goodStatus: 'TXT records are properly configured.',
          issues: {
            error: 'TXT records have configuration issues.',
            warning: 'TXT records could be optimized.',
          }
        }
      }
    },
    'Performance & Accessibility': {
      icon: <SpeedIcon />,
      color: '#f57c00',
      description: 'Settings that affect how fast and accessible your domain is',
      checks: ['glue', 'wildcard'],
      explanations: {
        glue: {
          title: 'Glue Records',
          description: 'These help speed up DNS lookups by providing IP addresses for your nameservers.',
          importance: 'Performance - Reduces DNS lookup time.',
          goodStatus: 'Glue records are properly configured for optimal performance.',
          issues: {
            error: 'Missing or incorrect glue records may slow down DNS resolution.',
            warning: 'Glue record configuration could be improved.',
          }
        },
        wildcard: {
          title: 'Wildcard DNS',
          description: 'This checks if you have catch-all DNS records that respond to any subdomain.',
          importance: 'Configuration check - Can affect subdomain behavior.',
          goodStatus: 'Wildcard configuration is appropriate.',
          issues: {
            error: 'Wildcard DNS configuration may cause unintended behavior.',
            warning: 'Review wildcard DNS settings.',
          }
        }
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pass': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass': return <CheckCircleIcon color="success" />;
      case 'warning': return <WarningIcon color="warning" />;
      case 'error': return <ErrorIcon color="error" />;
      case 'info': return <InfoIcon color="info" />;
      default: return <InfoIcon />;
    }
  };

  const getStatusMessage = (checkType, status, checkData) => {
    const explanation = Object.values(checkCategories)
      .find(cat => cat.explanations[checkType])?.explanations[checkType];
    
    if (!explanation) return 'Check completed.';
    
    if (status === 'pass') return explanation.goodStatus;
    return explanation.issues[status] || 'Check completed with issues.';
  };

  const formatRecordData = (data) => {
    if (typeof data === 'string') return data;
    if (typeof data === 'object') return JSON.stringify(data, null, 2);
    return String(data);
  };

  const renderOverallSummary = () => {
    const summary = results.summary || {};
    const totalChecks = summary.total || 0;
    const passedChecks = summary.passed || 0;
    const warningChecks = summary.warnings || 0;
    const errorChecks = summary.errors || 0;

    const getOverallStatus = () => {
      if (errorChecks > 0) return { status: 'error', message: 'Critical issues found' };
      if (warningChecks > 0) return { status: 'warning', message: 'Some issues need attention' };
      return { status: 'success', message: 'All checks passed' };
    };

    const overall = getOverallStatus();

    return (
      <Card sx={{ mb: 4, borderTop: 4, borderTopColor: overall.status === 'error' ? 'error.main' : overall.status === 'warning' ? 'warning.main' : 'success.main' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getStatusIcon(overall.status)}
            DNS Analysis Results for {results.domain}
          </Typography>
          
          <Typography variant="h6" color={`${overall.status}.main`} gutterBottom>
            {overall.message}
          </Typography>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="success.main">{passedChecks}</Typography>
                <Typography variant="body2" color="text.secondary">Passed</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="warning.main">{warningChecks}</Typography>
                <Typography variant="body2" color="text.secondary">Warnings</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="error.main">{errorChecks}</Typography>
                <Typography variant="body2" color="text.secondary">Errors</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="text.primary">{totalChecks}</Typography>
                <Typography variant="body2" color="text.secondary">Total Checks</Typography>
              </Box>
            </Grid>
          </Grid>

          {errorChecks > 0 && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Action Required:</strong> Your domain has {errorChecks} critical issue{errorChecks > 1 ? 's' : ''} that need immediate attention to ensure proper functionality.
              </Typography>
            </Alert>
          )}

          {warningChecks > 0 && errorChecks === 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Recommendations:</strong> Your domain has {warningChecks} item{warningChecks > 1 ? 's' : ''} that could be improved for better performance or security.
              </Typography>
            </Alert>
          )}

          {errorChecks === 0 && warningChecks === 0 && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Excellent!</strong> Your domain configuration looks great. All DNS checks passed successfully.
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderCategorySection = (categoryName, categoryData) => {
    const categoryChecks = categoryData.checks.filter(checkType => results.checks[checkType]);
    
    if (categoryChecks.length === 0) return null;

    const categoryStats = categoryChecks.reduce((stats, checkType) => {
      const status = results.checks[checkType]?.status;
      if (status === 'pass') stats.passed++;
      else if (status === 'warning') stats.warnings++;
      else if (status === 'error') stats.errors++;
      return stats;
    }, { passed: 0, warnings: 0, errors: 0 });

    const getCategoryStatus = () => {
      if (categoryStats.errors > 0) return 'error';
      if (categoryStats.warnings > 0) return 'warning';
      return 'success';
    };

    return (
      <Card key={categoryName} sx={{ mb: 3 }}>
        <CardHeader
          avatar={
            <Box sx={{ 
              bgcolor: categoryData.color, 
              borderRadius: '50%', 
              p: 1, 
              display: 'flex',
              color: 'white'
            }}>
              {categoryData.icon}
            </Box>
          }
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6">{categoryName}</Typography>
              <Chip 
                icon={getStatusIcon(getCategoryStatus())}
                label={`${categoryStats.passed}/${categoryChecks.length} Passed`}
                color={getStatusColor(getCategoryStatus())}
                size="small"
              />
            </Box>
          }
          subheader={categoryData.description}
          action={
            <IconButton onClick={() => toggleSection(categoryName)}>
              {expandedSections[categoryName] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          }
        />
        
        <Collapse in={expandedSections[categoryName]}>
          <CardContent>
            {categoryChecks.map(checkType => {
              const checkData = results.checks[checkType];
              const explanation = categoryData.explanations[checkType];
              
              return (
                <Card key={checkType} variant="outlined" sx={{ mb: 2 }}>
                  <CardHeader
                    avatar={getStatusIcon(checkData.status)}
                    title={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6">{explanation?.title || checkType.toUpperCase()}</Typography>
                        <Chip 
                          label={checkData.status.toUpperCase()} 
                          color={getStatusColor(checkData.status)}
                          size="small"
                        />
                      </Box>
                    }
                    subheader={explanation?.description}
                    action={
                      <Tooltip title={explanation?.importance || 'DNS check'}>
                        <IconButton size="small">
                          <HelpIcon />
                        </IconButton>
                      </Tooltip>
                    }
                  />
                  
                  <CardContent>
                    <Alert severity={checkData.status === 'pass' ? 'success' : checkData.status} sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        {getStatusMessage(checkType, checkData.status, checkData)}
                      </Typography>
                    </Alert>

                    {/* Technical Details Accordion */}
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle2">Technical Details</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {checkData.error && (
                          <Alert severity="error" sx={{ mb: 2 }}>
                            <Typography variant="body2">
                              <strong>Error:</strong> {checkData.error}
                            </Typography>
                          </Alert>
                        )}

                        {checkData.records && Array.isArray(checkData.records) && checkData.records.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Records Found ({checkData.records.length}):
                            </Typography>
                            <TableContainer component={Paper} variant="outlined">
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell><strong>Record</strong></TableCell>
                                    <TableCell><strong>Details</strong></TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {checkData.records.map((record, index) => (
                                    <TableRow key={index}>
                                      <TableCell>{index + 1}</TableCell>
                                      <TableCell>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                          {formatRecordData(record)}
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Box>
                        )}

                        {checkData.record && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Record Details:
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                {formatRecordData(checkData.record)}
                              </Typography>
                            </Paper>
                          </Box>
                        )}

                        {checkData.issues && checkData.issues.length > 0 && (
                          <Box>
                            <Typography variant="subtitle2" color="error" gutterBottom>
                              Issues Found:
                            </Typography>
                            <List dense>
                              {checkData.issues.map((issue, index) => (
                                <ListItem key={index} sx={{ pl: 0 }}>
                                  <ListItemText 
                                    primary={issue}
                                    primaryTypographyProps={{ 
                                      color: 'error',
                                      fontSize: '0.875rem'
                                    }}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}

                        {checkData.count !== undefined && (
                          <Typography variant="caption" color="text.secondary">
                            Total records found: {checkData.count}
                          </Typography>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  </CardContent>
                </Card>
              );
            })}
          </CardContent>
        </Collapse>
      </Card>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {renderOverallSummary()}
      
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Detailed Analysis
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Click on each category below to see detailed information about your domain's configuration. 
        We've organized the results into categories that are easy to understand, even if you're not a technical expert.
      </Typography>

      {Object.entries(checkCategories).map(([categoryName, categoryData]) =>
        renderCategorySection(categoryName, categoryData)
      )}

      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Need Help?
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            If you see any errors or warnings and need help fixing them, consider:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="Contacting your domain registrar or hosting provider" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Consulting with a web developer or IT professional" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Checking your DNS management panel for configuration options" />
            </ListItem>
          </List>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Analysis completed on {new Date(results.timestamp).toLocaleString()}
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default DNSResults;
