import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ToolsHubPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All tools</h1>
        <p className="mt-2 text-muted-foreground">
          DNS and email diagnostics. More tools are on the way.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">DNS health</h2>
        <Card>
          <CardHeader>
            <CardTitle>DNS health check</CardTitle>
            <CardDescription>
              Full domain DNS and mail configuration analysis on the home page.
            </CardDescription>
            <Button asChild className="mt-2 w-fit">
              <Link href="/">Run check</Link>
            </Button>
          </CardHeader>
        </Card>
      </section>

      <p className="text-sm text-muted-foreground">Additional tools (SPF, DMARC, bulk check, and more) coming in Phase 1.</p>
    </div>
  );
}
