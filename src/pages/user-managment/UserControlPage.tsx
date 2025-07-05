import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Container,
    Card,
    CardContent,
    CardActionArea,
    Tabs,
    Tab,
    Paper,
    Divider,
    Chip,
    alpha,
    Snackbar,
    Alert
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import PersonIcon from '@mui/icons-material/Person';
import PendingIcon from '@mui/icons-material/Pending';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import LoadingDots from '../../components/tools/LoadingDots';
import UserControlSearch from './UserControlSearch';
import { getAllUsersPaginated, searchUsers, UserInfo } from '../../services/UserService';

interface User {
    user_id: number;
    name: string;
    surname: string;
    email: string;
    phone?: string;
    is_active: boolean;
    registration_date?: string;
    last_login?: string;
}

interface UserRequest {
    request_id: number;
    name: string;
    surname: string;
    email: string;
    phone?: string;
    request_date: string;
    status: 'pending' | 'approved' | 'rejected';
}

const UserControlPage: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));    // States
    const [userRequests, setUserRequests] = useState<UserRequest[]>([]);
    const [usersWithoutGroups, setUsersWithoutGroups] = useState<User[]>([]);
    const [deactivatedUsers, setDeactivatedUsers] = useState<User[]>([]);
    
    const [tabValue, setTabValue] = useState<number>(0);
    const [loadingStates, setLoadingStates] = useState({
        requests: true,
        withoutGroups: false,
        deactivated: false
    });
    const [error, setError] = useState<string | null>(null);
    const [tabsClicked, setTabsClicked] = useState({
        requests: false,
        withoutGroups: false,
        deactivated: false
    });

    const [notification, setNotification] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error' | 'info' | 'warning';
    }>({
        open: false,
        message: '',
        severity: 'info'
    });

    // Handle tab change
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    // Load user requests on initial render
    useEffect(() => {
        const fetchUserRequests = async () => {
            setLoadingStates(prev => ({ ...prev, requests: true }));
            try {
                // TODO: Replace with actual API call
                // const response = await getUserRequests();
                // Mock data for now
                setTimeout(() => {
                    setUserRequests([
                        {
                            request_id: 1,
                            name: 'John',
                            surname: 'Doe',
                            email: 'john.doe@example.com',
                            phone: '+380123456789',
                            request_date: '2024-01-15',
                            status: 'pending'
                        },
                        {
                            request_id: 2,
                            name: 'Jane',
                            surname: 'Smith',
                            email: 'jane.smith@example.com',
                            request_date: '2024-01-16',
                            status: 'pending'
                        }
                    ]);
                    setLoadingStates(prev => ({ ...prev, requests: false }));
                    setTabsClicked(prev => ({ ...prev, requests: true }));
                }, 1000);
            } catch (err) {
                console.error(err);
                setError('An error occurred while loading user requests');
                setLoadingStates(prev => ({ ...prev, requests: false }));
            }
        };

        fetchUserRequests();
    }, []);

    // Load data for other tabs when clicked
    useEffect(() => {
        const loadTabData = async () => {
            if (tabValue === 1 && !tabsClicked.withoutGroups) {
                setLoadingStates(prev => ({ ...prev, withoutGroups: true }));
                try {
                    // TODO: Replace with actual API call
                    // const response = await getUsersWithoutGroups();
                    setTimeout(() => {
                        setUsersWithoutGroups([
                            {
                                user_id: 1,
                                name: 'Alice',
                                surname: 'Johnson',
                                email: 'alice.johnson@example.com',
                                is_active: true,
                                registration_date: '2024-01-10'
                            },
                            {
                                user_id: 2,
                                name: 'Bob',
                                surname: 'Wilson',
                                email: 'bob.wilson@example.com',
                                is_active: true,
                                registration_date: '2024-01-12'
                            }
                        ]);
                        setLoadingStates(prev => ({ ...prev, withoutGroups: false }));
                        setTabsClicked(prev => ({ ...prev, withoutGroups: true }));
                    }, 1000);                } catch (err) {
                    console.error(err);
                    setError('An error occurred while loading users without groups');
                    setLoadingStates(prev => ({ ...prev, withoutGroups: false }));
                }
            } else if (tabValue === 3 && !tabsClicked.deactivated) {
                setLoadingStates(prev => ({ ...prev, deactivated: true }));
                try {
                    // TODO: Replace with actual API call
                    // const response = await getDeactivatedUsers();
                    setTimeout(() => {
                        setDeactivatedUsers([
                            {
                                user_id: 5,
                                name: 'Eva',
                                surname: 'Miller',
                                email: 'eva.miller@example.com',
                                is_active: false,
                                registration_date: '2023-12-15',
                                last_login: '2024-01-01'
                            }
                        ]);
                        setLoadingStates(prev => ({ ...prev, deactivated: false }));
                        setTabsClicked(prev => ({ ...prev, deactivated: true }));
                    }, 1000);
                } catch (err) {
                    console.error(err);
                    setError('An error occurred while loading deactivated users');
                    setLoadingStates(prev => ({ ...prev, deactivated: false }));
                }
            }
        };

        loadTabData();
    }, [tabValue, tabsClicked]);

    // Format date string
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Handle closing notification
    const handleCloseNotification = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

    // Render user request cards
    const renderUserRequestCards = (requests: UserRequest[]) => {
        return (
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {requests.map((request) => (
                    <Card
                        key={request.request_id}
                        sx={{
                            borderRadius: '16px',
                            boxShadow: `0px 1px 3px ${alpha(theme.palette.common.black, 0.05)}`,
                            border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                boxShadow: `0px 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
                                transform: 'translateY(-2px)'
                            }
                        }}
                    >
                        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <PendingIcon sx={{ color: theme.palette.warning.main }} />
                                <Typography variant="h6" component="h3">
                                    {request.name} {request.surname}
                                </Typography>
                                <Chip
                                    label={request.status}
                                    color="warning"
                                    size="small"
                                    sx={{ ml: 'auto' }}
                                />
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Email:</strong> {request.email}
                                </Typography>
                                {request.phone && (
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Phone:</strong> {request.phone}
                                    </Typography>
                                )}
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Request Date:</strong> {formatDate(request.request_date)}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        );
    };

    // Render user cards
    const renderUserCards = (users: User[], iconType: 'withoutGroups' | 'active' | 'deactivated') => {        const getIcon = () => {
            switch (iconType) {
                case 'withoutGroups':
                    return <GroupIcon sx={{ color: theme.palette.info.main }} />;
                case 'active':
                    return <CheckCircleIcon sx={{ color: theme.palette.success.main }} />;
                case 'deactivated':
                    return <BlockIcon sx={{ color: theme.palette.error.main }} />;
                default:
                    return <PersonIcon />;
            }
        };

        const getChipColor = () => {
            switch (iconType) {
                case 'withoutGroups':
                    return 'info';
                case 'active':
                    return 'success';
                case 'deactivated':
                    return 'error';
                default:
                    return 'default';
            }
        };

        return (
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {users.map((user) => (
                    <Card
                        key={user.user_id}
                        sx={{
                            borderRadius: '16px',
                            boxShadow: `0px 1px 3px ${alpha(theme.palette.common.black, 0.05)}`,
                            border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                boxShadow: `0px 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
                                transform: 'translateY(-2px)'
                            }
                        }}
                    >
                        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                {getIcon()}
                                <Typography variant="h6" component="h3">
                                    {user.name} {user.surname}
                                </Typography>
                                <Chip
                                    label={user.is_active ? 'Active' : 'Deactivated'}
                                    color={getChipColor() as any}
                                    size="small"
                                    sx={{ ml: 'auto' }}
                                />
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Email:</strong> {user.email}
                                </Typography>
                                {user.phone && (
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Phone:</strong> {user.phone}
                                    </Typography>
                                )}
                                {user.registration_date && (
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Registration Date:</strong> {formatDate(user.registration_date)}
                                    </Typography>
                                )}
                                {user.last_login && (
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Last Login:</strong> {formatDate(user.last_login)}
                                    </Typography>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        );
    };

    return (
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
                    <Tab label="User Requests" />
                    <Tab label="Users Without Groups" />
                    <Tab label="Active Users" />
                    <Tab label="Deactivated Users" />
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
            )}

            {/* User Requests Tab */}
            <Box sx={{ display: tabValue === 0 ? 'block' : 'none' }}>
                {loadingStates.requests ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <LoadingDots />
                    </Box>
                ) : userRequests.length > 0 ? (
                    renderUserRequestCards(userRequests)
                ) : (
                    <Typography
                        sx={{
                            textAlign: 'center',
                            py: 6,
                            color: theme.palette.text.secondary
                        }}
                    >
                        No user requests available.
                    </Typography>
                )}
            </Box>

            {/* Users Without Groups Tab */}
            <Box sx={{ display: tabValue === 1 ? 'block' : 'none' }}>
                {loadingStates.withoutGroups ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <LoadingDots />
                    </Box>
                ) : usersWithoutGroups.length > 0 ? (
                    renderUserCards(usersWithoutGroups, 'withoutGroups')
                ) : (
                    <Typography
                        sx={{
                            textAlign: 'center',
                            py: 6,
                            color: theme.palette.text.secondary
                        }}
                    >
                        {tabsClicked.withoutGroups ? 'No users without groups available.' : ''}
                    </Typography>
                )}
            </Box>            {/* Active Users Tab */}
            <Box sx={{ display: tabValue === 2 ? 'block' : 'none' }}>
                <UserControlSearch
                    onClick={(user: UserInfo) => {
                        console.log('User clicked:', user);
                        // TODO: Implement user click handler (e.g., show user details, edit user, etc.)
                        setNotification({
                            open: true,
                            message: `User ${user.name} ${user.surname} clicked`,
                            severity: 'info'
                        });
                    }}
                    onUserChange={(users: UserInfo[]) => {
                        console.log('Users changed:', users.length);
                        // Optional: Update any local state if needed
                    }}
                    retrieveUsersPaginated={getAllUsersPaginated}
                    onSearch={searchUsers}
                    searchPlaceholder="Пошук активних користувачів..."
                />
            </Box>

            {/* Deactivated Users Tab */}
            <Box sx={{ display: tabValue === 3 ? 'block' : 'none' }}>
                {loadingStates.deactivated ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <LoadingDots />
                    </Box>
                ) : deactivatedUsers.length > 0 ? (
                    renderUserCards(deactivatedUsers, 'deactivated')
                ) : (
                    <Typography
                        sx={{
                            textAlign: 'center',
                            py: 6,
                            color: theme.palette.text.secondary
                        }}
                    >
                        {tabsClicked.deactivated ? 'No deactivated users available.' : ''}
                    </Typography>
                )}
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