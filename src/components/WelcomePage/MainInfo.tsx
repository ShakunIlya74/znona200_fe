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

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column-reverse', md: 'row' },
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#cce8e6',
        width: '100%',
        flexGrow: 1,
        padding: { xs: '20px', md: '40px' }, // Optional: Add some padding if needed
      }}
    >
      {/* Content Section */}
      <Box
        id='main-content-info'
        sx={{
          flex: 1,
          width: { xs: '100%', md: '25%' },
          textAlign: { xs: 'center', md: 'left' },
          mb: { xs: 4, md: 0 },
          padding: { xs: '10px 0', md: '20px 0' },
          margin: { xs: '0 auto', md: '0 20px 0 40px' },
          // Shift slightly to the right on medium and larger screens
          position: 'relative',
          left: { xs: 0, md: '5%' },
        }}
      >
        {/* Title */}
        <Typography
          variant={isMobile ? 'h5' : 'h3'}
          sx={{
            fontWeight: 700,
            color: '#063231',
            mb: 1.5, // Reduced margin bottom
          }}
        >
          Готуємо до ЗНО <Box component="span" sx={{ backgroundColor: '#FFFFFF', px: 0.5 }}>10 років</Box> i знаємо про підготовку все
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="subtitle1"
          sx={{
            color: '#3F6563',
            mb: 3, // Reduced margin bottom
          }}
        >
          Тобі потрібно лише стати одним із наших учнів, а ми допоможемо з усім іншим.
        </Typography>

        {/* Phone Input */}
        <Box sx={{ mb: 3 }}>
          <PhoneInput />
        </Box>

        {/* Statistics */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: { xs: 'center', md: 'flex-start' },
            textAlign: 'center',
            mb: 1.5, // Reduced margin bottom
            gap: 1.5, // Reduced gap
            width: '100%',
          }}
        >
          {/* First Stat */}
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Typography
              variant="h4"
              sx={{
                fontFamily: 'lato, sans-serif',
                fontStyle: 'normal',
                fontWeight: 700,
                fontSize: { xs: '30px', md: '45px' }, // Responsive font size
                color: '#18181B',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              5000+
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{
                color: '#757877',
                display: 'flex',
                alignItems: 'center',
                ml: 0.5,
              }}
            >
              учнів
            </Typography>
          </Box>

          {/* Divider */}
          <Box sx={{ my: 0 }}>
            <Box component="img" sx={{ width: 'auto', height: '50%'}} src={divider} alt="divider" />
          </Box>

          {/* Second Stat */}
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Typography
              variant="h4"
              sx={{
                fontFamily: 'lato, sans-serif',
                fontStyle: 'normal',
                fontWeight: 700,
                fontSize: { xs: '30px', md: '45px' },
                lineHeight: '1',
                color: '#18181B',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              208
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{
                color: '#757877',
                ml: 0.5,
                display: 'flex',
                alignItems: 'center',
                lineHeight: '1.2',
              }}
            >
              НМТ 2022-2023 <br /> двістібальників
            </Typography>
          </Box>
        </Box>

        {/* Contact Icons */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' }, gap: 1 }}>
          <IconButton
            color="primary"
            onClick={() => window.open('https://t.me/znooonaa200', '_blank')}
            aria-label="Telegram"
          >
            <TelegramIcon fontSize="large" />
          </IconButton>
          <IconButton
            color="primary"
            onClick={() => window.open('https://www.instagram.com/znoona200/', '_blank')}
            aria-label="Instagram"
          >
            <InstagramIcon fontSize="large" />
          </IconButton>
        </Box>
      </Box>

      {/* Image Section */}
      <Box
        sx={{
          flex: 1,
          maxWidth: { xs: '80%', md: '35%' }, // Adjusted for better balance
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: { xs: '100%', md: '35%' }, // Adjusted width
          mb: { xs: 4, md: 0 }, // Optional: margin bottom for mobile
        }}
      >
        <Box
          component="img"
          sx={{ width: '100%', height: 'auto' }}
          src={students}
          alt="students"
        />
      </Box>
    </Box>
  );
};

export default MainInfo;
