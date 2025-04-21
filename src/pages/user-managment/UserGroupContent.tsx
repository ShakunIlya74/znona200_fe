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
    Button,
    List,
    ListItem,
    ListItemText,
    Collapse,
    Divider,
    ListItemButton,
    InputBase,
    InputAdornment,
    IconButton
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import LoadingDots from '../../components/tools/LoadingDots';
import { 
    FolderInfo, 
    getGroupLessonFolders, 
    getGroupTestFolders,
    getFolderTestsWithGroupMembership,
    getFolderLessonsWithGroupMembership,
    FolderTestInfo,
    FolderLessonInfo
} from '../../services/UserService';
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
    
    // New state variables for folder items
    const [selectedFolderId, setSelectedFolderId] = useState<string | number | null>(null);
    const [folderTests, setFolderTests] = useState<FolderTestInfo[]>([]);
    const [folderLessons, setFolderLessons] = useState<FolderLessonInfo[]>([]);
    const [loadingItems, setLoadingItems] = useState<boolean>(false);
    const [itemError, setItemError] = useState<string | null>(null);

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
    const handleFolderClick = async (folder: FolderInfo) => {
        try {
            // If clicking the same folder, toggle the display (close it if open)
            if (selectedFolderId === folder.folder_id) {
                setSelectedFolderId(null);
                setFolderTests([]);
                setFolderLessons([]);
                return;
            }

            setSelectedFolderId(folder.folder_id);
            setLoadingItems(true);
            setItemError(null);

            // Fetch items based on the current tab (lessons or tests)
            if (tabValue === 0) { // Lessons tab
                const response = await getFolderLessonsWithGroupMembership(folder.folder_id, groupId);
                if (response.success && response.lessons) {
                    setFolderLessons(response.lessons);
                    setFolderTests([]); // Clear tests when showing lessons
                } else {
                    setItemError(response.message || 'Failed to load lessons');
                }
            } else if (tabValue === 1) { // Tests tab
                const response = await getFolderTestsWithGroupMembership(folder.folder_id, groupId);
                if (response.success && response.tests) {
                    setFolderTests(response.tests);
                    setFolderLessons([]); // Clear lessons when showing tests
                } else {
                    setItemError(response.message || 'Failed to load tests');
                }
            }
        } catch (err) {
            console.error('Error loading folder items:', err);
            setItemError('An error occurred while loading items');
        } finally {
            setLoadingItems(false);
        }
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
                    maxHeight: '70vh', // Increased maximum height for better scrolling
                    overflowY: 'auto',
                    pr: 1,
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
                    <Box 
                        key={folder.folder_id}
                        sx={{
                            position: 'relative',
                            zIndex: selectedFolderId === folder.folder_id ? 2 : 1
                        }}
                    >
                        <Card
                            sx={{
                                position: selectedFolderId === folder.folder_id ? 'sticky' : 'static',
                                top: 0, // Changed from 16 to 0 to position it just at the top
                                zIndex: 3,
                                width: '100%',
                                borderRadius: '12px',
                                boxShadow: selectedFolderId === folder.folder_id 
                                    ? `0px 2px 8px ${alpha(theme.palette.common.black, 0.08)}` 
                                    : `0px 1px 3px ${alpha(theme.palette.common.black, 0.05)}`,
                                border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                                transition: 'all 0.2s ease-in-out',
                                backgroundColor: folder.group_elements_count === 0 ? theme.palette.grey[100] : 'white', // Only apply transparency to empty folders
                                '&:hover': {
                                    boxShadow: selectedFolderId === folder.folder_id
                                        ? `0px 2px 8px ${alpha(theme.palette.common.black, 0.08)}`
                                        : `0px 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
                                    transform: selectedFolderId === folder.folder_id
                                        ? 'none'
                                        : 'translateY(-2px)'
                                }
                            }}
                        >
                            <CardActionArea
                                onClick={() => handleFolderClick(folder)}
                                sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    pr: 2,
                                    borderRadius: '12px',
                                    py: 0.5
                                }}
                            >
                                <CardContent sx={{ flexGrow: 1, py: 1.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <FolderIcon 
                                                color={folder.group_elements_count === 0 ? "action" : "primary"} 
                                                sx={{ opacity: folder.group_elements_count === 0 ? 0.6 : 0.8 }} 
                                            />
                                            <Typography 
                                                variant="body1" 
                                                sx={{ 
                                                    fontWeight: 500,
                                                    color: folder.group_elements_count === 0 ? theme.palette.text.secondary : 'inherit'
                                                }}
                                            >
                                                {folder.folder_name}
                                            </Typography>
                                        </Box>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: theme.palette.text.secondary,
                                                bgcolor: folder.group_elements_count === 0 
                                                    ? alpha(theme.palette.grey[300], 0.4)
                                                    : alpha(theme.palette.primary.main, 0.1),
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
                                <IconButton 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleFolderClick(folder);
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
                                    {selectedFolderId === folder.folder_id 
                                        ? <ExpandLessIcon /> 
                                        : <ExpandMoreIcon />
                                    }
                                </IconButton>
                            </CardActionArea>
                        </Card>
                        
                        {/* Items display directly below the folder, similar to LessonsPage */}
                        {selectedFolderId === folder.folder_id && (
                            <Collapse 
                                in={true} 
                                timeout="auto"
                                unmountOnExit
                            >
                                <Box 
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
                                        {/* Loading state */}
                                        {loadingItems ? (
                                            <Box sx={{ py: 3, px: 2, display: 'flex', justifyContent: 'center' }}>
                                                <LoadingDots />
                                            </Box>
                                        ) : (
                                            <>
                                                {/* Items list */}
                                                {(tabValue === 0 ? folderLessons : folderTests).length > 0 ? (
                                                    <List disablePadding>
                                                        {(tabValue === 0 ? folderLessons : folderTests).map((item, index, array) => {
                                                            const itemName = tabValue === 0 
                                                                ? (item as FolderLessonInfo).lesson_name 
                                                                : (item as FolderTestInfo).test_name;
                                                            
                                                            const itemId = tabValue === 0 
                                                                ? (item as FolderLessonInfo).lesson_id 
                                                                : (item as FolderTestInfo).test_id;
                                                                
                                                            const isAddedToGroup = item.added_to_group;
                                                                
                                                            return (
                                                                <React.Fragment key={itemId}>
                                                                    <ListItemButton
                                                                        sx={{ 
                                                                            py: 1.5, 
                                                                            px: 3,
                                                                            transition: 'all 0.15s ease',
                                                                            bgcolor: isAddedToGroup 
                                                                                ? alpha(theme.palette.success.light, 0.1)
                                                                                : 'transparent',
                                                                            '&:hover': {
                                                                                bgcolor: isAddedToGroup 
                                                                                    ? alpha(theme.palette.success.light, 0.2)
                                                                                    : alpha(theme.palette.primary.main, 0.04),
                                                                            },
                                                                            display: 'flex',
                                                                            gap: 2
                                                                        }}
                                                                    >
                                                                        <Typography 
                                                                            sx={{ 
                                                                                fontWeight: 600, 
                                                                                color: isAddedToGroup 
                                                                                    ? theme.palette.success.main
                                                                                    : theme.palette.primary.main,
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
                                                                                <Typography sx={{ 
                                                                                    fontWeight: isAddedToGroup ? 500 : 400,
                                                                                    color: isAddedToGroup 
                                                                                        ? theme.palette.success.dark 
                                                                                        : theme.palette.text.primary
                                                                                }}>
                                                                                    {itemName}
                                                                                </Typography>
                                                                            } 
                                                                        />
                                                                        {isAddedToGroup ? (
                                                                            <CheckCircleIcon 
                                                                                color="success" 
                                                                                fontSize="small"
                                                                                sx={{ opacity: 0.8 }}
                                                                            />
                                                                        ) : (
                                                                            <RemoveCircleOutlineIcon 
                                                                                color="action" 
                                                                                fontSize="small"
                                                                                sx={{ opacity: 0.6 }}
                                                                            />
                                                                        )}
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
                                                ) : (
                                                    <Typography 
                                                        sx={{ 
                                                            py: 3, 
                                                            px: 3, 
                                                            textAlign: 'center',
                                                            color: theme.palette.text.secondary
                                                        }}
                                                    >
                                                        {itemError || `Немає ${tabValue === 0 ? 'вебінарів' : 'тестів'} для цієї папки.`}
                                                    </Typography>
                                                )}
                                            </>
                                        )}
                                    </Paper>
                                </Box>
                            </Collapse>
                        )}
                    </Box>
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
                                    width: '1px',
                                    backgroundColor: theme => alpha(theme.palette.divider, 0.3)
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