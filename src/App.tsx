// src/App.tsx
import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material'; // Add this import
import { CssBaseline } from '@mui/material';
import { createBrowserRouter, RouterProvider, Route, Navigate } from 'react-router-dom';

import Header from './components/Header';
import WelcomeHeader from './components/WelcomePage/WelcomeHeader';
import LoginPage from './pages/LoginPage';
import WelcomePage from './pages/WelcomePage';
import UserMenuPage from './pages/UserMenuPage';
import { GetSessionData } from './services/AuthService';
import TestsPage from './pages/TestsPage';
import LessonsPage from './pages/LessonsPage';

// Mock authentication status (replace with real auth logic)
const isAuthenticated = true; // Set to `true` for logged-in state

const withLayout = (Component: React.ComponentType) => () => (
  <>
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', backroundcolor: '#f4f4f3' }}>
      <Header />
      <Box sx={{ flex: 1, height: '100%', }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#f4f4f3',
            flex: 1, // Allow this container to grow and fill the available space
            height: '100%', // Use the full height of the viewport
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              flex: 1,
            }}
          >
            <Box
              sx={{
                minWidth: { md: '350px', xs: 0 },
                // Use flex "none" if you don’t want this side panel to grow
                flex: 'none',
                backgroundColor: 'white',
              }}
            >
              {/* Side content goes here */}
            </Box>
            <Box
              sx={{
                width: '100%',
                p: 5,
                flex: 1, // This area fills the rest of the space
              }}
            >
              <Component />
            </Box>
          </Box>
        </Box>

      </Box>
    </Box>
  </>
);

const withWelcomeLayout = (Component: React.ComponentType) => () => (
  <>
    <WelcomeHeader />
    <Component />
  </>
);



const App: React.FC = () => {
  const [state, setState] = useState({
    loggedIn: false,
    loading: true
  });
  useEffect(() => {
    const sessionData = GetSessionData();
    sessionData.then(res => {
      setState({ loggedIn: res !== undefined && res.is_logged_in, loading: false });
    });
  }, []);

  useEffect(() => {
    document.title = 'ZnoNa200';
  }, []);

  const setLoggedIn = (loggedIn: boolean) => {
    setState({ loggedIn: loggedIn, loading: state.loading });
  }

  const router = createBrowserRouter([
    {
      path: '/',
      element: withWelcomeLayout(WelcomePage)(),
    },
    {
      path: '/login',
      element: <LoginPage setLoggedIn={setLoggedIn} />,
    },
    {
      path: '/menu',
      element: isAuthenticated ? withLayout(UserMenuPage)() : <Navigate to="/login" replace />,
    },
    {
      path: '/tests',
      element: isAuthenticated ? withLayout(TestsPage)() : <Navigate to="/login" replace />,
    },
    {
      path: '/webinars',
      element: isAuthenticated ? withLayout(LessonsPage)() : <Navigate to="/login" replace />,
    },
    {
      path: '*',
      element: <Navigate to="/" replace />,
    },
  ]);

  return (
    // Container is replaced with Box, todo: check for cons
    <Box sx={{ width: '100%', height: '100%', }}>
      <CssBaseline />
      <RouterProvider router={router} />
    </Box>
  );
};

export default App;
