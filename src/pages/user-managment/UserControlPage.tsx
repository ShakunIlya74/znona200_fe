import React, { useState, useCallback } from 'react';
import {
    Box,
    Typography,
    Container,
    Tabs,
    Tab,
    Paper,
    alpha,
    Snackbar,
    Alert
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import UserControlSearch from './UserControlSearch';
import { getAllUsersPaginated, searchUsersControlPage, UserInfo, getAllUserRequestsPaginated, UserRequest } from '../../services/UserService';
import { ExtendedUserRequest } from './UserRequestComponent';

const UserControlPage: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    // States
    const [tabValue, setTabValue] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);

    const [notification, setNotification] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error' | 'info' | 'warning';
    }>({
        open: false,
        message: '',
        severity: 'info'
    });    // Handle tab change
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    // Handle closing notification
    const handleCloseNotification = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };    // Common user click handler - memoized to prevent unnecessary re-renders
    const handleUserClick = useCallback((user: UserInfo | ExtendedUserRequest) => {
        console.log('User clicked:', user);
        // Don't show notification to prevent re-renders that cause card reloads
        // setNotification({
        //     open: true,
        //     message: `User ${user.name} ${user.surname} clicked`,
        //     severity: 'info'
        // });
    }, []);

    // Common user change handler - memoized to prevent unnecessary re-renders
    const handleUserChange = useCallback((users: (UserInfo | ExtendedUserRequest)[]) => {
        console.log('Users changed:', users.length);
    }, []);// Wrapper functions for UserControlSearch - memoized to prevent unnecessary re-renders
    const getUserRequestsPaginated = useCallback((page: number) => getAllUserRequestsPaginated(page), []);
    
    const getUsersPaginatedWithoutGroups = useCallback((page: number) => getAllUsersPaginated(page, 'without group'), []);
    const searchUsersWithoutGroups = useCallback((searchQuery: string) => searchUsersControlPage(searchQuery, 'without group'), []);
    
    const getUsersPaginatedActive = useCallback((page: number) => getAllUsersPaginated(page, 'active'), []);
    const searchUsersActive = useCallback((searchQuery: string) => searchUsersControlPage(searchQuery, 'active'), []);
    
    const getUsersPaginatedInactive = useCallback((page: number) => getAllUsersPaginated(page, 'inactive'), []);
    const searchUsersInactive = useCallback((searchQuery: string) => searchUsersControlPage(searchQuery, 'inactive'), []);return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            <Paper
                elevation={0}
                sx={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                    mb: 3
                }}
            >
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    sx={{
                        '& .MuiTabs-indicator': {
                            height: 3,
                            borderRadius: '3px 3px 0 0'
                        },
                        '& .MuiTab-root': {
                            fontWeight: 600,
                            py: 1.5,
                            fontSize: isMobile ? '0.8rem' : '0.875rem'
                        }
                    }}
                >
                    <Tab label="Запити" />
                    <Tab label="Користувачі без груп" />
                    <Tab label="Активні користувачі" />
                    <Tab label="Деактивовані користувачі" />
                </Tabs>
            </Paper>

            {error && (
                <Typography
                    color="error"
                    sx={{
                        textAlign: 'center',
                        my: 4,
                        p: 2,
                        bgcolor: alpha(theme.palette.error.main, 0.05),
                        borderRadius: 2
                    }}
                >
                    {error}
                </Typography>
            )}            {/* User Requests Tab */}
            <Box sx={{ display: tabValue === 0 ? 'block' : 'none' }}>
                <UserControlSearch
                    onClick={handleUserClick}
                    onUserChange={handleUserChange}
                    retrieveUsersPaginated={getUserRequestsPaginated}
                    searchPlaceholder="Пошук запитів..."
                    mode="requests"
                />
            </Box>{/* Users Without Groups Tab */}
            <Box sx={{ display: tabValue === 1 ? 'block' : 'none' }}>
                <UserControlSearch
                    onClick={handleUserClick}
                    onUserChange={handleUserChange}
                    retrieveUsersPaginated={getUsersPaginatedWithoutGroups}
                    onSearch={searchUsersWithoutGroups}
                    searchPlaceholder="Пошук користувачів без груп..."
                    mode="without group"
                />
            </Box>

            {/* Active Users Tab */}
            <Box sx={{ display: tabValue === 2 ? 'block' : 'none' }}>
                <UserControlSearch
                    onClick={handleUserClick}
                    onUserChange={handleUserChange}
                    retrieveUsersPaginated={getUsersPaginatedActive}
                    onSearch={searchUsersActive}
                    searchPlaceholder="Пошук активних користувачів..."
                    mode="active"
                />
            </Box>

            {/* Deactivated Users Tab */}
            <Box sx={{ display: tabValue === 3 ? 'block' : 'none' }}>
                <UserControlSearch
                    onClick={handleUserClick}
                    onUserChange={handleUserChange}
                    retrieveUsersPaginated={getUsersPaginatedInactive}
                    onSearch={searchUsersInactive}
                    searchPlaceholder="Пошук деактивованих користувачів..."
                    mode="inactive"
                />
            </Box>

            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default UserControlPage;