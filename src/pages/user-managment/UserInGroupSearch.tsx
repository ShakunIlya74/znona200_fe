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
    IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import TelegramIcon from '@mui/icons-material/Telegram';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { searchUsersInGroup, UserInfo } from '../../services/UserService';
import LoadingDots from '../../components/tools/LoadingDots';
import { debounce } from 'lodash';

/**
 * CompactUserCard component displays user information in a compact, modern card layout
 */
const CompactUserCard: React.FC<{ user: UserInfo }> = ({ user }) => {
    const theme = useTheme();
    const [copySuccess, setCopySuccess] = useState<string | null>(null);
    
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

    return (
        <Paper
            elevation={0}
            sx={{
                p: 1,
                borderRadius: '12px',
                border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                mb: 1,
                transition: 'all 0.2s ease-in-out',
                // '&:hover': {
                //     boxShadow: `0px 4px 8px ${alpha(theme.palette.common.black, 0.1)}`,
                //     transform: 'translateY(-2px)'
                // }
            }}
        >
            <Box sx={{ display: 'flex' }}>
                {/* Left Column: Avatar, Name, and Status */}
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: 1.5,
                    width: '50%'
                }}>
                    <Avatar 
                        sx={{ 
                            bgcolor: getAvatarColor(user.user_id),
                            width: 40, 
                            height: 40
                        }}
                    >
                        {getInitials(user.name, user.surname)}
                    </Avatar>
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
                    width: '50%',
                    pl: 2
                }}>
                    {/* Email - always show */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Tooltip title={copySuccess === 'email' ? 'Copied!' : 'Copy email'}>
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
        </Paper>
    );
};

/**
 * UserInGroupSearch component provides a search interface for finding users within a group
 */
interface UserInGroupSearchProps {
    groupId: string | number;
}

const UserInGroupSearch: React.FC<UserInGroupSearchProps> = ({ groupId }) => {
    const theme = useTheme();
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [users, setUsers] = useState<UserInfo[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Debounced search function to prevent excessive API calls
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSearch = useCallback(
        debounce(async (query: string) => {
            if (!query.trim()) {
                setUsers([]);
                return;
            }

            setLoading(true);
            setError(null);
            
            try {
                const response = await searchUsersInGroup(groupId, query);
                if (response.success && response.user_dicts) {
                    console.log('Search results:', response.user_dicts);
                    setUsers(response.user_dicts);
                } else {
                    setError(response.message || 'Failed to search for users');
                    setUsers([]);
                }
            } catch (err) {
                console.error('Error searching for users:', err);
                setError('An error occurred while searching for users');
                setUsers([]);
            } finally {
                setLoading(false);
            }
        }, 500), // 500ms debounce time
        [groupId]
    );

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
                    }
                }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon color="action" />
                        </InputAdornment>
                    ),
                    endAdornment: loading && (
                        <InputAdornment position="end">
                            <CircularProgress size={20} />
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
            >
                {/* Loading State */}
                {loading && searchQuery && (
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
                
                {/* Empty Results */}
                {!loading && searchQuery && users.length === 0 && !error && (
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
                
                {/* User Cards */}
                {users.map((user) => (
                    <CompactUserCard key={user.user_id} user={user} />
                ))}
                
                {/* Initial Empty State
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