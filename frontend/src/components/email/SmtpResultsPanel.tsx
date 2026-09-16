import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SmtpTestResponse } from '@/types/smtp';

function statusVariant(status: SmtpTestResponse['status']) {
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

export function SmtpResultsPanel({ result }: { result: SmtpTestResponse }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Overall</span>
        <Badge variant={statusVariant(result.status)}>{result.status}</Badge>
        <code className="rounded bg-muted px-2 py-0.5 text-sm">
          {result.host}:{result.port}
        </code>
        {result.domain && (
          <span className="text-sm text-muted-foreground">via MX for {result.domain}</span>
        )}
      </div>

      {result.error && (
        <Alert variant="destructive">
          <AlertTitle>Connection error</AlertTitle>
          <AlertDescription>{result.error}</AlertDescription>
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

      {result.banner && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">SMTP banner (220)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-md bg-muted p-3 text-sm">{result.banner}</pre>
          </CardContent>
        </Card>
      )}

      {result.ehlo_response && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">EHLO response</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-md bg-muted p-3 text-sm">
              {result.ehlo_response}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
