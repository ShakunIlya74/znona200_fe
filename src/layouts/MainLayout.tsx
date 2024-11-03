// src/layouts/MainLayout.tsx
import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

const MainLayout: React.FC = () => {
  return (
    <>
      {/* You can add other common components here if needed */}
      <Box sx={{ mt: 2 }}>
        <Outlet />
      </Box>
    </>
  );
};

export default MainLayout;
