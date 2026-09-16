import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SPF Checker - DNSBunch',
  description:
    'Look up and validate SPF TXT records: mechanisms, modifiers, and DNS lookup count (RFC 7208 limit).',
};

export default function SpfCheckerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
