import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography,
  TextField,
  Button,
  IconButton,
  useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import { MatchingCategory, MatchingOption } from '../interfaces';
import ReactQuill from 'react-quill'; // Added
import 'react-quill/dist/quill.snow.css'; // Added

interface EditMatchingQuestionProps {
  questionId?: number;
  initialQuestionText?: string;
  initialCategories?: MatchingCategory[];
  initialOptions?: MatchingOption[];
  onSave?: (questionData: { 
    question_id?: number;
    question_text: string;
    category_list: Array<MatchingCategory>;
    options_list: Array<MatchingOption>;
  }) => void;
}

// Simple EditableText component
const EditableText = ({
  value, 
  onChange, 
  onBlur,
  placeholder = 'Enter text...', 
  multiline = false, 
  isNew = false,
  allowHtml = false
}: {
  value: string;
  onChange: (newValue: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  multiline?: boolean;
  isNew?: boolean;
  allowHtml?: boolean;
}) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(isNew);
  const [text, setText] = useState(value);
  
  React.useEffect(() => {
    setText(value);
  }, [value]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const handleQuillChange = (content: string) => {
    setText(content);
  };
  
  const handleBlur = () => {
    if (text !== value) {
      onChange(text);
    }
    setIsEditing(false);
    if (onBlur) {
      setTimeout(() => onBlur(), 0);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !multiline) {
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setText(value);
    }
  };

  const consistentTypographyStyles = {
    fontSize: theme.typography.body2.fontSize,
    fontFamily: theme.typography.body2.fontFamily,
    fontWeight: theme.typography.body2.fontWeight,
    lineHeight: theme.typography.body2.lineHeight,
  };
  
  if (isEditing) {
    return (
      <Box> 
        {allowHtml ? (
          <Box
            sx={{
              '& .ql-editor': {
                ...consistentTypographyStyles,
                padding: '8.5px 14px', // Mimic TextField small padding
                minHeight: multiline ? `calc(2 * ${consistentTypographyStyles.lineHeight}em)` : `${consistentTypographyStyles.lineHeight}em`,
                backgroundColor: theme.palette.background.paper,
              },
              '& .ql-editor.ql-blank::before': {
                ...consistentTypographyStyles,
                color: theme.palette.text.disabled,
                fontStyle: 'italic',
                left: '14px',
                top: '8.5px',
                right: '14px',
                position: 'absolute',
                pointerEvents: 'none',
              },
              '& .ql-container.ql-snow': {
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '6px', 
              },
              '& .ql-toolbar.ql-snow': {
                border: `1px solid ${theme.palette.divider}`,
                borderBottom: 'none',
                borderRadius: '6px 6px 0 0',
                padding: '4px 8px',
                boxSizing: 'border-box',
              },
              backgroundColor: theme.palette.background.paper,
              borderRadius: '6px',
            }}
          >
            <ReactQuill
              theme="snow"
              value={text}
              onChange={handleQuillChange}
              onBlur={handleBlur}
              placeholder={placeholder}
              modules={{
                toolbar: [
                  ['bold', 'italic', 'underline', 'strike'],
                ],
              }}
            />
          </Box>
        ) : (
          <TextField
            fullWidth
            multiline={true} // Always use multiline for better text display
            minRows={multiline ? 2 : 1}
            maxRows={20} // Allow growth up to 20 rows before scrolling
            variant="outlined"
            size="small"
            autoFocus
            value={text}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '6px',
                backgroundColor: theme.palette.background.paper,
              },
              '& .MuiInputBase-input': {
                ...consistentTypographyStyles,
                overflow: 'visible', // Prevent scroll within the input
              },
              '& .MuiInputBase-inputMultiline': {
                resize: 'none', // Disable manual resizing
              },
              '& .MuiInputBase-input::placeholder': {
                ...consistentTypographyStyles,
                color: theme.palette.text.disabled, 
              },
            }}
          />
        )}
      </Box>
    );
  }
  
  return (
    <Box 
      onClick={() => setIsEditing(true)}
      sx={{ 
        minHeight: '32px', // Consistent min height
        cursor: 'pointer',
        // border: `1px solid transparent`, // Keep border for layout consistency, make transparent
        borderRadius: '6px', // Consistent border radius
        padding: '8.5px 14px', // Match TextField small padding
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%', // Ensure it takes full width like TextField
        '&:hover': {
          // backgroundColor: alpha(theme.palette.action.hover, 0.04), // Subtle hover
          // borderColor: theme.palette.divider, // Show border on hover
        }
      }}
    >
      {allowHtml ? (
        <Typography 
          variant="body2" 
          sx={{ 
            color: value ? theme.palette.text.primary : alpha(theme.palette.text.primary, 0.5),
            flex: 1,
            // mr: 1, // Remove margin if EditIcon is positioned absolutely or handled differently
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            '& p': { margin: 0 }, 
          }}
          dangerouslySetInnerHTML={{ __html: value || placeholder }}
        />
      ) : (
        <Typography variant="body2" sx={{ 
          color: value ? theme.palette.text.primary : alpha(theme.palette.text.primary, 0.5),
          flex: 1,
          // mr: 1,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {value || placeholder}
        </Typography>
      )}
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation(); // Prevent Box onClick from firing
          setIsEditing(true);
        }}
        sx={{
          opacity: 0.6,
          ml: 1, // Add some margin to the left of the icon
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

const EditMatchingQuestion = ({
  questionId,
  initialQuestionText = '',
  initialCategories = [],
  initialOptions = [],
  onSave
}: EditMatchingQuestionProps) => {
  const theme = useTheme();
  const [questionText, setQuestionText] = useState(initialQuestionText);

  // Initialize state once using lazy initialization
  const [categories, setCategories] = useState<MatchingCategory[]>(() =>
    initialCategories.length > 0 ? [...initialCategories].sort((a, b) => a.display_order - b.display_order) : []
  );
  const [options, setOptions] = useState<MatchingOption[]>(() => initialOptions);
  const [nextCategoryId, setNextCategoryId] = useState<number>(
    initialCategories.length > 0 ? Math.max(...initialCategories.map(cat => cat.id)) + 1 : 1
  );
  const [nextOptionId, setNextOptionId] = useState<number>(
    initialOptions.length > 0 ? Math.max(...initialOptions.map(opt => opt.id)) + 1 : 1
  );
  
  // Track if initial render has completed
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    // Mark that initial render is complete
    setIsInitialized(true);
  }, []);

  // Save all changes
  const handleSave = () => {
    if (!questionText.trim() && categories.length === 0 && options.length === 0) {
      return;
    }
    
    const questionData = {
      question_id: questionId,
      question_text: questionText,
      category_list: categories.map(category => ({
        id: category.id,
        text: category.text,
        display_order: category.display_order
      })),
      options_list: options.map(option => ({
        id: option.id,
        text: option.text,
        matching_category_id: option.matching_category_id
      }))
    };
    
    if (questionId === undefined) {
      delete questionData.question_id;
    }
    
    if (onSave) {
      onSave(questionData);
    }
  };

  // Use effect to trigger saves when state changes
  useEffect(() => {
    // Skip the initial render to avoid unnecessary save
    if (isInitialized) {
      handleSave();
    }
  }, [questionText, categories, options]);

  // Add a new matching pair
  const handleAddMatchingPair = () => {
    const newCategoryId = nextCategoryId;
    const newCategory: MatchingCategory = {
      id: newCategoryId,
      text: '',
      display_order: categories.length
    };
    
    const newOption: MatchingOption = {
      id: nextOptionId,
      text: '',
      matching_category_id: newCategoryId
    };
    
    setCategories([...categories, newCategory]);
    setOptions([...options, newOption]);
    setNextCategoryId(newCategoryId + 1);
    setNextOptionId(nextOptionId + 1);
    // handleSave will be called by useEffect
  };
  
  // Add unmatched option
  const handleAddUnmatchedOption = () => {
    const newOption: MatchingOption = {
      id: nextOptionId,
      text: '',
      matching_category_id: null  // Use null to indicate unmatched options
    };
    
    setOptions([...options, newOption]);
    setNextOptionId(nextOptionId + 1);
    // handleSave will be called by useEffect
  };

  // Remove a matching pair
  const handleRemoveMatchingPair = (categoryId: number) => {
    const updatedCategories = categories
      .filter(cat => cat.id !== categoryId)
      .map((cat, index) => ({ ...cat, display_order: index }));
    
    const updatedOptions = options.filter(opt => opt.matching_category_id !== categoryId);
    
    setCategories(updatedCategories);
    setOptions(updatedOptions);
    // handleSave will be called by useEffect
  };
  
  // Remove an unmatched option
  const handleRemoveUnmatchedOption = (optionId: number) => {
    setOptions(options.filter(opt => opt.id !== optionId));
    // handleSave will be called by useEffect
  };

  // Update category text
  const handleUpdateCategoryText = (categoryId: number, text: string) => {
    const updatedCategories = categories.map(cat => 
      cat.id === categoryId ? { ...cat, text } : cat
    );
    setCategories(updatedCategories);
    // handleSave will be called by useEffect
  };

  // Update option text
  const handleUpdateOptionText = (optionId: number, text: string) => {
    const updatedOptions = options.map(opt => 
      opt.id === optionId ? { ...opt, text } : opt
    );
    setOptions(updatedOptions);
    // handleSave will be called by useEffect
  };

  // Get matched option for a category
  const getMatchedOption = (categoryId: number) => {
    return options.find(opt => opt.matching_category_id === categoryId) || null;
  };

  // Get unmatched options
  const getUnmatchedOptions = () => {
    return options.filter(opt => 
      opt.matching_category_id === null || 
      !categories.some(cat => cat.id === opt.matching_category_id)
    );
  };

  return (
    <Box>
      {/* Question Text */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Текст питання:
        </Typography>
        <Box
          sx={{
            p: 1.5,
            borderRadius: '6px',
            border: `1px solid ${theme.palette.grey[300]}`,
          }}
        >
          <EditableText
            value={questionText}
            onChange={setQuestionText}
            placeholder="Введіть текст питання"
            multiline
            allowHtml // Added
          />
        </Box>
      </Box>
      
      {/* Matching pairs section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Відповідності:
        </Typography>
        
        <Box sx={{ display: 'flex', mb: 1, px: 1 }}>
          <Box sx={{ width: '45%', mr: 2 }}>
            <Typography fontWeight="bold">Варіанти</Typography>
          </Box>
          <Box sx={{ width: '45%' }}>
            <Typography fontWeight="bold">Відповіді</Typography>
          </Box>
        </Box>
        
        {/* Matching pairs */}
        {categories.map((category) => {
          const matchedOption = getMatchedOption(category.id);
          
          return (
            <Box
              key={`pair-${category.id}`}
              sx={{ 
                mb: 1,
                p: 1, 
                borderRadius: '6px',
                border: `1px solid ${alpha(theme.palette.grey[300], 0.8)}`,
                '&:hover': {
                  borderColor: theme.palette.grey[400],
                  backgroundColor: alpha(theme.palette.grey[50], 0.5),
                }
              }}
            >
              <Box sx={{ display: 'flex' }}>
                <Box sx={{ width: '45%', mr: 2 }}>
                  <EditableText
                    value={category.text}
                    onChange={(text) => handleUpdateCategoryText(category.id, text)}
                    placeholder={`Варіант ${category.display_order + 1}`}
                    multiline
                    isNew={category.text === ''}
                  />
                </Box>
                <Box sx={{ width: '45%', mr: 2 }}>
                  <EditableText
                    value={matchedOption?.text || ''}
                    onChange={(text) => matchedOption && handleUpdateOptionText(matchedOption.id, text)}
                    placeholder={`Відповідь ${category.display_order + 1}`}
                    multiline
                    isNew={(!matchedOption || matchedOption.text === '')}
                  />
                </Box>
                <IconButton 
                  onClick={() => handleRemoveMatchingPair(category.id)}
                  size="small"
                  color="error"
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Box>
            </Box>
          );
        })}
        
        {/* Add matching pair button */}
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleAddMatchingPair}
          sx={{ mt: 1, mb: 2 }}
        >
          Додати пару відповідності
        </Button>
        
        {/* Unmatched options section */}
        {getUnmatchedOptions().length >= 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Додаткові відповіді (без пари):
            </Typography>
            
            {getUnmatchedOptions().map((option) => (
              <Box
                key={`unmatched-${option.id}`}
                sx={{ 
                  mb: 1,
                  p: 1, 
                  borderRadius: '6px',
                  border: `1px solid ${alpha(theme.palette.grey[300], 0.8)}`,
                }}
              >
                <Box sx={{ display: 'flex' }}>
                  <Box sx={{ flex: 1, mr: 2 }}>
                    <EditableText
                      value={option.text}
                      onChange={(text) => handleUpdateOptionText(option.id, text)}
                      placeholder="Додаткова відповідь"
                      multiline
                      isNew={option.text === ''}
                    />
                  </Box>
                  <IconButton 
                    onClick={() => handleRemoveUnmatchedOption(option.id)}
                    size="small"
                    color="error"
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        )}
        
        {/* Add unmatched option button */}
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleAddUnmatchedOption}
          sx={{ mt: 1 }}
        >
          Додати додаткову відповідь
        </Button>
      </Box>
    </Box>
  );
};

export default EditMatchingQuestion;
