'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Loader2 } from 'lucide-react';

import { MailTesterReportView } from '@/components/email/mail-tester/MailTesterReportView';
import type { MailTestReportV2 } from '@/lib/mail-test/report-types';
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
  result: MailTestReportV2 | unknown | null;
  devIngestEnabled: boolean;
};

const POLL_MS = 3000;

function formatCountdown(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) {
    return 'Expired';
  }
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}m ${secs}s`;
}

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

export default function MailTesterPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const showDevIngest = useMemo(() => {
    return session?.devIngestEnabled || process.env.NEXT_PUBLIC_MAIL_TESTER_DEV_INGEST === 'true';
  }, [session?.devIngestEnabled]);

  const pollSession = useCallback(async (sessionId: string) => {
    const res = await fetch(`/api/mail-test/sessions/${sessionId}`);
    const data = (await res.json()) as SessionPayload & { error?: string };
    if (!res.ok) {
      throw new Error(data.error || 'Failed to load session');
    }
    setSession(data);
    return data;
  }, []);

  const startSession = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/mail-test/sessions', { method: 'POST' });
      const data = (await res.json()) as SessionPayload & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Could not start session');
      }
      router.push(`/tools/mail-tester/${data.sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start session');
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = async () => {
    if (!session?.address) {
      return;
    }
    try {
      await navigator.clipboard.writeText(session.address);
    } catch {
      setError('Could not copy address');
    }
  };

  const uploadEml = async () => {
    if (!session?.sessionId || !file) {
      setError('Choose a .eml file first.');
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`/api/mail-test/sessions/${session.sessionId}/ingest`, {
        method: 'POST',
        body: form,
      });
      const data = (await res.json()) as SessionPayload & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Ingest failed');
      }
      setSession(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ingest failed');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!session?.expiresAt) {
      return;
    }
    const tick = () => setCountdown(formatCountdown(session.expiresAt));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [session?.expiresAt]);

  useEffect(() => {
    if (!session?.sessionId) {
      return;
    }
    if (session.status === 'scored' || session.status === 'failed' || session.status === 'expired') {
      return;
    }
    const id = window.setInterval(() => {
      void pollSession(session.sessionId).catch(() => undefined);
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [session?.sessionId, session?.status, pollSession]);

  const progressValue = session ? progressForStatus(session.status) : 0;

  return (
    <ToolPageLayout
      title="Mail tester"
      description="Start a session, send a message to your unique address, and get a deliverability score. In local dev you can upload a .eml file instead of real inbound mail."
    >
      {!session ? (
        <Card>
          <CardHeader>
            <CardTitle>Start a mail test</CardTitle>
            <CardDescription>
              We generate a one-time address. Send an email from your mail server, then return here for results.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" onClick={() => void startSession()} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Start new test
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your test address</CardTitle>
              <CardDescription>Session expires in {countdown}. Status: {session.status}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Input readOnly value={session.address} className="font-mono text-sm" />
              <Button type="button" variant="secondary" onClick={() => void copyAddress()}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Waiting for message</span>
              <span>{progressValue}%</span>
            </div>
            <Progress value={progressValue} />
          </div>

          {showDevIngest && session.status === 'pending' && (
            <Card>
              <CardHeader>
                <CardTitle>Dev: upload .eml</CardTitle>
                <CardDescription>
                  Simulates inbound mail without MX or a VPS SMTP listener. Enable with MAIL_TESTER_DEV_INGEST=true.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  type="file"
                  accept=".eml,text/plain,message/rfc822"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                <Button type="button" disabled={uploading || !file} onClick={() => void uploadEml()}>
                  {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Score uploaded message
                </Button>
              </CardContent>
            </Card>
          )}

          {session.result && session.status === 'scored' ? (
            <MailTesterReportView result={session.result} />
          ) : null}

          <Button type="button" variant="outline" onClick={() => void startSession()} disabled={loading}>
            Start another test
          </Button>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </ToolPageLayout>
  );
}
