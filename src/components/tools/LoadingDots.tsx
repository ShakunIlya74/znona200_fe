import React from 'react';
import { Box, keyframes, styled } from '@mui/material';

// Keyframes for the pulsing animation
const pulse = keyframes`
  0%, 100% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.8;
  }
`;

// Styled component for the individual dots
const Dot = styled(Box)(({ theme }) => ({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: theme.palette.grey[400],
  margin: '0 4px',
  display: 'inline-block',
}));

interface LoadingDotsProps {
  size?: 'small' | 'medium' | 'large';
}

const LoadingDots: React.FC<LoadingDotsProps> = ({ size = 'medium' }) => {
  // Size variations
  const sizeMap = {
    small: { dotSize: 6, margin: 3 },
    medium: { dotSize: 8, margin: 4 },
    large: { dotSize: 10, margin: 5 },
  };
  
  const { dotSize, margin } = sizeMap[size];
  
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={1}
    >
      <Dot
        sx={{
          width: dotSize,
          height: dotSize,
          margin: `0 ${margin}px`,
          animation: `${pulse} 1.4s infinite ease-in-out`,
          animationDelay: '0s',
        }}
      />
      <Dot
        sx={{
          width: dotSize,
          height: dotSize,
          margin: `0 ${margin}px`,
          animation: `${pulse} 1.4s infinite ease-in-out`,
          animationDelay: '0.2s',
        }}
      />
      <Dot
        sx={{
          width: dotSize,
          height: dotSize,
          margin: `0 ${margin}px`,
          animation: `${pulse} 1.4s infinite ease-in-out`,
          animationDelay: '0.4s',
        }}
      />
    </Box>
  );
};

export default LoadingDots;