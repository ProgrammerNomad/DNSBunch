import Link from 'next/link';

export function MailTesterDomainToolLinks({ domain }: { domain: string }) {
  const q = encodeURIComponent(domain);
  return (
    <p className="text-sm text-muted-foreground">
      Open standalone checkers for{' '}
      <span className="font-medium text-foreground">{domain}</span>:{' '}
      <Link href={`/tools/spf-checker?domain=${q}`} className="underline">
        SPF
      </Link>
      {' · '}
      <Link href={`/tools/dmarc-checker?domain=${q}`} className="underline">
        DMARC
      </Link>
      {' · '}
      <Link href={`/tools/dkim-checker?domain=${q}`} className="underline">
        DKIM
      </Link>
    </p>
  );
}
