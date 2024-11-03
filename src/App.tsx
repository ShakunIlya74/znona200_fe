// src/App.tsx
import React, { useEffect } from 'react';
import Container from '@mui/material/Container';
import { CssBaseline } from '@mui/material';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate,
} from 'react-router-dom';

import WelcomePage from './pages/WelcomePage';
import UserMenuPage from './pages/UserMenuPage';
import LoginPage from './pages/LoginPage';
import WelcomeLayout from './layouts/WelcomeLayout';
import MainLayout from './layouts/MainLayout';
// Import other pages as needed

const App: React.FC = () => {
  useEffect(() => {
    document.title = 'ZnoNa200';
  }, []);

  // Mock authentication status (replace with real auth logic)
  const isAuthenticated = false; // Set to `true` for logged-in state

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        {/* Welcome Routes with AppBar */}
        <Route path="/" element={<WelcomeLayout />}>
          <Route index element={<WelcomePage />} />
        </Route>

        {/* Main Routes without AppBar */}
        <Route element={<MainLayout />}>
          {/* Public Routes */}
          <Route
            path="login"
            element={!isAuthenticated ? <LoginPage /> : <Navigate to="/menu" replace />}
          />
          {/* Protected Routes */}
          <Route
            path="menu"
            element={isAuthenticated ? <UserMenuPage /> : <Navigate to="/" replace />}
          />
          {/* Add more routes here */}
          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </>
    )
  );

  return (
    <>
    <CssBaseline />
    <Container maxWidth={false} disableGutters>
      <RouterProvider router={router} />
    </Container>
  </>
  );
};

export default App;
