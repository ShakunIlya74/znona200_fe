import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    TextField,
    Typography,
    Paper,
    Avatar,
    Chip,
    InputAdornment,
    CircularProgress,
    Divider,
    useTheme,
    alpha,
    Grid,
    Tooltip,
    IconButton,
    Snackbar,
    Alert,
    useMediaQuery
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import TelegramIcon from '@mui/icons-material/Telegram';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import { searchUsersInGroup, UserInfo, removeUserFromGroup, getGroupUsersPaginated, GroupUsersPaginatedResponse } from '../../services/UserService';
import LoadingDots from '../../components/tools/LoadingDots';
import { debounce } from 'lodash';

/**
 * CompactUserCard component displays user information in a compact, modern card layout
 */
interface CompactUserCardProps {
    user: UserInfo;
    groupId: string | number;
    index: number;
    onUserRemoved?: () => void;
    onRemoveUser?: (userId: number | string, groupId: number | string) => Promise<boolean>;
}

const CompactUserCard: React.FC<CompactUserCardProps> = ({ user, groupId, index, onUserRemoved, onRemoveUser }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [copySuccess, setCopySuccess] = useState<string | null>(null);
    const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    
    // Generate initials for the avatar
    const getInitials = (name: string, surname: string) => {
        return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
    };

    // Get random pastel color based on user id for avatar background
    const getAvatarColor = (id: number | string) => {
        const stringId = id.toString();
        const hash = stringId.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        
        // Generate pastel color
        const hue = Math.abs(hash) % 360;
        return `hsl(${hue}, 70%, 80%)`;
    };

    // Copy to clipboard function
    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                setCopySuccess(type);
                setTimeout(() => setCopySuccess(null), 2000);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    };
    
    // Handle remove user
    const handleRemoveUser = async () => {
        try {
            setIsRemoving(true);
            const response = onRemoveUser ? await onRemoveUser(user.user_id, groupId) : await removeUserFromGroup(user.user_id, groupId);
            if (response) {
                // Call the callback to refresh the list
                if (onUserRemoved) {
                    onUserRemoved();
                }
                setShowSuccessMessage(true);
            } else {
                console.error('Failed to remove user');
            }
        } catch (error) {
            console.error('Error removing user:', error);
        } finally {
            setIsRemoving(false);
            setShowRemoveConfirmation(false);
        }
    };

    return (
        <>
            <Paper
            elevation={0}
            sx={{
                p: isMobile ? 0.5 : 1,
                borderRadius: '12px',
                border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                mb: 1,
                transition: 'all 0.2s ease-in-out',
                position: 'relative'
            }}
            >            <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
                {/* Number Badge */}
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    minWidth: 32,
                    height: 32,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    borderRadius: '50%',
                    mr: isMobile ? 0 : 1.5,
                    mb: isMobile ? 1 : 0,
                    alignSelf: isMobile ? 'flex-start' : 'center'
                }}>
                    <Typography 
                        variant="caption" 
                        sx={{ 
                            fontWeight: 600,
                            color: theme.palette.primary.main,
                            fontSize: '0.75rem'
                        }}
                    >
                        {index}
                    </Typography>
                </Box>

                {/* Left Column: Avatar, Name, and Status */}
                <Box sx={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: 1.5,
                width: isMobile ? '100%' : '45%'
                }}>
                {!isMobile && (
                    <Avatar 
                        sx={{ 
                        bgcolor: getAvatarColor(user.user_id),
                        width: 40, 
                        height: 40
                        }}
                    >
                        {getInitials(user.name, user.surname)}
                    </Avatar>
                )}
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                    {user.name} {user.surname}
                    </Typography>
                    <Chip
                    size="small"
                    label={user.is_active ? "Активний" : "Не активний"}
                    color={user.is_active ? "success" : "default"}
                    sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                </Box>
                </Box>
                
                {/* Right Column: Contact Information with Copy Functions */}
                <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 0.5, 
                justifyContent: 'center',
                width: isMobile ? '100%' : '50%',
                pl: isMobile ? 0 : 2
                }}>
                {/* Email - always show */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Tooltip title={copySuccess === 'email' ? 'Copied!' : 'Копіювати email'}>
                    <IconButton 
                        size="small" 
                        onClick={() => copyToClipboard(user.email, 'email')}
                        color={copySuccess === 'email' ? 'success' : 'default'}
                        sx={{ p: 0.5 }}
                    >
                        <EmailIcon fontSize="small" sx={{ opacity: 0.7 }} />
                    </IconButton>
                    </Tooltip>
                    <Typography 
                    variant="body2" 
                    sx={{ 
                        color: theme.palette.text.secondary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}
                    >
                    {user.email}
                    </Typography>
                </Box>
                
                {/* Phone - only if present */}
                {user.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Tooltip title={copySuccess === 'phone' ? 'Copied!' : 'Копіювати телефон'}>
                        <IconButton 
                        size="small" 
                        onClick={() => copyToClipboard(user.phone, 'phone')}
                        color={copySuccess === 'phone' ? 'success' : 'default'}
                        sx={{ p: 0.5 }}
                        >
                        <PhoneIcon fontSize="small" sx={{ opacity: 0.7 }} />
                        </IconButton>
                    </Tooltip>
                    <Typography 
                        variant="body2" 
                        sx={{ color: theme.palette.text.secondary }}
                    >
                        {user.phone}
                    </Typography>
                    </Box>
                )}
                
                {/* Telegram - only if present */}
                {user.telegram_username && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Tooltip title={copySuccess === 'telegram' ? 'Copied!' : 'Копіювати Telegram'}>
                        <IconButton 
                        size="small" 
                        onClick={() => copyToClipboard(user.telegram_username, 'telegram')}
                        color={copySuccess === 'telegram' ? 'success' : 'default'}
                        sx={{ p: 0.5 }}
                        >
                        <TelegramIcon fontSize="small" sx={{ opacity: 0.7 }} />
                        </IconButton>
                    </Tooltip>
                    <Typography 
                        variant="body2" 
                        sx={{ color: theme.palette.text.secondary }}
                    >
                        {user.telegram_username}
                    </Typography>
                    </Box>
                )}
                </Box>
            </Box>
            
            {/* Remove User Button/Confirmation */}
            <Box sx={{ 
                position: 'absolute', 
                top: '50%', 
                transform: 'translateY(-50%)',
                right: isMobile ? 4 : 8, 
                display: 'flex', 
                gap: 1
            }}>
                {!showRemoveConfirmation ? (
                <Tooltip title="Видалити учня з групи">
                    <IconButton
                    size="small"
                    color="error"
                    onClick={() => setShowRemoveConfirmation(true)}
                    sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
                    >
                    <DeleteIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                ) : (
                <>
                    <Tooltip title="Підтвердити видалення">
                    <IconButton
                        size="small"
                        color="error"
                        disabled={isRemoving}
                        onClick={handleRemoveUser}
                        sx={{ opacity: 0.9, '&:hover': { opacity: 1 } }}
                    >
                        {isRemoving ? 
                        <CircularProgress size={18} color="error" /> : 
                        <CheckCircleIcon fontSize="small" />
                        }
                    </IconButton>
                    </Tooltip>
                    <Tooltip title="Скасувати">
                    <IconButton
                        size="small"
                        onClick={() => setShowRemoveConfirmation(false)}
                        disabled={isRemoving}
                        sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
                    >
                        <CancelIcon fontSize="small" />
                    </IconButton>
                    </Tooltip>
                </>
                )}
            </Box>
            </Paper>
            
            {/* Success Message Snackbar */}
            <Snackbar
                open={showSuccessMessage}
                autoHideDuration={10000} 
                onClose={() => setShowSuccessMessage(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} // Bottom left corner positioning
            >
                <Alert onClose={() => setShowSuccessMessage(false)} severity="success" sx={{ width: '100%' }}>
                    Учня успішно видалено з групи!
                </Alert>
            </Snackbar>
        </>
    );
};

/**
 * UserInGroupSearch component provides a search interface for finding users within a group
 */
interface UserInGroupSearchProps {
    groupId: string | number;
    onRemoveUser?: (userId: number | string, groupId: number | string) => Promise<boolean>;
}

const UserInGroupSearch: React.FC<UserInGroupSearchProps> = ({ groupId, onRemoveUser }) => {
    const theme = useTheme();
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<UserInfo[]>([]);
    const [allUsers, setAllUsers] = useState<UserInfo[]>([]);
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const [paginationLoading, setPaginationLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [hasNextPage, setHasNextPage] = useState<boolean>(false);
    const [totalCount, setTotalCount] = useState<number>(0);
      // Loading states
    const [initialLoading, setInitialLoading] = useState<boolean>(false);
      // Load initial paginated users
    const loadInitialUsers = useCallback(async () => {
        setInitialLoading(true);
        setError(null);
        
        try {
            const response = await getGroupUsersPaginated(groupId, 1);
            console.log('Initial load response:', response);
            if (response.success && response.users) {
                setAllUsers(response.users);
                setCurrentPage(1);
                setHasNextPage(response.pagination?.has_next || false);
                setTotalCount(response.pagination?.total_count || 0);
                console.log('Initial load completed:', {
                    usersCount: response.users.length,
                    hasNextPage: response.pagination?.has_next,
                    totalCount: response.pagination?.total_count
                });
            } else {
                setError(response.message || 'Failed to load users');
            }
        } catch (err) {
            console.error('Error loading initial users:', err);
            setError('An error occurred while loading users');
        } finally {
            setInitialLoading(false);
        }
    }, [groupId]);    // Load more users for infinite scrolling
    const loadMoreUsers = useCallback(async () => {
        if (paginationLoading || !hasNextPage) return;
        
        console.log('Loading more users - page:', currentPage + 1);
        setPaginationLoading(true);
        const nextPage = currentPage + 1;
        
        try {
            const response = await getGroupUsersPaginated(groupId, nextPage);
            console.log('Load more response:', response);
            if (response.success && response.users) {
                setAllUsers(prev => [...prev, ...response.users!]);
                setCurrentPage(nextPage);
                setHasNextPage(response.pagination?.has_next || false);
                console.log('More users loaded:', {
                    newUsersCount: response.users.length,
                    totalUsersNow: response.users.length + allUsers.length,
                    hasNextPage: response.pagination?.has_next
                });
            }
        } catch (err) {
            console.error('Error loading more users:', err);
        } finally {
            setPaginationLoading(false);
        }
    }, [paginationLoading, hasNextPage, currentPage, groupId, allUsers.length]);

    // Debounced search function to prevent excessive API calls
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSearch = useCallback(
        debounce(async (query: string) => {
            if (!query.trim()) {
                setSearchResults([]);
                return;
            }

            setSearchLoading(true);
            setError(null);
            
            try {
                const response = await searchUsersInGroup(groupId, query);
                if (response.success && response.user_dicts) {
                    console.log('Search results:', response.user_dicts);
                    setSearchResults(response.user_dicts);
                } else {
                    setError(response.message || 'Failed to search for users');
                    setSearchResults([]);
                }
            } catch (err) {
                console.error('Error searching for users:', err);
                setError('An error occurred while searching for users');
                setSearchResults([]);
            } finally {
                setSearchLoading(false);
            }
        }, 500), // 500ms debounce time
        [groupId]
    );    // Function to refresh search results after removing a user
    const refreshSearch = useCallback(() => {
        if (searchQuery.trim()) {
            debouncedSearch(searchQuery);
        } else {
            // Reload all users if no search query
            loadInitialUsers();
        }
    }, [searchQuery, debouncedSearch, loadInitialUsers]);    // Function to handle scroll event for infinite scrolling
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        const bottomReached = scrollHeight - scrollTop <= clientHeight + 100; // 100px threshold
        
        // Debug logging
        console.log('Scroll event:', {
            scrollTop,
            scrollHeight,
            clientHeight,
            bottomReached,
            hasNextPage,
            paginationLoading,
            searchQuery: searchQuery.trim()
        });
        
        if (bottomReached && !searchQuery.trim() && hasNextPage && !paginationLoading) {
            console.log('Triggering loadMoreUsers');
            loadMoreUsers();
        }
    }, [searchQuery, loadMoreUsers, hasNextPage, paginationLoading]);// Load initial users on component mount
    useEffect(() => {
        loadInitialUsers();
    }, [loadInitialUsers]);

    // Update search when query changes
    useEffect(() => {
        debouncedSearch(searchQuery);
        
        // Cleanup function to cancel debounced call if component unmounts
        return () => {
            debouncedSearch.cancel();
        };
    }, [searchQuery, debouncedSearch]);

    return (
        <Box sx={{ width: '100%' }}>
            {/* Search Field */}
            <TextField
                fullWidth
                variant="outlined"
                placeholder="Пошук учнів в групі..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        padding: theme.spacing(0.7),
                        height: '36px'
                    },
                    '& .MuiInputBase-input': {
                        padding: theme.spacing(0.7, 1),
                    }
                }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon color="action" sx={{ fontSize: '1.2rem' }} />
                        </InputAdornment>
                    ),
                    endAdornment: (searchLoading || initialLoading) && (
                        <InputAdornment position="end">
                            <CircularProgress size={16} />
                        </InputAdornment>
                    )
                }}
            />
              {/* Search Results Container */}
            <Box 
                sx={{ 
                    maxHeight: '50vh', 
                    overflowY: 'auto',
                    pr: 1,
                    '&::-webkit-scrollbar': {
                        width: '8px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                        borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                        backgroundColor: alpha(theme.palette.grey[200], 0.5),
                        borderRadius: '4px',
                    },
                    scrollbarWidth: 'thin',
                }}
                onScroll={handleScroll}
            >
                {/* Initial Loading State */}
                {initialLoading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <LoadingDots />
                    </Box>
                )}

                {/* Search Loading State */}
                {searchLoading && searchQuery && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <LoadingDots />
                    </Box>
                )}
                
                {/* Error Message */}
                {error && (
                    <Typography 
                        color="error" 
                        sx={{ 
                            textAlign: 'center', 
                            my: 2,
                            p: 2,
                            bgcolor: alpha(theme.palette.error.main, 0.05),
                            borderRadius: 2
                        }}
                    >
                        {error}
                    </Typography>
                )}
                
                {/* Empty Search Results */}
                {!searchLoading && searchQuery && searchResults.length === 0 && !error && !initialLoading && (
                    <Typography 
                        sx={{ 
                            textAlign: 'center', 
                            my: 4, 
                            color: theme.palette.text.secondary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1
                        }}
                    >
                        <PersonIcon />
                        Учнів не знайдено за пошуком "{searchQuery}"
                    </Typography>
                )}

                {/* Empty All Users Results */}
                {!initialLoading && !searchQuery && allUsers.length === 0 && !error && (
                    <Typography 
                        sx={{ 
                            textAlign: 'center', 
                            my: 4, 
                            color: theme.palette.text.secondary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1
                        }}
                    >
                        <PersonIcon />
                        У групі немає учнів
                    </Typography>
                )}
                
                {/* Display Search Results or All Users */}
                {!initialLoading && !searchLoading && (
                    <>                        {/* Show search results when searching */}
                        {searchQuery.trim() && searchResults.map((user, index) => (
                            <CompactUserCard 
                                key={user.user_id} 
                                user={user} 
                                groupId={groupId}
                                index={index + 1}
                                onUserRemoved={refreshSearch}
                                onRemoveUser={onRemoveUser}
                            />
                        ))}
                        
                        {/* Show all users when not searching */}
                        {!searchQuery.trim() && allUsers.map((user, index) => (
                            <CompactUserCard 
                                key={user.user_id} 
                                user={user} 
                                groupId={groupId}
                                index={index + 1}
                                onUserRemoved={refreshSearch}
                                onRemoveUser={onRemoveUser}
                            />
                        ))}
                        
                        {/* Pagination Loading at bottom */}
                        {paginationLoading && !searchQuery.trim() && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                                <CircularProgress size={24} />
                            </Box>
                        )}
                        
                        {/* Total count information */}
                        {!searchQuery.trim() && totalCount > 0 && (
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    textAlign: 'center', 
                                    display: 'block',
                                    mt: 2,
                                    color: theme.palette.text.secondary 
                                }}
                            >
                                Показано {allUsers.length} з {totalCount} учнів
                            </Typography>
                        )}
                    </>
                )}
                
                {/* Initial Empty State - Commented out as requested
                {!searchQuery && (
                    <Box 
                        sx={{ 
                            textAlign: 'center', 
                            my: 4, 
                            py: 4,
                            color: theme.palette.text.secondary,
                            border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                            borderRadius: 2
                        }}
                    >
                        <SearchIcon sx={{ fontSize: 40, opacity: 0.5, mb: 2 }} />
                        <Typography>
                            Type to search for users in this group
                        </Typography>
                    </Box>
                )} */}
            </Box>
        </Box>
    );
};

export default UserInGroupSearch;
export { CompactUserCard };