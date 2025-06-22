import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Paper, Divider, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { GetMiniLectionView, MiniLectionCardMeta, MiniLectionViewResponse } from '../services/MiniLectionService';
import LoadingDots from '../components/tools/LoadingDots';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VideoDisplay from './utils/VideoDisplay';

const MinilectionViewPage: React.FC = () => {
    const { minilection_sha } = useParams<{ minilection_sha: string }>();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [minilectionData, setMinilectionData] = useState<MiniLectionCardMeta | null>(null);
    const theme = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        const loadMinilectionData = async () => {
            if (!minilection_sha) {
                setError('Minilection ID is missing');
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const response = await GetMiniLectionView(minilection_sha) as MiniLectionViewResponse;
                console.log('Minilection View Response:', response);
                if (response.success && response.minilection_dict) {
                    setMinilectionData(response.minilection_dict);
                } else {
                    setError(response.error || 'Failed to load minilection data');
                }
            } catch (err) {
                console.error(err);
                setError('An error occurred while loading the minilection');
            } finally {
                setLoading(false);
            }
        };

        loadMinilectionData();
    }, [minilection_sha]);

    const handleBackClick = () => {
        navigate('/minilections');
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
                Назад до мінілекцій
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
            ) : minilectionData ? (
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: '16px',
                        border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                        boxShadow: `0px 2px 8px ${alpha(theme.palette.common.black, 0.05)}`
                    }}
                >                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        {minilectionData.minilection_name}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    
                    {/* Minilection description */}
                    {/* TODO: make visable when it is editable */}
                    {/* {minilectionData.minilection_description && (
                        <Box sx={{ mt: 3 }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2,
                                    backgroundColor: alpha(theme.palette.primary.main, 0.03),
                                    borderRadius: '8px'
                                }}
                            >
                                <Typography variant="body1">
                                    {minilectionData.minilection_description}
                                </Typography>
                            </Paper>
                        </Box>
                    )} */}
                    
                    {/* Minilection Video Content */}
                    {minilectionData.minilection_url && (
                        <Box sx={{ mt: 4 }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 1,
                                    borderRadius: '12px',
                                }}
                            >
                                <VideoDisplay
                                    src={minilectionData.minilection_url}
                                    controls={true}
                                    fluid={true}
                                    responsive={true}
                                    preload="metadata"
                                    width="100%"
                                    height="auto"
                                />
                            </Paper>
                        </Box>
                    )}
                </Paper>
            ) : (
                <Typography variant="h5" sx={{ textAlign: 'center', color: theme.palette.text.secondary }}>
                    No minilection data available
                </Typography>
            )}
        </Container>
    );
};

export default MinilectionViewPage;