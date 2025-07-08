// src/pages/MainPage.tsx
import React from 'react';
import { Box } from '@mui/material';
import MainInfo from '../components/WelcomePage/MainInfo';
import About from '../components/WelcomePage/About';
import Team from '../components/WelcomePage/Team';
import Reviews from '../components/WelcomePage/Reviews';
import Prices from '../components/WelcomePage/Prices';
import FAQ from '../components/WelcomePage/FAQ';
import Footer from '../components/WelcomePage/Footer';

const WelcomePage: React.FC = () => {
  return (
    <>
      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          paddingY: { xs: 4, md: 0 },
        }}
      >
        <MainInfo />
        <About />
        <Team />
        <Reviews />
        <Prices />
        <FAQ />
      </Box>

      <Footer />
    </>
  );
};

export default WelcomePage;