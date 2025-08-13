'use client';

import React from 'react';
import { 
  Alert, 
  AlertTitle, 
  Box, 
  Button, 
  Container, 
  Typography,
  Paper
} from '@mui/material';
import { ErrorOutline as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} retry={this.handleRetry} />;
      }

      return (
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            
            <Typography variant="h4" gutterBottom color="error">
              Oops! Something went wrong
            </Typography>
            
            <Typography variant="body1" color="text.secondary" mb={3}>
              An unexpected error occurred while running the application.
            </Typography>

            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              <AlertTitle>Error Details</AlertTitle>
              <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                {this.state.error?.message || 'Unknown error'}
              </Typography>
              {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
                <Typography variant="body2" component="pre" sx={{ 
                  fontFamily: 'monospace', 
                  fontSize: '0.7rem', 
                  mt: 1,
                  overflow: 'auto',
                  maxHeight: 200
                }}>
                  {this.state.error.stack}
                </Typography>
              )}
            </Alert>

            <Box display="flex" gap={2} justifyContent="center">
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={this.handleRetry}
                size="large"
              >
                Try Again
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => window.location.reload()}
                size="large"
              >
                Reload Page
              </Button>
            </Box>

            {process.env.NODE_ENV === 'development' && (
              <Alert severity="info" sx={{ mt: 3, textAlign: 'left' }}>
                <AlertTitle>Development Info</AlertTitle>
                <Typography variant="body2">
                  This error boundary is shown because you're in development mode. 
                  In production, users would see a more user-friendly error message.
                </Typography>
              </Alert>
            )}
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

// Functional component version for simpler error displays
interface SimpleErrorFallbackProps {
  error: Error;
  retry: () => void;
}

export function SimpleErrorFallback({ error, retry }: SimpleErrorFallbackProps) {
  return (
    <Alert severity="error" sx={{ m: 2 }}>
      <AlertTitle>Error</AlertTitle>
      <Typography variant="body2" gutterBottom>
        {error.message}
      </Typography>
      <Button size="small" onClick={retry} startIcon={<RefreshIcon />}>
        Try Again
      </Button>
    </Alert>
  );
}
