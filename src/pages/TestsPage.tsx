import React, { useEffect, useState } from 'react';
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
  ListItemButton
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
  const [folderTests, setFolderTests] = useState<TestCardMeta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [folderLoading, setFolderLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
            <Box key={folder.folder_id}>
              <Card>
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
                <Box sx={{ pl: 2, pr: 2, mt: 1, mb: 2, borderLeft: '2px solid', borderColor: 'grey.300' }}>
                  {folderLoading ? (
                    <Box sx={{ py: 2 }}>
                      <LoadingDots />
                    </Box>
                  ) : folderTests.length > 0 ? (
                    <List disablePadding>
                      {folderTests.map((test, index, array) => (
                        <React.Fragment key={test.test_id}>
                          <ListItemButton
                            onClick={() => handleTestClick(test.test_id, test.test_name)}
                            sx={{ py: 1.5 }}
                          >
                            <ListItemText primary={test.test_name} />
                          </ListItemButton>
                          {index < array.length - 1 && <Divider component="li" />}
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Typography sx={{ py: 2 }}>No tests available for this folder.</Typography>
                  )}
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