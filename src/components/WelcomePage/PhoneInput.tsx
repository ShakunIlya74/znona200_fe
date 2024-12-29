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

const PhoneInput: React.FC = () => {
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
          alignItems: 'center',
          maxWidth: 500,
          margin: '0 auto',
          padding: 2,
        }}
      >
        {/* Header Text */}
        <Typography
          variant="subtitle1"
          sx={{
            display: isFocused ? 'none' : 'block',
            marginBottom: 1,
            color: '#063231',
          }}
        >
          Номер телефону:
        </Typography>

        {/* Input Container */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            border: isFocused ? '2px solid #006A68' : '1px solid #757877',
            borderRadius: 2,
            padding: 1,
            transition: 'border 0.3s',
            backgroundColor: '#FFFFFF',
          }}
        >
          {/* Call Icon */}
          <InputAdornment position="start">
            <CallIcon color="primary" />
          </InputAdornment>

          {/* Phone Input */}
          <TextField
            fullWidth
            variant="standard"
            placeholder={isFocused ? '(00) 000-0000' : 'Введіть номер телефону'}
            value={phone}
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
            }}
            sx={{
              '& .MuiInputBase-root': {
                fontSize: '16px',
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

        {/* Error Message */}
        {phoneError && (
          <Typography
            variant="body2"
            sx={{ color: 'red', marginTop: 1, fontSize: '14px' }}
          >
            {phoneErrorText}
          </Typography>
        )}

        {/* Submit Button */}
        <Box sx={{ width: '100%', marginTop: 2 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleRegisterClick}
            disabled={isLoading}
            sx={{
              height: '45px',
              borderRadius: 2,
              fontWeight: 700,
              textTransform: 'none',
            }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Запис на курс'}
          </Button>
        </Box>
      </Box>

      {/* Additional Info */}
      <Typography
        variant="body2"
        sx={{
          textAlign: 'center',
          marginTop: 2,
          color: '#757877',
          fontSize: '14px',
        }}
      >
        *Для зручного способу зв'язку рекомендуємо вказувати номер, прив'язаний до Telegram.
      </Typography>

      {/* PopUp Component */}
      {/* <PopUp /> */}
    </Box>
  );
};

export default PhoneInput;
