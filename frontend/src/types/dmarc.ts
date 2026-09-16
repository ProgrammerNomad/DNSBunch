export type DmarcTagRow = {
  tag: string;
  value: string;
  label: string;
};

export type DmarcCheckerResponse = {
  domain: string;
  status: 'pass' | 'warning' | 'error' | 'info';
  record: string;
  parsed: Record<string, string>;
  issues: string[];
  tags: DmarcTagRow[];
};
