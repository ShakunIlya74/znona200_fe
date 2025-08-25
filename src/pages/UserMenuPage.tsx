// src/pages/UserMenuPage.tsx
import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import QuoteOfTheDay from '../components/tools/quoteComponent';

const UserMenuPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 2 }}>
        <QuoteOfTheDay />
        {/* More content can go here */}
      </Box>
    </Container>
  );
};

export default UserMenuPage;
