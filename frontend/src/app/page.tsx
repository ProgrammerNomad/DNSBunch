'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import { DomainSearchForm } from '../components/DomainSearchForm';
import { DNSResultsTable } from '../components/DNSResultsTable';
import { DNSResultsAdvanced } from '../components/DNSResultsAdvanced';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { dnsApi } from '../services/api';
import { DNSAnalysisResult } from '../types/dns';

function HomePageContent() {
  const [results, setResults] = useState<DNSAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchDomain, setLastSearchDomain] = useState<string>('');
  const [resultFormat, setResultFormat] = useState<'normal' | 'advanced'>('normal');

  const searchParams = useSearchParams();

  const extractDomainFromUrl = (input: string): string | null => {
    try {
      input = input.trim();
      if (input.startsWith('http://') || input.startsWith('https://')) {
        const url = new URL(input);
        return url.hostname;
      }
      if (/^[a-zA-Z0-9][a-zA-Z0-9-_.]*[a-zA-Z0-9]$/.test(input) && input.includes('.')) {
        return input;
      }
      return null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const domainParam = searchParams.get('domain');
    if (domainParam) {
      const extractedDomain = extractDomainFromUrl(domainParam);
      if (extractedDomain && extractedDomain !== lastSearchDomain) {
        handleSearch(extractedDomain, [], 'normal');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSearch = async (domain: string, checks: string[], format: 'normal' | 'advanced') => {
    setLoading(true);
    setError(null);
    setResults(null);
    setLastSearchDomain(domain);
    setResultFormat(format);

    const currentPath = window.location.pathname;
    const expectedPath = `/${encodeURIComponent(domain)}`;
    if (currentPath !== expectedPath) {
      window.history.replaceState({}, '', expectedPath);
    }

    try {
      const data = await dnsApi.checkDomain(domain, checks);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults(null);
    setError(null);
    setLastSearchDomain('');
    window.history.replaceState({}, '', '/');
  };

  return (
    <div className="space-y-8">
      <section className="space-y-3 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">DNS health check</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          DNS analysis and mail server diagnostics - SPF, DMARC, DKIM, and more.
        </p>
      </section>

      <DomainSearchForm
        onSearch={handleSearch}
        loading={loading}
        error={error}
        initialDomain={lastSearchDomain}
      />

      {loading && !results && (
        <div className="space-y-3">
          <Skeleton className="h-8 w-full max-w-md mx-auto" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {results && (
        <>
          {resultFormat === 'normal' ? (
            <DNSResultsTable results={results} domain={lastSearchDomain} />
          ) : (
            <DNSResultsAdvanced results={results} domain={lastSearchDomain} onClear={clearResults} />
          )}
        </>
      )}

      {error && !loading && (
        <Alert variant="destructive">
          <AlertTitle>Analysis failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
