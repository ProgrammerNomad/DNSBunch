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
import type { DmarcCheckerResponse } from '@/types/dmarc';

function statusVariant(status: DmarcCheckerResponse['status']) {
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

export function DmarcResultsPanel({ result }: { result: DmarcCheckerResponse }) {
  const hasRecord = Boolean(result.record?.trim());
  const policy = result.parsed.p;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Overall</span>
        <Badge variant={statusVariant(result.status)}>{result.status}</Badge>
        {policy !== undefined && (
          <span className="text-sm">
            Policy <strong className="font-semibold">p={policy}</strong>
          </span>
        )}
      </div>

      {!hasRecord && (
        <Alert>
          <AlertTitle>No DMARC record found</AlertTitle>
          <AlertDescription>
            Publish a TXT record at <code className="text-sm">_dmarc.{result.domain}</code> with
            at least <code className="text-sm">v=DMARC1</code> and a policy tag{' '}
            <code className="text-sm">p=none|quarantine|reject</code>. Consider aggregate reporting
            via <code className="text-sm">rua=mailto:…</code>.
          </AlertDescription>
        </Alert>
      )}

      {result.issues.length > 0 && (
        <Alert variant={result.status === 'error' ? 'destructive' : 'default'}>
          <AlertTitle>Notes</AlertTitle>
          <AlertDescription>
            <ul className="list-disc space-y-1 pl-4">
              {result.issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {result.tags.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Parsed tags</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Tag</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.tags.map((row) => (
                  <TableRow key={row.tag}>
                    <TableCell className="font-medium">{row.label}</TableCell>
                    <TableCell className="break-all font-mono text-sm">{row.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {hasRecord && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Raw TXT record</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-md bg-muted p-3 text-sm">{result.record}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
