'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';

import { Button } from '@/components/ui/button';

export function AuthNav() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <span className="text-xs text-muted-foreground">…</span>;
  }

  if (!session?.user) {
    return (
      <Button variant="outline" size="sm" asChild>
        <Link href="/sign-in">Sign in</Link>
      </Button>
    );
  }

  const label = session.user.name || session.user.email || 'Account';

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard">Dashboard</Link>
      </Button>
      <Button variant="ghost" size="sm" className="max-w-[140px] truncate" asChild>
        <Link href="/dashboard" title={label}>
          {label}
        </Link>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => void signOut({ callbackUrl: '/' })}
      >
        Sign out
      </Button>
    </div>
  );
}
