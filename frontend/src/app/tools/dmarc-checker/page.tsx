'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { DmarcResultsPanel } from '@/components/email/DmarcResultsPanel';
import { ToolPageLayout } from '@/components/layout/ToolPageLayout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { dnsApi } from '@/services/api';
import type { DmarcCheckerResponse } from '@/types/dmarc';

function DmarcCheckerContent() {
  const searchParams = useSearchParams();
  const initialDomain = searchParams.get('domain')?.trim() ?? '';
  const autoRan = useRef(false);

  const [domain, setDomain] = useState(initialDomain);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DmarcCheckerResponse | null>(null);

  const runCheck = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Enter a domain name.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await dnsApi.runTool<DmarcCheckerResponse>('dmarc_checker', {
        domain: trimmed,
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'DMARC check failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialDomain && !autoRan.current) {
      autoRan.current = true;
      void runCheck(initialDomain);
    }
  }, [initialDomain, runCheck]);

  return (
    <ToolPageLayout
      title="DMARC checker"
      description="Look up the DMARC policy at _dmarc.yourdomain and see alignment, reporting URIs, and the raw TXT record."
    >
      <Card>
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <label htmlFor="dmarc-domain" className="text-sm font-medium">
              Domain
            </label>
            <Input
              id="dmarc-domain"
              placeholder="example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void runCheck(domain);
              }}
              disabled={loading}
              autoComplete="off"
            />
          </div>
          <Button type="button" onClick={() => void runCheck(domain)} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking…
              </>
            ) : (
              'Run check'
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && <DmarcResultsPanel result={result} />}

      <p className="text-sm text-muted-foreground">
        Also check{' '}
        <Link href="/tools/spf-checker" className="underline underline-offset-4">
          SPF
        </Link>
        {' · '}
        <Link href="/tools/dkim-checker" className="underline underline-offset-4">
          DKIM
        </Link>
        {' · '}
        <Link href="/tools/mx-lookup" className="underline underline-offset-4">
          MX
        </Link>
        {' · '}
        <Link href="/tools/smtp-test" className="underline underline-offset-4">
          SMTP test
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

export default function DmarcCheckerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <DmarcCheckerContent />
    </Suspense>
  );
}
