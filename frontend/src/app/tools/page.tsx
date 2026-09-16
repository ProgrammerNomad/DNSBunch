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
        <Card>
          <CardHeader>
            <CardTitle>Bulk DNS health</CardTitle>
            <CardDescription>
              Paste many domains and get a summary table (NS, SOA, MX, WWW, overall).
            </CardDescription>
            <Button asChild className="mt-2 w-fit">
              <Link href="/tools/bulk-dns-health">Open bulk check</Link>
            </Button>
          </CardHeader>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Email</h2>
        <Card>
          <CardHeader>
            <CardTitle>DMARC checker</CardTitle>
            <CardDescription>
              Query _dmarc TXT, policy (none/quarantine/reject), alignment, and rua/ruf reporting.
            </CardDescription>
            <Button asChild className="mt-2 w-fit">
              <Link href="/tools/dmarc-checker">Open DMARC checker</Link>
            </Button>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>SPF checker</CardTitle>
            <CardDescription>
              Validate SPF TXT at the domain root, list mechanisms, and flag excessive DNS lookups.
            </CardDescription>
            <Button asChild className="mt-2 w-fit">
              <Link href="/tools/spf-checker">Open SPF checker</Link>
            </Button>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>DKIM checker</CardTitle>
            <CardDescription>
              Look up DKIM by selector at selector._domainkey.domain and validate key metadata.
            </CardDescription>
            <Button asChild className="mt-2 w-fit">
              <Link href="/tools/dkim-checker">Open DKIM checker</Link>
            </Button>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>MX lookup</CardTitle>
            <CardDescription>
              List MX hosts and priorities with resolved mail server IP addresses.
            </CardDescription>
            <Button asChild className="mt-2 w-fit">
              <Link href="/tools/mx-lookup">Open MX lookup</Link>
            </Button>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>SMTP test</CardTitle>
            <CardDescription>
              TCP connect to port 25 or 587, read banner and EHLO - no mail sent.
            </CardDescription>
            <Button asChild className="mt-2 w-fit">
              <Link href="/tools/smtp-test">Open SMTP test</Link>
            </Button>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>DNSBL lookup</CardTitle>
            <CardDescription>
              Check IPv4 against Spamhaus ZEN, SpamCop, and Barracuda DNS blocklists.
            </CardDescription>
            <Button asChild className="mt-2 w-fit">
              <Link href="/tools/dnsbl-lookup">Open DNSBL lookup</Link>
            </Button>
          </CardHeader>
        </Card>
      </section>

      <p className="text-sm text-muted-foreground">Website tools (HTTP headers, SSL) coming in Phase 1.</p>
    </div>
  );
}
