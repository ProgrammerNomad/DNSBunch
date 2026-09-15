'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Skeleton } from '@/components/ui/skeleton';

interface DomainPageProps {
  params: Promise<{
    domain: string[];
  }>;
}

export default function DomainPage({ params }: DomainPageProps) {
  const router = useRouter();

  useEffect(() => {
    const handleParams = async () => {
      try {
        const resolvedParams = await params;
        const domainPath = resolvedParams.domain.join('/');

        const extractDomainFromPath = (path: string): string | null => {
          try {
            let cleanPath = path.replace(/^https?:\/\//, '');
            if (cleanPath.includes('/')) {
              cleanPath = cleanPath.split('/')[0];
            }
            if (/^[a-zA-Z0-9][a-zA-Z0-9-_.]*[a-zA-Z0-9]$/.test(cleanPath) && cleanPath.includes('.')) {
              return cleanPath;
            }
            return null;
          } catch {
            return null;
          }
        };

        const domain = extractDomainFromPath(domainPath);
        if (domain) {
          router.replace(`/?domain=${encodeURIComponent(domain)}`);
        } else {
          router.replace('/');
        }
      } catch (error) {
        console.error('Error handling params:', error);
        router.replace('/');
      }
    };

    handleParams();
  }, [params, router]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
      <Skeleton className="h-8 w-48" />
      <p className="text-sm text-muted-foreground">Loading DNS analysis…</p>
    </div>
  );
}
