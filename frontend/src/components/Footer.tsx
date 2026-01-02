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
  Public as PublicIcon,
  LocalOffer as VersionIcon,
  Palette as PaletteIcon,
  Storage as StorageIcon
} from '@mui/icons-material';
import { APP_VERSION } from '../config/version';

// Technology logo components
const TechIcon = ({ src, alt }: { src: string; alt: string }) => (
  <Box
    component="img"
    src={src}
    alt={alt}
    sx={{ width: '14px', height: '14px', objectFit: 'contain' }}
  />
);

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box 
      component="footer" 
      sx={{ 
        mt: 'auto',
        py: 1.5,
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
          gap={1.5}
        >
          {/* Left side - Project info with version */}
          <Box display="flex" alignItems="center" gap={0.75} flexWrap="wrap">
            <PublicIcon sx={{ fontSize: '1.1rem', color: 'primary.main' }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              <strong>DNSBunch</strong> - DNS Diagnostics
            </Typography>
            <Link
              href="https://github.com/ProgrammerNomad/DNSBunch/blob/main/CHANGELOG.md"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ textDecoration: 'none' }}
            >
              <Chip
                icon={<VersionIcon sx={{ fontSize: '0.75rem !important' }} />}
                label={`v${APP_VERSION}`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ 
                  fontSize: '0.65rem',
                  height: '20px',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                    borderColor: 'primary.main'
                  }
                }}
              />
            </Link>
          </Box>

          {/* Center - Tech stack */}
          <Stack direction="row" spacing={1.5} flexWrap="wrap" justifyContent="center" alignItems="center">
            <TechIcon src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" alt="React" />
            <TechIcon src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" alt="TypeScript" />
            <TechIcon src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/materialui/materialui-original.svg" alt="Material-UI" />
            <TechIcon src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" alt="Python" />
            <TechIcon src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg" alt="Flask" />
          </Stack>

          {/* Right side - Links and credits */}
          <Box 
            display="flex" 
            flexDirection={{ xs: 'column', sm: 'row' }}
            alignItems="center" 
            gap={{ xs: 0.75, sm: 1.5 }}
            textAlign={{ xs: 'center', sm: 'right' }}
          >
            <Link
              href="https://github.com/ProgrammerNomad/DNSBunch"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.4,
                color: 'text.primary',
                textDecoration: 'none',
                '&:hover': {
                  color: 'primary.main',
                  textDecoration: 'underline'
                }
              }}
            >
              <GitHubIcon sx={{ fontSize: '1rem' }} />
              <Typography variant="body2" fontWeight="medium" sx={{ fontSize: '0.8rem' }}>
                View on GitHub
              </Typography>
            </Link>
            
            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
            
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              © {currentYear} Built with{' '}
              <FavoriteIcon 
                sx={{ 
                  fontSize: '0.7rem', 
                  color: 'error.main', 
                  verticalAlign: 'middle',
                  mx: 0.2
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
      </Container>
    </Box>
  );
}