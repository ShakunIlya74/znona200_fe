// src/pages/MainPage.tsx
import React from 'react';
import { Box, Container } from '@mui/material';
import WelcomeHeader from '../components/WelcomePage/WelcomeHeader';
import MainInfo from '../components/WelcomePage/MainInfo';
// import Header from 'components/header/Header';
// import MainInfo from 'components/mainInfo/MainInfo';
// import About from 'components/about/About';
// import Team from 'components/team/Team';
// import Reviews from 'components/reviews/Reviews';
// import Prices from 'components/prices/Prices';
// import FAQ from 'components/faq/FAQ';
// import Footer from 'components/footer/Footer';
// import ComingSoon from 'components/mainInfo/components/PopUp/ComingSoon';

const WelcomePage: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      {/* Main Content */}
      <Container maxWidth="lg" sx={{ flex: 1, paddingY: { xs: 4, md: 8 }, width: '100%' }}>
      <MainInfo />
      {/* <About />
      <Team />
      <Reviews />
      <Prices />
      <FAQ /> */}
      </Container>

      {/* <Footer />
      <ComingSoon /> */}
    </Box>
  );
};

export default WelcomePage;
