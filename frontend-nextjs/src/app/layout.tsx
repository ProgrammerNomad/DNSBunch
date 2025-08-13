import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { theme } from '@/theme/theme';
import { QueryProvider } from '@/providers/QueryProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  title: 'DNSBunch - DNS & Mail Server Diagnostics',
  description: 'Comprehensive DNS and Mail Server Diagnostics Tool - Analyze NS, SOA, MX, SPF, DMARC, DKIM records and much more!',
  keywords: 'DNS, diagnostics, SPF, DMARC, MX, nameserver, email, mail server',
  authors: [{ name: 'Nomad Programmer' }],
  openGraph: {
    title: 'DNSBunch - DNS & Mail Server Diagnostics',
    description: 'Comprehensive DNS and Mail Server Diagnostics Tool',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <QueryProvider>
              <ErrorBoundary>
                {children}
                <ToastContainer
                  position="top-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                />
              </ErrorBoundary>
            </QueryProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
