import { MailTesterLegacyPanel } from '@/components/email/mail-tester/MailTesterLegacyPanel';
import { MailTesterReportSections } from '@/components/email/mail-tester/MailTesterReportSections';
import { isMailTestReportV2, type MailTestReportV2 } from '@/lib/mail-test/report-types';

export function MailTesterReportView({ result }: { result: unknown }) {
  if (isMailTestReportV2(result)) {
    return <MailTesterReportSections report={result} />;
  }
  return <MailTesterLegacyPanel result={result as MailTestReportV2} />;
}
