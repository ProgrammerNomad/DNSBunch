export interface DNSRecord {
  name?: string;
  host?: string;
  address?: string;
  ip?: string;
  ips?: string[];
  ttl?: number;
  priority?: number;
  exchange?: string;
  target?: string;
  cname?: string;
  data?: string;
  text?: string;
  glue?: boolean;
  flags?: number;
  tag?: string;
  value?: string;
  selector?: string;
  key_data?: string;
  algorithm?: string;
  mechanisms?: string[];
  include_count?: number;
  policy?: string;
  subdomain_policy?: string;
  percentage?: number;
  hostname?: string;
  ptr?: string;
}

export interface SOARecord {
  mname: string;
  rname: string;
  serial: string | number;
  refresh: string | number;
  retry: string | number;
  expire: string | number;
  minimum: string | number;
}

export interface Issue {
  severity: 'error' | 'warning' | 'info';
  message: string;
  description?: string;
  code?: string;
}

export interface CheckResult {
  status: 'pass' | 'warning' | 'error' | 'info' | 'success' | 'fail';
  records?: DNSRecord[];
  record?: SOARecord | DNSRecord | string;
  issues?: Issue[];
  parent_server?: string;
  glue_records?: boolean;
  recursive_queries_disabled?: boolean;
  glue_consistent?: boolean;
  glue_provided?: boolean;
  ns_records_match?: boolean;
  all_servers_responded?: boolean;
  valid_ns_names?: boolean;
  authoritative?: boolean;
  no_cname_at_apex?: boolean;
  ns_no_cname?: boolean;
  different_subnets?: boolean;
  public_ips?: boolean;
  tcp_connections?: boolean;
  different_asn?: boolean;
  no_stealth_ns?: boolean;
  serial_consistent?: boolean;
  mname_in_ns?: boolean;
  valid_serial?: boolean;
  valid_refresh?: boolean;
  valid_retry?: boolean;
  valid_expire?: boolean;
  valid_minimum?: boolean;
  consistent_across_ns?: boolean;
  valid_hostnames?: boolean;
  no_cname?: boolean;
  no_cname_in_a?: boolean;
  mx_is_hostname?: boolean;
  consistent_ips?: boolean;
  no_duplicate_ips?: boolean;
  ptr_records?: DNSRecord[];
  [key: string]: unknown;
}

export interface AnalysisSummary {
  total: number;
  passed: number;
  warnings: number;
  errors: number;
}

export interface DNSAnalysisResult {
  domain: string;
  status: 'completed' | 'error';
  timestamp: string;
  checks: Record<string, CheckResult>;
  summary?: AnalysisSummary;
}

export interface NormalTableRow {
  category: string;
  status: 'pass' | 'warning' | 'error' | 'info';
  testName: string;
  information: string;
  details?: string;
}

export interface DNSResultsProps {
  data: DNSAnalysisResult;
  loading?: boolean;
  error?: string | null;
  resultType?: 'normal' | 'advanced';
  onRetry?: () => void;
  onClear?: () => void;
}

export interface NormalResultsProps {
  data: DNSAnalysisResult;
}

export interface DomainSearchFormProps {
  onSearch: (domain: string, checks: string[], resultType: 'normal' | 'advanced') => void;
  loading?: boolean;
  error?: string | null;
}

// DNS Record Types
export const DNS_RECORD_TYPES = [
  'ns', 'soa', 'a', 'aaaa', 'mx', 'spf', 'txt', 'cname',
  'ptr', 'caa', 'dmarc', 'dkim', 'glue', 'dnssec', 'axfr', 'wildcard'
] as const;

export type DNSRecordType = typeof DNS_RECORD_TYPES[number];