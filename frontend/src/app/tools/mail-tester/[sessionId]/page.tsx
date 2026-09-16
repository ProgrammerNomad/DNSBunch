'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';

import { MailTesterReportView } from '@/components/email/mail-tester/MailTesterReportView';
import { ToolPageLayout } from '@/components/layout/ToolPageLayout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

type SessionPayload = {
  sessionId: string;
  address: string;
  status: string;
  expiresAt: string;
  score: number | null;
  result: unknown;
  devIngestEnabled: boolean;
};

const POLL_MS = 2500;

function progressForStatus(status: string): number {
  switch (status) {
    case 'pending':
      return 20;
    case 'received':
      return 45;
    case 'scoring':
      return 75;
    case 'scored':
      return 100;
    default:
      return 10;
  }
}

export default function MailTesterSessionPage() {
  const params = useParams();
  const sessionId = typeof params.sessionId === 'string' ? params.sessionId : '';

  const [session, setSession] = useState<SessionPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!sessionId) return;
    const res = await fetch(`/api/mail-test/sessions/${sessionId}`);
    const data = (await res.json()) as SessionPayload & { error?: string };
    if (!res.ok) throw new Error(data.error || 'Session not found');
    setSession(data);
  }, [sessionId]);

  useEffect(() => {
    void load().catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, [load]);

  useEffect(() => {
    if (!sessionId || !session) return;
    if (session.status === 'scored' || session.status === 'failed' || session.status === 'expired') return;
    const id = window.setInterval(() => {
      void load().catch(() => undefined);
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [sessionId, session, load]);

  return (
    <ToolPageLayout
      title="Mail tester"
      description="Deliverability test score - not a guarantee of inbox placement."
    >
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!session && !error && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading session…
        </div>
      )}

      {session && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test address</CardTitle>
              <CardDescription>Status: {session.status}</CardDescription>
            </CardHeader>
            <CardContent>
              <Input readOnly value={session.address} className="font-mono text-sm" />
              <Progress className="mt-3" value={progressForStatus(session.status)} />
            </CardContent>
          </Card>

          {session.result && session.status === 'scored' ? <MailTesterReportView result={session.result} /> : null}

          <Button asChild variant="outline">
            <Link href="/tools/mail-tester">Start new test</Link>
          </Button>
        </div>
      )}
    </ToolPageLayout>
  );
}
