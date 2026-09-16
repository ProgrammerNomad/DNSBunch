import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DomainExpiryResponse } from '@/types/domain-expiry';

export function DomainExpiryResultsPanel({ result }: { result: DomainExpiryResponse }) {
  return (
    <div className="space-y-4">
      <Badge variant={result.status === 'error' ? 'destructive' : 'secondary'}>{result.status}</Badge>
      {result.error && (
        <Alert variant="destructive">
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      )}
      {result.issues.length > 0 && !result.error && (
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
          <CardTitle className="text-base">{result.domain}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <span className="text-muted-foreground">Expiry</span>
            <p className="font-mono">{result.expiry_date ?? 'Unknown'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Days remaining</span>
            <p className="font-mono text-lg">
              {result.days_until_expiry != null ? result.days_until_expiry : '-'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
