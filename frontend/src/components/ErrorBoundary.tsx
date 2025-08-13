'use client';

import React, { Component, ErrorInfo } from 'react';
import { Box, Typography, Button, Alert, AlertTitle } from '@mui/material';
import { Refresh as RefreshIcon, Home as HomeIcon } from '@mui/icons-material';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can log the error to an error reporting service here
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="400px"
          p={4}
          textAlign="center"
        >
          <Alert severity="error" sx={{ mb: 3, maxWidth: 600 }}>
            <AlertTitle>Oops! Something went wrong</AlertTitle>
            We&apos;re sorry, but an unexpected error occurred. This could be due to a 
            temporary issue with the application or your internet connection.
          </Alert>

          <Typography variant="h6" gutterBottom color="text.secondary">
            Error Details:
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              fontFamily: 'monospace', 
              bgcolor: 'grey.100', 
              p: 2, 
              borderRadius: 1,
              mb: 3,
              maxWidth: 600,
              overflow: 'auto'
            }}
          >
            {this.state.error?.message || 'Unknown error occurred'}
          </Typography>

          <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={this.handleRetry}
              size="large"
            >
              Try Again
            </Button>
            
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<HomeIcon />}
              onClick={this.handleGoHome}
              size="large"
            >
              Go Home
            </Button>
          </Box>

          {/* Developer information in development mode */}
          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <Box mt={4} textAlign="left" maxWidth="100%" overflow="auto">
              <Typography variant="subtitle2" gutterBottom>
                Component Stack Trace:
              </Typography>
              <Typography 
                variant="body2" 
                component="pre" 
                sx={{ 
                  fontFamily: 'monospace', 
                  fontSize: '0.8rem',
                  bgcolor: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  overflow: 'auto'
                }}
              >
                {this.state.errorInfo.componentStack}
              </Typography>
            </Box>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}
