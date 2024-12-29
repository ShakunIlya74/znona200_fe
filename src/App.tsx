// src/App.tsx
import React, { useEffect } from 'react';
import Container from '@mui/material/Container';
import { CssBaseline } from '@mui/material';
import { createBrowserRouter, RouterProvider, Route, Navigate } from 'react-router-dom';

import Header from './components/Header';
import WelcomeHeader from './components/WelcomePage/WelcomeHeader';
import LoginPage from './pages/LoginPage';
import WelcomePage from './pages/WelcomePage';
import UserMenuPage from './pages/UserMenuPage';

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

const router = createBrowserRouter([
  {
    path: '/',
    element: withWelcomeLayout(WelcomePage)(),
  },
  {
    path: '/login',
    element: <LoginPage />,
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

const App: React.FC = () => {
  useEffect(() => {
    document.title = 'ZnoNa200';
  }, []);

  return (
    <Container maxWidth={false}>
      <CssBaseline />
      <RouterProvider router={router} />
    </Container>
  );
};

export default App;
