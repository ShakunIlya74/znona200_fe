import React, { useState, useCallback, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Container,
    alpha,
    useTheme,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Stack,
    Card,
    CardContent,
    Grid
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    Email as EmailIcon,
    TrendingUp as TrendingUpIcon,
    Assessment as AssessmentIcon
} from '@mui/icons-material';
import { getEmailStats, UserCreationLog, EmailStatsResponse } from '../../services/UserService';

/**
 * Component for displaying user creation statistics and email sending information
 */
const UserCreationStatsTab: React.FC = () => {
    const theme = useTheme();
    
    // Component state
    const [loading, setLoading] = useState(false);
    const [emailStats, setEmailStats] = useState<EmailStatsResponse | null>(null);
    const [notification, setNotification] = useState<{
        message: string;
        severity: 'success' | 'error' | 'info' | 'warning';
    } | null>(null);

    // Get status color based on log status and failed creations
    const getStatusColor = (log: UserCreationLog): 'warning' | 'success' | 'error' => {
        if (log.status === 'started') {
            return 'warning';
        } else if (log.status === 'finished') {
            return log.failed_creations > 0 ? 'error' : 'success';
        }
        return 'warning';
    };

    // Get status text
    const getStatusText = (log: UserCreationLog): string => {
        if (log.status === 'started') {
            return 'В процесі';
        } else if (log.status === 'finished') {
            return log.failed_creations > 0 ? 'Завершено з помилками' : 'Завершено успішно';
        }
        return 'Невідомо';
    };

    // Format date string
    const formatDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            return date.toLocaleString('uk-UA', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    // Fetch email statistics
    const fetchEmailStats = useCallback(async () => {
        setLoading(true);
        setNotification(null);

        try {
            const response = await getEmailStats();
            setEmailStats(response);

            if (response.success) {
                setNotification({
                    message: 'Статистика оновлена успішно',
                    severity: 'success'
                });
            } else {
                setNotification({
                    message: response.message || 'Помилка при отриманні статистики',
                    severity: 'error'
                });
            }
        } catch (error) {
            console.error('Error fetching email stats:', error);
            setNotification({
                message: 'Помилка при отриманні статистики',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchEmailStats();
    }, [fetchEmailStats]);

    // Auto-refresh notification cleanup
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
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
                    <AssessmentIcon fontSize="large" />
                    Статистика створення користувачів
                </Typography>
                
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ maxWidth: 800, mx: 'auto' }}
                >
                    Перегляд статистики створення користувачів та відправки електронних листів
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

            {/* Refresh Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <Button
                    variant="outlined"
                    startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
                    onClick={fetchEmailStats}
                    disabled={loading}
                    sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        fontWeight: 600
                    }}
                >
                    {loading ? 'Оновлення...' : 'Оновити статистику'}
                </Button>
            </Box>

            {/* Email Statistics Cards */}
            {emailStats?.success && emailStats.email_stats && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={6}>
                        <Card
                            sx={{
                                borderRadius: 3,
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <EmailIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
                                    <Typography variant="h6" fontWeight={600}>
                                        Електронні листи сьогодні
                                    </Typography>
                                </Box>
                                <Typography variant="h3" color="primary" fontWeight={700}>
                                    {emailStats.email_stats.emails_sent_today}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    відправлено сьогодні
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <Card
                            sx={{
                                borderRadius: 3,
                                border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                                boxShadow: `0 4px 20px ${alpha(theme.palette.success.main, 0.1)}`
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <TrendingUpIcon sx={{ fontSize: 32, color: theme.palette.success.main }} />
                                    <Typography variant="h6" fontWeight={600}>
                                        Залишилося на сьогодні
                                    </Typography>
                                </Box>
                                <Typography variant="h3" color="success.main" fontWeight={700}>
                                    {emailStats.email_stats.emails_left_for_today}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    листів можна відправити
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* User Creation Logs Table */}
            <Paper
                sx={{
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    overflow: 'hidden'
                }}
            >
                <Box sx={{ p: 3, borderBottom: `1px solid ${alpha(theme.palette.grey[300], 0.5)}` }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            color: theme.palette.primary.main
                        }}
                    >
                        Історія створення користувачів
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Останні 100 процесів створення користувачів
                    </Typography>
                </Box>

                <TableContainer sx={{ maxHeight: 500 }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, bgcolor: alpha(theme.palette.grey[50], 0.8) }}>
                                    ID Процесу
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, bgcolor: alpha(theme.palette.grey[50], 0.8) }}>
                                    Оновлено
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, bgcolor: alpha(theme.palette.grey[50], 0.8) }}>
                                    Всього користувачів
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, bgcolor: alpha(theme.palette.grey[50], 0.8) }}>
                                    Створено успішно
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, bgcolor: alpha(theme.palette.grey[50], 0.8) }}>
                                    Помилки створення
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, bgcolor: alpha(theme.palette.grey[50], 0.8) }}>
                                    Листи відправлено
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, bgcolor: alpha(theme.palette.grey[50], 0.8) }}>
                                    Помилки листів
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, bgcolor: alpha(theme.palette.grey[50], 0.8) }}>
                                    Статус
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                                        <CircularProgress size={32} />
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                            Завантаження статистики...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : emailStats?.success && emailStats.email_stats?.user_creation_logs ? (
                                emailStats.email_stats.user_creation_logs.length > 0 ? (
                                    emailStats.email_stats.user_creation_logs.map((log) => (
                                        <TableRow
                                            key={log.add_process_id}
                                            sx={{
                                                '&:hover': {
                                                    bgcolor: alpha(theme.palette.primary.main, 0.02)
                                                }
                                            }}
                                        >
                                            <TableCell>{log.add_process_id}</TableCell>
                                            <TableCell>{formatDate(log.updated_at)}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {log.total_added_users}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="success.main" fontWeight={600}>
                                                    {log.successful_creations}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography 
                                                    variant="body2" 
                                                    color={log.failed_creations > 0 ? "error.main" : "text.secondary"}
                                                    fontWeight={log.failed_creations > 0 ? 600 : 400}
                                                >
                                                    {log.failed_creations}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="primary.main" fontWeight={600}>
                                                    {log.successful_emails}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography 
                                                    variant="body2" 
                                                    color={log.failed_emails > 0 ? "error.main" : "text.secondary"}
                                                    fontWeight={log.failed_emails > 0 ? 600 : 400}
                                                >
                                                    {log.failed_emails}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={getStatusText(log)}
                                                    color={getStatusColor(log)}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 600,
                                                        minWidth: 120
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Немає даних для відображення
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                                        <Typography variant="body2" color="error">
                                            Помилка завантаження даних
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Container>
    );
};

export default UserCreationStatsTab;