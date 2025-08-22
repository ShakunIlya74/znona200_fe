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
import UserRequestSearch from './UserRequestSearch';
import AddUsersTab from './AddUsersTab';
import { getAllUsersPaginated, searchUsersControlPage, UserInfo, getAllUserRequestsPaginated, UserRequest, searchUserRequests } from '../../services/UserService';


const UserControlPage: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isMedium = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    // Dynamic header offset based on screen size (align with MinilectionsPage)
    const HEADER_OFFSET = isMobile ? 50 : isMedium ? 70 : 100;
    
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
    const handleUserClick = useCallback((user: UserInfo | UserRequest) => {
        console.log('User clicked:', user);
        // Don't show notification to prevent re-renders that cause card reloads
        // setNotification({
        //     open: true,
        //     message: `User ${user.name} ${user.surname} clicked`,
        //     severity: 'info'
        // });
    }, []);

    // Common user change handler - memoized to prevent unnecessary re-renders
    const handleUserChange = useCallback((users: (UserInfo | UserRequest)[]) => {
        console.log('Users changed:', users.length);
    }, []);

    // Wrapper for requests to match UserInfo | UserRequest type
    const handleRequestChange = useCallback((requests: UserRequest[]) => {
        handleUserChange(requests);
    }, [handleUserChange]);    // Wrapper functions for UserControlSearch - memoized to prevent unnecessary re-renders
    const getUserRequestsPaginated = useCallback((page: number) => getAllUserRequestsPaginated(page), []);
    
    const getUsersPaginatedWithoutGroups = useCallback((page: number) => getAllUsersPaginated(page, 'without group'), []);
    const searchUsersWithoutGroups = useCallback((searchQuery: string) => searchUsersControlPage(searchQuery, 'without group'), []);
    
    const getUsersPaginatedActive = useCallback((page: number) => getAllUsersPaginated(page, 'active'), []);
    const searchUsersActive = useCallback((searchQuery: string) => searchUsersControlPage(searchQuery, 'active'), []);
    
    const getUsersPaginatedInactive = useCallback((page: number) => getAllUsersPaginated(page, 'inactive'), []);
    const searchUsersInactive = useCallback((searchQuery: string) => searchUsersControlPage(searchQuery, 'inactive'), []);

    return (
        <Container
            maxWidth="lg"
            sx={{ 
                py: 1,
                // Counteract the layout wrapper's bottom padding to prevent extra scroll
                mb: { xs: -5, md: -10 }
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    position: 'sticky',
                    top: HEADER_OFFSET,
                    zIndex: 3,
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                    mb: 3
                }}
            >
                {isMobile ? (
                    // Mobile: Two row layout
                    <Box>
                        {/* First row: Main tabs */}
                        <Tabs
                            value={tabValue > 3 ? false : tabValue}
                            onChange={handleTabChange}
                            variant="fullWidth"
                            sx={{
                                '& .MuiTabs-indicator': {
                                    height: 3,
                                    borderRadius: '3px 3px 0 0'
                                },
                                '& .MuiTab-root': {
                                    fontWeight: 600,
                                    py: 1,
                                    fontSize: '0.75rem',
                                    minHeight: 40
                                }
                            }}
                        >
                            <Tab label="Запити" />
                            <Tab label="Без груп" />
                            <Tab label="Активні" />
                            <Tab label="Деактивовані" />
                        </Tabs>
                        
                        {/* Second row: Add button */}
                        <Box 
                            sx={{ 
                                borderTop: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                                bgcolor: tabValue === 4 ? alpha(theme.palette.primary.main, 0.1) : 'transparent'
                            }}
                        >
                            <Tab 
                                label="+ Додати користувачів" 
                                onClick={() => handleTabChange({} as React.SyntheticEvent, 4)}
                                sx={{
                                    width: '100%',
                                    fontWeight: 600,
                                    py: 1,
                                    fontSize: '0.75rem',
                                    minHeight: 40,
                                    color: tabValue === 4 ? 'primary.main' : 'text.secondary',
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                                    }
                                }}
                            />
                        </Box>
                    </Box>
                ) : (
                    // Desktop: Single row layout (original)
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
                                fontSize: '0.875rem'
                            }
                        }}
                    >
                        <Tab label="Запити" />
                        <Tab label="Користувачі без груп" />
                        <Tab label="Активні користувачі" />
                        <Tab label="Деактивовані користувачі" />
                        <Tab label="+ Додати користувачів" />
                    </Tabs>
                )}
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
                <UserRequestSearch
                    onClick={handleUserClick}
                    onUserChange={handleRequestChange}
                    retrieveUsersPaginated={getUserRequestsPaginated}
                    searchPlaceholder="Пошук запитів..."
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

            {/* Add Users Tab */}
            <Box sx={{ display: tabValue === 4 ? 'block' : 'none' }}>
                <AddUsersTab />
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