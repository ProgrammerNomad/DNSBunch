import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DMARC Checker - DNSBunch',
  description:
    'Validate DMARC records: policy (p=), subdomain policy, alignment, and aggregate/forensic reporting URIs.',
};

export default function DmarcCheckerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
