'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { DkimResultsPanel } from '@/components/email/DkimResultsPanel';
import { ToolPageLayout } from '@/components/layout/ToolPageLayout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { dnsApi } from '@/services/api';
import type { DkimCheckerResponse } from '@/types/dkim';

const SELECTOR_PRESETS = [
  'google',
  'selector1',
  'selector2',
  'default',
  'k1',
  's1',
  's2',
  'dkim',
  'mail',
];

function DkimCheckerContent() {
  const searchParams = useSearchParams();
  const initialDomain = searchParams.get('domain')?.trim() ?? '';
  const initialSelector = searchParams.get('selector')?.trim() ?? '';
  const autoRan = useRef(false);

  const [domain, setDomain] = useState(initialDomain);
  const [selector, setSelector] = useState(initialSelector);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DkimCheckerResponse | null>(null);

  const runCheck = useCallback(async (domainValue: string, selectorValue: string) => {
    const domainTrimmed = domainValue.trim();
    const selectorTrimmed = selectorValue.trim();
    if (!domainTrimmed) {
      setError('Enter a domain name.');
      return;
    }
    if (!selectorTrimmed) {
      setError('Enter a DKIM selector.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await dnsApi.runTool<DkimCheckerResponse>('dkim_checker', {
        domain: domainTrimmed,
        selector: selectorTrimmed,
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'DKIM check failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialDomain && initialSelector && !autoRan.current) {
      autoRan.current = true;
      void runCheck(initialDomain, initialSelector);
    }
  }, [initialDomain, initialSelector, runCheck]);

  return (
    <ToolPageLayout
      title="DKIM checker"
      description="Look up the DKIM TXT record at selector._domainkey.yourdomain and inspect key metadata."
    >
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="dkim-domain" className="text-sm font-medium">
                Domain
              </label>
              <Input
                id="dkim-domain"
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                disabled={loading}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="dkim-selector" className="text-sm font-medium">
                Selector
              </label>
              <Input
                id="dkim-selector"
                placeholder="google"
                value={selector}
                onChange={(e) => setSelector(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void runCheck(domain, selector);
                }}
                disabled={loading}
                autoComplete="off"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="w-full text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Common selectors
            </span>
            {SELECTOR_PRESETS.map((preset) => (
              <Button
                key={preset}
                type="button"
                variant="outline"
                size="sm"
                disabled={loading}
                onClick={() => {
                  setSelector(preset);
                  if (domain.trim()) void runCheck(domain, preset);
                }}
              >
                {preset}
              </Button>
            ))}
          </div>
          <Button
            type="button"
            className="w-fit"
            onClick={() => void runCheck(domain, selector)}
            disabled={loading}
          >
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

      {result && <DkimResultsPanel result={result} />}

      <p className="text-sm text-muted-foreground">
        Also check{' '}
        <Link href="/tools/spf-checker" className="underline underline-offset-4">
          SPF
        </Link>
        {' · '}
        <Link href="/tools/dmarc-checker" className="underline underline-offset-4">
          DMARC
        </Link>
        {' · '}
        <Link href="/tools/mx-lookup" className="underline underline-offset-4">
          MX
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

export default function DkimCheckerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <DkimCheckerContent />
    </Suspense>
  );
}
