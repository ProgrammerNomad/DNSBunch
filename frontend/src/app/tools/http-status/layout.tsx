import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HTTP Status - DNSBunch',
  description: 'Check HTTP status code and response time for a URL.',
};

export default function HttpStatusLayout({ children }: { children: React.ReactNode }) {
  return children;
}
