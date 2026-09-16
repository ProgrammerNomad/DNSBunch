'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DkimResultsPanel } from '@/components/email/DkimResultsPanel';
import { DmarcResultsPanel } from '@/components/email/DmarcResultsPanel';
import { SpfResultsPanel } from '@/components/email/SpfResultsPanel';
import type { MailTestReportV2 } from '@/lib/mail-test/report-types';
import type { DkimCheckerResponse } from '@/types/dkim';
import type { DmarcCheckerResponse } from '@/types/dmarc';
import type { SpfCheckerResponse } from '@/types/spf';

function isSpfResult(value: unknown): value is SpfCheckerResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const v = value as SpfCheckerResponse;
  return typeof v.domain === 'string' && typeof v.status === 'string';
}

function isDmarcResult(value: unknown): value is DmarcCheckerResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const v = value as DmarcCheckerResponse;
  return typeof v.domain === 'string' && typeof v.status === 'string' && v.parsed != null;
}

function isDkimResult(value: unknown): value is DkimCheckerResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const v = value as DkimCheckerResponse;
  return typeof v.domain === 'string' && typeof v.selector === 'string' && typeof v.host === 'string';
}

function errorMessage(section: Record<string, unknown>): string | null {
  if (typeof section.error === 'string') {
    return section.error;
  }
  return null;
}

export function MailTesterDnsPanels({ dns }: { dns: MailTestReportV2['dns_configuration'] }) {
  const spfErr = errorMessage(dns.spf);
  const dmarcErr = errorMessage(dns.dmarc);
  const dkimRootErr = errorMessage(dns.dkim);

  const selectors = Array.isArray(dns.dkim.selectors) ? dns.dkim.selectors : [];
  const dkimNote = typeof dns.dkim.note === 'string' ? dns.dkim.note : null;

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-2 text-sm font-semibold">SPF</h3>
        {spfErr ? (
          <Alert>
            <AlertTitle>SPF check unavailable</AlertTitle>
            <AlertDescription>{spfErr}</AlertDescription>
          </Alert>
        ) : isSpfResult(dns.spf) ? (
          <SpfResultsPanel result={dns.spf} />
        ) : (
          <p className="text-sm text-muted-foreground">No SPF data in report.</p>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold">DMARC</h3>
        {dmarcErr ? (
          <Alert>
            <AlertTitle>DMARC check unavailable</AlertTitle>
            <AlertDescription>{dmarcErr}</AlertDescription>
          </Alert>
        ) : isDmarcResult(dns.dmarc) ? (
          <DmarcResultsPanel result={dns.dmarc} />
        ) : (
          <p className="text-sm text-muted-foreground">No DMARC data in report.</p>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold">DKIM (message selectors)</h3>
        {dkimRootErr ? (
          <Alert>
            <AlertTitle>DKIM check unavailable</AlertTitle>
            <AlertDescription>{dkimRootErr}</AlertDescription>
          </Alert>
        ) : selectors.length === 0 ? (
          <p className="text-sm text-muted-foreground">{dkimNote ?? 'No DKIM selectors in this message.'}</p>
        ) : (
          <div className="space-y-6">
            {selectors.map((entry, i) => {
              if (entry && typeof entry === 'object' && 'error' in entry && typeof (entry as { error: string }).error === 'string') {
                return (
                  <Alert key={i}>
                    <AlertTitle>Selector check failed</AlertTitle>
                    <AlertDescription>{(entry as { error: string }).error}</AlertDescription>
                  </Alert>
                );
              }
              if (isDkimResult(entry)) {
                return (
                  <div key={`${entry.selector}-${entry.host}`}>
                    <DkimResultsPanel result={entry} />
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}
      </section>
    </div>
  );
}
