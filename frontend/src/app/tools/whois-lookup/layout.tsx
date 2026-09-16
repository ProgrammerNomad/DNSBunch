import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WHOIS Lookup - DNSBunch',
  description: 'Domain registration details via RDAP.',
};

export default function WhoisLookupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
