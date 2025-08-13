export interface CheckResult {
  status: 'pass' | 'warning' | 'error' | 'info';
  records?: Array<Record<string, unknown>>;
  record?: Record<string, unknown> | string;
  issues?: string[];
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
  summary: AnalysisSummary;
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