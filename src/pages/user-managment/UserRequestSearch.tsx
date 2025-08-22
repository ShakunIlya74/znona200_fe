import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    TextField,
    Typography,
    InputAdornment,
    CircularProgress,
    useTheme,
    alpha,
    Button,
    ButtonGroup,
    Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import { UserInfo, UserSearchResponse, AllUsersPaginatedResponse, UserRequest, UserRequestsPaginatedResponse, searchUserRequests } from '../../services/UserService';
import LoadingDots from '../../components/tools/LoadingDots';
import UserRequestComponent, { RequestStatus } from './UserRequestComponent';
import { debounce } from 'lodash';

/**
 * UserRequestSearch component provides a search interface specifically for user requests with status filtering
 */
interface UserRequestSearchProps {
    onClick: (request: UserRequest) => void;
    onUserChange?: (requests: UserRequest[]) => void;
    retrieveUsersPaginated: (page: number) => Promise<UserRequestsPaginatedResponse>;
    searchPlaceholder?: string;
}

const UserRequestSearch: React.FC<UserRequestSearchProps> = ({ 
    onClick, 
    onUserChange, 
    retrieveUsersPaginated, 
    searchPlaceholder = "Пошук запитів..."
}) => {
    const theme = useTheme();
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<UserRequest[]>([]);
    const [allRequests, setAllRequests] = useState<UserRequest[]>([]);
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const [paginationLoading, setPaginationLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
    
    // State for search pagination
    const [searchCurrentPage, setSearchCurrentPage] = useState<number>(1);
    const [searchHasNextPage, setSearchHasNextPage] = useState<boolean>(false);
    const [searchTotalCount, setSearchTotalCount] = useState<number>(0);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [hasNextPage, setHasNextPage] = useState<boolean>(false);
    const [totalCount, setTotalCount] = useState<number>(0);
    
    // Loading states
    const [initialLoading, setInitialLoading] = useState<boolean>(false);

    // Filter options
    const filterOptions = [
        { label: 'Всі', value: null, color: 'inherit' as const },
        { label: 'Нові', value: 'NEW', color: 'info' as const },
        { label: 'Схвалені', value: 'APPROVED', color: 'success' as const },
        { label: 'Відхилені', value: 'REJECTED', color: 'error' as const },
        { label: 'Неправильні контакти', value: 'WRONG_CONTACTS', color: 'warning' as const }
    ];

    const loadInitialRequests = useCallback(async () => {
        setInitialLoading(true);
        setError(null);
        
        try {
            const response = await retrieveUsersPaginated(1);
            console.log('Initial load response:', response);            

            if (response.success) {
                const requests = response.requests || [];
                
                setAllRequests(requests);
                setCurrentPage(1);
                setHasNextPage(response.pagination?.has_next || false);
                setTotalCount(response.pagination?.total_count || 0);
                
                // Call onUserChange if provided
                if (onUserChange) {
                    onUserChange(requests);
                }
                
                console.log('Initial load completed:', {
                    requestsCount: requests.length,
                    hasNextPage: response.pagination?.has_next,
                    totalCount: response.pagination?.total_count
                });
            } else {
                setError(response.message || 'Failed to load requests');
            }
        } catch (err) {
            console.error('Error loading initial requests:', err);
            setError('An error occurred while loading requests');        
        } finally {
            setInitialLoading(false);
        }
    }, [retrieveUsersPaginated, onUserChange]);
    
    // Load more requests for infinite scrolling
    const loadMoreRequests = useCallback(async () => {
        if (paginationLoading || !hasNextPage) return;
        
        console.log('Loading more requests - page:', currentPage + 1);
        setPaginationLoading(true);
        const nextPage = currentPage + 1;
          
        try {
            const response = await retrieveUsersPaginated(nextPage);
            console.log('Load more response:', response);            

            if (response.success) {
                const newRequests = response.requests || [];
                
                const newAllRequests = [...allRequests, ...newRequests];
                setAllRequests(newAllRequests);
                setCurrentPage(nextPage);
                setHasNextPage(response.pagination?.has_next || false);
                
                // Call onUserChange if provided
                if (onUserChange) {
                    onUserChange(newAllRequests);
                }
                
                console.log('More requests loaded:', {
                    newRequestsCount: newRequests.length,
                    totalRequestsNow: newAllRequests.length,
                    hasNextPage: response.pagination?.has_next
                });
            }
        } catch (err) {
            console.error('Error loading more requests:', err);        
        } finally {
            setPaginationLoading(false);
        }
    }, [paginationLoading, hasNextPage, currentPage, allRequests, retrieveUsersPaginated, onUserChange]);    

    // Debounced search function to prevent excessive API calls
    const debouncedSearch = useCallback(
        debounce(async (query: string, filterMode: string | null, resetPagination: boolean = true) => {
            if (!query.trim() && !filterMode) {
                setSearchResults([]);
                setSearchCurrentPage(1);
                setSearchHasNextPage(false);
                setSearchTotalCount(0);
                return;
            }

            setSearchLoading(true);
            setError(null);
              
            try {
                const pageToLoad = resetPagination ? 1 : searchCurrentPage + 1;
                console.log('Making search request:', { 
                    query: query || '', 
                    filterMode: filterMode || undefined, 
                    pageToLoad,
                    resetPagination
                });
                
                const response = await searchUserRequests(query || '', filterMode || undefined, pageToLoad);
                console.log('Search response received:', response);
                
                if (response.success && response.requests) {
                    console.log('Search results:', response.requests);
                    const newRequests = response.requests;
                    
                    if (resetPagination) {
                        setSearchResults(newRequests);
                        setSearchCurrentPage(1);
                        if (onUserChange) {
                            onUserChange(newRequests);
                        }
                    } else {
                        setSearchResults(prev => {
                            const updated = [...prev, ...newRequests];
                            if (onUserChange) {
                                onUserChange(updated);
                            }
                            return updated;
                        });
                        setSearchCurrentPage(pageToLoad);
                    }
                    
                    setSearchHasNextPage(response.pagination?.has_next || false);
                    setSearchTotalCount(response.pagination?.total_count || 0);
                } else {
                    console.error('Search failed:', response);
                    setError(response.message || 'Failed to search for requests');
                    if (resetPagination) {
                        setSearchResults([]);
                        setSearchCurrentPage(1);
                        setSearchHasNextPage(false);
                        setSearchTotalCount(0);
                    }
                }
            } catch (err) {
                console.error('Error searching for requests:', err);
                setError(`An error occurred while searching for requests: ${err instanceof Error ? err.message : 'Unknown error'}`);
                if (resetPagination) {
                    setSearchResults([]);
                    setSearchCurrentPage(1);
                    setSearchHasNextPage(false);
                    setSearchTotalCount(0);
                }
            } finally {
                setSearchLoading(false);
            }        
        }, 500), // 500ms debounce time
        [searchCurrentPage, onUserChange]
    );

    // Load more search results for infinite scrolling
    const loadMoreSearchResults = useCallback(async () => {
        if (searchLoading || !searchHasNextPage) return;
        
        console.log('Loading more search results - page:', searchCurrentPage + 1);
        setSearchLoading(true);
        setError(null);
        
        try {
            const nextPage = searchCurrentPage + 1;
            const response = await searchUserRequests(searchQuery || '', selectedFilter || undefined, nextPage);
            
            if (response.success && response.requests) {
                const newRequests = response.requests;
                
                setSearchResults(prev => {
                    const updatedResults = [...prev, ...newRequests];
                    
                    // Call onUserChange with the updated results
                    if (onUserChange) {
                        onUserChange(updatedResults);
                    }
                    
                    return updatedResults;
                });
                
                setSearchCurrentPage(nextPage);
                setSearchHasNextPage(response.pagination?.has_next || false);
                setSearchTotalCount(response.pagination?.total_count || 0);
            } else {
                setError(response.message || 'Failed to load more search results');
            }
        } catch (err) {
            console.error('Error loading more search results:', err);
            setError(`An error occurred while loading more search results: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setSearchLoading(false);
        }
    }, [searchLoading, searchHasNextPage, searchCurrentPage, searchQuery, selectedFilter, onUserChange]);
    
    // Function to handle scroll event for infinite scrolling
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        const bottomReached = scrollHeight - scrollTop <= clientHeight + 100; // 100px threshold
        
        const isFiltering = searchQuery.trim() || selectedFilter;
        
        // Debug logging
        console.log('Scroll event:', {
            scrollTop,
            scrollHeight,
            clientHeight,
            bottomReached,
            isFiltering,
            hasNextPage: isFiltering ? searchHasNextPage : hasNextPage,
            loading: isFiltering ? searchLoading : paginationLoading,
            searchQuery: searchQuery.trim(),
            selectedFilter
        });
        
        if (bottomReached) {
            if (isFiltering && searchHasNextPage && !searchLoading) {
                console.log('Triggering loadMoreSearchResults');
                loadMoreSearchResults();
            } else if (!isFiltering && hasNextPage && !paginationLoading) {
                console.log('Triggering loadMoreRequests');
                loadMoreRequests();
            }
        }
    }, [searchQuery, selectedFilter, loadMoreRequests, loadMoreSearchResults, hasNextPage, paginationLoading, searchHasNextPage, searchLoading]);

    // Load initial requests on component mount
    useEffect(() => {
        loadInitialRequests();
    }, [loadInitialRequests]);

    // Update search when query or filter changes
    useEffect(() => {
        // Only trigger search if there's a query or filter
        if (searchQuery.trim() || selectedFilter) {
            debouncedSearch(searchQuery, selectedFilter, true); // Always reset pagination for new search
        } else {
            // Clear search results when no query/filter
            setSearchResults([]);
            setSearchCurrentPage(1);
            setSearchHasNextPage(false);
            setSearchTotalCount(0);
            
            // Reset to show all requests
            if (onUserChange) {
                onUserChange(allRequests);
            }
        }
        
        // Cleanup function to cancel debounced call if component unmounts or dependencies change
        return () => {
            debouncedSearch.cancel();
        };
    }, [searchQuery, selectedFilter, debouncedSearch, allRequests, onUserChange]);    

    const handleRequestClick = (request: UserRequest) => {
        onClick(request);
    };

    const handleFilterChange = (filterValue: string | null) => {
        setSelectedFilter(filterValue);
    };

    const isFiltering = searchQuery.trim() || selectedFilter;
    const displayRequests = isFiltering ? searchResults : allRequests;
    const currentTotalCount = isFiltering ? searchTotalCount : totalCount;
    const currentHasNextPage = isFiltering ? searchHasNextPage : hasNextPage;
    const currentLoading = isFiltering ? searchLoading : paginationLoading;

    return (
        <Box sx={{ width: '100%' }}>            
            {/* Request Count Display */}
            {currentTotalCount > 0 && !initialLoading && (
                <Typography 
                    variant="caption" 
                    sx={{ 
                        color: theme.palette.text.secondary,
                        fontSize: '0.75rem',
                        mb: 1,
                        display: 'block'
                    }}
                >
                    Всього запитів: {currentTotalCount}
                </Typography>
            )}
            
            {/* Filter Buttons */}
            <Box sx={{ mb: 2 }}>
                <ButtonGroup 
                    variant="outlined" 
                    size="small"
                    sx={{
                        '& .MuiButton-root': {
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            px: 1.5,
                            py: 0.5,
                            minWidth: 'auto'
                        },
                        '& .MuiButton-root:not(:last-of-type)': {
                            borderRight: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                            marginRight: '4px'
                        }
                    }}
                >
                    {filterOptions.map((option) => (
                        <Button
                            key={option.value || 'all'}
                            variant={selectedFilter === option.value ? 'contained' : 'outlined'}
                            color={selectedFilter === option.value ? option.color : 'inherit'}
                            onClick={() => handleFilterChange(option.value)}
                            sx={{
                                bgcolor: selectedFilter === option.value 
                                    ? undefined 
                                    : alpha(theme.palette.grey[100], 0.5),
                                '&:hover': {
                                    bgcolor: selectedFilter === option.value 
                                        ? undefined 
                                        : alpha(theme.palette.grey[200], 0.7)
                                }
                            }}
                        >
                            {option.label}
                        </Button>
                    ))}
                </ButtonGroup>
                
                {/* Active filter indicator */}
                {selectedFilter && (
                    <Box sx={{ mt: 1 }}>
                        <Chip
                            label={`Фільтр: ${filterOptions.find(opt => opt.value === selectedFilter)?.label}`}
                            size="small"
                            onDelete={() => setSelectedFilter(null)}
                            color="default"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                        />
                    </Box>
                )}
            </Box>
            
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
                {initialLoading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <LoadingDots />
                    </Box>
                )}

                {/* Search Loading State */}
                {searchLoading && isFiltering && searchCurrentPage === 1 && (
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
                {!searchLoading && isFiltering && displayRequests.length === 0 && !error && !initialLoading && (
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
                        Запитів не знайдено
                        {searchQuery && ` за пошуком "${searchQuery}"`}
                        {selectedFilter && ` з фільтром "${filterOptions.find(opt => opt.value === selectedFilter)?.label}"`}
                    </Typography>
                )}

                {/* Empty All Requests */}
                {!initialLoading && !isFiltering && allRequests.length === 0 && !error && (
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
                        Запитів не знайдено
                    </Typography>
                )}
                  
                {/* Display Results */}
                {!initialLoading && !(searchLoading && searchCurrentPage === 1) && (
                    <>                        
                        {displayRequests.map((request, index) => (
                            <UserRequestComponent
                                key={`request-${request.request_id}`}
                                request={request}
                                collapsed={true}
                                index={index + 1}
                                onClick={handleRequestClick}
                            />
                        ))}
                        
                        {/* Pagination Loading at bottom */}
                        {((paginationLoading && !isFiltering) || (searchLoading && isFiltering && searchCurrentPage > 1)) && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                                <CircularProgress size={24} />
                            </Box>
                        )}
                        
                        {/* Total count information */}
                        {currentTotalCount > 0 && (
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    textAlign: 'center', 
                                    display: 'block',
                                    mt: 2,
                                    color: theme.palette.text.secondary 
                                }}
                            >
                                Показано {displayRequests.length} з {currentTotalCount} запитів
                                {isFiltering && ` (${searchQuery ? `пошук: "${searchQuery}"` : ''}${searchQuery && selectedFilter ? ', ' : ''}${selectedFilter ? `фільтр: ${filterOptions.find(opt => opt.value === selectedFilter)?.label}` : ''})`}
                            </Typography>
                        )}
                    </>
                )}
            </Box>
        </Box>
    );
};

export default UserRequestSearch;