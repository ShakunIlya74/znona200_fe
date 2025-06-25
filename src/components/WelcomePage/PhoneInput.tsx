// src/components/PhoneInput.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  CircularProgress,
} from '@mui/material';
import CallIcon from '@mui/icons-material/Call';
import CloseIcon from '@mui/icons-material/Close';
// Import your PopUp component if necessary
// import PopUp from './PopUp';

interface PhoneInputProps {
  onMobile?: boolean;
}

const PhoneInput: React.FC<PhoneInputProps> = ({ onMobile = false }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [phoneErrorText, setPhoneErrorText] = useState('');
  const [phone, setPhone] = useState('');

  const handleRegisterClick = () => {
    // Placeholder for register button click logic
    // You can integrate your logic here
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start', // Changed from 'center' to 'flex-start'
          maxWidth: 500,
          // margin: '0 auto', // Removed to align items to the left
          // padding: 2,
        }}
      >        {/* Header Text */}
        <Typography
          variant="subtitle1"
          sx={{
            // display: isFocused ? 'none' : 'block',
            color: '#063231',
            textAlign: 'left',
            fontSize: onMobile ? '0.9rem' : '0.95rem',
            mb: onMobile ? 0.5 : 1,
          }}
        >
          Номер телефону:
        </Typography>

        {/* Input Container */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: onMobile ? 'column' : 'row',
            alignItems: onMobile ? 'stretch' : 'center',
            width: '100%',
            gap: onMobile ? 1 : 0,
          }}
        >
          {/* Phone Input Container */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: onMobile ? '100%' : '50%',
              border: isFocused ? '2px solid #006A68' : '1px solid #757877',
              borderRadius: 2,
              padding: onMobile ? '8px 12px' : 1,
              transition: 'border 0.3s',
              backgroundColor: '#FFFFFF',
            }}
          >            {/* Call Icon */}
            <InputAdornment position="start">
              <CallIcon 
                color="primary" 
                sx={{ fontSize: onMobile ? '1.2rem' : '1.3rem' }}
              />
            </InputAdornment>

            {/* Phone Input */}
            <TextField
              fullWidth
              variant="standard"
              placeholder={isFocused ? '(00) 000-0000' : 'Введіть номер телефону'}
              value={phone}
              autoComplete="off"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(phone.length > 0)}
              onChange={(e) => {
                setPhone(e.target.value);
                setPhoneError(false);
                // Simple phone formatting (optional)
                const cleaned = e.target.value.replace(/\D/g, '');
                let formatted = cleaned;
                if (cleaned.length > 3 && cleaned.length <= 6) {
                  formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
                } else if (cleaned.length > 6) {
                  formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(
                    2,
                    5
                  )}-${cleaned.slice(5, 9)}`;
                }
                setPhone(formatted);
              }}              sx={{
                '& .MuiInputBase-root': {
                  fontSize: onMobile ? '16px' : '17px',
                },
                '& .MuiInput-underline:before': {
                  borderBottom: 'none',
                },
                '& .MuiInput-underline:after': {
                  borderBottom: 'none',
                },
              }}
            />
          </Box>

          {/* Submit Button */}
          <Box sx={{ 
            width: onMobile ? '100%' : '50%', 
            ml: onMobile ? 0 : 1 
          }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleRegisterClick}
              disabled={isLoading}              sx={{
                height: onMobile ? '48px' : '42px',
                borderRadius: 2,
                fontWeight: 700,
                textTransform: 'none',
                fontSize: onMobile ? '0.9rem' : '0.95rem',
                '&:hover': {
                  backgroundColor: '#004D40',
                },
              }}
            >              {isLoading ? (
                <CircularProgress size={onMobile ? 20 : 22} color="inherit" />
              ) : (
                'Запис на курс'
              )}
            </Button>
          </Box>
        </Box>        {/* Error Message */}
        {phoneError && (
          <Typography
            variant="body2"
            sx={{ 
              color: 'red', 
              marginTop: 1, 
              fontSize: onMobile ? '12px' : '13px',
              textAlign: 'left',
            }}
          >
            {phoneErrorText}
          </Typography>
        )}


      </Box>      {/* Additional Info */}
      <Typography
        variant="body2"
        sx={{
          textAlign: 'center',
          color: '#757877',
          fontSize: onMobile ? '12px' : '13px',
          mt: onMobile ? 1 : 0.5,
          mb: 1,
          lineHeight: onMobile ? 1.3 : 1.4,
        }}
      >
        * Для зручного способу зв'язку рекомендуємо вказувати номер, прив'язаний до Telegram.
      </Typography>

      {/* PopUp Component */}
      {/* <PopUp /> */}
    </Box>
  );
};

export default PhoneInput;
