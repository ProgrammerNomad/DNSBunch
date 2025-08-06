import React from 'react';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  HelpOutline as HelpIcon
} from '@mui/icons-material';

const DNSResults = ({ results }) => {
  if (!results || !results.checks) {
    return null;
  }

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
      case 'pass': return <CheckCircleIcon />;
      case 'warning': return <WarningIcon />;
      case 'error': return <ErrorIcon />;
      case 'info': return <InfoIcon />;
      default: return <HelpIcon />;
    }
  };

  const formatRecordData = (data) => {
    if (typeof data === 'string') return data;
    if (typeof data === 'object') {
      return JSON.stringify(data, null, 2);
    }
    return String(data);
  };

  const CheckCard = ({ title, checkData, description }) => (
    <Card 
      elevation={2} 
      sx={{ 
        mb: 2,
        borderLeft: 4,
        borderLeftColor: `${getStatusColor(checkData.status)}.main`
      }}
    >
      <CardHeader
        avatar={getStatusIcon(checkData.status)}
        action={
          <Chip 
            label={checkData.status.toUpperCase()} 
            color={getStatusColor(checkData.status)}
            size="small"
          />
        }
        title={title}
        subheader={description}
        sx={{ pb: 1 }}
      />
      <CardContent sx={{ pt: 0 }}>
        {/* Show error message if present */}
        {checkData.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Error:</strong> {checkData.error}
            </Typography>
          </Alert>
        )}

        {/* Show records */}
        {checkData.records && Array.isArray(checkData.records) && checkData.records.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Records ({checkData.records.length}):
            </Typography>
            <Box 
              sx={{ 
                bgcolor: 'grey.50', 
                p: 2, 
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                overflow: 'auto'
              }}
            >
              {checkData.records.map((record, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  {formatRecordData(record)}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Show single record */}
        {checkData.record && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Record:
            </Typography>
            <Box 
              sx={{ 
                bgcolor: 'grey.50', 
                p: 2, 
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.875rem'
              }}
            >
              {formatRecordData(checkData.record)}
            </Box>
          </Box>
        )}

        {/* Show nested records (like A/AAAA) */}
        {checkData.records && typeof checkData.records === 'object' && !Array.isArray(checkData.records) && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Records:
            </Typography>
            {Object.entries(checkData.records).map(([key, value]) => (
              <Box key={key} sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {key.toUpperCase()}:
                </Typography>
                <Box 
                  sx={{ 
                    bgcolor: 'grey.50', 
                    p: 1, 
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    ml: 1
                  }}
                >
                  {formatRecordData(value)}
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {/* Show issues */}
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

        {/* Show additional info */}
        {checkData.count !== undefined && (
          <Typography variant="caption" color="text.secondary">
            Total records: {checkData.count}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const checkDescriptions = {
    ns: 'Nameserver records that handle DNS queries for this domain',
    soa: 'Start of Authority record containing domain administration info',
    a: 'IPv4 address records for the domain and www subdomain',
    aaaa: 'IPv6 address records for the domain and www subdomain',
    mx: 'Mail exchange records for email delivery',
    spf: 'Sender Policy Framework record for email authentication',
    txt: 'Text records containing various domain information',
    cname: 'Canonical name records for subdomain aliases',
    ptr: 'Pointer records for reverse DNS lookup of mail servers',
    caa: 'Certification Authority Authorization records',
    dmarc: 'Domain-based Message Authentication, Reporting & Conformance',
    dkim: 'DomainKeys Identified Mail records',
    glue: 'Glue records for in-zone nameservers',
    dnssec: 'DNS Security Extensions records',
    axfr: 'Zone transfer availability check',
    wildcard: 'Wildcard DNS record detection'
  };

  return (
    <Container maxWidth="lg" sx={{ mb: 4 }}>
      {/* Summary Card */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardHeader 
          title={`DNS Analysis Results for ${results.domain || 'Domain'}`}
          subheader={`Analysis completed at ${new Date(results.timestamp).toLocaleString()}`}
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary">
                  {results.summary?.total || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Checks
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="success.main">
                  {results.summary?.passed || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Passed
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="warning.main">
                  {results.summary?.warnings || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Warnings
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="error.main">
                  {results.summary?.errors || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Errors
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* DNS Check Results */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Detailed DNS Analysis
      </Typography>

      {Object.entries(results.checks).map(([checkType, checkData]) => (
        <CheckCard
          key={checkType}
          title={checkType.toUpperCase() + ' Records'}
          checkData={checkData}
          description={checkDescriptions[checkType]}
        />
      ))}
    </Container>
  );
};

export default DNSResults;
