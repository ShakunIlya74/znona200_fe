import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography,
  Paper,
  Button,
  IconButton,
  useTheme,
  Grid
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import { MatchingCategory, MatchingOption } from './interfaces';

interface EditMatchingQuestionProps {
  questionId?: number;
  initialQuestionText?: string;
  initialCategories?: MatchingCategory[];
  initialOptions?: MatchingOption[];
  onSave?: (questionData: { 
    question_id?: number;
    question_text: string;
    category_list: Array<{
      id: number;
      text: string;
      display_order: number;
    }>;
    options_list: Array<{
      id: number;
      text: string;
      matching_category_id: number;
    }>;
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
      <textarea
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: '6px',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.5)}`,
          fontSize: '0.875rem',
          fontFamily: 'inherit',
          lineHeight: '1.5',
          resize: 'none',
          minHeight: '32px',
          height: '100%',
          boxSizing: 'border-box',
          outline: 'none',
          background: 'white'
        }}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus
      />
    );
  }
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        width: '100%',
        height: '100%',
        minHeight: '32px',
        cursor: 'pointer',
        border: `1px dashed ${alpha(theme.palette.grey[400], 0.5)}`,
        borderRadius: '6px',
        padding: '8px 12px',
        boxSizing: 'border-box',
        '&:hover': {
          backgroundColor: alpha(theme.palette.grey[100], 0.5),
          borderColor: alpha(theme.palette.grey[400], 0.8),
        }
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
          mt: -0.5,
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

const EditMatchingQuestion: React.FC<EditMatchingQuestionProps> = ({
  questionId,
  initialQuestionText = '',
  initialCategories = [],
  initialOptions = [],
  onSave
}) => {
  const theme = useTheme();
  const [questionText, setQuestionText] = useState(initialQuestionText);
  const [matchingRows, setMatchingRows] = useState<Array<{
    category: MatchingCategory;
    option: MatchingOption | null;
  }>>([]);
  const [unmatchedOptions, setUnmatchedOptions] = useState<MatchingOption[]>([]);
  const [nextCategoryId, setNextCategoryId] = useState<number>(1000);
  const [nextOptionId, setNextOptionId] = useState<number>(1000);

  // Initialize data from props
  useEffect(() => {
    // Find max IDs
    if (initialCategories.length > 0) {
      const maxCategoryId = Math.max(...initialCategories.map(cat => cat.id));
      setNextCategoryId(maxCategoryId + 1);
    }
    
    if (initialOptions.length > 0) {
      const maxOptionId = Math.max(...initialOptions.map(opt => opt.id));
      setNextOptionId(maxOptionId + 1);
    }

    // Organize data into rows
    const rows: Array<{
      category: MatchingCategory;
      option: MatchingOption | null;
    }> = [];
    
    // First, create rows for categories with matched options
    initialCategories.forEach(category => {
      const matchedOption = initialOptions.find(opt => opt.matching_category_id === category.id) || null;
      rows.push({ category, option: matchedOption });
    });
    
    // Sort rows by category display_order
    rows.sort((a, b) => a.category.display_order - b.category.display_order);
    
    // Find unmatched options
    const matched = new Set(rows.filter(row => row.option).map(row => row.option!.id));
    const unmatched = initialOptions.filter(opt => 
      !matched.has(opt.id) && (opt.matching_category_id === 0 || !initialCategories.some(cat => cat.id === opt.matching_category_id))
    );
    
    setMatchingRows(rows);
    setUnmatchedOptions(unmatched);
  }, [initialCategories, initialOptions]);

  // Auto-save when data changes
  useEffect(() => {
    handleAutoSave();
  }, [questionText, matchingRows, unmatchedOptions]);

  // Add a new matching row (category + option)
  const handleAddMatchingRow = () => {
    const newCategory: MatchingCategory = {
      id: nextCategoryId,
      text: '',
      display_order: matchingRows.length
    };
    
    const newOption: MatchingOption = {
      id: nextOptionId,
      text: '',
      matching_category_id: newCategory.id
    };
    
    setMatchingRows([...matchingRows, { category: newCategory, option: newOption }]);
    setNextCategoryId(nextCategoryId + 1);
    setNextOptionId(nextOptionId + 1);
  };
  
  // Add a new unmatched option
  const handleAddUnmatchedOption = () => {
    const newOption: MatchingOption = {
      id: nextOptionId,
      text: '',
      matching_category_id: 0
    };
    
    setUnmatchedOptions([...unmatchedOptions, newOption]);
    setNextOptionId(nextOptionId + 1);
  };

  // Remove a matching row
  const handleRemoveMatchingRow = (index: number) => {
    const newRows = [...matchingRows];
    newRows.splice(index, 1);
    
    // Update display_order for remaining categories
    newRows.forEach((row, i) => {
      row.category.display_order = i;
    });
    
    setMatchingRows(newRows);
  };
  
  // Remove an unmatched option
  const handleRemoveUnmatchedOption = (index: number) => {
    const newOptions = [...unmatchedOptions];
    newOptions.splice(index, 1);
    setUnmatchedOptions(newOptions);
  };

  // Update category text
  const handleCategoryTextChange = (rowIndex: number, text: string) => {
    const newRows = [...matchingRows];
    newRows[rowIndex].category.text = text;
    setMatchingRows(newRows);
  };

  // Update option text (matched)
  const handleMatchedOptionTextChange = (rowIndex: number, text: string) => {
    const newRows = [...matchingRows];
    if (newRows[rowIndex].option) {
      newRows[rowIndex].option!.text = text;
    }
    setMatchingRows(newRows);
  };
  
  // Update unmatched option text
  const handleUnmatchedOptionTextChange = (optionIndex: number, text: string) => {
    const newOptions = [...unmatchedOptions];
    newOptions[optionIndex].text = text;
    setUnmatchedOptions(newOptions);
  };

  // Auto-save the question
  const handleAutoSave = () => {
    // Only save if there's actual content
    if (!questionText.trim() && matchingRows.length === 0 && unmatchedOptions.length === 0) {
      return;
    }
    
    // Extract all categories and options
    const allCategories = matchingRows.map(row => row.category);
    
    const allOptions = [
      ...matchingRows.filter(row => row.option !== null).map(row => row.option!),
      ...unmatchedOptions
    ];
    
    const questionData = {
      question_id: questionId,
      question_text: questionText,
      category_list: allCategories.map(category => ({
        id: category.id,
        text: category.text,
        display_order: category.display_order
      })),
      options_list: allOptions.map(option => ({
        id: option.id,
        text: option.text,
        matching_category_id: option.matching_category_id
      }))
    };
    
    // Remove question_id if it's undefined (new question)
    if (questionId === undefined) {
      delete questionData.question_id;
    }
    
    if (onSave) {
      onSave(questionData);
    }
  };

  return (
    <Box>
      {/* Question Text */}
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
      
      {/* Matching grid */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ 
          mb: 0.5,
          fontWeight: 600, 
          color: theme.palette.text.primary 
        }}>
          Відповідності:
        </Typography>
        
        {/* Header */}
        <Grid container spacing={2} sx={{ mb: 1 }}>
          <Grid item xs={5}>
            <Typography sx={{ fontWeight: 600, pl: 1 }}>
              Варіанти
            </Typography>
          </Grid>
          <Grid item xs={5}>
            <Typography sx={{ fontWeight: 600, pl: 1 }}>
              Відповіді
            </Typography>
          </Grid>
          <Grid item xs={2}></Grid>
        </Grid>
        
        {/* Matching rows */}
        {matchingRows.map((row, index) => (
          <Paper
            key={`row-${row.category.id}`}
            elevation={0}
            sx={{ 
              mb: 1,
              p: 1, 
              borderRadius: '6px',
              border: `1px solid ${alpha(theme.palette.grey[300], 0.8)}`,
              transition: 'all 0.1s ease',
              '&:hover': {
                borderColor: alpha(theme.palette.grey[400], 1),
                backgroundColor: alpha(theme.palette.grey[50], 0.5),
              }
            }}
          >
            <Grid container spacing={2} alignItems="stretch" sx={{ minHeight: '50px' }}>
              <Grid item xs={5} sx={{ display: 'flex' }}>
                <EditableContent
                  value={row.category.text}
                  onChange={(text) => handleCategoryTextChange(index, text)}
                  placeholder={`Варіант ${index + 1}`}
                  multiline
                  isNew={row.category.text === ''}
                />
              </Grid>
              <Grid item xs={5} sx={{ display: 'flex' }}>
                <EditableContent
                  value={row.option?.text || ''}
                  onChange={(text) => handleMatchedOptionTextChange(index, text)}
                  placeholder={`Відповідь ${index + 1}`}
                  multiline
                  isNew={!row.option || row.option.text === ''}
                />
              </Grid>
              <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <IconButton 
                  onClick={() => handleRemoveMatchingRow(index)}
                  size="small"
                  sx={{ 
                    color: theme.palette.error.main,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                    }
                  }}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Paper>
        ))}
        
        {/* Add matching row button */}
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleAddMatchingRow}
          sx={{
            mt: 1,
            mb: 2,
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
          Додати пару відповідності
        </Button>
        
        {/* Unmatched options section */}
        {unmatchedOptions.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{ 
              mb: 0.5,
              fontWeight: 600, 
              color: theme.palette.text.primary 
            }}>
              Додаткові відповіді (без пари):
            </Typography>
            
            {unmatchedOptions.map((option, index) => (
              <Paper
                key={`unmatched-${option.id}`}
                elevation={0}
                sx={{ 
                  mb: 1,
                  p: 1, 
                  borderRadius: '6px',
                  border: `1px solid ${alpha(theme.palette.grey[300], 0.8)}`,
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={10}>
                    <EditableContent
                      value={option.text}
                      onChange={(text) => handleUnmatchedOptionTextChange(index, text)}
                      placeholder={`Додаткова відповідь ${index + 1}`}
                      multiline
                      isNew={option.text === ''}
                    />
                  </Grid>
                  <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton 
                      onClick={() => handleRemoveUnmatchedOption(index)}
                      size="small"
                      sx={{ 
                        color: theme.palette.error.main,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.error.main, 0.1),
                        }
                      }}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Box>
        )}
        
        {/* Add extra option button */}
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleAddUnmatchedOption}
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
          Додати додаткову відповідь
        </Button>
      </Box>
    </Box>
  );
};

export default EditMatchingQuestion;