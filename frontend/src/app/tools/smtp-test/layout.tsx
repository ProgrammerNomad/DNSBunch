import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SMTP Test - DNSBunch',
  description:
    'Test SMTP connectivity: TCP connect to port 25 or 587, read the server banner and EHLO response without sending mail.',
};

export default function SmtpTestLayout({ children }: { children: React.ReactNode }) {
  return children;
}
