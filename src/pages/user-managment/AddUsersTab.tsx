import React, { useState, useCallback, memo } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Container,
    alpha,
    useTheme,
    useMediaQuery,
    Divider,
    Stack,
    Alert,
    LinearProgress
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    Download as DownloadIcon,
    Add as AddIcon,
    Description as DescriptionIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

/**
 * Memoized component for adding users via TSV file upload
 * Maintains state when switching between tabs
 */
const AddUsersTab: React.FC = memo(() => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    // Component state - preserved when switching tabs due to memoization
    const [dragActive, setDragActive] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [notification, setNotification] = useState<{
        message: string;
        severity: 'success' | 'error' | 'info' | 'warning';
    } | null>(null);

    // Handle file drag and drop
    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            handleFileSelection(file);
        }
    }, []);

    const handleFileSelection = useCallback((file: File) => {
        // Validate file type
        if (!file.name.toLowerCase().endsWith('.tsv')) {
            setNotification({
                message: 'Будь ласка, оберіть TSV файл (.tsv)',
                severity: 'error'
            });
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setNotification({
                message: 'Файл занадто великий. Максимальний розмір: 10MB',
                severity: 'error'
            });
            return;
        }

        setUploadedFile(file);
        setNotification({
            message: `Файл "${file.name}" готовий до завантаження`,
            severity: 'success'
        });
    }, []);

    const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelection(e.target.files[0]);
        }
    }, [handleFileSelection]);

    // Download template file
    const handleDownloadTemplate = useCallback(() => {
        const templateContent = "name\tsurname\temail\tphone\ttelegram_username\tinstagram_username\n";
        
        const blob = new Blob([templateContent], { type: 'text/tab-separated-values;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'users_template.tsv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setNotification({
            message: 'Шаблон TSV файлу завантажено',
            severity: 'success'
        });
    }, []);

    // Process uploaded file
    const handleProcessFile = useCallback(async () => {
        if (!uploadedFile) return;

        setUploading(true);
        setUploadProgress(0);

        // TODO: Implement actual file processing logic
        // Simulate progress
        const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    setUploading(false);
                    setNotification({
                        message: `Файл "${uploadedFile.name}" успішно оброблено`,
                        severity: 'success'
                    });
                    // Reset file after successful processing
                    setUploadedFile(null);
                    return 100;
                }
                return prev + 20;
            });
        }, 500);
    }, [uploadedFile]);

    // Remove uploaded file
    const handleRemoveFile = useCallback(() => {
        setUploadedFile(null);
        setNotification(null);
    }, []);

    return (
        <Container maxWidth="md" sx={{ py: 3 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                        fontFamily: '"Lato", sans-serif',
                        fontWeight: 700,
                        color: theme.palette.primary.main,
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1
                    }}
                >
                    <AddIcon fontSize="large" />
                    Додати нових користувачів
                </Typography>
                
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ maxWidth: 600, mx: 'auto' }}
                >
                    Завантажте TSV файл з даними користувачів для масового додавання до системи
                </Typography>
            </Box>

            {/* Notification */}
            {notification && (
                <Alert 
                    severity={notification.severity} 
                    sx={{ mb: 3 }}
                    onClose={() => setNotification(null)}
                >
                    {notification.message}
                </Alert>
            )}

            <Stack spacing={3}>
                {/* Download Template Section */}
                <Paper
                    elevation={2}
                    sx={{
                        p: 3,
                        borderRadius: 2,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    }}
                >
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography
                            variant="h6"
                            component="h2"
                            sx={{ 
                                mb: 2,
                                color: theme.palette.primary.main,
                                fontWeight: 600
                            }}
                        >
                            Крок 1: Завантажте шаблон TSV файлу
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Завантажте шаблон для заповнення даних користувачів у правильному форматі
                        </Typography>
                        
                        <Button
                            variant="outlined"
                            size="large"
                            startIcon={<DownloadIcon />}
                            onClick={handleDownloadTemplate}
                            sx={{
                                borderRadius: 2,
                                px: 4,
                                py: 1.5,
                                fontWeight: 600
                            }}
                        >
                            Завантажити шаблон TSV
                        </Button>
                    </Box>
                </Paper>

                <Divider sx={{ my: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        або
                    </Typography>
                </Divider>

                {/* File Upload Section */}
                <Paper
                    elevation={2}
                    sx={{
                        p: 3,
                        borderRadius: 2,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    }}
                >
                    <Typography
                        variant="h6"
                        component="h2"
                        sx={{ 
                            mb: 3,
                            color: theme.palette.primary.main,
                            fontWeight: 600,
                            textAlign: 'center'
                        }}
                    >
                        Крок 2: Завантажте заповнений TSV файл
                    </Typography>

                    {/* Upload Progress */}
                    {uploading && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Обробка файлу: {uploadProgress}%
                            </Typography>
                            <LinearProgress 
                                variant="determinate" 
                                value={uploadProgress}
                                sx={{ borderRadius: 1, height: 8 }}
                            />
                        </Box>
                    )}

                    {/* Uploaded File Display */}
                    {uploadedFile && !uploading && (
                        <Paper
                            sx={{
                                p: 2,
                                mb: 3,
                                bgcolor: alpha(theme.palette.success.main, 0.05),
                                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                borderRadius: 2
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <CheckCircleIcon color="success" />
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="body2" fontWeight={600}>
                                        {uploadedFile.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {(uploadedFile.size / 1024).toFixed(1)} KB
                                    </Typography>
                                </Box>
                                <Button
                                    size="small"
                                    color="error"
                                    onClick={handleRemoveFile}
                                >
                                    Видалити
                                </Button>
                            </Box>
                        </Paper>
                    )}

                    {/* Drop Zone */}
                    <Box
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        sx={{
                            border: `2px dashed ${dragActive 
                                ? theme.palette.primary.main 
                                : alpha(theme.palette.grey[400], 0.5)
                            }`,
                            borderRadius: 2,
                            p: isMobile ? 3 : 6,
                            textAlign: 'center',
                            bgcolor: dragActive 
                                ? alpha(theme.palette.primary.main, 0.05) 
                                : alpha(theme.palette.grey[50], 0.5),
                            transition: 'all 0.2s ease-in-out',
                            cursor: 'pointer',
                            '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.02),
                                borderColor: theme.palette.primary.light
                            }
                        }}
                    >
                        <input
                            type="file"
                            accept=".tsv,.txt"
                            onChange={handleFileInputChange}
                            style={{
                                position: 'absolute',
                                left: '-9999px',
                                top: '-9999px'
                            }}
                            id="tsv-file-input"
                        />
                        
                        <CloudUploadIcon 
                            sx={{ 
                                fontSize: isMobile ? 48 : 64,
                                color: dragActive 
                                    ? theme.palette.primary.main 
                                    : theme.palette.grey[400],
                                mb: 2
                            }} 
                        />
                        
                        <Typography
                            variant={isMobile ? "body1" : "h6"}
                            sx={{ 
                                mb: 1,
                                color: dragActive 
                                    ? theme.palette.primary.main 
                                    : theme.palette.text.primary,
                                fontWeight: 600
                            }}
                        >
                            Перетягніть TSV файл сюди
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            або
                        </Typography>
                        
                        <Button
                            variant="contained"
                            component="label"
                            htmlFor="tsv-file-input"
                            startIcon={<DescriptionIcon />}
                            sx={{
                                borderRadius: 2,
                                px: 4,
                                py: 1.5,
                                fontWeight: 600
                            }}
                        >
                            Оберіть файл
                        </Button>
                        
                        <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            sx={{ display: 'block', mt: 2 }}
                        >
                            Підтримувані формати: .tsv (максимум 10MB)
                        </Typography>
                    </Box>

                    {/* Process File Button */}
                    {uploadedFile && !uploading && (
                        <Box sx={{ textAlign: 'center', mt: 3 }}>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleProcessFile}
                                startIcon={<AddIcon />}
                                sx={{
                                    borderRadius: 2,
                                    px: 4,
                                    py: 1.5,
                                    fontWeight: 600,
                                    bgcolor: theme.palette.success.main,
                                    '&:hover': {
                                        bgcolor: theme.palette.success.dark
                                    }
                                }}
                            >
                                Додати користувачів
                            </Button>
                        </Box>
                    )}
                </Paper>

                {/* Instructions */}
                <Paper
                    sx={{
                        p: 3,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.info.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
                    }}
                >
                    <Typography variant="h6" sx={{ mb: 2, color: theme.palette.info.main }}>
                        Інструкції по формату файлу:
                    </Typography>
                    
                    <Typography variant="body2" component="div" color="text.secondary">
                        <Box component="ul" sx={{ pl: 2, m: 0 }}>
                            <li>Файл повинен бути у форматі TSV</li>
                            <li>Перший рядок має містити заголовки колонок</li>
                            <li>Обов'язкові поля: name, surname, email</li>
                            <li>Опціональні поля: phone, telegram_username, instagram_username</li>
                            <li>Email адреси повинні бути унікальними</li>
                            <li>Максимальний розмір файлу: 10MB</li>
                        </Box>
                    </Typography>
                </Paper>
            </Stack>
        </Container>
    );
});

AddUsersTab.displayName = 'AddUsersTab';

export default AddUsersTab;