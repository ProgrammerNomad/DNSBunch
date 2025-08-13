import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  IconButton,
  Collapse
} from '@mui/material';
import {
  CheckCircle,
  Warning,
  Error,
  Info,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';

import { NormalResultsProps, NormalTableRow, CheckResult, DNSRecord } from '../types/dns';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pass':
      return <CheckCircle color="success" />;
    case 'warning':
      return <Warning color="warning" />;
    case 'error':
      return <Error color="error" />;
    default:
      return <Info color="info" />;
  }
};

export function NormalResults({ data }: NormalResultsProps) {
  const [expandedRows, setExpandedRows] = React.useState<Set<number>>(new Set());

  const toggleRowExpansion = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  // Convert DNS check results to table format
  const convertToTableFormat = (): NormalTableRow[] => {
    const rows: NormalTableRow[] = [];
    
    // Process each check type
    Object.entries(data.checks).forEach(([checkType, result]) => {
      const category = getCategoryForCheck(checkType);
      const testName = getTestNameForCheck(checkType);
      const { status, information, details } = formatCheckResult(checkType, result);
      
      rows.push({
        category,
        status,
        testName,
        information,
        details
      });
    });

    return rows.sort((a, b) => {
      // Sort by category first, then by status (errors first, then warnings, then pass/info)
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      
      const statusOrder = { error: 0, warning: 1, pass: 2, info: 3 };
      return statusOrder[a.status] - statusOrder[b.status];
    });
  };

  const getCategoryForCheck = (checkType: string): string => {
    const categoryMap: Record<string, string> = {
      ns: 'NS',
      soa: 'SOA',
      a: 'WWW',
      aaaa: 'WWW',
      cname: 'WWW',
      mx: 'MX',
      spf: 'Mail',
      dmarc: 'Mail',
      dkim: 'Mail',
      ptr: 'Mail',
      txt: 'DNS',
      caa: 'Security',
      dnssec: 'Security',
      axfr: 'Security',
      glue: 'DNS',
      wildcard: 'DNS'
    };
    return categoryMap[checkType] || 'Other';
  };

  const getTestNameForCheck = (checkType: string): string => {
    const nameMap: Record<string, string> = {
      ns: 'Nameserver Records',
      soa: 'SOA Record',
      a: 'A Records (IPv4)',
      aaaa: 'AAAA Records (IPv6)',
      cname: 'CNAME Records',
      mx: 'MX Records',
      spf: 'SPF Record',
      dmarc: 'DMARC Policy',
      dkim: 'DKIM Records',
      ptr: 'Reverse DNS (PTR)',
      txt: 'TXT Records',
      caa: 'CAA Records',
      dnssec: 'DNSSEC Validation',
      axfr: 'Zone Transfer Check',
      glue: 'Glue Records',
      wildcard: 'Wildcard Records'
    };
    return nameMap[checkType] || checkType.toUpperCase();
  };

  const formatCheckResult = (checkType: string, result: CheckResult) => {
    // Normalize status to expected values
    const originalStatus = result.status || 'info';
    const status: 'pass' | 'warning' | 'error' | 'info' = 
      originalStatus === 'success' ? 'pass' : 
      originalStatus === 'fail' ? 'error' : 
      originalStatus as 'pass' | 'warning' | 'error' | 'info';
    
    let information = '';
    let details = '';

    // Format information based on check type
    switch (checkType) {
      case 'ns':
        if (result.records && result.records.length > 0) {
          const hosts = result.records.map((ns: DNSRecord) => ns.host as string).filter(Boolean);
          information = `Found ${result.records.length} nameserver(s): ${hosts.join(', ')}`;
          details = result.records.map((ns: DNSRecord) => 
            `${ns.host as string} [${ns.ip as string || 'No IP'}]`
          ).join('\n');
        }
        break;
        
      case 'soa':
        if (result.record && typeof result.record === 'object') {
          const soa = result.record as Record<string, unknown>;
          information = `Primary: ${soa.mname as string}, Serial: ${soa.serial as string}`;
          details = `Primary nameserver: ${soa.mname as string}\nAdmin email: ${soa.rname as string}\nSerial: ${soa.serial as string}\nRefresh: ${soa.refresh as string}\nRetry: ${soa.retry as string}\nExpire: ${soa.expire as string}\nMinimum TTL: ${soa.minimum as string}`;
        }
        break;
        
      case 'mx':
        if (result.records && result.records.length > 0) {
          information = `Found ${result.records.length} mail server(s)`;
          details = result.records.map((mx: DNSRecord) => 
            `${mx.priority || 'N/A'} ${mx.host as string} [${mx.ip as string || 'No IP'}]`
          ).join('\n');
        }
        break;
        
      case 'a':
      case 'aaaa':
        if (result.records && result.records.length > 0) {
          const ips = result.records.map((r: DNSRecord) => 
            (r.ip || r.address || r) as string
          ).filter(Boolean);
          information = `Found ${ips.length} IP address(es): ${ips.slice(0, 3).join(', ')}${ips.length > 3 ? '...' : ''}`;
          details = ips.join('\n');
        }
        break;
        
      case 'spf':
        if (result.record && typeof result.record === 'string') {
          information = `SPF record found: ${result.record.substring(0, 60)}${result.record.length > 60 ? '...' : ''}`;
          details = result.record;
        }
        break;
        
      case 'dmarc':
        if (result.record) {
          information = 'DMARC policy found';
          details = typeof result.record === 'string' ? result.record : JSON.stringify(result.record, null, 2);
        }
        break;
        
      default:
        if (result.records && Array.isArray(result.records)) {
          information = `Found ${result.records.length} record(s)`;
          details = result.records.map((r: DNSRecord) => JSON.stringify(r, null, 2)).join('\n');
        } else if (result.record) {
          information = 'Record found';
          details = typeof result.record === 'string' ? result.record : JSON.stringify(result.record, null, 2);
        }
    }

    // Add issues to information if any
    if (result.issues && result.issues.length > 0) {
      if (information) information += '. ';
      information += `Issues: ${result.issues.slice(0, 2).join(', ')}${result.issues.length > 2 ? '...' : ''}`;
      if (details) details += '\n\n';
      details += `Issues:\n${result.issues.join('\n')}`;
    }

    if (!information) {
      information = status === 'pass' ? 'Check passed' : 'No data available';
    }

    return { status, information, details };
  };

  const tableRows = convertToTableFormat();

  // Group rows by category for rowspan calculation
  const groupedRows = tableRows.reduce((acc, row, index) => {
    const existing = acc.find(group => group.category === row.category);
    if (existing) {
      existing.rows.push({ ...row, index });
    } else {
      acc.push({ category: row.category, rows: [{ ...row, index }] });
    }
    return acc;
  }, [] as Array<{ category: string; rows: Array<NormalTableRow & { index: number }> }>);

  return (
    <Paper elevation={2} sx={{ mt: 3 }}>
      <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h5" gutterBottom>
          DNS Analysis Results for {data.domain}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Analysis completed at {new Date(data.timestamp).toLocaleString()}
        </Typography>
      </Box>

      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 'bold', width: '120px' }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '80px' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '200px' }}>Test Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Information</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '50px' }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groupedRows.map((group) => 
              group.rows.map((row, rowIndex) => (
                <React.Fragment key={row.index}>
                  <TableRow 
                    hover
                    sx={{ 
                      '&:hover': { bgcolor: 'grey.50' },
                      cursor: row.details ? 'pointer' : 'default'
                    }}
                    onClick={() => row.details && toggleRowExpansion(row.index)}
                  >
                    {/* Category cell with rowspan */}
                    {rowIndex === 0 && (
                      <TableCell
                        rowSpan={group.rows.length}
                        sx={{ 
                          verticalAlign: 'top',
                          fontWeight: 'bold',
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          borderRight: '2px solid white'
                        }}
                      >
                        {group.category}
                      </TableCell>
                    )}
                    
                    {/* Status */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getStatusIcon(row.status)}
                      </Box>
                    </TableCell>
                    
                    {/* Test Name */}
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {row.testName}
                      </Typography>
                    </TableCell>
                    
                    {/* Information */}
                    <TableCell>
                      <Typography variant="body2">
                        {row.information}
                      </Typography>
                    </TableCell>
                    
                    {/* Expand button */}
                    <TableCell>
                      {row.details && (
                        <IconButton 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRowExpansion(row.index);
                          }}
                        >
                          {expandedRows.has(row.index) ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded details row */}
                  {row.details && (
                    <TableRow>
                      <TableCell 
                        colSpan={5} 
                        sx={{ 
                          py: 0,
                          borderBottom: expandedRows.has(row.index) ? '1px solid' : 'none',
                          borderColor: 'divider'
                        }}
                      >
                        <Collapse in={expandedRows.has(row.index)}>
                          <Box sx={{ py: 2, px: 2, bgcolor: 'grey.25' }}>
                            <Typography variant="body2" component="pre" sx={{ 
                              whiteSpace: 'pre-wrap',
                              fontFamily: 'monospace',
                              fontSize: '0.875rem'
                            }}>
                              {row.details}
                            </Typography>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
        <Typography variant="body2" color="text.secondary">
          Processed in {((Date.now() - new Date(data.timestamp).getTime()) / 1000).toFixed(3)} seconds.
        </Typography>
      </Box>
    </Paper>
  );
}