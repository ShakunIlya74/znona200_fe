import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Paper, Divider, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { GetNoteView, NoteCardMeta, NoteViewResponse } from '../services/NoteService';
import LoadingDots from '../components/tools/LoadingDots';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PDFDisplay from './utils/PDFDisplay';

const NoteViewPage: React.FC = () => {
    const { note_sha } = useParams<{ note_sha: string }>();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [noteData, setNoteData] = useState<NoteCardMeta | null>(null);
    const theme = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        const loadNoteData = async () => {
            if (!note_sha) {
                setError('Note ID is missing');
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const response = await GetNoteView(note_sha) as NoteViewResponse;
                if (response.success && response.note_dict) {
                    setNoteData(response.note_dict);
                } else {
                    setError(response.error || 'Failed to load note data');
                }
            } catch (err) {
                console.error(err);
                setError('An error occurred while loading the note');
            } finally {
                setLoading(false);
            }
        };

        loadNoteData();
    }, [note_sha]);

    const handleBackClick = () => {
        navigate('/notes');
    };    return (
        <Container maxWidth="lg" sx={{ py: 2 }}>
            {/* Header section with back button and title */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 2,
                gap: 2
            }}>
                <Button
                    variant="text"
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBackClick}
                    sx={{
                        borderRadius: '8px',
                        color: theme.palette.primary.main,
                        minWidth: 'auto',
                        px: 1,
                        '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        }
                    }}
                />
                
                {noteData && (
                    <Typography variant="h5" sx={{
                        fontWeight: 600,
                        color: theme.palette.primary.main,
                        flexGrow: 1,
                        fontSize: '1.5rem'
                    }}>
                        {noteData.note_name}
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
                </Paper>            ) : noteData ? (
                <Box sx={{ mt: 1 }}>
                    {/* Note content */}
                    <Box>
                        {(noteData.watermarked_pdf_url || noteData.pdf_url) ? (
                            <PDFDisplay
                                pdfUrl={noteData.watermarked_pdf_url || noteData.pdf_url!}
                                visiblePagePercentage={0.6}
                                allowDownloading={false}
                                containerHeight={600}
                            />
                        ) : (
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    backgroundColor: alpha(theme.palette.grey[100], 0.5),
                                    borderRadius: '12px',
                                    minHeight: '200px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                                    PDF не доступний для цього конспекту
                                </Typography>
                            </Paper>
                        )}
                    </Box>
                </Box>
            ) : (
                <Typography variant="h5" sx={{ textAlign: 'center', color: theme.palette.text.secondary }}>
                    No note data available
                </Typography>
            )}
        </Container>
    );
};

export default NoteViewPage;