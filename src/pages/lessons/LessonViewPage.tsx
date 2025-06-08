import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Box, Typography, Container, Paper, Divider, CircularProgress, Button, Tooltip, Tabs, Tab } from '@mui/material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { GetLessonView, LessonCardMeta, LessonViewResponse, WebinarDict, SlideDict } from '../../services/LessonService';
import { TestCardMeta } from '../tests/interfaces';
import TestViewComponent from '../tests/TestViewPageComponent';
import TestReviewComponent from '../tests/TestReviewPageComponent';
import LoadingDots from '../../components/tools/LoadingDots';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PDFViewer from '../utils/PDFViewer';
import PDFDisplay from '../utils/PDFDisplay';

const LessonViewPage: React.FC = () => {
    const { lfp_sha } = useParams<{ lfp_sha: string }>();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [lessonData, setLessonData] = useState<LessonCardMeta | null>(null);
    const [webinarDicts, setWebinarDicts] = useState<WebinarDict[]>([]);
    const [slideDicts, setSlideDicts] = useState<SlideDict[]>([]);
    const [testCards, setTestCards] = useState<TestCardMeta[]>([]);    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [tabValue, setTabValue] = useState<number>(0);
    const [activeTestId, setActiveTestId] = useState<number | null>(null);
    const [reviewTestId, setReviewTestId] = useState<number | null>(null);
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
                    setIsAdmin(response.is_admin || false);

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
    };    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };    const handleStartTest = useCallback((testId: number) => {
        setActiveTestId(testId);
        setReviewTestId(null); // Clear review mode when starting a test
    }, []);

    const handleBackFromTest = useCallback(() => {
        setActiveTestId(null);
        setReviewTestId(null); // Clear both test and review modes
    }, []);    
    const handleTestComplete = useCallback((testId: string) => {
        // Test completed, show the review component
        setActiveTestId(null);
        setReviewTestId(parseInt(testId, 10));
        console.log('Test completed:', testId);
    }, []);
    const handleTestRecomplete = useCallback((testId: string) => {
        // Find the test by testId and start it
        const test = testCards.find(t => t.test_id === parseInt(testId, 10));
        if (test) {
            setActiveTestId(test.test_id);
            setReviewTestId(null);
        }
    }, [testCards]);

    // Memoize the video component to keep it mounted
    const videoComponent = useMemo(() => {
        if (webinarDicts.length > 0) {
            const webinar = webinarDicts[0];
            return (
                <Paper
                    elevation={0}
                    sx={{
                        p: 0,
                        backgroundColor: theme.palette.common.black,
                        borderRadius: '12px',
                        aspectRatio: '16/9',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'hidden'
                    }}
                >
                    {webinar.url ? (
                        <>{webinar.url}</>
                    ) : (
                        <Typography variant="body1" sx={{ color: theme.palette.common.white }}>
                            Video not available
                        </Typography>
                    )}
                </Paper>
            );
        }
        return null;
    }, [webinarDicts, theme.palette.common.black, theme.palette.common.white]);

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
    }, [slideDicts]);    // Memoize the test components to keep them mounted
    const testComponents = useMemo(() => {
        return testCards.map((test, index) => (
            <Box
                key={`test-content-${test.test_id}`}
                sx={{ textAlign: 'center', py: 4 }}
            >
                {activeTestId === test.test_id ? (
                    // Render the TestViewComponent when this test is active
                    <TestViewComponent
                        testId={test.test_id}
                        isCompactView={true}
                        onBack={handleBackFromTest}
                        onTestComplete={handleTestComplete}
                        showTopBar={false}
                        containerHeight="auto"
                    />
                ) : reviewTestId === test.test_id ? (
                    // Render the TestReviewComponent when this test is in review mode
                    <TestReviewComponent
                        testId={test.test_id}
                        isCompactView={true}
                        onBack={handleBackFromTest}
                        onTestRecomplete={handleTestRecomplete}
                        showTopBar={false}
                        containerHeight="auto"
                    />                
                ) : test.complete_trials && test.complete_trials >= 1 ? (
                    // Render the TestReviewComponent when there are completed trials
                    <TestReviewComponent
                        testId={test.test_id}
                        isCompactView={true}
                        onBack={handleBackFromTest}
                        onTestRecomplete={handleTestRecomplete}
                        showTopBar={false}
                        containerHeight="auto"
                    />
                ) : (
                    // Render the test start screen when not active and no completed trials
                    <>
                        <Typography variant="h5" gutterBottom>
                            {test.test_name}
                        </Typography>
                        {test.test_description && (
                            <Typography variant="body1" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                                {test.test_description}
                            </Typography>
                        )}
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleStartTest(test.test_id)}
                                sx={{ mt: 2 }}
                            >
                                Start Test
                            </Button>
                        </Box>
                    </>
                )}
            </Box>
        ));
    }, [testCards, activeTestId, reviewTestId, theme.palette.text.secondary, handleBackFromTest, handleTestComplete, handleStartTest, handleTestRecomplete]);

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
                <Tooltip title="Назад до вебінарів" arrow placement="right">
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
                </Tooltip>

                {lessonData && (
                    <Typography variant="h4" sx={{
                        fontWeight: 600,
                        color: theme.palette.primary.main,
                        flexGrow: 1,
                        fontSize: 'calc(2.125rem / 1.4)' // h4 default size is 2.125rem, dividing by 1.4
                    }}>
                        {lessonData.lesson_name}
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
                        Error
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
                                Date: {lessonData.date}
                            </Typography>
                        )}
                        {lessonData.duration && (
                            <Typography variant="subtitle1" sx={{ fontWeight: 500, mt: 0.5 }}>
                                Duration: {lessonData.duration}
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
                                {webinarDicts.length > 0 && <Tab label="Videos" />}
                                {slideDicts.length > 0 && <Tab label="Slides" />}
                                {testCards.map((test, index) => (
                                    <Tab key={`test-${test.test_id}`} label={`Test ${index + 1}`} />
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
                                        Slides not available
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
                    No lesson data available
                </Typography>
            )}
        </Container>
    );
};

export default LessonViewPage;