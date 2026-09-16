export type WhoisFieldRow = { label: string; value: string };

export type WhoisLookupResponse = {
  domain: string;
  status: 'pass' | 'warning' | 'error';
  registrar: string | null;
  created: string | null;
  updated: string | null;
  expires: string | null;
  nameservers: string[];
  fields: WhoisFieldRow[];
  issues: string[];
  error: string | null;
  code?: string | null;
};
