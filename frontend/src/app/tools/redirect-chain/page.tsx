'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { ToolPageLayout } from '@/components/layout/ToolPageLayout';
import { RedirectChainResultsPanel } from '@/components/website/RedirectChainResultsPanel';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { dnsApi } from '@/services/api';
import type { RedirectChainResponse } from '@/types/redirect-chain';

function RedirectChainContent() {
  const searchParams = useSearchParams();
  const initialUrl = searchParams.get('url')?.trim() ?? '';
  const autoRan = useRef(false);

  const [url, setUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RedirectChainResponse | null>(null);

  const runCheck = useCallback(async (urlValue: string) => {
    const trimmed = urlValue.trim();
    if (!trimmed) {
      setError('Enter a URL to trace.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await dnsApi.runTool<RedirectChainResponse>('redirect_chain', { url: trimmed });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Redirect chain check failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialUrl && !autoRan.current) {
      autoRan.current = true;
      void runCheck(initialUrl);
    }
  }, [initialUrl, runCheck]);

  return (
    <ToolPageLayout
      title="Redirect chain"
      description="Follow up to 5 GET redirects and list each hop with status code and Location header."
    >
      <Card>
        <CardContent className="space-y-3 pt-6">
          <div className="space-y-2">
            <label htmlFor="redirect-chain-url" className="text-sm font-medium">
              URL
            </label>
            <Input
              id="redirect-chain-url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void runCheck(url);
              }}
              autoComplete="off"
            />
          </div>
          <Button type="button" disabled={loading} onClick={() => void runCheck(url)}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Tracing…
              </>
            ) : (
              'Trace redirects'
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && <RedirectChainResultsPanel result={result} />}

      <p className="text-sm text-muted-foreground">
        Share a link with{' '}
        <Link
          className="underline"
          href={`/tools/redirect-chain?url=${encodeURIComponent('https://example.com')}`}
        >
          ?url=
        </Link>{' '}
        to pre-fill and auto-run.
      </p>
    </ToolPageLayout>
  );
}

export default function RedirectChainPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading…
        </div>
      }
    >
      <RedirectChainContent />
    </Suspense>
  );
}
