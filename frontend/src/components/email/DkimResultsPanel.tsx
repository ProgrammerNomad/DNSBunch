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
import type { DkimCheckerResponse } from '@/types/dkim';

function statusVariant(status: DkimCheckerResponse['status']) {
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

export function DkimResultsPanel({ result }: { result: DkimCheckerResponse }) {
  const hasRecord = Boolean(result.record?.trim());

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Overall</span>
        <Badge variant={statusVariant(result.status)}>{result.status}</Badge>
        <code className="rounded bg-muted px-2 py-0.5 text-sm">{result.host}</code>
      </div>

      {!hasRecord && (
        <Alert>
          <AlertTitle>No DKIM record at this selector</AlertTitle>
          <AlertDescription>
            No TXT record was found at <code className="text-sm">{result.host}</code>. Confirm the
            selector with your mail provider or try a common preset (e.g. google, selector1).
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
