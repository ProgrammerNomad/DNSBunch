import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SSL Inspector - DNSBunch',
  description: 'Inspect TLS certificate expiry, issuer, and hostname match for HTTPS hosts.',
};

export default function SslInspectorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
