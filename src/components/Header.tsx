import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  List,
  ListItem,
  ListItemText,
  ListItemButton
} from "@mui/material";
import { useEffect, useState } from "react";
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { Link, Outlet } from 'react-router-dom';
import ZnoLogo from '../source/header/logo_zno.svg';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import VideoCameraFrontOutlinedIcon from '@mui/icons-material/VideoCameraFrontOutlined';
import VoiceChatOutlinedIcon from '@mui/icons-material/VoiceChatOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import QueryStatsOutlinedIcon from '@mui/icons-material/QueryStatsOutlined';
import ContactPhoneOutlinedIcon from '@mui/icons-material/ContactPhoneOutlined';
import Diversity1OutlinedIcon from '@mui/icons-material/Diversity1Outlined';

function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  // Content inside the drawer (used by both permanent and temporary drawers)
  const drawerContent = (
    <Box
      sx={{
        backgroundColor: '#f4f4f3',
        display: 'flex',
        flexDirection: 'column',

      }}
      role="presentation"
    >
      <Box component={Link} to="/" sx={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', paddingY: '60px',
      }}>
        <img src={ZnoLogo} alt="Logo ZNO" style={{ height: '40px' }} />
      </Box>

      <List sx={{}}>
        <ListItem component="div" disablePadding>
          <ListItemButton>
            <ReceiptLongOutlinedIcon sx={{ mr: 2, ml: '50px', fontSize: '24px' }} />
            <ListItemText
              primary="Тести"
              primaryTypographyProps={{ sx: { fontSize: '24px' } }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem component="div" disablePadding>
          <ListItemButton>
            <VideoCameraFrontOutlinedIcon sx={{ mr: 2,ml: '50px',  fontSize: '24px' }} />
            <ListItemText
              primary="Вебінари"
              primaryTypographyProps={{ sx: { fontSize: '24px' } }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem component="div" disablePadding>
          <ListItemButton>
            <VoiceChatOutlinedIcon sx={{ mr: 2, ml: '50px', fontSize: '24px' }} />
            <ListItemText
              primary="Мінілекції"
              primaryTypographyProps={{ sx: { fontSize: '24px' } }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem component="div" disablePadding>
          <ListItemButton>
            <ArticleOutlinedIcon sx={{ mr: 2, ml: '50px',  fontSize: '24px' }} />
            <ListItemText
              primary="Конспекти"
              primaryTypographyProps={{ sx: { fontSize: '24px' } }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem component="div" disablePadding>
          <ListItemButton>
            <QueryStatsOutlinedIcon sx={{ mr: 2, ml: '50px',  fontSize: '24px' }} />
            <ListItemText
              primary="Статистика"
              primaryTypographyProps={{ sx: { fontSize: '24px' } }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem component="div" disablePadding>
          <ListItemButton>
            <ContactPhoneOutlinedIcon sx={{ mr: 2, ml: '50px',  fontSize: '24px' }} />
            <ListItemText
              primary="Запити"
              primaryTypographyProps={{ sx: { fontSize: '24px' } }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem component="div" disablePadding>
          <ListItemButton>
            <Diversity1OutlinedIcon sx={{ mr: 2, ml: '50px',  fontSize: '24px' }} />
            <ListItemText
              primary="Групи"
              primaryTypographyProps={{ sx: { fontSize: '24px' } }}
            />
          </ListItemButton>
        </ListItem>
      </List>

    </Box>
  );

  return (
    <>
      {/* TOP APP BAR */}
      <AppBar
        position="sticky"
        sx={{ backgroundColor: '#FFFFFF', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
      >
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            padding: '2% 20%',
            paddingX: { xs: '5%', md: '5%' },
            backgroundColor: '#f4f4f3',
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontSize: '36px', flexGrow: 1, color: '#5b5f5e', pl: { xs: 0, md: 40 } }}
          >
            Тести
          </Typography>

          {/* Hamburger icon for mobile */}
          {isMobile && (
            <IconButton onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* PERMANENT DRAWER (visible on larger screens) */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: '350px',
            // flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: '350px',
              boxSizing: 'border-box',
              backgroundColor: '#f4f4f3',
              boxShadow: '4px 4px 6px rgba(0, 0, 0, 0.1)'
            },
          }}
          open
        >
          {/* The top toolbar spacer ensures content is below the AppBar */}
          <Box sx={{ alignItems: 'center', }}>
            {drawerContent}
          </Box>
        </Drawer>
      )}

      {/* TEMPORARY DRAWER (for mobile) */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 250,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* MAIN CONTENT AREA */}
      <Box
        id="main-content"
      >
        <Outlet />
      </Box>
    </>
  );
}

export default Header;
