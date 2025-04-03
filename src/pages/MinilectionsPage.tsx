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
  InputAdornment
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { GetMiniLectionsData, GetFolderMiniLections, MiniLectionCardMeta } from '../services/MiniLectionService';
import LoadingDots from '../components/tools/LoadingDots';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useNavigate } from 'react-router-dom';

// Define folder object type
interface FolderObject {
  folder_name: string;
  folder_id: number;
}

interface MiniLectionsData {
  success: boolean;
  folder_dicts?: FolderObject[];
}



interface FolderMiniLections {
  success: boolean;
  minilection_dicts?: MiniLectionCardMeta[];
}

const MinilectionsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const navigate = useNavigate();
  
  // Dynamic header offset based on screen size
  const HEADER_OFFSET = isMobile ? 50 : isMedium ? 70 : 100;

  const [folderList, setFolderList] = useState<FolderObject[]>([]);
  const [openFolderId, setOpenFolderId] = useState<number | null>(null);
  const [previousFolderId, setPreviousFolderId] = useState<number | null>(null);
  const [folderMiniLections, setFolderMiniLections] = useState<MiniLectionCardMeta[]>([]);
  const [filteredMiniLections, setFilteredMiniLections] = useState<MiniLectionCardMeta[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [folderLoading, setFolderLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Create refs for scrolling and sticky behavior
  const folderRefs = useRef<{[key: number]: React.RefObject<HTMLDivElement>}>({});
  const miniLectionListRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Initialize refs for each folder
  useEffect(() => {
    folderList.forEach(folder => {
      if (!folderRefs.current[folder.folder_id]) {
        folderRefs.current[folder.folder_id] = React.createRef();
      }
    });
  }, [folderList]);

  // load initial mini-lections folders
  useEffect(() => {
    const loadMiniLectionsData = async () => {
      setLoading(true);
      try {
        const res = await GetMiniLectionsData() as MiniLectionsData;
        if (res.success && res.folder_dicts) {
          setFolderList(res.folder_dicts);
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

    loadMiniLectionsData();
  }, []);

  // When folder minilections change, reset search and update filtered minilections
  useEffect(() => {
    setSearchQuery('');
    setFilteredMiniLections(folderMiniLections);
  }, [folderMiniLections]);

  // Filter minilections when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMiniLections(folderMiniLections);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = folderMiniLections.filter(minilection => 
      minilection.minilection_name.toLowerCase().includes(query)
    );
    setFilteredMiniLections(filtered);
  }, [searchQuery, folderMiniLections]);

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
    
    // Set the new folder as open and start loading its mini-lections
    setOpenFolderId(folderId);
    setFolderLoading(true);
    setFolderMiniLections([]);
    setFilteredMiniLections([]);
    
    try {
      const response = await GetFolderMiniLections(folderId) as FolderMiniLections;
      if (response.success && response.minilection_dicts) {
        setFolderMiniLections(response.minilection_dicts);
        setFilteredMiniLections(response.minilection_dicts);
      } else {
        setError('Failed to load mini-lections for this folder');
        setFolderMiniLections([]);
        setFilteredMiniLections([]);
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while loading mini-lections');
      setFolderMiniLections([]);
      setFilteredMiniLections([]);
    } finally {
      setFolderLoading(false);
    }
  };

  const handleMiniLectionClick = (miniLection: MiniLectionCardMeta) => {
    console.log(`Mini-lection clicked: ${miniLection.minilection_name} (ID: ${miniLection.minilection_id})`);
    // Navigate to the minilection view page using the mfp_sha
    navigate(`/minilection-view/${miniLection.minilection_sha}`);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  // Find the original index of a minilection in the unfiltered list
  const getOriginalIndex = (miniLectionId: number) => {
    return folderMiniLections.findIndex(minilection => minilection.minilection_id === miniLectionId);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 1 }}>      
      {loading ? (
        <LoadingDots />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {folderList.map((folder) => (
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
                  borderRadius: '16px', // Increased border radius for more modern look
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
                    borderRadius: '16px', // Match card border radius
                    py: 0.5 // Add a bit more vertical padding
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, py: 2 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600, 
                        fontSize: '1.1rem'
                      }}
                    >
                      {folder.folder_name}
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
                  ref={miniLectionListRef}
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
                    {/* Search Bar */}
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
                        placeholder=""
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
                    
                    {folderLoading ? (
                      <Box sx={{ py: 3, px: 2, display: 'flex', justifyContent: 'center' }}>
                        <LoadingDots />
                      </Box>
                    ) : filteredMiniLections.length > 0 ? (
                      <List disablePadding>
                        {filteredMiniLections.map((miniLection, index, array) => {
                          // Get original index for consistent numbering
                          const originalIndex = getOriginalIndex(miniLection.minilection_id);
                          return (
                            <React.Fragment key={miniLection.minilection_id}>
                              <ListItemButton
                                onClick={() => handleMiniLectionClick(miniLection)}
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
                                      {miniLection.minilection_name}
                                    </Typography>
                                  } 
                                />
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
                    ) : folderMiniLections.length > 0 && searchQuery ? (
                      <Typography 
                        sx={{ 
                          py: 3, 
                          px: 3, 
                          textAlign: 'center',
                          color: theme.palette.text.secondary
                        }}
                      >
                        Немає мінілекцій, що відповідають вашому пошуковому запиту.
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
                        No mini-lections available for this folder.
                      </Typography>
                    )}
                  </Paper>
                </Box>
              </Collapse>
            </Box>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default MinilectionsPage;