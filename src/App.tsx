// src/App.tsx
import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { CssBaseline } from '@mui/material';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

import Header from './components/Header';
import WelcomeHeader from './components/WelcomePage/WelcomeHeader';
import LoginPage from './pages/LoginPage';
import WelcomePage from './pages/WelcomePage';
import UserMenuPage from './pages/UserMenuPage';
import { GetSessionData } from './services/AuthService';
import TestsPage from './pages/TestsPage';
import LessonsPage from './pages/LessonsPage';
import ProtectedRoute from './routes/ProtectedRoute';
import SettingsPage from './pages/settings/SettingsPage';
import LibraryPage from './pages/LibraryPage';

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
            flex: 1,
            height: '100%',
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
                minWidth: { md: '275px', xs: 0 },
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
                flex: 1,
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

  const router = createBrowserRouter([
    {
      path: '/',
      element: withWelcomeLayout(WelcomePage)(),
    },
    {
      path: '/login',
      element: <LoginPage />,
    },
    // Protected routes of the app
    {
      path: '/',
      element: <ProtectedRoute />,
      children: [
        {
          path: 'menu',
          element: withLayout(UserMenuPage)(),
        },
        {
          path: 'settings',
          element: withLayout(SettingsPage)(),
        },
        {
          path: 'library',
          element: withLayout(LibraryPage)(),
        },
        {
          path: 'tests',
          element: withLayout(TestsPage)(),
        },
        {
          path: 'webinars',
          element: withLayout(LessonsPage)(),
        },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/" replace />,
    },
  ]);

  return (
    <Box sx={{ width: '100%', height: '100%', }}>
      <CssBaseline />
      <RouterProvider router={router} />
    </Box>
  );
};

export default App;
