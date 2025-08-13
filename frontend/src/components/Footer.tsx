'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Divider,
  Stack,
  Chip
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  Code as CodeIcon,
  Favorite as FavoriteIcon,
  Public as PublicIcon
} from '@mui/icons-material';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box 
      component="footer" 
      sx={{ 
        mt: 'auto',
        py: 3,
        px: 2,
        bgcolor: 'grey.100',
        borderTop: '1px solid',
        borderColor: 'grey.300'
      }}
    >
      <Container maxWidth="lg">
        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          gap={2}
        >
          {/* Left side - Project info */}
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            <PublicIcon color="primary" />
            <Typography variant="body2" color="text.secondary">
              <strong>DNSBunch</strong> - DNS & Mail Server Diagnostics
            </Typography>
          </Box>

          {/* Center - Tech stack */}
          <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
            <Chip 
              icon={<CodeIcon />}
              label="React + TypeScript" 
              size="small" 
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
            <Chip 
              label="Material-UI" 
              size="small" 
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
            <Chip 
              label="Python Flask" 
              size="small" 
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
          </Stack>

          {/* Right side - Links and credits */}
          <Box 
            display="flex" 
            flexDirection={{ xs: 'column', sm: 'row' }}
            alignItems="center" 
            gap={{ xs: 1, sm: 2 }}
            textAlign={{ xs: 'center', sm: 'right' }}
          >
            <Link
              href="https://github.com/ProgrammerNomad/DNSBunch"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: 'text.primary',
                textDecoration: 'none',
                '&:hover': {
                  color: 'primary.main',
                  textDecoration: 'underline'
                }
              }}
            >
              <GitHubIcon fontSize="small" />
              <Typography variant="body2" fontWeight="medium">
                View on GitHub
              </Typography>
            </Link>
            
            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
            
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              © {currentYear} Built with{' '}
              <FavoriteIcon 
                sx={{ 
                  fontSize: '0.8rem', 
                  color: 'error.main', 
                  verticalAlign: 'middle',
                  mx: 0.25
                }} 
              />{' '}
              by{' '}
              <Link
                href="https://github.com/ProgrammerNomad"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  color: 'inherit',
                  textDecoration: 'none',
                  fontWeight: 500,
                  '&:hover': { color: 'primary.main' }
                }}
              >
                Nomad Programmer
              </Link>
            </Typography>
          </Box>
        </Box>

        {/* Additional info for mobile */}
        <Box 
          display={{ xs: 'block', sm: 'none' }}
          textAlign="center"
          mt={2}
          pt={2}
          borderTop="1px solid"
          borderColor="grey.300"
        >
          <Typography variant="caption" color="text.secondary" display="block">
            Open source DNS analysis tool
          </Typography>
          <Typography variant="caption" color="text.secondary">
            No registration required • Privacy focused • Fast & reliable
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}