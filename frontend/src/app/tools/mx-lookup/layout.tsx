import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MX Lookup - DNSBunch',
  description: 'List MX records for a domain with priorities and resolved mail server IP addresses.',
};

export default function MxLookupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
