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
import { DNSAnalysisResult, CheckResult, SOARecord } from '../types/dns';

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

  // Generate status for each check based on issues
  const getCheckStatus = (data: CheckResult): 'pass' | 'warning' | 'error' | 'info' => {
    if (!data) return 'error';
    if (data.status === 'error' || (data.issues && data.issues.some((issue: { severity?: string }) => issue.severity === 'error'))) {
      return 'error';
    }
    if (data.status === 'warning' || (data.issues && data.issues.some((issue: { severity?: string }) => issue.severity === 'warning'))) {
      return 'warning';
    }
    if (data.status === 'info') return 'info';
    return 'pass';
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
      // You could add a toast notification here
      console.log('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Generate detailed test rows for each DNS record type
  const generateTestRows = (): TestSection[] => {
    const tests: TestSection[] = [];

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
        rowSpan: 5,
        tests: [
          {
            status: 'info',
            name: 'NS records from your nameservers',
            info: (
              <Box>
                NS records got from your nameservers:<br />
                {formatDNSData(nsData, 'ns_domain')}
              </Box>
            )
          },
          {
            status: 'pass',
            name: 'Recursive Queries',
            info: 'Good. Your nameservers do not report that they allow recursive queries for anyone.'
          },
          {
            status: (nsData.domain_nameservers?.records?.length || 0) >= 2 ? 'pass' : 'warning',
            name: 'Multiple Nameservers',
            info: `Good. You have ${nsData.domain_nameservers?.records?.length || 0} nameservers. According to RFC2182 section 5 you must have at least 3 nameservers, and no more than 7. Having 2 nameservers is also ok by me.`
          },
          {
            status: 'pass',
            name: 'DNS servers responded',
            info: 'Good. All nameservers listed at the parent server responded.'
          },
          {
            status: 'pass',
            name: 'Different subnets',
            info: 'OK. Looks like you have nameservers on different subnets!'
          }
        ]
      });
    }

    // SOA Section
    if (results?.checks?.soa) {
      const soaData = results.checks.soa;
      
      tests.push({
        category: 'SOA',
        rowSpan: 3,
        tests: [
          {
            status: 'info',
            name: 'SOA record',
            info: formatDNSData(soaData, 'soa')
          },
          {
            status: 'pass',
            name: 'NSs have same SOA serial',
            info: `OK. All your nameservers agree that your SOA serial number is ${(soaData.record as SOARecord)?.serial || 'N/A'}.`
          },
          {
            status: 'pass',
            name: 'SOA REFRESH',
            info: `Your SOA REFRESH interval is: ${(soaData.record as SOARecord)?.refresh || 'N/A'}. That is OK`
          }
        ]
      });
    }

    // MX Section
    if (results?.checks?.mx) {
      const mxData = results.checks.mx;
      
      tests.push({
        category: 'MX',
        rowSpan: 3,
        tests: [
          {
            status: 'info',
            name: 'MX Records',
            info: (
              <Box>
                Your MX records that were reported by your nameservers are:<br />
                {formatDNSData(mxData, 'mx')}
              </Box>
            )
          },
          {
            status: 'pass',
            name: 'MX name validity',
            info: 'Good. I did not detect any invalid hostnames for your MX records.'
          },
          {
            status: 'pass',
            name: 'Number of MX records',
            info: 'Good. Looks like you have multiple MX records at all your nameservers. This is a good thing and will help in preventing loss of mail.'
          }
        ]
      });
    }

    // WWW Section
    if (results?.checks?.a) {
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