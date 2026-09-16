'use client';

import { CheckCircle2, XCircle } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MailTesterDnsPanels } from '@/components/email/mail-tester/MailTesterDnsPanels';
import { MailTesterDomainToolLinks } from '@/components/email/mail-tester/MailTesterDomainToolLinks';
import type { MailTestReportV2 } from '@/lib/mail-test/report-types';

function PassIcon({ ok }: { ok: boolean }) {
  return ok ? (
    <CheckCircle2 className="h-4 w-4 text-green-600" aria-label="Pass" />
  ) : (
    <XCircle className="h-4 w-4 text-destructive" aria-label="Fail" />
  );
}

export function MailTesterReportSections({ report }: { report: MailTestReportV2 }) {
  const cats = report.categories;
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-4xl">{report.score}/10</CardTitle>
          <CardDescription>{report.summary.verdict}</CardDescription>
          <p className="text-sm capitalize text-muted-foreground">Status: {report.summary.status}</p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {(['authentication', 'spam_analysis', 'blacklists', 'message_quality'] as const).map((key) => (
            <span key={key} className="rounded-md border px-2 py-1 text-xs">
              {key.replace('_', ' ')}: {Math.round((cats[key]?.partial ?? 0) * 100)}%
            </span>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Message authentication</CardTitle>
          <CardDescription>From Authentication-Results on the received message</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              {(['spf', 'dkim', 'dmarc'] as const).map((k) => (
                <TableRow key={k}>
                  <TableCell className="font-medium uppercase">{k}</TableCell>
                  <TableCell>{report.message_authentication[k].result}</TableCell>
                  <TableCell className="text-muted-foreground">{report.message_authentication[k].detail}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>DNS configuration</CardTitle>
          <CardDescription>Same checks as standalone SPF/DKIM/DMARC tools (single source of truth)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {report.from_domain ? <MailTesterDomainToolLinks domain={report.from_domain} /> : null}
          <MailTesterDnsPanels dns={report.dns_configuration} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sender path</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>IP: {report.sender.ip ?? '-'}</p>
          <p>PTR: {report.sender.ptr ?? '-'}</p>
          <p>HELO: {report.sender.helo ?? '-'}</p>
          {report.sender.received_chain?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hop</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.sender.received_chain.map((hop, i) => (
                  <TableRow key={i}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{String(hop.from_host ?? '-')}</TableCell>
                    <TableCell>{String(hop.by_host ?? '-')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Blocklists</CardTitle>
          <CardDescription>
            {report.blacklists.listed}/{report.blacklists.total} listed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead> </TableHead>
                <TableHead>List</TableHead>
                <TableHead>Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(report.blacklists.results as Array<{ label?: string; result?: string; ip?: string }>).map((row, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <PassIcon ok={row.result !== 'listed'} />
                  </TableCell>
                  <TableCell>{row.label ?? row.ip ?? '-'}</TableCell>
                  <TableCell>{row.result ?? '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Spam analysis</CardTitle>
          <CardDescription>
            {report.spamassassin.available
              ? `SpamAssassin score: ${report.spamassassin.score ?? 'n/a'}`
              : 'SpamAssassin (spamc) not available on server'}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Raw headers</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-all rounded bg-muted p-3 text-xs">
            {report.headers.raw}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
