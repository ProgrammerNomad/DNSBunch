'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { DomainExpiryResultsPanel } from '@/components/domain/DomainExpiryResultsPanel';
import { ToolPageLayout } from '@/components/layout/ToolPageLayout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { dnsApi } from '@/services/api';
import type { DomainExpiryResponse } from '@/types/domain-expiry';

function DomainExpiryContent() {
  const searchParams = useSearchParams();
  const initialDomain = searchParams.get('domain')?.trim() ?? '';
  const autoRan = useRef(false);
  const [domain, setDomain] = useState(initialDomain);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DomainExpiryResponse | null>(null);

  const runCheck = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Enter a domain.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await dnsApi.runTool<DomainExpiryResponse>('domain_expiry', { domain: trimmed }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Domain expiry check failed');
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
    <ToolPageLayout title="Domain expiry" description="See registration expiry date and days remaining.">
      <Card>
        <CardContent className="space-y-3 pt-6">
          <Input
            placeholder="example.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            disabled={loading}
            onKeyDown={(e) => e.key === 'Enter' && void runCheck(domain)}
          />
          <Button disabled={loading} onClick={() => void runCheck(domain)}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Check expiry
          </Button>
        </CardContent>
      </Card>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {result && <DomainExpiryResultsPanel result={result} />}
    </ToolPageLayout>
  );
}

export default function DomainExpiryPage() {
  return (
    <Suspense fallback={<Loader2 className="h-4 w-4 animate-spin" />}>
      <DomainExpiryContent />
    </Suspense>
  );
}
