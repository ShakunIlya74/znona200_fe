import React, { useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Radio,
  FormControlLabel,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { MultipleChoiceOption } from './interfaces';

// Answer labels for options
const ANSWER_LABELS = ['А', 'Б', 'В', 'Г', 'Д'];

// Custom styled Radio component for circular selection
const CircleRadio = styled(Radio)(({ theme }) => ({
  color: theme.palette.grey[400],
  '&.Mui-checked': {
    color: theme.palette.primary.main,
  },
  padding: '9px',
}));

interface MultipleChoiceQuestionProps {
  questionId: number;
  questionNumber: number;
  questionText: string;
  options: MultipleChoiceOption[];
  selectedOptions: number[];
  onOptionSelect: (questionId: number, optionId: number) => void;
  onLastSelect?: () => void; // New prop for triggering next question
}

const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  questionId,
  questionNumber,
  questionText,
  options,
  selectedOptions,
  onOptionSelect,
  onLastSelect
}) => {
  const theme = useTheme();

  // Calculate the number of correct options
  const correctOptionsCount = useMemo(() => 
    options.filter(option => option.is_correct).length, 
    [options]
  );

  // Check if an option is selected
  const isOptionSelected = (optionId: number): boolean => {
    return selectedOptions.includes(optionId);
  };
  
  // Handle option selection with limitation
  const handleOptionSelect = (questionId: number, optionId: number) => {
    if (isOptionSelected(optionId)) {
      // If already selected, just deselect it
      onOptionSelect(questionId, optionId);
    } else {
      // If not selected and we've reached the limit, remove the first selection first
      if (selectedOptions.length >= correctOptionsCount && correctOptionsCount > 0) {
        // Create a new array without the first selected option
        const updatedSelections = [...selectedOptions.slice(1), optionId];
        // Call onOptionSelect twice: once to remove first option, once to add new option
        onOptionSelect(questionId, selectedOptions[0]);
        onOptionSelect(questionId, optionId);
      } else {
        // Otherwise, just select it normally
        onOptionSelect(questionId, optionId);
        
        // Check if we've now reached the number of correct options
        if (selectedOptions.length + 1 === correctOptionsCount && correctOptionsCount > 0) {
          // If we've reached the limit and onLastSelect is provided, call it
          if (onLastSelect) {
            // Use setTimeout to ensure the state update completes first
            setTimeout(() => onLastSelect(), 300);
          }
        }
      }
    }
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
      
      {/* Options list */}
      <Box sx={{ mb: 4 }}>
        {options.map((option, index) => (
          <Box 
            key={option.id} 
            sx={{ 
              mb: 2, 
              p: 2, 
              borderRadius: '8px',
              border: `1px solid ${isOptionSelected(option.id) 
                ? theme.palette.primary.main 
                : alpha(theme.palette.grey[300], 0.8)}`,
              backgroundColor: isOptionSelected(option.id) 
                ? alpha(theme.palette.primary.main, 0.1) 
                : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: isOptionSelected(option.id)
                  ? alpha(theme.palette.primary.main, 0.15)
                  : alpha(theme.palette.grey[100], 0.8),
              }
            }}
            onClick={() => handleOptionSelect(questionId, option.id)}
          >
            <FormControlLabel
              control={
                <CircleRadio 
                  checked={isOptionSelected(option.id)}
                  onClick={(e) => {
                    // Stop propagation to prevent double handling
                    e.stopPropagation();
                    handleOptionSelect(questionId, option.id);
                  }}
                />
              }
              label={
                <Typography variant="body1">
                  <Box component="span" sx={{ fontWeight: 600, mr: 1 }}>
                    {ANSWER_LABELS[index]}.
                  </Box>
                  {option.text}
                </Typography>
              }
              sx={{ 
                margin: 0,
                width: '100%',
                // Make the entire label clickable
                '& .MuiFormControlLabel-label': {
                  width: '100%',
                  cursor: 'pointer'
                }
              }}
              onClick={() => handleOptionSelect(questionId, option.id)}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default MultipleChoiceQuestion;