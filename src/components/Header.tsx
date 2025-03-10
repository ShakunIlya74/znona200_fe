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
import { Link, Outlet, useLocation } from 'react-router-dom';
import ZnoLogo from '../source/header/logo_zno.svg';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import VideoCameraFrontOutlinedIcon from '@mui/icons-material/VideoCameraFrontOutlined';
import VoiceChatOutlinedIcon from '@mui/icons-material/VoiceChatOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import QueryStatsOutlinedIcon from '@mui/icons-material/QueryStatsOutlined';
import ContactPhoneOutlinedIcon from '@mui/icons-material/ContactPhoneOutlined';
import Diversity1OutlinedIcon from '@mui/icons-material/Diversity1Outlined';

import packageJson from '../../package.json';
import { GetSessionData } from "../services/AuthService";

// Add the dictionary for menu titles
const menuTitles: Record<string, string> = {
  tests: "Тести",
  webinars: "Вебінари",
  miniLectures: "Мінілекції",
  notes: "Конспекти",
  statistics: "Статистика",
  queries: "Запити",
  groups: "Групи"
};

const BUTTON_FONT_SIZE = '18px';

function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [userSurname, setUserSurname] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [profilePicture, setProfilePicture] = useState<string>('');

  // New state to store the selected menu button id (only one active at a time)
  const location = useLocation();
  const deriveMenuFromPath = (pathname: string) => {
    // Split the pathname and use the first segment after '/'
    const path = pathname.split('/')[1];
    // Return derived menu value; if empty, default to "tests"
    return path || "tests";
  }

  const [selectedMenu, setSelectedMenu] = useState(() => deriveMenuFromPath(location.pathname));


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
            to="/tests"
            onClick={() => setSelectedMenu("tests")}
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
            onClick={() => setSelectedMenu("webinars")}
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
            onClick={() => setSelectedMenu("miniLectures")}
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
            onClick={() => setSelectedMenu("notes")}
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
            onClick={() => setSelectedMenu("statistics")}
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
            onClick={() => setSelectedMenu("queries")}
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
            onClick={() => setSelectedMenu("groups")}
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
          <Typography id='page-title'
            variant="h6"
            sx={{ fontSize: '28px', flexGrow: 1, color: '#5b5f5e', pl: { xs: 0, md: 40 } }}
          >
            {menuTitles[selectedMenu]}
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
