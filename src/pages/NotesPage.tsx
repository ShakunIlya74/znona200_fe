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
  alpha
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { GetNotesData, GetFolderNotes } from '../services/NoteService';
import LoadingDots from '../components/tools/LoadingDots';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// Define folder object type
interface FolderObject {
  folder_name: string;
  folder_id: number;
}

interface NotesData {
  success: boolean;
  folder_dicts?: FolderObject[];
}

interface NoteCardMeta {
  note_name: string;
  note_id: number;
}

interface FolderNotes {
  success: boolean;
  note_dicts?: NoteCardMeta[];
}

const NotesPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  // Dynamic header offset based on screen size
  const HEADER_OFFSET = isMobile ? 50 : isMedium ? 70 : 100;

  const [folderList, setFolderList] = useState<FolderObject[]>([]);
  const [openFolderId, setOpenFolderId] = useState<number | null>(null);
  const [previousFolderId, setPreviousFolderId] = useState<number | null>(null);
  const [folderNotes, setFolderNotes] = useState<NoteCardMeta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [folderLoading, setFolderLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Create refs for scrolling and sticky behavior
  const folderRefs = useRef<{[key: number]: React.RefObject<HTMLDivElement>}>({});
  const noteListRef = useRef<HTMLDivElement>(null);

  // Initialize refs for each folder
  useEffect(() => {
    folderList.forEach(folder => {
      if (!folderRefs.current[folder.folder_id]) {
        folderRefs.current[folder.folder_id] = React.createRef();
      }
    });
  }, [folderList]);

  // load initial notes folders
  useEffect(() => {
    const loadNotesData = async () => {
      setLoading(true);
      try {
        const res = await GetNotesData() as NotesData;
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

    loadNotesData();
  }, []);

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
    
    // Set the new folder as open and start loading its notes
    setOpenFolderId(folderId);
    setFolderLoading(true);
    setFolderNotes([]);
    
    try {
      const response = await GetFolderNotes(folderId) as FolderNotes;
      if (response.success && response.note_dicts) {
        setFolderNotes(response.note_dicts);
      } else {
        setError('Failed to load notes for this folder');
        setFolderNotes([]);
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while loading notes');
      setFolderNotes([]);
    } finally {
      setFolderLoading(false);
    }
  };

  const handleNoteClick = (noteId: number, noteName: string) => {
    console.log(`Note clicked: ${noteName} (ID: ${noteId})`);
    // Add your navigation or note handling logic here
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
                    boxShadow: `0px 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
                    transform: 'translateY(-2px)'
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
                  ref={noteListRef}
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
                    {folderLoading ? (
                      <Box sx={{ py: 3, px: 2, display: 'flex', justifyContent: 'center' }}>
                        <LoadingDots />
                      </Box>
                    ) : folderNotes.length > 0 ? (
                      <List disablePadding>
                        {folderNotes.map((note, index, array) => (
                          <React.Fragment key={note.note_id}>
                            <ListItemButton
                              onClick={() => handleNoteClick(note.note_id, note.note_name)}
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
                                {index + 1}.
                              </Typography>
                              <ListItemText 
                                primary={
                                  <Typography sx={{ fontWeight: 500 }}>
                                    {note.note_name}
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
                        ))}
                      </List>
                    ) : (
                      <Typography 
                        sx={{ 
                          py: 3, 
                          px: 3, 
                          textAlign: 'center',
                          color: theme.palette.text.secondary
                        }}
                      >
                        No notes available for this folder.
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

export default NotesPage;