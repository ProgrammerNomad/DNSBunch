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
        <Card>
          <CardHeader>
            <CardTitle>Mail tester</CardTitle>
            <CardDescription>
              Send a message to a unique address and get a deliverability score (dev: upload .eml).
            </CardDescription>
            <Button asChild className="mt-2 w-fit">
              <Link href="/tools/mail-tester">Open mail tester</Link>
            </Button>
          </CardHeader>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Website</h2>
        <Card>
          <CardHeader>
            <CardTitle>HTTP headers</CardTitle>
            <CardDescription>
              GET a URL (redirects capped) and inspect response headers with security headers highlighted.
            </CardDescription>
            <Button asChild className="mt-2 w-fit">
              <Link href="/tools/http-headers">Open HTTP headers</Link>
            </Button>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Redirect chain</CardTitle>
            <CardDescription>
              Follow GET redirects hop by hop (max 5) with status codes and Location headers.
            </CardDescription>
            <Button asChild className="mt-2 w-fit">
              <Link href="/tools/redirect-chain">Open redirect chain</Link>
            </Button>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>HTTP status</CardTitle>
            <CardDescription>
              Quick up/down check: final status code and response time after redirects.
            </CardDescription>
            <Button asChild className="mt-2 w-fit">
              <Link href="/tools/http-status">Open HTTP status</Link>
            </Button>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>SSL inspector</CardTitle>
            <CardDescription>
              TLS certificate expiry, issuer, protocol version, and hostname match on port 443.
            </CardDescription>
            <Button asChild className="mt-2 w-fit">
              <Link href="/tools/ssl-inspector">Open SSL inspector</Link>
            </Button>
          </CardHeader>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Domain</h2>
        <Card>
          <CardHeader>
            <CardTitle>WHOIS lookup</CardTitle>
            <CardDescription>Registrar, dates, and nameservers from RDAP.</CardDescription>
            <Button asChild className="mt-2 w-fit">
              <Link href="/tools/whois-lookup">Open WHOIS lookup</Link>
            </Button>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Domain expiry</CardTitle>
            <CardDescription>Registration expiry date and days remaining.</CardDescription>
            <Button asChild className="mt-2 w-fit">
              <Link href="/tools/domain-expiry">Open domain expiry</Link>
            </Button>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>DNS propagation</CardTitle>
            <CardDescription>Compare answers from Google, Cloudflare, and Quad9 resolvers.</CardDescription>
            <Button asChild className="mt-2 w-fit">
              <Link href="/tools/dns-propagation">Open DNS propagation</Link>
            </Button>
          </CardHeader>
        </Card>
      </section>
    </div>
  );
}
