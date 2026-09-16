export type DomainExpiryResponse = {
  domain: string;
  expiry_date: string | null;
  days_until_expiry: number | null;
  status: 'pass' | 'warning' | 'error';
  issues: string[];
  error: string | null;
};
