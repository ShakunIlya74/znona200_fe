import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField,
  Button,
  IconButton,
  useTheme,
  Paper
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
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

// EditableContent component for text that transforms into editable field on demand
const EditableContent: React.FC<{
  value: string;
  onChange: (newValue: string) => void;
  placeholder?: string;
  multiline?: boolean;
  isNew?: boolean;
}> = ({
  value,
  onChange,
  placeholder = 'Enter text...',
  multiline = false,
  isNew = false
}) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(isNew);
  const [editValue, setEditValue] = useState(value);
  
  useEffect(() => {
    setEditValue(value);
  }, [value]);
  
  const handleBlur = () => {
    setIsEditing(false);
    onChange(editValue);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !multiline) {
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(value); // Reset to original value
    }
  };
  
  if (isEditing) {
    return (
      <TextField
        fullWidth
        multiline={multiline}
        rows={multiline ? 2 : 1}
        variant="outlined"
        size="small"
        autoFocus
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '6px',
          }
        }}
      />
    );
  }
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        width: '100%',
        minHeight: '32px',
        cursor: 'pointer',
      }}
      onClick={() => setIsEditing(true)}
    >
      <Typography 
        variant="body2" 
        sx={{ 
          flex: 1,
          color: value ? theme.palette.text.primary : alpha(theme.palette.text.primary, 0.5),
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      >
        {value || placeholder}
      </Typography>
      <IconButton 
        size="small" 
        onClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
        sx={{ 
          opacity: 0.6,
          ml: 1,
          '&:hover': {
            opacity: 1,
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
          }
        }}
      >
        <EditIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

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
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: '6px',
            border: `1px solid ${alpha(theme.palette.grey[300], 0.8)}`,
          }}
        >
          <EditableContent
            value={questionText}
            onChange={setQuestionText}
            placeholder="Введіть текст питання"
            multiline
          />
        </Paper>
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
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              {/* Correct/Incorrect checkbox icon */}
              <IconButton 
                onClick={() => handleOptionCorrectToggle(option.id)}
                size="small"
                sx={{ p: 0.5, mr: 0.5, mt: 0.5 }}
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
                  minWidth: '20px',
                  mt: 0.5
                }}
              >
                {ANSWER_LABELS[index % ANSWER_LABELS.length]}.
              </Typography>
              
              {/* Option content */}
              <Box sx={{ flex: 1 }}>
                <EditableContent
                  value={option.text}
                  onChange={(newText) => handleOptionTextChange(option.id, newText)}
                  placeholder={`Варіант ${index + 1}`}
                  multiline
                  isNew={option.text === ''}
                />
              </Box>
              
              {/* Delete button */}
              <IconButton 
                onClick={() => handleRemoveOption(option.id)}
                size="small"
                sx={{ 
                  color: theme.palette.error.main,
                  ml: 0.5,
                  p: 0.5,
                  mt: 0.5,
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