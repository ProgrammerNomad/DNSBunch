import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Domain Expiry - DNSBunch',
  description: 'Days until domain registration expiry from RDAP.',
};

export default function DomainExpiryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
