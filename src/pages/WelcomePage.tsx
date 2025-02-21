// src/pages/MainPage.tsx
import React from 'react';
import { Box, Container } from '@mui/material';
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
    <>
      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          paddingY: { xs: 4, md: 0},
          // width: '100vw',
          // overflow: 'auto', // Adds scrollbars only if content overflows
        }}
      >
        <MainInfo />
        {/* <About /> */}
        {/* <Team />
        <Reviews />
        <Prices />
        <FAQ /> */}
      </Box>

      {/* <Footer />
      <ComingSoon /> */}
  </>
  );
  
};

export default WelcomePage;
