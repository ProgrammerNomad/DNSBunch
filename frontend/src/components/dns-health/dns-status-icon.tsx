import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

import { cn } from '@/lib/utils';

export type DnsStatus = 'pass' | 'warning' | 'error' | 'info' | 'success' | 'fail';

export function DnsStatusIcon({
  status,
  className,
}: {
  status: DnsStatus | string;
  className?: string;
}) {
  const iconClass = cn('h-5 w-5 shrink-0', className);

  switch (status) {
    case 'pass':
    case 'success':
      return <CheckCircle2 className={cn(iconClass, 'text-green-600 dark:text-green-500')} />;
    case 'warning':
      return <AlertTriangle className={cn(iconClass, 'text-amber-600 dark:text-amber-500')} />;
    case 'error':
    case 'fail':
      return <AlertCircle className={cn(iconClass, 'text-destructive')} />;
    case 'info':
    default:
      return <Info className={cn(iconClass, 'text-primary')} />;
  }
}
