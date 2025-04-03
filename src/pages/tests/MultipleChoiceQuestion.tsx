import React from 'react';
import { 
  Box, 
  Typography, 
  Checkbox, 
  FormControlLabel,
  Button,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { MultipleChoiceOption } from './interfaces';

// Answer labels for options
const ANSWER_LABELS = ['А', 'Б', 'В', 'Г', 'Д'];

// Use proper TypeScript interface for custom props
interface OptionButtonProps {
  selected?: boolean;
}

const OptionButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<OptionButtonProps>(({ theme, selected }) => ({
  width: '40px',
  height: '40px',
  margin: '0 8px',
  borderRadius: '8px',
  fontWeight: 'bold',
  backgroundColor: selected ? theme.palette.primary.main : 'transparent',
  border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.grey[300]}`,
  color: selected ? theme.palette.primary.contrastText : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: selected ? theme.palette.primary.dark : alpha(theme.palette.primary.main, 0.1),
  },
}));

interface MultipleChoiceQuestionProps {
  questionId: number;
  questionNumber: number;
  questionText: string;
  options: MultipleChoiceOption[];
  selectedOptions: number[];
  onOptionSelect: (questionId: number, optionId: number) => void;
}

const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  questionId,
  questionNumber,
  questionText,
  options,
  selectedOptions,
  onOptionSelect
}) => {
  const theme = useTheme();

  // Check if an option is selected
  const isOptionSelected = (optionId: number): boolean => {
    return selectedOptions.includes(optionId);
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
            onClick={() => onOptionSelect(questionId, option.id)}
          >
            <FormControlLabel
              control={
                <Checkbox 
                  checked={isOptionSelected(option.id)}
                  onChange={() => onOptionSelect(questionId, option.id)}
                  sx={{ 
                    color: theme.palette.primary.main,
                    '&.Mui-checked': {
                      color: theme.palette.primary.main,
                    },
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
            />
          </Box>
        ))}
      </Box>
      
      {/* Option selection row */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        mb: 2,
        mt: 3
      }}>
        {options.map((option, index) => (
          <OptionButton
            key={option.id}
            selected={isOptionSelected(option.id)}
            onClick={() => onOptionSelect(questionId, option.id)}
          >
            {ANSWER_LABELS[index]}
          </OptionButton>
        ))}
      </Box>
    </Box>
  );
};

export default MultipleChoiceQuestion;