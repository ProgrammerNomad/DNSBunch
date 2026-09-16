'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { DnsPropagationResultsPanel } from '@/components/domain/DnsPropagationResultsPanel';
import { ToolPageLayout } from '@/components/layout/ToolPageLayout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { dnsApi } from '@/services/api';
import type { DnsPropagationResponse } from '@/types/dns-propagation';

const RECORD_TYPES = ['A', 'AAAA', 'MX', 'NS', 'TXT', 'CNAME'] as const;

function DnsPropagationContent() {
  const searchParams = useSearchParams();
  const initialName = searchParams.get('name')?.trim() ?? searchParams.get('domain')?.trim() ?? '';
  const initialType = searchParams.get('type')?.trim().toUpperCase() ?? 'A';
  const autoRan = useRef(false);

  const [name, setName] = useState(initialName);
  const [recordType, setRecordType] = useState<string>(
    RECORD_TYPES.includes(initialType as (typeof RECORD_TYPES)[number]) ? initialType : 'A',
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DnsPropagationResponse | null>(null);

  const runCheck = useCallback(async (nameValue: string, typeValue: string) => {
    const trimmed = nameValue.trim();
    if (!trimmed) {
      setError('Enter a DNS name.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(
        await dnsApi.runTool<DnsPropagationResponse>('dns_propagation', {
          name: trimmed,
          type: typeValue,
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'DNS propagation check failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialName && !autoRan.current) {
      autoRan.current = true;
      void runCheck(initialName, recordType);
    }
  }, [initialName, recordType, runCheck]);

  return (
    <ToolPageLayout
      title="DNS propagation"
      description="Query Google, Cloudflare, and Quad9 and compare answers for a record type."
    >
      <Card>
        <CardContent className="grid gap-3 pt-6 sm:grid-cols-2">
          <Input
            placeholder="example.com or www.example.com"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={recordType}
            disabled={loading}
            onChange={(e) => setRecordType(e.target.value)}
          >
            {RECORD_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <Button className="sm:col-span-2 w-fit" disabled={loading} onClick={() => void runCheck(name, recordType)}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Check propagation
          </Button>
        </CardContent>
      </Card>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {result && <DnsPropagationResultsPanel result={result} />}
    </ToolPageLayout>
  );
}

export default function DnsPropagationPage() {
  return (
    <Suspense fallback={<Loader2 className="h-4 w-4 animate-spin" />}>
      <DnsPropagationContent />
    </Suspense>
  );
}
