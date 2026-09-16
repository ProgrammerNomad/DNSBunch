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
import type { SpfCheckerResponse } from '@/types/spf';

function statusVariant(status: SpfCheckerResponse['status']) {
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

export function SpfResultsPanel({ result }: { result: SpfCheckerResponse }) {
  const hasRecord = Boolean(result.record?.trim());
  const lookupOverLimit = result.dns_lookups > result.dns_lookup_limit;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Overall</span>
        <Badge variant={statusVariant(result.status)}>{result.status}</Badge>
        <span className="text-sm">
          DNS lookups{' '}
          <strong className={lookupOverLimit ? 'text-destructive' : 'font-semibold'}>
            {result.dns_lookups}/{result.dns_lookup_limit}
          </strong>
        </span>
      </div>

      {!hasRecord && (
        <Alert>
          <AlertTitle>No SPF record found</AlertTitle>
          <AlertDescription>
            Publish a TXT record at the root of <code className="text-sm">{result.domain}</code>{' '}
            starting with <code className="text-sm">v=spf1</code>, listing authorized senders, and
            ending with a qualifier such as <code className="text-sm">-all</code> or{' '}
            <code className="text-sm">~all</code>.
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

      {result.mechanisms.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Mechanisms and modifiers</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">#</TableHead>
                  <TableHead>Token</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.mechanisms.map((token, index) => (
                  <TableRow key={`${index}-${token}`}>
                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                    <TableCell className="break-all font-mono text-sm">{token}</TableCell>
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
