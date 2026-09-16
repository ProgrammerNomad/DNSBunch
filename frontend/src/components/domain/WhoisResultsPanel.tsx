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
import type { WhoisLookupResponse } from '@/types/whois';

export function WhoisResultsPanel({ result }: { result: WhoisLookupResponse }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={result.status === 'error' ? 'destructive' : 'default'}>{result.status}</Badge>
        <span className="font-mono text-sm">{result.domain}</span>
      </div>
      {result.error && (
        <Alert variant="destructive">
          <AlertTitle>Lookup failed</AlertTitle>
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      )}
      {result.fields.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Registration data (RDAP)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.fields.map((row) => (
                  <TableRow key={row.label}>
                    <TableCell className="font-medium">{row.label}</TableCell>
                    <TableCell className="break-all font-mono text-xs">{row.value}</TableCell>
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
