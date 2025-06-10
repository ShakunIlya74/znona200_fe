import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography, Container, Paper, Tabs, Tab, CircularProgress, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { GetLessonView, LessonCardMeta, LessonViewResponse, WebinarDict, SlideDict } from '../../services/LessonService';
import { TestCardMeta } from '../tests/interfaces';
import LoadingDots from '../../components/tools/LoadingDots';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PDFDisplay from '../utils/PDFDisplay';
import VideoDisplay from '../utils/VideoDisplay';

const EditLessonPage: React.FC = () => {
    const { lfp_sha } = useParams<{ lfp_sha: string }>();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [lessonData, setLessonData] = useState<LessonCardMeta | null>(null);
    const [webinarDicts, setWebinarDicts] = useState<WebinarDict[]>([]);
    const [slideDicts, setSlideDicts] = useState<SlideDict[]>([]);
    const [testCards, setTestCards] = useState<TestCardMeta[]>([]);
    const [tabValue, setTabValue] = useState<number>(0);
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
                    setTestCards(response.test_cards || []);

                    // Set tab configuration based on available content
                    setTabsConfig({
                        hasVideos: (response.webinar_dicts || []).length > 0,
                        hasSlides: (response.slide_dicts || []).length > 0
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

    // Memoize the video component to keep it mounted
    const videoComponent = useMemo(() => {
        if (webinarDicts.length > 0) {
            const webinar = webinarDicts[0];            
            return (
                <Paper
                    elevation={0}
                    sx={{
                        p: 1,
                    }}
                >
                    {webinar.url ? (
                        <VideoDisplay
                            src={webinar.url}
                            controls={true}
                            fluid={true}
                            responsive={true}
                            preload="metadata"
                            width="100%"
                            height="auto"
                        />
                    ) : (
                        <Typography variant="body1" sx={{ color: theme.palette.common.black }}>
                            Відео недоступне
                        </Typography>
                    )}
                </Paper>
            );
        }
        return null;
    }, [webinarDicts, theme.palette.common.black]);

    // Memoize the PDFDisplay component to keep it mounted
    const pdfDisplayComponent = useMemo(() => {
        if (slideDicts.length > 0 && slideDicts[0].slide_content) {
            console.log('PDF URL:', slideDicts[0].slide_content);
            return (
                <PDFDisplay
                    pdfUrl={slideDicts[0].slide_content}
                    visiblePagePercentage={0.8}
                />
            );
        }
        return null;
    }, [slideDicts]);

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
    };

    // Calculate tab indices
    const getTabIndices = useMemo(() => {
        const { hasVideos, hasSlides } = tabsConfig;
        let videoTabIndex = -1;
        let slideTabIndex = -1;
        let testStartIndex = 0;

        if (hasVideos) {
            videoTabIndex = 0;
            testStartIndex++;
        }

        if (hasSlides) {
            slideTabIndex = hasVideos ? 1 : 0;
            testStartIndex++;
        }

        return { videoTabIndex, slideTabIndex, testStartIndex };
    }, [tabsConfig]);

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
                    </Box>

                    {/* Tabs section */}
                    {(webinarDicts.length > 0 || slideDicts.length > 0 || testCards.length > 0) && (
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
                                {/* Always render tabs in consistent order: Videos, Slides, Tests */}
                                {webinarDicts.length > 0 && <Tab label="Відео" />}
                                {slideDicts.length > 0 && <Tab label="Презентація" />}
                                {testCards.map((test, index) => (
                                    <Tab 
                                        key={`test-${test.test_id}`} 
                                        label={testCards.length > 1 ? `Квіз ${index + 1}` : 'Квіз'} 
                                    />
                                ))}
                            </Tabs>
                        </Paper>
                    )}

                    {/* Tab content - all content is always mounted but only visible based on the active tab */}
                    <Box sx={{ mt: 2 }}>
                        {/* Video Tab Content */}
                        {tabsConfig.hasVideos && (
                            <Box sx={{ display: isTabVisible(getTabIndices.videoTabIndex) ? 'block' : 'none' }}>
                                {videoComponent}
                            </Box>
                        )}

                        {/* Slides Tab Content */}
                        {tabsConfig.hasSlides && (
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
                                {pdfDisplayComponent || (
                                    <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
                                        Презентація недоступна
                                    </Typography>
                                )}
                            </Box>
                        )}

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