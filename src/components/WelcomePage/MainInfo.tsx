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
        padding: { xs: '20px', md: '40px' },
      }}
    >
      {/* Free Space */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          flex: '1 1 auto',
          maxWidth: '10%',
          width: '100%',
          flexGrow: 3,
        }}
      />

      {/* Content Section */}
      <Box
        id='main-content-info'
        sx={{
          flex: '0 0 auto',
          width: { xs: '100%', md: '600px' },
          textAlign: { xs: 'center', md: 'left' },
          mb: { xs: 4, md: 0 },
          padding: { xs: '10px 0', md: '20px 0' },
          margin: { xs: '0 auto', md: '0' },
        }}
      >
        {/* Title */}
        <Typography
          variant={isMobile ? 'h5' : 'h3'}
          sx={{
            fontWeight: 700,
            color: '#063231',
            mb: 1.5,
          }}
        >
          Готуємо до ЗНО{' '}
          <Box component="span" sx={{ backgroundColor: '#FFFFFF', px: 0.5 }}>
            10 років
          </Box>{' '}
          i знаємо про підготовку все
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="subtitle1"
          sx={{
            color: '#3F6563',
          }}
        >
          Тобі потрібно лише стати одним із наших учнів, а ми допоможемо з усім іншим.
        </Typography>

        {/* Phone Input */}
        <Box sx={{ }}>
          <PhoneInput />
        </Box>

        {/* Statistics */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            textAlign: 'center',
            // mb: 1.5,
            gap: 0.5,
            width: '100%',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Typography
              variant="h4"
              sx={{
                fontFamily: 'lato, sans-serif',
                fontStyle: 'normal',
                fontWeight: 700,
                fontSize: { xs: '30px', md: '45px' },
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
                ml: 2,
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
                ml: 2,
                display: 'flex',
                alignItems: 'center',
                lineHeight: '1.2',
              }}
            >
              НМТ 2022-2023 <br /> двістібальників
            </Typography>
          </Box>
          <Box sx={{ my: 0 }}>
            {/* free space */}
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
          flex: '1 1 auto',
          maxWidth: '50%',
          minWidth: '30%',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mb: { xs: 4, md: 0 },
          mr: { xs: 0, md: 4 },
          flexGrow: 1,
          // padding: { xs: '10px 0', md: '20px 0' },
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
