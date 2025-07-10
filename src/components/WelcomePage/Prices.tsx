// src/components/WelcomePage/Prices.tsx
import React, { useState } from 'react';
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
  Paper,
  Fade,
  Zoom,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import CircleIcon from '@mui/icons-material/Circle';
import StarIcon from '@mui/icons-material/Star';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { motion, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { alpha } from '@mui/material/styles';
import ReactMarkdown from 'react-markdown';

// Custom component for discount badges
const DiscountBadge = ({ children }: { children: React.ReactNode }) => (
  <Box
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
      display: 'inline-block',
    }}
  >
    {children}
  </Box>
);

// Custom component to render description with markdown
const DescriptionRenderer = ({ description, theme }: { description: string; theme: any }) => {
  const parts = description.split('🏷️ **-10%**');
  
  return (
    <Box sx={{ textAlign: 'left' }}>
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <Typography
                  sx={{
                    fontSize: '0.7rem',
                    color: '#757877',
                    mb: 0.5,
                    lineHeight: 1.4,
                    textAlign: 'left',
                  }}
                >
                  {children}
                </Typography>
              ),
              strong: ({ children }) => (
                <Box
                  component="span"
                  sx={{
                    fontWeight: 'bold',
                    color: theme.palette.primary.main,
                    fontSize: '0.8rem',
                  }}
                >
                  {children}
                </Box>
              ),
            }}
          >
            {part}
          </ReactMarkdown>
          {/* {index < parts.length - 1 && <DiscountBadge>-10%</DiscountBadge>} */}
        </React.Fragment>
      ))}
    </Box>
  );
};

interface PricingFeature {
  text: string;
  basic: boolean;
  premium: boolean;
  isNew?: boolean;
}

interface PricingPlan {
  name: string;
  description?: string;
  highlighted?: boolean;
}

const Prices: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });  const plans: PricingPlan[] = [
    {
      name: 'Пакет «КОМПЛЕКСНИЙ»',
      highlighted: false,
      description: `🌿 **Початок навчання з 1 серпня**

**820 грн** - щомісячна оплата  
**3690 грн** - семестрова (2 семестри, знижка 10%)

🍁 **Початок навчання з 4 вересня**

**820 грн** - щомісячна оплата  
**2200 грн** - семестрова (3 семестри, знижка 10%)`
    },
    {
      name: 'Пакет «КОМПЛЕКСНИЙ + КОНТРОЛЬ»',
      highlighted: true,
      description: `🌿 **Початок навчання з 1 серпня**

**1150 грн** - щомісячна оплата  
**5170 грн** - семестрова (2 семестри, знижка 10%)

🍁 **Початок навчання з 4 вересня**

**1150 грн** - щомісячна оплата  
**3100 грн** - семестрова (3 семестри, знижка 10%)`
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

  const handlePrevPlan = () => {
    setCurrentPlanIndex((prev) => (prev === 0 ? plans.length - 1 : prev - 1));
  };

  const handleNextPlan = () => {
    setCurrentPlanIndex((prev) => (prev === plans.length - 1 ? 0 : prev + 1));
  };

  const currentPlan = plans[currentPlanIndex];
  const isBasicPlan = currentPlan.name.includes('КОМПЛЕКСНИЙ') && !currentPlan.name.includes('КОНТРОЛЬ');

  const renderMobileTable = () => (
      <Card
        sx={{
        borderRadius: 4,
        boxShadow: `0 20px 60px rgba(0,0,0,0.15), 0 10px 30px ${alpha(theme.palette.primary.main, 0.1)}`,
        overflow: 'visible',
        background: 'white',
      }}
    >
      {/* Plan Navigation Header */}
      <Box
        sx={{
          background: currentPlan.highlighted
        ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`
        : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.primary.main, 0.01)} 100%)`,
          py: 2,
          px: 2,
          borderBottom: `3px solid ${alpha(theme.palette.primary.main, 0.9)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: '50px',
          zIndex: 10,
          borderRadius: '16px 16px 0 0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <IconButton
          onClick={handlePrevPlan}
          sx={{
        color: theme.palette.primary.main,
        '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1) },
          }}
        >
          <ArrowBackIosIcon />
        </IconButton>

        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 'bold',
          fontSize: '1rem',
          mb: 1,
          color: '#063231',
        }}
          >
        {currentPlan.name}
          </Typography>
          {currentPlan.description && (
        <Box sx={{ mb: 1 }}>
          <DescriptionRenderer description={currentPlan.description} theme={theme} />
        </Box>
          )}

          <Typography
        variant="caption"
        sx={{
          display: 'block',
          opacity: 0.7,
          fontSize: '0.7rem',
          color: '#757877',
        }}
          >
        Ціни актуальні до 11 липня
          </Typography>

          <Typography
        variant="caption"
        sx={{
          display: 'block',
          mt: 1,
          fontSize: '0.75rem',
          color: theme.palette.primary.main,
          fontWeight: 'bold',
        }}
          >
        {currentPlanIndex + 1} з {plans.length}
          </Typography>
        </Box>

        <IconButton
          onClick={handleNextPlan}
          sx={{
        color: theme.palette.primary.main,
        '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1) },
          }}
        >
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>

      {/* Features Table */}
      <TableContainer component={Paper} elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  background: 'linear-gradient(135deg, #f8f8f8 0%, #f0f0f0 100%)',
                  fontWeight: 'bold',
                  color: '#063231',
                  borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.8)}`,
                  py: 1.5,
                  fontSize: '0.9rem',
                }}
              >
                Особливості
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  background: 'linear-gradient(135deg, #f8f8f8 0%, #f0f0f0 100%)',
                  fontWeight: 'bold',
                  color: '#063231',
                  borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.8)}`,
                  py: 1.5,
                  fontSize: '0.9rem',
                }}
              >
                Включено
              </TableCell>
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
                    backgroundColor: alpha(theme.palette.primary.main, 0.02),
                  },
                  '&:hover .feature-text': {
                    color: theme.palette.primary.main,
                  }
                }}
              >
                <TableCell
                  scope="row"
                  sx={{
                    fontSize: '0.8rem',
                    py: 1,
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CircleIcon
                      sx={{
                        fontSize: 6,
                        color: theme.palette.primary.main,
                        flexShrink: 0,
                        filter: `drop-shadow(0 0 2px ${alpha(theme.palette.primary.main, 0.5)})`,
                      }}
                    />
                    <Typography
                      className="feature-text"
                      sx={{
                        fontSize: '0.8rem',
                        lineHeight: 1.4,
                        transition: 'color 0.3s ease',
                        fontWeight: feature.isNew ? 500 : 400,
                      }}
                    >
                      {feature.text}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    borderBottom: '1px solid #f0f0f0',
                    py: 1,
                  }}
                >
                  <Fade in={inView} timeout={1200 + index * 50}>
                    <Box>
                      {(isBasicPlan ? feature.basic : feature.premium) ? (
                        <CheckIcon
                          sx={{
                            color: theme.palette.primary.main,
                            filter: `drop-shadow(0 0 4px ${alpha(theme.palette.primary.main, 0.4)})`,
                          }}
                        />
                      ) : (
                        <CloseIcon
                          sx={{
                            color: '#e0e0e0',
                            fontSize: 18,
                          }}
                        />
                      )}
                    </Box>
                  </Fade>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={2} sx={{ border: 'none', py: 1.5 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="contained"
                      onClick={() => window.open('https://t.me/yaryna_yaromii', '_self')}
                      sx={{
                        backgroundColor: theme.palette.primary.main,
                        color: 'white',
                        px: 4,
                        py: 1,
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.85),
                        },
                      }}
                    >
                      Навчатись
                    </Button>
                  </motion.div>
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );

  const renderDesktopTable = () => (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: `0 20px 60px rgba(0,0,0,0.15), 0 10px 30px ${alpha(theme.palette.primary.main, 0.02)}`,
        overflow: 'hidden',
        background: 'white',
      }}
    >
      <TableContainer component={Paper} elevation={0}>
        <Table sx={{ minWidth: 650 }} size="small">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  background: 'linear-gradient(135deg, #f8f8f8 0%, #f0f0f0 100%)',
                  fontWeight: 'bold',
                  color: '#063231',
                  borderBottom: `3px solid ${alpha(theme.palette.primary.main, 0.9)}`,
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
                      ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`
                      : 'linear-gradient(135deg, #f8f8f8 0%, #f0f0f0 100%)',
                    color: '#063231',
                    borderBottom: `3px solid ${alpha(theme.palette.primary.main, 0.9)}`,
                    borderRight: index < plans.length - 1 ? '1px solid #e0e0e0' : 'none',
                    position: 'relative',
                    minWidth: 180,
                    py: 2,
                    px: 2,
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        mb: 1,
                        color: '#063231',
                      }}
                    >
                      {plan.name}
                    </Typography>                    {plan.description && (
                      <Box sx={{ mb: 1 }}>
                        <DescriptionRenderer description={plan.description} theme={theme} />
                      </Box>
                    )}



                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        opacity: 0.7,
                        fontSize: '0.65rem',
                        mt: 0.5,
                        color: '#757877',
                      }}
                    >
                      Ціни актуальні до 11 липня
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
                    backgroundColor: alpha(theme.palette.primary.main, 0.02),
                  },
                  '&:hover .feature-text': {
                    color: theme.palette.primary.main,
                  }
                }}
              >
                <TableCell
                  scope="row"
                  sx={{
                    fontSize: '0.8rem',
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
                        color: alpha(theme.palette.primary.main, 0.7),
                        flexShrink: 0,
                        filter: `drop-shadow(0 0 2px ${alpha(theme.palette.primary.main, 0.2)})`,
                      }}
                      />
                      <motion.div variants={textHoverVariants}>
                      <Typography
                        className="feature-text"
                        sx={{
                        fontSize: '0.8rem',
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
                {plans.map((plan, planIndex) => {
                  const isBasicPlan = plan.name.includes('КОМПЛЕКСНИЙ') && !plan.name.includes('КОНТРОЛЬ');
                  const hasFeature = isBasicPlan ? feature.basic : feature.premium;

                  return (
                    <TableCell
                      key={planIndex}
                      align="center"
                      sx={{
                        borderBottom: '1px solid #f0f0f0',
                        borderRight: planIndex < plans.length - 1 ? '1px solid #f0f0f0' : 'none',
                        py: 0.75,
                        backgroundColor: plan.highlighted ? alpha(theme.palette.primary.main, 0.02) : 'transparent',
                      }}
                    >
                      <Fade in={inView} timeout={1200 + index * 50}>
                        <Box>
                          {hasFeature ? (
                            <CheckIcon
                              sx={{
                                color: theme.palette.primary.main,
                                filter: `drop-shadow(0 0 4px ${alpha(theme.palette.primary.main, 0.4)})`,
                              }}
                            />
                          ) : (
                            <CloseIcon
                              sx={{
                                color: '#e0e0e0',
                                fontSize: 18,
                              }}
                            />
                          )}
                        </Box>
                      </Fade>
                    </TableCell>
                  );
                })}
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
                    borderRight: index < plans.length - 1 ? '1px solid #f0f0f0' : 'none',
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
                        backgroundColor: theme.palette.primary.main,
                        color: 'white',
                        px: 3,
                        py: 0.75,
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.85),
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
  );

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
          {isMobile ? renderMobileTable() : renderDesktopTable()}
        </motion.div>
      </Box>
    </Box>
  );
};

export default Prices;