export type MxRow = {
  priority: number;
  host: string;
  ips: string[];
  error: string | null;
};

export type MxLookupResponse = {
  domain: string;
  status: 'pass' | 'warning' | 'error' | 'info';
  count: number;
  rows: MxRow[];
  issues: string[];
};
