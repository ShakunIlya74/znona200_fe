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
        padding: { xs: '40px 20px', md: '80px 40px' },
        backgroundColor: '#f5f5f5',
        width: '100%',
        flexGrow: 1,
      }}
    >
      {/* Content Section */}
      <Box
        sx={{
          flex: 1,
          maxWidth: { xs: '100%', md: '50%' },
          textAlign: { xs: 'center', md: 'left' },
          mb: { xs: 4, md: 0 },
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
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: isMobile ? 'center' : 'flex-start',
            textAlign: 'center',
            mb: { xs: 2, md: 0 },
          }}
        >
          {/* First Stat */}
          <Box sx={{ flex: 1, mb: { xs: 2, md: 0 } }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#063231' }}>
              5000+
            </Typography>
            <Typography variant="subtitle2" sx={{ color: '#757877' }}>
              учнів
            </Typography>
          </Box>

          {/* Divider */}
          <Box sx={{ flex: 1, my: { xs: 2, md: 0 } }}>
            <img src={divider} alt="divider" style={{ width: '80%', maxWidth: '200px' }} />
          </Box>

          {/* Second Stat */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#063231' }}>
              208
            </Typography>
            <Typography variant="subtitle2" sx={{ color: '#757877' }}>
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
          maxWidth: { xs: '100%', md: '50%' },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <img src={students} alt="students" style={{ width: '100%', maxWidth: '500px', height: 'auto' }} />
      </Box>
    </Box>
  );
};

export default MainInfo;
