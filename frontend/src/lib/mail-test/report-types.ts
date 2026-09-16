/** v2 mail tester report - UI renders this shape only (no parallel tool API calls). */

export type MailTestAuthResult = {
  result: string;
  detail: string;
};

export type MailTestReportV2 = {
  score: number;
  summary: {
    status: string;
    verdict: string;
  };
  categories: {
    authentication: { weight: number; partial: number };
    spam_analysis: { weight: number; partial: number };
    blacklists: { weight: number; partial: number };
    message_quality: { weight: number; partial: number };
  };
  message_authentication: {
    spf: MailTestAuthResult;
    dkim: MailTestAuthResult;
    dmarc: MailTestAuthResult;
  };
  dns_configuration: {
    spf: Record<string, unknown>;
    dkim: Record<string, unknown>;
    dmarc: Record<string, unknown>;
  };
  sender: {
    ip: string | null;
    ptr: string | null;
    helo: string | null;
    received_chain: Array<Record<string, unknown>>;
  };
  spamassassin: {
    available: boolean;
    score: number | null;
    rules: Array<Record<string, unknown>>;
  };
  blacklists: {
    listed: number;
    total: number;
    results: Array<Record<string, unknown>>;
  };
  headers: { raw: string };
  content: { html: boolean; text: boolean; links: number };
  /** Legacy v1 checklist - optional fallback */
  checks?: Array<{ id: string; label: string; pass: boolean; detail: string }>;
  from_domain?: string | null;
};

export function isMailTestReportV2(value: unknown): value is MailTestReportV2 {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const v = value as MailTestReportV2;
  return typeof v.score === 'number' && v.summary != null && v.categories != null;
}
