// src/pages/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Checkbox, FormControlLabel, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ZnoLogo from '../source/header/logo_zno.svg';
import SapImage from '../source/login/sap.svg';
import TelegramLogo from '../source/footer/telegram_white.svg';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [isNewUser, setIsNewUser] = useState(window.location.pathname !== '/login');

    const changeFlow = () => {
        setIsNewUser(!isNewUser);
    };

    useEffect(() => {
        setIsNewUser(window.location.pathname !== '/login');
    }, [window.location.pathname]);

    return (
        <Box
            sx={{
                display: 'flex',
                height: '100vh',
                width: '100%',
                position: 'absolute',
                top: 0,
                flexDirection: 'row',
                backgroundColor: '#CCE8E6',
            }}
        >

            {/* Image Section */}
            <Box
                sx={{
                    display: { xs: 'none', md: 'flex' },
                    flexDirection: 'column',
                    alignItems: 'flex-start',

                    backgroundColor: '#CCE8E6',
                    // padding: '45px 45px 0 45px',
                    width: { md: '60%', lg: '40%' },
                    boxSizing: 'border-box',
                    flexGrow: 0.7,
                }}
            >
                <Box sx={{
                    cursor: 'pointer',
                    mt: 5, ml: 10, mr: 2, maxWidth: '120%', height: 'auto',
                }} onClick={() => navigate('/')}>
                    <Box component="img"
                        sx={{ width: '140%', maxWidth: '140%', minWidth: '60%', height: 'auto', }}
                        src={ZnoLogo} alt="Logo ZNO" />
                </Box>

                <Box sx={{
                    alignContent: 'center', flexGrow: 1,
                    mr: 2, width: '140%'
                }}>
                    <Box component="img"
                        sx={{ width: '120%', maxWidth: '70%', height: 'auto', }}
                        src={SapImage} alt="SAP" />
                </Box>
            </Box>

            {/* Form Section */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '20px',
                    flexGrow: 1,
                    width: { md: '60%', lg: '60%' },
                    // boxSizing: 'border-box',
                    backgroundColor: '#f3f1f2',
                }}
            >
                <Box sx={{ growFlex: 1 }}>
                    <Box sx={{
                        display: { xs: 'flex', md: 'none' },
                        cursor: 'pointer',
                        maxWidth: '70%', height: 'auto', flexGrow: 1,
                        justifyContent: 'center', alignContent: 'center',
                    }} onClick={() => navigate('/')}>
                        <Box component="img"
                            sx={{ width: '140%', maxWidth: '140%', minWidth: '60%', height: 'auto', }}
                            src={ZnoLogo} alt="Logo ZNO" />
                    </Box>
                    {isNewUser ? <Register changeFlow={changeFlow} /> : <Login changeFlow={changeFlow} />}
                </Box>
            </Box>
        </Box>
    );
};

interface FlowProps {
    changeFlow: () => void;
}

const Login: React.FC<FlowProps> = ({ changeFlow }) => {
    const navigate = useNavigate();
    const [isRemember, setIsRemember] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    return (
        <Box sx={{ maxWidth: '140%', width: '120%', mx: 1, }}>

            <Typography variant="h6" sx={{ fontWeight: 200, mb: 2 }}>
                Нумо починати!
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ fontWeight: 400, fontSize: 18, color: '#3F6563', mr: 1 }}>
                    Немає облікового запису?
                </Typography>
                <Button
                    onClick={() => {
                        window.open('https://t.me/yaryna_yaromii', '_blank');
                        changeFlow();
                    }}
                    sx={{ textDecoration: 'underline', color: '#3F6563' }}
                >
                    Звʼяжіться з адміністратором
                </Button>
            </Box>

            {/* Telegram Login Button */}
            <Button
                variant="contained"
                startIcon={<img src={TelegramLogo} alt="Telegram" style={{ width: 18, height: 18 }} />}
                fullWidth
                sx={{
                    backgroundColor: '#229ED9',
                    borderRadius: '8px',
                    height: '45px',
                    mb: 2,
                    textTransform: 'none',
                    '&:hover': { backgroundColor: '#1b85c4' }, // Optional hover effect
                }}
            >
                Увійти за допомогою Telegram
            </Button>

            {/* OR Separator */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ flexGrow: 1, height: '1px', backgroundColor: '#E1E3E2', mr: 1 }} />
                <Typography sx={{ color: '#757877' }}>або</Typography>
                <Box sx={{ flexGrow: 1, height: '1px', backgroundColor: '#E1E3E2', ml: 1 }} />
            </Box>

            {/* Login Form */}
            <Box
                component="form"
                sx={{
                    backgroundColor: '#FFFFFF',
                    padding: 3,
                    borderRadius: 2,
                    boxShadow: '0px 10px 110px 1px rgba(59, 59, 59, 0.08)',
                }}
            >
                <Typography sx={{ mb: 1 }}>Електронна пошта</Typography>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="znona200@gmail.com"
                    sx={{ mb: 2 }}
                />
                <Typography sx={{ mb: 1 }}>Пароль</Typography>
                <TextField
                    fullWidth
                    variant="outlined"
                    type="password"
                    placeholder="**********"
                    sx={{ mb: 2 }}
                />
            </Box>

            {/* Remember Me and Forgot Password */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <FormControlLabel
                    control={<Checkbox checked={isRemember} onChange={() => setIsRemember(!isRemember)} />}
                    label="Запам'ятати мене"
                />
                <Button
                    onClick={() => navigate('/password-restore')}
                    sx={{ textDecoration: 'underline', color: '#063231' }}
                >
                    Забули свій пароль?
                </Button>
            </Box>

            {/* Submit Button */}
            <Button
                variant="contained"
                fullWidth
                sx={{
                    backgroundColor: '#006A68',
                    mt: 3,
                    height: '45px',
                    borderRadius: '8px',
                    fontWeight: '800',
                    textTransform: 'none',
                }}
                disabled={isSubmitting}
            >
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Увійти'}
            </Button>
        </Box>
    );
};

const Register: React.FC<FlowProps> = ({ changeFlow }) => {
    // Placeholder for the Register component
    return (
        <Box sx={{ maxWidth: 490, width: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 500, mb: 2 }}>
                Реєстрація
            </Typography>
            {/* Add registration form elements here */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ fontWeight: 400, fontSize: 18, color: '#3F6563', mr: 1 }}>
                    Вже маєте обліковий запис?
                </Typography>
                <Button onClick={changeFlow} sx={{ textDecoration: 'underline', color: '#3F6563' }}>
                    Увійдіть
                </Button>
            </Box>
            {/* Add additional registration UI elements as needed */}
        </Box>
    );
};

export default LoginPage;
