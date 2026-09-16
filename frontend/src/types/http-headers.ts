export type HttpHeaderRow = {
  name: string;
  value: string;
  security: boolean;
};

export type SecurityHeaderRow = {
  name: string;
  present: boolean;
  value: string | null;
};

export type HttpHeadersResponse = {
  input_url: string;
  final_url: string | null;
  status_code: number | null;
  status: 'pass' | 'warning' | 'error';
  headers: HttpHeaderRow[];
  security_headers: SecurityHeaderRow[];
  issues: string[];
  error: string | null;
};
