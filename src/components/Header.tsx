import { AppBar, Box, Container, Toolbar, useMediaQuery } from "@mui/material";
import theme from "../theme";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import packageJson from "../../package.json";
import { GetSessionData } from "../services/AuthService";

const adminOnlyEndpoints = [
    // set admin only endpoints here
    'admin',
]  

function Header() {
    const onMobile = useMediaQuery(theme.breakpoints.up('md'));
    const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
    const [anchorElConferences, setAnchorElConferences] = useState<null | HTMLElement>(null);
    const [conferencesExpanded, setConferencesExpanded] = useState<boolean>(false);
    const [userName, setUserName] = useState<string>('');
    const [userSurname, setUserSurname] = useState<string>('');
    const conferencesOpen = Boolean(anchorElConferences);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [showMaintenanceBanner, setShowMaintenanceBanner] = useState<boolean>(false);
    const [profilePicture, setProfilePicture] = useState<string>('');
    const navigate = useNavigate();
  
    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorElUser(event.currentTarget);
    };
  
    const handleOpenConferencesMenu = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorElConferences(event.currentTarget);
      setConferencesExpanded(true);
    };
  
    const handleCloseNavMenu = () => {
      setAnchorElNav(null);
    };
  
    const handleCloseUserMenu = () => {
      setAnchorElUser(null);
    };
  
    const handleCloseConferencesMenu = () => {
      setAnchorElConferences(null);
      setConferencesExpanded(false);
    };
  
    /*
    Consider this useEffect as an entry point to the app for logged in users
    Do essential checks:
      1. Check for version updates - delete cached files if required
      2. Check for admin rights - allow display of admin options
      etc
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
  
    //   const maintenanceStatus = GetMaintenanceData();
      // block nav in case server is dead and we need to navigate to maintenance, and not navigate to '/' in GetSessionData handler
      let allowNav = true;
    //   maintenanceStatus.then(res => {
    //     // check if in maintenance mode
    //     if (!res.success || res.is_maintenance_mode) {
    //       allowNav = false;
    //       navigate({
    //         pathname: '/maintenance',
    //       });
    //     }
    //     else {
    //       setShowMaintenanceBanner(res.show_banner);
    //     }
    //   });
  
      const settingsData = GetSessionData();
  
      settingsData.then(res => {
        // check if logged in
        if (allowNav && (res === undefined || !res.is_logged_in)) {
          navigate({
            pathname: '/',
          });
        }
        // todo: check if logged in and redirect to logout if not
    
  
        // redirect non admin user from restricted admin only pages
        if (!res.is_admin && adminOnlyEndpoints.includes(window.location.pathname)) {
          navigate({
            pathname: '/',
          });
        }

        setUserName(res.name.split(' ')[0]);
        setUserSurname(res.name.split(' ')[1]);
        setIsAdmin(res.is_admin);
        setProfilePicture(res.profile_picture);
      });
    }, []);

    return (
        <>
          <AppBar id="header-bar" position="sticky" sx={{
            borderRadius: '0px 0px 8px 8px!important',
            zIndex: (theme) => theme.zIndex.drawer + 2,
            maxWidth: theme.maxWidthContainer,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            <Container maxWidth="xl">
            <Toolbar disableGutters variant='dense' >

                <Box sx={{ flexGrow: 1 }}>
                    Something
                </Box>
                </Toolbar>
            </Container>
            </AppBar>
        </>
    )
}

export default Header