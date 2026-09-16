import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DNS Propagation - DNSBunch',
  description: 'Compare DNS answers across Google, Cloudflare, and Quad9 resolvers.',
};

export default function DnsPropagationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
