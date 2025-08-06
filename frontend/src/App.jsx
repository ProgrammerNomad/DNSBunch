import React, { useState, useEffect } from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Box,
  Alert,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  Link
} from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ErrorBoundary from './components/ErrorBoundary';
import DomainSearchForm from './components/DomainSearchForm';
import DNSResults from './components/DNSResults';
import { dnsService } from './services/api';

// Create Material UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
});

// Create QueryClient for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState('checking');

  // Check API health on component mount
  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      await dnsService.checkHealth();
      setApiStatus('healthy');
    } catch (error) {
      console.error('API health check failed:', error);
      setApiStatus('unhealthy');
    }
  };

  const handleDomainSearch = async (domain, checks) => {
    setLoading(true);
    setError('');
    setResults(null);

    try {
      console.log(`Starting DNS analysis for ${domain} with checks:`, checks);
      const data = await dnsService.checkDomain(domain, checks);
      setResults(data);
    } catch (err) {
      console.error('DNS check failed:', err);
      setError(err.message || 'Failed to perform DNS analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="App">
          {/* Header */}
          <AppBar position="static" color="primary">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                🔍 DNSBunch
              </Typography>
              <Link 
                href="https://github.com/ProgrammerNomad/DNSBunch" 
                target="_blank"
                color="inherit"
                sx={{ mr: 2, textDecoration: 'none' }}
              >
                GitHub
              </Link>
              <Link 
                href="#about"
                color="inherit"
                sx={{ textDecoration: 'none' }}
              >
                About
              </Link>
            </Toolbar>
          </AppBar>

          {/* Hero Section */}
          <Box 
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              py: 6,
              mb: 4
            }}
          >
            <Container maxWidth="lg">
              <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
                DNS & Mail Server Diagnostics
              </Typography>
              <Typography variant="h6" align="center" sx={{ mb: 2 }}>
                Comprehensive analysis of your domain's DNS configuration, mail server setup, 
                and potential issues affecting domain health and email deliverability.
              </Typography>
              <Typography variant="body1" align="center" sx={{ opacity: 0.9 }}>
                Analyze NS, SOA, MX, SPF, DMARC, DKIM records and much more - all in one place!
              </Typography>
            </Container>
          </Box>

          {/* API Status */}
          {apiStatus === 'unhealthy' && (
            <Container maxWidth="lg" sx={{ mb: 2 }}>
              <Alert severity="error">
                <strong>API Service Unavailable</strong> - The DNS analysis service is currently unavailable. 
                Please try again later or check if the backend server is running.
              </Alert>
            </Container>
          )}

          {apiStatus === 'checking' && (
            <Container maxWidth="lg" sx={{ mb: 2 }}>
              <Alert severity="info" sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Checking API service status...
              </Alert>
            </Container>
          )}

          {/* Main Content */}
          <Container maxWidth="lg">
            {/* Search Form */}
            <DomainSearchForm 
              onSearch={handleDomainSearch} 
              loading={loading}
              error={error}
            />

            {/* Loading Indicator */}
            {loading && (
              <Box display="flex" flexDirection="column" alignItems="center" py={4}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Analyzing DNS Records...
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  This may take up to 60 seconds depending on the domain's DNS configuration.
                </Typography>
              </Box>
            )}

            {/* Results */}
            {results && !loading && (
              <DNSResults results={results} />
            )}

            {/* About Section */}
            <Box id="about" sx={{ mt: 6, mb: 4 }}>
              <Typography variant="h4" gutterBottom>
                What is DNSBunch?
              </Typography>
              <Typography variant="body1" paragraph>
                DNSBunch is a comprehensive DNS and mail server diagnostics tool that helps you:
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Check all DNS record types (NS, SOA, A, AAAA, MX, TXT, CNAME, PTR, CAA)" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Validate email authentication records (SPF, DMARC, DKIM)" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Identify DNS misconfigurations and potential issues" />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Improve email deliverability and domain reliability" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Get detailed reports with actionable recommendations" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="DNSSEC validation and zone transfer checks" />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>

              <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
                Record Types Analyzed
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="NS Records" 
                        secondary="Authoritative nameservers" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="SOA Record" 
                        secondary="Start of Authority information" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="A/AAAA Records" 
                        secondary="IPv4/IPv6 addresses" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="MX Records" 
                        secondary="Mail exchange servers" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="SPF Records" 
                        secondary="Sender Policy Framework" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="TXT Records" 
                        secondary="Text-based information" 
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="CNAME Records" 
                        secondary="Canonical name aliases" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="PTR Records" 
                        secondary="Reverse DNS lookup" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="CAA Records" 
                        secondary="Certificate authority authorization" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="DMARC" 
                        secondary="Email authentication policy" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="DKIM" 
                        secondary="DomainKeys identified mail" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="DNSSEC" 
                        secondary="DNS security extensions" 
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </Box>
          </Container>

          {/* Footer */}
          <Box 
            component="footer" 
            sx={{ 
              bgcolor: 'grey.100', 
              py: 3, 
              mt: 6,
              borderTop: 1,
              borderColor: 'grey.300'
            }}
          >
            <Container maxWidth="lg">
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 1 }}>
                <strong>DNSBunch</strong> - Open Source DNS Diagnostics Tool
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Created by{' '}
                <Link 
                  href="https://github.com/ProgrammerNomad" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  color="inherit"
                >
                  Nomad Programmer
                </Link>
                {' | '}
                <Link 
                  href="https://github.com/ProgrammerNomad/DNSBunch" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  color="inherit"
                >
                  View Source Code
                </Link>
              </Typography>
            </Container>
          </Box>

          {/* Toast Notifications */}
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
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
