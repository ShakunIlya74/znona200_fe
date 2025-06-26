// src/components/Footer.tsx
import React from 'react';
import {
  Box,
  Typography,
  Link,
  Grid,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import TelegramIcon from '@mui/icons-material/Telegram';
import InstagramIcon from '@mui/icons-material/Instagram';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

const Footer: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const footerLinks = [
    { text: 'Про курс', to: 'about' },
    { text: 'Команда', to: 'team' },
    { text: 'Відгуки', to: 'reviews' },
    { text: 'Ціни', to: 'price' },
  ];

  const scrollToElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box
    id="footer"
      component="footer"
      sx={{
        backgroundColor: '#063231',
        color: 'white',
        py: 6,
        px: { xs: 2, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Grid container spacing={4}>          {/* Navigation Links */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {footerLinks.map((link) => (
                <Link
                  key={link.to}
                  onClick={() => scrollToElement(link.to)}
                  sx={{
                    color: 'white',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {link.text}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon fontSize="small" />
                <Typography variant="body2">+380 98 322 98 07</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon fontSize="small" />
                <Typography variant="body2">znona200@gmail.com</Typography>
              </Box>
            </Box>
          </Grid>

          {/* Social Media */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                sx={{ color: 'white' }}
                onClick={() => window.open('https://t.me/znooonaa200', '_blank')}
              >
                <TelegramIcon />
              </IconButton>
              <IconButton
                sx={{ color: 'white' }}
                onClick={() => window.open('https://www.instagram.com/znoona200/', '_blank')}
              >
                <InstagramIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <Typography variant="body2" align="center">
            ©2025 ЗНО/200
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;