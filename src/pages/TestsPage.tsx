import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { GetTestsData } from '../services/TestService';

const TestsPage: React.FC = () => {


    // load initial tests folders
    useEffect(() => {
        const TestsData = GetTestsData();
        TestsData.then(res => {
            if (res.success) {
                //do smth
            } else {
                // todo: check if redirect is needed
                //   navigate({pathname: '/logout',});

            }
            console.log(res);
        });
    }, []);



    return (
        <>

            {/* More content can go here */}
        </>
    );
};

export default TestsPage;
