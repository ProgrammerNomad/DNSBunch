import React from 'react';
import { Typography, Container, Box } from '@mui/material';

function TestApp() {
  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h1" component="h1" gutterBottom>
          DNSBunch Test
        </Typography>
        <Typography variant="body1">
          If you can see this, Material UI is working correctly.
        </Typography>
      </Box>
    </Container>
  );
}

export default TestApp;
