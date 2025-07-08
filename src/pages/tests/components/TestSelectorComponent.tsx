import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Collapse,
  Paper,
  InputBase,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  useTheme,
  alpha,
  useMediaQuery
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Quiz as QuizIcon
} from '@mui/icons-material';
import LoadingDots  from '../../../components/tools/LoadingDots';
import { GetTestsData, GetFolderTests } from '../../../services/TestService';
import { TestCardMeta } from '../interfaces';

// Define folder object type
interface FolderObject {
  folder_name: string;
  folder_id: number;
  elements_count: number;
}

interface TestsData {
  success: boolean;
  folder_dicts?: FolderObject[];
}

interface FolderTests {
  success: boolean;
  test_dicts?: TestCardMeta[];
}

interface TestSelectorComponentProps {
  onTestSelect: (test: TestCardMeta) => void;
  width?: string | number;
  height?: string | number;
  maxHeight?: string | number;
  compact?: boolean;
  allowSearch?: boolean;
}

const TestSelectorComponent: React.FC<TestSelectorComponentProps> = ({
  onTestSelect,
  width = '100%',
  height = 'auto',
  maxHeight = '600px',
  compact = false,
  allowSearch = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [folderList, setFolderList] = useState<FolderObject[]>([]);
  const [filteredFolderList, setFilteredFolderList] = useState<FolderObject[]>([]);
  const [folderSearchQuery, setFolderSearchQuery] = useState<string>('');
  const [openFolderId, setOpenFolderId] = useState<number | null>(null);
  const [folderTests, setFolderTests] = useState<TestCardMeta[]>([]);
  const [filteredTests, setFilteredTests] = useState<TestCardMeta[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [folderLoading, setFolderLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Create refs for scrolling
  const searchInputRef = useRef<HTMLInputElement>(null);
  const folderSearchInputRef = useRef<HTMLInputElement>(null);

  // Load initial tests folders
  useEffect(() => {
    const loadTestsData = async () => {
      setLoading(true);
      try {
        const res = await GetTestsData() as TestsData;
        if (res.success && res.folder_dicts) {
          setFolderList(res.folder_dicts);
          setFilteredFolderList(res.folder_dicts);
        } else {
          setError('Failed to load folders');
        }
      } catch (err) {
        console.error(err);
        setError('An error occurred while loading folders');
      } finally {
        setLoading(false);
      }
    };

    loadTestsData();
  }, []);

  // Filter folders when folder search query changes
  useEffect(() => {
    if (!folderSearchQuery.trim()) {
      setFilteredFolderList(folderList);
      return;
    }

    const query = folderSearchQuery.toLowerCase();
    const filtered = folderList.filter(folder =>
      folder.folder_name.toLowerCase().includes(query)
    );
    setFilteredFolderList(filtered);
  }, [folderSearchQuery, folderList]);

  // When folder tests change, reset search and update filtered tests
  useEffect(() => {
    setSearchQuery('');
    setFilteredTests(folderTests);
  }, [folderTests]);

  // Filter tests when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTests(folderTests);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = folderTests.filter(test =>
      test.test_name.toLowerCase().includes(query)
    );
    setFilteredTests(filtered);
  }, [searchQuery, folderTests]);

  const handleFolderClick = async (folderId: number) => {
    // If clicking the already open folder, close it
    if (openFolderId === folderId) {
      setOpenFolderId(null);
      return;
    }

    // Set the new folder as open and start loading its tests
    setOpenFolderId(folderId);
    setFolderLoading(true);
    setFolderTests([]);
    setFilteredTests([]);

    try {
      const response = await GetFolderTests(folderId) as FolderTests;
      if (response.success && response.test_dicts) {
        setFolderTests(response.test_dicts);
        setFilteredTests(response.test_dicts);
      } else {
        setError('Failed to load tests for this folder');
        setFolderTests([]);
        setFilteredTests([]);
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while loading tests');
      setFolderTests([]);
      setFilteredTests([]);
    } finally {
      setFolderLoading(false);
    }
  };

  const handleTestClick = (test: TestCardMeta) => {
    onTestSelect(test);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  const handleFolderSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFolderSearchQuery(event.target.value);
  };

  const clearFolderSearch = () => {
    setFolderSearchQuery('');
    folderSearchInputRef.current?.focus();
  };

  const cardPadding = compact ? 1 : 1.5;
  const contentPadding = compact ? 1.5 : 2;
  const fontSize = compact ? '0.9rem' : '1.1rem';
  const bodyFontSize = compact ? '0.8rem' : '0.9rem';

  return (
    <Box
      sx={{
        width,
        height,
        maxHeight,
        overflow: 'auto',
        border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
        borderRadius: '12px',
        backgroundColor: theme.palette.background.default
      }}
    >
      {/* Folder Search Bar */}
      {allowSearch && !loading && !error && folderList.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            m: compact ? 1 : 1.5,
            p: compact ? 1 : 1.5,
            borderRadius: '12px',
            backgroundColor: alpha(theme.palette.primary.main, 0.03),
            border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
            boxShadow: `0px 1px 3px ${alpha(theme.palette.common.black, 0.05)}`
          }}
        >
          <InputBase
            inputRef={folderSearchInputRef}
            fullWidth
            placeholder="Пошук модулів..."
            value={folderSearchQuery}
            onChange={handleFolderSearchChange}
            sx={{
              backgroundColor: theme.palette.common.white,
              borderRadius: '8px',
              px: compact ? 1.5 : 2,
              py: compact ? 0.3 : 0.5,
              fontSize: bodyFontSize,
              '& .MuiInputBase-input': {
                transition: theme.transitions.create('width'),
              },
              boxShadow: `0px 1px 3px ${alpha(theme.palette.common.black, 0.04)}`,
              border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
            }}
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon color="action" sx={{ opacity: 0.6, fontSize: compact ? '1rem' : '1.2rem' }} />
              </InputAdornment>
            }
            endAdornment={
              folderSearchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    edge="end"
                    onClick={clearFolderSearch}
                    sx={{
                      opacity: 0.6,
                      '&:hover': { opacity: 1 }
                    }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }
          />
        </Paper>
      )}

      <Box sx={{ p: compact ? 1 : 1.5 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <LoadingDots />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ textAlign: 'center', py: 2 }}>
            {error}
          </Typography>
        ) : filteredFolderList.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: compact ? 1.5 : 2 }}>
            {filteredFolderList.map((folder) => (
              <Box key={folder.folder_id}>
                <Card
                  sx={{
                    borderRadius: '12px',
                    boxShadow: `0px 1px 3px ${alpha(theme.palette.common.black, 0.05)}`,
                    border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: `0px 2px 6px ${alpha(theme.palette.common.black, 0.1)}`,
                      transform: openFolderId === folder.folder_id ? 'none' : 'translateY(-1px)'
                    }
                  }}
                >
                  <CardActionArea
                    onClick={() => handleFolderClick(folder.folder_id)}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      pr: cardPadding,
                      borderRadius: openFolderId === folder.folder_id ? '12px 12px 0 0' : '12px',
                      py: compact ? 0.3 : 0.5
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, py: contentPadding }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          fontSize,
                          mb: compact ? 0.3 : 0.5
                        }}
                      >
                        {folder.folder_name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontSize: bodyFontSize
                        }}
                      >
                        На цьому етапі доступно {folder.elements_count} тестів.
                      </Typography>
                    </CardContent>
                    <IconButton
                      size="small"
                      sx={{
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        color: theme.palette.primary.main,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        },
                        transition: 'all 0.2s'
                      }}
                    >
                      {openFolderId === folder.folder_id
                        ? <ExpandLessIcon fontSize={compact ? 'small' : 'medium'} />
                        : <ExpandMoreIcon fontSize={compact ? 'small' : 'medium'} />
                      }
                    </IconButton>
                  </CardActionArea>
                </Card>

                <Collapse
                  in={openFolderId === folder.folder_id}
                  timeout="auto"
                  unmountOnExit
                >
                  <Box
                    sx={{
                      mt: 0,
                      mb: compact ? 1 : 2,
                      mr: 0.5,
                      borderLeft: '2px solid',
                      borderColor: alpha(theme.palette.primary.main, 0.2),
                      borderRadius: '0 0 12px 12px',
                      ml: compact ? 1 : 2,
                      position: 'relative',
                    }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: '0 0 8px 8px',
                        overflow: 'hidden',
                        border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                        borderTop: 'none',
                        marginTop: '-1px',
                      }}
                    >
                      {/* Test Search Bar */}
                      {allowSearch && folderTests.length >= (compact ? 5 : 10) && (
                        <Box sx={{ p: compact ? 1 : 1.5, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                          <InputBase
                            inputRef={searchInputRef}
                            fullWidth
                            placeholder="Пошук тестів..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            sx={{
                              backgroundColor: alpha(theme.palette.grey[50], 0.5),
                              borderRadius: '8px',
                              px: compact ? 1.5 : 2,
                              py: compact ? 0.3 : 0.5,
                              fontSize: bodyFontSize,
                              border: `1px solid ${alpha(theme.palette.grey[300], 0.3)}`,
                            }}
                            startAdornment={
                              <InputAdornment position="start">
                                <SearchIcon color="action" sx={{ opacity: 0.6, fontSize: compact ? '1rem' : '1.2rem' }} />
                              </InputAdornment>
                            }
                            endAdornment={
                              searchQuery && (
                                <InputAdornment position="end">
                                  <IconButton
                                    size="small"
                                    edge="end"
                                    onClick={clearSearch}
                                    sx={{
                                      opacity: 0.6,
                                      '&:hover': { opacity: 1 }
                                    }}
                                  >
                                    <ClearIcon fontSize="small" />
                                  </IconButton>
                                </InputAdornment>
                              )
                            }
                          />
                        </Box>
                      )}

                      {folderLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                          <LoadingDots />
                        </Box>
                      ) : filteredTests.length > 0 ? (                        <List sx={{ py: 0 }}>
                          {filteredTests.map((test, index) => (
                            <ListItem key={test.test_id} sx={{ px: 0, py: 0 }}>
                              <ListItemButton
                                onClick={() => handleTestClick(test)}
                                sx={{
                                  borderRadius: 0,
                                  px: compact ? 2 : 3,
                                  py: compact ? 0.5 : 0.8,
                                  minHeight: compact ? '48px' : '56px',
                                  transition: 'all 0.2s ease-in-out',
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                  },
                                  borderBottom: index < filteredTests.length - 1 
                                    ? `1px solid ${alpha(theme.palette.divider, 0.1)}`
                                    : 'none'
                                }}
                              >
                                <QuizIcon
                                  sx={{
                                    mr: compact ? 1.5 : 2,
                                    color: theme.palette.primary.main,
                                    fontSize: compact ? '1.2rem' : '1.4rem'
                                  }}
                                />                                <ListItemText
                                  primary={
                                    <Typography
                                      sx={{
                                        fontWeight: 500,
                                        fontSize: compact ? '0.9rem' : '1rem',
                                        mb: compact ? 0.1 : 0.2,
                                        lineHeight: 1.3
                                      }}
                                    >
                                      {test.test_name}
                                    </Typography>
                                  }                                  secondary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 0.1 }}>
                                      {test.test_description && (
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            color: theme.palette.text.secondary,
                                            fontSize: compact ? '0.75rem' : '0.8rem',
                                            flex: 1,
                                            lineHeight: 1.2
                                          }}
                                        >
                                          {test.test_description.length > (compact ? 60 : 100)
                                            ? `${test.test_description.substring(0, compact ? 60 : 100)}...`
                                            : test.test_description
                                          }
                                        </Typography>
                                      )}
                                      {test.complete_trials && test.complete_trials > 0 && (
                                        <Chip
                                          label={test.correct_percentage !== undefined 
                                            ? `${Math.round(test.correct_percentage)}%`
                                            : '0%'
                                          }
                                          size="small"
                                          sx={{
                                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                            color: theme.palette.primary.main,
                                            fontSize: compact ? '0.7rem' : '0.75rem',
                                            height: compact ? '18px' : '20px'
                                          }}
                                        />
                                      )}
                                    </Box>
                                  }
                                />
                              </ListItemButton>
                            </ListItem>
                          ))}
                        </List>
                      ) : folderTests.length > 0 && searchQuery ? (
                        <Typography
                          sx={{
                            py: 3,
                            px: 3,
                            textAlign: 'center',
                            color: theme.palette.text.secondary,
                            fontSize: bodyFontSize
                          }}
                        >
                          Жодного тесту не знайдено за вашим пошуковим запитом.
                        </Typography>
                      ) : (
                        <Typography
                          sx={{
                            py: 3,
                            px: 3,
                            textAlign: 'center',
                            color: theme.palette.text.secondary,
                            fontSize: bodyFontSize
                          }}
                        >
                          У цій папці немає доступних тестів.
                        </Typography>
                      )}
                    </Paper>
                  </Box>
                </Collapse>
              </Box>
            ))}
          </Box>
        ) : folderList.length > 0 ? (
          <Typography
            sx={{
              py: 3,
              px: 3,
              textAlign: 'center',
              color: theme.palette.text.secondary,
              fontSize: bodyFontSize
            }}
          >
            Жодного модуля не знайдено за вашим пошуковим запитом.
          </Typography>
        ) : (
          <Typography
            sx={{
              py: 3,
              px: 3,
              textAlign: 'center',
              color: theme.palette.text.secondary,
              fontSize: bodyFontSize
            }}
          >
            Немає доступних папок з тестами.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default TestSelectorComponent;