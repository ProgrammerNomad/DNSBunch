import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { DnsblLookupResponse, DnsblRow } from '@/types/dnsbl';

function statusVariant(status: DnsblLookupResponse['status']) {
  switch (status) {
    case 'pass':
      return 'default' as const;
    case 'error':
      return 'destructive' as const;
    case 'warning':
      return 'secondary' as const;
    default:
      return 'outline' as const;
  }
}

function rowBadge(row: DnsblRow) {
  switch (row.result) {
    case 'listed':
      return <Badge variant="destructive">listed</Badge>;
    case 'error':
      return <Badge variant="secondary">error</Badge>;
    default:
      return <Badge variant="outline">clean</Badge>;
  }
}

export function DnsblResultsPanel({ result }: { result: DnsblLookupResponse }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Overall</span>
        <Badge variant={statusVariant(result.status)}>{result.status}</Badge>
        <span className="text-sm text-muted-foreground">
          {result.ips_checked.length} IP(s) checked · {result.rows.length} queries
        </span>
      </div>

      {result.issues.length > 0 && (
        <Alert variant={result.status === 'warning' ? 'default' : 'destructive'}>
          <AlertTitle>Summary</AlertTitle>
          <AlertDescription>
            <ul className="list-disc space-y-1 pl-4">
              {result.issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Blocklist results</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>List</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Response</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.rows.map((row) => (
                <TableRow key={`${row.rbl_id}-${row.ip}`}>
                  <TableCell className="font-medium">{row.label}</TableCell>
                  <TableCell className="font-mono text-sm">{row.ip}</TableCell>
                  <TableCell>{rowBadge(row)}</TableCell>
                  <TableCell className="max-w-[280px] break-all text-sm text-muted-foreground">
                    {row.response || row.message || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Queries use reverse IPv4 DNS against Spamhaus ZEN, SpamCop, and Barracuda zones. Respect
        provider terms; IPv6 not supported in v1.
      </p>
    </div>
  );
}
