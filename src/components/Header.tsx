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
  ListItemText
} from "@mui/material";
import { useEffect, useState } from "react";
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { Outlet } from 'react-router-dom';

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
        width: '350px',
        backgroundColor: '#f4f4f3',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: '20px',
      }}
      role="presentation"
    >


      {/* <List>
        {['Тести', 'Вибори', 'Мінілейн', 'Конспекти', 'Статистика'].map((text) => (
          <ListItem component="div" button key={text}>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List> */}
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
          <Box >
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
