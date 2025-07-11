import React, { useEffect, useState } from 'react';
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
import { GetSessionData } from '../../services/AuthService';

interface MenuItem {
  text: string;
  to: string;
}

const WelcomeHeader: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg')); // Changed from 'md' to 'lg' for earlier mobile switch
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const sessionData = GetSessionData();
    sessionData.then(res => {
      if (res.is_logged_in) {
        setIsAuthenticated(true);
      }
    });
  }, []);

  const menus: MenuItem[] = [
    { text: 'Про курс', to: 'about' },
    { text: 'Команда', to: 'team' },
    { text: 'Відгуки', to: 'reviews' },
    { text: 'Ціни', to: 'price' },
    { text: 'Контакти', to: 'footer' },
  ];
  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const scrollToElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: '#FFFFFF', boxShadow: 'none' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo */}
          <Box 
            component={Link} 
            to="/" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              flexShrink: 0, // Prevent logo from shrinking
              maxWidth: { xs: 'calc(100vw - 120px)', sm: 'none' } // Prevent logo from taking too much space on mobile
            }}
          >
            <img 
              src={ZnoLogo} 
              alt="Logo ZNO" 
              style={{ 
                height: '50px',
                maxHeight: '50px',
                width: 'auto',
                maxWidth: '100%'
              }} 
            />
          </Box>          {/* Desktop Menu */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
              {menus.map((menu) => (
                <Button
                  key={menu.to}
                  onClick={() => scrollToElement(menu.to)}
                  sx={{
                    color: '#3F6563',
                    textTransform: 'none',
                    fontSize: '20px',
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
              {isAuthenticated ? (
                <Button
                  component={Link}
                  to="/menu"
                  variant="contained"
                  sx={{
                    ml: 3,
                    backgroundColor: '#006A68',
                    color: '#FFFFFF',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#004D40',
                    },
                  }}
                >
                  <Typography sx={{ fontSize: '20px' }}>Мій кабінет</Typography>
                </Button>
              ) : (
                <>
                  <Button
                    component={Link}
                    to="/login"
                    variant="outlined"
                    sx={{
                      ml: 3,
                      color: '#006A68',
                      borderColor: '#006A68',
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: '#006A68',
                        backgroundColor: '#E0F7FA',
                      },
                    }}
                  >
                    <Typography sx={{ fontSize: '20px' }}>Увійти</Typography>
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
                      '&:hover': {
                        backgroundColor: '#004D40',
                      },
                    }}
                  >
                    <Typography sx={{ fontSize: '20px' }}>Запис на курс</Typography>
                  </Button>
                </>
              )}
            </Box>
          )}

          {/* Mobile Menu Icon */}
          {isMobile && (
            <IconButton 
              onClick={toggleDrawer(true)} 
              aria-label="menu" 
              color="inherit"
              sx={{
                flexShrink: 0, // Prevent burger icon from shrinking
                minWidth: '48px',
                padding: '8px'
              }}
            >
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
          </Box>          {/* Logo */}
          <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <img 
              src={ZnoLogo} 
              alt="Logo ZNO" 
              style={{ 
                height: '40px',
                maxWidth: '100%',
                width: 'auto'
              }} 
            />
          </Box>          {/* Menu Items */}
          <List>
            {menus.map((menu) => (
              <ListItemButton 
                key={menu.to} 
                onClick={() => {
                  scrollToElement(menu.to);
                  setDrawerOpen(false);
                }}
              >
                <ListItemText primary={menu.text} sx={{ color: '#3F6563', fontSize: '16px' }} />
              </ListItemButton>
            ))}
          </List>{/* Action Buttons */}
          <Box sx={{ mt: 'auto' }}>
            {isAuthenticated ? (
              <Button
                component={Link}
                to="/menu"
                variant="contained"
                fullWidth
                sx={{
                  backgroundColor: '#006A68',
                  color: '#FFFFFF',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#004D40',
                  },
                }}
              >
                <Typography sx={{ fontSize: '20px' }}>Мій кабінет</Typography>
              </Button>
            ) : (
              <>
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  fullWidth
                  sx={{
                    color: '#006A68',
                    borderColor: '#006A68',
                    textTransform: 'none',
                    // fontSize removed from here
                    mb: 2,
                    '&:hover': {
                      borderColor: '#006A68',
                      backgroundColor: '#E0F7FA',
                    },
                  }}
                >
                  <Typography sx={{ fontSize: '24px' }}>Увійти</Typography>
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
                    // fontSize removed from here
                    '&:hover': {
                      backgroundColor: '#004D40',
                    },
                  }}
                >
                  <Typography sx={{ fontSize: '18px' }}>Запис на курс</Typography>
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Drawer>
      <Outlet />
    </>

  );
};

export default WelcomeHeader;

