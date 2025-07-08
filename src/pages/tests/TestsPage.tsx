import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Container,
  List,
  ListItemText,
  Divider,
  Collapse,
  IconButton,
  ListItemButton,
  Paper,
  alpha,
  InputBase,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Backdrop
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocalLibraryRoundedIcon from '@mui/icons-material/LocalLibraryRounded';
import HistoryIcon from '@mui/icons-material/History';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { GetTestsData, GetFolderTests, CreateEmptyTest, RemoveTestFromFolder } from '../../services/TestService';
import { GetSessionData } from '../../services/AuthService';
import { declinateWord } from '../utils/utils';
import LoadingDots from '../../components/tools/LoadingDots';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useNavigate } from 'react-router-dom';
import { TestCardMeta } from './interfaces';

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

interface TestModalProps {
  open: boolean;
  test: TestCardMeta | null;
  onClose: () => void;
  onStart: (tfpSha: string) => void;
  isAdmin: boolean; // Adding isAdmin prop
  onTestRemoved?: () => void; // New callback for test removal
}

// Modal component for test start confirmation
const TestStartModal: React.FC<TestModalProps> = ({ open, test, onClose, onStart, isAdmin, onTestRemoved }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  if (!test) return null;

  const hasCompletedTrials = test.complete_trials && test.complete_trials > 0;

  const handleReviewTest = () => {
    console.log(`Navigating to review test with tfp_sha: ${test.tfp_sha}`);
    navigate(`/tests/review/${test.tfp_sha}`);
  };

  const handleEditTest = () => {
    console.log(`Navigating to edit test with tfp_sha: ${test.tfp_sha}`);
    navigate(`/tests/edit/${test.tfp_sha}`);
  };

  const handleDeleteTest = async () => {
    if (!test.tfp_sha) return;

    setDeleteInProgress(true);
    try {
      const result = await RemoveTestFromFolder(test.tfp_sha);
      if (result.success) {
        onClose();
        if (onTestRemoved) {
          onTestRemoved();
        }
      } else {
        console.error('Failed to delete test:', result.error);
        // Could add a toast/snackbar error notification here
      }
    } catch (error) {
      console.error('Error deleting test:', error);
    } finally {
      setDeleteInProgress(false);
    }
  };

  const toggleDeleteMode = () => {
    setIsDeleting(!isDeleting);
  };

  // This function helps create square buttons with responsive size
  const getButtonSx = (variant: 'outlined' | 'contained', color?: string) => {
    const isContained = variant === 'contained';
    const buttonColor = color || theme.palette.primary.main;
    
    return {
      borderRadius: '8px',
      textTransform: 'none',
      fontWeight: 600,
      minWidth: '120px', // Minimum width
      height: '120px', // Fixed height to make them square
      flex: 1, // Allow buttons to share space equally
      maxWidth: '180px', // Limit maximum size
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 1,
      p: 2,
      transition: 'all 0.2s ease-in-out',
      ...(isContained ? {
        backgroundColor: buttonColor,
        boxShadow: `0px 2px 4px ${alpha(buttonColor, 0.25)}`,
        '&:hover': {
          backgroundColor: alpha(buttonColor, 0.8)
        }
      } : {
        borderColor: color ? buttonColor : alpha(theme.palette.grey[500], 0.5),
        color: color || theme.palette.text.primary,
        '&:hover': {
          borderColor: buttonColor,
          backgroundColor: alpha(buttonColor, 0.05)
        }
      })
    };
  };

  return (
    <>
      <Backdrop
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: alpha(theme.palette.common.black, 0.5),
          backdropFilter: 'blur(4px)'
        }}
        open={open}
        onClick={onClose}
      />
      <Dialog
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: `0px 8px 24px ${alpha(theme.palette.common.black, 0.15)}`,
            maxWidth: '600px', // Increased to accommodate square buttons
            width: '100%',
            m: 2,
            position: 'relative',
            overflow: 'visible'
          }
        }}
        sx={{
          '& .MuiBackdrop-root': {
            backgroundColor: 'transparent'
          }
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '-12px',
            right: '-12px',
            zIndex: 1
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{
              backgroundColor: theme.palette.common.white,
              boxShadow: `0px 2px 8px ${alpha(theme.palette.common.black, 0.1)}`,
              '&:hover': {
                backgroundColor: alpha(theme.palette.grey[100], 0.9)
              }
            }}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <DialogTitle
          sx={{
            py: 3,
            px: 3,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: '1.1rem'
            }}
          >
            {test.test_name}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ py: 3, px: 3 }}>
          {hasCompletedTrials && !isDeleting && (
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  borderRadius: '8px',
                  p: 1.5,
                  mb: 1,
                  mt: 1
                }}
              >
                <Typography variant="body2">
                  Кількість спроб: <strong>{test.complete_trials}</strong>
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.primary.main
                  }}
                >
                  {test.correct_percentage !== undefined ?
                    `${Math.round(test.correct_percentage)}%` :
                    '0%'
                  }
                </Typography>
              </Box>
            </Box>
          )}

          {isDeleting ? (
            <Typography
              variant="body1"
              color="error.main"
              sx={{ mb: 2, fontWeight: 500, textAlign: 'center' }}
            >
              Ви впевнені, що хочете видалити цей тест з папки?
              <br/>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Ця дія не може бути скасована.
              </Typography>
            </Typography>
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              {test.test_description && (
                <>
                  {test.test_description}
                  <Box sx={{ mb: 2 }} />
                </>
              )}
              Ви готові розпочати тест?
            </Typography>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            pt: 1,
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            flexWrap: { xs: 'wrap', sm: 'nowrap' }
          }}
        >
          {isDeleting ? (
            <>
              <Button
                onClick={toggleDeleteMode}
                variant="outlined"
                disabled={deleteInProgress}
                sx={getButtonSx('outlined')}
              >
                <Typography variant="body2">
                  Скасувати
                </Typography>
              </Button>
              <Button
                onClick={handleDeleteTest}
                variant="contained"
                disabled={deleteInProgress}
                sx={getButtonSx('contained', theme.palette.error.main)}
              >
                {deleteInProgress ? (
                  <Typography variant="body2">
                    Видалення...
                  </Typography>
                ) : (
                  <Typography variant="body2">
                    Підтвердити видалення
                  </Typography>
                )}
              </Button>
            </>
          ) : (
            <>
              {/* Admin delete button - updated with icon and smaller width */}
              {isAdmin && (
                <Button
                  onClick={toggleDeleteMode}
                  variant="outlined"
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 600,
                    height: '120px',
                    width: '120px', // Fixed width instead of flex
                    minWidth: 'unset', // Remove minimum width constraint
                    maxWidth: '120px', // Limit maximum size
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 1,
                    p: 2,
                    transition: 'all 0.2s ease-in-out',
                    borderColor: theme.palette.error.main,
                    color: theme.palette.error.main,
                    '&:hover': {
                      borderColor: theme.palette.error.dark,
                      backgroundColor: alpha(theme.palette.error.main, 0.05)
                    }
                  }}
                >
                  <DeleteIcon sx={{ fontSize: '2rem', mb: 1 }} />
                  <Typography variant="body2" sx={{ textAlign: 'center' }}>
                    Видалити з папки
                  </Typography>
                </Button>
              )}

              {/* Admin edit button */}
              {isAdmin && (
                <Button
                  onClick={handleEditTest}
                  variant="outlined"
                  sx={{
                    ...getButtonSx('outlined'),
                    borderColor: theme.palette.warning.main,
                    color: theme.palette.warning.main,
                    '&:hover': {
                      borderColor: theme.palette.warning.dark,
                      backgroundColor: alpha(theme.palette.warning.main, 0.05)
                    }
                  }}
                >
                  <EditIcon sx={{ fontSize: '2rem', mb: 1 }} />
                  <Typography variant="body2">
                    Редагувати тест
                  </Typography>
                </Button>
              )}

              {hasCompletedTrials && (
                <Button
                  onClick={handleReviewTest}
                  variant="outlined"
                  sx={getButtonSx('outlined')}
                >
                  <LocalLibraryRoundedIcon sx={{ fontSize: '2rem', mb: 1 }} />
                  <Typography variant="body2">
                    Переглянути останню спробу
                  </Typography>
                </Button>
              )}

              <Button
                onClick={() => onStart(test.tfp_sha)}
                variant="contained"
                sx={getButtonSx('contained')}
              >
                <PlayArrowIcon sx={{ fontSize: '2rem', mb: 1 }} />
                <Typography variant="body2">
                  Почати тест
                </Typography>
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

const TestsPage: React.FC = () => {
  // TODO: create new folders, deactivate folders
  // TODO: add existing tests to folders
  // TODO: add test details edit functionality
  // TODO: add module tests logic and ui
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // Dynamic header offset based on screen size
  const HEADER_OFFSET = isMobile ? 50 : isMedium ? 70 : 100;

  const [folderList, setFolderList] = useState<FolderObject[]>([]);
  const [filteredFolderList, setFilteredFolderList] = useState<FolderObject[]>([]);
  const [folderSearchQuery, setFolderSearchQuery] = useState<string>('');
  const [openFolderId, setOpenFolderId] = useState<number | null>(null);
  const [previousFolderId, setPreviousFolderId] = useState<number | null>(null);
  const [folderTests, setFolderTests] = useState<TestCardMeta[]>([]);
  const [filteredTests, setFilteredTests] = useState<TestCardMeta[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [folderLoading, setFolderLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [creatingTest, setCreatingTest] = useState<boolean>(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedTest, setSelectedTest] = useState<TestCardMeta | null>(null);

  // Create refs for scrolling and sticky behavior
  const folderRefs = useRef<{ [key: number]: React.RefObject<HTMLDivElement> }>({});
  const testListRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const folderSearchInputRef = useRef<HTMLInputElement>(null);

  // Initialize refs for each folder
  useEffect(() => {
    folderList.forEach(folder => {
      if (!folderRefs.current[folder.folder_id]) {
        folderRefs.current[folder.folder_id] = React.createRef();
      }
    });
  }, [folderList]);

  // load initial tests folders
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

  // Auto-focus search input when a folder is opened
  useEffect(() => {
    if (openFolderId !== null && !folderLoading) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 300); // Delay to ensure the transition has completed
    }
  }, [openFolderId, folderLoading]);

  // Helper function to scroll to a folder
  const scrollToFolder = (folderId: number) => {
    if (folderRefs.current[folderId]?.current) {
      setTimeout(() => {
        const folderElement = folderRefs.current[folderId]?.current;
        if (folderElement) {
          // Get the element's position relative to the viewport
          const elementRect = folderElement.getBoundingClientRect();
          // Scroll with offset to account for header height
          window.scrollTo({
            top: window.scrollY + elementRect.top - HEADER_OFFSET,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  };

  // Scroll to opened folder
  useEffect(() => {
    if (openFolderId !== null) {
      scrollToFolder(openFolderId);
    } else if (previousFolderId !== null) {
      // If a folder was just closed, scroll to it
      scrollToFolder(previousFolderId);
    }
  }, [openFolderId, previousFolderId]);

  const handleFolderClick = async (folderId: number) => {
    // If clicking the already open folder, close it and remember which folder was closed
    if (openFolderId === folderId) {
      setPreviousFolderId(folderId);
      setOpenFolderId(null);
      return;
    }

    // Remember previous folder before changing to the new one
    setPreviousFolderId(openFolderId);

    // Set the new folder as open and start loading its tests
    setOpenFolderId(folderId);
    setFolderLoading(true);
    setFolderTests([]);
    setFilteredTests([]);

    try {
      const response = await GetFolderTests(folderId) as FolderTests;
      if (response.success && response.test_dicts) {
        console.log('Loaded tests:', response.test_dicts);
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
    console.log(`Test clicked: ${test.test_name} (ID: ${test.test_id})`);
    setSelectedTest(test);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleStartTest = (tfpSha: string) => {
    console.log(`Starting test with tfp_sha: ${tfpSha}`);
    navigate(`/test-view/${tfpSha}`);
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

  // Find the original index of a test in the unfiltered list
  const getOriginalIndex = (testId: number) => {
    return folderTests.findIndex(test => test.test_id === testId);
  };

  // Handle creating a new test in the current folder
  const handleCreateNewTest = async () => {
    if (!openFolderId) return;

    setCreatingTest(true);
    try {
      const response = await CreateEmptyTest(openFolderId);
      if (response.success && response.tfp_sha) {
        navigate(`/tests/edit/${response.tfp_sha}`);
      } else {
        setError('Failed to create new test');
      }
    } catch (err) {
      console.error('Error creating new test:', err);
      setError('An error occurred while creating a new test');
    } finally {
      setCreatingTest(false);
    }
  };

  // Load user session data to check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const sessionData = await GetSessionData();
        if (sessionData && sessionData.is_admin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, []);

  // Add a callback to refresh folder tests when a test is removed
  const handleTestRemoved = async () => {
    if (openFolderId !== null) {
      // Reload the tests for the current folder
      setFolderLoading(true);
      try {
        const response = await GetFolderTests(openFolderId) as FolderTests;
        if (response.success && response.test_dicts) {
          setFolderTests(response.test_dicts);
          setFilteredTests(response.test_dicts);
        }
      } catch (err) {
        console.error('Error reloading folder tests:', err);
      } finally {
        setFolderLoading(false);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 1 }}>
      {/* Folder Search Bar */}
      {!loading && !error && folderList.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            p: 1.5,
            borderRadius: '16px',
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
              px: 2,
              py: 0.5,
              '& .MuiInputBase-input': {
                transition: theme.transitions.create('width'),
              },
              boxShadow: `0px 1px 3px ${alpha(theme.palette.common.black, 0.04)}`,
              border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
            }}
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon color="action" sx={{ opacity: 0.6 }} />
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

      {loading ? (
        <LoadingDots />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : filteredFolderList.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {filteredFolderList.map((folder) => (
            <Box
              key={folder.folder_id}
              ref={folderRefs.current[folder.folder_id] || (folderRefs.current[folder.folder_id] = React.createRef())}
              sx={{
                position: 'relative',
                zIndex: openFolderId === folder.folder_id ? 2 : 1
              }}
            >
              <Card
                sx={{
                  position: openFolderId === folder.folder_id ? 'sticky' : 'static',
                  top: HEADER_OFFSET,
                  zIndex: 3,
                  width: '100%',
                  borderRadius: '16px', // don't change
                  boxShadow: openFolderId === folder.folder_id
                    ? `0px 2px 8px ${alpha(theme.palette.common.black, 0.08)}`
                    : `0px 1px 3px ${alpha(theme.palette.common.black, 0.05)}`, // Lighter shadow
                  border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`, // Lighter border
                  transition: 'all 0.2s ease-in-out', // Smooth transition for hover effects
                  '&:hover': {
                    boxShadow: openFolderId === folder.folder_id
                      ? `0px 2px 8px ${alpha(theme.palette.common.black, 0.08)}`
                      : `0px 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
                    transform: openFolderId === folder.folder_id
                      ? 'none'
                      : 'translateY(-2px)'
                  }
                }}
              >
                <CardActionArea
                  onClick={() => handleFolderClick(folder.folder_id)}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pr: 2,
                    borderRadius: openFolderId === folder.folder_id
                      ? '16px 16px 0 0'
                      : '16px', // Match card border radius
                    py: 0.5 // Add a bit more vertical padding
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, py: 2 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        mb: 0.5
                      }}
                    >
                      {folder.folder_name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontSize: '0.9rem'
                      }}
                    >
                      На цьому етапі доступно {declinateWord(folder.elements_count, 'тест')}.
                    </Typography>
                  </CardContent>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFolderClick(folder.folder_id);
                    }}
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
                      ? <ExpandLessIcon />
                      : <ExpandMoreIcon />
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
                  ref={testListRef}
                  sx={{
                    mt: 0,
                    mb: 2,
                    mr: 1,
                    borderLeft: '2px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                    borderRadius: '0 0 16px 16px',
                    ml: 2,
                    position: 'relative',
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      backgroundColor: theme.palette.background.paper,
                      borderRadius: '0 0 12px 12px',
                      overflow: 'hidden',
                      border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                      borderTop: 'none',
                      marginTop: '-1px',
                    }}
                  >
                    {/* Test Search Bar - only show when there are at least 10 tests */}
                    {folderTests.length >= 10 && (
                      <Box
                        sx={{
                          p: 1.5,
                          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                          backgroundColor: alpha(theme.palette.primary.main, 0.03)
                        }}
                      >
                        <InputBase
                          inputRef={searchInputRef}
                          fullWidth
                          placeholder="Пошук тестів..."
                          value={searchQuery}
                          onChange={handleSearchChange}
                          sx={{
                            backgroundColor: theme.palette.common.white,
                            borderRadius: '8px',
                            px: 2,
                            py: 0.5,
                            '& .MuiInputBase-input': {
                              transition: theme.transitions.create('width'),
                            },
                            boxShadow: `0px 1px 3px ${alpha(theme.palette.common.black, 0.04)}`,
                            border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                          }}
                          startAdornment={
                            <InputAdornment position="start">
                              <SearchIcon color="action" sx={{ opacity: 0.6 }} />
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
                      <Box sx={{ py: 3, px: 2, display: 'flex', justifyContent: 'center' }}>
                        <LoadingDots />
                      </Box>
                    ) : filteredTests.length > 0 ? (
                      <List disablePadding>
                        {/* Add "Create New Test" button for admin users */}
                        {isAdmin && (
                          <>
                            <ListItemButton
                              onClick={handleCreateNewTest}
                              disabled={creatingTest}
                              sx={{
                                py: 1.5,
                                px: 3,
                                transition: 'all 0.15s ease',
                                backgroundColor: alpha(theme.palette.success.light, 0.05),
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.success.light, 0.1),
                                },
                                display: 'flex',
                                gap: 2
                              }}
                            >
                              <Typography
                                sx={{
                                  fontWeight: 600,
                                  color: theme.palette.success.main,
                                  minWidth: '24px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                +
                              </Typography>
                              <ListItemText
                                primary={
                                  <Typography sx={{ fontWeight: 500, color: theme.palette.success.main }}>
                                    {creatingTest ? 'Створення тесту...' : 'Додати новий тест'}
                                  </Typography>
                                }
                              />
                             
                            </ListItemButton>
                            <Divider component="li" sx={{ borderColor: alpha(theme.palette.divider, 0.5) }} />
                          </>
                        )}
                        {filteredTests.map((test, index, array) => {
                          // Get original index for consistent numbering
                          const originalIndex = getOriginalIndex(test.test_id);
                          return (
                            <React.Fragment key={test.test_id}>
                              <ListItemButton
                                onClick={() => handleTestClick(test)}
                                sx={{
                                  py: 1.5,
                                  px: 3,
                                  transition: 'all 0.15s ease',
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                  },
                                  display: 'flex',
                                  gap: 2
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontWeight: 600,
                                    color: theme.palette.primary.main,
                                    opacity: 0.8,
                                    minWidth: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  {originalIndex + 1}.
                                </Typography>
                                <ListItemText
                                  primary={
                                    <Typography sx={{ fontWeight: 500 }}>
                                      {test.test_name}
                                    </Typography>
                                  }
                                />
                                <Box sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  color: theme.palette.primary.main
                                }}>
                                  {(test.complete_trials && test.complete_trials > 0 && test.correct_percentage !== undefined) ? (
                                    <>
                                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {Math.round(test.correct_percentage)}%
                                      </Typography>
                                      <CheckCircleIcon sx={{ fontSize: '1rem' }} />
                                    </>
                                  ) : (
                                    <FiberManualRecordIcon sx={{ fontSize: '0.7rem' }} />
                                  )}
                                </Box>
                              </ListItemButton>
                              {index < array.length - 1 && (
                                <Divider
                                  component="li"
                                  sx={{
                                    borderColor: alpha(theme.palette.divider, 0.5)
                                  }}
                                />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </List>
                    ) : folderTests.length > 0 && searchQuery ? (
                      <Typography
                        sx={{
                          py: 3,
                          px: 3,
                          textAlign: 'center',
                          color: theme.palette.text.secondary
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
                          color: theme.palette.text.secondary
                        }}
                      >
                        Немає тестів для цього модуля.
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
            color: theme.palette.text.secondary
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
            color: theme.palette.text.secondary
          }}
        >
          Немає доступних папок з тестами.
        </Typography>
      )}

      {/* Test Start Modal */}
      <TestStartModal
        open={modalOpen}
        test={selectedTest}
        onClose={handleCloseModal}
        onStart={handleStartTest}
        isAdmin={isAdmin} // Pass the actual isAdmin state
        onTestRemoved={handleTestRemoved}
      />
    </Container>
  );
};

export default TestsPage;