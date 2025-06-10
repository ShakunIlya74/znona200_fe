import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Box, Typography, Container, Paper, Tabs, Tab, CircularProgress, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { GetLessonView, LessonCardMeta, LessonViewResponse, WebinarDict, SlideDict } from '../../services/LessonService';
import { TestCardMeta } from '../tests/interfaces';
import LoadingDots from '../../components/tools/LoadingDots';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import PDFDisplay from '../utils/PDFDisplay';
import VideoDisplay from '../utils/VideoDisplay';

const EditLessonPage: React.FC = () => {
    const { lfp_sha } = useParams<{ lfp_sha: string }>();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [lessonData, setLessonData] = useState<LessonCardMeta | null>(null);
    const [webinarDicts, setWebinarDicts] = useState<WebinarDict[]>([]);
    const [slideDicts, setSlideDicts] = useState<SlideDict[]>([]);
    const [testCards, setTestCards] = useState<TestCardMeta[]>([]);    const [tabValue, setTabValue] = useState<number>(0);
    const [dragOverVideo, setDragOverVideo] = useState(false);
    const [dragOverSlides, setDragOverSlides] = useState(false);
    const theme = useTheme();
    const navigate = useNavigate();

    // Track available tabs to correctly map tab index to content
    const [tabsConfig, setTabsConfig] = useState<{ hasVideos: boolean, hasSlides: boolean }>({
        hasVideos: false,
        hasSlides: false
    });

    useEffect(() => {
        const loadLessonData = async () => {
            if (!lfp_sha) {
                setError('Lesson ID is missing');
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const response = await GetLessonView(lfp_sha) as LessonViewResponse;
                console.log(response);
                if (response.success && response.webinar_card) {
                    setLessonData(response.webinar_card);
                    setWebinarDicts(response.webinar_dicts || []);
                    setSlideDicts(response.slide_dicts || []);
                    setTestCards(response.test_cards || []);                    // Set tab configuration based on available content - always show tabs in edit mode
                    setTabsConfig({
                        hasVideos: true, // Always show video tab in edit mode
                        hasSlides: true  // Always show slides tab in edit mode
                    });
                } else {
                    setError(response.error || 'Failed to load lesson data');
                }
            } catch (err) {
                console.error(err);
                setError('An error occurred while loading the lesson');
            } finally {
                setLoading(false);
            }
        };

        loadLessonData();
    }, [lfp_sha]);

    const handleBackClick = () => {
        navigate('/webinars');
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    // Video upload handlers
    const handleVideoFileSelect = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/*';
        input.onchange = (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (files && files.length > 0) {
                console.log('Video file selected:', files[0]);
                // TODO: Implement video upload logic
            }
        };
        input.click();
    }, []);

    const handleVideoDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOverVideo(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            console.log('Video file dropped:', files[0]);
            // TODO: Implement video upload logic
        }
    }, []);

    const handleVideoDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOverVideo(true);
    }, []);

    const handleVideoDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOverVideo(false);
    }, []);

    // Slides upload handlers
    const handleSlidesFileSelect = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf';
        input.onchange = (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (files && files.length > 0) {
                console.log('Slides file selected:', files[0]);
                // TODO: Implement slides upload logic
            }
        };
        input.click();
    }, []);

    const handleSlidesDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOverSlides(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            console.log('Slides file dropped:', files[0]);
            // TODO: Implement slides upload logic
        }
    }, []);

    const handleSlidesDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOverSlides(true);
    }, []);

    const handleSlidesDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOverSlides(false);
    }, []);    // Video action handlers
    const handleDownloadVideo = useCallback((videoUrl: string) => {
        const link = document.createElement('a');
        link.href = videoUrl;
        link.download = 'video'; // Browser will add appropriate extension
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, []);

    const handleDeleteVideo = useCallback(() => {
        console.log('Delete video clicked - placeholder action');
        // TODO: Implement actual video deletion logic
    }, []);    // Memoize the video component to keep it mounted
    const videoComponent = useMemo(() => {
        return (
            <Box>
                {/* Video Upload Zone */}
                <Paper
                    elevation={dragOverVideo ? 4 : 1}
                    sx={{
                        p: 2,
                        mb: 2,
                        border: `2px dashed ${dragOverVideo ? theme.palette.primary.main : theme.palette.divider}`,
                        backgroundColor: dragOverVideo ? theme.palette.action.hover : 'transparent',
                        transition: 'all 0.2s ease-in-out',
                        cursor: 'pointer',
                        '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                            borderColor: theme.palette.primary.main,
                        }
                    }}
                    onDrop={handleVideoDrop}
                    onDragOver={handleVideoDragOver}
                    onDragLeave={handleVideoDragLeave}
                    onClick={handleVideoFileSelect}
                >
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: 2,
                        minHeight: 80
                    }}>
                        <VideoFileIcon color="primary" sx={{ fontSize: 40 }} />
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body1" color="primary">
                                Перетягніть відео сюди або натисніть для вибору
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Підтримуються файли: MP4, AVI, MOV, WMV
                            </Typography>
                            {/* TODO: check if they are accepted for video player */}
                        </Box>
                        <Button
                            variant="outlined"
                            startIcon={<AttachFileIcon />}
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleVideoFileSelect();
                            }}
                        >
                            Огляд
                        </Button>
                    </Box>
                </Paper>                {/* Existing Video Display */}
                {webinarDicts.length > 0 && (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 1,
                        }}
                    >                        {webinarDicts[0].url ? (
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', minHeight: '300px' }}>
                                {/* Video Player */}
                                <Box sx={{ flex: 1 }}>
                                    <VideoDisplay
                                        src={webinarDicts[0].url}
                                        controls={true}
                                        fluid={true}
                                        responsive={true}
                                        preload="metadata"
                                        width="100%"
                                        height="auto"
                                    />
                                </Box>
                                
                                {/* Action Buttons */}
                                <Box sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    gap: 1,
                                    maxWidth: '200px',
                                    flex: '0 0 auto',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '100%'
                                }}>                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        startIcon={<DownloadIcon />}
                                        onClick={() => handleDownloadVideo(webinarDicts[0].url)}
                                        sx={{ 
                                            whiteSpace: 'nowrap',
                                            width: '160px',
                                            '&:hover': {
                                                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                            }
                                        }}
                                    >
                                        Завантажити
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<DeleteIcon />}
                                        onClick={handleDeleteVideo}
                                        sx={{ 
                                            whiteSpace: 'nowrap',
                                            width: '160px',
                                            '&:hover': {
                                                backgroundColor: alpha(theme.palette.error.main, 0.05),
                                            }
                                        }}
                                    >
                                        Видалити
                                    </Button>
                                </Box>
                            </Box>
                        ) : (
                            <Typography variant="body1" sx={{ color: theme.palette.common.black }}>
                                Відео недоступне
                            </Typography>
                        )}
                    </Paper>
                )}
            </Box>
        );
    }, [webinarDicts, theme, dragOverVideo, handleVideoDrop, handleVideoDragOver, handleVideoDragLeave, handleVideoFileSelect, handleDownloadVideo, handleDeleteVideo]);    // Memoize the PDFDisplay component to keep it mounted
    const pdfDisplayComponent = useMemo(() => {
        return (
            <Box>
                {/* Slides Upload Zone */}
                <Paper
                    elevation={dragOverSlides ? 4 : 1}
                    sx={{
                        p: 2,
                        mb: 2,
                        border: `2px dashed ${dragOverSlides ? theme.palette.primary.main : theme.palette.divider}`,
                        backgroundColor: dragOverSlides ? theme.palette.action.hover : 'transparent',
                        transition: 'all 0.2s ease-in-out',
                        cursor: 'pointer',
                        '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                            borderColor: theme.palette.primary.main,
                        }
                    }}
                    onDrop={handleSlidesDrop}
                    onDragOver={handleSlidesDragOver}
                    onDragLeave={handleSlidesDragLeave}
                    onClick={handleSlidesFileSelect}
                >
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: 2,
                        minHeight: 80
                    }}>
                        <PictureAsPdfIcon color="primary" sx={{ fontSize: 40 }} />
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body1" color="primary">
                                Перетягніть презентацію сюди або натисніть для вибору
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Підтримуються файли PDF
                            </Typography>
                        </Box>
                        <Button
                            variant="outlined"
                            startIcon={<AttachFileIcon />}
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSlidesFileSelect();
                            }}
                        >
                            Огляд
                        </Button>
                    </Box>
                </Paper>

                {/* Existing Slides Display */}
                {slideDicts.length > 0 && slideDicts[0].slide_content && (
                    <PDFDisplay
                        pdfUrl={slideDicts[0].slide_content}
                        visiblePagePercentage={0.8}
                    />
                )}
            </Box>
        );
    }, [slideDicts, theme, dragOverSlides, handleSlidesDrop, handleSlidesDragOver, handleSlidesDragLeave, handleSlidesFileSelect]);

    // Memoize the test components - just showing test names for now
    const testComponents = useMemo(() => {
        return testCards.map((test, index) => (
            <Box
                key={`test-content-${test.test_id}`}
                sx={{ textAlign: 'center', py: 4 }}
            >
                <Typography variant="h5" gutterBottom>
                    {test.test_name}
                </Typography>
                {test.test_description && (
                    <Typography variant="body1" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                        {test.test_description}
                    </Typography>
                )}
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Test ID: {test.test_id}
                </Typography>
                {test.complete_trials && (
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
                        Complete trials: {test.complete_trials}
                    </Typography>
                )}
            </Box>
        ));
    }, [testCards, theme.palette.text.secondary]);

    // Function to determine if a tab content should be visible
    const isTabVisible = (tabIndex: number): boolean => {
        return tabValue === tabIndex;
    };    // Calculate tab indices - always show video and slides in edit mode
    const getTabIndices = useMemo(() => {
        const videoTabIndex = 0;  // Always first tab
        const slideTabIndex = 1;  // Always second tab
        const testStartIndex = 2; // Tests start from third tab

        return { videoTabIndex, slideTabIndex, testStartIndex };
    }, []);

    return (
        <Container maxWidth="lg" sx={{ py: 2 }}>
            {/* Header section with back button and title */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 3,
                flexDirection: 'row',
                gap: 2
            }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBackClick}
                    sx={{
                        borderRadius: '8px',
                        color: theme.palette.primary.main,
                        borderColor: theme.palette.primary.main,
                        '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        }
                    }}
                />

                {lessonData && (
                    <Typography variant="h4" sx={{
                        fontWeight: 600,
                        color: theme.palette.primary.main,
                        flexGrow: 1,
                        fontSize: 'calc(2.125rem / 1.4)'
                    }}>
                        Редагування: {lessonData.lesson_name}
                    </Typography>
                )}
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                    <LoadingDots />
                </Box>
            ) : error ? (
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: '16px',
                        border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                        backgroundColor: alpha(theme.palette.error.main, 0.05)
                    }}
                >
                    <Typography color="error" variant="h6" gutterBottom>
                        Помилка
                    </Typography>
                    <Typography color="error">
                        {error}
                    </Typography>
                </Paper>
            ) : lessonData ? (
                <>
                    {/* Lesson metadata */}
                    <Box sx={{ mb: 3 }}>
                        {lessonData.date && (
                            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                Дата: {lessonData.date}
                            </Typography>
                        )}
                        {lessonData.duration && (
                            <Typography variant="subtitle1" sx={{ fontWeight: 500, mt: 0.5 }}>
                                Тривалість: {lessonData.duration}
                            </Typography>
                        )}
                        {lessonData.description && (
                            <Typography variant="body1" sx={{ mt: 2 }}>
                                {lessonData.description}
                            </Typography>
                        )}
                    </Box>                    {/* Tabs section - always show video and slides tabs in edit mode */}
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
                            value={tabValue}
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
                            {/* Always render tabs in edit mode: Videos, Slides, Tests */}
                            <Tab label="Відео" />
                            <Tab label="Презентація" />
                            {testCards.map((test, index) => (
                                <Tab 
                                    key={`test-${test.test_id}`} 
                                    label={testCards.length > 1 ? `Квіз ${index + 1}` : 'Квіз'} 
                                />
                            ))}
                        </Tabs>
                    </Paper>

                    {/* Tab content - all content is always mounted but only visible based on the active tab */}
                    <Box sx={{ mt: 2 }}>                        {/* Video Tab Content */}
                        <Box sx={{ display: isTabVisible(getTabIndices.videoTabIndex) ? 'block' : 'none' }}>
                            {videoComponent}
                        </Box>{/* Slides Tab Content */}
                        <Box
                            sx={{
                                visibility: isTabVisible(getTabIndices.slideTabIndex) ? 'visible' : 'hidden',
                                position: isTabVisible(getTabIndices.slideTabIndex) ? 'static' : 'absolute',
                                zIndex: isTabVisible(getTabIndices.slideTabIndex) ? 'auto' : -1,
                                p: 0,
                                borderRadius: '12px',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            {pdfDisplayComponent}
                        </Box>

                        {/* Test Tabs Content */}
                        {testComponents.map((testComponent, index) => (
                            <Box
                                key={`test-wrapper-${index}`}
                                sx={{
                                    display: isTabVisible(getTabIndices.testStartIndex + index) ? 'block' : 'none'
                                }}
                            >
                                {testComponent}
                            </Box>
                        ))}
                    </Box>
                </>
            ) : (
                <Typography variant="h5" sx={{ textAlign: 'center', color: theme.palette.text.secondary }}>
                    Дані уроку недоступні
                </Typography>
            )}
        </Container>
    );
};

export default EditLessonPage;