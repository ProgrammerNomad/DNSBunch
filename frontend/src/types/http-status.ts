export type HttpStatusResponse = {
  input_url: string;
  final_url: string | null;
  status_code: number | null;
  latency_ms: number;
  status: 'pass' | 'warning' | 'error';
  issues: string[];
  error: string | null;
};
