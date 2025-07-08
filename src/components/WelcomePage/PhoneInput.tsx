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
  Collapse,
  Grow,
  Fade,
} from '@mui/material';
import CallIcon from '@mui/icons-material/Call';
import TelegramIcon from '@mui/icons-material/Telegram';
import InstagramIcon from '@mui/icons-material/Instagram';
import CloseIcon from '@mui/icons-material/Close';

interface PhoneInputProps {
  onMobile?: boolean;
}

type ContactType = 'phone' | 'telegram' | 'instagram';

const PhoneInput: React.FC<PhoneInputProps> = ({ onMobile = false }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [phoneErrorText, setPhoneErrorText] = useState('');
  const [phone, setPhone] = useState('');
  const [telegram, setTelegram] = useState('');
  const [instagram, setInstagram] = useState('');
  const [selectedContact, setSelectedContact] = useState<ContactType>('phone');

  const handleRegisterClick = () => {
    // Placeholder for register button click logic
    // You can integrate your logic here
  };

  const handleContactTypeChange = (type: ContactType) => {
    setSelectedContact(type);
    setPhoneError(false);
    setPhoneErrorText('');
  };

  const getContactValue = () => {
    switch (selectedContact) {
      case 'phone':
        return phone;
      case 'telegram':
        return telegram;
      case 'instagram':
        return instagram;
      default:
        return '';
    }
  };

  const handleContactChange = (value: string) => {
    switch (selectedContact) {
      case 'phone':
        // Phone formatting logic
        const cleaned = value.replace(/\D/g, '');
        let formatted = cleaned;
        if (cleaned.length > 3 && cleaned.length <= 6) {
          formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
        } else if (cleaned.length > 6) {
          formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 5)}-${cleaned.slice(5, 9)}`;
        }
        setPhone(formatted);
        break;
      case 'telegram':
        // Allow @ symbol and alphanumeric characters
        const telegramValue = value.replace(/[^@\w]/g, '');
        setTelegram(telegramValue);
        break;
      case 'instagram':
        // Allow alphanumeric, dots, and underscores
        const instagramValue = value.replace(/[^a-zA-Z0-9._]/g, '');
        setInstagram(instagramValue);
        break;
    }
    setPhoneError(false);
  };

  const getPlaceholder = () => {
    switch (selectedContact) {
      case 'phone':
        return isFocused ? '(00) 000-0000' : 'Введіть номер телефону';
      case 'telegram':
        return '@username';
      case 'instagram':
        return 'username';
      default:
        return '';
    }
  };

  const getHeaderText = () => {
    switch (selectedContact) {
      case 'phone':
        return 'Номер телефону:';
      case 'telegram':
        return 'Telegram:';
      case 'instagram':
        return 'Instagram:';
      default:
        return 'Контакт:';
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          maxWidth: 500,
        }}
      >
        {/* Header Text */}
        <Typography
          variant="subtitle1"
          sx={{
            color: '#063231',
            textAlign: 'left',
            fontSize: onMobile ? '0.9rem' : '0.95rem',
            mb: onMobile ? 0.5 : 1,
          }}
        >
          {getHeaderText()}
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
          {/* Contact Input and Icons Container */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: onMobile ? '100%' : '65%',
              gap: 1,
            }}
          >
            {/* Phone Icon - Always visible but changes size */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                border: selectedContact === 'phone' 
                  ? (isFocused ? '2px solid #006A68' : '1px solid #757877')
                  : '1px solid #757877',
                borderRadius: 2,
                padding: selectedContact === 'phone' ? (onMobile ? '8px 12px' : '8px 10px') : '8px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backgroundColor: '#FFFFFF',
                width: selectedContact === 'phone' ? '100%' : '44px',
                minWidth: selectedContact === 'phone' ? 'auto' : '44px',
                overflow: 'hidden',
                cursor: selectedContact !== 'phone' ? 'pointer' : 'default',
                '&:hover': {
                  backgroundColor: selectedContact !== 'phone' ? '#f5f5f5' : '#FFFFFF',
                },
              }}
              onClick={() => selectedContact !== 'phone' && handleContactTypeChange('phone')}
            >
              <CallIcon 
                color={selectedContact === 'phone' ? 'primary' : 'action'}
                sx={{ fontSize: onMobile ? '1.2rem' : '1.1rem' }}
              />
              
              {/* Phone Input - Only visible when phone is selected */}
              <Collapse in={selectedContact === 'phone'} orientation="horizontal">
                <TextField
                  fullWidth
                  variant="standard"
                  placeholder={getPlaceholder()}
                  value={phone}
                  autoComplete="off"
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(phone.length > 0)}
                  onChange={(e) => handleContactChange(e.target.value)}
                  sx={{
                    ml: 1,
                    '& .MuiInputBase-root': {
                      fontSize: onMobile ? '16px' : '14px',
                    },
                    '& .MuiInput-underline:before': {
                      borderBottom: 'none',
                    },
                    '& .MuiInput-underline:after': {
                      borderBottom: 'none',
                    },
                  }}
                />
              </Collapse>
            </Box>

            {/* Telegram Input/Icon */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                border: selectedContact === 'telegram' 
                  ? (isFocused ? '2px solid #006A68' : '1px solid #757877')
                  : '1px solid #757877',
                borderRadius: 2,
                padding: selectedContact === 'telegram' ? (onMobile ? '8px 12px' : 1) : '8px',
                transition: 'all 0.3s ease',
                backgroundColor: '#FFFFFF',
                width: selectedContact === 'telegram' ? '100%' : 'auto',
                cursor: selectedContact !== 'telegram' ? 'pointer' : 'default',
                '&:hover': {
                  backgroundColor: selectedContact !== 'telegram' ? '#f5f5f5' : '#FFFFFF',
                },
              }}
              onClick={() => selectedContact !== 'telegram' && handleContactTypeChange('telegram')}
            >
              <TelegramIcon 
                color={selectedContact === 'telegram' ? 'primary' : 'action'}
                sx={{ fontSize: onMobile ? '1.2rem' : '1.1rem' }}
              />
              
              <Collapse in={selectedContact === 'telegram'} orientation="horizontal">
                <TextField
                  fullWidth
                  variant="standard"
                  placeholder={getPlaceholder()}
                  value={telegram}
                  autoComplete="off"
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(telegram.length > 0)}
                  onChange={(e) => handleContactChange(e.target.value)}
                  sx={{
                    ml: 1,
                    '& .MuiInputBase-root': {
                      fontSize: onMobile ? '16px' : '14px',
                    },
                    '& .MuiInput-underline:before': {
                      borderBottom: 'none',
                    },
                    '& .MuiInput-underline:after': {
                      borderBottom: 'none',
                    },
                  }}
                />
              </Collapse>
            </Box>

            {/* Instagram Input/Icon */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                border: selectedContact === 'instagram' 
                  ? (isFocused ? '2px solid #006A68' : '1px solid #757877')
                  : '1px solid #757877',
                borderRadius: 2,
                padding: selectedContact === 'instagram' ? (onMobile ? '8px 12px' : 1) : '8px',
                transition: 'all 0.3s ease',
                backgroundColor: '#FFFFFF',
                width: selectedContact === 'instagram' ? '100%' : 'auto',
                cursor: selectedContact !== 'instagram' ? 'pointer' : 'default',
                '&:hover': {
                  backgroundColor: selectedContact !== 'instagram' ? '#f5f5f5' : '#FFFFFF',
                },
              }}
              onClick={() => selectedContact !== 'instagram' && handleContactTypeChange('instagram')}
            >
              <InstagramIcon 
                color={selectedContact === 'instagram' ? 'primary' : 'action'}
                sx={{ fontSize: onMobile ? '1.2rem' : '1.1rem' }}
              />
              
              <Collapse in={selectedContact === 'instagram'} orientation="horizontal">
                <TextField
                  fullWidth
                  variant="standard"
                  placeholder={getPlaceholder()}
                  value={instagram}
                  autoComplete="off"
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(instagram.length > 0)}
                  onChange={(e) => handleContactChange(e.target.value)}
                  sx={{
                    ml: 1,
                    '& .MuiInputBase-root': {
                      fontSize: onMobile ? '16px' : '14px',
                    },
                    '& .MuiInput-underline:before': {
                      borderBottom: 'none',
                    },
                    '& .MuiInput-underline:after': {
                      borderBottom: 'none',
                    },
                  }}
                />
              </Collapse>
            </Box>
          </Box>

          {/* Submit Button */}
          <Box sx={{ 
            width: onMobile ? '100%' : '35%', 
            ml: onMobile ? 0 : 1 
          }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleRegisterClick}
              disabled={isLoading}
              sx={{
                height: onMobile ? '48px' : '42px',
                borderRadius: 2,
                fontWeight: 700,
                textTransform: 'none',
                fontSize: onMobile ? '0.9rem' : '0.95rem',
                '&:hover': {
                  backgroundColor: '#004D40',
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={onMobile ? 20 : 22} color="inherit" />
              ) : (
                'Запис на курс'
              )}
            </Button>
          </Box>
        </Box>
        {/* Error Message */}
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
      </Box>

      {/* Additional Info */}
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