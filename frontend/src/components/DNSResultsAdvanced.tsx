'use client';

import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert,
  Button,
  Stack,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Clear as ClearIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { DNSAnalysisResult, CheckResult } from '../types/dns';

interface DNSResultsAdvancedProps {
  results: DNSAnalysisResult;
  domain: string;
  onClear: () => void;
}

const StatusIcon: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'success':
    case 'pass':
      return <CheckCircleIcon sx={{ color: '#4caf50', fontSize: '20px' }} />;
    case 'warning':
      return <WarningIcon sx={{ color: '#ff9800', fontSize: '20px' }} />;
    case 'error':
    case 'fail':
      return <ErrorIcon sx={{ color: '#f44336', fontSize: '20px' }} />;
    case 'info':
    default:
      return <InfoIcon sx={{ color: '#2196f3', fontSize: '20px' }} />;
  }
};

export function DNSResultsAdvanced({ results, domain, onClear }: DNSResultsAdvancedProps) {
  const [expandedPanels, setExpandedPanels] = useState<Set<string>>(new Set(['summary']));

  // Share functionality
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/${encodeURIComponent(domain)}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Advanced DNS Analysis Results for ${domain}`,
          text: `Check out the advanced DNS analysis results for ${domain}`,
          url: shareUrl
        });
      } catch (err) {
        // Fallback to copy to clipboard
        copyToClipboard(shareUrl);
      }
    } else {
      // Fallback to copy to clipboard
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handlePanelChange = (panel: string) => {
    const newExpanded = new Set(expandedPanels);
    if (newExpanded.has(panel)) {
      newExpanded.delete(panel);
    } else {
      newExpanded.add(panel);
    }
    setExpandedPanels(newExpanded);
  };

  const formatJsonData = (data: unknown) => {
    if (!data) return 'No data available';
    return (
      <Box 
        component="pre" 
        sx={{ 
          backgroundColor: '#f5f5f5', 
          p: 2, 
          borderRadius: 1, 
          overflow: 'auto',
          fontSize: '0.875rem',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      >
        {JSON.stringify(data, null, 2)}
      </Box>
    );
  };

  const getOverallStatus = () => {
    if (!results || !results.checks) return 'info';
    
    const checks = Object.values(results.checks);
    if (checks.some((check: CheckResult) => check?.status === 'error')) return 'error';
    if (checks.some((check: CheckResult) => check?.status === 'warning')) return 'warning';
    return 'pass';
  };

  const getSummaryStats = () => {
    if (!results || !results.checks) return { total: 0, passed: 0, warnings: 0, errors: 0 };
    
    const checks = Object.values(results.checks);
    return {
      total: checks.length,
      passed: checks.filter((check: CheckResult) => check?.status === 'pass' || check?.status === 'success').length,
      warnings: checks.filter((check: CheckResult) => check?.status === 'warning').length,
      errors: checks.filter((check: CheckResult) => check?.status === 'error' || check?.status === 'fail').length
    };
  };

  const stats = getSummaryStats();
  const overallStatus = getOverallStatus();

  return (
    <Paper elevation={2} sx={{ mt: 3 }}>
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            Advanced DNS Analysis for {domain}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<ShareIcon />}
              onClick={handleShare}
              size="small"
            >
              Share
            </Button>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={onClear}
              size="small"
            >
              Clear Results
            </Button>
          </Stack>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Detailed technical analysis with raw DNS data and comprehensive validation
        </Typography>
      </Box>

      {/* Summary Panel */}
      <Accordion 
        expanded={expandedPanels.has('summary')}
        onChange={() => handlePanelChange('summary')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <StatusIcon status={overallStatus} />
            <Typography variant="h6">Summary</Typography>
            <Stack direction="row" spacing={1}>
              <Chip 
                label={`${stats.total} Total`} 
                size="small" 
                color="default"
              />
              <Chip 
                label={`${stats.passed} Passed`} 
                size="small" 
                color="success"
              />
              {stats.warnings > 0 && (
                <Chip 
                  label={`${stats.warnings} Warnings`} 
                  size="small" 
                  color="warning"
                />
              )}
              {stats.errors > 0 && (
                <Chip 
                  label={`${stats.errors} Errors`} 
                  size="small" 
                  color="error"
                />
              )}
            </Stack>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" gutterBottom>
              DNS analysis completed for <strong>{domain}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              This advanced view shows detailed technical information, raw DNS responses, 
              and comprehensive validation results for all DNS record types.
            </Typography>
            
            {overallStatus === 'error' && (
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Critical Issues Found:</strong> Your domain has DNS configuration 
                  errors that need immediate attention.
                </Typography>
              </Alert>
            )}
            
            {overallStatus === 'warning' && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Warnings Detected:</strong> Your domain configuration has some 
                  issues that should be reviewed.
                </Typography>
              </Alert>
            )}
            
            {overallStatus === 'pass' && (
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>All Checks Passed:</strong> Your domain DNS configuration 
                  appears to be properly set up.
                </Typography>
              </Alert>
            )}
          </Box>
          
          {/* Raw Results Summary */}
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Raw Analysis Data
          </Typography>
          {formatJsonData(results.summary || results)}
        </AccordionDetails>
      </Accordion>

      {/* Individual Check Sections */}
      {results?.checks && Object.entries(results.checks).map(([checkType, checkData]: [string, CheckResult]) => (
        <Accordion 
          key={checkType}
          expanded={expandedPanels.has(checkType)}
          onChange={() => handlePanelChange(checkType)}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <StatusIcon status={checkData?.status || 'info'} />
              <Typography variant="h6" sx={{ textTransform: 'uppercase' }}>
                {checkType} Records
              </Typography>
              <Chip 
                label={checkData?.status || 'unknown'}
                size="small"
                color={
                  checkData?.status === 'pass' || checkData?.status === 'success' ? 'success' :
                  checkData?.status === 'warning' ? 'warning' :
                  checkData?.status === 'error' || checkData?.status === 'fail' ? 'error' :
                  'default'
                }
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                {checkType.toUpperCase()} Record Analysis
              </Typography>
              
              {checkData?.records && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
                    Found {Array.isArray(checkData.records) ? checkData.records.length : 
                      ((checkData.records as unknown as { root?: { count?: number }, www?: { count?: number } })?.root?.count || 0) + 
                      ((checkData.records as unknown as { root?: { count?: number }, www?: { count?: number } })?.www?.count || 0)} record(s)
                  </Typography>
                </Box>
              )}

              {checkData?.issues && checkData.issues.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
                    Issues Found:
                  </Typography>
                  {checkData.issues.map((issue: { severity?: 'error' | 'warning' | 'info' | 'success'; message?: string; description?: string }, index: number) => (
                    <Alert 
                      key={index}
                      severity={issue.severity || 'info'}
                      sx={{ mb: 1 }}
                    >
                      <Typography variant="body2">
                        {issue.message || issue.description || 'Unknown issue'}
                      </Typography>
                    </Alert>
                  ))}
                </Box>
              )}

              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
                Raw Data:
              </Typography>
              {formatJsonData(checkData)}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Footer */}
      <Box sx={{ p: 2, textAlign: 'center', borderTop: '1px solid #e0e0e0', backgroundColor: '#f9f9f9' }}>
        <Typography variant="body2" color="text.secondary">
          Advanced analysis completed • Raw DNS data displayed • Powered by DNSBunch
        </Typography>
      </Box>
    </Paper>
  );
}