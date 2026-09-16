import { CheckCircle2, XCircle } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export type MailTestCheck = {
  id: string;
  label: string;
  pass: boolean;
  detail: string;
};

export type MailTestScorePayload = {
  score: number;
  checks: MailTestCheck[];
  summary: string;
  from_domain?: string | null;
};

export function MailTesterResultsPanel({ result }: { result: MailTestScorePayload }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Score: {result.score}/10</CardTitle>
        <CardDescription>{result.summary}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"> </TableHead>
              <TableHead>Check</TableHead>
              <TableHead>Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.checks.map((check) => (
              <TableRow key={check.id}>
                <TableCell>
                  {check.pass ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" aria-label="Pass" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" aria-label="Fail" />
                  )}
                </TableCell>
                <TableCell className="font-medium">{check.label}</TableCell>
                <TableCell className="text-muted-foreground">{check.detail}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
