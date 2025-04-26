import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Paper, Divider, CircularProgress, Button, Tooltip, Tabs, Tab } from '@mui/material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { GetLessonView, LessonCardMeta, LessonViewResponse, WebinarDict, SlideDict } from '../../services/LessonService';
import { TestCardMeta } from '../tests/interfaces';
import LoadingDots from '../../components/tools/LoadingDots';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const LessonViewPage: React.FC = () => {
    const { lfp_sha } = useParams<{ lfp_sha: string }>();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [lessonData, setLessonData] = useState<LessonCardMeta | null>(null);
    const [webinarDicts, setWebinarDicts] = useState<WebinarDict[]>([]);
    const [slideDicts, setSlideDicts] = useState<SlideDict[]>([]);
    const [testCards, setTestCards] = useState<TestCardMeta[]>([]);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [tabValue, setTabValue] = useState<number>(0);
    const theme = useTheme();
    const navigate = useNavigate();    
    
    // Track available tabs to correctly map tab index to content
    const [tabsConfig, setTabsConfig] = useState<{hasVideos: boolean, hasSlides: boolean}>({
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
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };
    
    // Function to determine which content to render based on tab index
    const renderTabContent = () => {
        let currentTabIndex = 0;
        const { hasVideos, hasSlides } = tabsConfig;
        
        // Videos tab (first if available)
        if (hasVideos) {
            if (tabValue === currentTabIndex) {
                const webinar = webinarDicts[0]; // Show first video
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
                            // <iframe 
                            //     src={webinar.url}
                            //     style={{ 
                            //         width: '100%', 
                            //         height: '100%', 
                            //         border: 'none' 
                            //     }}
                            //     title={webinar.webinar_title || "Webinar video"}
                            //     allowFullScreen
                            // />
                            <>{webinar.url}</>
                        ) : (
                            <Typography variant="body1" sx={{ color: theme.palette.common.white }}>
                                Video not available
                            </Typography>
                        )}
                    </Paper>
                );
            }
            currentTabIndex++;
        }
        
        // Slides tab (second if available)
        if (hasSlides) {
            if (tabValue === currentTabIndex) {
                const slide = slideDicts[0]; // Show first slide
                return (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 0,
                            borderRadius: '12px',
                            minHeight: '500px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            overflow: 'hidden'
                        }}
                    >
                        {slide.slide_content ? (
                            <iframe 
                                src={slide.slide_content}
                                style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    minHeight: '500px',
                                    border: 'none' 
                                }}
                                title={slide.slide_title || "Slides"}
                            />
                        ) : (
                            <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
                                Slides not available
                            </Typography>
                        )}
                    </Paper>
                );
            }
            currentTabIndex++;
        }
        
        // Test tabs (remaining tabs)
        const testIndex = tabValue - currentTabIndex;
        if (testIndex >= 0 && testIndex < testCards.length) {
            const test = testCards[testIndex];
            return (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h5" gutterBottom>
                        {test.test_name}
                    </Typography>
                    {test.test_description && (
                        <Typography variant="body1" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                            {test.test_description}
                        </Typography>
                    )}
                    <Button 
                        variant="contained"
                        color="primary"
                        component={Link}
                        to={`/tests/${test.tfp_sha || test.test_id}`}
                        sx={{ mt: 2 }}
                    >
                        Start Test
                    </Button>
                </Box>
            );
        }
        
        // Fallback if no matching content found
        return (
            <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
                No content available for this tab
            </Typography>
        );
    };

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
                    {/* Tab content */}
                    <Box sx={{ mt: 2 }}>
                        {renderTabContent()}
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