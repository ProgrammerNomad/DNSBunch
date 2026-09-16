'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { ToolPageLayout } from '@/components/layout/ToolPageLayout';
import { HttpHeadersResultsPanel } from '@/components/website/HttpHeadersResultsPanel';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { dnsApi } from '@/services/api';
import type { HttpHeadersResponse } from '@/types/http-headers';

function HttpHeadersContent() {
  const searchParams = useSearchParams();
  const initialUrl = searchParams.get('url')?.trim() ?? '';
  const autoRan = useRef(false);

  const [url, setUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<HttpHeadersResponse | null>(null);

  const runCheck = useCallback(async (urlValue: string) => {
    const trimmed = urlValue.trim();
    if (!trimmed) {
      setError('Enter a URL to fetch.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await dnsApi.runTool<HttpHeadersResponse>('http_headers', { url: trimmed });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'HTTP headers check failed');
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
      title="HTTP headers"
      description="Send a single GET request and view response headers. Security-related headers are highlighted."
    >
      <Card>
        <CardContent className="space-y-3 pt-6">
          <div className="space-y-2">
            <label htmlFor="http-headers-url" className="text-sm font-medium">
              URL
            </label>
            <Input
              id="http-headers-url"
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
                Fetching…
              </>
            ) : (
              'Fetch headers'
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && <HttpHeadersResultsPanel result={result} />}

      <p className="text-sm text-muted-foreground">
        Share a link with{' '}
        <Link
          className="underline"
          href={`/tools/http-headers?url=${encodeURIComponent('https://example.com')}`}
        >
          ?url=
        </Link>{' '}
        to pre-fill and auto-run.
      </p>
    </ToolPageLayout>
  );
}

export default function HttpHeadersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading…
        </div>
      }
    >
      <HttpHeadersContent />
    </Suspense>
  );
}
