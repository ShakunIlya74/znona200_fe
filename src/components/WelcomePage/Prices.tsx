// src/components/WelcomePage/Prices.tsx
import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  name: string;
  monthlyPrice: string;
  halfYearPrice: string;
  yearlyPrice: string;
  features: PricingFeature[];
  highlighted?: boolean;
}

const Prices: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const pricingPlans: PricingPlan[] = [
    {
      name: 'КУРС «КОМПЛЕКСНИЙ»',
      monthlyPrice: '750 грн',
      halfYearPrice: '2700 грн',
      yearlyPrice: '4800 грн',
      features: [
        { text: 'Три уроки на тиждень в режимі реального часу', included: true },
        { text: 'Запис уроків', included: true },
        { text: 'Відповіді/допомога репетиторів', included: true },
        { text: 'Друкований конспект', included: true },
        { text: 'Електронний робочий зошит щомісяця', included: true },
        { text: 'Особистий кабінет на сайті', included: true },
        { text: 'Три етапи домашніх завдань', included: true },
        { text: 'Модульна та інтегрована системи навчання', included: true },
        { text: 'Відслідковування прогресу', included: true },
        { text: '50 симуляцій', included: true },
        { text: '«Суперфінал»: курс повторення', included: true },
        { text: 'Урок визначення рівня знань (індивідуальний)', included: false },
        { text: 'Перевірка письмового дз щомісяця', included: false },
        { text: '1 урок контролю з репетитором щомісяця', included: false },
      ],
    },
    {
      name: 'КОМПЛЕКСНИЙ + КОНТРОЛЬ',
      monthlyPrice: '1150 грн',
      halfYearPrice: '4100 грн',
      yearlyPrice: '7350 грн',
      highlighted: true,
      features: [
        { text: 'Три уроки на тиждень в режимі реального часу', included: true },
        { text: 'Запис уроків', included: true },
        { text: 'Відповіді/допомога репетиторів', included: true },
        { text: 'Друкований конспект', included: true },
        { text: 'Електронний робочий зошит щомісяця', included: true },
        { text: 'Особистий кабінет на сайті', included: true },
        { text: 'Три етапи домашніх завдань', included: true },
        { text: 'Модульна та інтегрована системи навчання', included: true },
        { text: 'Відслідковування прогресу', included: true },
        { text: '50 симуляцій', included: true },
        { text: '«Суперфінал»: курс повторення', included: true },
        { text: 'Урок визначення рівня знань (індивідуальний)', included: true },
        { text: 'Перевірка письмового дз щомісяця', included: true },
        { text: '1 урок контролю з репетитором щомісяця', included: true },
      ],
    },
  ];

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
      },
    },
  };
  return (
    <Box
      id="price"
      ref={ref}
      sx={{
        py: 4,
        px: { xs: 2, md: 4 },
        backgroundColor: '#fff',
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 'bold',
            mb: 3,
            textAlign: 'center',
            color: '#063231',
          }}
        >
          Ціни
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {pricingPlans.map((plan, index) => (
            <Grid item xs={12} md={6} key={index}>
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
                transition={{ delay: index * 0.2 }}
              >                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    borderRadius: 3,
                    border: plan.highlighted ? '2px solid #006A68' : '1px solid #e0e0e0',
                    overflow: 'visible',
                    boxShadow: plan.highlighted 
                      ? '0 12px 40px rgba(100, 100, 100, 0.25), 0 8px 16px rgba(0, 0, 0, 0.1)' 
                      : '0 2px 8px rgba(0, 0, 0, 0.08)',
                    transform: plan.highlighted ? 'translateY(-4px)' : 'none',
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  {/* {plan.highlighted && (
                    <Chip
                      label="РЕКОМЕНДОВАНО"
                      sx={{
                        position: 'absolute',
                        top: -15,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: '#006A68',
                        color: 'white',
                        fontWeight: 'bold',
                      }}
                    />                  )} */}
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 'bold',
                        mb: 0.5,
                        textAlign: 'center',
                        color: '#063231',
                        fontSize: '1.1rem',
                      }}
                    >
                      {plan.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 2,
                        textAlign: 'center',
                        color: '#757877',
                        fontSize: '0.8rem',
                      }}
                    >
                      Ціни актуальні до 15 вересня
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.85rem' }}>
                        <strong>{plan.monthlyPrice}</strong> - помісячна оплата (8 місяців)
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.85rem' }}>
                        <strong>{plan.halfYearPrice}</strong> - оплата 50/50 (8 місяців, знижка 10%)
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.85rem' }}>
                        <strong>{plan.yearlyPrice}</strong> - оплата за рік (8 місяців, знижка 20%)
                      </Typography>
                    </Box>

                    <Typography
                      variant="subtitle2"
                      sx={{
                        mb: 1,
                        fontWeight: 'bold',
                        color: '#063231',
                        fontSize: '0.9rem',
                      }}
                    >
                      ОСОБЛИВОСТІ
                    </Typography>

                    <List dense sx={{ mb: 2,  }}>                      {plan.features.map((feature, idx) => (
                        <ListItem key={idx} sx={{ px: 0, py: 0.2 }}>
                          <ListItemIcon sx={{ minWidth: 24 }}>
                            {feature.included ? (
                              <CheckIcon
                                sx={{
                                  color: '#4caf50',
                                  fontSize: 16,
                                }}
                              />
                            ) : (
                              <CloseIcon
                                sx={{
                                  color: '#e0e0e0',
                                  fontSize: 16,
                                }}
                              />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={feature.text}
                            sx={{
                              '& .MuiListItemText-primary': {
                                fontSize: '0.8rem',
                                color: feature.included ? '#063231' : '#9e9e9e',
                                lineHeight: 1.2,
                              },
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => window.open('https://t.me/yaryna_yaromii', '_self')}
                      sx={{
                        backgroundColor: '#006A68',
                        color: 'white',
                        py: 1,
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        '&:hover': {
                          backgroundColor: '#004D40',
                        },
                      }}
                    >
                      Навчатись
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Prices;