import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Paper, Divider, Button, useMediaQuery } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { GetMiniLectionView, MiniLectionCardMeta, MiniLectionViewResponse } from '../services/MiniLectionService';
import LoadingDots from '../components/tools/LoadingDots';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VideoDisplay from './utils/VideoDisplay';
import FolderContentDrawer, { FolderContentItem } from '../components/tools/FolderContentDrawer';

const MinilectionViewPage: React.FC = () => {
    const { minilection_sha } = useParams<{ minilection_sha: string }>();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [minilectionData, setMinilectionData] = useState<MiniLectionCardMeta | null>(null);
    const [folderMinilections, setFolderMinilections] = useState<MiniLectionCardMeta[]>([]);
    const theme = useTheme();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        const loadMinilectionData = async () => {
            if (!minilection_sha) {
                setError('Minilection ID is missing');
                setLoading(false);
                return;
            }

            setLoading(true);            try {
                const response = await GetMiniLectionView(minilection_sha) as MiniLectionViewResponse;
                console.log('Minilection View Response:', response);
                if (response.success && response.minilection_dict) {
                    setMinilectionData(response.minilection_dict);
                    // Set folder minilections if available
                    if (response.folder_minilection_dicts) {
                        setFolderMinilections(response.folder_minilection_dicts);
                    }
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

    const handleMinilectionClick = (item: FolderContentItem) => {
        if (item.card_sha && item.card_sha !== minilection_sha) {
            navigate(`/minilection-view/${item.card_sha}`);
        }
    };

    const handleUrlClick = (url: string) => {
        navigate(url);
    };

    // Convert folder minilections to FolderContentItem format
    const folderContentItems: FolderContentItem[] = folderMinilections.map((minilection, index) => ({
        title: minilection.minilection_name,
        url: `/minilection-view/${minilection.minilection_sha}`,
        position: index + 1,
        is_selected: minilection.minilection_sha === minilection_sha,
        card_id: minilection.minilection_id.toString(),
        card_sha: minilection.minilection_sha,
        type: 'video' // Assuming minilections are video content
    }));    
      return (
        <>            
        <Container 
                maxWidth="lg" 
                sx={{ 
                    py: 2,
                    mr: (folderContentItems.length > 0 && !isMobile) ? '80px' : '0', // Add right margin when drawer is present on desktop
                    transition: 'margin-right 0.3s ease'
                }}
            >
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
                                            )}  */}

                        {/* Minilection Video Content */}
                        {minilectionData.minilection_url && (
                            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 1,
                                        borderRadius: '12px',
                                        width: '80%'
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
            </Container>            {/* Folder Content Drawer - only show if there are items */}
            {folderContentItems.length > 0 && (
                <FolderContentDrawer
                    items={folderContentItems}
                    onItemClick={handleMinilectionClick}
                    onUrlClick={handleUrlClick}
                    isMobile={isMobile}
                />
            )}
        </>
    );
};

export default MinilectionViewPage;