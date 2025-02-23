// src/pages/UserMenuPage.tsx
import React from 'react';
import { Container, Box, Typography } from '@mui/material';

const UserMenuPage: React.FC = () => {
  return (
    <Box sx={{
      display: 'flex', flexDirection: 'row',
      alignItems: 'left'
    }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', height: '100%' }}>

      
        <Box sx={{ minWidth: {md:'350px', xs: 0}, height: '100%', backgroundColor: 'white' }}>
        </Box>
        <Box sx={{ width: '100%', height: '100%', backgroundColor: '#f4f4f3', p: 5 }}>
          <Box sx={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%',
            backgroundColor: 'red'
          }}>
            <Typography variant="h4" gutterBottom>
              Default menu page, should be probably redirected to vebinars
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UserMenuPage;
