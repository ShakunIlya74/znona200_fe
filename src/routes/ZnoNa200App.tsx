// src/routes/ZnoNa200App.tsx
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';

// Mock authentication status (replace with real auth logic)
const isAuthenticated = false; // Set to `true` for logged-in state

const ZnoNa200App: React.FC = () => {
  const navigate = useNavigate();

  const handleAuthAction = () => {
    if (isAuthenticated) {
      // Handle logout logic here
      console.log('Logging out...');
      // After logout, navigate to welcome page
      navigate('/');
    } else {
      // Navigate to login page
      navigate('/login');
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ZnoNa200
          </Typography>
          <Button color="inherit" onClick={handleAuthAction}>
            {isAuthenticated ? 'Logout' : 'Login'}
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ mt: 2 }}>
        <Outlet />
      </Box>
    </>
  );
};

export default ZnoNa200App;
