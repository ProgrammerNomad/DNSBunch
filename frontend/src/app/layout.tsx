import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

import { theme } from '../theme/theme';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Footer } from '../components/Footer';
import { QueryProvider } from '../providers/QueryProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DNSBunch - DNS & Mail Server Diagnostics',
  description: 'Comprehensive DNS analysis tool for domains, mail servers, and DNS security. Check NS, MX, SPF, DMARC, DNSSEC and more with detailed reports.',
  keywords: 'DNS, mail server, diagnostics, SPF, DMARC, DNSSEC, MX records, domain analysis',
  authors: [{ name: 'Nomad Programmer', url: 'https://github.com/ProgrammerNomad' }],
  openGraph: {
    title: 'DNSBunch - DNS & Mail Server Diagnostics',
    description: 'Professional DNS analysis tool with comprehensive domain and mail server diagnostics',
    type: 'website',
    url: 'https://dnsbunch.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DNSBunch - DNS & Mail Server Diagnostics',
    description: 'Professional DNS analysis tool with comprehensive domain and mail server diagnostics',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <ErrorBoundary>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '100vh',
                }}
              >
                {/* Main content area */}
                <Box component="main" sx={{ flex: 1 }}>
                  {children}
                </Box>
                
                {/* Footer */}
                <Footer />
              </Box>
            </ErrorBoundary>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
