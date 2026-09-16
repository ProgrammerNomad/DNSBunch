import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HTTP Headers - DNSBunch',
  description: 'Fetch a URL and inspect response headers with security headers highlighted.',
};

export default function HttpHeadersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
