export type SslInspectorResponse = {
  host: string;
  status: 'pass' | 'warning' | 'error';
  tls_version: string | null;
  subject_cn: string | null;
  issuer: string | null;
  sans: string[];
  not_before: string | null;
  not_after: string | null;
  days_until_expiry: number | null;
  hostname_match: boolean;
  issues: string[];
  error: string | null;
};
