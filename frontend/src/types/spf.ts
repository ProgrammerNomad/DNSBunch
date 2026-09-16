export type SpfCheckerResponse = {
  domain: string;
  status: 'pass' | 'warning' | 'error' | 'info';
  record: string;
  issues: string[];
  dns_lookups: number;
  dns_lookup_limit: number;
  mechanisms: string[];
};
