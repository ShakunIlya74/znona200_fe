// src/pages/WelcomePage.tsx
import React from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/menu');
  };

  return (
    <Container>
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h3" gutterBottom>
          Welcome to ZnoNa200
        </Typography>
        <Typography variant="h6" gutterBottom>
          Explore the app and sign in to access more features!
        </Typography>
        <Button variant="contained" color="primary" onClick={handleGetStarted} sx={{ mt: 4 }}>
          Get Started
        </Button>
      </Box>
    </Container>
  );
};

export default WelcomePage;
