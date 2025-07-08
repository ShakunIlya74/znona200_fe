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
import { createUserRequest, CreateUserRequestPayload } from '../../services/UserService';

interface PhoneInputProps {
  onMobile?: boolean;
}

type ContactType = 'phone' | 'telegram' | 'instagram';

const PhoneInput: React.FC<PhoneInputProps> = ({ onMobile = false }) => {
  const [isFocused, setIsFocused] = useState(false);  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [phoneErrorText, setPhoneErrorText] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [telegram, setTelegram] = useState('');
  const [instagram, setInstagram] = useState('');
  const [selectedContact, setSelectedContact] = useState<ContactType>('phone');
  const handleRegisterClick = async () => {
    // Get the current contact value
    const contactValue = getContactValue();    // Check if input is not empty
    if (!contactValue || contactValue.trim() === '') {
      setPhoneError(true);
      const errorMessages = {
        phone: 'Будь ласка, введіть номер телефону',
        telegram: 'Будь ласка, введіть Telegram username',
        instagram: 'Будь ласка, введіть Instagram username'
      };
      setPhoneErrorText(errorMessages[selectedContact]);
      return;
    }

    // Basic validation for each contact type
    if (selectedContact === 'phone') {
      // Check if phone has at least 10 digits
      const phoneDigits = contactValue.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        setPhoneError(true);
        setPhoneErrorText('Номер телефону повинен містити принаймні 10 цифр');
        return;
      }
    } else if (selectedContact === 'telegram') {
      // Check if telegram username starts with @ and has at least 5 characters
      if (!contactValue.startsWith('@') || contactValue.length < 5) {
        setPhoneError(true);
        setPhoneErrorText('Telegram username повинен починатися з @ і містити принаймні 5 символів');
        return;
      }
    } else if (selectedContact === 'instagram') {
      // Check if instagram username has at least 3 characters
      if (contactValue.length < 3) {
        setPhoneError(true);
        setPhoneErrorText('Instagram username повинен містити принаймні 3 символи');
        return;
      }
    }

    setIsLoading(true);
    setPhoneError(false);
    setPhoneErrorText('');

    try {
      // Prepare the request data based on selected contact type
      const requestData: CreateUserRequestPayload = {};
      
      switch (selectedContact) {
        case 'phone':
          requestData.phone = contactValue;
          break;
        case 'telegram':
          requestData.telegram_username = contactValue;
          break;
        case 'instagram':
          requestData.instagram_username = contactValue;
          break;
      }

      // Send the request to the backend
      const response = await createUserRequest(requestData);
      
      if (response.success) {        // Success - clear form and show success message
        setPhone('');
        setTelegram('');
        setInstagram('');
        setIsFocused(false);        setSuccessMessage('Заявка успішно надіслана! Ми зв\'яжемося з вами найближчим часом.');
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
        
        // You can add a success notification here
        // For example: show a success snackbar or modal
        console.log('User request created successfully:', response.message);
        
        // Optional: You can add a success callback here
        // onSuccess?.(response);
      } else {
        // Handle error from backend
        setPhoneError(true);
        setPhoneErrorText(response.message || 'Помилка при створенні запиту');
      }
    } catch (error) {
      console.error('Error creating user request:', error);
      setPhoneError(true);
      setPhoneErrorText('Помилка при відправці запиту. Спробуйте пізніше.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleContactTypeChange = (type: ContactType) => {
    setSelectedContact(type);
    setPhoneError(false);
    setPhoneErrorText('');
    setSuccessMessage('');
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
        break;      case 'telegram':
        // Allow @ symbol and alphanumeric characters
        let telegramValue = value.replace(/[^@\w]/g, '');
        // Ensure it starts with @ if user types something
        if (telegramValue.length > 0 && !telegramValue.startsWith('@')) {
          telegramValue = '@' + telegramValue;
        }
        setTelegram(telegramValue);
        break;
      case 'instagram':
        // Allow alphanumeric, dots, and underscores
        const instagramValue = value.replace(/[^a-zA-Z0-9._]/g, '');
        setInstagram(instagramValue);
        break;    }
    setPhoneError(false);
    setSuccessMessage('');
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
          >            {/* Phone Icon - Always visible but changes size */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                border: '2px solid transparent',
                borderColor: selectedContact === 'phone' 
                  ? (isFocused ? '#006A68' : '#757877')
                  : '#757877',
                borderRadius: 2,
                padding: selectedContact === 'phone' ? (onMobile ? '6px 10px' : '6px 8px') : '6px',
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
            </Box>            {/* Telegram Input/Icon */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                border: '2px solid transparent',
                borderColor: selectedContact === 'telegram' 
                  ? (isFocused ? '#006A68' : '#757877')
                  : '#757877',
                borderRadius: 2,
                padding: selectedContact === 'telegram' ? (onMobile ? '6px 10px' : '6px 8px') : '6px',
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
            </Box>            {/* Instagram Input/Icon */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                border: '2px solid transparent',
                borderColor: selectedContact === 'instagram' 
                  ? (isFocused ? '#006A68' : '#757877')
                  : '#757877',
                borderRadius: 2,
                padding: selectedContact === 'instagram' ? (onMobile ? '6px 10px' : '6px 8px') : '6px',
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
          </Box>        </Box>
        
        {/* Success Message */}
        {successMessage && (
          <Typography
            variant="body2"
            sx={{ 
              color: 'green', 
              marginTop: 1, 
              fontSize: onMobile ? '12px' : '13px',
              textAlign: 'left',
            }}
          >
            {successMessage}
          </Typography>
        )}
        
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
        * Для зручного способу зв'язку рекомендуємо вказувати номер, прив'язаний до Telegram, Telegram никнейм або Instagram.
      </Typography>

      {/* PopUp Component */}
      {/* <PopUp /> */}
    </Box>
  );
};

export default PhoneInput;