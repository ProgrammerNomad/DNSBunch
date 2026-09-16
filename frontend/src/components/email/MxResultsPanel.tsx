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
import type { MxLookupResponse } from '@/types/mx';

function statusVariant(status: MxLookupResponse['status']) {
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

export function MxResultsPanel({ result }: { result: MxLookupResponse }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Overall</span>
        <Badge variant={statusVariant(result.status)}>{result.status}</Badge>
        <span className="text-sm">
          {result.count} MX record{result.count === 1 ? '' : 's'}
        </span>
      </div>

      {result.count === 0 && (
        <Alert>
          <AlertTitle>No MX records</AlertTitle>
          <AlertDescription>
            This domain has no MX records in DNS. Mail cannot be delivered to{' '}
            <code className="text-sm">{result.domain}</code> until MX is configured, unless mail
            is handled elsewhere.
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

      {result.rows.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">MX records</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Priority</TableHead>
                  <TableHead>Mail server</TableHead>
                  <TableHead>IP addresses</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.rows.map((row) => (
                  <TableRow key={`${row.priority}-${row.host}`}>
                    <TableCell className="font-mono">{row.priority}</TableCell>
                    <TableCell className="break-all font-medium">{row.host}</TableCell>
                    <TableCell className="break-all text-sm">
                      {row.ips.length > 0 ? (
                        row.ips.join(', ')
                      ) : row.error ? (
                        <span className="text-destructive">{row.error}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
