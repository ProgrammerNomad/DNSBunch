'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { DnsblResultsPanel } from '@/components/email/DnsblResultsPanel';
import { ToolPageLayout } from '@/components/layout/ToolPageLayout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { dnsApi } from '@/services/api';
import type { DnsblLookupResponse } from '@/types/dnsbl';

function DnsblLookupContent() {
  const searchParams = useSearchParams();
  const initialDomain = searchParams.get('domain')?.trim() ?? '';
  const initialIp = searchParams.get('ip')?.trim() ?? '';
  const autoRan = useRef(false);

  const [domain, setDomain] = useState(initialDomain);
  const [ip, setIp] = useState(initialIp);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DnsblLookupResponse | null>(null);

  const runCheck = useCallback(async (domainValue: string, ipValue: string) => {
    const domainTrimmed = domainValue.trim();
    const ipTrimmed = ipValue.trim();

    if (!domainTrimmed && !ipTrimmed) {
      setError('Enter a domain or IPv4 address.');
      return;
    }
    if (domainTrimmed && ipTrimmed) {
      setError('Use either domain or IP, not both.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const body: Record<string, string> = domainTrimmed
      ? { domain: domainTrimmed }
      : { ip: ipTrimmed };

    try {
      const data = await dnsApi.runTool<DnsblLookupResponse>('dnsbl_lookup', body);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'DNSBL lookup failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if ((initialDomain || initialIp) && !autoRan.current) {
      autoRan.current = true;
      void runCheck(initialDomain, initialIp);
    }
  }, [initialDomain, initialIp, runCheck]);

  return (
    <ToolPageLayout
      title="DNSBL lookup"
      description="Check whether an IPv4 address (or a domain's public A records) appears on common DNS blocklists."
    >
      <Card>
        <CardContent className="grid gap-3 pt-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="dnsbl-domain" className="text-sm font-medium">
              Domain (uses A records)
            </label>
            <Input
              id="dnsbl-domain"
              placeholder="example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              disabled={loading || Boolean(ip.trim())}
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="dnsbl-ip" className="text-sm font-medium">
              IPv4 address
            </label>
            <Input
              id="dnsbl-ip"
              placeholder="8.8.8.8"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              disabled={loading || Boolean(domain.trim())}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void runCheck(domain, ip);
              }}
              autoComplete="off"
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="button" onClick={() => void runCheck(domain, ip)} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking…
                </>
              ) : (
                'Run lookup'
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

      {result && <DnsblResultsPanel result={result} />}

      <p className="text-sm text-muted-foreground">
        <Link href="/tools/mx-lookup" className="underline underline-offset-4">
          MX lookup
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

export default function DnsblLookupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <DnsblLookupContent />
    </Suspense>
  );
}
