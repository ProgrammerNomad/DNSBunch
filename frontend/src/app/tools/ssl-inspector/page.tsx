'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { ToolPageLayout } from '@/components/layout/ToolPageLayout';
import { SslInspectorResultsPanel } from '@/components/website/SslInspectorResultsPanel';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { dnsApi } from '@/services/api';
import type { SslInspectorResponse } from '@/types/ssl-inspector';

function SslInspectorContent() {
  const searchParams = useSearchParams();
  const initialHost = searchParams.get('host')?.trim() ?? '';
  const autoRan = useRef(false);

  const [host, setHost] = useState(initialHost);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SslInspectorResponse | null>(null);

  const runCheck = useCallback(async (hostValue: string) => {
    const trimmed = hostValue.trim();
    if (!trimmed) {
      setError('Enter a hostname to inspect.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await dnsApi.runTool<SslInspectorResponse>('ssl_inspector', { host: trimmed });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'SSL inspection failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialHost && !autoRan.current) {
      autoRan.current = true;
      void runCheck(initialHost);
    }
  }, [initialHost, runCheck]);

  return (
    <ToolPageLayout
      title="SSL inspector"
      description="Connect on port 443 and show certificate expiry, issuer, TLS version, and hostname match."
    >
      <Card>
        <CardContent className="space-y-3 pt-6">
          <div className="space-y-2">
            <label htmlFor="ssl-host" className="text-sm font-medium">
              Hostname
            </label>
            <Input
              id="ssl-host"
              placeholder="example.com"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void runCheck(host);
              }}
              autoComplete="off"
            />
          </div>
          <Button type="button" disabled={loading} onClick={() => void runCheck(host)}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inspecting…
              </>
            ) : (
              'Inspect certificate'
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && <SslInspectorResultsPanel result={result} />}

      <p className="text-sm text-muted-foreground">
        Share a link with{' '}
        <Link className="underline" href="/tools/ssl-inspector?host=example.com">
          ?host=
        </Link>{' '}
        to pre-fill and auto-run.
      </p>
    </ToolPageLayout>
  );
}

export default function SslInspectorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading…
        </div>
      }
    >
      <SslInspectorContent />
    </Suspense>
  );
}
