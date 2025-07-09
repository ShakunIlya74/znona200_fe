// src/components/WelcomePage/Prices.tsx
import React from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  useTheme,
  useMediaQuery,
  Paper,
  Fade,
  Zoom,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import CircleIcon from '@mui/icons-material/Circle';
import StarIcon from '@mui/icons-material/Star';
import { motion, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface PricingFeature {
  text: string;
  basic: boolean;
  premium: boolean;
  isNew?: boolean;
}

interface PricingPlan {
  name: string;
  monthlyPrice: string;
  halfYearPrice: string;
  yearlyPrice: string;
  highlighted?: boolean;
}

const Prices: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const plans: PricingPlan[] = [
    {
      name: 'КУРС «КОМПЛЕКСНИЙ»',
      monthlyPrice: '750 грн',
      halfYearPrice: '2700 грн',
      yearlyPrice: '4800 грн',
    },
    {
      name: 'КОМПЛЕКСНИЙ + КОНТРОЛЬ',
      monthlyPrice: '1150 грн',
      halfYearPrice: '4100 грн',
      yearlyPrice: '7350 грн',
      highlighted: true,
    },
  ];

  const features: PricingFeature[] = [
    { text: 'Три уроки на тиждень в режимі реального часу', basic: true, premium: true },
    { text: 'Запис уроків', basic: true, premium: true },
    { text: 'Відповіді/допомога репетиторів', basic: true, premium: true },
    { text: 'Друкований конспект', basic: true, premium: true },
    { text: 'Електронний робочий зошит щомісяця', basic: true, premium: true },
    { text: 'Особистий кабінет на сайті', basic: true, premium: true },
    { text: 'Три етапи домашніх завдань', basic: true, premium: true },
    { text: 'Модульна та інтегрована системи навчання', basic: true, premium: true },
    { text: 'Відслідковування прогресу', basic: true, premium: true },
    { text: '50 симуляцій', basic: true, premium: true },
    { text: '«Суперфінал»: курс повторення', basic: true, premium: true },
    { text: 'Урок визначення рівня знань (індивідуальний)', basic: false, premium: true, isNew: true },
    { text: 'Перевірка письмового дз щомісяця', basic: false, premium: true, isNew: true },
    { text: '1 урок контролю з репетитором щомісяця', basic: false, premium: true, isNew: true },
  ];

  const tableVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 30 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const rowVariants: Variants = {
    hidden: { 
      opacity: 0, 
      x: -30 
    },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.08,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  const textHoverVariants: Variants = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  return (
    <Box
      id="price"
      ref={ref}
      sx={{
        py: 3,
        px: { xs: 2, md: 4 },
        background: 'linear-gradient(135deg, #f5f5f5 0%, #e8f5f3 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Box sx={{ maxWidth: 1100, mx: 'auto', width: '100%' }}>
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
          transition={{ duration: 0.8 }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              mb: 3,
              textAlign: 'center',
              color: '#063231',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            Ціни
          </Typography>
        </motion.div>

        <motion.div
          variants={tableVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 10px 30px rgba(0,106,104,0.1)',
              overflow: 'hidden',
              background: 'white',
            }}
          >
            <TableContainer component={Paper} elevation={0}>
              <Table sx={{ minWidth: isMobile ? 350 : 650 }} size="small">
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        background: 'linear-gradient(135deg, #f8f8f8 0%, #f0f0f0 100%)',
                        fontWeight: 'bold',
                        color: '#063231',
                        borderBottom: '3px solid #006A68',
                        borderRight: '1px solid #e0e0e0',
                        py: 1.5,
                        fontSize: '0.9rem',
                      }}
                    >
                      Особливості
                    </TableCell>
                    {plans.map((plan, index) => (
                      <TableCell
                        key={index}
                        align="center"
                        sx={{
                          background: plan.highlighted 
                            ? 'linear-gradient(135deg, #e8f5f3 0%, #d4ebe8 100%)' 
                            : 'linear-gradient(135deg, #f8f8f8 0%, #f0f0f0 100%)',
                          color: '#063231',
                          borderBottom: '3px solid #006A68',
                          borderRight: index === 0 ? '1px solid #e0e0e0' : 'none',
                          position: 'relative',
                          minWidth: { xs: 150, md: 200 },
                          py: 2,
                          px: { xs: 1, md: 2 },
                        }}
                      >
                        <Box>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 'bold',
                              fontSize: { xs: '0.85rem', md: '1rem' },
                              mb: 1,
                              color: '#063231',
                            }}
                          >
                            {plan.name}
                          </Typography>
                          
                          <Box sx={{ mb: 0.5 }}>
                            <Typography
                              sx={{
                                fontSize: { xs: '0.7rem', md: '0.75rem' },
                                color: '#757877',
                                mb: 0.5,
                              }}
                            >
                              <Box component="span" sx={{ 
                                fontWeight: 'bold', 
                                color: '#006A68', 
                                fontSize: { xs: '0.85rem', md: '0.9rem' },
                                filter: plan.highlighted ? 'drop-shadow(0 0 3px rgba(0,106,104,0.5))' : 'none',
                              }}>
                                {plan.monthlyPrice}
                              </Box>
                              {' '}- помісячна оплата
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: { xs: '0.7rem', md: '0.75rem' },
                                color: '#757877',
                                mb: 0.5,
                              }}
                            >
                              <Box component="span" sx={{ 
                                fontWeight: 'bold', 
                                color: '#006A68', 
                                fontSize: { xs: '0.85rem', md: '0.9rem' },
                                filter: plan.highlighted ? 'drop-shadow(0 0 3px rgba(0,106,104,0.5))' : 'none',
                              }}>
                                {plan.halfYearPrice}
                              </Box>
                              {' '}- оплата 50/50  <Box
                                    component="span"
                                    sx={{
                                      ml: 1,
                                      px: 0.8,
                                      py: 0.2,
                                      backgroundColor: '#FFB800',
                                      color: '#063231',
                                      borderRadius: 1,
                                      fontSize: '0.6rem',
                                      fontWeight: 'bold',
                                      verticalAlign: 'middle',
                                    }}
                                  > - 10% </Box>
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: { xs: '0.7rem', md: '0.75rem' },
                                color: '#757877',
                              }}
                            >
                              <Box component="span" sx={{ 
                                fontWeight: 'bold', 
                                color: '#006A68', 
                                fontSize: { xs: '0.85rem', md: '0.9rem' },
                                filter: plan.highlighted ? 'drop-shadow(0 0 3px rgba(0,106,104,0.5))' : 'none',
                              }}>
                                {plan.yearlyPrice}
                              </Box>
                              {' '}- оплата за рік <Box
                                    component="span"
                                    sx={{
                                      ml: 1,
                                      px: 0.8,
                                      py: 0.2,
                                      backgroundColor: '#FFB800',
                                      color: '#063231',
                                      borderRadius: 1,
                                      fontSize: '0.6rem',
                                      fontWeight: 'bold',
                                      verticalAlign: 'middle',
                                    }}
                                  >
                                    - 20%
                                  </Box>
                            </Typography>
                          </Box>
                          
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              opacity: 0.7,
                              fontSize: { xs: '0.65rem', md: '0.7rem' },
                              mt: 0.5,
                              color: '#757877',
                            }}
                          >
                            Ціни актуальні до 15 вересня
                          </Typography>
                        </Box>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {features.map((feature, index) => (
                    <TableRow
                      key={index}
                      component={motion.tr}
                      custom={index}
                      variants={rowVariants}
                      initial="hidden"
                      animate={inView ? 'visible' : 'hidden'}
                      sx={{
                        cursor: 'default',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 106, 104, 0.02)',
                        },
                        '&:hover .feature-text': {
                          color: '#006A68',
                        }
                      }}
                    >
                      <TableCell
                        scope="row"
                        sx={{
                          fontSize: { xs: '0.75rem', md: '0.8rem' },
                          py: 0.75,
                          borderBottom: '1px solid #f0f0f0',
                          borderRight: '1px solid #f0f0f0',
                        }}
                      >
                        <motion.div
                          initial="rest"
                          whileHover="hover"
                          animate="rest"
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <CircleIcon 
                              sx={{ 
                                fontSize: 6, 
                                color: '#006A68',
                                flexShrink: 0,
                                filter: 'drop-shadow(0 0 2px rgba(0,106,104,0.4))',
                              }} 
                            />
                            <motion.div variants={textHoverVariants}>
                              <Typography
                                className="feature-text"
                                sx={{
                                  fontSize: { xs: '0.75rem', md: '0.8rem' },
                                  lineHeight: 1.4,
                                  transition: 'color 0.3s ease',
                                  fontWeight: feature.isNew ? 500 : 400,
                                }}
                              >
                                {feature.text}
                              </Typography>
                            </motion.div>
                          </Box>
                        </motion.div>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          borderBottom: '1px solid #f0f0f0',
                          borderRight: '1px solid #f0f0f0',
                          py: 0.75,
                        }}
                      >
                        <Fade in={inView} timeout={1200 + index * 50}>
                          <Box>
                            {feature.basic ? (
                              <CheckIcon
                                sx={{
                                  color: '#4caf50',
                                  fontSize: { xs: 16, md: 18 },
                                  filter: 'drop-shadow(0 0 4px rgba(76,175,80,0.4))',
                                }}
                              />
                            ) : (
                              <CloseIcon
                                sx={{
                                  color: '#e0e0e0',
                                  fontSize: { xs: 16, md: 18 },
                                }}
                              />
                            )}
                          </Box>
                        </Fade>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          backgroundColor: 'rgba(0, 106, 104, 0.02)',
                          borderBottom: '1px solid #f0f0f0',
                          py: 0.75,
                        }}
                      >
                        <Fade in={inView} timeout={1200 + index * 50}>
                          <Box>
                            {feature.premium ? (
                              <CheckIcon
                                sx={{
                                  color: '#4caf50',
                                  fontSize: { xs: 16, md: 18 },
                                  filter: 'drop-shadow(0 0 4px rgba(76,175,80,0.4))',
                                }}
                              />
                            ) : (
                              <CloseIcon
                                sx={{
                                  color: '#e0e0e0',
                                  fontSize: { xs: 16, md: 18 },
                                }}
                              />
                            )}
                          </Box>
                        </Fade>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell sx={{ border: 'none', py: 1.5, borderRight: '1px solid #f0f0f0' }} />
                    {plans.map((plan, index) => (
                      <TableCell
                        key={index}
                        align="center"
                        sx={{
                          border: 'none',
                          py: 1.5,
                          borderRight: index === 0 ? '1px solid #f0f0f0' : 'none',
                          backgroundColor: plan.highlighted ? 'rgba(0, 106, 104, 0.02)' : 'transparent',
                        }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="contained"
                            onClick={() => window.open('https://t.me/yaryna_yaromii', '_self')}
                            sx={{
                              backgroundColor: '#006A68',
                              color: 'white',
                              px: { xs: 2, md: 3 },
                              py: 0.75,
                              fontSize: { xs: '0.8rem', md: '0.85rem' },
                              fontWeight: 'bold',
                              boxShadow: plan.highlighted 
                                ? '0 6px 20px rgba(0, 106, 104, 0.4)' 
                                : '0 2px 8px rgba(0, 106, 104, 0.2)',
                              filter: plan.highlighted ? 'drop-shadow(0 0 8px rgba(0,106,104,0.3))' : 'none',
                              '&:hover': {
                                backgroundColor: '#004D40',
                                boxShadow: plan.highlighted 
                                  ? '0 8px 25px rgba(0, 106, 104, 0.5)' 
                                  : '0 4px 12px rgba(0, 106, 104, 0.3)',
                              },
                            }}
                          >
                            Навчатись
                          </Button>
                        </motion.div>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </motion.div>
      </Box>
    </Box>
  );
};

export default Prices;