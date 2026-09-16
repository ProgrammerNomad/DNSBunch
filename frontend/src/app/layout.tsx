import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { AppShell } from '@/components/layout/AppShell';
import { AuthSessionProvider } from '@/components/providers/session-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DNSBunch - DNS Analysis & Mail Server Diagnostics',
  description:
    'Comprehensive DNS record analysis, mail server diagnostics, and email security validation tool. Check SPF, DMARC, DKIM, and more.',
  keywords: ['DNS', 'mail server', 'SPF', 'DMARC', 'DKIM', 'DNS analysis', 'email security'],
  authors: [{ name: 'Nomad Programmer' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthSessionProvider>
            <AppShell>{children}</AppShell>
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
