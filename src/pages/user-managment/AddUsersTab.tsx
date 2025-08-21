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
    LinearProgress,
    Chip,
    Autocomplete,
    TextField
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    Download as DownloadIcon,
    Add as AddIcon,
    Description as DescriptionIcon,
    CheckCircle as CheckCircleIcon,
    Send as SendIcon,
    Error as ErrorIcon,
    Group as GroupIcon
} from '@mui/icons-material';
import { getAllActiveGroups } from '../../services/UserService';

/**
 * Interface for user data from TSV file
 */
interface UserData {
    name: string;
    surname: string;
    email: string;
    phone?: string;
    telegram_username?: string;
    instagram_username?: string;
}

/**
 * Interface for group option
 */
interface GroupOption {
    id: string;
    name: string;
    description?: string;
}

/**
 * Interface for validation error
 */
interface ValidationError {
    type: 'column' | 'required' | 'email' | 'limit';
    message: string;
    line?: number;
    field?: string;
}

// Maximum number of users that can be processed in one upload
const MAX_USERS_LIMIT = 200;

// Maximum height for scrollable content areas
const MAX_CONTENT_HEIGHT = 400;

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
    const [parsedUsers, setParsedUsers] = useState<UserData[]>([]);
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
    const [selectedGroups, setSelectedGroups] = useState<GroupOption[]>([]);
    const [availableGroups, setAvailableGroups] = useState<GroupOption[]>([]);
    const [notification, setNotification] = useState<{
        message: string;
        severity: 'success' | 'error' | 'info' | 'warning';
    } | null>(null);

    // Fetch active groups from backend
    React.useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await getAllActiveGroups();
                if (response.success && response.groups) {
                    const groups: GroupOption[] = response.groups.map(group => ({
                        id: group.group_id.toString(),
                        name: group.group_name
                    }));
                    setAvailableGroups(groups);
                } else {
                    setNotification({
                        message: 'Помилка завантаження груп',
                        severity: 'error'
                    });
                }
            } catch (error) {
                console.error('Error fetching groups:', error);
                setNotification({
                    message: 'Помилка завантаження груп',
                    severity: 'error'
                });
            }
        };

        fetchGroups();
    }, []);

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

    // Validate email format
    const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Parse TSV file content
    const parseTsvFile = async (file: File): Promise<{ users: UserData[], errors: ValidationError[] }> => {
        const content = await file.text();
        const lines = content.split('\n').map(line => line.trim()).filter(line => line);
        
        if (lines.length === 0) {
            return {
                users: [],
                errors: [{ type: 'column', message: 'Файл порожній' }]
            };
        }

        // Check maximum users limit (excluding header)
        const dataRowsCount = lines.length - 1;
        if (dataRowsCount > MAX_USERS_LIMIT) {
            return {
                users: [],
                errors: [{
                    type: 'limit',
                    message: `Занадто багато користувачів у файлі (${dataRowsCount}). Максимум дозволено: ${MAX_USERS_LIMIT}`
                }]
            };
        }

        // Parse header
        const header = lines[0].split('\t').map(col => col.trim().toLowerCase());
        const requiredColumns = ['name', 'surname', 'email'];
        const allowedColumns = ['name', 'surname', 'email', 'phone', 'telegram_username', 'instagram_username'];
        
        // Validate columns
        const errors: ValidationError[] = [];
        const missingColumns = requiredColumns.filter(col => !header.includes(col));
        
        if (missingColumns.length > 0) {
            errors.push({
                type: 'column',
                message: `Відсутні обов'язкові колонки: ${missingColumns.join(', ')}`
            });
        }

        const invalidColumns = header.filter(col => !allowedColumns.includes(col));
        if (invalidColumns.length > 0) {
            errors.push({
                type: 'column',
                message: `Невідомі колонки: ${invalidColumns.join(', ')}. Дозволені: ${allowedColumns.join(', ')}`
            });
        }

        if (errors.length > 0) {
            return { users: [], errors };
        }

        // Parse data rows
        const users: UserData[] = [];
        const emailSet = new Set<string>();

        for (let i = 1; i < lines.length; i++) {
            const lineNumber = i + 1;
            const values = lines[i].split('\t');
            
            // Pad values array to match header length (for optional empty columns)
            while (values.length < header.length) {
                values.push('');
            }
            
            if (values.length > header.length) {
                errors.push({
                    type: 'column',
                    message: `Рядок ${lineNumber}: занадто багато значень (${values.length}) порівняно з кількістю колонок (${header.length})`,
                    line: lineNumber
                });
                continue;
            }

            const user: Partial<UserData> = {};
            
            // Map values to user object
            header.forEach((col, index) => {
                const value = values[index]?.trim() || '';
                switch (col) {
                    case 'name':
                    case 'surname':
                    case 'email':
                        user[col as keyof UserData] = value;
                        break;
                    case 'phone':
                    case 'telegram_username':
                    case 'instagram_username':
                        // Only set if value is not empty
                        if (value) {
                            user[col as keyof UserData] = value;
                        }
                        break;
                }
            });

            // Validate required fields
            if (!user.name || user.name.trim() === '') {
                errors.push({
                    type: 'required',
                    message: `Рядок ${lineNumber}: поле "name" обов'язкове`,
                    line: lineNumber,
                    field: 'name'
                });
            }

            if (!user.surname || user.surname.trim() === '') {
                errors.push({
                    type: 'required',
                    message: `Рядок ${lineNumber}: поле "surname" обов'язкове`,
                    line: lineNumber,
                    field: 'surname'
                });
            }

            if (!user.email || user.email.trim() === '') {
                errors.push({
                    type: 'required',
                    message: `Рядок ${lineNumber}: поле "email" обов'язкове`,
                    line: lineNumber,
                    field: 'email'
                });
            } else if (!isValidEmail(user.email)) {
                errors.push({
                    type: 'email',
                    message: `Рядок ${lineNumber}: невірний формат email "${user.email}"`,
                    line: lineNumber,
                    field: 'email'
                });
            } else if (emailSet.has(user.email.toLowerCase())) {
                errors.push({
                    type: 'email',
                    message: `Рядок ${lineNumber}: email "${user.email}" вже існує у файлі`,
                    line: lineNumber,
                    field: 'email'
                });
            } else {
                emailSet.add(user.email.toLowerCase());
            }

            // If no validation errors for this user, add to users array
            if (user.name && user.name.trim() && 
                user.surname && user.surname.trim() && 
                user.email && user.email.trim() && 
                isValidEmail(user.email)) {
                users.push(user as UserData);
            }
        }

        return { users, errors };
    };

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
        setValidationErrors([]);
        setParsedUsers([]);

        try {
            // Simulate progress for file reading
            setUploadProgress(20);
            
            // Parse the TSV file
            const { users, errors } = await parseTsvFile(uploadedFile);
            
            setUploadProgress(60);
            
            if (errors.length > 0) {
                setValidationErrors(errors);
                setNotification({
                    message: `Знайдено ${errors.length} помилок у файлі`,
                    severity: 'error'
                });
                setUploadProgress(100);
                setUploading(false);
                return;
            }

            setUploadProgress(80);
            
            // If successful, store parsed users
            setParsedUsers(users);
            setUploadProgress(100);
            
            setNotification({
                message: `Файл успішно оброблено. Знайдено ${users.length} користувачів`,
                severity: 'success'
            });

        } catch (error) {
            console.error('Error processing file:', error);
            setNotification({
                message: 'Помилка при обробці файлу',
                severity: 'error'
            });
        } finally {
            setUploading(false);
        }
    }, [uploadedFile]);

    // Remove uploaded file
    const handleRemoveFile = useCallback(() => {
        setUploadedFile(null);
        setNotification(null);
        setParsedUsers([]);
        setValidationErrors([]);
    }, []);

    // Handle group selection change
    const handleGroupChange = useCallback((event: any, newValue: GroupOption[]) => {
        setSelectedGroups(newValue);
    }, []);

    // Send users to backend (placeholder)
    const handleSendToBackend = useCallback(async () => {
        if (parsedUsers.length === 0) return;

        setNotification({
            message: `Готово до відправки ${parsedUsers.length} користувачів на сервер...`,
            severity: 'info'
        });

        // TODO: Implement actual backend sending logic
        console.log('Users to send:', parsedUsers);
        console.log('Selected groups:', selectedGroups);
        
        // Simulate API call
        setTimeout(() => {
            setNotification({
                message: `${parsedUsers.length} користувачів успішно додано до груп: ${selectedGroups.map(g => g.name).join(', ')}`,
                severity: 'success'
            });
            
            // Reset after successful send
            setUploadedFile(null);
            setParsedUsers([]);
            setValidationErrors([]);
            setSelectedGroups([]);
        }, 1500);
    }, [parsedUsers]);

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
                        потім
                    </Typography>
                </Divider>

                {/* Group Selection Section */}
                <Paper
                    elevation={2}
                    sx={{
                        p: 3,
                        borderRadius: 2,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    }}
                >
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Typography
                            variant="h6"
                            component="h2"
                            sx={{ 
                                mb: 2,
                                color: theme.palette.primary.main,
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1
                            }}
                        >
                            <GroupIcon />
                            Крок 2: Оберіть групи для додавання користувачів
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Виберіть одну або декілька груп, до яких будуть додані користувачі
                        </Typography>
                    </Box>

                    <Autocomplete
                        multiple
                        id="group-selection"
                        options={availableGroups}
                        getOptionLabel={(option) => option.name}
                        value={selectedGroups}
                        onChange={handleGroupChange}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="outlined"
                                label="Оберіть групи"
                                placeholder="Почніть вводити назву групи..."
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                    }
                                }}
                            />
                        )}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    {...getTagProps({ index })}
                                    key={option.id}
                                    label={option.name}
                                    color="primary"
                                    variant="filled"
                                    sx={{ margin: 0.5 }}
                                />
                            ))
                        }
                        renderOption={(props, option) => (
                            <Box component="li" {...props}>
                                <Typography variant="body2" fontWeight={600}>
                                    {option.name}
                                </Typography>
                            </Box>
                        )}
                        ChipProps={{
                            color: "primary",
                            variant: "filled"
                        }}
                        sx={{ mb: 2 }}
                    />

                    {selectedGroups.length > 0 && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            Користувачі будуть додані до {selectedGroups.length} {selectedGroups.length === 1 ? 'групи' : 'груп'}: {selectedGroups.map(g => g.name).join(', ')}
                        </Alert>
                    )}
                </Paper>

                <Divider sx={{ my: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        далі
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
                        Крок 3: Завантажте заповнений TSV файл
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
                            Підтримувані формати: .tsv (максимум 10MB, до {MAX_USERS_LIMIT} користувачів)
                        </Typography>
                    </Box>

                    {/* Process File Button */}
                    {uploadedFile && !uploading && parsedUsers.length === 0 && selectedGroups.length > 0 && (
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
                                Обробити файл
                            </Button>
                        </Box>
                    )}

                    {/* Warning when no groups selected */}
                    {uploadedFile && !uploading && selectedGroups.length === 0 && (
                        <Alert severity="warning" sx={{ mt: 3 }}>
                            Спочатку оберіть групи для додавання користувачів
                        </Alert>
                    )}
                </Paper>

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                    <Paper
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.error.main, 0.05),
                            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <ErrorIcon color="error" />
                            <Typography variant="h6" color="error">
                                Знайдено помилки у файлі
                            </Typography>
                        </Box>
                        
                        <Stack 
                            spacing={1}
                            sx={{
                                maxHeight: MAX_CONTENT_HEIGHT,
                                overflowY: 'auto',
                                pr: 1,
                                '&::-webkit-scrollbar': {
                                    width: '8px',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: alpha(theme.palette.error.main, 0.3),
                                    borderRadius: '4px',
                                },
                                '&::-webkit-scrollbar-track': {
                                    backgroundColor: alpha(theme.palette.grey[200], 0.5),
                                    borderRadius: '4px',
                                },
                            }}
                        >
                            {validationErrors.map((error, index) => (
                                <Alert 
                                    key={index} 
                                    severity="error" 
                                    variant="outlined"
                                    sx={{ 
                                        bgcolor: 'transparent',
                                        '& .MuiAlert-message': {
                                            fontSize: '0.875rem'
                                        }
                                    }}
                                >
                                    {error.message}
                                </Alert>
                            ))}
                        </Stack>
                    </Paper>
                )}

                {/* Parsed Users Preview */}
                {parsedUsers.length > 0 && (
                    <Paper
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.success.main, 0.05),
                            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <CheckCircleIcon color="success" />
                            <Typography variant="h6" color="success.main">
                                Файл успішно оброблено
                            </Typography>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Знайдено {parsedUsers.length} валідних користувачів
                        </Typography>

                        {/* Users Preview */}
                        <Box 
                            sx={{ 
                                mb: 3, 
                                maxHeight: MAX_CONTENT_HEIGHT, 
                                overflowY: 'auto',
                                pr: 1,
                                '&::-webkit-scrollbar': {
                                    width: '8px',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: alpha(theme.palette.success.main, 0.3),
                                    borderRadius: '4px',
                                },
                                '&::-webkit-scrollbar-track': {
                                    backgroundColor: alpha(theme.palette.grey[200], 0.5),
                                    borderRadius: '4px',
                                },
                            }}
                        >
                            {parsedUsers.map((user, index) => (
                                <Box 
                                    key={index}
                                    sx={{ 
                                        p: 2, 
                                        mb: 1,
                                        bgcolor: 'white',
                                        borderRadius: 1,
                                        border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            #{index + 1}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        <Chip 
                                            label={`${user.name} ${user.surname}`} 
                                            color="primary" 
                                            size="small" 
                                        />
                                        <Chip 
                                            label={user.email} 
                                            variant="outlined" 
                                            size="small" 
                                        />
                                        {user.phone && (
                                            <Chip 
                                                label={user.phone} 
                                                variant="outlined" 
                                                size="small" 
                                            />
                                        )}
                                        {user.telegram_username && (
                                            <Chip 
                                                label={user.telegram_username.startsWith('@') ? user.telegram_username : `@${user.telegram_username}`} 
                                                variant="outlined" 
                                                size="small" 
                                            />
                                        )}
                                        {user.instagram_username && (
                                            <Chip 
                                                label={`IG: ${user.instagram_username}`} 
                                                variant="outlined" 
                                                size="small" 
                                            />
                                        )}
                                    </Box>
                                    {/* Show selected groups for this user */}
                                    {selectedGroups.length > 0 && (
                                        <Box sx={{ mt: 1 }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                                                Буде додано до:
                                            </Typography>
                                            {selectedGroups.map((group) => (
                                                <Chip 
                                                    key={group.id}
                                                    label={group.name} 
                                                    color="secondary" 
                                                    size="small" 
                                                    sx={{ mr: 0.5 }}
                                                />
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            ))}
                        </Box>

                        {/* Send to Backend Button */}
                        <Box sx={{ textAlign: 'center' }}>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleSendToBackend}
                                startIcon={<SendIcon />}
                                sx={{
                                    borderRadius: 2,
                                    px: 4,
                                    py: 1.5,
                                    fontWeight: 600,
                                    bgcolor: theme.palette.primary.main,
                                    '&:hover': {
                                        bgcolor: theme.palette.primary.dark
                                    }
                                }}
                            >
                                Додати користувачів до системи
                            </Button>
                        </Box>
                    </Paper>
                )}

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
                            <li>Максимальна кількість користувачів: {MAX_USERS_LIMIT}</li>
                            <li>Опціональні поля можуть бути порожніми</li>
                        </Box>
                    </Typography>
                </Paper>
            </Stack>
        </Container>
    );
});

AddUsersTab.displayName = 'AddUsersTab';

export default AddUsersTab;