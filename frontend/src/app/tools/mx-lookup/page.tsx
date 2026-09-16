'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { MxResultsPanel } from '@/components/email/MxResultsPanel';
import { ToolPageLayout } from '@/components/layout/ToolPageLayout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { dnsApi } from '@/services/api';
import type { MxLookupResponse } from '@/types/mx';

function MxLookupContent() {
  const searchParams = useSearchParams();
  const initialDomain = searchParams.get('domain')?.trim() ?? '';
  const autoRan = useRef(false);

  const [domain, setDomain] = useState(initialDomain);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MxLookupResponse | null>(null);

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
      const data = await dnsApi.runTool<MxLookupResponse>('mx_lookup', {
        domain: trimmed,
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'MX lookup failed');
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
      title="MX lookup"
      description="List mail exchanger (MX) records for a domain, sorted by priority, with resolved A/AAAA addresses."
    >
      <Card>
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <label htmlFor="mx-domain" className="text-sm font-medium">
              Domain
            </label>
            <Input
              id="mx-domain"
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
                Looking up…
              </>
            ) : (
              'Look up MX'
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && <MxResultsPanel result={result} />}

      <p className="text-sm text-muted-foreground">
        Need NS, SPF, and full mail diagnostics?{' '}
        <Link href="/" className="underline underline-offset-4">
          Run DNS health on the home page
        </Link>
        {' · '}
        <Link href="/tools/spf-checker" className="underline underline-offset-4">
          SPF
        </Link>
        {' · '}
        <Link href="/tools/dmarc-checker" className="underline underline-offset-4">
          DMARC
        </Link>
        {' · '}
        <Link href="/tools/smtp-test" className="underline underline-offset-4">
          SMTP test
        </Link>
        .
      </p>
    </ToolPageLayout>
  );
}

export default function MxLookupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <MxLookupContent />
    </Suspense>
  );
}
