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
  Paper
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { GetTestsData, GetFolderTests } from '../services/TestService';
import { declinateWord } from './utils/utils';
import LoadingDots from '../components/tools/LoadingDots';

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

interface TestCardMeta {
  test_name: string;
  test_id: number;
}

interface FolderTests {
  success: boolean;
  test_dicts?: TestCardMeta[];
}

const TestsPage: React.FC = () => {
  const [folderList, setFolderList] = useState<FolderObject[]>([]);
  const [openFolderId, setOpenFolderId] = useState<number | null>(null);
  const [previousFolderId, setPreviousFolderId] = useState<number | null>(null);
  const [folderTests, setFolderTests] = useState<TestCardMeta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [folderLoading, setFolderLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Create refs for scrolling and sticky behavior
  const folderRefs = useRef<{[key: number]: React.RefObject<HTMLDivElement>}>({});
  const testListRef = useRef<HTMLDivElement>(null);
  // Header height estimate - adjust if needed based on your actual header height
  const HEADER_OFFSET = 100; 

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
    
    try {
      const response = await GetFolderTests(folderId) as FolderTests;
      if (response.success && response.test_dicts) {
        setFolderTests(response.test_dicts);
      } else {
        setError('Failed to load tests for this folder');
        setFolderTests([]);
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while loading tests');
      setFolderTests([]);
    } finally {
      setFolderLoading(false);
    }
  };

  const handleTestClick = (testId: number, testName: string) => {
    console.log(`Test clicked: ${testName} (ID: ${testId})`);
    // Add your navigation or test handling logic here
  };

  return (
    <Container maxWidth="lg" sx={{ py: 1 }}>      
      {loading ? (
        <LoadingDots />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {folderList.map((folder) => (
            <Box 
              key={folder.folder_id}
              ref={folderRefs.current[folder.folder_id] || (folderRefs.current[folder.folder_id] = React.createRef())}
              sx={{
                position: 'relative',
                // Add z-index to make sure the sticky folder appears above other content
                zIndex: openFolderId === folder.folder_id ? 2 : 1
              }}
            >
              <Card
                sx={{
                  position: openFolderId === folder.folder_id ? 'sticky' : 'static',
                  top: HEADER_OFFSET, // Apply the same header offset to the sticky position
                  zIndex: 3,
                  width: '100%',
                  boxShadow: openFolderId === folder.folder_id ? 2 : 1,
                }}
              >
                <CardActionArea 
                  onClick={() => handleFolderClick(folder.folder_id)}
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pr: 2 
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{folder.folder_name}</Typography>
                    <Typography variant="body2">
                      На цьому етапі доступно {declinateWord(folder.elements_count, 'тест')}.
                    </Typography>
                  </CardContent>
                  <IconButton 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFolderClick(folder.folder_id);
                    }}
                    size="small"
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
                    mt: 1, 
                    mb: 2, 
                    borderLeft: '2px solid', 
                    borderColor: 'grey.300',
                    position: 'relative',
                  }}
                >
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      backgroundColor: 'white',
                      borderRadius: 1,
                      overflow: 'hidden'
                    }}
                  >
                    {folderLoading ? (
                      <Box sx={{ py: 2, px: 2 }}>
                        <LoadingDots />
                      </Box>
                    ) : folderTests.length > 0 ? (
                      <List disablePadding>
                        {folderTests.map((test, index, array) => (
                          <React.Fragment key={test.test_id}>
                            <ListItemButton
                              onClick={() => handleTestClick(test.test_id, test.test_name)}
                              sx={{ py: 1.5, px: 2 }}
                            >
                              <ListItemText primary={test.test_name} />
                            </ListItemButton>
                            {index < array.length - 1 && <Divider component="li" />}
                          </React.Fragment>
                        ))}
                      </List>
                    ) : (
                      <Typography sx={{ py: 2, px: 2 }}>No tests available for this folder.</Typography>
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

export default TestsPage;