import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SslInspectorResponse } from '@/types/ssl-inspector';

function statusVariant(status: SslInspectorResponse['status']) {
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

export function SslInspectorResultsPanel({ result }: { result: SslInspectorResponse }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Overall</span>
        <Badge variant={statusVariant(result.status)}>{result.status}</Badge>
        {result.tls_version && <Badge variant="outline">{result.tls_version}</Badge>}
        <Badge variant={result.hostname_match ? 'outline' : 'secondary'}>
          {result.hostname_match ? 'name OK' : 'name mismatch'}
        </Badge>
      </div>

      {result.error && (
        <Alert variant="destructive">
          <AlertTitle>Connection failed</AlertTitle>
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
          <CardTitle className="text-base">Certificate</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Subject CN</span>
            <p className="font-mono break-all">{result.subject_cn ?? '-'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Issuer</span>
            <p className="break-all">{result.issuer ?? '-'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Valid from</span>
            <p className="font-mono text-xs">{result.not_before ?? '-'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Valid until</span>
            <p className="font-mono text-xs">{result.not_after ?? '-'}</p>
          </div>
          {result.days_until_expiry != null && (
            <div>
              <span className="text-muted-foreground">Days until expiry</span>
              <p className="font-mono text-lg">{result.days_until_expiry}</p>
            </div>
          )}
          {result.sans.length > 0 && (
            <div>
              <span className="text-muted-foreground">DNS names (SAN/CN)</span>
              <ul className="mt-1 list-inside list-disc font-mono text-xs">
                {result.sans.map((name) => (
                  <li key={name} className="break-all">
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
