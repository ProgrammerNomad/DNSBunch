import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - DNSBunch',
  description: 'Your DNSBunch account overview and saved checks.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
