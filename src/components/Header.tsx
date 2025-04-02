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
  ListItemButton,
  Menu,
  MenuItem
} from "@mui/material";
import { useEffect, useState, useRef } from "react";
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import ZnoLogo from '../source/header/logo_zno.svg';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import VideoCameraFrontOutlinedIcon from '@mui/icons-material/VideoCameraFrontOutlined';
import VoiceChatOutlinedIcon from '@mui/icons-material/VoiceChatOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import QueryStatsOutlinedIcon from '@mui/icons-material/QueryStatsOutlined';
import ContactPhoneOutlinedIcon from '@mui/icons-material/ContactPhoneOutlined';
import Diversity1OutlinedIcon from '@mui/icons-material/Diversity1Outlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import ExpandLessOutlinedIcon from '@mui/icons-material/ExpandLessOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

import packageJson from '../../package.json';
import { GetSessionData, Logout } from "../services/AuthService";

// Add the dictionary for menu titles
const menuTitles: Record<string, string> = {
  menu: "Вітаємо!",
  settings: "Налаштування",
  library: "Бібліотека",
  tests: "Тести",
  webinars: "Вебінари",
  miniLectures: "Мінілекції",
  notes: "Конспекти",
  statistics: "Статистика",
  queries: "Запити",
  groups: "Групи"
};

// Map of paths to menu identifiers
const pathToMenuMap: Record<string, string> = {
  'menu': 'menu',
  'settings': 'settings',
  'library': 'library',
  'tests': 'tests',
  'webinars': 'webinars',
  'mini-lectures': 'miniLectures',
  'notes': 'notes',
  'statistics': 'statistics',
  'queries': 'queries',
  'groups': 'groups'
};

const BUTTON_FONT_SIZE = '18px';

const HEADER_HEIGHT = {
  xs: '50px',  // Small/mobile screens
  sm: '70px',  // Medium screens
  md: '100px', // Large screens
};

function Header() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingDropOpen, setSettingDropOpen] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [userSurname, setUserSurname] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [profilePicture, setProfilePicture] = useState<string>('');

  // Reference for the profile menu anchor
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Get the current location
  const location = useLocation();

  // Function to derive menu from path
  const deriveMenuFromPath = (pathname: string) => {
    // Extract the first segment after '/'
    const path = pathname.split('/')[1];
    // Use the mapping to get the corresponding menu identifier
    return pathToMenuMap[path] || 'tests'; // Default to 'tests' if no match
  };

  // Initialize and update selectedMenu based on current path
  const [selectedMenu, setSelectedMenu] = useState(() => deriveMenuFromPath(location.pathname));

  // Update selectedMenu whenever the location changes
  useEffect(() => {
    setSelectedMenu(deriveMenuFromPath(location.pathname));
  }, [location.pathname]);

  /*
  Consider this useEffect as an entry point to the app for logged in users
  Do essential checks:
    1. Check for version updates - delete cached files if required
    2. Check for admin rights - allow display of admin options
  */
  useEffect(() => {
    // check version before doing anything
    let version = localStorage.getItem('version');
    console.log('latest: ' + packageJson.version);
    console.log('current: ' + version);
    if (version != packageJson.version) {
      if ('caches' in window) {
        window.caches.keys().then((names) => {
          // Delete all the cache files
          names.forEach(name => {
            caches.delete(name);
            console.log('deleting ' + name);
          })
        });

        // Makes sure the page reloads. Changes are only visible after you refresh.
        window.location.reload();
      }

      localStorage.clear();
      localStorage.setItem('version', packageJson.version);
    }

    const sessionData = GetSessionData();

    sessionData.then(res => {
      // example how to get additional data
      // const conferenceList = GetConferenceList();
      // conferenceList.then((res: ConferenceListResponse) => {
      //   if (res.success) {
      //     setConferenceList(res.conferences.reverse());
      //   }
      // });

      setUserName(res.full_name.split(' ')[0]);
      setUserSurname(res.full_name.split(' ')[1]);
      setIsAdmin(res.is_admin);
      setProfilePicture(res.profile_picture);
    });
  }, []);

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  // Handle logout functionality
  const handleLogout = () => {
    // Clear local storage/session
    localStorage.clear();
    // Redirect to login page or home page
    Logout();
    navigate('/login');
    setSettingDropOpen(false);
  };

  // Handle settings navigation
  const handleSettings = () => {
    // Navigate to settings page
    navigate('/settings');
    setSettingDropOpen(false);
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
        justifyContent: 'center', pt: '40px', pb: '60px'
      }}>
        <img src={ZnoLogo} alt="Logo ZNO" style={{ height: '30px' }} />
      </Box>

      <List id='menu-buttons' sx={{}}>
        <ListItem component="div" disablePadding>
          <ListItemButton
            component={Link}
            to="/library"
            onClick={() => setDrawerOpen(false)}
            sx={{ backgroundColor: selectedMenu === "library" ? "#FFFFFF" : "inherit" }}
          >
            <ReceiptLongOutlinedIcon sx={{ mr: 2, ml: '50px', fontSize: BUTTON_FONT_SIZE }} />
            <ListItemText
              primary="Бібліотека"
              primaryTypographyProps={{ sx: { fontSize: BUTTON_FONT_SIZE } }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem component="div" disablePadding>
          <ListItemButton
            component={Link}
            to="/tests"
            onClick={() => setDrawerOpen(false)}
            sx={{ backgroundColor: selectedMenu === "tests" ? "#FFFFFF" : "inherit" }}
          >
            <ReceiptLongOutlinedIcon sx={{ mr: 2, ml: '50px', fontSize: BUTTON_FONT_SIZE }} />
            <ListItemText
              primary="Тести"
              primaryTypographyProps={{ sx: { fontSize: BUTTON_FONT_SIZE } }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem component="div" disablePadding>
          <ListItemButton
            component={Link}
            to="/webinars"
            onClick={() => setDrawerOpen(false)}
            sx={{ backgroundColor: selectedMenu === "webinars" ? "#FFFFFF" : "inherit" }}
          >
            <VideoCameraFrontOutlinedIcon sx={{ mr: 2, ml: '50px', fontSize: BUTTON_FONT_SIZE }} />
            <ListItemText
              primary="Вебінари"
              primaryTypographyProps={{ sx: { fontSize: BUTTON_FONT_SIZE } }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem component="div" disablePadding>
          <ListItemButton
            component={Link}
            to="/mini-lectures"
            onClick={() => setDrawerOpen(false)}
            sx={{ backgroundColor: selectedMenu === "miniLectures" ? "#FFFFFF" : "inherit" }}
          >
            <VoiceChatOutlinedIcon sx={{ mr: 2, ml: '50px', fontSize: BUTTON_FONT_SIZE }} />
            <ListItemText
              primary="Мінілекції"
              primaryTypographyProps={{ sx: { fontSize: BUTTON_FONT_SIZE } }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem component="div" disablePadding>
          <ListItemButton
            component={Link}
            to="/notes"
            onClick={() => setDrawerOpen(false)}
            sx={{ backgroundColor: selectedMenu === "notes" ? "#FFFFFF" : "inherit" }}
          >
            <ArticleOutlinedIcon sx={{ mr: 2, ml: '50px', fontSize: BUTTON_FONT_SIZE }} />
            <ListItemText
              primary="Конспекти"
              primaryTypographyProps={{ sx: { fontSize: BUTTON_FONT_SIZE } }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem component="div" disablePadding>
          <ListItemButton
            component={Link}
            to="/statistics"
            onClick={() => setDrawerOpen(false)}
            sx={{ backgroundColor: selectedMenu === "statistics" ? "#FFFFFF" : "inherit" }}
          >
            <QueryStatsOutlinedIcon sx={{ mr: 2, ml: '50px', fontSize: BUTTON_FONT_SIZE }} />
            <ListItemText
              primary="Статистика"
              primaryTypographyProps={{ sx: { fontSize: BUTTON_FONT_SIZE } }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem component="div" disablePadding>
          <ListItemButton
            component={Link}
            to="/queries"
            onClick={() => setDrawerOpen(false)}
            sx={{ backgroundColor: selectedMenu === "queries" ? "#FFFFFF" : "inherit" }}
          >
            <ContactPhoneOutlinedIcon sx={{ mr: 2, ml: '50px', fontSize: BUTTON_FONT_SIZE }} />
            <ListItemText
              primary="Запити"
              primaryTypographyProps={{ sx: { fontSize: BUTTON_FONT_SIZE } }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem component="div" disablePadding>
          <ListItemButton
            component={Link}
            to="/groups"
            onClick={() => setDrawerOpen(false)}
            sx={{ backgroundColor: selectedMenu === "groups" ? "#FFFFFF" : "inherit" }}
          >
            <Diversity1OutlinedIcon sx={{ mr: 2, ml: '50px', fontSize: BUTTON_FONT_SIZE }} />
            <ListItemText
              primary="Групи"
              primaryTypographyProps={{ sx: { fontSize: BUTTON_FONT_SIZE } }}
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
        sx={{
          backgroundColor: '#FFFFFF',
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
          top: 0, // Ensure it sticks at the top
          height: {
            xs: HEADER_HEIGHT.xs,
            sm: HEADER_HEIGHT.sm,
            md: HEADER_HEIGHT.md,
          }
        }}
      >
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            // Replace percentage padding with dynamic height-based padding
            padding: {
              xs: '0 5%',
              sm: '0 5%',
              md: '0 5%',
            },
            height: {
              xs: HEADER_HEIGHT.xs,
              sm: HEADER_HEIGHT.sm,
              md: HEADER_HEIGHT.md,
            },
            backgroundColor: '#f4f4f3',
            minHeight: {
              xs: HEADER_HEIGHT.xs,
              sm: HEADER_HEIGHT.sm,
              md: HEADER_HEIGHT.md,
            },
          }}
        >
          <Typography id='page-title'
            variant="h6"
            sx={{ fontSize: '28px', flexGrow: 1, color: '#5b5f5e', pl: { xs: 0, md: 40 } }}
          >
            {menuTitles[selectedMenu]}
          </Typography>

          {/* User profile */}
          <Box
            ref={profileMenuRef}
            onClick={() => setSettingDropOpen(!settingDropOpen)}
            // make area clickable
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
            }}
          >
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="Profile"
                style={{ width: '40px', height: '40px', borderRadius: '50%' }}
              />
            ) : (
              <Box
                sx={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  backgroundColor: '#016a68',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '20px',
                }}
              >
                {userName && userSurname ? `${userName[0]}${userSurname[0]}` : ''}
              </Box>
            )}
            <Typography
              variant="body1"
              sx={{ fontSize: '18px', color: '#5b5f5e' }}
            >
              {userName} {userSurname}
            </Typography>
            <Box sx={{ color: '#5b5f5e', mt: '5px' }}>
              {settingDropOpen ? <ExpandLessOutlinedIcon /> : <ExpandMoreOutlinedIcon />}
            </Box>
          </Box>

          {/* Profile Dropdown Menu */}
          <Menu
            anchorEl={profileMenuRef.current}
            open={settingDropOpen}
            onClose={() => setSettingDropOpen(false)}
            slotProps={{
              paper: {
                elevation: 3,
                sx: {
                  mt: 1.5,
                  backgroundColor: '#f4f4f3',
                  borderRadius: '10px',
                  minWidth: '180px',
                  overflow: 'visible',
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: -10,
                    right: 20,
                    width: 20,
                    height: 20,
                    bgcolor: '#f4f4f3',
                    transform: 'rotate(45deg)',
                    zIndex: 0,
                  },
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem
              onClick={handleSettings}
              sx={{
                fontSize: '16px',
                py: 1.5,
                color: '#5b5f5e',
                '&:hover': { backgroundColor: '#e6e6e5' }
              }}
            >
              <SettingsOutlinedIcon sx={{ mr: 1 }} />
              Налаштування
            </MenuItem>
            <MenuItem
              onClick={handleLogout}
              sx={{
                fontSize: '16px',
                py: 1.5,
                color: '#5b5f5e',
                '&:hover': { backgroundColor: '#e6e6e5' }
              }}
            >
              <LogoutOutlinedIcon sx={{ mr: 1 }} />
              Вийти
            </MenuItem>
          </Menu>

          {/* Hamburger icon for mobile */}
          {isMobile && (
            <IconButton onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* PERMANENT vertical drawer (visible on larger screens) */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: '275px',
            // flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: '275px',
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
      {/* <Box
        id="main-content"
        sx={{backgroundColor: 'red', }}
      >
        <Outlet />
      </Box> */}
    </>
  );
}

export default Header;