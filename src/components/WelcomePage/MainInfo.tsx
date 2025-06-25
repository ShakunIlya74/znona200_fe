// src/components/MainInfo.tsx
import React from 'react';
import { Box, Typography, useMediaQuery, useTheme, IconButton } from '@mui/material';
import TelegramIcon from '@mui/icons-material/Telegram';
import InstagramIcon from '@mui/icons-material/Instagram';
import students from '../../source/mainPage/students.svg';
import divider from '../../source/mainPage/divider.svg';
import PhoneInput from './PhoneInput';

const MainInfo: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  return (    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#cce8e6',
        flexGrow: 1,        padding: { 
          xs: '20px', 
          sm: '20px 40px', 
          md: '0px 20px',
          lg: '0px 20px',
          xl: '0px 20px'
        },
        minHeight: { xs: 'auto', md: '500px' },
      }}
    >{/* Free Space */}
      <Box
        sx={{
          display: { xs: 'none', sm: 'block' },
          flex: '1 1 auto',
          maxWidth: { sm: '5%', md: '8%', lg: '10%' },
          flexGrow: { sm: 1, md: 2, lg: 3 },
        }}
      />      {/* Content Section */}
      <Box
        id='main-content-info'
        sx={{
          flex: '0 0 auto',
          width: { xs: '100%', sm: '90%', md: '600px' },
          maxWidth: { xs: '100%', sm: '500px', md: '600px' },
          textAlign: { xs: 'right', md: 'right' },
          mb: { xs: 2, md: 0 },
          padding: { 
            xs: '10px 0', 
            sm: '15px 20px', 
            md: '20px 0' 
          },
          margin: { xs: '0 auto', md: '0' },
          zIndex: 2,
        }}
      >{/* Title */}
        <Typography
          variant={isMobile ? 'h4' : isTablet ? 'h4' : 'h3'}
          sx={{
            fontFamily: "Lato",
            fontWeight: 700,
            color: '#063231',
            mb: 1.5,
            fontSize: { 
              xs: '1.5rem', 
              sm: '1.8rem', 
              md: '2.2rem', 
              lg: '2.5rem' 
            },
            lineHeight: { xs: 1.3, sm: 1.2, md: 1.1 },
            textAlign: { xs: 'left', md: 'left' },
          }}
        >
          Готуємо до ЗНО{' '}
            <Box component="span" sx={{ backgroundColor: '#FFFFFF', px: 0.5, borderRadius: 1 }}>
            10 років
            </Box>{' '}
          i знаємо про підготовку все
        </Typography>        {/* Subtitle */}
        <Typography
          variant="subtitle1"
          sx={{
            color: '#3F6563',
            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
            mb: { xs: 2, sm: 2.5, md: 3 },
            textAlign: { xs: 'left', md: 'left' },
          }}
        >
          Тобі потрібно лише стати одним із наших учнів, а ми допоможемо з усім іншим.
        </Typography>        {/* Phone Input */}
        <Box sx={{ }}>
          <PhoneInput onMobile={isMobile} />
        </Box>{/* Statistics */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            textAlign: 'center',
            gap: { xs: 0.5, sm: 1 },
            width: '100%',
            mb: { xs: 2, sm: 2.5, md: 3 },
          }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>            <Typography
              variant="h4"
              sx={{
              fontFamily: 'lato, sans-serif',
              fontStyle: 'normal',
              fontWeight: 520,
              fontSize: { xs: '24px', sm: '30px', md: '38px', lg: '45px' },
              color: '#18181B',
              display: 'flex',
              alignItems: 'center',
              }}
            >
              5000+
            </Typography>            <Typography
              variant="subtitle2"
              sx={{
              color: '#757877',
              display: 'flex',
              alignItems: 'center',
              ml: { xs: 1, sm: 1.5, md: 2 },
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
              }}
            >
              учнів
            </Typography>
            </Box>

            {/* Divider */}
            <Box sx={{ my: 0 }}>
            <Box component="img" sx={{ width: 'auto', height: '50%' }} src={divider} alt="divider" />
            </Box>

            {/* Second Stat */}
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>            <Typography
              variant="h4"
              sx={{
              fontFamily: 'lato, sans-serif',
              fontStyle: 'normal',
              fontWeight: 520,
              fontSize: { xs: '24px', sm: '30px', md: '38px', lg: '45px' },
              lineHeight: '1',
              color: '#18181B',
              display: 'flex',
              alignItems: 'center',
              }}
            >
              208
            </Typography>            <Typography
              variant="subtitle2"
              sx={{
              color: '#757877',
              ml: { xs: 1, sm: 1.5, md: 2 },
              display: 'flex',
              alignItems: 'center',
              lineHeight: '1.2',
              fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1.1rem' },
              }}
            >
              НМТ 2022-2023 <br /> двістібальників
            </Typography>
            </Box>
          <Box sx={{ my: 0 }}>
            {/* free space */}
            </Box>
        </Box>        {/* Contact Icons and Mobile Image */}
        <Box 
          sx={{ 
            mt: { xs: 2, sm: 2.5, md: 3 }, 
            display: 'flex', 
            justifyContent: { xs: 'space-between', md: 'flex-start' }, 
            alignItems: 'center',
            gap: { xs: 0, md: 1 },
            width: '100%',
          }}
        >
          {/* Contact Icons */}
            <Box sx={{ 
              ml: { xs: 5, md: 6 },
              display: 'flex', 
              gap: 1,
              justifyContent: { xs: 'center', md: 'flex-start' },
              transform: { xs: 'translateX(-20px)', md: 'none' }
            }}>
              <IconButton
                color="primary"
                onClick={() => window.open('https://t.me/znooonaa200', '_blank')}
                aria-label="Telegram"
                sx={{ 
                  fontSize: { xs: '2rem', sm: '1.5rem', md: '2rem' },
                  padding: { xs: '8px', sm: '6px', md: '8px' }
                }}
              >
                <TelegramIcon fontSize="inherit" />
              </IconButton>
              <IconButton
                color="primary"
                onClick={() => window.open('https://www.instagram.com/znoona200/', '_blank')}
                aria-label="Instagram"
                sx={{ 
                  fontSize: { xs: '2rem', sm: '1.5rem', md: '2rem' },
                  padding: { xs: '8px', sm: '6px', md: '8px' }
                }}
              >
                <InstagramIcon fontSize="inherit" />
              </IconButton>
            </Box>
            {/* Mobile Image */}
          <Box
            sx={{
              display: { xs: 'block', md: 'none' },
              width: { xs: '220px', sm: '260px' },
              height: 'auto',
              opacity: 0.8,
            }}
          >
            <Box
              component="img"
              sx={{
                width: '100%',
                height: 'auto',
                maxWidth: '100%',
              }}
              src={students}
              alt="students"
            />
          </Box>
        </Box>
      </Box>      {/* Desktop Image Section */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: '1 1 auto',
          maxWidth: '50%',
          minWidth: '30%',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          mb: { xs: 4, md: 0 },
          mr: { xs: 0, md: 4 },
          flexGrow: 1,
        }}
      >
        <Box
          component="img"
          sx={{
            width: '100%',
            height: 'auto',
            maxWidth: '100%',
            mr: { xs: 0, md: 4 },
          }}
          src={students}
          alt="students"
        />
      </Box>
    </Box>
  );
};

export default MainInfo;
