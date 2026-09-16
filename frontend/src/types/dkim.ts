export type DkimTagRow = {
  tag: string;
  value: string;
  label: string;
};

export type DkimCheckerResponse = {
  domain: string;
  selector: string;
  host: string;
  status: 'pass' | 'warning' | 'error' | 'info';
  record: string;
  parsed: Record<string, string>;
  issues: string[];
  tags: DkimTagRow[];
};
