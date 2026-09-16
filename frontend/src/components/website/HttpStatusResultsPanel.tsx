import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { HttpStatusResponse } from '@/types/http-status';

function statusVariant(status: HttpStatusResponse['status']) {
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

export function HttpStatusResultsPanel({ result }: { result: HttpStatusResponse }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Overall</span>
        <Badge variant={statusVariant(result.status)}>{result.status}</Badge>
        {result.status_code != null && (
          <Badge variant="outline">HTTP {result.status_code}</Badge>
        )}
        <Badge variant="outline">{result.latency_ms} ms</Badge>
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
          <CardTitle className="text-base">Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <span className="text-muted-foreground">Status code</span>
            <p className="font-mono text-lg">{result.status_code ?? '-'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Latency</span>
            <p className="font-mono text-lg">{result.latency_ms} ms</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
