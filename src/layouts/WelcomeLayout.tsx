// src/layouts/WelcomeLayout.tsx
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';

const WelcomeLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleAuthAction = () => {
    // Assuming you have authentication logic here
    // For now, it navigates to the login page
    navigate('/login');
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ZnoNa200
          </Typography>
          <Button color="inherit" onClick={handleAuthAction}>
            Login
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ mt: 2 }}>
        <Outlet />
      </Box>
    </>
  );
};

export default WelcomeLayout;
