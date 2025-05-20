import React from 'react';
import {
  Box,
  Typography,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { MultipleChoiceOption } from '../interfaces';
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
  hideCorrectAnswers?: boolean; // New prop to control showing correct answers
}

const AnsweredMultipleChoiceQuestion: React.FC<AnsweredMultipleChoiceQuestionProps> = ({
  questionId,
  questionNumber,
  questionText,
  options,
  userSelectedOptions,
  hideCorrectAnswers = false // Default to false to maintain backward compatibility
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
        icon: <CheckCircleOutlineIcon sx={{ color: theme.palette.success.main, fontSize: '1.1rem' }} />,
        textColor: theme.palette.success.main
      };
    }

    // Case 2: User selected this option but it's incorrect
    if (isSelected && !option.is_correct) {
      return {
        borderColor: theme.palette.error.main,
        backgroundColor: alpha(theme.palette.error.main, 0.1),
        icon: <CancelOutlinedIcon sx={{ color: theme.palette.error.main, fontSize: '1.1rem' }} />,
        textColor: theme.palette.error.main
      };
    }

    // Case 3: User did not select this option but it's correct (show what they missed)
    // Only show if we're not hiding correct answers
    if (!isSelected && option.is_correct && !hideCorrectAnswers) {
      return {
        borderColor: theme.palette.success.light,
        backgroundColor: alpha(theme.palette.success.light, 0.05),
        icon: <CheckCircleOutlineIcon sx={{ color: theme.palette.success.light, fontSize: '1.1rem' }} />,
        textColor: theme.palette.success.light
      };
    }

    // Case 4: User did not select this option and it's incorrect (neutral)
    // Case 5: Correct option but we're hiding correct answers
    return {
      borderColor: theme.palette.grey[300],
      backgroundColor: 'transparent',
      icon: null,
      textColor: theme.palette.text.primary
    };
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

      {/* Options list with feedback */}
      <Box sx={{ mb: 1.5 }}> {/* Reduced from mb: 4 */}
        {options.map((option, index) => {
          const status = getOptionStatus(option);

          // If we're hiding correct answers and this one was correct but not selected,
          // don't show any special styling
          const shouldDisplay = !(hideCorrectAnswers && option.is_correct && !isOptionSelected(option.id));

          return (
            <Box
              key={option.id}
              sx={{
                mb: 0.75, // Reduced from mb: 2
                p: 1, // Reduced from p: 2
                borderRadius: '8px',
                border: `1px solid ${shouldDisplay ? status.borderColor : theme.palette.grey[300]}`,
                backgroundColor: shouldDisplay ? status.backgroundColor : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: '32px' // Added minimum height for consistency
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography
                  variant="body2" // Changed from body1 to body2 for more compact text
                  sx={{
                    fontWeight: isOptionSelected(option.id) ? 600 : 400,
                    color: shouldDisplay ? status.textColor : theme.palette.text.primary
                  }}
                >
                  <Box component="span" sx={{ fontWeight: 600, mr: 1 }}>
                    {ANSWER_LABELS[index]}.
                  </Box>
                  {option.text}
                </Typography>
              </Box>

              {/* Display icon if needed and we should display it */}
              {shouldDisplay && status.icon && (
                <Box sx={{ ml: 1 }}> {/* Reduced from ml: 2 */}
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