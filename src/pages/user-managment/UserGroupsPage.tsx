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
    Collapse,
    TextField,
    IconButton,
    Tooltip,
    Snackbar,
    Alert,
    Button
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import GroupIcon from '@mui/icons-material/Group';
import EventIcon from '@mui/icons-material/Event';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
    getUserGroups,
    getInactiveUserGroups,
    getUserGroupInfo,
    updateGroupName,
    updateGroupOpenDate,
    updateGroupCloseDate,
    toggleGroupActivation
} from '../../services/UserService';
import LoadingDots from '../../components/tools/LoadingDots';
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

    // States for editing group name
    const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
    const [editedGroupName, setEditedGroupName] = useState<string>('');
    const [isUpdatingName, setIsUpdatingName] = useState<boolean>(false);

    // States for editing dates
    const [editingOpenDate, setEditingOpenDate] = useState<number | null>(null);
    const [editingCloseDate, setEditingCloseDate] = useState<number | null>(null);
    const [selectedOpenDate, setSelectedOpenDate] = useState<Date | null>(null);
    const [selectedCloseDate, setSelectedCloseDate] = useState<Date | null>(null);
    const [isUpdatingOpenDate, setIsUpdatingOpenDate] = useState(false);
    const [isUpdatingCloseDate, setIsUpdatingCloseDate] = useState(false);

    // States for activation/deactivation
    const [confirmingActivation, setConfirmingActivation] = useState<number | null>(null);
    const [isUpdatingActivation, setIsUpdatingActivation] = useState(false);

    const [notification, setNotification] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error' | 'info' | 'warning';
    }>({
        open: false,
        message: '',
        severity: 'info'
    });

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

    // Check if a date is in the past
    const isDatePassed = (dateString: string): boolean => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to beginning of day for accurate comparison
        const compareDate = new Date(dateString);
        compareDate.setHours(0, 0, 0, 0);
        return compareDate < today;
    };

    // Handle group card click
    const handleGroupClick = (group: UserGroup) => {
        console.log(`Group clicked: ${group.group_name} (ID: ${group.group_id})`);

        // If currently editing, don't toggle expansion
        if (editingGroupId === group.group_id) {
            return;
        }

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

    // Start editing group name
    const handleStartEditing = (group: UserGroup, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card expansion when clicking edit
        setEditingGroupId(group.group_id);
        setEditedGroupName(group.group_name);
    };

    // Cancel editing
    const handleCancelEditing = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent event bubbling
        setEditingGroupId(null);
        setEditedGroupName('');
    };

    // Save edited group name
    const handleSaveGroupName = async (groupId: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent event bubbling

        if (!editedGroupName.trim()) {
            setNotification({
                open: true,
                message: "Назва групи не може бути порожньою",
                severity: "error"
            });
            return;
        }

        setIsUpdatingName(true);
        try {
            const response = await updateGroupName(groupId, editedGroupName);

            if (response.success) {
                // Update local state to reflect the change
                if (tabValue === 0) {
                    setActiveGroups(groups =>
                        groups.map(group =>
                            group.group_id === groupId
                                ? { ...group, group_name: editedGroupName }
                                : group
                        )
                    );
                } else {
                    setInactiveGroups(groups =>
                        groups.map(group =>
                            group.group_id === groupId
                                ? { ...group, group_name: editedGroupName }
                                : group
                        )
                    );
                }

                setNotification({
                    open: true,
                    message: "Назву групи успішно оновлено",
                    severity: "success"
                });
            } else {
                setNotification({
                    open: true,
                    message: response.message || "Помилка при оновленні назви групи",
                    severity: "error"
                });
            }
        } catch (err) {
            console.error(err);
            setNotification({
                open: true,
                message: "Помилка при оновленні назви групи",
                severity: "error"
            });
        } finally {
            setIsUpdatingName(false);
            setEditingGroupId(null);
        }
    };

    // Start editing open date
    const handleStartEditingOpenDate = (group: UserGroup, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingOpenDate(group.group_id);
        setSelectedOpenDate(new Date(group.open_date));
    };

    // Start editing close date
    const handleStartEditingCloseDate = (group: UserGroup, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingCloseDate(group.group_id);
        setSelectedCloseDate(new Date(group.close_date));
    };

    // Cancel editing open date
    const handleCancelEditingOpenDate = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingOpenDate(null);
        setSelectedOpenDate(null);
    };

    // Cancel editing close date
    const handleCancelEditingCloseDate = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingCloseDate(null);
        setSelectedCloseDate(null);
    };

    // Format date for API submission (YYYY-MM-DD)
    const formatDateForApi = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    // Save edited open date
    const handleSaveOpenDate = async (groupId: number, e: React.MouseEvent) => {
        e.stopPropagation();

        if (!selectedOpenDate) {
            setNotification({
                open: true,
                message: "Будь ласка, виберіть дату початку",
                severity: "error"
            });
            return;
        }

        setIsUpdatingOpenDate(true);
        try {
            const formattedDate = formatDateForApi(selectedOpenDate);
            const response = await updateGroupOpenDate(groupId, formattedDate);

            if (response.success) {
                // Update local state to reflect the change
                if (tabValue === 0) {
                    setActiveGroups(groups =>
                        groups.map(group =>
                            group.group_id === groupId
                                ? { ...group, open_date: formattedDate }
                                : group
                        )
                    );
                } else {
                    setInactiveGroups(groups =>
                        groups.map(group =>
                            group.group_id === groupId
                                ? { ...group, open_date: formattedDate }
                                : group
                        )
                    );
                }

                setNotification({
                    open: true,
                    message: "Дату початку успішно оновлено",
                    severity: "success"
                });
            } else {
                setNotification({
                    open: true,
                    message: response.message || "Помилка при оновленні дати початку",
                    severity: "error"
                });
            }
        } catch (err) {
            console.error(err);
            setNotification({
                open: true,
                message: "Помилка при оновленні дати початку",
                severity: "error"
            });
        } finally {
            setIsUpdatingOpenDate(false);
            setEditingOpenDate(null);
            setSelectedOpenDate(null);
        }
    };

    // Save edited close date
    const handleSaveCloseDate = async (groupId: number, e: React.MouseEvent) => {
        e.stopPropagation();

        if (!selectedCloseDate) {
            setNotification({
                open: true,
                message: "Будь ласка, виберіть дату закінчення",
                severity: "error"
            });
            return;
        }

        setIsUpdatingCloseDate(true);
        try {
            const formattedDate = formatDateForApi(selectedCloseDate);
            const response = await updateGroupCloseDate(groupId, formattedDate);

            if (response.success) {
                // Update local state to reflect the change
                if (tabValue === 0) {
                    setActiveGroups(groups =>
                        groups.map(group =>
                            group.group_id === groupId
                                ? { ...group, close_date: formattedDate }
                                : group
                        )
                    );
                } else {
                    setInactiveGroups(groups =>
                        groups.map(group =>
                            group.group_id === groupId
                                ? { ...group, close_date: formattedDate }
                                : group
                        )
                    );
                }

                setNotification({
                    open: true,
                    message: "Дату закінчення успішно оновлено",
                    severity: "success"
                });
            } else {
                setNotification({
                    open: true,
                    message: response.message || "Помилка при оновленні дати закінчення",
                    severity: "error"
                });
            }
        } catch (err) {
            console.error(err);
            setNotification({
                open: true,
                message: "Помилка при оновленні дати закінчення",
                severity: "error"
            });
        } finally {
            setIsUpdatingCloseDate(false);
            setEditingCloseDate(null);
            setSelectedCloseDate(null);
        }
    };

    // Toggle activation/deactivation
    const handleToggleActivation = async (groupId: number, activate: boolean, e: React.MouseEvent) => {
        e.stopPropagation();
        setIsUpdatingActivation(true);
        try {
            const response = await toggleGroupActivation(groupId, activate);
            if (response.success) {
                // Update local state to reflect the change
                if (activate) {
                    // Moving from inactive to active
                    if (tabValue === 1) {
                        // If we're in the inactive tab, remove from inactive and add to active
                        setInactiveGroups(groups => groups.filter(group => group.group_id !== groupId));
                        setActiveGroups(groups => [...groups, { ...inactiveGroups.find(g => g.group_id === groupId)!, is_active: true }]);
                    } else {
                        // Just update the status if we're in the active tab
                        setActiveGroups(groups =>
                            groups.map(group =>
                                group.group_id === groupId
                                    ? { ...group, is_active: true }
                                    : group
                            )
                        );
                    }
                } else {
                    // Moving from active to inactive
                    if (tabValue === 0) {
                        // If we're in the active tab, remove from active and add to inactive
                        setActiveGroups(groups => groups.filter(group => group.group_id !== groupId));
                        setInactiveGroups(groups => [...groups, { ...activeGroups.find(g => g.group_id === groupId)!, is_active: false }]);
                    } else {
                        // Just update the status if we're in the inactive tab
                        setInactiveGroups(groups =>
                            groups.map(group =>
                                group.group_id === groupId
                                    ? { ...group, is_active: false }
                                    : group
                            )
                        );
                    }
                }

                setNotification({
                    open: true,
                    message: activate ? "Групу успішно активовано" : "Групу успішно деактивовано",
                    severity: "success"
                });
            } else {
                setNotification({
                    open: true,
                    message: response.message || "Помилка при зміні статусу групи",
                    severity: "error"
                });
            }
        } catch (err) {
            console.error(err);
            setNotification({
                open: true,
                message: "Помилка при зміні статусу групи",
                severity: "error"
            });
        } finally {
            setIsUpdatingActivation(false);
            setConfirmingActivation(null);
        }
    };

    // Handle closing notification
    const handleCloseNotification = () => {
        setNotification(prev => ({ ...prev, open: false }));
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
                                        {/* Group Name - Editable when expandedGroupId matches */}
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            width: { xs: '100%', sm: '40%', md: '40%' },
                                            mb: { xs: 1, sm: 0 }
                                        }}>
                                            <GroupIcon color="primary" sx={{ opacity: 0.7, flexShrink: 0 }} />

                                            {/* Conditional rendering based on edit state */}
                                            {editingGroupId === group.group_id ? (
                                                <Box
                                                    onClick={(e) => e.stopPropagation()}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        width: '100%'
                                                    }}
                                                >
                                                    <TextField
                                                        value={editedGroupName}
                                                        onChange={(e) => setEditedGroupName(e.target.value)}
                                                        variant="outlined"
                                                        size="small"
                                                        fullWidth
                                                        autoFocus
                                                        placeholder="Введіть назву групи"
                                                        onClick={(e) => e.stopPropagation()}
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: '8px',
                                                            }
                                                        }}
                                                        InputProps={{
                                                            endAdornment: (
                                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                                    <Tooltip title="Зберегти">
                                                                        <IconButton
                                                                            size="small"
                                                                            color="primary"
                                                                            onClick={(e) => handleSaveGroupName(group.group_id, e)}
                                                                            disabled={isUpdatingName}
                                                                            sx={{ padding: '4px' }}
                                                                        >
                                                                            {isUpdatingName ?
                                                                                <CircularProgress size={16} /> :
                                                                                <CheckIcon fontSize="small" sx={{ fontSize: '1.3rem' }} />
                                                                            }
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title="Скасувати">
                                                                        <IconButton
                                                                            size="small"
                                                                            color="default"
                                                                            onClick={handleCancelEditing}
                                                                            sx={{ padding: '4px' }}
                                                                        >
                                                                            <CloseIcon fontSize="small" sx={{ fontSize: '1.3rem' }} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Box>
                                                            )
                                                        }}
                                                    />
                                                </Box>
                                            ) : (
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    width: '100%'
                                                }}>
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
                                                    {expandedGroupId === group.group_id && (
                                                        <Tooltip title="Редагувати назву">
                                                            <IconButton
                                                                size="small"
                                                                onClick={(e) => handleStartEditing(group, e)}
                                                                sx={{ ml: 1 }}
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </Box>
                                            )}
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
                                                {editingOpenDate === group.group_id ? (
                                                    <Box
                                                        onClick={(e) => e.stopPropagation()}
                                                        sx={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: 1,
                                                            width: '100%'
                                                        }}
                                                    >
                                                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                            <DatePicker
                                                                label="Дата початку"
                                                                value={selectedOpenDate}
                                                                onChange={(newValue: React.SetStateAction<Date | null>) => setSelectedOpenDate(newValue)}
                                                                format="dd/MM/yyyy"
                                                                slotProps={{
                                                                    textField: {
                                                                        size: 'small',
                                                                        fullWidth: true,
                                                                        sx: {
                                                                            width: '100%',
                                                                            minWidth: { xs: '100%', md: '150px' }
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                        </LocalizationProvider>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <Tooltip title="Зберегти">
                                                                <IconButton
                                                                    size="small"
                                                                    color="primary"
                                                                    onClick={(e) => handleSaveOpenDate(group.group_id, e)}
                                                                    disabled={isUpdatingOpenDate}
                                                                    sx={{ padding: '4px' }}
                                                                >
                                                                    {isUpdatingOpenDate ?
                                                                        <CircularProgress size={16} /> :
                                                                        <CheckIcon fontSize="small" sx={{ fontSize: '1.3rem' }} />
                                                                    }
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Скасувати">
                                                                <IconButton
                                                                    size="small"
                                                                    color="default"
                                                                    onClick={handleCancelEditingOpenDate}
                                                                    sx={{ padding: '4px' }}
                                                                >
                                                                    <CloseIcon fontSize="small" sx={{ fontSize: '1.3rem' }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </Box>
                                                ) : (
                                                    <Box sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'flex-start',
                                                        gap: 1
                                                    }}>
                                                        <EventIcon fontSize="small" sx={{ color: theme.palette.success.main, opacity: 0.8 }} />
                                                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mr: 0.5 }}>
                                                            Початок: {formatDate(group.open_date)}
                                                        </Typography>
                                                        {expandedGroupId === group.group_id && (
                                                            <Tooltip title="Змінити дату початку">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={(e) => handleStartEditingOpenDate(group, e)}
                                                                    sx={{ p: 0.3, ml: 0, mr: 0 }}
                                                                >
                                                                    <EditIcon fontSize="small" sx={{ fontSize: '1.3rem' }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </Box>
                                                )}
                                            </Box>

                                            {/* Close Date */}
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                width: { xs: '100%', md: '33.3%' },
                                                mb: { xs: 1, md: 0 }
                                            }}>
                                                {editingCloseDate === group.group_id ? (
                                                    <Box
                                                        onClick={(e) => e.stopPropagation()}
                                                        sx={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: 1,
                                                            width: '100%'
                                                        }}
                                                    >
                                                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                            <DatePicker
                                                                label="Дата закінчення"
                                                                value={selectedCloseDate}
                                                                onChange={(newValue: React.SetStateAction<Date | null>) => setSelectedCloseDate(newValue)}
                                                                format="dd/MM/yyyy"
                                                                slotProps={{
                                                                    textField: {
                                                                        size: 'small',
                                                                        fullWidth: true,
                                                                        sx: {
                                                                            width: '100%',
                                                                            minWidth: { xs: '100%', md: '150px' }
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                        </LocalizationProvider>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <Tooltip title="Зберегти">
                                                                <IconButton
                                                                    size="small"
                                                                    color="primary"
                                                                    onClick={(e) => handleSaveCloseDate(group.group_id, e)}
                                                                    disabled={isUpdatingCloseDate}
                                                                    sx={{ padding: '4px' }}
                                                                >
                                                                    {isUpdatingCloseDate ?
                                                                        <CircularProgress size={16} /> :
                                                                        <CheckIcon fontSize="small" sx={{ fontSize: '1.3rem' }} />
                                                                    }
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Скасувати">
                                                                <IconButton
                                                                    size="small"
                                                                    color="default"
                                                                    onClick={handleCancelEditingCloseDate}
                                                                    sx={{ padding: '4px' }}
                                                                >
                                                                    <CloseIcon fontSize="small" sx={{ fontSize: '1.3rem' }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </Box>
                                                ) : (
                                                    <Box sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'flex-start',
                                                        gap: 1
                                                    }}>
                                                        <EventBusyIcon fontSize="small" sx={{ color: theme.palette.error.main, opacity: 0.8 }} />
                                                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mr: 0.5 }}>
                                                            Кінець: {formatDate(group.close_date)}
                                                        </Typography>
                                                        {expandedGroupId === group.group_id && (
                                                            <Tooltip title="Змінити дату закінчення">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={(e) => handleStartEditingCloseDate(group, e)}
                                                                    sx={{ p: 0.3, ml: 0, mr: 0 }}
                                                                >
                                                                    <EditIcon fontSize="small" sx={{ fontSize: '1.3rem' }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </Box>
                                                )}
                                            </Box>




                                            {/* Status Chip */}
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: { xs: 'flex-start', md: 'flex-end' },
                                                width: { xs: '100%', md: '33.3%' }
                                            }}>

                                                {/* Warning icon for active groups with passed close date */}
                                                {group.is_active && isDatePassed(group.close_date) && tabValue === 0 && (
                                                    <Tooltip title="Термін дії цієї групи закінчився. Рекомендується деактивувати групу.">
                                                        <WarningIcon
                                                            color="warning"
                                                            sx={{
                                                                opacity: 0.9,
                                                                flexShrink: 0,
                                                                fontSize: '1.4rem',
                                                                mr: 0.5
                                                            }}
                                                        />
                                                    </Tooltip>
                                                )}
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
                                    <Box sx={{ flex: '1 1 100%' }}>
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 0.5 }}>
                                                Кількість учнів: {groupInfo[group.group_id]?.loading ? (
                                                    <CircularProgress size={16} />
                                                ) : (
                                                    groupInfo[group.group_id]?.userCount || 'N/A'
                                                )}
                                            </Typography>
                                        </Box>

                                        {/* Activation/Deactivation controls */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                                            {confirmingActivation === group.group_id ? (
                                                // Confirmation UI
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                                        {group.is_active ? 'Деактивувати групу?' : 'Активувати групу?'}
                                                    </Typography>
                                                    <Tooltip title="Підтвердити">
                                                        <IconButton
                                                            size="small"
                                                            color="primary"
                                                            onClick={(e) => handleToggleActivation(group.group_id, !group.is_active, e)}
                                                            disabled={isUpdatingActivation}
                                                        >
                                                            {isUpdatingActivation ?
                                                                <CircularProgress size={16} /> :
                                                                <CheckIcon fontSize="small" />
                                                            }
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Скасувати">
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setConfirmingActivation(null);
                                                            }}
                                                        >
                                                            <CloseIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            ) : (
                                                // Toggle button
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    color={group.is_active ? "error" : "success"}
                                                    startIcon={group.is_active ? <BlockIcon /> : <CheckCircleIcon />}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setConfirmingActivation(group.group_id);
                                                    }}
                                                    sx={{ borderRadius: '8px' }}
                                                >
                                                    {group.is_active ? 'Деактивувати групу' : 'Активувати групу'}
                                                </Button>
                                            )}
                                        </Box>
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

export default UserGroupsPage;