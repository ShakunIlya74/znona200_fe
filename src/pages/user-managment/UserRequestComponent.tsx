import React, { useState, useCallback } from 'react';
import {
    Box,
    Typography,
    Paper,
    Avatar,
    TextField,
    IconButton,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip,
    useTheme,
    alpha,
    Grid,
    Divider,
    useMediaQuery,
    Alert,
    Snackbar,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    SelectChangeEvent
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import TelegramIcon from '@mui/icons-material/Telegram';
import InstagramIcon from '@mui/icons-material/Instagram';
import CommentIcon from '@mui/icons-material/Comment';
import ExpandLessOutlinedIcon from '@mui/icons-material/ExpandLessOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import { UserRequest } from '../../services/UserService';

// Request status enum - matching backend values
export enum RequestStatus {
    NEW = 'NEW',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    WRONG_CONTACTS = 'WRONG_CONTACTS'
}


// Props interface for the UserRequestComponent
interface UserRequestComponentProps {
    request: UserRequest;
    onStatusChange?: (requestId: number | string, newStatus: RequestStatus) => Promise<boolean>;
    onUpdate?: (updatedRequest: UserRequest) => Promise<boolean>;
    collapsed?: boolean;
    index?: number;
    onClick?: (request: UserRequest) => void;
}

// Helper function to get status color and label
const getStatusConfig = (status: string | undefined) => {
    switch (status) {
        case RequestStatus.NEW:
            return { color: 'info' as const, label: 'Новий' };
        case RequestStatus.APPROVED:
            return { color: 'success' as const, label: 'Схвалений' };
        case RequestStatus.REJECTED:
            return { color: 'error' as const, label: 'Відхилений' };
        case RequestStatus.WRONG_CONTACTS:
            return { color: 'warning' as const, label: 'Неправильні контакти' };
        default:
            return { color: 'default' as const, label: 'Неправильні контакти' };
    }
};

// Individual editable field component
interface EditableFieldProps {
    label: string;
    value: string;
    icon: React.ReactNode;
    onSave: (newValue: string) => Promise<boolean>;
    placeholder?: string;
    type?: 'text' | 'email' | 'tel';
    multiline?: boolean;
}

const EditableField: React.FC<EditableFieldProps> = ({
    label,
    value,
    icon,
    onSave,
    placeholder,
    type = 'text',
    multiline = false
}) => {
    const theme = useTheme();
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const [isSaving, setIsSaving] = useState(false);

    const handleEdit = () => {
        setEditValue(value);
        setIsEditing(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const success = await onSave(editValue);
            if (success) {
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Error saving field:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditValue(value);
        setIsEditing(false);
    };

    return (
        <Box sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                {icon}
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.65rem' }}>
                    {label}
                </Typography>
            </Box>
            {isEditing ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                        fullWidth
                        size="small"
                        type={type}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder={placeholder}
                        multiline={multiline}
                        rows={multiline ? 3 : 1}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                            }
                        }}
                    />
                    <Tooltip title="Зберегти">
                        <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            <CheckIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Скасувати">
                        <IconButton 
                            size="small" 
                            onClick={handleCancel}
                            disabled={isSaving}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ flex: 1, wordBreak: 'break-word' }}>
                        {value || <em style={{ color: theme.palette.text.disabled }}>Не вказано</em>}
                    </Typography>
                    <Tooltip title="Редагувати">
                        <IconButton size="small" onClick={handleEdit}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            )}
        </Box>
    );
};

// Read-only field component
interface ReadOnlyFieldProps {
    label: string;
    value: string | undefined;
    icon: React.ReactNode;
    copyable?: boolean;
}

const ReadOnlyField: React.FC<ReadOnlyFieldProps> = ({
    label,
    value,
    icon,
    copyable = false
}) => {
    const theme = useTheme();
    const [copySuccess, setCopySuccess] = useState(false);    const handleCopy = async (event: React.MouseEvent) => {
        event.stopPropagation();
        if (!value) return;
        try {
            await navigator.clipboard.writeText(value);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    return (
        <Box sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                {icon}
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.65rem' }}>
                    {label}
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ flex: 1, wordBreak: 'break-word' }}>
                    {value || <em style={{ color: theme.palette.text.disabled }}>Не вказано</em>}
                </Typography>
                {copyable && value && (
                    <Tooltip title={copySuccess ? "Скопійовано!" : "Копіювати"}>
                        <IconButton size="small" onClick={handleCopy}>
                            <ContentCopyIcon fontSize="small" color={copySuccess ? "success" : "inherit"} />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
        </Box>
    );
};

const UserRequestComponent: React.FC<UserRequestComponentProps> = ({
    request,
    onStatusChange,
    onUpdate,
    collapsed = false,
    index,
    onClick
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
      // State management
    const [currentRequest, setCurrentRequest] = useState<UserRequest>(request);
    const [isInternallyCollapsed, setIsInternallyCollapsed] = useState(collapsed);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
    const [copySuccess, setCopySuccess] = useState<string | null>(null);

    const isCollapsed = isInternallyCollapsed;
    const statusConfig = getStatusConfig(currentRequest.status);

    // Helper functions
    const getInitials = (name?: string, surname?: string) => {
        if (!name && !surname) return '?';
        const nameInitial = name ? name.charAt(0) : '';
        const surnameInitial = surname ? surname.charAt(0) : '';
        return `${nameInitial}${surnameInitial}`.toUpperCase() || '?';
    };

    const getAvatarColor = (id: number | string) => {
        const stringId = id.toString();
        const hash = stringId.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        
        const hue = Math.abs(hash) % 360;
        return `hsl(${hue}, 70%, 80%)`;
    };    const trimComment = (comment: string | undefined, maxLength: number = 80) => {
        if (!comment || comment.length <= maxLength) return comment || '';
        return comment.substring(0, maxLength) + '...';
    };

    const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    // Copy to clipboard function
    const copyToClipboard = (text: string, type: string, event: React.MouseEvent) => {
        event.stopPropagation();
        navigator.clipboard.writeText(text)
            .then(() => {
                setCopySuccess(type);
                setTimeout(() => setCopySuccess(null), 2000);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    };

    // Handle card click
    const handleCardClick = () => {
        if (onClick) {
            onClick(currentRequest);
        }
        setIsInternallyCollapsed(!isInternallyCollapsed);
    };

    // Handle status change
    const handleStatusChange = async (event: SelectChangeEvent<string>) => {
        const newStatus = event.target.value as RequestStatus;
        
        try {
            if (onStatusChange) {
                const success = await onStatusChange(currentRequest.request_id, newStatus);
                if (success) {
                    setCurrentRequest(prev => ({ ...prev, status: newStatus }));
                    showSnackbar('Статус запиту оновлено');
                } else {
                    showSnackbar('Помилка при оновленні статусу', 'error');
                }
            } else {
                // Mock success
                setCurrentRequest(prev => ({ ...prev, status: newStatus }));
                showSnackbar('Статус оновлено (mock)');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            showSnackbar('Помилка при оновленні статусу', 'error');
        }
    };

    // Field save handlers
    const handleSaveField = useCallback(async (field: string, value: string) => {
        try {
            const updatedRequest = { ...currentRequest, [field]: value };
            if (onUpdate) {
                const success = await onUpdate(updatedRequest);
                if (success) {
                    setCurrentRequest(updatedRequest);
                    showSnackbar('Поле успішно оновлено');
                    return true;
                } else {
                    showSnackbar('Помилка при оновленні поля', 'error');
                    return false;
                }
            } else {
                // Mock success
                setCurrentRequest(updatedRequest);
                showSnackbar('Поле оновлено (mock)');
                return true;
            }
        } catch (error) {
            console.error('Error saving field:', error);
            showSnackbar('Помилка при збереженні поля', 'error');
            return false;
        }
    }, [currentRequest, onUpdate]);

    return (
        <>
            {isCollapsed ? (
                // Collapsed mode - compact view
                <Paper
                    elevation={0}
                    sx={{
                        p: isMobile ? 1 : 1.5,
                        borderRadius: '12px',
                        border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                        mb: 1,
                        transition: 'all 0.2s ease-in-out',
                        cursor: 'pointer',
                        '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.04),
                            borderColor: alpha(theme.palette.primary.main, 0.3),
                            transform: 'translateY(-1px)',
                            boxShadow: theme.shadows[2]
                        }
                    }}
                    onClick={handleCardClick}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {/* Number Badge */}
                        {typeof index !== 'undefined' && (
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                minWidth: 24,
                                height: 24,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                borderRadius: '50%',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                color: theme.palette.primary.main
                            }}>
                                {index}
                            </Box>
                        )}

                        {/* Avatar */}
                        <Avatar 
                            sx={{ 
                                bgcolor: getAvatarColor(currentRequest.request_id),
                                width: 32, 
                                height: 32,
                                fontSize: '0.8rem'
                            }}
                        >
                            {getInitials(currentRequest.name, currentRequest.surname)}
                        </Avatar>

                        {/* Main Content */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            {/* Name and Surname (if present) */}
                            {(currentRequest.name || currentRequest.surname) && (
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        display: 'block',
                                        fontSize: '0.65rem',
                                        color: theme.palette.text.secondary,
                                        lineHeight: 1.2,
                                        mb: 0.2
                                    }}
                                >
                                    {[currentRequest.name, currentRequest.surname].filter(Boolean).join(' ')}
                                </Typography>
                            )}                            {/* Phone or fallback */}
                            {currentRequest.phone ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                    <PhoneIcon sx={{ fontSize: '0.9rem', color: theme.palette.text.secondary }} />
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {currentRequest.phone}
                                    </Typography>
                                    <Tooltip title={copySuccess === 'phone' ? "Скопійовано!" : "Копіювати телефон"}>
                                        <IconButton 
                                            size="small" 
                                            onClick={(e) => copyToClipboard(currentRequest.phone || '', 'phone', e)}
                                            sx={{ ml: 0.5 }}
                                        >
                                            <ContentCopyIcon 
                                                fontSize="small" 
                                                color={copySuccess === 'phone' ? "success" : "inherit"}
                                            />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                    <PhoneIcon sx={{ fontSize: '0.9rem', color: theme.palette.text.secondary }} />
                                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: theme.palette.text.secondary }}>
                                        Телефон не вказано
                                    </Typography>
                                </Box>
                            )}

                            {/* Trimmed Comment */}
                            {currentRequest.comment && (
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        display: 'block',
                                        color: theme.palette.text.secondary,
                                        fontSize: '0.7rem',
                                        lineHeight: 1.3
                                    }}
                                >
                                    {trimComment(currentRequest.comment, 60)}
                                </Typography>
                            )}
                        </Box>

                        {/* Status Selector */}
                        <Box sx={{ ml: 1 }}>
                            <FormControl size="small" sx={{ minWidth: 120 }}>                                <Select
                                    value={currentRequest.status || RequestStatus.NEW}
                                    onChange={handleStatusChange}
                                    onClick={(e) => e.stopPropagation()}
                                    sx={{
                                        '& .MuiSelect-select': {
                                            py: 0.5,
                                            fontSize: '0.75rem'
                                        }
                                    }}
                                >
                                    <MenuItem value={RequestStatus.NEW}>
                                        <Chip label="Новий" color="info" size="small" />
                                    </MenuItem>
                                    <MenuItem value={RequestStatus.APPROVED}>
                                        <Chip label="Схвалений" color="success" size="small" />
                                    </MenuItem>
                                    <MenuItem value={RequestStatus.REJECTED}>
                                        <Chip label="Відхилений" color="error" size="small" />
                                    </MenuItem>
                                    <MenuItem value={RequestStatus.WRONG_CONTACTS}>
                                        <Chip label="Неправильні контакти" color="warning" size="small" />
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        {/* Expand Icon */}
                        <IconButton size="small" onClick={handleCardClick}>
                            <ExpandMoreOutlinedIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Paper>
            ) : (
                // Expanded mode - full details
                <Paper
                    elevation={0}
                    sx={{
                        p: isMobile ? 1.5 : 2,
                        borderRadius: '12px',
                        border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                        mb: 1,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            borderColor: alpha(theme.palette.primary.main, 0.3),
                            boxShadow: theme.shadows[1]
                        }
                    }}
                >
                    {/* Header */}
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2, 
                            mb: 2,
                            cursor: 'pointer',
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.04),
                            },
                            padding: 1,
                            borderRadius: '8px',
                        }}
                        onClick={handleCardClick}
                    >
                        <Avatar 
                            sx={{ 
                                bgcolor: getAvatarColor(currentRequest.request_id),
                                width: 40, 
                                height: 40,
                                fontSize: '1.1rem'
                            }}
                        >
                            {getInitials(currentRequest.name, currentRequest.surname)}
                        </Avatar>

                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {[currentRequest.name, currentRequest.surname].filter(Boolean).join(' ') || 'Заявка без імені'}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip
                                    size="small"
                                    label={statusConfig.label}
                                    color={statusConfig.color}
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                />                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                    ID: {currentRequest.request_id}
                                    {currentRequest.created_at && (
                                        <> • {new Date(currentRequest.created_at).toLocaleDateString('uk-UA')}</>
                                    )}
                                </Typography>
                            </Box>
                        </Box>
                        
                        {/* Close/Collapse button */}
                        <IconButton
                            onClick={handleCardClick}
                            size="small"
                            sx={{
                                bgcolor: alpha(theme.palette.grey[500], 0.1),
                                '&:hover': {
                                    bgcolor: alpha(theme.palette.grey[500], 0.2),
                                }
                            }}
                        >
                            <ExpandLessOutlinedIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Status Management */}
                    <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
                        Статус заявки
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Статус</InputLabel>                            <Select
                                value={currentRequest.status || RequestStatus.NEW}
                                onChange={handleStatusChange}
                                label="Статус"
                            >
                                <MenuItem value={RequestStatus.NEW}>Новий</MenuItem>
                                <MenuItem value={RequestStatus.APPROVED}>Схвалений</MenuItem>
                                <MenuItem value={RequestStatus.REJECTED}>Відхилений</MenuItem>
                                <MenuItem value={RequestStatus.WRONG_CONTACTS}>Неправильні контакти</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Contact Information */}
                    <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
                        Контактна інформація
                    </Typography>

                    <Grid container spacing={isMobile ? 1 : 1.5}>
                        <Grid item xs={12} md={6}>
                            <EditableField
                                label="Ім'я"
                                value={currentRequest.name || ''}
                                icon={<PersonIcon sx={{ opacity: 0.7, fontSize: '1.2rem' }} />}
                                onSave={(value) => handleSaveField('name', value)}
                                placeholder="Введіть ім'я"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <EditableField
                                label="Прізвище"
                                value={currentRequest.surname || ''}
                                icon={<PersonIcon sx={{ opacity: 0.7, fontSize: '1.2rem' }} />}
                                onSave={(value) => handleSaveField('surname', value)}
                                placeholder="Введіть прізвище"
                            />
                        </Grid>
                    </Grid>                    <EditableField
                        label="Телефон"
                        value={currentRequest.phone || ''}
                        icon={<PhoneIcon sx={{ opacity: 0.7, fontSize: '1.2rem' }} />}
                        onSave={(value) => handleSaveField('phone', value)}
                        placeholder="Введіть телефон"
                        type="tel"
                    />

                    <ReadOnlyField
                        label="Email"
                        value={currentRequest.email || ''}
                        icon={<EmailIcon sx={{ opacity: 0.7, fontSize: '1.2rem' }} />}
                        copyable={true}
                    />

                    <ReadOnlyField
                        label="Telegram"
                        value={currentRequest.telegram_username || ''}
                        icon={<TelegramIcon sx={{ opacity: 0.7, fontSize: '1.2rem' }} />}
                        copyable={true}
                    />

                    <ReadOnlyField
                        label="Instagram"
                        value={currentRequest.instagram_username || ''}
                        icon={<InstagramIcon sx={{ opacity: 0.7, fontSize: '1.2rem' }} />}
                        copyable={true}
                    />

                    <Divider sx={{ my: 2 }} />

                    {/* Comment Section */}
                    <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
                        Коментар
                    </Typography>                    <EditableField
                        label="Коментар до заявки"
                        value={currentRequest.comment || ''}
                        icon={<CommentIcon sx={{ opacity: 0.7, fontSize: '1.2rem' }} />}
                        onSave={(value) => handleSaveField('comment', value)}
                        placeholder="Введіть коментар"
                        multiline={true}
                    />

                    {/* Date Information */}
                    {(currentRequest.created_at || currentRequest.updated_at) && (
                        <>
                            <Divider sx={{ my: 2 }} />
                            
                            <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
                                Дати
                            </Typography>

                            <Grid container spacing={isMobile ? 1 : 1.5}>
                                {currentRequest.created_at && (
                                    <Grid item xs={12} md={6}>
                                        <ReadOnlyField
                                            label="Дата створення"
                                            value={new Date(currentRequest.created_at).toLocaleString('uk-UA')}
                                            icon={<EventIcon sx={{ opacity: 0.7, fontSize: '1.2rem' }} />}
                                        />
                                    </Grid>
                                )}
                                {currentRequest.updated_at && (
                                    <Grid item xs={12} md={6}>
                                        <ReadOnlyField
                                            label="Дата оновлення"
                                            value={new Date(currentRequest.updated_at).toLocaleString('uk-UA')}
                                            icon={<AccessTimeIcon sx={{ opacity: 0.7, fontSize: '1.2rem' }} />}
                                        />
                                    </Grid>
                                )}
                            </Grid>
                        </>
                    )}
                </Paper>
            )}

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default UserRequestComponent;