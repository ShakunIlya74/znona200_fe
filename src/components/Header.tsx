import { AppBar, Box, Container, Drawer, IconButton, Toolbar, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useEffect, useState } from "react";

import packageJson from "../../package.json";
import { GetSessionData } from "../services/AuthService";
import CloseIcon from '@mui/icons-material/Close';
import { Outlet } from 'react-router-dom';

const adminOnlyEndpoints = [
  // set admin only endpoints here
  'admin',
]

function Header() {


  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  return (
    <>
      <AppBar
        position="sticky"
        sx={{ backgroundColor: '#FFFFFF', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
      >
        <Toolbar
          sx={{
        justifyContent: 'space-between',
        padding: '2% 20%',
        paddingX: { xs: '5%', md: '5%' },
        backgroundColor: '#f4f4f3'
          }}
        >
          {/* Desktop Menu */}
          <Typography
        variant="h6"
        sx={{ fontSize: '36px', flexGrow: 1, color: '#5b5f5e' }}
          >
        Тести
          </Typography>
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
        </Box>
      </Drawer>

      <Outlet />
    </>
  )
}

export default Header