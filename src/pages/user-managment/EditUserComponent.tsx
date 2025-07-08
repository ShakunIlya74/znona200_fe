import React, { useState, useCallback } from 'react';
import {
    Box,
    Typography,
    Paper,
    Avatar,
    TextField,
    IconButton,
    Chip,
    Switch,
    FormControlLabel,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip,
    useTheme,
    alpha,
    Grid,
    Autocomplete,
    Divider,
    useMediaQuery,
    Alert,
    Snackbar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import TelegramIcon from '@mui/icons-material/Telegram';
import InstagramIcon from '@mui/icons-material/Instagram';
import GroupIcon from '@mui/icons-material/Group';
import ExpandLessOutlinedIcon from '@mui/icons-material/ExpandLessOutlined';
import { UserInfo, activateUser, deactivateUser } from '../../services/UserService';

// Extended UserInfo interface to include Instagram username
interface ExtendedUserInfo extends UserInfo {
    insta_username?: string;
}

// Mock group interface for the group picker
interface GroupInfo {
    group_id: number | string;
    group_name: string;
    is_active: boolean;
}

// Props interface for the EditUserComponent
interface EditUserComponentProps {
    user: ExtendedUserInfo;
    onSave?: (updatedUser: ExtendedUserInfo) => Promise<boolean>;
    onToggleActive?: (userId: number | string, isActive: boolean) => Promise<boolean>;
    onDelete?: (userId: number | string) => Promise<boolean>;
    onUpdateGroups?: (userId: number | string, groupIds: (number | string)[]) => Promise<boolean>;
    availableGroups?: GroupInfo[];
    userGroups?: GroupInfo[];
    // New props for collapsed mode
    collapsed?: boolean;
    index?: number;
    onClick?: (user: ExtendedUserInfo) => void;
}

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
    };    return (
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
                        rows={multiline ? 2 : 1}
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
                    <Typography variant="body2" sx={{ flex: 1 }}>
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

const EditUserComponent: React.FC<EditUserComponentProps> = ({
    user,
    onSave,
    onToggleActive,
    onDelete,
    onUpdateGroups,
    availableGroups = [],
    userGroups = [],
    collapsed = false,
    index,
    onClick
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    // State management
    const [currentUser, setCurrentUser] = useState<ExtendedUserInfo>(user);
    const [selectedGroups, setSelectedGroups] = useState<GroupInfo[]>(userGroups);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [activationConfirmOpen, setActivationConfirmOpen] = useState(false);
    const [pendingActivation, setPendingActivation] = useState<boolean | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
    const [copySuccess, setCopySuccess] = useState<string | null>(null);    // Internal state for collapsed/expanded when used in standalone mode
    const [isInternallyCollapsed, setIsInternallyCollapsed] = useState(collapsed);

    // Always use internal collapsed state to allow toggling
    const isCollapsed = isInternallyCollapsed;

    // Helper functions
    const getInitials = (name: string, surname: string) => {
        return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
    };

    const getAvatarColor = (id: number | string) => {
        const stringId = id.toString();
        const hash = stringId.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        
        const hue = Math.abs(hash) % 360;
        return `hsl(${hue}, 70%, 80%)`;
    };    const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    // Copy to clipboard function for collapsed mode
    const copyToClipboard = (text: string, type: string, event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent card click when copying
        navigator.clipboard.writeText(text)
            .then(() => {
                setCopySuccess(type);
                setTimeout(() => setCopySuccess(null), 2000);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    };    // Handle card click for collapsed mode
    const handleCardClick = () => {
        if (onClick) {
            // External handler provided - execute it
            onClick(currentUser);
        }
        // Always toggle internal state to expand/collapse the card
        setIsInternallyCollapsed(!isInternallyCollapsed);
    };

    // Field save handlers
    const handleSaveField = useCallback(async (field: keyof ExtendedUserInfo, value: string) => {
        try {
            const updatedUser = { ...currentUser, [field]: value };
            if (onSave) {
                const success = await onSave(updatedUser);
                if (success) {
                    setCurrentUser(updatedUser);
                    showSnackbar(`${field} успішно оновлено`);
                    return true;
                } else {
                    showSnackbar(`Помилка при оновленні ${field}`, 'error');
                    return false;
                }
            } else {
                // Mock success for UI testing
                setCurrentUser(updatedUser);
                showSnackbar(`${field} оновлено (mock)`);
                return true;
            }
        } catch (error) {
            console.error('Error saving field:', error);
            showSnackbar(`Помилка при збереженні ${field}`, 'error');
            return false;
        }
    }, [currentUser, onSave]);

    // Toggle user activation
    const handleToggleActivation = () => {
        const newStatus = !currentUser.is_active;
        setPendingActivation(newStatus);
        setActivationConfirmOpen(true);
    };    const confirmActivationToggle = async () => {
        if (pendingActivation === null) return;
        
        try {
            if (onToggleActive) {
                // Use the provided toggle function first
                const success = await onToggleActive(currentUser.user_id, pendingActivation);
                if (success) {
                    setCurrentUser(prev => ({ ...prev, is_active: pendingActivation }));
                    showSnackbar(`Користувач ${pendingActivation ? 'активований' : 'деактивований'}`);
                } else {
                    showSnackbar('Помилка при зміні статусу користувача', 'error');
                }
            } else {
                // Use UserService API functions directly
                let response;
                if (pendingActivation) {
                    response = await activateUser(currentUser.user_id);
                } else {
                    response = await deactivateUser(currentUser.user_id);
                }
                
                if (response.success) {
                    setCurrentUser(prev => ({ ...prev, is_active: pendingActivation }));
                    showSnackbar(`Користувач ${pendingActivation ? 'активований' : 'деактивований'}`);
                } else {
                    showSnackbar(response.message || 'Помилка при зміні статусу користувача', 'error');
                }
            }
        } catch (error) {
            console.error('Error toggling activation:', error);
            showSnackbar('Помилка при зміні статусу користувача', 'error');
        } finally {
            setActivationConfirmOpen(false);
            setPendingActivation(null);
        }
    };

    // Handle user deletion
    const handleDeleteUser = async () => {
        try {
            if (onDelete) {
                const success = await onDelete(currentUser.user_id);
                if (success) {
                    showSnackbar('Користувача успішно видалено');
                    // Here you would typically redirect or notify parent component
                } else {
                    showSnackbar('Помилка при видаленні користувача', 'error');
                }
            } else {
                // Mock success
                showSnackbar('Користувача видалено (mock)');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            showSnackbar('Помилка при видаленні користувача', 'error');
        } finally {
            setDeleteDialogOpen(false);
        }
    };

    // Handle group updates
    const handleGroupsUpdate = async () => {
        try {
            const groupIds = selectedGroups.map(group => group.group_id);
            if (onUpdateGroups) {
                const success = await onUpdateGroups(currentUser.user_id, groupIds);
                if (success) {
                    showSnackbar('Групи користувача оновлено');
                } else {
                    showSnackbar('Помилка при оновленні груп', 'error');
                }
            } else {
                // Mock success
                showSnackbar('Групи оновлено (mock)');
            }
        } catch (error) {
            console.error('Error updating groups:', error);
            showSnackbar('Помилка при оновленні груп', 'error');        }
    };

    return (
        <>
            {isCollapsed ? (
                // Collapsed mode - similar to ClickableUserCard
                <Paper
                    elevation={0}
                    sx={{
                        p: isMobile ? 0.5 : 1,
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
                    <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
                        {/* Number Badge */}
                        {typeof index !== 'undefined' && (
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                minWidth: 32,
                                height: 32,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                borderRadius: '50%',
                                mr: isMobile ? 0 : 1.5,
                                mb: isMobile ? 1 : 0,
                                alignSelf: isMobile ? 'flex-start' : 'center'
                            }}>
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        fontWeight: 600,
                                        color: theme.palette.primary.main,
                                        fontSize: '0.75rem'
                                    }}
                                >
                                    {index}
                                </Typography>
                            </Box>
                        )}

                        {/* Left Column: Avatar, Name, and Status */}
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'flex-start', 
                            gap: 1.5,
                            width: isMobile ? '100%' : '45%'
                        }}>
                            {!isMobile && (
                                <Avatar 
                                    sx={{ 
                                        bgcolor: getAvatarColor(currentUser.user_id),
                                        width: 40, 
                                        height: 40
                                    }}
                                >
                                    {getInitials(currentUser.name, currentUser.surname)}
                                </Avatar>
                            )}
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                                    {currentUser.name} {currentUser.surname}
                                </Typography>
                                <Chip
                                    size="small"
                                    label={currentUser.is_active ? "Активний" : "Не активний"}
                                    color={currentUser.is_active ? "success" : "default"}
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                            </Box>
                        </Box>
                        
                        {/* Right Column: Contact Information with Copy Functions */}
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: 0.5, 
                            justifyContent: 'center',
                            width: isMobile ? '100%' : '55%',
                            pl: isMobile ? 0 : 2
                        }}>
                            {/* Email - always show */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Tooltip title={copySuccess === 'email' ? 'Copied!' : 'Копіювати email'}>
                                    <IconButton 
                                        size="small" 
                                        onClick={(e) => copyToClipboard(currentUser.email, 'email', e)}
                                        color={copySuccess === 'email' ? 'success' : 'default'}
                                        sx={{ p: 0.5 }}
                                    >
                                        <EmailIcon fontSize="small" sx={{ opacity: 0.7 }} />
                                    </IconButton>
                                </Tooltip>
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        color: theme.palette.text.secondary,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}
                                >
                                    {currentUser.email}
                                </Typography>
                            </Box>
                            
                            {/* Phone - only if present */}
                            {currentUser.phone && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Tooltip title={copySuccess === 'phone' ? 'Copied!' : 'Копіювати телефон'}>
                                        <IconButton 
                                            size="small" 
                                            onClick={(e) => copyToClipboard(currentUser.phone, 'phone', e)}
                                            color={copySuccess === 'phone' ? 'success' : 'default'}
                                            sx={{ p: 0.5 }}
                                        >
                                            <PhoneIcon fontSize="small" sx={{ opacity: 0.7 }} />
                                        </IconButton>
                                    </Tooltip>
                                    <Typography 
                                        variant="body2" 
                                        sx={{ color: theme.palette.text.secondary }}
                                    >
                                        {currentUser.phone}
                                    </Typography>
                                </Box>
                            )}
                            
                            {/* Telegram - only if present */}
                            {currentUser.telegram_username && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Tooltip title={copySuccess === 'telegram' ? 'Copied!' : 'Копіювати Telegram'}>
                                        <IconButton 
                                            size="small" 
                                            onClick={(e) => copyToClipboard(currentUser.telegram_username, 'telegram', e)}
                                            color={copySuccess === 'telegram' ? 'success' : 'default'}
                                            sx={{ p: 0.5 }}
                                        >
                                            <TelegramIcon fontSize="small" sx={{ opacity: 0.7 }} />
                                        </IconButton>
                                    </Tooltip>
                                    <Typography 
                                        variant="body2" 
                                        sx={{ color: theme.palette.text.secondary }}
                                    >
                                        {currentUser.telegram_username}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Paper>            ) : (                // Expanded mode - full edit capabilities
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
                >                {/* Header with Avatar and Basic Info */}
                <Box 
                    sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2, 
                        mb: 2,
                        cursor: 'pointer', // Indicate it's clickable
                        '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.04), // Optional: subtle highlight on hover
                        },
                        padding: 1, // Add some padding to the clickable area
                        borderRadius: '8px', // Match the card's border radius
                    }}
                    onClick={handleCardClick}
                >
                    <Avatar 
                        sx={{ 
                            bgcolor: getAvatarColor(currentUser.user_id),
                            width: 40, 
                            height: 40,
                            fontSize: '1.1rem'
                        }}
                    >
                        {getInitials(currentUser.name, currentUser.surname)}
                    </Avatar>                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {currentUser.name} {currentUser.surname}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                                size="small"
                                label={currentUser.is_active ? "Активний" : "Неактивний"}
                                color={currentUser.is_active ? "success" : "default"}
                                sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                        </Box>
                    </Box>
                    
                    {/* Close/Collapse button in header */}
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

                <Divider sx={{ mb: 2 }} />                {/* Editable Fields */}
                <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
                    Особиста інформація
                </Typography>

                <Grid container spacing={isMobile ? 1 : 1.5}>
                    <Grid item xs={12} md={6}>
                        <EditableField
                            label="Ім'я"
                            value={currentUser.name}
                            icon={<PersonIcon sx={{ opacity: 0.7, fontSize: '1.2rem' }} />}
                            onSave={(value) => handleSaveField('name', value)}
                            placeholder="Введіть ім'я"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <EditableField
                            label="Прізвище"
                            value={currentUser.surname}
                            icon={<PersonIcon sx={{ opacity: 0.7, fontSize: '1.2rem' }} />}
                            onSave={(value) => handleSaveField('surname', value)}
                            placeholder="Введіть прізвище"
                        />
                    </Grid>
                </Grid>

                <EditableField
                    label="Email"
                    value={currentUser.email}
                    icon={<EmailIcon sx={{ opacity: 0.7, fontSize: '1.2rem' }} />}
                    onSave={(value) => handleSaveField('email', value)}
                    placeholder="Введіть email"
                    type="email"
                />

                <EditableField
                    label="Телефон"
                    value={currentUser.phone || ''}
                    icon={<PhoneIcon sx={{ opacity: 0.7, fontSize: '1.2rem' }} />}
                    onSave={(value) => handleSaveField('phone', value)}
                    placeholder="Введіть номер телефону"
                    type="tel"
                />

                <EditableField
                    label="Telegram"
                    value={currentUser.telegram_username || ''}
                    icon={<TelegramIcon sx={{ opacity: 0.7, fontSize: '1.2rem' }} />}
                    onSave={(value) => handleSaveField('telegram_username', value)}
                    placeholder="Введіть username Telegram"
                />

                <EditableField
                    label="Instagram"
                    value={currentUser.insta_username || ''}
                    icon={<InstagramIcon sx={{ opacity: 0.7, fontSize: '1.2rem' }} />}
                    onSave={(value) => handleSaveField('insta_username', value)}
                    placeholder="Введіть username Instagram"
                />                <Divider sx={{ my: 2 }} />

                {/* User Status and Actions */}
                <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
                    Статус і дії
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, alignItems: 'center', mb: 2 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={currentUser.is_active}
                                onChange={handleToggleActivation}
                                color="primary"
                                size="small"
                            />
                        }
                        label={currentUser.is_active ? "Користувач активний" : "Користувач неактивний"}
                        sx={{ flex: 1 }}
                    />
                    
                    <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => setDeleteDialogOpen(true)}
                        sx={{ minWidth: 120 }}
                    >
                        Видалити
                    </Button>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Group Management */}
                <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GroupIcon />
                    Групи користувача
                </Typography>

                <Box sx={{ mb: 1.5 }}>
                    <Autocomplete
                        multiple
                        options={availableGroups}
                        getOptionLabel={(option) => option.group_name}
                        value={selectedGroups}
                        onChange={(_, newValue) => setSelectedGroups(newValue)}
                        renderInput={(params) => (                        <TextField
                            {...params}
                            placeholder="Оберіть групи для користувача"
                            size="small"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                }
                            }}
                        />
                        )}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    {...getTagProps({ index })}
                                    key={option.group_id}
                                    label={option.group_name}
                                    size="small"
                                    color={option.is_active ? "primary" : "default"}
                                />
                            ))
                        }
                    />
                </Box>                <Button
                    variant="contained"
                    size="small"
                    onClick={handleGroupsUpdate}
                    sx={{ mb: 1 }}
                >
                    Оновити групи
                </Button>
                </Paper>
            )}

            {/* Confirmation Dialogs - shown in both modes */}
            <Dialog open={activationConfirmOpen} onClose={() => setActivationConfirmOpen(false)}>
                <DialogTitle>
                    Підтвердження зміни статусу
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Ви впевнені, що хочете {pendingActivation ? 'активувати' : 'деактивувати'} користувача?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setActivationConfirmOpen(false)}>
                        Скасувати
                    </Button>
                    <Button onClick={confirmActivationToggle} color="primary" variant="contained">
                        Підтвердити
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle sx={{ color: theme.palette.error.main }}>
                    Видалення користувача
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Ви впевнені, що хочете видалити користувача <strong>{currentUser.name} {currentUser.surname}</strong>?
                    </Typography>
                    <Typography sx={{ mt: 1, color: theme.palette.error.main, fontSize: '0.9rem' }}>
                        Ця дія незворотна!
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>
                        Скасувати
                    </Button>
                    <Button onClick={handleDeleteUser} color="error" variant="contained">
                        Видалити
                    </Button>
                </DialogActions>
            </Dialog>

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

export default EditUserComponent;