import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DNSBL Lookup - DNSBunch',
  description:
    'Check IPv4 addresses against common DNS blocklists (Spamhaus ZEN, SpamCop, Barracuda).',
};

export default function DnsblLookupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
