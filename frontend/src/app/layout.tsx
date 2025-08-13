import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { theme } from '../theme/theme';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DNSBunch - DNS Analysis & Mail Server Diagnostics',
  description: 'Comprehensive DNS record analysis, mail server diagnostics, and email security validation tool. Check SPF, DMARC, DKIM, and more.',
  keywords: ['DNS', 'mail server', 'SPF', 'DMARC', 'DKIM', 'DNS analysis', 'email security'],
  authors: [{ name: 'Nomad Programmer' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ margin: 0, padding: 0, minHeight: '100vh' }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
          {/* No footer here - it's handled in the page component */}
        </ThemeProvider>
      </body>
    </html>
  );
}
