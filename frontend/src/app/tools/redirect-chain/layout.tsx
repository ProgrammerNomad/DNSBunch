import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Redirect Chain - DNSBunch',
  description: 'Follow HTTP redirects hop by hop and see status codes and final URL.',
};

export default function RedirectChainLayout({ children }: { children: React.ReactNode }) {
  return children;
}
