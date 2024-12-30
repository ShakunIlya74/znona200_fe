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
        // padding: { xs: '40px 20px', md: '80px 40px' },
        backgroundColor: '#cce8e6',
        width: '100%',
        flexGrow: 1,
      }}
    >
      {/* Content Section */}
      <Box
        sx={{
          flex: 1,
          // maxWidth: { xs: '100%', md: '20%' },
          width: '30%',
          textAlign: { xs: 'center', md: 'left' },
          mb: { xs: 4, md: 0 },
          padding: { xs: '20px 0', md: '40px 0' },
          margin: { xs: '0 20px', md: '0 40px' },
        }}
      >
        {/* Title */}
        <Typography
          variant={isMobile ? 'h5' : 'h3'}
          sx={{
            fontWeight: 700,
            color: '#063231',
            mb: 2,
          }}
        >
          Готуємо до ЗНО <Box component="span" sx={{ backgroundColor: '#FFFFFF', px: 1 }}>10 років</Box> i знаємо про підготовку все
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="subtitle1"
          sx={{
            color: '#3F6563',
            mb: 4,
          }}
        >
          Тобі потрібно лише стати одним із наших учнів, а ми допоможемо з усім іншим.
        </Typography>

        {/* Phone Input */}
        <Box sx={{ mb: 4 }}>
          <PhoneInput />
        </Box>

        {/* Statistics */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            mb: 2,
            gap: 2,
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
                fontSize: '45px',
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
                ml: 1,
              }}
            >
              учнів
            </Typography>
          </Box>

          {/* Divider */}
          <Box sx={{ my: 2 }}>
            <Box component="img" sx={{ width: 'auto', height: '50%' }} src={divider} alt="divider" />
          </Box>

          {/* Second Stat */}
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Typography
              variant="h4"
              sx={{
                fontFamily: 'lato, sans-serif',
                fontStyle: 'normal',
                fontWeight: 700,
                fontSize: '45px',
                lineHeight: '52px',
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
                ml: 1,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              НМТ 2022-2023 <br /> двістібальників
            </Typography>
            
          </Box>
        </Box>

        {/* Contact Icons */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' }, gap: 2 }}>
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
          maxWidth: { xs: '100%', md: '140%' },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box
          component="img"
          sx={{ width: '100%', maxWidth: '140%', minWidth: '60%', height: 'auto' }}
          src={students}
          alt="students"
        />
      </Box>
    </Box>
  );
};

export default MainInfo;
