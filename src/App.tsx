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
import TestsPage from './pages/tests/TestsPage';
import LessonsPage from './pages/LessonsPage';
import MinilectionsPage from './pages/MinilectionsPage';
import NotesPage from './pages/NotesPage';
import ProtectedRoute from './routes/ProtectedRoute';
import SettingsPage from './pages/settings/SettingsPage';
import LibraryPage from './pages/LibraryPage';
import TestViewPage from './pages/tests/TestViewPage';
import TestReviewPage from './pages/tests/TestReviewPage';
import LessonViewPage from './pages/LessonViewPage';
import MinilectionViewPage from './pages/MinilectionViewPage';
import NoteViewPage from './pages/NoteViewPage';

const withLayout = (Component: React.ComponentType, isViewComponent=false) => () => (
  <>
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f4f4f3' }}>
      <Header />
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Box
          sx={{
            minWidth: { md: '275px', xs: 0 },
            display: { xs: 'none', md: 'block' },
            flex: 'none',
          }}
        >
          {/* This box acts as spacer for the permanent drawer */}
        </Box>
        <Box
          sx={{
            width: '100%',
            p: isViewComponent ? 0 : { xs: 0, md: 5 },
            flex: 1,
            backgroundColor: isViewComponent ? 'white' : '#f4f4f3',
            paddingBottom: isViewComponent ? 0 : { xs: 5, md: 10 },
          }}
        >
          <Component />
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
          path: 'test-view/:tfp_sha',
          element: withLayout(TestViewPage, true)(),
        },
        {
          path: 'tests/review/:tfp_sha',
          element: withLayout(TestReviewPage, true)(),
        },
        {
          path: 'webinars',
          element: withLayout(LessonsPage)(),
        },
        {
          path: 'webinar-view/:lfp_sha',
          element: withLayout(LessonViewPage, true)(),
        },
        {
          path: 'minilections',
          element: withLayout(MinilectionsPage)(),
        },
        {
          path: 'minilection-view/:minilection_sha',
          element: withLayout(MinilectionViewPage, true)(),
        },
        {
          path: 'notes',
          element: withLayout(NotesPage)(),
        },
        {
          path: 'note-view/:note_sha',
          element: withLayout(NoteViewPage, true)(),
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
