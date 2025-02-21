// src/pages/UserMenuPage.tsx
import React from 'react';
import { Container, Box, Typography } from '@mui/material';

const UserMenuPage: React.FC = () => {
  return (
    <Container>
      <Box sx={{ width: '100%', height: '100%', backgroundColor: '#f4f4f3', p:5}}>
        <Box sx={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%',
          backgroundColor: 'red'
        }}>
          <Typography variant="h4" gutterBottom>
            All components are rendered here
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default UserMenuPage;
