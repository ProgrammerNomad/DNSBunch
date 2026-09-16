import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DKIM Checker - DNSBunch',
  description:
    'Look up DKIM TXT records by domain and selector. Validate key type, public key, and record format.',
};

export default function DkimCheckerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
