import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  useTheme,
  alpha,
  ClickAwayListener
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import { searchUsers, UserInfo } from '../../services/UserService';
import LoadingDots from '../../components/tools/LoadingDots';
import { debounce } from 'lodash';

export interface UserSearchDropdownProps {
  onSelect: (user: UserInfo) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  minSearchLength?: number;
  variant?: 'outlined' | 'filled' | 'standard';
}

const UserSearchDropdown: React.FC<UserSearchDropdownProps> = ({
  onSelect,
  placeholder = 'Пошук користувачів...',
  label = 'Пошук',
  disabled = false,
  fullWidth = true,
  size = 'medium',
  minSearchLength = 2,
  variant = 'outlined',
}) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Debounced search function to prevent excessive API calls
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      // Don't search if query is too short
      if (query.length < minSearchLength) {
        setUsers([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const response = await searchUsers(query);
        if (response.success && response.user_dicts) {
          setUsers(response.user_dicts);
          setIsOpen(response.user_dicts.length > 0);
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
    []
  );

  // Update search when query changes
  useEffect(() => {
    debouncedSearch(searchQuery);
    
    // Cleanup function to cancel debounced call if component unmounts
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);

  // Handle user selection
  const handleSelectUser = (user: UserInfo) => {
    onSelect(user);
    setSearchQuery(''); // Clear search after selection
    setUsers([]);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  const handleClickAway = () => {
    setIsOpen(false);
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}>
        {/* Search Field */}
        <TextField
          fullWidth={fullWidth}
          variant={variant}
          label={label}
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={disabled}
          size={size}
          onClick={() => {
            if (searchQuery.length >= minSearchLength && users.length > 0) {
              setIsOpen(true);
            }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
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
        
        {/* Dropdown Results */}
        {isOpen && (
          <Paper
            elevation={3}
            sx={{
              position: 'absolute',
              width: '100%',
              mt: 0.5,
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 1300,
              borderRadius: '8px',
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
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <LoadingDots />
              </Box>
            )}
            
            {/* Error Message */}
            {error && (
              <Typography
                color="error"
                sx={{
                  textAlign: 'center',
                  py: 2,
                  px: 1
                }}
              >
                {error}
              </Typography>
            )}
            
            {/* Empty Results */}
            {!loading && users.length === 0 && searchQuery.length >= minSearchLength && !error && (
              <Box sx={{
                py: 2,
                px: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1
              }}>
                <PersonIcon color="disabled" />
                <Typography color="textSecondary">
                  Користувачів не знайдено
                </Typography>
              </Box>
            )}
            
            {/* User List */}
            {users.length > 0 && (
              <List disablePadding>
                {users.map((user) => (
                  <ListItem
                    key={user.user_id}
                    component="div"
                    onClick={() => handleSelectUser(user)}
                    sx={{
                      py: 1,
                      cursor: 'pointer',
                      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                      '&:last-child': {
                        borderBottom: 'none'
                      },
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05)
                      }
                    }}
                  >
                    <ListItemText
                      primary={`${user.name} ${user.surname}`}
                      secondary={user.email}
                      primaryTypographyProps={{
                        fontWeight: 500,
                        variant: 'body2'
                      }}
                      secondaryTypographyProps={{
                        variant: 'caption',
                        color: 'textSecondary'
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
};

export default UserSearchDropdown;