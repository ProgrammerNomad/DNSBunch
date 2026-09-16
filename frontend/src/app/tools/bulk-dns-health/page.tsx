'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

import { BulkSummaryTable } from '@/components/dns-health/BulkSummaryTable';
import { ToolPageLayout } from '@/components/layout/ToolPageLayout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { dnsApi } from '@/services/api';
import type { BulkDnsHealthResponse } from '@/types/dns';

function parseDomains(text: string): string[] {
  return text
    .split(/[\n,;\s]+/)
    .map((d) => d.trim())
    .filter(Boolean);
}

export default function BulkDnsHealthPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BulkDnsHealthResponse | null>(null);

  const handleRun = async () => {
    const domains = parseDomains(input);
    if (domains.length === 0) {
      setError('Enter at least one domain (one per line).');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await dnsApi.runTool<BulkDnsHealthResponse>('dns_health', {
        surface: 'bulk',
        domains,
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk check failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolPageLayout
      title="Bulk DNS health"
      description="Paste multiple domains for a quick pass/warning/error summary. Uses the same DNS engine as the home checker."
    >
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Textarea
            placeholder={'example.com\nexample.org\nexample.net'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            rows={8}
            aria-label="Domain list"
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleRun} disabled={loading || !input.trim()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running bulk check…
                </>
              ) : (
                'Run bulk check'
              )}
            </Button>
            <span className="text-sm text-muted-foreground">Up to 50 domains per run</span>
          </div>
          {loading && (
            <p className="text-sm text-muted-foreground">Analyzing domains… this may take a minute.</p>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Bulk check failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Completed {result.meta.completed} of {result.meta.requested} domains
            {result.meta.failed > 0 ? ` (${result.meta.failed} with errors)` : ''}.
          </p>
          <BulkSummaryTable rows={result.rows} />
        </div>
      )}
    </ToolPageLayout>
  );
}
