'use client';

import { useRef, useState } from 'react';
import { Loader2, Upload } from 'lucide-react';

import { BulkSummaryTable } from '@/components/dns-health/BulkSummaryTable';
import { ToolPageLayout } from '@/components/layout/ToolPageLayout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  BULK_MAX_DOMAINS,
  downloadBulkResultsCsv,
  parseDomainsFromCsv,
  parseDomainsFromText,
} from '@/lib/csv-domains';
import { dnsApi } from '@/services/api';
import type { BulkDnsHealthResponse } from '@/types/dns';

export default function BulkDnsHealthPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [result, setResult] = useState<BulkDnsHealthResponse | null>(null);

  const runBulk = async (domains: string[]) => {
    if (domains.length === 0) {
      setError('Enter at least one domain (one per line).');
      return;
    }
    if (domains.length > BULK_MAX_DOMAINS) {
      setError(`Maximum ${BULK_MAX_DOMAINS} domains per bulk request`);
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

  const handleRun = () => {
    void runBulk(parseDomainsFromText(input));
  };

  const handleImportCsv = async (file: File) => {
    setImportError(null);
    try {
      const text = await file.text();
      const parsed = parseDomainsFromCsv(text, BULK_MAX_DOMAINS);
      if (!parsed.ok) {
        setImportError(parsed.error);
        return;
      }
      setInput(parsed.domains.join('\n'));
    } catch {
      setImportError('Could not read CSV file');
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleImportCsv(file);
    e.target.value = '';
  };

  return (
    <ToolPageLayout
      title="Bulk DNS health"
      description="Paste or import domains for a quick pass/warning/error summary. Uses the same DNS engine as the home checker."
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
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={onFileChange}
            aria-hidden
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
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Import CSV
            </Button>
            {result && (
              <Button type="button" variant="secondary" onClick={() => downloadBulkResultsCsv(result.rows)}>
                Download CSV
              </Button>
            )}
            <span className="text-sm text-muted-foreground">Up to {BULK_MAX_DOMAINS} domains per run</span>
          </div>
          {importError && (
            <Alert variant="destructive">
              <AlertDescription>{importError}</AlertDescription>
            </Alert>
          )}
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
