'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runProvider = async (provider: string) => {
    setError(null);
    setLoading(provider);
    try {
      await signIn(provider, { callbackUrl: '/dashboard' });
    } catch {
      setError('Sign-in failed.');
    } finally {
      setLoading(null);
    }
  };

  const sendMagicLink = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Enter your email address.');
      return;
    }
    setError(null);
    setLoading('email');
    try {
      const result = await signIn('nodemailer', {
        email: trimmed,
        callbackUrl: '/dashboard',
        redirect: false,
      });
      if (result?.error) {
        setError('Could not send magic link. Is EMAIL_SERVER configured?');
      } else {
        window.location.href = '/sign-in/verify';
      }
    } catch {
      setError('Could not send magic link.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Passwordless only - continue with a social account or a one-time email link. Public DNS
            tools work without an account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              disabled={Boolean(loading)}
              onClick={() => void runProvider('google')}
            >
              {loading === 'google' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Continue with Google
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={Boolean(loading)}
              onClick={() => void runProvider('github')}
            >
              {loading === 'github' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Continue with GitHub
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or email magic link</span>
            </div>
          </div>

          <div className="space-y-2">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={Boolean(loading)}
              autoComplete="email"
            />
            <Button type="button" className="w-full" disabled={Boolean(loading)} onClick={() => void sendMagicLink()}>
              {loading === 'email' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Email me a sign-in link
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <p className="text-center text-sm text-muted-foreground">
            <Link href="/" className="underline">
              Back to tools
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
