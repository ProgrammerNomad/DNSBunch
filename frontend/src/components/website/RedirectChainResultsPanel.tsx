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
import type { RedirectChainResponse } from '@/types/redirect-chain';

function statusVariant(status: RedirectChainResponse['status']) {
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

export function RedirectChainResultsPanel({ result }: { result: RedirectChainResponse }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Overall</span>
        <Badge variant={statusVariant(result.status)}>{result.status}</Badge>
        {result.final_status_code != null && (
          <Badge variant="outline">Final HTTP {result.final_status_code}</Badge>
        )}
        {result.loop_detected && <Badge variant="destructive">loop</Badge>}
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

      {result.hops.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Redirect hops</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.hops.map((hop) => (
                  <TableRow key={`${hop.index}-${hop.url}`}>
                    <TableCell>{hop.index}</TableCell>
                    <TableCell className="max-w-md break-all font-mono text-xs">{hop.url}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{hop.status_code}</Badge>
                    </TableCell>
                    <TableCell className="max-w-md break-all font-mono text-xs">
                      {hop.location ?? '-'}
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
