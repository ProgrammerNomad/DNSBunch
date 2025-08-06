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
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  HelpOutline as HelpIcon,
  Dns as DnsIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Language as WebIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const DNSResultsUserFriendly = ({ results }) => {
  const [expandedSections, setExpandedSections] = useState({});
  const [helpDialog, setHelpDialog] = useState({ open: false, content: null });

  if (!results || !results.checks) {
    return (
      <Container maxWidth="lg">
        <Alert severity="info">No DNS results to display</Alert>
      </Container>
    );
  }

  // Categorize checks with user-friendly information
  const checkCategories = {
    'Essential DNS Setup': {
      icon: <DnsIcon />,
      color: '#1976d2',
      description: 'Core DNS settings that make your website accessible',
      checks: ['ns', 'soa', 'a', 'aaaa'],
      priority: 'high'
    },
    'Website Accessibility': {
      icon: <WebIcon />,
      color: '#2e7d32',
      description: 'Settings that control how visitors reach your website',
      checks: ['cname', 'txt'],
      priority: 'high'
    },
    'Email Configuration': {
      icon: <EmailIcon />,
      color: '#d32f2f',
      description: 'Email delivery and security settings',
      checks: ['mx', 'spf', 'dmarc', 'dkim', 'ptr'],
      priority: 'medium'
    },
    'Security Features': {
      icon: <SecurityIcon />,
      color: '#f57c00',
      description: 'Advanced security and protection features',
      checks: ['dnssec', 'caa', 'axfr'],
      priority: 'medium'
    },
    'Performance & Advanced': {
      icon: <SpeedIcon />,
      color: '#7b1fa2',
      description: 'Performance optimizations and advanced features',
      checks: ['glue', 'wildcard'],
      priority: 'low'
    }
  };

  // User-friendly explanations for each check
  const checkExplanations = {
    ns: {
      title: 'Nameservers',
      simple: 'The "phone book operators" for your domain',
      detailed: 'Nameservers tell the internet where to find information about your domain. Think of them as the operators who direct traffic to your website.',
      whyImportant: 'Without working nameservers, your website and email won\'t work at all.',
      whenGood: 'Your domain has properly configured nameservers that respond quickly and correctly.',
      commonIssues: 'Missing nameservers, slow response times, or configuration errors.',
      userAction: 'Contact your domain registrar or DNS provider if there are issues.'
    },
    soa: {
      title: 'Start of Authority',
      simple: 'Administrative information about your domain',
      detailed: 'Contains important settings like refresh intervals, contact information, and version numbers for your DNS zone.',
      whyImportant: 'Ensures DNS information stays synchronized across all nameservers.',
      whenGood: 'SOA record has appropriate refresh intervals and valid contact information.',
      commonIssues: 'Incorrect refresh intervals, invalid email addresses, or missing information.',
      userAction: 'DNS administrator should verify and update SOA record settings.'
    },
    a: {
      title: 'IPv4 Website Address',
      simple: 'Points your domain to your website\'s server',
      detailed: 'A records connect your domain name (like yourdomain.com) to the actual server IP address where your website is hosted.',
      whyImportant: 'Without A records, visitors can\'t reach your website.',
      whenGood: 'Your domain correctly points to valid, accessible server IP addresses.',
      commonIssues: 'Missing A records, pointing to wrong IP, or server downtime.',
      userAction: 'Contact your web hosting provider to verify server IP addresses.'
    },
    aaaa: {
      title: 'IPv6 Website Address',
      simple: 'Modern internet addressing for better connectivity',
      detailed: 'AAAA records provide IPv6 addresses for your website. While not required, they improve accessibility for modern internet connections.',
      whyImportant: 'Ensures your website works with newer internet infrastructure.',
      whenGood: 'Your website supports both IPv4 and IPv6 connections.',
      commonIssues: 'Missing IPv6 support or incorrect IPv6 addresses.',
      userAction: 'Ask your hosting provider about IPv6 support.'
    },
    mx: {
      title: 'Email Servers',
      simple: 'Tells email where to deliver messages for your domain',
      detailed: 'MX records specify which servers handle email for your domain and in what priority order.',
      whyImportant: 'Without MX records, you won\'t receive any email.',
      whenGood: 'Email servers are properly configured and reachable.',
      commonIssues: 'Missing MX records, unreachable email servers, or wrong priorities.',
      userAction: 'Contact your email provider to verify email server settings.'
    },
    spf: {
      title: 'Email Authentication (SPF)',
      simple: 'Prevents spammers from impersonating your domain',
      detailed: 'SPF records list which servers are allowed to send email on behalf of your domain, helping prevent email spoofing.',
      whyImportant: 'Protects your domain reputation and improves email deliverability.',
      whenGood: 'SPF record properly lists authorized email servers.',
      commonIssues: 'Missing SPF record, too many DNS lookups, or overly permissive settings.',
      userAction: 'Work with your email provider to configure proper SPF records.'
    },
    dmarc: {
      title: 'Email Policy (DMARC)',
      simple: 'Advanced email security policy',
      detailed: 'DMARC tells other email servers what to do with suspicious emails claiming to be from your domain.',
      whyImportant: 'Provides strong protection against email phishing and improves deliverability.',
      whenGood: 'DMARC policy is configured with appropriate actions.',
      commonIssues: 'Missing DMARC policy or policy set to "none".',
      userAction: 'Implement DMARC with help from your email security team.'
    },
    dkim: {
      title: 'Email Signatures (DKIM)',
      simple: 'Digital signatures that prove emails are legitimate',
      detailed: 'DKIM adds cryptographic signatures to your emails, proving they really came from your domain.',
      whyImportant: 'Increases email trust and deliverability rates.',
      whenGood: 'DKIM signatures are properly configured and valid.',
      commonIssues: 'Missing DKIM keys or invalid signatures.',
      userAction: 'Configure DKIM through your email service provider.'
    },
    ptr: {
      title: 'Reverse DNS',
      simple: 'Helps email servers verify your mail servers are legitimate',
      detailed: 'PTR records provide reverse DNS lookups, allowing email servers to verify that your mail servers are legitimate.',
      whyImportant: 'Some email servers require this for accepting your emails.',
      whenGood: 'Reverse DNS matches your mail server names.',
      commonIssues: 'Missing or mismatched reverse DNS records.',
      userAction: 'Contact your email hosting provider to set up reverse DNS.'
    },
    cname: {
      title: 'Domain Aliases',
      simple: 'Makes different versions of your domain work (like www.yourdomain.com)',
      detailed: 'CNAME records create aliases, typically making www.yourdomain.com point to yourdomain.com.',
      whyImportant: 'Ensures visitors can reach your site with or without "www".',
      whenGood: 'All domain variations properly redirect to your main site.',
      commonIssues: 'Missing www CNAME or incorrect redirections.',
      userAction: 'Configure through your DNS provider or web hosting control panel.'
    },
    txt: {
      title: 'Text Records',
      simple: 'Various text-based information and verifications',
      detailed: 'TXT records store text information, often used for domain verification and service configurations.',
      whyImportant: 'Required for many third-party services and domain verification.',
      whenGood: 'TXT records properly configured for all required services.',
      commonIssues: 'Missing verification records or incorrect formatting.',
      userAction: 'Add TXT records as required by specific services.'
    },
    caa: {
      title: 'SSL Certificate Control',
      simple: 'Controls which companies can issue SSL certificates for your domain',
      detailed: 'CAA records specify which Certificate Authorities are allowed to issue SSL certificates for your domain.',
      whyImportant: 'Prevents unauthorized SSL certificate issuance.',
      whenGood: 'CAA records properly restrict certificate issuance.',
      commonIssues: 'Missing CAA records or overly restrictive settings.',
      userAction: 'Configure CAA records to allow your SSL certificate provider.'
    },
    dnssec: {
      title: 'DNS Security',
      simple: 'Cryptographic protection against DNS tampering',
      detailed: 'DNSSEC digitally signs DNS records to prevent tampering and ensure authenticity.',
      whyImportant: 'Protects against DNS hijacking and cache poisoning attacks.',
      whenGood: 'DNSSEC is properly configured with valid signatures.',
      commonIssues: 'Missing DNSSEC or broken signature chain.',
      userAction: 'Enable DNSSEC through your DNS provider.'
    },
    axfr: {
      title: 'Zone Transfer Security',
      simple: 'Checks if your DNS server accidentally shares too much information',
      detailed: 'Tests whether your DNS server allows unauthorized copying of all your DNS records.',
      whyImportant: 'Prevents information disclosure that could help attackers.',
      whenGood: 'Zone transfers are properly restricted to authorized servers only.',
      commonIssues: 'Open zone transfers that leak DNS information.',
      userAction: 'Contact your DNS provider to restrict zone transfers.'
    },
    glue: {
      title: 'DNS Performance',
      simple: 'Optimizations that make DNS lookups faster',
      detailed: 'Glue records provide IP addresses for nameservers, reducing DNS lookup time.',
      whyImportant: 'Improves website loading speed and DNS performance.',
      whenGood: 'Glue records are properly configured for optimal performance.',
      commonIssues: 'Missing glue records causing slower DNS resolution.',
      userAction: 'DNS provider can optimize glue record configuration.'
    },
    wildcard: {
      title: 'Wildcard DNS',
      simple: 'Checks for catch-all subdomain settings',
      detailed: 'Tests whether your domain has wildcard DNS that responds to any subdomain.',
      whyImportant: 'Can affect subdomain behavior and security.',
      whenGood: 'Wildcard configuration matches your intended subdomain strategy.',
      commonIssues: 'Unintended wildcard behavior or security implications.',
      userAction: 'Review wildcard DNS settings with your DNS administrator.'
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass':
        return <CheckIcon sx={{ color: '#4caf50' }} />;
      case 'warning':
        return <WarningIcon sx={{ color: '#ff9800' }} />;
      case 'error':
        return <ErrorIcon sx={{ color: '#f44336' }} />;
      default:
        return <InfoIcon sx={{ color: '#2196f3' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pass':
        return '#4caf50';
      case 'warning':
        return '#ff9800';
      case 'error':
        return '#f44336';
      default:
        return '#2196f3';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pass':
        return 'Good';
      case 'warning':
        return 'Needs Attention';
      case 'error':
        return 'Problem';
      default:
        return 'Info';
    }
  };

  const handleSectionToggle = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const openHelpDialog = (checkType) => {
    setHelpDialog({
      open: true,
      content: checkExplanations[checkType]
    });
  };

  const closeHelpDialog = () => {
    setHelpDialog({ open: false, content: null });
  };

  // Calculate overall scores
  const calculateCategoryScore = (categoryChecks) => {
    const relevantChecks = categoryChecks.filter(check => results.checks[check]);
    if (relevantChecks.length === 0) return { score: 0, total: 0 };
    
    const scores = relevantChecks.map(check => {
      const status = results.checks[check].status;
      switch (status) {
        case 'pass': return 100;
        case 'warning': return 50;
        case 'error': return 0;
        default: return 25;
      }
    });
    
    const total = scores.reduce((sum, score) => sum + score, 0);
    return { score: Math.round(total / relevantChecks.length), total: relevantChecks.length };
  };

  const getOverallHealth = () => {
    const allChecks = Object.keys(results.checks);
    const scores = allChecks.map(check => {
      const status = results.checks[check].status;
      switch (status) {
        case 'pass': return 100;
        case 'warning': return 50;
        case 'error': return 0;
        default: return 25;
      }
    });
    
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  };

  const overallHealth = getOverallHealth();

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Overall Health Score */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="h4" gutterBottom>
          DNS Health Report for {results.domain || 'Domain'}
        </Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Overall Health Score: {overallHealth}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={overallHealth} 
              sx={{ 
                height: 10, 
                borderRadius: 5,
                backgroundColor: 'rgba(255,255,255,0.3)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: overallHealth >= 80 ? '#4caf50' : overallHealth >= 60 ? '#ff9800' : '#f44336'
                }
              }} 
            />
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
              {overallHealth >= 80 && "Excellent! Your DNS configuration is in great shape."}
              {overallHealth >= 60 && overallHealth < 80 && "Good! A few improvements could optimize your setup."}
              {overallHealth >= 40 && overallHealth < 60 && "Fair. Several issues need attention."}
              {overallHealth < 40 && "Poor. Multiple critical issues require immediate attention."}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Checked: {Object.keys(results.checks).length} DNS settings<br/>
              Issues found: {results.summary?.warnings || 0} warnings, {results.summary?.errors || 0} errors
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Category Results */}
      {Object.entries(checkCategories).map(([categoryName, categoryInfo]) => {
        const categoryChecks = categoryInfo.checks.filter(check => results.checks[check]);
        if (categoryChecks.length === 0) return null;

        const { score } = calculateCategoryScore(categoryChecks);
        const isExpanded = expandedSections[categoryName];

        return (
          <Accordion 
            key={categoryName} 
            expanded={isExpanded}
            onChange={() => handleSectionToggle(categoryName)}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item>
                  <Box sx={{ color: categoryInfo.color }}>
                    {categoryInfo.icon}
                  </Box>
                </Grid>
                <Grid item xs>
                  <Typography variant="h6">{categoryName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {categoryInfo.description}
                  </Typography>
                </Grid>
                <Grid item>
                  <Chip 
                    label={`${score}%`}
                    sx={{ 
                      backgroundColor: score >= 80 ? '#4caf50' : score >= 60 ? '#ff9800' : '#f44336',
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                {categoryChecks.map(checkType => {
                  const checkResult = results.checks[checkType];
                  const explanation = checkExplanations[checkType];
                  
                  return (
                    <Card key={checkType} variant="outlined">
                      <CardContent>
                        <Grid container alignItems="flex-start" spacing={2}>
                          <Grid item>
                            {getStatusIcon(checkResult.status)}
                          </Grid>
                          <Grid item xs>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant="h6" component="span">
                                {explanation.title}
                              </Typography>
                              <Chip 
                                label={getStatusText(checkResult.status)}
                                size="small"
                                sx={{ 
                                  backgroundColor: getStatusColor(checkResult.status),
                                  color: 'white'
                                }}
                              />
                              <IconButton 
                                size="small" 
                                onClick={() => openHelpDialog(checkType)}
                                sx={{ ml: 'auto' }}
                              >
                                <HelpIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {explanation.simple}
                            </Typography>

                            {checkResult.status === 'pass' && (
                              <Alert severity="success" sx={{ mb: 2 }}>
                                <Typography variant="body2">
                                  <strong>✓ {explanation.whenGood}</strong>
                                </Typography>
                              </Alert>
                            )}

                            {checkResult.issues && checkResult.issues.length > 0 && (
                              <Alert 
                                severity={checkResult.status === 'error' ? 'error' : 'warning'} 
                                sx={{ mb: 2 }}
                              >
                                <Typography variant="body2" gutterBottom>
                                  <strong>Issues found:</strong>
                                </Typography>
                                <List dense>
                                  {checkResult.issues.map((issue, index) => (
                                    <ListItem key={index} sx={{ py: 0 }}>
                                      <ListItemText primary={issue} />
                                    </ListItem>
                                  ))}
                                </List>
                              </Alert>
                            )}

                            {checkResult.records && checkResult.records.length > 0 && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  <strong>Technical Details:</strong>
                                </Typography>
                                <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                                  <Typography variant="body2" component="pre" sx={{ 
                                    fontFamily: 'monospace', 
                                    fontSize: '0.8rem',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-all'
                                  }}>
                                    {JSON.stringify(checkResult.records, null, 2)}
                                  </Typography>
                                </Paper>
                              </Box>
                            )}
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            </AccordionDetails>
          </Accordion>
        );
      })}

      {/* Help Dialog */}
      <Dialog 
        open={helpDialog.open} 
        onClose={closeHelpDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            {helpDialog.content?.title} - Detailed Information
          </Typography>
          <IconButton onClick={closeHelpDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {helpDialog.content && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" gutterBottom>What is this?</Typography>
                <Typography variant="body1">{helpDialog.content.detailed}</Typography>
              </Box>
              
              <Box>
                <Typography variant="h6" gutterBottom>Why is this important?</Typography>
                <Typography variant="body1">{helpDialog.content.whyImportant}</Typography>
              </Box>
              
              <Box>
                <Typography variant="h6" gutterBottom>When it's working well:</Typography>
                <Typography variant="body1">{helpDialog.content.whenGood}</Typography>
              </Box>
              
              <Box>
                <Typography variant="h6" gutterBottom>Common issues:</Typography>
                <Typography variant="body1">{helpDialog.content.commonIssues}</Typography>
              </Box>
              
              <Box>
                <Typography variant="h6" gutterBottom>What you can do:</Typography>
                <Typography variant="body1">{helpDialog.content.userAction}</Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeHelpDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Processing Time */}
      {results.timestamp && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Report generated: {new Date(results.timestamp).toLocaleString()}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default DNSResultsUserFriendly;
