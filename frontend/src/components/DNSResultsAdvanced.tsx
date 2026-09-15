'use client';

import React, { useState } from 'react';
import { Share2, X } from 'lucide-react';

import { DnsStatusIcon } from '@/components/dns-health/dns-status-icon';
import { Box, Typography } from '@/components/dns-health/legacy-layout';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DNSAnalysisResult, CheckResult } from '../types/dns';

interface WWWCheckDetail {
  cname_chain?: Array<{ from: string; to: string }>;
  final_ips?: string[];
  public_ips?: string[];
  private_ips?: string[];
  has_cname?: boolean;
  cname_resolves?: boolean;
  [key: string]: unknown;
}

interface WWWCheck {
  type: string;
  status: 'pass' | 'warning' | 'error' | 'info';
  message: string;
  details?: WWWCheckDetail;
}

interface WWWCheckResult extends CheckResult {
  checks?: WWWCheck[];
}

interface DomainStatusDetailCheck {
  status: 'pass' | 'warning' | 'error' | 'info';
  message: string;
  details?: Record<string, unknown>;
}

interface DomainStatusResult extends CheckResult {
  critical_issues?: string[];
  warnings?: string[];
  recommendations?: string[];
  detailed_checks?: Record<string, DomainStatusDetailCheck>;
}

interface DNSResultsAdvancedProps {
  results: DNSAnalysisResult;
  domain: string;
  onClear: () => void;
}

export function DNSResultsAdvanced({ results, domain, onClear }: DNSResultsAdvancedProps) {
  const [expandedPanels, setExpandedPanels] = useState<string[]>(['summary']);

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
      } catch {
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
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const formatJsonData = (data: unknown) => {
    if (!data) return 'No data available';
    return (
      <pre className="overflow-auto rounded-md bg-muted p-4 text-sm whitespace-pre-wrap break-words">
        {JSON.stringify(data, null, 2)}
      </pre>
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
    <Card className="mt-6">
      <CardHeader className="border-b">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl">Advanced DNS Analysis for {domain}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Detailed technical analysis with raw DNS data and comprehensive validation
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={onClear}>
              <X className="mr-2 h-4 w-4" />
              Clear Results
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
      <Accordion type="multiple" value={expandedPanels} onValueChange={setExpandedPanels}>
      <AccordionItem value="summary">
        <AccordionTrigger className="px-4">
          <div className="flex flex-wrap items-center gap-2">
            <DnsStatusIcon status={overallStatus} />
            <span className="font-semibold">Summary</span>
            <Badge variant="secondary">{stats.total} Total</Badge>
            <Badge className="bg-green-600/15 text-green-700 dark:text-green-400">{stats.passed} Passed</Badge>
            {stats.warnings > 0 && <Badge className="bg-amber-500/15 text-amber-700">{stats.warnings} Warnings</Badge>}
            {stats.errors > 0 && <Badge variant="destructive">{stats.errors} Errors</Badge>}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4">
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" gutterBottom>
              DNS analysis completed for <strong>{domain}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              This advanced view shows detailed technical information, raw DNS responses, 
              and comprehensive validation results for all DNS record types.
            </Typography>
            
            {overallStatus === 'error' && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  <strong>Critical issues found:</strong> Your domain has DNS configuration errors that need immediate attention.
                </AlertDescription>
              </Alert>
            )}
            {overallStatus === 'warning' && (
              <Alert className="mb-4 border-amber-500/50 bg-amber-500/10">
                <AlertDescription>
                  <strong>Warnings detected:</strong> Your domain configuration has issues that should be reviewed.
                </AlertDescription>
              </Alert>
            )}
            {overallStatus === 'pass' && (
              <Alert className="mb-4 border-green-500/50 bg-green-500/10">
                <AlertDescription>
                  <strong>All checks passed:</strong> Your domain DNS configuration appears properly set up.
                </AlertDescription>
              </Alert>
            )}
          </Box>
          
          {/* Raw Results Summary */}
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Raw Analysis Data
          </Typography>
          {formatJsonData(results.summary || results)}
        </AccordionContent>
      </AccordionItem>

      {results?.checks &&
        Object.entries(results.checks).map(([checkType, checkData]: [string, CheckResult]) => (
        <AccordionItem key={checkType} value={checkType}>
          <AccordionTrigger className="px-4">
            <div className="flex flex-wrap items-center gap-2">
              <DnsStatusIcon status={checkData?.status || 'info'} />
              <span className="font-semibold uppercase">{checkType} Records</span>
              <Badge variant="outline">{checkData?.status || 'unknown'}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4">
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                {checkType.toUpperCase()} Record Analysis
              </Typography>
              
              {/* Special handling for Domain Status check - only show if issues exist */}
              {checkType === 'domain_status' && (checkData.status === 'warning' || checkData.status === 'error') && (
                <Box sx={{ mb: 2 }}>
                  <Alert
                    variant={checkData.status === 'error' ? 'destructive' : undefined}
                    className={checkData.status === 'warning' ? 'mb-4 border-amber-500/50' : 'mb-4'}
                  >
                    <AlertDescription className="font-semibold">
                      {String(checkData.message || 'Domain status check completed')}
                    </AlertDescription>
                  </Alert>
                  
                  {/* Detailed Status Information */}
                  {(checkData as DomainStatusResult).detailed_checks && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                        Detailed Status Checks:
                      </Typography>
                      {Object.entries((checkData as DomainStatusResult).detailed_checks!).map(([checkName, result]: [string, DomainStatusDetailCheck]) => (
                        <Box key={checkName} sx={{ mb: 1, p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <DnsStatusIcon status={result?.status || 'info'} />
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {checkName.replace('_', ' ').toUpperCase()}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {result?.message || 'No details available'}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                  
                  {/* Recommendations */}
                  {(checkData as DomainStatusResult).recommendations && Array.isArray((checkData as DomainStatusResult).recommendations) && (checkData as DomainStatusResult).recommendations!.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                        Recommendations:
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        {(checkData as DomainStatusResult).recommendations!.map((rec: string, index: number) => (
                          <Typography key={index} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {rec}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              )}

              {/* Special handling for WWW check */}
              {checkType === 'www' && (checkData as WWWCheckResult)?.checks && (
                <Box sx={{ mb: 2 }}>
                  {((checkData as WWWCheckResult).checks!).map((check, index: number) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <DnsStatusIcon status={check.status || 'info'} />
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {check.type === 'www_a_record' ? 'WWW A Record' :
                           check.type === 'www_ip_public' ? 'IPs are public' :
                           check.type === 'www_cname' ? 'WWW CNAME' :
                           check.type}
                        </Typography>
                      </Box>
                      <Alert className="mb-2">
                        <AlertDescription dangerouslySetInnerHTML={{ __html: check.message || '' }} />
                      </Alert>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Regular handling for other checks */}
              {checkType !== 'www' && checkType !== 'domain_status' && checkData?.records && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
                    Found {Array.isArray(checkData.records) ? checkData.records.length : 
                      ((checkData.records as unknown as { root?: { count?: number }, www?: { count?: number } })?.root?.count || 0) + 
                      ((checkData.records as unknown as { root?: { count?: number }, www?: { count?: number } })?.www?.count || 0)} record(s)
                  </Typography>
                </Box>
              )}

              {checkType !== 'www' && checkData?.issues && checkData.issues.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
                    Issues Found:
                  </Typography>
                  {checkData.issues.map((issue: { severity?: 'error' | 'warning' | 'info' | 'success'; message?: string; description?: string }, index: number) => (
                    <Alert
                      key={index}
                      variant={issue.severity === 'error' ? 'destructive' : undefined}
                      className="mb-2"
                    >
                      <AlertDescription>{issue.message || issue.description || 'Unknown issue'}</AlertDescription>
                    </Alert>
                  ))}
                </Box>
              )}

              <Separator className="my-4" />
              
              <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
                Raw Data:
              </Typography>
              {formatJsonData(checkData)}
            </Box>
          </AccordionContent>
        </AccordionItem>
      ))}
      </Accordion>

      <p className="border-t bg-muted/30 py-3 text-center text-sm text-muted-foreground">
        Advanced analysis completed • Raw DNS data displayed • Powered by DNSBunch
      </p>
      </CardContent>
    </Card>
  );
}