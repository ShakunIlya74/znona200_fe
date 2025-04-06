import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField,
  Button,
  IconButton,
  Checkbox,
  useTheme,
  Paper
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { MultipleChoiceOption } from './interfaces';

// Answer labels for options
const ANSWER_LABELS = ['А', 'Б', 'В', 'Г','Ґ', 'Д', 'Е', 'Є', 'Ж', 'З'];

interface EditMultipleChoiceQuestionProps {
  questionId?: number; // Optional - if not provided, we're creating a new question
  initialQuestionText?: string;
  initialOptions?: MultipleChoiceOption[];
  onSave?: (questionData: { 
    question_text: string, 
    options_list: Array<{
      id: number, 
      text: string, 
      is_correct: boolean
    }> 
  }) => void;
}

const EditMultipleChoiceQuestion: React.FC<EditMultipleChoiceQuestionProps> = ({
  questionId,
  initialQuestionText = '',
  initialOptions = [],
  onSave
}) => {
  const theme = useTheme();
  const [questionText, setQuestionText] = useState(initialQuestionText);
  const [options, setOptions] = useState<MultipleChoiceOption[]>(initialOptions);
  const [nextOptionId, setNextOptionId] = useState<number>(1000); // Start with a high ID to avoid conflicts

  // Initialize nextOptionId based on existing options
  useEffect(() => {
    if (initialOptions.length > 0) {
      const maxId = Math.max(...initialOptions.map(opt => opt.id));
      setNextOptionId(maxId + 1);
    }
  }, [initialOptions]);

  // Auto-save when question or options change
  useEffect(() => {
    handleAutoSave();
  }, [questionText, options]);

  // Add a new option
  const handleAddOption = () => {
    const newOption: MultipleChoiceOption = {
      id: nextOptionId,
      text: '',
      is_correct: false
    };
    setOptions([...options, newOption]);
    setNextOptionId(nextOptionId + 1);
  };

  // Remove an option
  const handleRemoveOption = (optionId: number) => {
    setOptions(options.filter(option => option.id !== optionId));
  };

  // Update option text
  const handleOptionTextChange = (optionId: number, text: string) => {
    setOptions(options.map(option => 
      option.id === optionId ? { ...option, text } : option
    ));
  };

  // Toggle option correctness
  const handleOptionCorrectToggle = (optionId: number) => {
    setOptions(options.map(option => 
      option.id === optionId ? { ...option, is_correct: !option.is_correct } : option
    ));
  };

  // Auto-save the question
  const handleAutoSave = () => {
    // Only save if there's actual content
    if (!questionText.trim() && options.every(opt => !opt.text.trim())) {
      return;
    }
    
    const questionData = {
      question_text: questionText,
      options_list: options.map(option => ({
        id: option.id,
        text: option.text,
        is_correct: option.is_correct
      }))
    };
    
    if (onSave) {
      onSave(questionData);
    }
  };

  return (
    <Box>
      {/* Question editor */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ 
          mb: 0.5,
          fontWeight: 600, 
          color: theme.palette.text.primary 
        }}>
          Текст питання:
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={2}
          variant="outlined"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Введіть текст питання"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '6px',
            }
          }}
        />
      </Box>
      
      {/* Options list */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ 
          mb: 0.5,
          fontWeight: 600, 
          color: theme.palette.text.primary 
        }}>
          Варіанти відповідей:
        </Typography>
        
        {options.map((option, index) => (
          <Paper
            key={option.id}
            elevation={0}
            sx={{ 
              mb: 1,
              p: 1, 
              borderRadius: '6px',
              border: `1px solid ${option.is_correct 
                ? alpha(theme.palette.success.main, 0.5) 
                : alpha(theme.palette.grey[300], 0.8)}`,
              backgroundColor: option.is_correct 
                ? alpha(theme.palette.success.main, 0.05) 
                : 'transparent',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {/* Correct/Incorrect checkbox icon */}
              <IconButton 
                onClick={() => handleOptionCorrectToggle(option.id)}
                size="small"
                sx={{ p: 0.5, mr: 0.5 }}
              >
                {option.is_correct ? (
                  <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
                ) : (
                  <CancelIcon sx={{ color: theme.palette.error.main }} />
                )}
              </IconButton>
              
              {/* Option label */}
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: 600, 
                  mr: 1, 
                  minWidth: '20px'
                }}
              >
                {ANSWER_LABELS[index % ANSWER_LABELS.length]}.
              </Typography>
              
              {/* Option content */}
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                value={option.text}
                onChange={(e) => handleOptionTextChange(option.id, e.target.value)}
                placeholder={`Варіант ${index + 1}`}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '6px',
                  }
                }}
              />
              
              {/* Delete button */}
              <IconButton 
                onClick={() => handleRemoveOption(option.id)}
                size="small"
                sx={{ 
                  color: theme.palette.error.main,
                  ml: 0.5,
                  p: 0.5,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                  }
                }}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </Box>
          </Paper>
        ))}
        
        {/* Add option button */}
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleAddOption}
          sx={{
            mt: 1,
            borderRadius: '6px',
            borderColor: alpha(theme.palette.primary.main, 0.5),
            color: theme.palette.primary.main,
            py: 0.5,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              borderColor: theme.palette.primary.main,
            }
          }}
        >
          Додати варіант
        </Button>
      </Box>
    </Box>
  );
};

export default EditMultipleChoiceQuestion;