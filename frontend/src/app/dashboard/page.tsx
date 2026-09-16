import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/sign-in?callbackUrl=/dashboard');
  }

  const displayName = session.user.name || session.user.email || 'there';

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
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Welcome, {displayName}</CardTitle>
              <CardDescription>
                Signed in with passwordless auth (social or email magic link). Session is stored in
                your VPS PostgreSQL database.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Mail tester sessions and saved check history will appear here in later phases.
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
      </Tabs>
    </div>
  );
}
