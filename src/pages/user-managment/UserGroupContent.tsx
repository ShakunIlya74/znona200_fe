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
    useTheme,
    Button
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import AddIcon from '@mui/icons-material/Add';
import LoadingDots from '../../components/tools/LoadingDots';
import { FolderInfo, getGroupLessonFolders, getGroupTestFolders } from '../../services/UserService';
import { declinateWord } from '../utils/utils';

interface UserGroupContentProps {
    groupId: number | string;
}

const UserGroupContent: React.FC<UserGroupContentProps> = ({ groupId }) => {
    const theme = useTheme();
    const [tabValue, setTabValue] = useState<number | null>(null);
    const [lessonFolders, setLessonFolders] = useState<FolderInfo[]>([]);
    const [testFolders, setTestFolders] = useState<FolderInfo[]>([]);
    const [filteredFolders, setFilteredFolders] = useState<FolderInfo[]>([]);
    const [showEmptyFolders, setShowEmptyFolders] = useState<boolean>(false);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Handle tab change
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        setShowEmptyFolders(false); // Reset to default view when changing tabs
    };

    // Toggle zero-count folders visibility
    const toggleShowEmptyFolders = () => {
        setShowEmptyFolders((prev) => !prev);
    };

    // Filter folders based on zero-count visibility
    useEffect(() => {
        const filterFolders = () => {
            if (tabValue === 0) {
                const nonEmptyFolders = lessonFolders.filter((folder) => (folder.group_elements_count || 0) > 0);
                const emptyFolders = lessonFolders.filter((folder) => (folder.group_elements_count || 0) === 0);

                setFilteredFolders(showEmptyFolders ? [...nonEmptyFolders, ...emptyFolders] : nonEmptyFolders);
            } else if (tabValue === 1) {
                const nonEmptyFolders = testFolders.filter((folder) => (folder.group_elements_count || 0) > 0);
                const emptyFolders = testFolders.filter((folder) => (folder.group_elements_count || 0) === 0);

                setFilteredFolders(showEmptyFolders ? [...nonEmptyFolders, ...emptyFolders] : nonEmptyFolders);
            }
        };

        filterFolders();
    }, [lessonFolders, testFolders, showEmptyFolders, tabValue]);

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
            <Box
                sx={{
                    mt: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    maxHeight: '50vh', // Maximum height of 50vh
                    overflowY: 'auto',  // Enable vertical scrolling
                    pr: 1,  // Add padding for the scrollbar
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
                {folders.map((folder) => (
                    <Card
                        key={folder.folder_id}
                        sx={{
                            borderRadius: '12px',
                            boxShadow: `0px 1px 3px ${alpha(theme.palette.common.black, 0.05)}`,
                            border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                            transition: 'all 0.2s ease-in-out',
                            flex: '0 0 auto', // Prevent card from shrinking
                            minHeight: 'fit-content', // Ensure minimum height based on content
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
                                        Додано {folder.group_elements_count}, всього {tabValue === 0 ? declinateWord(folder.elements_count, 'вебінар') : declinateWord(folder.elements_count, 'тест')}
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
                            py: 1.5,
                            '&:not(:last-child)': {
                                position: 'relative',
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    right: 0,
                                    top: '20%',
                                    height: '60%',
                                    width: '1px', // Changed from 1 to '1px' for a thin line
                                    backgroundColor: theme => alpha(theme.palette.divider, 0.3) // Reduced opacity for subtlety
                                }
                            }
                        }
                    }}
                >
                    <Tab label="Вебінари" value={0} />
                    <Tab label="Тести" value={1} /> 
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
                    {tabValue === 0 && renderFolders(filteredFolders)}
                    {tabValue === 1 && renderFolders(filteredFolders)}
                    {tabValue !== null && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                        {!showEmptyFolders && (
                            <Button
                                variant="outlined"
                                size="medium"
                                startIcon={<AddIcon />}
                                onClick={toggleShowEmptyFolders}
                                sx={{ borderRadius: '8px' }}
                            >
                                Додати матеріали з інших моделей
                            </Button>
                        )}
                    </Box>
                    )}  
                    {tabValue === null && (
                        <Typography
                            variant="body1"
                            sx={{
                                textAlign: 'center',
                                py: 2,
                                color: theme.palette.text.secondary
                            }}
                        >
                            Оберіть вкладку для перегляду матеріалів.
                        </Typography>
                    )}
                </>
            )}
        </Box>
    );
};

export default UserGroupContent;