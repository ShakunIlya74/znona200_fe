import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Paper, Divider, CircularProgress, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { GetTestView, TestCardMeta } from '../services/TestService';
import LoadingDots from '../components/tools/LoadingDots';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface TestViewData {
  success: boolean;
  test_dict?: TestCardMeta;
  error?: string;
}

const TestViewPage: React.FC = () => {
    const { tfp_sha } = useParams<{ tfp_sha: string }>();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [testData, setTestData] = useState<TestCardMeta | null>(null);
    const theme = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        const loadTestData = async () => {
            if (!tfp_sha) {
                setError('Test ID is missing');
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const response = await GetTestView(tfp_sha) as TestViewData;
                if (response.success && response.test_dict) {
                    setTestData(response.test_dict);
                } else {
                    setError(response.error || 'Failed to load test data');
                }
            } catch (err) {
                console.error(err);
                setError('An error occurred while loading the test');
            } finally {
                setLoading(false);
            }
        };

        loadTestData();
    }, [tfp_sha]);

    const handleBackClick = () => {
        navigate('/tests');
    };

    return (
        <Container maxWidth="lg" sx={{ py: 2 }}>
            {/* <Button 
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
                Назад до тестів
            </Button> */}
            
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
            ) : testData ? (
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
                        {testData.test_name}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            Test ID: {testData.test_id}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            TFP SHA: {testData.tfp_sha}
                        </Typography>
                    </Box>
                    
                    {/* Here you would display the actual test content/questions */}
                    <Box sx={{ mt: 4, p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.03), borderRadius: '8px' }}>
                        <Typography variant="body1">
                            Test content will be displayed here. This implementation currently shows only the test metadata.
                        </Typography>
                    </Box>
                </Paper>
            ) : (
                <Typography variant="h5" sx={{ textAlign: 'center', color: theme.palette.text.secondary }}>
                    No test data available
                </Typography>
            )}
        </Container>
    );
};

export default TestViewPage;