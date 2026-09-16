import Link from 'next/link';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { prisma } from '@/lib/prisma';
import { parseSavedCheckSummary, savedCheckHref } from '@/lib/saved-checks';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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

  const savedChecks = await prisma.savedCheck.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
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
              Recent tool runs and mail deliverability tests appear under Saved checks and Mail tests.
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="saved" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Saved checks</CardTitle>
              <CardDescription>Recent successful tool runs while signed in (up to 50).</CardDescription>
            </CardHeader>
            <CardContent className="text-sm">
              {savedChecks.length === 0 ? (
                <p className="text-muted-foreground">
                  No saved checks yet. Run a tool while signed in (for example{' '}
                  <Link href="/tools/dmarc-checker" className="underline">
                    DMARC checker
                  </Link>
                  ).
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Tool</TableHead>
                      <TableHead>Summary</TableHead>
                      <TableHead className="text-right">Open</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {savedChecks.map((row) => {
                      const summary = parseSavedCheckSummary(row.summaryJson);
                      const href = savedCheckHref(row.toolId, summary);
                      return (
                        <TableRow key={row.id}>
                          <TableCell className="text-muted-foreground">
                            {row.createdAt.toISOString().slice(0, 16).replace('T', ' ')}
                          </TableCell>
                          <TableCell className="font-mono text-xs">{row.toolId}</TableCell>
                          <TableCell>
                            {summary.label}
                            {summary.status ? (
                              <span className="ml-2 text-muted-foreground">({summary.status})</span>
                            ) : null}
                          </TableCell>
                          <TableCell className="text-right">
                            {href ? (
                              <Link href={href} className="underline">
                                Re-run
                              </Link>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
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
