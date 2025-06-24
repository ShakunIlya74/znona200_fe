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

interface Review {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  course: string;
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
      name: 'Марія Іванова',
      avatar: '/placeholder-avatar-1.jpg',
      rating: 5,
      text: 'Дуже задоволена курсом! Викладачі пояснюють матеріал доступно та цікаво. Результат НМТ - 198 балів!',
      course: 'Українська мова',
    },
    {
      id: 2,
      name: 'Олександр Петренко',
      avatar: '/placeholder-avatar-2.jpg',
      rating: 5,
      text: 'Чудова підготовка! Особливо сподобалась модульна система навчання та підтримка репетиторів.',
      course: 'Математика',
    },
    {
      id: 3,
      name: 'Анна Коваленко',
      avatar: '/placeholder-avatar-3.jpg',
      rating: 5,
      text: 'Рекомендую всім! Завдяки курсу я отримала 200 балів з української мови. Дякую команді!',
      course: 'Українська мова',
    },
  ];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  return (
    <Box
      id="reviews"
      ref={ref}
      sx={{
        py: 8,
        px: { xs: 2, md: 4 },
        backgroundColor: '#f2f1f2',
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
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
          transition={{ duration: 0.6 }}
        >
          <Box
            sx={{
              position: 'relative',
              maxWidth: 800,
              mx: 'auto',
              px: { xs: 2, md: 8 },
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
              }}
            >
              <ArrowBackIosIcon />
            </IconButton>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        src={reviews[currentIndex].avatar}
                        alt={reviews[currentIndex].name}
                        sx={{ width: 60, height: 60, mr: 2 }}
                      />
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {reviews[currentIndex].name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {reviews[currentIndex].course}
                        </Typography>
                      </Box>
                    </Box>
                    <Rating value={reviews[currentIndex].rating} readOnly sx={{ mb: 2 }} />
                    <Typography variant="body1">
                      {reviews[currentIndex].text}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            <IconButton
              onClick={handleNext}
              sx={{
                position: 'absolute',
                right: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
              }}
            >
              <ArrowForwardIosIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              sx={{
                borderColor: '#006A68',
                color: '#006A68',
                '&:hover': {
                  borderColor: '#004D40',
                  backgroundColor: 'rgba(0, 106, 104, 0.04)',
                },
              }}
            >
              Переглянути всі відгуки
            </Button>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
};

export default Reviews;