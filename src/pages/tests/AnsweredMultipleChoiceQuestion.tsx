import React from 'react';
import { 
  Box, 
  Typography, 
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { MultipleChoiceOption } from './interfaces';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

// Answer labels for options
const ANSWER_LABELS = ['А', 'Б', 'В', 'Г', 'Д'];

interface AnsweredMultipleChoiceQuestionProps {
  questionId: number;
  questionNumber: number;
  questionText: string;
  options: MultipleChoiceOption[];
  userSelectedOptions: number[];
}

const AnsweredMultipleChoiceQuestion: React.FC<AnsweredMultipleChoiceQuestionProps> = ({
  questionId,
  questionNumber,
  questionText,
  options,
  userSelectedOptions
}) => {
  const theme = useTheme();

  // Check if an option is selected by the user
  const isOptionSelected = (optionId: number): boolean => {
    return userSelectedOptions.includes(optionId);
  };

  // Determine the styling and icon for each option based on correctness
  const getOptionStatus = (option: MultipleChoiceOption) => {
    const isSelected = isOptionSelected(option.id);
    
    // Case 1: User selected this option and it's correct
    if (isSelected && option.is_correct) {
      return {
        borderColor: theme.palette.success.main,
        backgroundColor: alpha(theme.palette.success.main, 0.1),
        icon: <CheckCircleOutlineIcon sx={{ color: theme.palette.success.main }} />,
        textColor: theme.palette.success.main
      };
    }
    
    // Case 2: User selected this option but it's incorrect
    if (isSelected && !option.is_correct) {
      return {
        borderColor: theme.palette.error.main,
        backgroundColor: alpha(theme.palette.error.main, 0.1),
        icon: <CancelOutlinedIcon sx={{ color: theme.palette.error.main }} />,
        textColor: theme.palette.error.main
      };
    }
    
    // Case 3: User did not select this option but it's correct (show what they missed)
    if (!isSelected && option.is_correct) {
      return {
        borderColor: theme.palette.success.light,
        backgroundColor: alpha(theme.palette.success.light, 0.05),
        icon: <CheckCircleOutlineIcon sx={{ color: theme.palette.success.light }} />,
        textColor: theme.palette.success.light
      };
    }
    
    // Case 4: User did not select this option and it's incorrect (neutral)
    return {
      borderColor: theme.palette.grey[300],
      backgroundColor: 'transparent',
      icon: null,
      textColor: theme.palette.text.primary
    };
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ 
        mb: 3, 
        fontWeight: 600, 
        color: theme.palette.primary.main 
      }}>
        {questionNumber}. {questionText}
      </Typography>
      
      {/* Options list with feedback */}
      <Box sx={{ mb: 4 }}>
        {options.map((option, index) => {
          const status = getOptionStatus(option);
          
          return (
            <Box 
              key={option.id} 
              sx={{ 
                mb: 2, 
                p: 2, 
                borderRadius: '8px',
                border: `1px solid ${status.borderColor}`,
                backgroundColor: status.backgroundColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: isOptionSelected(option.id) ? 600 : 400,
                    color: status.textColor
                  }}
                >
                  <Box component="span" sx={{ fontWeight: 600, mr: 1 }}>
                    {ANSWER_LABELS[index]}.
                  </Box>
                  {option.text}
                </Typography>
              </Box>
              
              {/* Display icon if needed */}
              {status.icon && (
                <Box sx={{ ml: 2 }}>
                  {status.icon}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default AnsweredMultipleChoiceQuestion;