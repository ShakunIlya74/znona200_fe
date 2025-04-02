import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, CardActionArea, Container } from '@mui/material';
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
  // Add other properties as needed
}

interface TestCardMeta {
    test_name: string;
    test_id: number;
}

interface FolderTests {
    success: boolean;
    test_dicts?: TestCardMeta[]; // Based on how it's used in handleFolderClick
}

const TestsPage: React.FC = () => {
  const [folderList, setFolderList] = useState<FolderObject[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [folderTests, setFolderTests] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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
          // todo: check if redirect is needed
          //   navigate({pathname: '/logout',});
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

  const handleFolderClick = async (folderName: string, folderId: number) => {
    setSelectedFolder(folderName);
    setLoading(true);
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
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 1 }}>      
      {loading ? (
        <LoadingDots />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Box sx={{}}>
          {!selectedFolder ? (
            <>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 2 
              }}>
                {folderList.map((folder) => (
                  <Card key={folder.folder_id}>
                    <CardActionArea onClick={() => handleFolderClick(folder.folder_name, folder.folder_id)}>
                      <CardContent>
                        <Typography variant="h6">{folder.folder_name}</Typography>
                        <Typography variant="body2">
                          На цьому етапі доступно {declinateWord(folder.elements_count, 'тест')}.
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                ))}
              </Box>
            </>
          ) : (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h5" gutterBottom>
                  Tests for: {selectedFolder}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ cursor: 'pointer', color: 'primary.main', mb: 2 }}
                  onClick={() => setSelectedFolder(null)}
                >
                  ← Back to folders
                </Typography>
              </Box>
              
              {folderTests.length > 0 ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 2 
                }}>
                  {folderTests.map((test) => (
                    <Card key={test.test_id}>
                      <CardContent>
                        <Typography variant="h6">{test.test_name}</Typography>
                        {/* Add more test details as needed */}
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Typography>No tests available for this folder.</Typography>
              )}
            </>
          )}
        </Box>
      )}
    </Container>
  );
};

export default TestsPage;
