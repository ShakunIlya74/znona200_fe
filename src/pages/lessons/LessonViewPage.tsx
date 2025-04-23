import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Paper, Divider, CircularProgress, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { GetLessonView, LessonCardMeta, LessonViewResponse } from '../../services/LessonService';
import LoadingDots from '../../components/tools/LoadingDots';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const LessonViewPage: React.FC = () => {
    const { lfp_sha } = useParams<{ lfp_sha: string }>();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [lessonData, setLessonData] = useState<LessonCardMeta | null>(null);
    const theme = useTheme();
    const navigate = useNavigate();

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
                // console.log(response);
                if (response.success && response.webinar_dict) {
                    setLessonData(response.webinar_dict);
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

    return (
        <Container maxWidth="lg" sx={{ py: 2 }}>
            <Button 
                variant="outlined" 
                startIcon={<ArrowBackIcon />} 
                onClick={handleBackClick}
                sx={{ 
                    mb: 2, 
                    borderRadius: '8px',
                    color: theme.palette.primary.main,
                    borderColor: theme.palette.primary.main,
                    '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    }
                }}
            >
                Назад до вебінарів
            </Button>
            
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
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: '16px',
                        border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                        boxShadow: `0px 2px 8px ${alpha(theme.palette.common.black, 0.05)}`
                    }}
                >
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        {lessonData.lesson_name}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    
                    {/* Lesson metadata */}
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            Lesson ID: {lessonData.lesson_id}
                        </Typography>
                        {lessonData.date && (
                            <Typography variant="subtitle1" sx={{ fontWeight: 500, mt: 1 }}>
                                Date: {lessonData.date}
                            </Typography>
                        )}
                        {lessonData.duration && (
                            <Typography variant="subtitle1" sx={{ fontWeight: 500, mt: 1 }}>
                                Duration: {lessonData.duration}
                            </Typography>
                        )}
                    </Box>
                    
                    {/* Lesson description */}
                    {lessonData.description && (
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
                                Description
                            </Typography>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2,
                                    backgroundColor: alpha(theme.palette.primary.main, 0.03),
                                    borderRadius: '8px'
                                }}
                            >
                                <Typography variant="body1">
                                    {lessonData.description}
                                </Typography>
                            </Paper>
                        </Box>
                    )}
                    
                    {/* Video content placeholder - would be replaced with actual video player */}
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h6" sx={{ fontWeight: 500, mb: 2 }}>
                            Lesson Content
                        </Typography>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 0,
                                backgroundColor: theme.palette.common.black,
                                borderRadius: '12px',
                                aspectRatio: '16/9',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <Typography variant="body1" sx={{ color: theme.palette.common.white }}>
                                Video player will be displayed here
                            </Typography>
                        </Paper>
                    </Box>
                </Paper>
            ) : (
                <Typography variant="h5" sx={{ textAlign: 'center', color: theme.palette.text.secondary }}>
                    No lesson data available
                </Typography>
            )}
        </Container>
    );
};

export default LessonViewPage;