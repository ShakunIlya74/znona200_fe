import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Box, Typography, Container, Paper, Tabs, Tab, CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress, Alert, TextField, IconButton, Snackbar } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { GetLessonView, LessonCardMeta, LessonViewResponse, WebinarDict, SlideDict, DeleteWebinarFromLesson, DeleteSlideFromLesson, UploadWebinar, UploadSlide, UpdateLessonTitle, DeleteLesson, CreateTestForLesson, RemoveTestFromLesson, AssignTestToLesson } from '../../services/LessonService';
import { TestCardMeta } from '../tests/interfaces';
import EditTestComponent from '../tests/EditTestPageComponent';
import TestSelectorComponent from '../tests/components/TestSelectorComponent';
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
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import PDFDisplay from '../utils/PDFDisplay';
import VideoDisplay from '../utils/VideoDisplay';

// Reusable Confirmation Dialog Component
interface ConfirmationDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    warningText?: string;
    confirmButtonText: string;
    confirmButtonColor?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
    loading?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    open,
    onClose,
    onConfirm,
    title,
    description,
    warningText,
    confirmButtonText,
    confirmButtonColor = 'error',
    loading = false
}) => {
    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            aria-labelledby="confirmation-dialog-title"
            aria-describedby="confirmation-dialog-description"
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle id="confirmation-dialog-title">
                {title}
            </DialogTitle>
            <DialogContent>
                <Typography id="confirmation-dialog-description" variant="body1">
                    {description}
                </Typography>
                {warningText && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        <strong>Увага:</strong> {warningText}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button 
                    onClick={onClose} 
                    color="primary"
                    variant="outlined"
                    disabled={loading}
                >
                    Скасувати
                </Button>
                <Button 
                    onClick={onConfirm} 
                    color={confirmButtonColor} 
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
                    disabled={loading}
                >
                    {confirmButtonText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const EditLessonPage: React.FC = () => {
    const { lfp_sha } = useParams<{ lfp_sha: string }>();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [lessonData, setLessonData] = useState<LessonCardMeta | null>(null);
    const [webinarDicts, setWebinarDicts] = useState<WebinarDict[]>([]);
    const [slideDicts, setSlideDicts] = useState<SlideDict[]>([]);
    const [testCards, setTestCards] = useState<TestCardMeta[]>([]);    
    const [tabValue, setTabValue] = useState<number>(0);
    const [dragOverVideo, setDragOverVideo] = useState(false);
    const [dragOverSlides, setDragOverSlides] = useState(false);    
    const [deleteVideoDialogOpen, setDeleteVideoDialogOpen] = useState(false);
    const [deletePdfDialogOpen, setDeletePdfDialogOpen] = useState(false);
    const [deletingVideo, setDeletingVideo] = useState(false);
    const [deletingSlide, setDeletingSlide] = useState(false);
    const [webinarToDelete, setWebinarToDelete] = useState<WebinarDict | null>(null);
    const [slideToDelete, setSlideToDelete] = useState<SlideDict | null>(null);
    
    // Upload state for videos
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [videoUploadProgress, setVideoUploadProgress] = useState(0);
    const [videoUploadError, setVideoUploadError] = useState<string | null>(null);
    const [videoUploadSuccess, setVideoUploadSuccess] = useState<string | null>(null);
    
    // Upload state for slides
    const [uploadingSlide, setUploadingSlide] = useState(false);
    const [slideUploadProgress, setSlideUploadProgress] = useState(0);
    const [slideUploadError, setSlideUploadError] = useState<string | null>(null);    
    const [slideUploadSuccess, setSlideUploadSuccess] = useState<string | null>(null);        // Test editing state
    const [editingTestId, setEditingTestId] = useState<number | null>(null);
      // Test creation state
    const [creatingTest, setCreatingTest] = useState(false);
    const [testCreationError, setTestCreationError] = useState<string | null>(null);
    
    // Test selection state
    const [showTestSelector, setShowTestSelector] = useState(false);
    const [assigningTest, setAssigningTest] = useState(false);
    const [testAssignError, setTestAssignError] = useState<string | null>(null);
    
    // Title editing state
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');
    const [updatingTitle, setUpdatingTitle] = useState(false);
    const [titleUpdateError, setTitleUpdateError] = useState<string | null>(null);
    
      const theme = useTheme();
    const navigate = useNavigate();

    // Track available tabs to correctly map tab index to content
    const [tabsConfig, setTabsConfig] = useState<{ hasVideos: boolean, hasSlides: boolean }>({
        hasVideos: false,
        hasSlides: false
    });

    useEffect(() => {        const loadLessonData = async () => {
            if (!lfp_sha) {
                setError('Ідентифікатор вебінару відсутній');
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
                    setError(response.error || 'Не вдалося завантажити дані вебінару');
                }
            } catch (err) {
                console.error(err);
                setError('Сталася помилка під час завантаження вебінару');
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
    };    // Video upload handlers
    const uploadVideoFile = useCallback(async (file: File) => {
        if (!lessonData) {
            setVideoUploadError('Lesson data not available');
            return;
        }

        setUploadingVideo(true);
        setVideoUploadProgress(0);
        setVideoUploadError(null);
        setVideoUploadSuccess(null);

        try {
            const result = await UploadWebinar(
                file,
                file.name, // Use filename as webinar title
                'WEBINAR', // video type
                lessonData.lesson_id,
                (progressEvent: any) => {
                    if (progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setVideoUploadProgress(progress);
                    }
                }
            );

            if (result.success && result.webinar_id) {
                setVideoUploadSuccess(`Video uploaded successfully: ${result.filename}`);
                
                // Add the new webinar to the local state
                const newWebinar: WebinarDict = {
                    webinar_id: result.webinar_id,
                    webinar_title: file.name,
                    url: result.url || '',
                    video_type: 'WEBINAR'
                };
                setWebinarDicts(prev => [...prev, newWebinar]);
                
                // Clear success message after 5 seconds
                setTimeout(() => setVideoUploadSuccess(null), 5000);
            } else {
                setVideoUploadError(result.error || 'Завантаження не вдалося');
            }
        } catch (error) {
            console.error('Error uploading video:', error);
            setVideoUploadError(error instanceof Error ? error.message : 'Завантаження не вдалося');
        } finally {
            setUploadingVideo(false);
        }
    }, [lessonData]);

    const handleVideoFileSelect = useCallback(() => {
        if (uploadingVideo) return;
        
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/*';
        input.onchange = (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (files && files.length > 0) {
                uploadVideoFile(files[0]);
            }
        };
        input.click();
    }, [uploadVideoFile, uploadingVideo]);

    const handleVideoDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOverVideo(false);
        
        if (uploadingVideo) return;
        
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('video/')) {
                uploadVideoFile(file);
            } else {
                setVideoUploadError('Будь ласка, виберіть файл правильного відеоформату');
            }
        }
    }, [uploadVideoFile, uploadingVideo]);

    const handleVideoDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOverVideo(true);
    }, []);

    const handleVideoDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOverVideo(false);
    }, []);
    // Slides upload handlers
    const uploadSlideFile = useCallback(async (file: File) => {
        if (!lessonData) {
            setSlideUploadError('Lesson data not available');
            return;
        }

        setUploadingSlide(true);
        setSlideUploadProgress(0);
        setSlideUploadError(null);
        setSlideUploadSuccess(null);

        try {
            const result = await UploadSlide(
                file,
                lessonData.lesson_id,
                file.name, // Use filename as slide title
                (progressEvent: any) => {
                    if (progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setSlideUploadProgress(progress);
                    }
                }
            );

            if (result.success && result.slide_id) {
                setSlideUploadSuccess(`Презентація успішно завантажена: ${result.filename}`);
                
                // Add the new slide to the local state
                const newSlide: SlideDict = {
                    slide_id: result.slide_id,
                    slide_title: file.name,
                    slide_type: 'PDF',
                    slide_content: result.url || ''
                };
                setSlideDicts(prev => [...prev, newSlide]);
                
                // Clear success message after 5 seconds
                setTimeout(() => setSlideUploadSuccess(null), 5000);
            } else {
                setSlideUploadError(result.error || 'Завантаження не вдалося');
            }
        } catch (error) {
            console.error('Error uploading slide:', error);
            setSlideUploadError(error instanceof Error ? error.message : 'Завантаження не вдалося');
        } finally {
            setUploadingSlide(false);
        }
    }, [lessonData]);

    const handleSlidesFileSelect = useCallback(() => {
        if (uploadingSlide) return;
        
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf';
        input.onchange = (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (files && files.length > 0) {
                uploadSlideFile(files[0]);
            }
        };
        input.click();
    }, [uploadSlideFile, uploadingSlide]);

    const handleSlidesDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOverSlides(false);
        
        if (uploadingSlide) return;
        
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type === 'application/pdf') {
                uploadSlideFile(file);
            } else {
                setSlideUploadError('Будь ласка, оберіть файл PDF формату');
            }
        }
    }, [uploadSlideFile, uploadingSlide]);

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
    }, []);    const handleDeleteVideo = useCallback((webinar: WebinarDict) => {
        setWebinarToDelete(webinar);
        setDeleteVideoDialogOpen(true);
    }, []);
      const handleConfirmDeleteVideo = useCallback(async () => {
        if (!lessonData || !webinarToDelete) {
            setDeleteVideoDialogOpen(false);
            return;
        }

        setDeletingVideo(true);
        try {
            const result = await DeleteWebinarFromLesson(
                webinarToDelete.webinar_id,
                lessonData.lesson_id
            );

            if (result.success) {
                console.log('Video deletion successful:', result.message);
                
                // Remove the webinar from the local state
                setWebinarDicts(prev => prev.filter(w => w.webinar_id !== webinarToDelete.webinar_id));
                
                // Optionally show success message
                // TODO: add a toast notification here
                
                // If webinar was completely deleted from system
                if (!result.webinar_still_used) {
                    console.log('Webinar was completely deleted from the system');
                    if (result.cdn_deleted) {
                        console.log('CDN file was successfully deleted');
                    } else if (result.cdn_error) {
                        console.warn('CDN deletion failed:', result.cdn_error);
                    }
                }
            } else {
                console.error('Video deletion failed:', result.error);
                // You could add error notification here
            }
        } catch (error) {
            console.error('Unexpected error during video deletion:', error);
            // You could add error notification here
        } finally {
            setDeletingVideo(false);
            setDeleteVideoDialogOpen(false);
            setWebinarToDelete(null);
        }
    }, [lessonData, webinarToDelete]);    const handleCancelDeleteVideo = useCallback(() => {
        setDeleteVideoDialogOpen(false);
        setWebinarToDelete(null);
    }, []);    // PDF action handlers
    const handleDeletePdf = useCallback((slide: SlideDict) => {
        setSlideToDelete(slide);
        setDeletePdfDialogOpen(true);
    }, []);    const handleConfirmDeletePdf = useCallback(async () => {
        if (!lessonData || !slideToDelete) {
            setDeletePdfDialogOpen(false);
            return;
        }

        setDeletingSlide(true);
        try {
            const result = await DeleteSlideFromLesson(
                slideToDelete.slide_id,
                lessonData.lesson_id
            );

            if (result.success) {
                console.log('Slide deletion successful:', result.message);
                
                // Remove the slide from the local state
                setSlideDicts(prev => prev.filter(s => s.slide_id !== slideToDelete.slide_id));
                
                // Optionally show success message
                // You could add a toast notification here
                
                // If slide was completely deleted from system
                if (!result.slide_still_used) {
                    console.log('Slide was completely deleted from the system');
                    if (result.cdn_deleted) {
                        console.log('CDN file was successfully deleted');
                    } else if (result.cdn_error) {
                        console.warn('CDN deletion failed:', result.cdn_error);
                    }
                }
            } else {
                console.error('Slide deletion failed:', result.error);
                // You could add error notification here
            }
        } catch (error) {
            console.error('Unexpected error during slide deletion:', error);
            // You could add error notification here
        } finally {
            setDeletingSlide(false);
            setDeletePdfDialogOpen(false);
            setSlideToDelete(null);
        }
    }, [lessonData, slideToDelete]);    const handleCancelDeletePdf = useCallback(() => {
        setDeletePdfDialogOpen(false);
        setSlideToDelete(null);
    }, []);// Memoize the video components to keep them mounted
    const videoComponents = useMemo(() => {
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
                        cursor: uploadingVideo ? 'not-allowed' : 'pointer',
                        opacity: uploadingVideo ? 0.7 : 1,
                        '&:hover': {
                            backgroundColor: uploadingVideo ? undefined : theme.palette.action.hover,
                            borderColor: uploadingVideo ? undefined : theme.palette.primary.main,
                        }
                    }}
                    onDrop={handleVideoDrop}
                    onDragOver={handleVideoDragOver}
                    onDragLeave={handleVideoDragLeave}
                    onClick={uploadingVideo ? undefined : handleVideoFileSelect}
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
                                {uploadingVideo ? 'Завантаження відео...' : 'Перетягніть відео сюди або натисніть для вибору'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Підтримуються файли: MP4, AVI, MOV, WMV
                            </Typography>
                        </Box>
                        <Button
                            variant="outlined"
                            startIcon={uploadingVideo ? <CircularProgress size={20} /> : <AttachFileIcon />}
                            size="small"
                            disabled={uploadingVideo}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleVideoFileSelect();
                            }}
                        >
                            {uploadingVideo ? 'Завантаження...' : 'Огляд'}
                        </Button>
                    </Box>
                </Paper>

                {/* Upload Progress */}
                {uploadingVideo && (
                    <Box sx={{ mb: 2 }}>
                        <LinearProgress variant="determinate" value={videoUploadProgress} />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, textAlign: 'center' }}>
                            {videoUploadProgress}% завантажено
                        </Typography>
                    </Box>
                )}

                {/* Upload Status Messages */}
                {videoUploadError && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setVideoUploadError(null)}>
                        {videoUploadError}
                    </Alert>
                )}
                {videoUploadSuccess && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setVideoUploadSuccess(null)}>
                        {videoUploadSuccess}
                    </Alert>
                )}

                {/* Existing Videos Display */}
                {webinarDicts.length > 0 && webinarDicts.map((webinar, index) => (
                    <Paper
                        key={`webinar-${webinar.webinar_id}-${index}`}
                        elevation={0}
                        sx={{
                            p: 1,
                            mb: webinarDicts.length > 1 ? 2 : 0,
                        }}
                    >
                        {webinarDicts.length > 1 && (
                            <Typography variant="h6" sx={{ mb: 1, color: theme.palette.primary.main }}>
                                Відео {index + 1}
                            </Typography>
                        )}
                        {webinar.url ? (
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', minHeight: '300px' }}>
                                {/* Video Player */}
                                <Box sx={{ flex: 1 }}>
                                    <VideoDisplay
                                        src={webinar.url}
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
                                }}>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        startIcon={<DownloadIcon />}
                                        onClick={() => handleDownloadVideo(webinar.url)}
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
                                        onClick={() => handleDeleteVideo(webinar)}
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
                ))}
            </Box>
        );
    }, [webinarDicts, theme, dragOverVideo, uploadingVideo, videoUploadProgress, videoUploadError, videoUploadSuccess, handleVideoDrop, handleVideoDragOver, handleVideoDragLeave, handleVideoFileSelect, handleDownloadVideo, handleDeleteVideo, setVideoUploadError, setVideoUploadSuccess]);    // Memoize the PDFDisplay components to keep them mounted
    const pdfDisplayComponents = useMemo(() => {
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
                        cursor: uploadingSlide ? 'not-allowed' : 'pointer',
                        opacity: uploadingSlide ? 0.7 : 1,
                        '&:hover': {
                            backgroundColor: uploadingSlide ? undefined : theme.palette.action.hover,
                            borderColor: uploadingSlide ? undefined : theme.palette.primary.main,
                        }
                    }}
                    onDrop={handleSlidesDrop}
                    onDragOver={handleSlidesDragOver}
                    onDragLeave={handleSlidesDragLeave}
                    onClick={uploadingSlide ? undefined : handleSlidesFileSelect}
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
                                {uploadingSlide ? 'Завантаження презентації...' : 'Перетягніть презентацію сюди або натисніть для вибору'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Підтримуються файли PDF
                            </Typography>
                        </Box>
                        <Button
                            variant="outlined"
                            startIcon={uploadingSlide ? <CircularProgress size={20} /> : <AttachFileIcon />}
                            size="small"
                            disabled={uploadingSlide}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSlidesFileSelect();
                            }}
                        >
                            {uploadingSlide ? 'Завантаження...' : 'Огляд'}
                        </Button>
                    </Box>
                </Paper>

                {/* Upload Progress */}
                {uploadingSlide && (
                    <Box sx={{ mb: 2 }}>
                        <LinearProgress variant="determinate" value={slideUploadProgress} />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, textAlign: 'center' }}>
                            {slideUploadProgress}% завантажено
                        </Typography>
                    </Box>
                )}

                {/* Upload Status Messages */}
                {slideUploadError && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSlideUploadError(null)}>
                        {slideUploadError}
                    </Alert>
                )}
                {slideUploadSuccess && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSlideUploadSuccess(null)}>
                        {slideUploadSuccess}
                    </Alert>
                )}

                {/* Existing Slides Display */}
                {slideDicts.length > 0 && slideDicts.map((slide, index) => {
                    if (slide.slide_content) {
                        return (
                            <Paper
                                key={`slide-${slide.slide_id}-${index}`}
                                elevation={0}
                                sx={{
                                    p: 1,
                                    mb: slideDicts.length > 1 ? 2 : 0,
                                }}
                            >
                                {slideDicts.length > 1 && (
                                    <Typography variant="h6" sx={{ mb: 1, color: theme.palette.primary.main }}>
                                        Презентація {index + 1}
                                    </Typography>
                                )}
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', minHeight: '300px' }}>
                                    {/* PDF Display */}
                                    <Box sx={{ flex: 1, width: '100%' }}>
                                        <PDFDisplay
                                            pdfUrl={slide.slide_content}
                                            visiblePagePercentage={1}
                                            containerWidthPercentage={80}
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
                                    }}>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            startIcon={<DeleteIcon />}
                                            onClick={() => handleDeletePdf(slide)}
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
                            </Paper>
                        );
                    }
                    return (
                        <Paper
                            key={`slide-${slide.slide_id}-${index}`}
                            elevation={0}
                            sx={{
                                p: 1,
                                mb: slideDicts.length > 1 ? 2 : 0,
                            }}
                        >
                            {slideDicts.length > 1 && (
                                <Typography variant="h6" sx={{ mb: 1, color: theme.palette.primary.main }}>
                                    Презентація {index + 1}
                                </Typography>
                            )}
                            <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                                Презентація недоступна
                            </Typography>
                        </Paper>
                    );
                })}
            </Box>
        );
    }, [slideDicts, theme, dragOverSlides, uploadingSlide, slideUploadProgress, slideUploadError, slideUploadSuccess, handleSlidesDrop, handleSlidesDragOver, handleSlidesDragLeave, handleSlidesFileSelect, handleDeletePdf, setSlideUploadError, setSlideUploadSuccess]);    // State for test deletion dialogs
    const [deleteTestDialogOpen, setDeleteTestDialogOpen] = useState(false);
    const [testToDelete, setTestToDelete] = useState<TestCardMeta | null>(null);
    const [deletingTest, setDeletingTest] = useState(false);
    
    // State for lesson deletion dialog
    const [deleteLessonDialogOpen, setDeleteLessonDialogOpen] = useState(false);
    const [deletingLesson, setDeletingLesson] = useState(false);    // Test action handlers
    const handleEditTest = useCallback((test: TestCardMeta) => {
        setEditingTestId(test.test_id);
    }, []);    
    const handleBackFromTestEdit = useCallback(async () => {
        setEditingTestId(null);
        
        // Reload lesson data to get updated test cards
        if (lfp_sha) {
            try {
                const response = await GetLessonView(lfp_sha) as LessonViewResponse;
                if (response.success) {
                    // Update test cards with fresh data from server
                    setTestCards(response.test_cards || []);
                    
                    // Optionally update other data if needed
                    if (response.webinar_card) {
                        setLessonData(response.webinar_card);
                    }
                    setWebinarDicts(response.webinar_dicts || []);
                    setSlideDicts(response.slide_dicts || []);
                } else {
                    console.error('Failed to reload lesson data:', response.error);
                }
            } catch (error) {
                console.error('Error reloading lesson data:', error);
            }
        }
    }, [lfp_sha]);

    const handleDeleteTest = useCallback((test: TestCardMeta) => {
        setTestToDelete(test);
        setDeleteTestDialogOpen(true);
    }, []);    
    const handleConfirmDeleteTest = useCallback(async () => {
        if (!lessonData || !testToDelete) {
            setDeleteTestDialogOpen(false);
            return;
        }

        setDeletingTest(true);
        try {
            const result = await RemoveTestFromLesson(
                lessonData.lesson_id,
                testToDelete.test_id
            );

            if (result.success) {
                console.log('Test removal successful:', result.message);
                
                // Remove the test from the local state
                setTestCards(prev => prev.filter(t => t.test_id !== testToDelete.test_id));
                
                // Optionally show success message
                // TODO: add a toast notification here
                
            } else {
                console.error('Test removal failed:', result.error);
                // You could add error notification here
                alert(`Помилка видалення квізу: ${result.error}`);
            }
        } catch (error) {
            console.error('Unexpected error during test removal:', error);
            alert('Виникла неочікувана помилка при видаленні квізу');
        } finally {
            setDeletingTest(false);
            setDeleteTestDialogOpen(false);
            setTestToDelete(null);
        }
    }, [lessonData, testToDelete]);const handleCancelDeleteTest = useCallback(() => {
        setDeleteTestDialogOpen(false);
        setTestToDelete(null);
    }, []);    // Create test handler
    const handleCreateTest = useCallback(async () => {
        if (!lfp_sha || creatingTest) {
            return;
        }

        setCreatingTest(true);
        setTestCreationError(null);

        try {
            const result = await CreateTestForLesson(lfp_sha);

            if (result.success && result.test_id) {
                // Navigate to edit the newly created test
                setEditingTestId(result.test_id);
                
                console.log('Test created successfully:', result);
            } else {
                setTestCreationError(result.error || 'Не вдалося створити квіз');
            }
        } catch (error) {
            console.error('Error creating test:', error);
            setTestCreationError('Виникла помилка при створенні квізу');
        } finally {
            setCreatingTest(false);
        }    }, [lfp_sha, creatingTest]);

    // Test selection handlers
    const handleSelectExistingTest = useCallback(() => {
        setShowTestSelector(true);
        setTestAssignError(null);
    }, []);

    const handleTestSelect = useCallback(async (test: TestCardMeta) => {
        if (!lessonData || assigningTest) {
            return;
        }

        setAssigningTest(true);
        setTestAssignError(null);

        try {
            const result = await AssignTestToLesson(lessonData.lesson_id, test.test_id);

            if (result.success) {
                console.log('Test assigned successfully:', result);
                
                // Reload lesson data to get updated test cards
                if (lfp_sha) {
                    try {
                        const response = await GetLessonView(lfp_sha) as LessonViewResponse;
                        if (response.success) {
                            setTestCards(response.test_cards || []);
                        }
                    } catch (error) {
                        console.error('Error reloading lesson data:', error);
                    }
                }
                
                // Close the test selector
                setShowTestSelector(false);
            } else {
                setTestAssignError(result.error || 'Не вдалося призначити квіз');
            }
        } catch (error) {
            console.error('Error assigning test:', error);
            setTestAssignError('Виникла помилка при призначенні квізу');
        } finally {
            setAssigningTest(false);
        }
    }, [lessonData, lfp_sha, assigningTest]);

    const handleCancelTestSelect = useCallback(() => {
        setShowTestSelector(false);
        setTestAssignError(null);
    }, []);

    // Lesson deletion handlers
    const handleDeleteLesson = useCallback(() => {
        setDeleteLessonDialogOpen(true);
    }, []);

    const handleConfirmDeleteLesson = useCallback(async () => {
        if (!lessonData) {
            setDeleteLessonDialogOpen(false);
            return;
        }

        setDeletingLesson(true);
        try {
            const result = await DeleteLesson(lessonData.lesson_id);

            if (result.success) {
                console.log('Lesson deletion successful:', result.message);
                // Navigate back to lessons list after successful deletion
                navigate('/webinars');
            } else {
                console.error('Lesson deletion failed:', result.error);
                // TODO: Show error notification/toast
                alert(`Помилка видалення вебінару: ${result.error}`);
            }
        } catch (error) {
            console.error('Unexpected error during lesson deletion:', error);
            alert('Виникла неочікувана помилка при видаленні вебінару');
        } finally {
            setDeletingLesson(false);
            setDeleteLessonDialogOpen(false);
        }
    }, [lessonData, navigate]);

    const handleCancelDeleteLesson = useCallback(() => {
        setDeleteLessonDialogOpen(false);
    }, []);

    // Title editing handlers
    const handleEditTitle = useCallback(() => {
        if (lessonData) {
            setEditedTitle(lessonData.lesson_name);
            setIsEditingTitle(true);
            setTitleUpdateError(null);
        }
    }, [lessonData]);

    const handleCancelEditTitle = useCallback(() => {
        setIsEditingTitle(false);
        setEditedTitle('');
        setTitleUpdateError(null);
    }, []);

    const handleConfirmEditTitle = useCallback(async () => {
        if (!lessonData || !editedTitle.trim()) {
            setTitleUpdateError('Назва вебінару не може бути порожньою');
            return;
        }

        if (editedTitle.trim() === lessonData.lesson_name) {
            setIsEditingTitle(false);
            return;
        }

        setUpdatingTitle(true);
        setTitleUpdateError(null);

        try {
            const result = await UpdateLessonTitle(lessonData.lesson_id, editedTitle.trim());

            if (result.success) {
                // Update local lesson data
                setLessonData(prev => prev ? {
                    ...prev,
                    lesson_name: result.lesson_name || editedTitle.trim()
                } : null);
                
                setIsEditingTitle(false);
                setEditedTitle('');
            } else {
                setTitleUpdateError(result.error || 'Не вдалося оновити назву вебінару');
            }
        } catch (error) {
            console.error('Error updating lesson title:', error);
            setTitleUpdateError('Виникла помилка при оновленні назви вебінару');
        } finally {
            setUpdatingTitle(false);
        }
    }, [lessonData, editedTitle]);

    const handleTitleInputKeyDown = useCallback((event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleConfirmEditTitle();
        } else if (event.key === 'Escape') {
            handleCancelEditTitle();
        }
    }, [handleConfirmEditTitle, handleCancelEditTitle]);// Memoize the test components with modern card design - show all tests in one container
    const testComponents = useMemo(() => {
        return (
            <Box sx={{ py: 2 }}>
                {/* Error message for test creation */}
                {testCreationError && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setTestCreationError(null)}>
                        {testCreationError}
                    </Alert>
                )}

                {/* Existing tests */}
                {testCards.length > 0 && testCards.map((test, index) => (
                    <Box
                        key={`test-content-${test.test_id}`}
                        sx={{ mb: 3 }}
                    >
                        <Paper
                            elevation={2}
                            sx={{
                                p: 3,
                                borderRadius: '16px',
                                border: `1px solid ${alpha(theme.palette.grey[300], 0.3)}`,
                                backgroundColor: theme.palette.background.paper,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 3,
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    elevation: 4,
                                    borderColor: alpha(theme.palette.primary.main, 0.3),
                                    transform: 'translateY(-2px)',
                                }
                            }}
                        >
                            {/* Test Content */}
                            <Box sx={{ flex: 1 }}>
                                <Typography 
                                    variant="h5" 
                                    gutterBottom
                                    sx={{ 
                                        fontWeight: 600,
                                        color: theme.palette.primary.main,
                                        mb: 1
                                    }}
                                >
                                    {test.test_name}
                                </Typography>
                                
                                {test.test_description && (
                                    <Typography 
                                        variant="body1" 
                                        sx={{ 
                                            mb: 2, 
                                            color: theme.palette.text.secondary,
                                            lineHeight: 1.6
                                        }}
                                    >
                                        {test.test_description}
                                    </Typography>
                                )}
                            </Box>                            

                            {/* Action Buttons */}
                            <Box sx={{ 
                                flex: '0 0 auto',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2
                            }}>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    startIcon={<EditIcon />}
                                    onClick={() => handleEditTest(test)}
                                    sx={{ 
                                        whiteSpace: 'nowrap',
                                        minWidth: '120px',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                            borderColor: theme.palette.primary.main,
                                            transform: 'scale(1.02)',
                                        }
                                    }}
                                >
                                    Редагувати
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={() => handleDeleteTest(test)}
                                    sx={{ 
                                        whiteSpace: 'nowrap',
                                        minWidth: '140px',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.error.main, 0.05),
                                            borderColor: theme.palette.error.main,
                                            transform: 'scale(1.02)',
                                        }
                                    }}
                                >
                                    Видалити
                                </Button>
                            </Box>
                        </Paper>
                    </Box>
                ))}                {/* Empty state or create button */}
                {testCards.length === 0 ? (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                            Поки що немає доступних квізів
                        </Typography>
                        
                        {/* Buttons container */}
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={creatingTest ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                                onClick={handleCreateTest}
                                disabled={creatingTest}
                                size="large"
                                sx={{
                                    borderRadius: '12px',
                                    fontWeight: 600,
                                    px: 4,
                                    py: 1.5,
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.primary.main, 0.8),
                                        transform: 'scale(1.02)',
                                    }
                                }}
                            >
                                {creatingTest ? 'Створення квізу...' : 'Створити новий квіз'}
                            </Button>
                            
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={handleSelectExistingTest}
                                disabled={creatingTest || assigningTest}
                                size="large"
                                sx={{
                                    borderRadius: '12px',
                                    fontWeight: 600,
                                    px: 4,
                                    py: 1.5,
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                        transform: 'scale(1.02)',
                                    }
                                }}
                            >
                                Обрати наявний тест
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    /* Create button when tests exist */
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={creatingTest ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                                onClick={handleCreateTest}
                                disabled={creatingTest}
                                size="large"
                                sx={{
                                    borderRadius: '12px',
                                    fontWeight: 600,
                                    px: 4,
                                    py: 1.5,
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.primary.main, 0.8),
                                        transform: 'scale(1.02)',
                                    }
                                }}
                            >
                                {creatingTest ? 'Створення квізу...' : 'Створити новий квіз'}
                            </Button>
                            
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={handleSelectExistingTest}
                                disabled={creatingTest || assigningTest}
                                size="large"
                                sx={{
                                    borderRadius: '12px',
                                    fontWeight: 600,
                                    px: 4,
                                    py: 1.5,
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                        transform: 'scale(1.02)',
                                    }
                                }}
                            >
                                Обрати наявний тест
                            </Button>
                        </Box>
                    </Box>
                )}
            </Box>
        );
    }, [testCards, theme, handleEditTest, handleDeleteTest, handleCreateTest, handleSelectExistingTest, creatingTest, assigningTest, testCreationError, setTestCreationError]);// Function to determine if a tab content should be visible
    const isTabVisible = (tabIndex: number): boolean => {
        return tabValue === tabIndex;
    };

    // Calculate tab indices - always show video, slides, and single tests tab in edit mode
    const getTabIndices = useMemo(() => {
        const videoTabIndex = 0;  // Always first tab
        const slideTabIndex = 1;  // Always second tab
        const testsTabIndex = 2;  // Single tests tab

        return { videoTabIndex, slideTabIndex, testsTabIndex };
    }, []);

    // If editing a test, render the EditTestComponent
    if (editingTestId) {
        return (
            <EditTestComponent
                testId={editingTestId}
                onBack={handleBackFromTestEdit}
                showTopBar={true}
            />
        );
    }

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
                />                {lessonData && (
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        flexGrow: 1 
                    }}>
                        {isEditingTitle ? (
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1, 
                                flexGrow: 1 
                            }}>
                                <TextField
                                    value={editedTitle}
                                    onChange={(e) => setEditedTitle(e.target.value)}
                                    onKeyDown={handleTitleInputKeyDown}
                                    variant="outlined"
                                    size="small"
                                    autoFocus
                                    disabled={updatingTitle}
                                    error={!!titleUpdateError}
                                    helperText={titleUpdateError}
                                    sx={{
                                        flexGrow: 1,
                                        '& .MuiOutlinedInput-root': {
                                            fontSize: 'calc(2.125rem / 1.4)',
                                            fontWeight: 600,
                                            color: theme.palette.primary.main,
                                        }
                                    }}
                                />
                                <IconButton
                                    onClick={handleConfirmEditTitle}
                                    disabled={updatingTitle || !editedTitle.trim()}
                                    color="primary"
                                    size="small"
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.success.main, 0.1),
                                        }
                                    }}
                                >
                                    {updatingTitle ? (
                                        <CircularProgress size={20} />
                                    ) : (
                                        <CheckIcon />
                                    )}
                                </IconButton>
                                <IconButton
                                    onClick={handleCancelEditTitle}
                                    disabled={updatingTitle}
                                    color="secondary"
                                    size="small"
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.error.main, 0.1),
                                        }
                                    }}
                                >
                                    <CloseIcon />
                                </IconButton>
                            </Box>                        ) : (
                            <>
                                {/* Left side: Title + Edit Icon */}
                                <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 1,
                                    flexGrow: 1
                                }}>
                                    <Typography variant="h4" sx={{
                                        fontWeight: 600,
                                        color: theme.palette.primary.main,
                                        fontSize: 'calc(2.125rem / 1.4)'
                                    }}>
                                        {lessonData.lesson_name}
                                    </Typography>
                                    <IconButton
                                        onClick={handleEditTitle}
                                        size="small"
                                        sx={{
                                            color: theme.palette.text.secondary,
                                            '&:hover': {
                                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                color: theme.palette.primary.main,
                                            }
                                        }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                
                                {/* Right side: Delete Button */}
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={handleDeleteLesson}
                                    disabled={deletingLesson}
                                    sx={{
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.error.main, 0.05),
                                            borderColor: theme.palette.error.main,
                                            transform: 'scale(1.02)',
                                        }
                                    }}
                                >
                                    {deletingLesson ? 'Видалення...' : 'Видалити вебінар'}
                                </Button>
                            </>
                        )}
                    </Box>
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
                            }}                        >
                            {/* Always render tabs in edit mode: Videos, Slides, Tests (singular) */}
                            <Tab label="Відео" />
                            <Tab label="Презентація" />
                            <Tab label="Квізи" />
                        </Tabs>
                    </Paper>

                    {/* Tab content - all content is always mounted but only visible based on the active tab */}
                    <Box sx={{ mt: 2 }}>                        {/* Video Tab Content */}
                        <Box sx={{ display: isTabVisible(getTabIndices.videoTabIndex) ? 'block' : 'none' }}>
                            {videoComponents}
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
                            }}                        >
                            {pdfDisplayComponents}
                        </Box>                        {/* Test Tab Content - single tab with all tests */}
                        <Box
                            sx={{
                                display: isTabVisible(getTabIndices.testsTabIndex) ? 'block' : 'none'
                            }}
                        >
                            {/* Test assignment error */}
                            {testAssignError && (
                                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setTestAssignError(null)}>
                                    {testAssignError}
                                </Alert>
                            )}
                            
                            {/* Test selector component */}
                            {showTestSelector && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.palette.primary.main }}>
                                        Оберіть тест для додавання до вебінару
                                    </Typography>
                                    <TestSelectorComponent
                                        onTestSelect={handleTestSelect}
                                        width="100%"
                                        maxHeight="400px"
                                        compact={true}
                                        allowSearch={true}
                                    />
                                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
                                        <Button
                                            variant="outlined"
                                            onClick={handleCancelTestSelect}
                                            disabled={assigningTest}
                                            sx={{
                                                borderRadius: '8px',
                                                fontWeight: 600,
                                                px: 3
                                            }}
                                        >
                                            Скасувати
                                        </Button>
                                    </Box>
                                    {assigningTest && (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <CircularProgress size={20} />
                                                <Typography variant="body2" color="text.secondary">
                                                    Додавання тесту до вебінару...
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            )}
                            
                            {testComponents}
                        </Box>
                    </Box>
                </>
            ) : (
                <Typography variant="h5" sx={{ textAlign: 'center', color: theme.palette.text.secondary }}>
                    Дані уроку недоступні
                </Typography>
            )}            {/* Delete Video Confirmation Dialog */}
            <ConfirmationDialog
                open={deleteVideoDialogOpen}
                onClose={handleCancelDeleteVideo}
                onConfirm={handleConfirmDeleteVideo}
                title="Підтвердження видалення відео"
                description={`Ви впевнені, що хочете видалити відео ${webinarToDelete?.webinar_title ? `"${webinarToDelete.webinar_title}"` : ''} з уроку?`}
                warningText="Ця дія не може бути скасована. Відео буде видалено назавжди."
                confirmButtonText="Видалити відео"
                confirmButtonColor="error"
                loading={deletingVideo}
            />            {/* Delete PDF Confirmation Dialog */}
            <ConfirmationDialog
                open={deletePdfDialogOpen}
                onClose={handleCancelDeletePdf}
                onConfirm={handleConfirmDeletePdf}
                title="Підтвердження видалення презентації"
                description={`Ви впевнені, що хочете видалити презентацію ${slideToDelete?.slide_title ? `"${slideToDelete.slide_title}"` : ''} з уроку?`}
                warningText="Ця дія не може бути скасована. Презентацію буде видалено назавжди."
                confirmButtonText="Видалити презентацію"
                confirmButtonColor="error"
                loading={deletingSlide}
            />            {/* Delete Test Confirmation Dialog */}
            <ConfirmationDialog
                open={deleteTestDialogOpen}
                onClose={handleCancelDeleteTest}
                onConfirm={handleConfirmDeleteTest}
                title="Підтвердження видалення квізу"
                description={`Ви впевнені, що хочете видалити квіз "${testToDelete?.test_name}" з уроку?`}
                warningText="Квіз буде відкріплений від уроку, але збережеться в системі."
                confirmButtonText="Видалити квіз"
                confirmButtonColor="error"
                loading={deletingTest}
            />

            {/* Delete Lesson Confirmation Dialog */}
            <ConfirmationDialog
                open={deleteLessonDialogOpen}
                onClose={handleCancelDeleteLesson}
                onConfirm={handleConfirmDeleteLesson}
                title="Підтвердження видалення вебінару"
                description={`Ви впевнені, що хочете видалити вебінар "${lessonData?.lesson_name}"?`}
                warningText="Ця дія не може бути скасована. Вебінар та всі пов'язані з ним медіа-матеріали (відео та презентації) будуть видалені назавжди."
                confirmButtonText="Видалити вебінар"
                confirmButtonColor="error"
                loading={deletingLesson}
            />
        </Container>
    );
};

export default EditLessonPage;