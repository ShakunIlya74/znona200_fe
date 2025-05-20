import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Radio,
  FormControlLabel,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { MultipleChoiceOption } from '../interfaces';

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
  // Store crossed out options state with question-specific key
  const [crossedOutOptions, setCrossedOutOptions] = useState<Record<number, number[]>>({});

  // Calculate the number of correct options
  const correctOptionsCount = useMemo(() =>
    options.filter(option => option.is_correct).length,
    [options]
  );

  // Check if an option is selected
  const isOptionSelected = (optionId: number): boolean => {
    return selectedOptions.includes(optionId);
  };

  // Check if option is crossed out for this specific question
  const isOptionCrossedOut = (optionId: number): boolean => {
    return (crossedOutOptions[questionId] || []).includes(optionId);
  };

  // Toggle crossed out state for an option in this specific question
  const toggleCrossedOutOption = (optionId: number) => {
    setCrossedOutOptions(prev => {
      const questionCrossedOut = prev[questionId] || [];

      if (questionCrossedOut.includes(optionId)) {
        // Remove from crossed out options
        return {
          ...prev,
          [questionId]: questionCrossedOut.filter(id => id !== optionId)
        };
      } else {
        // Add to crossed out options
        return {
          ...prev,
          [questionId]: [...questionCrossedOut, optionId]
        };
      }
    });
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
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <Typography variant="h6" sx={{
          mb: 2,
          fontWeight: 500,
          color: theme.palette.primary.main,
        }}
        >
          {questionNumber}.&nbsp;
        </Typography>
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontWeight: 500,
            color: theme.palette.primary.main,
            '& p': {
              margin: 0, // Override margin
              padding: 0, // Override padding
            },
            '& h3': {
              margin: 0, // Override margin
              padding: 0, // Override padding
            },
          }}
          dangerouslySetInnerHTML={{ __html: `${questionText}` }}
        />
      </Box>

      {/* Options list */}
      <Box sx={{ mb: 4 }}>
        {options.map((option, index) => (
          <Box
            key={option.id}
            sx={{
              mb: 1.5,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {/* Radio button outside of the option box - now disabled when crossed out */}
            <CircleRadio
              checked={isOptionSelected(option.id)}
              onClick={() => handleOptionSelect(questionId, option.id)}
              disabled={isOptionCrossedOut(option.id)}
              sx={{
                '&.Mui-disabled': {
                  color: theme.palette.grey[300],
                }
              }}
            />

            {/* Option box */}
            <Box
              sx={{
                flexGrow: 1,
                p: 1.5,
                borderRadius: '8px',
                border: `1px solid ${isOptionSelected(option.id)
                  ? theme.palette.primary.main
                  : alpha(theme.palette.grey[300], 0.8)}`,
                backgroundColor: isOptionSelected(option.id)
                  ? alpha(theme.palette.primary.main, 0.1)
                  : isOptionCrossedOut(option.id)
                    ? alpha(theme.palette.grey[100], 0.6)
                    : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: isOptionSelected(option.id)
                    ? alpha(theme.palette.primary.main, 0.15)
                    : isOptionCrossedOut(option.id)
                      ? alpha(theme.palette.grey[100], 0.8)
                      : alpha(theme.palette.grey[100], 0.5),
                }
              }}
              onClick={() => toggleCrossedOutOption(option.id)}
            >
              <Typography
                variant="body1"
              >
                <Box component="span" sx={{
                  fontWeight: 600, mr: 1,
                  color: isOptionCrossedOut(option.id) ? theme.palette.grey[500] : 'inherit'
                }}>
                  {ANSWER_LABELS[index]}.
                </Box>
                <Box
                  component="span"
                  sx={{
                    textDecoration: isOptionCrossedOut(option.id) ? 'line-through' : 'none',
                    color: isOptionCrossedOut(option.id) ? theme.palette.grey[500] : 'inherit'
                  }}
                >
                  {option.text}
                </Box>
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default MultipleChoiceQuestion;