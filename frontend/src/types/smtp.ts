export type SmtpTestResponse = {
  domain: string | null;
  host: string;
  port: number;
  status: 'pass' | 'warning' | 'error' | 'info';
  banner: string;
  ehlo_response: string;
  issues: string[];
  error: string | null;
};
