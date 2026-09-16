import { Alert, AlertDescription } from '@/components/ui/alert';
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
import type { DnsPropagationResponse } from '@/types/dns-propagation';

export function DnsPropagationResultsPanel({ result }: { result: DnsPropagationResponse }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={result.status === 'warning' ? 'secondary' : 'default'}>{result.status}</Badge>
        <Badge variant="outline">{result.agreement_percent}% agreement</Badge>
        <span className="font-mono text-sm">
          {result.name} · {result.record_type}
        </span>
      </div>
      {result.issues.length > 0 && (
        <Alert>
          <AlertDescription>
            <ul className="list-disc pl-4">
              {result.issues.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Public resolvers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resolver</TableHead>
                <TableHead>Answers</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.rows.map((row) => (
                <TableRow key={row.resolver_id}>
                  <TableCell>
                    {row.resolver_id}{' '}
                    <span className="font-mono text-xs text-muted-foreground">({row.resolver_ip})</span>
                  </TableCell>
                  <TableCell className="max-w-md break-all font-mono text-xs">
                    {row.answers.length ? row.answers.join(', ') : '-'}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{row.error ?? '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
