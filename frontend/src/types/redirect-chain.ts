export type RedirectHopRow = {
  index: number;
  url: string;
  status_code: number;
  location: string | null;
};

export type RedirectChainResponse = {
  input_url: string;
  final_url: string | null;
  final_status_code: number | null;
  status: 'pass' | 'warning' | 'error';
  hops: RedirectHopRow[];
  loop_detected: boolean;
  issues: string[];
  error: string | null;
};
