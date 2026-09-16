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
import type { HttpHeadersResponse } from '@/types/http-headers';

function statusVariant(status: HttpHeadersResponse['status']) {
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

export function HttpHeadersResultsPanel({ result }: { result: HttpHeadersResponse }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Overall</span>
        <Badge variant={statusVariant(result.status)}>{result.status}</Badge>
        {result.status_code != null && (
          <Badge variant="outline">HTTP {result.status_code}</Badge>
        )}
      </div>

      {result.final_url && (
        <p className="text-sm text-muted-foreground">
          Final URL:{' '}
          <span className="break-all font-mono text-foreground">{result.final_url}</span>
        </p>
      )}

      {result.error && (
        <Alert variant="destructive">
          <AlertTitle>Request failed</AlertTitle>
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      )}

      {result.issues.length > 0 && !result.error && (
        <Alert variant={result.status === 'warning' ? 'default' : 'destructive'}>
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

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Security headers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Header</TableHead>
                <TableHead>Present</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.security_headers.map((row) => (
                <TableRow key={row.name}>
                  <TableCell className="font-mono text-sm">{row.name}</TableCell>
                  <TableCell>
                    {row.present ? (
                      <Badge variant="default">yes</Badge>
                    ) : (
                      <Badge variant="outline">missing</Badge>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xl break-all font-mono text-xs">
                    {row.value ?? '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {result.headers.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">All response headers</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.headers.map((row) => (
                  <TableRow
                    key={row.name}
                    className={row.security ? 'bg-muted/40' : undefined}
                  >
                    <TableCell className="font-mono text-sm">
                      {row.name}
                      {row.security && (
                        <Badge variant="secondary" className="ml-2 text-[10px]">
                          security
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xl break-all font-mono text-xs">
                      {row.value}
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
