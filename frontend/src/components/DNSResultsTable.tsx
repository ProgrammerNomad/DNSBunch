'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as PassIcon,
  Warning as WarnIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { DNSAnalysisResult, CheckResult, SOARecord, DNSCheck } from '../types/dns';

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

interface DNSResultsTableProps {
  results: DNSAnalysisResult;
  domain: string;
}

interface StatusIconProps {
  status: 'pass' | 'warning' | 'error' | 'info';
}

interface TestResult {
  status: 'pass' | 'warning' | 'error' | 'info';
  name: string;
  info: React.ReactNode;
}

interface TestSection {
  category: string;
  rowSpan: number;
  tests: TestResult[];
}

interface NSRecord {
  host: string;
  ips?: string[];
  ttl?: number;
  source?: string;
}

interface MXRecord {
  priority?: number;
  exchange?: string;
  host?: string;
  ips?: string[];
  ip?: string;
  glue?: boolean;
}

interface ARecords {
  root?: { records?: string[] };
  www?: { records?: string[] };
}

interface ParentDelegation {
  records?: string[];
  nameserver_ips?: Record<string, string[]>;
  ttl?: number;
  tld_server_used?: string;
  status?: string;
  error?: string;
}

interface DomainNameservers {
  records?: string[];
  nameserver_ips?: Record<string, string[]>;
  ttl?: number;
}

interface EnhancedCheckResult extends CheckResult {
  parent_delegation?: ParentDelegation;
  domain_nameservers?: DomainNameservers;
  parent_server?: string;
  glue_records?: boolean;
}

const StatusIcon: React.FC<StatusIconProps> = ({ status }) => {
  switch (status) {
    case 'pass':
      return <PassIcon sx={{ color: '#4caf50', fontSize: '20px' }} />;
    case 'warning':
      return <WarnIcon sx={{ color: '#ff9800', fontSize: '20px' }} />;
    case 'error':
      return <ErrorIcon sx={{ color: '#f44336', fontSize: '20px' }} />;
    case 'info':
    default:
      return <InfoIcon sx={{ color: '#2196f3', fontSize: '20px' }} />;
  }
};

export function DNSResultsTable({ results, domain }: DNSResultsTableProps) {

  // Helper function to format check details in a human-readable way
  const formatCheckDetails = (details: Record<string, unknown> | string[] | string | undefined, checkType: string): React.ReactNode => {
    if (!details) return null;

    // Handle string arrays (like nameserver lists)
    if (Array.isArray(details)) {
      if (details.length === 0) return null;
      
      // Check if it's an array of objects
      if (typeof details[0] === 'object' && details[0] !== null) {
        const obj = details[0] as Record<string, unknown>;
        
        // Glue records format
        if ('nameserver' in obj && 'ips' in obj && 'has_glue' in obj) {
          return (
            <Box sx={{ mt: 1 }}>
              {details.map((item: unknown, idx: number) => {
                const glueObj = item as Record<string, unknown>;
                const ips = glueObj.ips as string[];
                return (
                  <Box key={idx} component="span" display="block" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    <strong>{String(glueObj.nameserver)}</strong>: {Array.isArray(ips) ? ips.join(', ') : String(ips)}
                  </Box>
                );
              })}
            </Box>
          );
        }
        
        // Ping result format
        if ('ns' in obj && 'ip' in obj) {
          return (
            <Box sx={{ mt: 1 }}>
              {details.map((item: unknown, idx: number) => {
                const pingObj = item as Record<string, unknown>;
                return (
                  <Box key={idx} component="span" display="block" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {String(pingObj.ns)}: {String(pingObj.ip)} {pingObj.ping === false ? '(no ping response)' : pingObj.ping === true ? '(ping successful)' : ''}
                  </Box>
                );
              })}
            </Box>
          );
        }
        
        // MX records format
        if ('host' in obj && 'priority' in obj) {
          return (
            <Box sx={{ mt: 1 }}>
              {details.map((item: unknown, idx: number) => {
                const mxObj = item as Record<string, unknown>;
                const ips = mxObj.ips as Array<{ ip: string; type: string }>;
                const ipStr = Array.isArray(ips) ? ips.map(i => i.ip).join(', ') : '';
                const priority = String(mxObj.priority);
                const host = String(mxObj.host);
                return (
                  <Box key={idx} component="span" display="block" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {priority} <strong>{host}</strong> [{ipStr}]
                  </Box>
                );
              })}
            </Box>
          );
        }
        
        // Fallback for unknown object arrays
        return null;
      }
      
      // Simple string array - show as comma-separated list
      return (
        <Box sx={{ mt: 0.5, fontFamily: 'monospace', fontSize: '0.85rem' }}>
          {details.join(', ')}
        </Box>
      );
    }

    // Handle string details
    if (typeof details === 'string') {
      return <Box sx={{ mt: 0.5, fontSize: '0.85rem' }}>{details}</Box>;
    }

    // Handle object details
    if (typeof details === 'object') {
      const obj = details as Record<string, unknown>;
      
      // DNS servers responded format (non_responsive, responsive arrays)
      if ('responsive' in obj || 'non_responsive' in obj) {
        const responsive = obj.responsive as string[] | undefined;
        const nonResponsive = obj.non_responsive as string[] | undefined;
        
        return (
          <Box sx={{ mt: 1 }}>
            {nonResponsive && Array.isArray(nonResponsive) && (
              <Box sx={{ mb: 0.5 }}>
                <Typography component="span" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                  non_responsive:
                </Typography>{' '}
                <Typography component="span" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  {nonResponsive.length > 0 ? nonResponsive.join(', ') : '(none)'}
                </Typography>
              </Box>
            )}
            {responsive && Array.isArray(responsive) && (
              <Box>
                <Typography component="span" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                  responsive:
                </Typography>{' '}
                <Typography component="span" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  {responsive.join(', ')}
                </Typography>
              </Box>
            )}
          </Box>
        );
      }
      
      // Different subnets format (subnet_count, subnets array)
      if ('subnets' in obj && 'subnet_count' in obj) {
        const subnets = obj.subnets as string[] | undefined;
        const subnetCount = obj.subnet_count as number;
        
        return (
          <Box sx={{ mt: 1 }}>
            <Box sx={{ mb: 0.5 }}>
              <Typography component="span" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                subnet_count:
              </Typography>{' '}
              <Typography component="span" sx={{ fontSize: '0.85rem' }}>
                {subnetCount}
              </Typography>
            </Box>
            <Box>
              <Typography component="span" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                subnets:
              </Typography>{' '}
              <Typography component="span" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                {subnets && Array.isArray(subnets) ? subnets.join(', ') : ''}
              </Typography>
            </Box>
          </Box>
        );
      }
      
      // Special handling for comparison checks (domain_count, match, only_in_domain, only_in_parent)
      if ('match' in obj && typeof obj.match === 'boolean') {
        const onlyInDomain = obj.only_in_domain as string[] | undefined;
        const onlyInParent = obj.only_in_parent as string[] | undefined;
        
        return (
          <Box sx={{ mt: 1 }}>
            {onlyInDomain && Array.isArray(onlyInDomain) && onlyInDomain.length > 0 && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                  Only in domain: 
                </Typography>
                <Box component="span" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  {onlyInDomain.join(', ')}
                </Box>
              </Box>
            )}
            {onlyInParent && Array.isArray(onlyInParent) && onlyInParent.length > 0 && (
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                  Only in parent: 
                </Typography>
                <Box component="span" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  {onlyInParent.join(', ')}
                </Box>
              </Box>
            )}
          </Box>
        );
      }
      
      // Special handling for glue records (nameserver IPs)
      if (checkType.includes('glue') || checkType.includes('Glue')) {
        const entries = Object.entries(obj);
        if (entries.length > 0 && entries.every(([_key, value]) => Array.isArray(value))) {
          return (
            <Box sx={{ mt: 1 }}>
              {entries.map(([ns, ips]) => {
                const ipArray = ips as string[];
                return (
                  <Box key={ns} component="span" display="block" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    <strong>{ns}</strong>: {Array.isArray(ipArray) ? ipArray.join(', ') : String(ips)}
                  </Box>
                );
              })}
            </Box>
          );
        }
      }
      
      // Special handling for hostname validation
      if ('invalid_hostnames' in obj) {
        const invalidHostnames = obj.invalid_hostnames as string[] | undefined;
        return invalidHostnames && Array.isArray(invalidHostnames) && invalidHostnames.length > 0 ? (
          <Box sx={{ mt: 1, fontFamily: 'monospace', fontSize: '0.85rem' }}>
            Invalid: {invalidHostnames.join(', ')}
          </Box>
        ) : null;
      }
      
      // Generic object display - show as key: value pairs
      return (
        <Box sx={{ mt: 1 }}>
          {Object.entries(obj).map(([key, value]) => (
            <Box key={key} component="span" display="block" sx={{ fontSize: '0.85rem' }}>
              <strong>{key}:</strong> {Array.isArray(value) ? (value as string[]).join(', ') : String(value)}
            </Box>
          ))}
        </Box>
      );
    }

    return null;
  };

  // Helper function to format DNS data
  const formatDNSData = (data: CheckResult, type: string) => {
    if (!data) return 'No data available';
    
    switch (type) {
      case 'ns':
        // Handle the new NS data structure
        if (data.records && Array.isArray(data.records)) {
          return (data.records as NSRecord[]).map((record: NSRecord, index: number) => (
            <Box key={index} component="span" display="block">
              <strong>{record.host}</strong>&nbsp;&nbsp;
              [{record.ips?.join(', ') || 'No IP'}]
              &nbsp;&nbsp;[TTL={record.ttl || 'N/A'}]
            </Box>
          ));
        } else if ((data as EnhancedCheckResult).parent_delegation?.records) {
          // Fallback to parent delegation data
          const enhancedData = data as EnhancedCheckResult;
          return enhancedData.parent_delegation!.records!.map((ns: string, index: number) => {
            const ips = enhancedData.parent_delegation!.nameserver_ips?.[ns] || [];
            return (
              <Box key={index} component="span" display="block">
                <strong>{ns}</strong>&nbsp;&nbsp;
                [{ips.join(', ') || 'No IP'}]
                &nbsp;&nbsp;[TTL={enhancedData.parent_delegation!.ttl || 'N/A'}]
              </Box>
            );
          });
        }
        return 'No nameserver records found';

      case 'ns_domain':
        // Format domain nameserver records
        const enhancedData = data as EnhancedCheckResult;
        if (enhancedData.domain_nameservers?.records) {
          return enhancedData.domain_nameservers.records.map((ns: string, index: number) => {
            const ips = enhancedData.domain_nameservers!.nameserver_ips?.[ns] || [];
            return (
              <Box key={index} component="span" display="block">
                <strong>{ns}</strong>&nbsp;&nbsp;
                [{ips.join(', ') || 'No IP'}]
                &nbsp;&nbsp;[TTL={enhancedData.domain_nameservers!.ttl || 'N/A'}]
              </Box>
            );
          });
        }
        return 'No nameserver records found from domain servers';

      case 'soa':
        if (!data.record) return 'No SOA record found';
        const soaRecord = data.record as SOARecord;
        return (
          <Box>
            Primary nameserver: <strong>{soaRecord.mname}</strong><br />
            Hostmaster E-mail address: <strong>{soaRecord.rname}</strong><br />
            Serial #: <strong>{soaRecord.serial}</strong><br />
            Refresh: <strong>{soaRecord.refresh}</strong><br />
            Retry: <strong>{soaRecord.retry}</strong><br />
            Expire: <strong>{soaRecord.expire}</strong><br />
            Default TTL: <strong>{soaRecord.minimum}</strong><br />
          </Box>
        );

      case 'a':
        // Handle A records structure which has root and www nested objects
        if (!data.records || typeof data.records !== 'object') {
          return 'No A records found';
        }
        
        const aRecords = data.records as unknown as ARecords;
        const elements: React.ReactElement[] = [];
        
        // Display root domain A records
        if (aRecords.root?.records && Array.isArray(aRecords.root.records)) {
          aRecords.root.records.forEach((ip: string, index: number) => {
            elements.push(
              <Box key={`root-${index}`} component="span" display="block">
                <strong>{domain}</strong>&nbsp;&nbsp;
                [{ip}]
                &nbsp;&nbsp;[TTL=N/A]
              </Box>
            );
          });
        }
        
        // Display www subdomain A records
        if (aRecords.www?.records && Array.isArray(aRecords.www.records)) {
          aRecords.www.records.forEach((ip: string, index: number) => {
            elements.push(
              <Box key={`www-${index}`} component="span" display="block">
                <strong>www.{domain}</strong>&nbsp;&nbsp;
                [{ip}]
                &nbsp;&nbsp;[TTL=N/A]
              </Box>
            );
          });
        }
        
        return elements.length > 0 ? elements : 'No A records found';

      case 'mx':
        return (data.records as MXRecord[])?.map((record: MXRecord, index: number) => (
          <Box key={index} component="span" display="block">
            {record.priority}&nbsp;&nbsp;
            <strong>{record.exchange || record.host}</strong>&nbsp;&nbsp;
            [{record.ips?.join(', ') || record.ip || 'No IP'}]
            &nbsp;&nbsp;{record.glue ? '(glue)' : '(no glue)'}
          </Box>
        )) || 'No MX records found';

      default:
        return JSON.stringify(data, null, 2);
    }
  };

  // Share functionality
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/${encodeURIComponent(domain)}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `DNS Analysis Results for ${domain}`,
          text: `Check out the DNS analysis results for ${domain}`,
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
      // You could add a toast notification here
      console.log('Link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  // Generate detailed test rows for each DNS record type
  const generateTestRows = (): TestSection[] => {
    const tests: TestSection[] = [];

    // Domain Status Section - Only show if there are issues (warning or error)
    if (results?.checks?.domain_status) {
      const statusData = results.checks.domain_status as DomainStatusResult;
      const status = statusData.status as 'pass' | 'warning' | 'error';
      
      // Only show Domain Status section if there are actual issues
      if (status === 'warning' || status === 'error') {
        tests.push({
          category: 'Domain Status',
        rowSpan: 1,
        tests: [
          {
            status,
            name: 'Domain Health Check',
            info: (
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {String(statusData.message || 'Domain status check completed')}
                </Typography>
                
                {/* Critical Issues */}
                {statusData.critical_issues && Array.isArray(statusData.critical_issues) && statusData.critical_issues.length > 0 && (
                  <Box sx={{ mt: 1, p: 1, backgroundColor: '#ffebee', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="error" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      Critical Issues:
                    </Typography>
                    {statusData.critical_issues.map((issue: string, index: number) => (
                      <Typography key={index} variant="body2" color="error" sx={{ ml: 1 }}>
                        • {issue}
                      </Typography>
                    ))}
                  </Box>
                )}
                
                {/* Warnings */}
                {statusData.warnings && Array.isArray(statusData.warnings) && statusData.warnings.length > 0 && (
                  <Box sx={{ mt: 1, p: 1, backgroundColor: '#fff3e0', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="warning.main" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      Warnings:
                    </Typography>
                    {statusData.warnings.map((warning: string, index: number) => (
                      <Typography key={index} variant="body2" color="warning.main" sx={{ ml: 1 }}>
                        • {warning}
                      </Typography>
                    ))}
                  </Box>
                )}
                
                {/* Recommendations */}
                {statusData.recommendations && Array.isArray(statusData.recommendations) && statusData.recommendations.length > 0 && (
                  <Box sx={{ mt: 1, p: 1, backgroundColor: '#f3e5f5', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      Recommendations:
                    </Typography>
                    {statusData.recommendations.map((rec: string, index: number) => (
                      <Typography key={index} variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        {rec}
                      </Typography>
                    ))}
                  </Box>
                )}
                
                {/* Technical Details */}
                {statusData.detailed_checks && typeof statusData.detailed_checks === 'object' && (
                  <Box sx={{ mt: 1, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      Technical Details:
                    </Typography>
                    {Object.entries(statusData.detailed_checks).map(([checkName, checkResult]: [string, DomainStatusDetailCheck]) => (
                      <Typography key={checkName} variant="body2" color="text.secondary" sx={{ ml: 1, fontSize: '0.85rem' }}>
                        • {checkName}: {checkResult?.status || 'unknown'} - {checkResult?.message || 'No details'}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Box>
            )
          }
        ]
      });
      }
    }

    // Parent/NS Records Section
    if (results?.checks?.ns) {
      const nsData = results.checks.ns as EnhancedCheckResult;
      
      tests.push({
        category: 'Parent',
        rowSpan: 5,
        tests: [
          {
            status: 'info',
            name: 'Domain NS records',
            info: (
              <Box>
                Nameserver records returned by the parent servers are:<br />
                {formatDNSData(nsData, 'ns')}
                <br /><br />
                <strong>{nsData.parent_server || nsData.parent_delegation?.tld_server_used || 'Parent server'}</strong> was kind enough to give us that information.
              </Box>
            )
          },
          {
            status: nsData.parent_delegation?.status === 'error' ? 'error' : 'pass',
            name: 'TLD Parent Check',
            info: nsData.parent_delegation?.status === 'error' 
              ? `Error: Could not contact parent servers for your domain. ${nsData.parent_delegation?.error || ''}`
              : 'Good. The parent server has information for your TLD. This is a good thing as there are some other domain extensions that are missing a direct check.'
          },
          {
            status: (nsData.parent_delegation?.records && nsData.parent_delegation.records.length > 0) ? 'pass' : 'error',
            name: 'Your nameservers are listed',
            info: (nsData.parent_delegation?.records && nsData.parent_delegation.records.length > 0)
              ? 'Good. The parent server has your nameservers listed. This is a must if you want to be found as anyone that does not know your DNS servers will first ask the parent nameservers.'
              : 'Error: The parent server does not have your nameservers listed.'
          },
          {
            status: nsData.glue_records ? 'pass' : 'warning',
            name: 'DNS Parent sent Glue',
            info: nsData.glue_records
              ? 'Good. The parent nameserver sent GLUE, meaning he sent your nameservers as well as the IPs of your nameservers. Glue records are A records that are associated with NS records to provide "bootstrapping" information to the nameserver.'
              : 'Warning: No glue records found from parent nameserver.'
          },
          {
            status: (nsData.records as NSRecord[])?.every((ns: NSRecord) => ns.ips && ns.ips.length > 0) ? 'pass' : 'error',
            name: 'Nameservers A records',
            info: (nsData.records as NSRecord[])?.every((ns: NSRecord) => ns.ips && ns.ips.length > 0)
              ? 'Good. Every nameserver listed has A records. This is a must if you want to be found.'
              : 'Error: Some nameservers do not have A records.'
          }
        ]
      });

      // NS Section  
      tests.push({
        category: 'NS',
        rowSpan: (nsData.checks || []).length || 5,
        tests: (nsData.checks || []).map((check: DNSCheck) => ({
          status: check.status as 'pass' | 'warning' | 'error' | 'info',
          name: check.type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          info: (
            <Box>
              <Typography variant="body2">{check.message}</Typography>
              {check.details && formatCheckDetails(check.details, check.type)}
            </Box>
          )
        }))
      });
    }

    // SOA Section
    if (results?.checks?.soa) {
      const soaData = results.checks.soa;
      
      tests.push({
        category: 'SOA',
        rowSpan: (soaData.checks || []).length || 3,
        tests: (soaData.checks || []).map((check: DNSCheck) => ({
          status: check.status as 'pass' | 'warning' | 'error' | 'info',
          name: check.type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          info: (
            <Box>
              <Typography variant="body2">{check.message}</Typography>
              {check.details && typeof check.details === 'object' && Object.keys(check.details).length > 0 && check.type === 'soa_record' && (
                <Box sx={{ mt: 1, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  {Object.entries(check.details).map(([key, value]) => (
                    <Box key={key}>
                      <strong>{key}:</strong> {String(value)}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )
        }))
      });
    }

    // MX Section
    if (results?.checks?.mx) {
      const mxData = results.checks.mx;
      
      tests.push({
        category: 'MX',
        rowSpan: (mxData.checks || []).length || 3,
        tests: (mxData.checks || []).map((check: DNSCheck) => ({
          status: check.status as 'pass' | 'warning' | 'error' | 'info',
          name: check.type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          info: (
            <Box>
              <Typography variant="body2">{check.message}</Typography>
              {check.details && formatCheckDetails(check.details, check.type)}
            </Box>
          )
        }))
      });
    }

    // WWW Section - Handle new dedicated WWW check
    if (results?.checks?.www) {
      const wwwData = results.checks.www as WWWCheckResult;
      const wwwChecks = wwwData.checks || [];
      
      const wwwTests: TestResult[] = [];
      
      wwwChecks.forEach((check) => {
        let status: 'pass' | 'warning' | 'error' | 'info' = 'info';
        if (check.status === 'pass') status = 'pass';
        else if (check.status === 'warning') status = 'warning';
        else if (check.status === 'error') status = 'error';
        else status = 'info';
        
        let testName = check.type;
        if (check.type === 'www_a_record') testName = 'WWW A Record';
        else if (check.type === 'www_ip_public') testName = 'IPs are public';
        else if (check.type === 'www_cname') testName = 'WWW CNAME';
        
        wwwTests.push({
          status,
          name: testName,
          info: <Box dangerouslySetInnerHTML={{ __html: check.message || '' }} />
        });
      });
      
      if (wwwTests.length > 0) {
        tests.push({
          category: 'WWW',
          rowSpan: wwwTests.length,
          tests: wwwTests
        });
      }
    }
    // Fallback to old WWW display if new www check is not available
    else if (results?.checks?.a) {
      const aData = results.checks.a;
      
      tests.push({
        category: 'WWW',
        rowSpan: 2,
        tests: [
          {
            status: 'info',
            name: 'WWW A Record',
            info: (
              <Box>
                Your www.{domain} A record is:<br />
                {formatDNSData(aData, 'a')}
              </Box>
            )
          },
          {
            status: 'pass',
            name: 'IPs are public',
            info: 'OK. All of your WWW IPs appear to be public IPs.'
          }
        ]
      });
    }

    return tests;
  };

  const testSections = generateTestRows();

  return (
    <Paper elevation={2} sx={{ mt: 3 }}>
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            DNS Analysis Results for {domain}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comprehensive DNS and mail server diagnostics
          </Typography>
        </Box>
        <Tooltip title="Share this DNS analysis">
          <IconButton 
            onClick={handleShare}
            color="primary"
            size="large"
          >
            <ShareIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold', minWidth: '100px' }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '60px', textAlign: 'center' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: '200px' }}>Test name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Information</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {testSections.map((section, sectionIndex) => 
              section.tests.map((test, testIndex) => (
                <TableRow 
                  key={`${sectionIndex}-${testIndex}`}
                  sx={{ 
                    '&:hover': { backgroundColor: '#f9f9f9' },
                    backgroundColor: test.status === 'error' ? '#ffebee' : 
                                   test.status === 'warning' ? '#fff3e0' : 
                                   test.status === 'info' ? '#f3f4f6' : 'transparent'
                  }}
                >
                  {testIndex === 0 && (
                    <TableCell 
                      rowSpan={section.rowSpan} 
                      sx={{ 
                        verticalAlign: 'top',
                        fontWeight: 'bold',
                        backgroundColor: '#ffffff',
                        borderRight: '2px solid #e0e0e0'
                      }}
                    >
                      {section.category}
                    </TableCell>
                  )}
                  <TableCell sx={{ textAlign: 'center', py: 1 }}>
                    <StatusIcon status={test.status} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'medium' }}>
                    {test.name}
                  </TableCell>
                  <TableCell sx={{ maxWidth: '500px' }}>
                    <Typography variant="body2" component="div">
                      {test.info}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ p: 2, textAlign: 'center', borderTop: '1px solid #e0e0e0', backgroundColor: '#f9f9f9' }}>
        <Typography variant="body2" color="text.secondary">
          Analysis completed • Powered by DNSBunch
        </Typography>
      </Box>
    </Paper>
  );
}