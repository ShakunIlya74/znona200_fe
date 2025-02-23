import React from 'react';
import { Container, Box, Typography } from '@mui/material';

const TestsPage: React.FC = () => {
    return (
        <Box sx={{
            display: 'flex', flexDirection: 'row',
            alignItems: 'left',
            
        }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', minHeight: '100%'}}>
                <Box sx={{ minWidth: { md: '350px', xs: 0 }, height: '100%', backgroundColor: 'white' }}>
                </Box>
                <Box sx={{ width: '100%', backgroundColor: '#f4f4f3', p: 5 }}>
                    <Typography variant="h4" gutterBottom>
                        Tests
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default TestsPage;