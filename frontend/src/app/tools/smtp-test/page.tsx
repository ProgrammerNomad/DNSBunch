'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { SmtpResultsPanel } from '@/components/email/SmtpResultsPanel';
import { ToolPageLayout } from '@/components/layout/ToolPageLayout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { dnsApi } from '@/services/api';
import type { SmtpTestResponse } from '@/types/smtp';

function SmtpTestContent() {
  const searchParams = useSearchParams();
  const initialDomain = searchParams.get('domain')?.trim() ?? '';
  const autoRan = useRef(false);

  const [domain, setDomain] = useState(initialDomain);
  const [hostOverride, setHostOverride] = useState('');
  const [port, setPort] = useState<'25' | '587'>('25');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SmtpTestResponse | null>(null);

  const runCheck = useCallback(
    async (domainValue: string, hostValue: string, portValue: '25' | '587') => {
      const domainTrimmed = domainValue.trim();
      const hostTrimmed = hostValue.trim();

      if (!hostTrimmed && !domainTrimmed) {
        setError('Enter a domain or mail server host.');
        return;
      }
      if (hostTrimmed && domainTrimmed) {
        setError('Use either domain (MX lookup) or mail server override, not both.');
        return;
      }

      setLoading(true);
      setError(null);
      setResult(null);

      const body: Record<string, unknown> = { port: Number(portValue) };
      if (hostTrimmed) {
        body.host = hostTrimmed;
      } else {
        body.domain = domainTrimmed;
      }

      try {
        const data = await dnsApi.runTool<SmtpTestResponse>('smtp_test', body);
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'SMTP test failed');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (initialDomain && !autoRan.current) {
      autoRan.current = true;
      void runCheck(initialDomain, '', port);
    }
  }, [initialDomain, port, runCheck]);

  return (
    <ToolPageLayout
      title="SMTP test"
      description="Connect to a mail server on port 25 or 587, read the banner and EHLO response. No mail is sent."
    >
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="smtp-domain" className="text-sm font-medium">
                Domain (uses lowest-priority MX)
              </label>
              <Input
                id="smtp-domain"
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                disabled={loading || Boolean(hostOverride.trim())}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="smtp-host" className="text-sm font-medium">
                Mail server (override)
              </label>
              <Input
                id="smtp-host"
                placeholder="aspmx.l.google.com"
                value={hostOverride}
                onChange={(e) => setHostOverride(e.target.value)}
                disabled={loading}
                autoComplete="off"
              />
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="space-y-2">
              <label htmlFor="smtp-port" className="text-sm font-medium">
                Port
              </label>
              <select
                id="smtp-port"
                value={port}
                onChange={(e) => setPort(e.target.value as '25' | '587')}
                disabled={loading}
                className="flex h-10 w-[160px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="25">25 (SMTP)</option>
                <option value="587">587 (submission)</option>
              </select>
            </div>
            <Button
              type="button"
              onClick={() => void runCheck(domain, hostOverride, port)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing…
                </>
              ) : (
                'Run test'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && <SmtpResultsPanel result={result} />}

      <p className="text-sm text-muted-foreground">
        See MX records first with{' '}
        <Link href="/tools/mx-lookup" className="underline underline-offset-4">
          MX lookup
        </Link>
        {' · '}
        <Link href="/tools/dnsbl-lookup" className="underline underline-offset-4">
          DNSBL
        </Link>
        {' · '}
        <Link href="/" className="underline underline-offset-4">
          full DNS health
        </Link>
        .
      </p>
    </ToolPageLayout>
  );
}

export default function SmtpTestPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SmtpTestContent />
    </Suspense>
  );
}
