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

// Mock authentication status (replace with real auth logic)
const isAuthenticated = false; // Set to `true` for logged-in state

const withLayout = (Component: React.ComponentType) => () => (
  <>
    <Header />
    <Component />
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
      element: <LoginPage  setLoggedIn={setLoggedIn} />,
    },
    {
      path: '/menu',
      element: isAuthenticated ? <UserMenuPage /> : <Navigate to="/login" replace />,
    },
    {
      path: '*',
      element: <Navigate to="/" replace />,
    },
  ]);

  return (
    // Container is replaced with Box, todo: check for cons
    <Box sx={{ width: '100vw', height: '100vh', }}>
      <CssBaseline />
      <RouterProvider router={router} />
    </Box>
  );
};

export default App;
