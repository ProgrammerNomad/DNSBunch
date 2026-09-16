import { MailTesterResultsPanel, type MailTestScorePayload } from '@/components/email/MailTesterResultsPanel';

/** v1 checklist-only payloads */
export function MailTesterLegacyPanel({ result }: { result: MailTestScorePayload | unknown }) {
  const legacy = result as MailTestScorePayload;
  if (!legacy?.checks) {
    return null;
  }
  return <MailTesterResultsPanel result={legacy} />;
}
