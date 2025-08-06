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
  Stack,
  LinearProgress,
  Badge,
  Avatar,
  CardActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress
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
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Shield as ShieldIcon,
  Cloud as CloudIcon,
  Computer as ComputerIcon,
  Lock as LockIcon,
  Public as PublicIcon,
  VerifiedUser as VerifiedUserIcon,
  BugReport as BugReportIcon,
  NotificationImportant as NotificationImportantIcon,
  Assignment as AssignmentIcon,
  VisibilityOff as VisibilityOffIcon,
  AutoAwesome as AutoAwesomeIcon
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
    'DNS Foundation': {
      icon: <DnsIcon />,
      color: '#1976d2',
      gradient: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
      description: 'Core DNS settings that make your domain work on the internet',
      priority: 'critical',
      checks: ['ns', 'soa', 'a', 'aaaa'],
      explanations: {
        ns: {
          title: 'Nameservers (NS Records)',
          description: 'Think of nameservers as the "address book" of the internet. They tell everyone where to find information about your domain.',
          importance: 'Essential - Without working nameservers, nothing else works',
          userFriendly: 'Your domain needs at least 2 nameservers for reliability. They should be fast and always available.',
          whatItMeans: {
            pass: 'Great! Your nameservers are properly configured and working correctly.',
            warning: 'Your nameservers work but could be improved for better reliability.',
            error: 'Critical issue! Your nameservers are not working properly. This will break your website and email.'
          },
          recommendations: {
            pass: 'Keep monitoring your nameservers to ensure they stay online.',
            warning: 'Consider using multiple nameserver providers for better redundancy.',
            error: 'Contact your domain registrar or hosting provider immediately to fix nameserver issues.'
          }
        },
        soa: {
          title: 'Start of Authority (SOA Record)',
          description: 'This contains administrative information about your domain, like how often other servers should check for updates.',
          importance: 'Important for DNS management and synchronization',
          userFriendly: 'The SOA record helps other servers know when your DNS information has changed.',
          whatItMeans: {
            pass: 'Your SOA record is properly configured with good values.',
            warning: 'SOA record could be optimized for better performance.',
            error: 'SOA record has serious issues that could affect DNS updates.'
          },
          recommendations: {
            pass: 'Your DNS timing settings are optimal.',
            warning: 'Consider adjusting refresh intervals for better DNS propagation.',
            error: 'Contact your DNS provider to fix SOA record configuration.'
          }
        },
        a: {
          title: 'IPv4 Addresses (A Records)',
          description: 'These tell browsers the exact internet address (IP) where your website lives.',
          importance: 'Critical - Without these, visitors cannot reach your website',
          userFriendly: 'A records are like your home address - they tell people exactly where to find you online.',
          whatItMeans: {
            pass: 'Perfect! Your website has valid IP addresses and can be reached.',
            warning: 'Your website is reachable but there may be some configuration issues.',
            error: 'Major problem! Your website cannot be reached because A records are missing or invalid.'
          },
          recommendations: {
            pass: 'Your website addressing is working perfectly.',
            warning: 'Review your hosting configuration for any IP address issues.',
            error: 'Contact your hosting provider immediately - your website is unreachable.'
          }
        },
        aaaa: {
          title: 'IPv6 Addresses (AAAA Records)',
          description: 'The newer version of internet addresses. Not required now, but increasingly important for the future.',
          importance: 'Optional but recommended for future compatibility',
          userFriendly: 'IPv6 is like having a newer postal system with more addresses available.',
          whatItMeans: {
            pass: 'Excellent! Your website supports the latest internet addressing.',
            warning: 'IPv6 could be better configured.',
            error: 'IPv6 has configuration issues.',
            info: 'IPv6 is not configured, which is okay for now but consider adding it.'
          },
          recommendations: {
            pass: 'You\'re future-ready with IPv6 support!',
            warning: 'Review your IPv6 configuration.',
            error: 'Fix IPv6 configuration issues.',
            info: 'Consider adding IPv6 support for better future compatibility.'
          }
        }
      }
    },
    'Website & Content': {
      icon: <WebIcon />,
      color: '#9c27b0',
      gradient: 'linear-gradient(135deg, #9c27b0 0%, #e1bee7 100%)',
      description: 'Settings that control how people access your website',
      priority: 'important',
      checks: ['cname', 'txt', 'wildcard'],
      explanations: {
        cname: {
          title: 'Website Aliases (CNAME Records)',
          description: 'These create shortcuts to your website, like making "www.yoursite.com" work the same as "yoursite.com".',
          importance: 'Important for user experience and SEO',
          userFriendly: 'CNAME records ensure all variations of your domain name work properly.',
          whatItMeans: {
            pass: 'Great! All your domain variations work correctly.',
            warning: 'Some domain variations might not work as expected.',
            error: 'Critical issues with domain aliases that could confuse visitors.'
          },
          recommendations: {
            pass: 'Your domain variations are working perfectly.',
            warning: 'Review your CNAME configuration to ensure all variations work.',
            error: 'Fix CNAME issues to prevent visitor confusion.'
          }
        },
        txt: {
          title: 'Text Information (TXT Records)',
          description: 'These contain various information about your domain, often used for verification and services.',
          importance: 'Various purposes - often required for third-party services',
          userFriendly: 'TXT records are like notes attached to your domain for various services.',
          whatItMeans: {
            pass: 'Your TXT records are properly configured.',
            warning: 'Some TXT records could be improved.',
            error: 'TXT record configuration issues detected.'
          },
          recommendations: {
            pass: 'Your domain verification and service records look good.',
            warning: 'Review TXT records for optimization opportunities.',
            error: 'Fix TXT record issues to ensure services work properly.'
          }
        },
        wildcard: {
          title: 'Wildcard Configuration',
          description: 'Checks if your domain responds to any subdomain name (like anythinghere.yoursite.com).',
          importance: 'Configuration check - can affect subdomain behavior',
          userFriendly: 'Wildcard DNS makes any subdomain automatically work, which can be useful or risky.',
          whatItMeans: {
            pass: 'Your wildcard configuration is appropriate for your needs.',
            warning: 'Wildcard configuration may have unintended consequences.',
            error: 'Wildcard configuration issues that could cause problems.'
          },
          recommendations: {
            pass: 'Your subdomain configuration looks good.',
            warning: 'Review if wildcard DNS is really needed for your use case.',
            error: 'Fix wildcard configuration to prevent security issues.'
          }
        }
      }
    },
    'Email & Communication': {
      icon: <EmailIcon />,
      color: '#d32f2f',
      gradient: 'linear-gradient(135deg, #d32f2f 0%, #ffcdd2 100%)',
      description: 'Everything related to email delivery and security for your domain',
      priority: 'critical',
      checks: ['mx', 'spf', 'dmarc', 'dkim', 'ptr'],
      explanations: {
        mx: {
          title: 'Email Servers (MX Records)',
          description: 'These tell other email providers where to deliver emails sent to your domain.',
          importance: 'Critical for receiving email',
          userFriendly: 'MX records are like your email postal address - without them, you won\'t get any email.',
          whatItMeans: {
            pass: 'Perfect! Your email is properly configured and should work reliably.',
            warning: 'Email works but could be more reliable or faster.',
            error: 'Major problem! You cannot receive emails due to MX configuration issues.',
            info: 'No email is configured for this domain.'
          },
          recommendations: {
            pass: 'Your email configuration is excellent.',
            warning: 'Consider improving email server configuration for better reliability.',
            error: 'Fix MX record issues immediately to receive emails.',
            info: 'Set up email if you need to receive messages at this domain.'
          }
        },
        spf: {
          title: 'Email Authenticity (SPF Records)',
          description: 'Prevents spammers from sending fake emails that appear to come from your domain.',
          importance: 'Critical for email security and delivery',
          userFriendly: 'SPF is like a signature that proves emails from your domain are legitimate.',
          whatItMeans: {
            pass: 'Excellent! Your emails are protected against spoofing and should deliver well.',
            warning: 'SPF is configured but could be improved for better email delivery.',
            error: 'SPF issues may cause your emails to be marked as spam.',
            info: 'No SPF record found - your emails may be treated as suspicious.'
          },
          recommendations: {
            pass: 'Your email authentication is working great.',
            warning: 'Fine-tune your SPF record for optimal email delivery.',
            error: 'Fix SPF issues to prevent emails from being marked as spam.',
            info: 'Add SPF records to improve email delivery and prevent spoofing.'
          }
        },
        dmarc: {
          title: 'Email Policy (DMARC)',
          description: 'Advanced email security that tells other servers what to do with suspicious emails from your domain.',
          importance: 'Important for email security and deliverability',
          userFriendly: 'DMARC is like having security guards for your email that decide what to do with suspicious messages.',
          whatItMeans: {
            pass: 'Outstanding! You have advanced email security protecting your domain.',
            warning: 'DMARC is configured but could be optimized.',
            error: 'DMARC configuration issues may affect email security.',
            info: 'No DMARC policy found - consider adding for better security.'
          },
          recommendations: {
            pass: 'Your advanced email security is excellent.',
            warning: 'Review DMARC policy for optimization opportunities.',
            error: 'Fix DMARC configuration to ensure proper email security.',
            info: 'Consider implementing DMARC for enhanced email security.'
          }
        },
        dkim: {
          title: 'Email Signatures (DKIM)',
          description: 'Digitally signs your emails to prove they really came from your domain and weren\'t tampered with.',
          importance: 'Important for email security and deliverability',
          userFriendly: 'DKIM is like a tamper-proof seal on your emails that proves they\'re authentic.',
          whatItMeans: {
            pass: 'Great! Your emails have digital signatures for maximum authenticity.',
            warning: 'DKIM is working but could be improved.',
            error: 'DKIM configuration issues may affect email delivery.',
            info: 'No DKIM signatures found - consider adding for better email security.'
          },
          recommendations: {
            pass: 'Your email signing is working perfectly.',
            warning: 'Optimize DKIM configuration for better performance.',
            error: 'Fix DKIM issues to ensure email authenticity.',
            info: 'Add DKIM signatures to improve email delivery and security.'
          }
        },
        ptr: {
          title: 'Email Server Identity (PTR Records)',
          description: 'Reverse DNS that helps other email servers verify your email servers are legitimate.',
          importance: 'Important for email deliverability',
          userFriendly: 'PTR records are like ID cards for your email servers that prove they\'re trustworthy.',
          whatItMeans: {
            pass: 'Excellent! Your email servers are properly identified and trusted.',
            warning: 'Email server identity could be improved.',
            error: 'Email server identity issues may hurt email delivery.',
            info: 'No email servers to check PTR records for.'
          },
          recommendations: {
            pass: 'Your email server identity is perfectly configured.',
            warning: 'Improve PTR records for better email delivery.',
            error: 'Fix PTR record issues to prevent email delivery problems.',
            info: 'PTR records will be important once you configure email.'
          }
        }
      }
    },
    'Security & Protection': {
      icon: <SecurityIcon />,
      color: '#388e3c',
      gradient: 'linear-gradient(135deg, #388e3c 0%, #c8e6c9 100%)',
      description: 'Advanced security features that protect your domain from attacks',
      priority: 'important',
      checks: ['dnssec', 'caa', 'axfr'],
      explanations: {
        dnssec: {
          title: 'DNS Security (DNSSEC)',
          description: 'Cryptographically signs your DNS records to prevent tampering and ensure authenticity.',
          importance: 'Advanced security - protects against DNS hijacking',
          userFriendly: 'DNSSEC is like having a security seal on your domain information that can\'t be faked.',
          whatItMeans: {
            pass: 'Outstanding! Your domain has advanced cryptographic protection.',
            warning: 'DNSSEC is configured but has some issues.',
            error: 'DNSSEC configuration problems that could compromise security.',
            info: 'DNSSEC is not enabled - consider adding for enhanced security.'
          },
          recommendations: {
            pass: 'Your DNS security is state-of-the-art.',
            warning: 'Review DNSSEC configuration for any issues.',
            error: 'Fix DNSSEC problems to ensure security protection.',
            info: 'Consider enabling DNSSEC for advanced security protection.'
          }
        },
        caa: {
          title: 'SSL Certificate Control (CAA Records)',
          description: 'Controls which companies are allowed to issue SSL certificates for your domain.',
          importance: 'Security feature - prevents unauthorized SSL certificates',
          userFriendly: 'CAA records are like a guest list for who can create SSL certificates for your domain.',
          whatItMeans: {
            pass: 'Great! You control who can issue SSL certificates for your domain.',
            warning: 'CAA configuration could be improved.',
            error: 'CAA record issues that could affect SSL security.',
            info: 'No CAA records found - consider adding for better SSL security.'
          },
          recommendations: {
            pass: 'Your SSL certificate security is excellent.',
            warning: 'Review CAA records for optimization.',
            error: 'Fix CAA issues to ensure SSL certificate security.',
            info: 'Add CAA records to prevent unauthorized SSL certificate issuance.'
          }
        },
        axfr: {
          title: 'DNS Transfer Security (AXFR)',
          description: 'Checks if your DNS server accidentally allows unauthorized copying of all your DNS records.',
          importance: 'Security check - prevents information disclosure',
          userFriendly: 'This checks if strangers can download all your DNS information, which would be a security risk.',
          whatItMeans: {
            pass: 'Perfect! Your DNS information is properly protected from unauthorized access.',
            warning: 'DNS transfer security could be tightened.',
            error: 'Security vulnerability! Unauthorized users can access all your DNS records.'
          },
          recommendations: {
            pass: 'Your DNS transfer security is properly configured.',
            warning: 'Review DNS transfer settings for any security gaps.',
            error: 'Fix DNS transfer vulnerability immediately to protect your information.'
          }
        }
      }
    },
    'Performance & Optimization': {
      icon: <SpeedIcon />,
      color: '#f57c00',
      gradient: 'linear-gradient(135deg, #f57c00 0%, #ffe0b2 100%)',
      description: 'Settings that affect how fast and efficiently your domain works',
      priority: 'optimization',
      checks: ['glue'],
      explanations: {
        glue: {
          title: 'DNS Speed Optimization (Glue Records)',
          description: 'Helps speed up DNS lookups by providing nameserver IP addresses directly.',
          importance: 'Performance optimization - reduces DNS lookup time',
          userFriendly: 'Glue records are like express lanes that help people find your website faster.',
          whatItMeans: {
            pass: 'Excellent! Your DNS is optimized for the fastest possible lookups.',
            warning: 'DNS speed could be improved with better glue record configuration.',
            error: 'Missing glue records may slow down access to your website.'
          },
          recommendations: {
            pass: 'Your DNS performance optimization is perfect.',
            warning: 'Optimize glue records for better DNS performance.',
            error: 'Add missing glue records to improve website access speed.'
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

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical': return <NotificationImportantIcon color="error" />;
      case 'important': return <AssignmentIcon color="warning" />;
      case 'optimization': return <TrendingUpIcon color="info" />;
      default: return <InfoIcon />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'important': return 'warning';
      case 'optimization': return 'info';
      default: return 'default';
    }
  };

  const getStatusMessage = (checkType, status, checkData) => {
    const explanation = Object.values(checkCategories)
      .find(cat => cat.explanations[checkType])?.explanations[checkType];
    
    if (!explanation) return 'Check completed.';
    
    return explanation.whatItMeans[status] || explanation.whatItMeans.pass || 'Check completed.';
  };

  const getRecommendation = (checkType, status, checkData) => {
    const explanation = Object.values(checkCategories)
      .find(cat => cat.explanations[checkType])?.explanations[checkType];
    
    if (!explanation) return '';
    
    return explanation.recommendations[status] || explanation.recommendations.pass || '';
  };

  const formatRecordData = (data) => {
    if (typeof data === 'string') return data;
    if (typeof data === 'object' && data !== null) {
      return JSON.stringify(data, null, 2);
    }
    return String(data);
  };

  const renderQuickFacts = (checkType, checkData) => {
    const facts = [];
    
    // Add specific quick facts based on check type
    switch (checkType) {
      case 'ns':
        if (checkData.count) {
          facts.push(`${checkData.count} nameserver${checkData.count > 1 ? 's' : ''} configured`);
        }
        break;
      case 'mx':
        if (checkData.count) {
          facts.push(`${checkData.count} email server${checkData.count > 1 ? 's' : ''} configured`);
        }
        break;
      case 'a':
        if (checkData.records?.root?.count || checkData.records?.www?.count) {
          const rootCount = checkData.records.root?.count || 0;
          const wwwCount = checkData.records.www?.count || 0;
          facts.push(`${rootCount} root IP${rootCount > 1 ? 's' : ''}, ${wwwCount} www IP${wwwCount > 1 ? 's' : ''}`);
        }
        break;
      case 'spf':
        if (checkData.dns_lookups !== undefined) {
          facts.push(`${checkData.dns_lookups}/10 DNS lookups used`);
        }
        break;
      case 'dkim':
        if (checkData.records?.length) {
          facts.push(`${checkData.records.length} DKIM selector${checkData.records.length > 1 ? 's' : ''} found`);
        }
        break;
      default:
        if (checkData.count !== undefined) {
          facts.push(`${checkData.count} record${checkData.count > 1 ? 's' : ''} found`);
        }
    }

    if (facts.length === 0) return null;

    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TimelineIcon fontSize="small" />
          Quick Facts
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {facts.map((fact, index) => (
            <Chip 
              key={index}
              label={fact}
              size="small"
              variant="outlined"
              color="primary"
            />
          ))}
        </Stack>
      </Box>
    );
  };

  const renderTechnicalDetails = (checkData) => {
    return (
      <Box>
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
                    <TableCell><strong>#</strong></TableCell>
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

        {checkData.record && !Array.isArray(checkData.record) && (
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

        {/* Handle nested records (like A records with root/www) */}
        {checkData.records && typeof checkData.records === 'object' && !Array.isArray(checkData.records) && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Detailed Records:
            </Typography>
            {Object.entries(checkData.records).map(([key, value]) => (
              <Paper key={key} variant="outlined" sx={{ p: 2, mb: 1, bgcolor: 'grey.50' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, textTransform: 'capitalize' }}>
                  {key}:
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                  {formatRecordData(value)}
                </Typography>
              </Paper>
            ))}
          </Box>
        )}

        {checkData.issues && checkData.issues.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="error" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BugReportIcon fontSize="small" />
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

        {/* Additional technical information */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Additional Information:
          </Typography>
          <Grid container spacing={1}>
            {checkData.count !== undefined && (
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Records: {checkData.count}
                </Typography>
              </Grid>
            )}
            {checkData.dns_lookups !== undefined && (
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  DNS Lookups: {checkData.dns_lookups}
                </Typography>
              </Grid>
            )}
            {checkData.open !== undefined && (
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Zone Transfer: {checkData.open ? 'Open (⚠️)' : 'Secured (✅)'}
                </Typography>
              </Grid>
            )}
            {checkData.has_wildcard !== undefined && (
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Wildcard DNS: {checkData.has_wildcard ? 'Yes' : 'No'}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      </Box>
    );
  };

  const renderOverallSummary = () => {
    const summary = results.summary || {};
    const totalChecks = summary.total || 0;
    const passedChecks = summary.passed || 0;
    const warningChecks = summary.warnings || 0;
    const errorChecks = summary.errors || 0;

    const getOverallStatus = () => {
      if (errorChecks > 0) return { 
        status: 'error', 
        message: 'Critical Issues Found',
        description: 'Your domain has serious problems that need immediate attention.',
        priority: 'high'
      };
      if (warningChecks > 0) return { 
        status: 'warning', 
        message: 'Some Issues Need Attention',
        description: 'Your domain works but could be improved for better performance and security.',
        priority: 'medium'
      };
      return { 
        status: 'success', 
        message: 'All Checks Passed',
        description: 'Excellent! Your domain configuration is working perfectly.',
        priority: 'low'
      };
    };

    const overall = getOverallStatus();
    const scorePercentage = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

    return (
      <Card 
        sx={{ 
          mb: 4, 
          borderTop: 4, 
          borderTopColor: overall.status === 'error' ? 'error.main' : overall.status === 'warning' ? 'warning.main' : 'success.main',
          background: overall.status === 'error' 
            ? 'linear-gradient(135deg, #ffebee 0%, #ffffff 100%)'
            : overall.status === 'warning'
            ? 'linear-gradient(135deg, #fff8e1 0%, #ffffff 100%)'
            : 'linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%)'
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box>
              <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {getStatusIcon(overall.status)}
                DNS Analysis for {results.domain}
              </Typography>
              
              <Typography variant="h5" color={`${overall.status}.main`} gutterBottom>
                {overall.message}
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {overall.description}
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress
                  variant="determinate"
                  value={100}
                  size={100}
                  thickness={4}
                  sx={{ color: 'grey.300' }}
                />
                <CircularProgress
                  variant="determinate"
                  value={scorePercentage}
                  size={100}
                  thickness={4}
                  sx={{
                    color: overall.status === 'error' ? 'error.main' : overall.status === 'warning' ? 'warning.main' : 'success.main',
                    position: 'absolute',
                    left: 0,
                  }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                  }}
                >
                  <Typography variant="h4" component="div" color="text.primary">
                    {scorePercentage}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Score
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={6} md={3}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%)',
                  border: '1px solid #4caf50'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h4" color="success.main">{passedChecks}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">Passed</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #fff8e1 0%, #ffffff 100%)',
                  border: '1px solid #ff9800'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <WarningIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h4" color="warning.main">{warningChecks}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">Warnings</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #ffebee 0%, #ffffff 100%)',
                  border: '1px solid #f44336'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <ErrorIcon color="error" sx={{ mr: 1 }} />
                  <Typography variant="h4" color="error.main">{errorChecks}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">Errors</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)',
                  border: '1px solid #2196f3'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <AssessmentIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h4" color="text.primary">{totalChecks}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">Total Checks</Typography>
              </Paper>
            </Grid>
          </Grid>

          {errorChecks > 0 && (
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
              icon={<NotificationImportantIcon />}
            >
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Immediate Action Required!
              </Typography>
              <Typography variant="body2">
                Your domain has {errorChecks} critical issue{errorChecks > 1 ? 's' : ''} that could prevent your website and email from working properly. 
                These should be fixed immediately to avoid service disruption.
              </Typography>
            </Alert>
          )}

          {warningChecks > 0 && errorChecks === 0 && (
            <Alert 
              severity="warning" 
              sx={{ mb: 2 }}
              icon={<AutoAwesomeIcon />}
            >
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Optimization Opportunities
              </Typography>
              <Typography variant="body2">
                Your domain works well but has {warningChecks} area{warningChecks > 1 ? 's' : ''} that could be improved 
                for better performance, security, or reliability.
              </Typography>
            </Alert>
          )}

          {errorChecks === 0 && warningChecks === 0 && (
            <Alert 
              severity="success" 
              sx={{ mb: 2 }}
              icon={<VerifiedUserIcon />}
            >
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Perfect Configuration!
              </Typography>
              <Typography variant="body2">
                Congratulations! Your domain configuration is excellent. All DNS checks passed successfully, 
                and your domain is optimally configured for performance, security, and reliability.
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
      else if (status === 'info') stats.info++;
      return stats;
    }, { passed: 0, warnings: 0, errors: 0, info: 0 });

    const getCategoryStatus = () => {
      if (categoryStats.errors > 0) return 'error';
      if (categoryStats.warnings > 0) return 'warning';
      return 'success';
    };

    const categoryStatus = getCategoryStatus();
    const categoryScore = categoryChecks.length > 0 ? Math.round((categoryStats.passed / categoryChecks.length) * 100) : 0;

    return (
      <Card 
        key={categoryName} 
        sx={{ 
          mb: 3,
          background: categoryData.gradient,
          '&:hover': {
            transform: 'translateY(-2px)',
            transition: 'transform 0.2s ease-in-out',
            boxShadow: 4
          }
        }}
      >
        <CardHeader
          avatar={
            <Avatar
              sx={{ 
                background: categoryData.color,
                width: 56,
                height: 56,
                boxShadow: 2
              }}
            >
              {categoryData.icon}
            </Avatar>
          }
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {categoryName}
              </Typography>
              <Chip 
                icon={getPriorityIcon(categoryData.priority)}
                label={categoryData.priority?.toUpperCase() || 'NORMAL'}
                color={getPriorityColor(categoryData.priority)}
                size="small"
                variant="outlined"
              />
              <Chip 
                icon={getStatusIcon(categoryStatus)}
                label={`${categoryStats.passed}/${categoryChecks.length} Passed`}
                color={getStatusColor(categoryStatus)}
                size="small"
              />
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                ml: 'auto'
              }}>
                <Typography variant="h6" color={categoryStatus === 'error' ? 'error.main' : categoryStatus === 'warning' ? 'warning.main' : 'success.main'}>
                  {categoryScore}%
                </Typography>
                <CircularProgress
                  variant="determinate"
                  value={categoryScore}
                  size={24}
                  thickness={4}
                  sx={{
                    color: categoryStatus === 'error' ? 'error.main' : categoryStatus === 'warning' ? 'warning.main' : 'success.main'
                  }}
                />
              </Box>
            </Box>
          }
          subheader={
            <Typography variant="body1" sx={{ mt: 1, fontWeight: 500 }}>
              {categoryData.description}
            </Typography>
          }
          action={
            <IconButton 
              onClick={() => toggleSection(categoryName)}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
              }}
            >
              {expandedSections[categoryName] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          }
        />
        
        <Collapse in={expandedSections[categoryName]}>
          <CardContent sx={{ pt: 0 }}>
            <Grid container spacing={2}>
              {categoryChecks.map(checkType => {
                const checkData = results.checks[checkType];
                const explanation = categoryData.explanations[checkType];
                
                return (
                  <Grid item xs={12} md={6} key={checkType}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        height: '100%',
                        background: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(10px)',
                        border: `2px solid ${checkData.status === 'error' ? '#f44336' : checkData.status === 'warning' ? '#ff9800' : '#4caf50'}`
                      }}
                    >
                      <CardHeader
                        avatar={getStatusIcon(checkData.status)}
                        title={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              {explanation?.title || checkType.toUpperCase()}
                            </Typography>
                            <Chip 
                              label={checkData.status.toUpperCase()} 
                              color={getStatusColor(checkData.status)}
                              size="small"
                              sx={{ fontWeight: 'bold' }}
                            />
                          </Box>
                        }
                        subheader={
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {explanation?.description}
                          </Typography>
                        }
                        action={
                          <Tooltip title={explanation?.importance || 'DNS check'} arrow>
                            <IconButton size="small">
                              <HelpIcon />
                            </IconButton>
                          </Tooltip>
                        }
                      />
                      
                      <CardContent sx={{ pt: 0 }}>
                        {/* User-friendly explanation */}
                        <Alert 
                          severity={checkData.status === 'pass' ? 'success' : checkData.status === 'info' ? 'info' : checkData.status} 
                          sx={{ mb: 2 }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                            What this means:
                          </Typography>
                          <Typography variant="body2">
                            {getStatusMessage(checkType, checkData.status, checkData)}
                          </Typography>
                        </Alert>

                        {/* Recommendation */}
                        {getRecommendation(checkType, checkData.status, checkData) && (
                          <Alert severity="info" sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                              Recommendation:
                            </Typography>
                            <Typography variant="body2">
                              {getRecommendation(checkType, checkData.status, checkData)}
                            </Typography>
                          </Alert>
                        )}

                        {/* Quick Facts */}
                        {renderQuickFacts(checkType, checkData)}

                        {/* Technical Details Accordion */}
                        <Accordion>
                          <AccordionSummary 
                            expandIcon={<ExpandMoreIcon />}
                            sx={{ bgcolor: 'rgba(0,0,0,0.05)' }}
                          >
                            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <ComputerIcon fontSize="small" />
                              Technical Details & Raw Data
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            {renderTechnicalDetails(checkData)}
                          </AccordionDetails>
                        </Accordion>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Collapse>
      </Card>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {renderOverallSummary()}
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ 
          mb: 2,
          background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold'
        }}>
          📋 Detailed Analysis by Category
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Your DNS configuration has been organized into easy-to-understand categories. 
          Click on each category below to see detailed information about your domain's configuration. 
          We explain everything in simple terms, so you don't need to be a technical expert to understand the results.
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>💡 How to read these results:</strong> Green means everything is working perfectly, 
            yellow means it works but could be improved, and red means there's a problem that needs attention. 
            Each section includes recommendations for what to do next.
          </Typography>
        </Alert>
      </Box>

      {Object.entries(checkCategories)
        .sort(([,a], [,b]) => {
          const priorityOrder = { critical: 0, important: 1, optimization: 2 };
          return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
        })
        .map(([categoryName, categoryData]) =>
          renderCategorySection(categoryName, categoryData)
        )}

      {/* Help and Support Section */}
      <Card sx={{ mt: 4, background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HelpIcon color="primary" />
            Need Help Understanding These Results?
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                🚨 If you see errors (red):
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="Contact your domain registrar or hosting provider immediately" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="These issues can prevent your website and email from working" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Don't ignore critical errors - they need immediate attention" />
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                ⚠️ If you see warnings (yellow):
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="Your domain works but could be improved" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Consider the recommendations for better performance" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="These improvements can enhance security and reliability" />
                </ListItem>
              </List>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            📞 Who to contact for help:
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                <DnsIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="subtitle2" gutterBottom>DNS Issues</Typography>
                <Typography variant="body2" color="text.secondary">
                  Contact your domain registrar or DNS provider
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                <EmailIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="subtitle2" gutterBottom>Email Issues</Typography>
                <Typography variant="body2" color="text.secondary">
                  Contact your email service provider or hosting company
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                <WebIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="subtitle2" gutterBottom>Website Issues</Typography>
                <Typography variant="body2" color="text.secondary">
                  Contact your web hosting provider or developer
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block', textAlign: 'center' }}>
            Analysis completed on {new Date(results.timestamp).toLocaleString()} • 
            Results are current as of the time of analysis
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default DNSResults;
