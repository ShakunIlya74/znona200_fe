import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    TextField,
    Typography,
    InputAdornment,
    CircularProgress,
    useTheme,
    alpha,
    useMediaQuery
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import { UserInfo, UserSearchResponse, AllUsersPaginatedResponse, UserRequest, UserRequestsPaginatedResponse } from '../../services/UserService';
import LoadingDots from '../../components/tools/LoadingDots';
import EditUserComponent from './EditUserComponent';
import UserRequestComponent, { RequestStatus } from './UserRequestComponent';
import { debounce } from 'lodash';

/**
 * UserControlSearch component provides a generic search interface for users and user requests
 */
interface UserControlSearchProps {
    onClick: (user: UserInfo | UserRequest) => void;
    onUserChange?: (users: (UserInfo | UserRequest)[]) => void;
    retrieveUsersPaginated: (page: number, mode?: string) => Promise<AllUsersPaginatedResponse | UserRequestsPaginatedResponse>;
    onSearch?: (searchQuery: string, searchMode: string) => Promise<UserSearchResponse>;
    searchPlaceholder?: string;
    mode?: string;
}

const UserControlSearch: React.FC<UserControlSearchProps> = ({ 
    onClick, 
    onUserChange, 
    retrieveUsersPaginated, 
    onSearch, 
    searchPlaceholder = "Пошук користувачів...",
    mode = "active"
}) => {
    const theme = useTheme();
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<(UserInfo | UserRequest)[]>([]);
    const [allUsers, setAllUsers] = useState<(UserInfo | UserRequest)[]>([]);
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const [paginationLoading, setPaginationLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [hasNextPage, setHasNextPage] = useState<boolean>(false);
    const [totalCount, setTotalCount] = useState<number>(0);
    
    // Loading states
    const [initialLoading, setInitialLoading] = useState<boolean>(false);
    const [needsReload, setNeedsReload] = useState<boolean>(true);

    const loadInitialUsers = useCallback(async () => {
        setInitialLoading(true);
        setNeedsReload(false);
        setError(null);
        
        try {
            const response = await retrieveUsersPaginated(1, mode);
            console.log('Initial load response:', response);            if (response.success) {
                const rawUsers = mode === 'requests' 
                    ? (response as UserRequestsPaginatedResponse).requests || []
                    : (response as AllUsersPaginatedResponse).users || [];
                
                const users = mode === 'requests' 
                    ? (rawUsers as UserRequest[])
                    : rawUsers as UserInfo[];
                
                setAllUsers(users);
                setCurrentPage(1);
                setHasNextPage(response.pagination?.has_next || false);
                setTotalCount(response.pagination?.total_count || 0);
                
                // Call onUserChange if provided
                if (onUserChange) {
                    onUserChange(users);
                }
                
                console.log('Initial load completed:', {
                    usersCount: users.length,
                    hasNextPage: response.pagination?.has_next,
                    totalCount: response.pagination?.total_count
                });
            } else {
                setError(response.message || 'Failed to load users');
            }
        } catch (err) {
            console.error('Error loading initial users:', err);
            setError('An error occurred while loading users');        } finally {
            setInitialLoading(false);
        }
    }, [retrieveUsersPaginated, mode, onUserChange]);
    
    // Load more users for infinite scrolling
    const loadMoreUsers = useCallback(async () => {
        if (paginationLoading || !hasNextPage) return;
        
        console.log('Loading more users - page:', currentPage + 1);
        setPaginationLoading(true);
        const nextPage = currentPage + 1;
          try {
            const response = await retrieveUsersPaginated(nextPage, mode);
            console.log('Load more response:', response);            if (response.success) {
                const rawNewUsers = mode === 'requests' 
                    ? (response as UserRequestsPaginatedResponse).requests || []
                    : (response as AllUsersPaginatedResponse).users || [];
                
                const newUsers = mode === 'requests' 
                    ? (rawNewUsers as UserRequest[])
                    : rawNewUsers as UserInfo[];
                
                setAllUsers(prev => {
                    const newAllUsers = [...prev, ...newUsers];
                    
                    // Call onUserChange if provided
                    if (onUserChange) {
                        onUserChange(newAllUsers);
                    }
                    
                    return newAllUsers;
                });
                setCurrentPage(nextPage);
                setHasNextPage(response.pagination?.has_next || false);
                
                console.log('More users loaded:', {
                    newUsersCount: newUsers.length,
                    hasNextPage: response.pagination?.has_next
                });
            }
        } catch (err) {
            console.error('Error loading more users:', err);        } finally {
            setPaginationLoading(false);
        }
    }, [paginationLoading, hasNextPage, currentPage, retrieveUsersPaginated, mode]);    // Debounced search function to prevent excessive API calls
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSearch = useCallback(
        debounce(async (query: string) => {
            if (!query.trim()) {
                setSearchResults([]);
                return;
            }

            // Skip search if no search function is provided
            if (!onSearch) {
                setSearchResults([]);
                return;
            }

            setSearchLoading(true);
            setError(null);
              try {
                const response = await onSearch(query, mode);
                if (response.success && response.user_dicts) {
                    console.log('Search results:', response.user_dicts);
                    setSearchResults(response.user_dicts);
                    
                    // Call onUserChange if provided
                    if (onUserChange) {
                        onUserChange(response.user_dicts);
                    }
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
            }        }, 500), // 500ms debounce time
        [onSearch, mode]
    );
    
    // Function to handle scroll event for infinite scrolling
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
    }, [searchQuery, loadMoreUsers, hasNextPage, paginationLoading]);

    // Load initial users on component mount
    useEffect(() => {
        setNeedsReload(true);
        loadInitialUsers();
    }, [loadInitialUsers]);

    // Update search when query changes
    useEffect(() => {
        debouncedSearch(searchQuery);
        
        // Cleanup function to cancel debounced call if component unmounts
        return () => {
            debouncedSearch.cancel();
        };
    }, [searchQuery, debouncedSearch]);    const handleUserClick = (user: UserInfo | UserRequest) => {
        onClick(user);
    };

    return (
        <Box sx={{ width: '100%' }}>            {/* User Count Display */}
            {totalCount > 0 && !initialLoading && !needsReload && (
                <Typography 
                    variant="caption" 
                    sx={{ 
                        color: theme.palette.text.secondary,
                        fontSize: '0.75rem',
                        mb: 1,
                        display: 'block'
                    }}
                >
                    Всього {mode === 'requests' ? 'запитів' : 'користувачів'}: {totalCount}
                </Typography>
            )}
            
            {/* Search Field */}
            <TextField
                fullWidth
                variant="outlined"
                placeholder={searchPlaceholder}
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
                    maxHeight: '60vh', 
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
                {(initialLoading || needsReload) && (
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
                {!searchLoading && searchQuery && searchResults.length === 0 && !error && !initialLoading && !needsReload && (
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
                        {mode === 'requests' ? 'Запитів не знайдено' : 'Користувачів не знайдено'} за пошуком "{searchQuery}"
                    </Typography>
                )}

                {/* Empty All Users Results */}
                {!initialLoading && !searchQuery && allUsers.length === 0 && !error && !needsReload && (
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
                        {mode === 'requests' ? 'Запитів не знайдено' : 'Користувачів не знайдено'}
                    </Typography>
                )}
                  {/* Display Search Results or All Users */}
                {!initialLoading && !searchLoading && !needsReload && (
                    <>                        {/* Show search results when searching */}
                        {searchQuery.trim() && searchResults.map((item, index) => (
                            mode === 'requests' ? (
                                <UserRequestComponent
                                    key={`search-${(item as UserRequest).request_id}`}
                                    request={item as UserRequest}
                                    collapsed={true}
                                    index={index + 1}
                                    onClick={handleUserClick}
                                />
                            ) : (
                                <EditUserComponent 
                                    key={`search-${(item as UserInfo).user_id}`}
                                    user={item as UserInfo}
                                    collapsed={true}
                                    index={index + 1}
                                    onClick={handleUserClick}
                                />
                            )
                        ))}
                        
                        {/* Show all users when not searching */}
                        {!searchQuery.trim() && allUsers.map((item, index) => (
                            mode === 'requests' ? (
                                <UserRequestComponent
                                    key={`all-${(item as UserRequest).request_id}`}
                                    request={item as UserRequest}
                                    collapsed={true}
                                    index={index + 1}
                                    onClick={handleUserClick}
                                />
                            ) : (
                                <EditUserComponent 
                                    key={`all-${(item as UserInfo).user_id}`}
                                    user={item as UserInfo}
                                    collapsed={true}
                                    index={index + 1}
                                    onClick={handleUserClick}
                                />
                            )
                        ))}
                        
                        {/* Pagination Loading at bottom */}
                        {paginationLoading && !searchQuery.trim() && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                                <CircularProgress size={24} />
                            </Box>
                        )}
                        
                        {/* Total count information */}
                        {!searchQuery.trim() && totalCount > 0 && !needsReload && (
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    textAlign: 'center', 
                                    display: 'block',
                                    mt: 2,
                                    color: theme.palette.text.secondary 
                                }}
                            >
                                Показано {allUsers.length} з {totalCount} {mode === 'requests' ? 'запитів' : 'користувачів'}
                            </Typography>
                        )}
                    </>
                )}
            </Box>
        </Box>
    );
};

export default UserControlSearch;