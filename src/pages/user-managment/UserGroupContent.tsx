import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  alpha,
  useTheme
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import LoadingDots from '../../components/tools/LoadingDots';
import { FolderInfo, getGroupLessonFolders, getGroupTestFolders } from '../../services/UserService';


interface UserGroupContentProps {
  groupId: number | string;
}

const UserGroupContent: React.FC<UserGroupContentProps> = ({ groupId }) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState<number | null>(null);
  const [lessonFolders, setLessonFolders] = useState<FolderInfo[]>([]);
  const [testFolders, setTestFolders] = useState<FolderInfo[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Load folders when tab is selected
  useEffect(() => {
    const fetchFolders = async () => {
      setLoading(true);
      setError(null);

      try {
        if (tabValue === 0) {
          // Fetch lesson folders
          const response = await getGroupLessonFolders(groupId);
          if (response.success && response.folders) {
            setLessonFolders(response.folders);
            setIsAdmin(response.is_admin);
          } else {
            setError(response.message || 'Failed to load lesson folders');
          }
        } else if (tabValue === 1) {
          // Fetch test folders
          const response = await getGroupTestFolders(groupId);
          if (response.success && response.folders) {
            setTestFolders(response.folders);
            setIsAdmin(response.is_admin);
          } else {
            setError(response.message || 'Failed to load test folders');
          }
        }
      } catch (err) {
        console.error('Error loading folders:', err);
        setError('An error occurred while loading folders');
      } finally {
        setLoading(false);
      }
    };

    if (tabValue !== null) {
      fetchFolders();
    }
  }, [tabValue, groupId]);

  // Handle folder click
  const handleFolderClick = (folder: FolderInfo) => {
    console.log(`Folder clicked:`, folder);
    // Future navigation or action would go here
  };

  // Render folders
  const renderFolders = (folders: FolderInfo[]) => {
    if (folders.length === 0) {
      return (
        <Typography
          sx={{
            textAlign: 'center',
            py: 4,
            color: theme.palette.text.secondary
          }}
        >
          No folders available.
        </Typography>
      );
    }

    return (
      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {folders.map((folder) => (
          <Card
            key={folder.folder_id}
            sx={{
              borderRadius: '12px',
              boxShadow: `0px 1px 3px ${alpha(theme.palette.common.black, 0.05)}`,
              border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: `0px 4px 8px ${alpha(theme.palette.common.black, 0.1)}`,
                transform: 'translateY(-2px)'
              }
            }}
          >
            <CardActionArea
              onClick={() => handleFolderClick(folder)}
              sx={{ p: 0.5 }}
            >
              <CardContent sx={{ py: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <FolderIcon color="primary" sx={{ opacity: 0.8 }} />
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {folder.folder_name}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body2"
                    sx={{ 
                      color: theme.palette.text.secondary,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '12px',
                      fontWeight: 500
                    }}
                  >
                    {folder.group_elements_count}/{folder.elements_count} {tabValue === 0 ? 'lessons' : 'tests'}
                  </Typography>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: '16px',
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
          mb: 3
        }}
      >
        <Tabs
          value={tabValue !== null ? tabValue : false}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0'
            },
            '& .MuiTab-root': {
              fontWeight: 600,
              py: 1.5
            }
          }}
        >
          <Tab label="Lesson Folders" value={0} />
          <Tab label="Test Folders" value={1} />
        </Tabs>
      </Paper>

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

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <LoadingDots />
        </Box>
      ) : (
        <>
          {tabValue === 0 && renderFolders(lessonFolders)}
          {tabValue === 1 && renderFolders(testFolders)}
          {tabValue === null && (
            <Typography
              variant="body1"
              sx={{
                textAlign: 'center',
                py: 6,
                color: theme.palette.text.secondary
              }}
            >
              Select a tab to view folders
            </Typography>
          )}
        </>
      )}
    </Box>
  );
};

export default UserGroupContent;