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
    CircularProgress,
    Collapse
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import EventIcon from '@mui/icons-material/Event';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { getUserGroups, getInactiveUserGroups, getUserGroupInfo } from '../../services/UserService';
import LoadingDots from '../../components/tools/LoadingDots';

// Define user group interface
interface UserGroup {
    group_id: number;
    group_name: string;
    open_date: string;
    close_date: string;
    is_active: boolean;
}

// Define API response interfaces
interface UserGroupsResponse {
    success: boolean;
    active_user_groups?: UserGroup[];
    is_admin?: boolean;
}

interface InactiveGroupsResponse {
    success: boolean;
    inactive_user_groups?: UserGroup[];
}

interface GroupInfoResponse {
    success: boolean;
    user_group_dict?: {
        group_name: string;
        group_id: number | string;
        user_count: number;
    };
    message?: string;
}

const UserGroupsPage: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isMedium = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    // States
    const [activeGroups, setActiveGroups] = useState<UserGroup[]>([]);
    const [inactiveGroups, setInactiveGroups] = useState<UserGroup[]>([]);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [activeLoading, setActiveLoading] = useState<boolean>(true);
    const [inactiveLoading, setInactiveLoading] = useState<boolean>(false);
    const [tabValue, setTabValue] = useState<number>(0);
    const [inactiveTabClicked, setInactiveTabClicked] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedGroupId, setExpandedGroupId] = useState<number | null>(null);
    const [groupInfo, setGroupInfo] = useState<{ [key: number]: { userCount: number, loading: boolean } }>({});

    // Reset expanded group when changing tabs
    useEffect(() => {
        setExpandedGroupId(null);
    }, [tabValue]);

    // Load active groups on initial render
    useEffect(() => {
        const fetchActiveGroups = async () => {
            setActiveLoading(true);
            try {
                const response = await getUserGroups() as UserGroupsResponse;
                if (response.success && response.active_user_groups) {
                    setActiveGroups(response.active_user_groups);
                    setIsAdmin(response.is_admin || false);
                } else {
                    setError('Failed to load active groups');
                }
            } catch (err) {
                console.error(err);
                setError('An error occurred while loading active groups');
            } finally {
                setActiveLoading(false);
            }
        };

        fetchActiveGroups();
    }, []);

    // Load inactive groups when inactive tab is clicked
    useEffect(() => {
        if (tabValue === 1 && !inactiveTabClicked) {
            const fetchInactiveGroups = async () => {
                setInactiveTabClicked(true);
                setInactiveLoading(true);
                try {
                    const response = await getInactiveUserGroups() as InactiveGroupsResponse;
                    if (response.success && response.inactive_user_groups) {
                        setInactiveGroups(response.inactive_user_groups);
                    } else {
                        setError('Failed to load inactive groups');
                    }
                } catch (err) {
                    console.error(err);
                    setError('An error occurred while loading inactive groups');
                } finally {
                    setInactiveLoading(false);
                }
            };

            fetchInactiveGroups();
        }
    }, [tabValue, inactiveTabClicked]);

    // Handle tab change
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    // Format date string to a more readable format
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Handle group card click
    const handleGroupClick = (group: UserGroup) => {
        console.log(`Group clicked: ${group.group_name} (ID: ${group.group_id})`);
        // Toggle expanded state
        setExpandedGroupId(expandedGroupId === group.group_id ? null : group.group_id);

        // Fetch group info if not already loaded
        if (!groupInfo[group.group_id]) {
            setGroupInfo((prev) => ({
                ...prev,
                [group.group_id]: { userCount: 0, loading: true }
            }));

            const fetchGroupInfo = async () => {
                try {
                    const response = await getUserGroupInfo(group.group_id) as GroupInfoResponse;
                    if (response.success && response.user_group_dict) {
                        setGroupInfo((prev) => ({
                            ...prev,
                            [group.group_id]: {
                                userCount: response.user_group_dict?.user_count || 0,
                                loading: false
                            }
                        }));
                    } else {
                        setGroupInfo((prev) => ({
                            ...prev,
                            [group.group_id]: { userCount: 0, loading: false }
                        }));
                    }
                } catch (err) {
                    console.error(err);
                    setGroupInfo((prev) => ({
                        ...prev,
                        [group.group_id]: { userCount: 0, loading: false }
                    }));
                }
            };

            fetchGroupInfo();
        }
    };

    // Render group cards
    const renderGroupCards = (groups: UserGroup[]) => {
        return (
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {groups.map((group) => (
                    <Box key={group.group_id}>
                        <Card
                            sx={{
                                borderRadius: '16px',
                                boxShadow: `0px 1px 3px ${alpha(theme.palette.common.black, 0.05)}`,
                                border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                                transition: 'all 0.2s ease-in-out',
                                width: '100%',
                                '&:hover': expandedGroupId === group.group_id ? {} : {
                                    boxShadow: `0px 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
                                    transform: 'translateY(-2px)'
                                }
                            }}
                        >
                            <CardActionArea
                                onClick={() => handleGroupClick(group)}
                                sx={{
                                    width: '100%',
                                    p: 0
                                }}
                            >
                                <CardContent sx={{ width: '100%', pb: 2 }}>
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        alignItems: { xs: 'flex-start', sm: 'center' },
                                        width: '100%'
                                    }}>
                                        {/* Group Name */}
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            width: { xs: '100%', sm: '40%', md: '40%' },
                                            mb: { xs: 1, sm: 0 }
                                        }}>
                                            <GroupIcon color="primary" sx={{ opacity: 0.7, flexShrink: 0 }} />
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: 600,
                                                    fontSize: '1.1rem',
                                                    color: theme.palette.text.primary,
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}
                                            >
                                                {group.group_name}
                                            </Typography>
                                        </Box>

                                        <Box sx={{
                                            display: 'flex',
                                            flexDirection: { xs: 'column', sm: 'row' },
                                            width: { xs: '100%', sm: '60%' },
                                            gap: { xs: 1, sm: 1 }
                                        }}>
                                            {/* Open Date */}
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                width: { xs: '100%', md: '33.3%' },
                                                mb: { xs: 1, md: 0 }
                                            }}>
                                                <EventIcon fontSize="small" sx={{ color: theme.palette.success.main, opacity: 0.8 }} />
                                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                                    Початок: {formatDate(group.open_date)}
                                                </Typography>
                                            </Box>

                                            {/* Close Date */}
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                width: { xs: '100%', md: '33.3%' },
                                                mb: { xs: 1, md: 0 }
                                            }}>
                                                <EventBusyIcon fontSize="small" sx={{ color: theme.palette.error.main, opacity: 0.8 }} />
                                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                                    Кінець: {formatDate(group.close_date)}
                                                </Typography>
                                            </Box>

                                            {/* Status Chip */}
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: { xs: 'flex-start', md: 'flex-end' },
                                                width: { xs: '100%', md: '33.3%' }
                                            }}>
                                                <Chip
                                                    label={group.is_active ? "Активна" : "Не активна"}
                                                    size="small"
                                                    color={group.is_active ? "success" : "default"}
                                                    sx={{
                                                        fontWeight: 500,
                                                        fontSize: '0.75rem'
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </CardActionArea>
                        </Card>

                        {/* Expanded details section */}
                        <Collapse in={expandedGroupId === group.group_id} timeout="auto" unmountOnExit>
                            <Paper
                                elevation={0}
                                sx={{
                                    ml: 2,
                                    mr: 2,
                                    mb: 2,
                                    p: 3,
                                    borderRadius: '0 0 12px 12px',
                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                    backgroundColor: 'white',
                                    boxShadow: `0px 2px 8px ${alpha(theme.palette.common.black, 0.05)}`
                                }}
                            >

                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', md: 'row' },
                                    gap: 3
                                }}>
                                    <Box sx={{ flex: '1 1 50%' }}>
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 0.5 }}>
                                                Кількість учнів: {groupInfo[group.group_id]?.loading ? (
                                                    <CircularProgress size={16} />
                                                ) : (
                                                    groupInfo[group.group_id]?.userCount || 'N/A'
                                                )}

                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ flex: '1 1 50%' }}>
                                    </Box>
                                </Box>
                            </Paper>
                        </Collapse>
                    </Box>
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
                            py: 1.5
                        }
                    }}
                >
                    <Tab label="Активні групи" />
                    <Tab label="Деактивовані групи" />
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

            <Box sx={{ display: tabValue === 0 ? 'block' : 'none' }}>
                {activeLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <LoadingDots />
                    </Box>
                ) : activeGroups.length > 0 ? (
                    renderGroupCards(activeGroups)
                ) : (
                    <Typography
                        sx={{
                            textAlign: 'center',
                            py: 6,
                            color: theme.palette.text.secondary
                        }}
                    >
                        No active groups available.
                    </Typography>
                )}
            </Box>

            <Box sx={{ display: tabValue === 1 ? 'block' : 'none' }}>
                {inactiveLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <LoadingDots />
                    </Box>
                ) : inactiveGroups.length > 0 ? (
                    renderGroupCards(inactiveGroups)
                ) : (
                    <Typography
                        sx={{
                            textAlign: 'center',
                            py: 6,
                            color: theme.palette.text.secondary
                        }}
                    >
                        {inactiveTabClicked ? 'No inactive groups available.' : ''}
                    </Typography>
                )}
            </Box>
        </Container>
    );
};

export default UserGroupsPage;