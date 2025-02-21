// src/pages/UserMenuPage.tsx
import React from 'react';
import { Container, Box, Typography } from '@mui/material';

const UserMenuPage: React.FC = () => {
  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          All components are rendered here
        </Typography>
      </Box>
    </Container>
  );
};

export default UserMenuPage;
