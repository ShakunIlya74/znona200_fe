// src/components/WelcomePage/Reviews.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Button,
  Avatar,
  Rating,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
 
import ava1 from '../../source/reviews/img1.jpg';
import ava2 from '../../source/reviews/img2.jpg';
import ava3 from '../../source/reviews/img3.jpg';
import ava4 from '../../source/reviews/img4.jpg';
import ava5 from '../../source/reviews/img5.jpg';

import rev1 from '../../source/reviews/rev1.png';
import rev2 from '../../source/reviews/rev2.png';
import rev3 from '../../source/reviews/rev3.png';
import rev4 from '../../source/reviews/rev4.png';
import rev5 from '../../source/reviews/rev5.png';

interface Review {
  id: number;
  name?: string;
  avatar: string;
  rating?: number;
  text?: string;
  course?: string;
  screenshotUrl: string;
  position?: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
    transform?: string;
    zIndex?: number;
  };
}

const Reviews: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [currentIndex, setCurrentIndex] = useState(0);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const reviews: Review[] = [
    {
      id: 1,
      avatar: ava1,
      screenshotUrl: rev1,
      position: {
        top: '6%',
        left: '9%',
        zIndex: 2,
      }
    },
    {
      id: 2,
      avatar: ava2,
      screenshotUrl: rev2,
      position: {
        bottom: '15%',
        left: '5%',
        zIndex: 1,
      }
    },
    {
      id: 3,
      avatar: ava3,
      screenshotUrl: rev3,
      position: {
        top: '2%',
        left: '37%',
        zIndex: 2,
      }
    },
    {
      id: 4,
      name: 'Юлія Перебийніс',
      avatar: ava4,
      screenshotUrl: rev4,
      position: {
        bottom: '25%',
        right: '10%',
        zIndex: 1,
      }
    },
    {
      id: 5,
      avatar: ava5,
      screenshotUrl: rev5,
      position: {
        top: '38%',
        right: '40%',
        zIndex: 3,
      }
    }
  ];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  // Desktop Dashboard Layout
  const DesktopDashboard = () => (
    <Box
      sx={{
        position: 'relative',
        height: '80vh',
        maxHeight: '800px',
        minHeight: '600px',
        mx: 'auto',
        maxWidth: '1200px',
        overflow: 'hidden',
      }}
    >
      {reviews.map((review) => (
        <motion.div
          key={review.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: review.id * 0.1 }}
          style={{
            position: 'absolute',
            ...review.position,
          }}
        >
          <Box sx={{ position: 'relative' }}>
            {/* Chat Screenshot */}
            <Box
              component="img"
              src={review.screenshotUrl}
              alt={`${review.name} review`}
              sx={{
                width: { xs: '250px', lg: '300px' },
                height: 'auto',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                border: '2px solid rgba(255,255,255,0.8)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  zIndex: 10,
                },
              }}
            />
            
            {/* Author Avatar - positioned in corner */}
            <Avatar
              src={review.avatar}
              alt={review.name}
              sx={{
                width: 130,
                height: 130,
                position: 'absolute',
                bottom: -15,
                right: -15,
                border: '3px solid white',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              }}
            />
            
            {/* Rating Badge */}
            {/* <Box
              sx={{
                position: 'absolute',
                top: -10,
                left: -10,
                backgroundColor: '#006A68',
                color: 'white',
                borderRadius: '50%',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 'bold',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              }}
            >
              {review.rating}
            </Box> */}
          </Box>
        </motion.div>
      ))}
      
      {/* Central Logo or Main Element */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 0,
        }}
      >
        {/* <Typography
          variant="h2"
          sx={{
            color: 'rgba(6, 50, 49, 0.1)',
            fontWeight: 'bold',
            fontSize: { xs: '4rem', lg: '6rem' },
            userSelect: 'none',
          }}
        >
          ВІДГУКИ
        </Typography> */}
      </Box>
    </Box>
  );
  // Mobile Carousel Layout
  const MobileCarousel = () => (
    <Box
      sx={{
        position: 'relative',
        maxWidth: 400,
        minHeight: '500px',
        mx: 'auto',
        px: 4,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <IconButton
        onClick={handlePrev}
        sx={{
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 2,
          backgroundColor: 'rgba(255,255,255,0.9)',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,1)',
          },
        }}
      >
        <ArrowBackIosIcon />
      </IconButton>

      <AnimatePresence mode="wait">        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
          style={{ width: '100%' }}
        >
          <Box sx={{ position: 'relative' }}>
            {/* Chat Screenshot */}
            <Box
              component="img"
              src={reviews[currentIndex].screenshotUrl}
              alt={`${reviews[currentIndex].name} review`}
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                border: '2px solid rgba(255,255,255,0.8)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            />
            
            {/* Author Avatar - positioned in corner */}
            <Avatar
              src={reviews[currentIndex].avatar}
              alt={reviews[currentIndex].name}
              sx={{
                width: 80,
                height: 80,
                position: 'absolute',
                bottom: -10,
                right: -10,
                border: '3px solid white',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              }}
            />
          </Box>
        </motion.div>
      </AnimatePresence>      <IconButton
        onClick={handleNext}
        sx={{
          position: 'absolute',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 2,
          backgroundColor: 'rgba(255,255,255,0.9)',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,1)',
          },
        }}
      >
        <ArrowForwardIosIcon />
      </IconButton>

      {/* Pagination Dots */}
      <Box 
        sx={{ 
          position: 'absolute',
          bottom: -40,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        {reviews.map((_, index) => (
          <Box
            key={index}
            onClick={() => setCurrentIndex(index)}
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: index === currentIndex ? '#006A68' : 'rgba(0,106,104,0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </Box>
    </Box>
  );

  return (
    <Box
      id="reviews"
      ref={ref}
      sx={{
        py: 8,
        px: { xs: 2, md: 4 },
        backgroundColor: '#f2f1f2',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Box sx={{ maxWidth: 1400, mx: 'auto', width: '100%' }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 'bold',
            mb: 6,
            textAlign: 'center',
            color: '#063231',
          }}
        >
          Відгуки
        </Typography>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1 }}
        >
          {isMobile ? <MobileCarousel /> : <DesktopDashboard />}

          {/* <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: '#006A68',
                color: '#006A68',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                '&:hover': {
                  borderColor: '#004D40',
                  backgroundColor: 'rgba(0, 106, 104, 0.04)',
                },
              }}
            >
              Переглянути всі відгуки
            </Button>
          </Box> */}
        </motion.div>
      </Box>
    </Box>
  );
};

export default Reviews;