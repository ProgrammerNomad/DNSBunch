import Link from 'next/link';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { prisma } from '@/lib/prisma';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/sign-in?callbackUrl=/dashboard');
  }

  const displayName = session.user.name || session.user.email || 'there';

  const mailTests = await prisma.mailTestSession.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Optional account area - public tools stay free without login.</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="saved">Saved checks</TabsTrigger>
          <TabsTrigger value="mail">Mail tests</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Welcome, {displayName}</CardTitle>
              <CardDescription>
                Signed in with passwordless auth (social or email magic link).
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Recent mail deliverability tests appear under the Mail tests tab.
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="saved" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Saved checks</CardTitle>
              <CardDescription>Coming soon - rerun and compare past tool results.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">No saved checks yet.</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="mail" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Mail tester sessions</CardTitle>
              <CardDescription>Deliverability tests started while logged in.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {mailTests.length === 0 ? (
                <p className="text-muted-foreground">
                  No mail tests yet.{' '}
                  <Link href="/tools/mail-tester" className="underline">
                    Start a test
                  </Link>
                </p>
              ) : (
                <ul className="space-y-2">
                  {mailTests.map((row) => (
                    <li key={row.id}>
                      <Link href={`/tools/mail-tester/${row.id}`} className="underline">
                        {row.status} - score {row.score ?? '-'}/10
                      </Link>
                      <span className="ml-2 text-muted-foreground">{row.createdAt.toISOString().slice(0, 10)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
