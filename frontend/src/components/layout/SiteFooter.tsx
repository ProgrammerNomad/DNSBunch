import Link from 'next/link';
import { ExternalLink, Heart } from 'lucide-react';

import { APP_VERSION } from '@/config/version';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t bg-muted/40 py-4">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span>
            <strong className="text-foreground">DNSBunch</strong> - DNS &amp; email diagnostics
          </span>
          <Link
            href="https://github.com/ProgrammerNomad/DNSBunch/blob/main/CHANGELOG.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Badge variant="outline">v{APP_VERSION}</Badge>
          </Link>
        </div>

        <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
          <Link
            href="https://github.com/ProgrammerNomad/DNSBunch"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-foreground hover:text-primary"
          >
            <ExternalLink className="h-4 w-4" />
            View on GitHub
          </Link>
          <Separator orientation="vertical" className="hidden h-4 sm:block" />
          <p className="flex items-center gap-1 text-center text-xs">
            © {year} Built with <Heart className="h-3 w-3 text-destructive" aria-hidden /> by{' '}
            <Link
              href="https://github.com/ProgrammerNomad"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-primary"
            >
              Nomad Programmer
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
