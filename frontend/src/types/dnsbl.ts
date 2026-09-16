export type DnsblRow = {
  rbl_id: string;
  label: string;
  zone: string;
  ip: string;
  query: string;
  result: 'listed' | 'clean' | 'error';
  response: string | null;
  message: string | null;
};

export type DnsblLookupResponse = {
  input: { domain: string | null; ip: string | null };
  ips_checked: string[];
  status: 'pass' | 'warning' | 'error' | 'info';
  rows: DnsblRow[];
  issues: string[];
};
