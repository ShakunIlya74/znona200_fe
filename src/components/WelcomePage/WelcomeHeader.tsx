import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  Box,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
  ListItemButton,
} from '@mui/material';
import { Outlet } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from 'react-router-dom';
import ZnoLogo from '../../source/header/logo_zno.svg';

interface MenuItem {
  text: string;
  to: string;
}

const WelcomeHeader: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const menus: MenuItem[] = [
    { text: 'Про курс', to: 'about' },
    { text: 'Команда', to: 'team' },
    { text: 'Відгуки', to: 'reviews' },
    { text: 'Ціни', to: 'price' },
    { text: 'Контакти', to: 'contacts' },
  ];

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#FFFFFF', boxShadow: 'none' }}>
        <Toolbar sx={{ justifyContent: 'space-between', padding: '0 20px' }}>
          {/* Logo */}
          <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center' }}>
            <img src={ZnoLogo} alt="Logo ZNO" style={{ height: '40px' }} />
          </Box>

          {/* Desktop Menu */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {menus.map((menu) => (
                <Button
                  key={menu.to}
                  component={Link}
                  to={`/${menu.to}`}
                  sx={{
                    color: '#3F6563',
                    textTransform: 'none',
                    fontSize: '16px',
                    marginLeft: '20px',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {menu.text}
                </Button>
              ))}

              {/* Action Buttons */}
              <Button
                component={Link}
                to="/login"
                variant="outlined"
                sx={{
                  ml: 3,
                  color: '#006A68',
                  borderColor: '#006A68',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#006A68',
                    backgroundColor: '#E0F7FA',
                  },
                }}
              >
                Увійти
              </Button>
              <Button
                component={Link}
                to="/register"
                variant="contained"
                sx={{
                  ml: 2,
                  backgroundColor: '#006A68',
                  color: '#FFFFFF',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#004D40',
                  },
                }}
              >
                Запис на курс
              </Button>
            </Box>
          )}

          {/* Mobile Menu Icon */}
          {isMobile && (
            <IconButton onClick={toggleDrawer(true)} aria-label="menu" color="inherit">
              <MenuIcon sx={{ color: '#3F6563' }} />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{
            width: 250,
            backgroundColor: '#CCE8E6',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
          }}
          role="presentation"
        >
          {/* Close Icon */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton onClick={toggleDrawer(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Logo */}
          <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <img src={ZnoLogo} alt="Logo ZNO" style={{ height: '40px' }} />
            <Typography variant="h6" sx={{ ml: 1, color: '#063231', fontWeight: 700 }}>
              ZnoNa200
            </Typography>
          </Box>

          {/* Menu Items */}
          <List>
            {menus.map((menu) => (
              <ListItemButton key={menu.to} component={Link} to={`/${menu.to}`} onClick={toggleDrawer(false)}>
                <ListItemText primary={menu.text} sx={{ color: '#3F6563', fontSize: '16px' }} />
              </ListItemButton>
            ))}
          </List>

          {/* Action Buttons */}
          <Box sx={{ mt: 'auto' }}>
            <Button
              component={Link}
              to="/login"
              variant="outlined"
              fullWidth
              sx={{
                color: '#006A68',
                borderColor: '#006A68',
                textTransform: 'none',
                fontWeight: 600,
                mb: 2,
                '&:hover': {
                  borderColor: '#006A68',
                  backgroundColor: '#E0F7FA',
                },
              }}
            >
              Увійти
            </Button>
            <Button
              component={Link}
              to="/register"
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: '#006A68',
                color: '#FFFFFF',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#004D40',
                },
              }}
            >
              Запис на курс
            </Button>
          </Box>
        </Box>
      </Drawer>
      <Outlet /> 
    </>
    
  );
};

export default WelcomeHeader;

