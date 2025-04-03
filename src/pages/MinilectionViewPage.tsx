import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Paper, Divider, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { GetMiniLectionView, MiniLectionCardMeta, MiniLectionViewResponse } from '../services/MiniLectionService';
import LoadingDots from '../components/tools/LoadingDots';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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
                >
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        {minilectionData.minilection_name}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    
                    {/* Minilection metadata */}
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            Minilection ID: {minilectionData.minilection_id}
                        </Typography>
                    </Box>
                    
                    {/* Minilection description */}
                    {minilectionData.description && (
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
                                    {minilectionData.description}
                                </Typography>
                            </Paper>
                        </Box>
                    )}
                    
                    {/* Content placeholder - would be replaced with actual minilection content */}
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h6" sx={{ fontWeight: 500, mb: 2 }}>
                            Minilection Content
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
                                Minilection content will be displayed here
                            </Typography>
                        </Paper>
                    </Box>
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