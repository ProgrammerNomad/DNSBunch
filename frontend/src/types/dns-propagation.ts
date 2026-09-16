export type DnsPropagationRow = {
  resolver_id: string;
  resolver_ip: string;
  answers: string[];
  error: string | null;
};

export type DnsPropagationResponse = {
  name: string;
  record_type: string;
  agreement_percent: number;
  status: 'pass' | 'warning' | 'error';
  rows: DnsPropagationRow[];
  issues: string[];
  error: string | null;
};
