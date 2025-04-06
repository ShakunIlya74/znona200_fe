import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography,
  TextField,
  Paper,
  Button,
  IconButton,
  useTheme,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { MatchingCategory, MatchingOption } from './interfaces';

// Interface for the row height state
interface RowHeights {
  [rowIndex: number]: number;
}

interface EditMatchingQuestionProps {
  questionId?: number; // Optional - if not provided, we're creating a new question
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

const EditMatchingQuestion: React.FC<EditMatchingQuestionProps> = ({
  questionId,
  initialQuestionText = '',
  initialCategories = [],
  initialOptions = [],
  onSave
}) => {
  const theme = useTheme();
  const [questionText, setQuestionText] = useState(initialQuestionText);
  const [categories, setCategories] = useState<MatchingCategory[]>(initialCategories);
  const [options, setOptions] = useState<MatchingOption[]>(initialOptions);
  const [nextCategoryId, setNextCategoryId] = useState<number>(1000);
  const [nextOptionId, setNextOptionId] = useState<number>(1000);
  
  // State to track row heights for synchronized sizing
  const [rowHeights, setRowHeights] = useState<RowHeights>({});

  // Initialize next IDs based on existing data
  useEffect(() => {
    if (initialCategories.length > 0) {
      const maxCategoryId = Math.max(...initialCategories.map(cat => cat.id));
      setNextCategoryId(maxCategoryId + 1);
    }
    
    if (initialOptions.length > 0) {
      const maxOptionId = Math.max(...initialOptions.map(opt => opt.id));
      setNextOptionId(maxOptionId + 1);
    }
  }, [initialCategories, initialOptions]);

  // Auto-save when question or options change
  useEffect(() => {
    handleAutoSave();
  }, [questionText, categories, options]);

  // Function to update row heights
  const updateRowHeight = (rowIndex: number, height: number) => {
    setRowHeights(prev => {
      // Only update the height if it's greater than the current one or not set
      if (!prev[rowIndex] || height > prev[rowIndex]) {
        return {
          ...prev,
          [rowIndex]: height
        };
      }
      return prev;
    });
  };

  // Add a new category
  const handleAddCategory = () => {
    const newCategory: MatchingCategory = {
      id: nextCategoryId,
      text: '',
      display_order: categories.length
    };
    
    setCategories([...categories, newCategory]);
    setNextCategoryId(nextCategoryId + 1);
  };

  // Remove a category
  const handleRemoveCategory = (categoryId: number) => {
    // Remove category
    setCategories(categories.filter(cat => cat.id !== categoryId));
    
    // Update options that were matching to this category (set to 0/unmatched)
    setOptions(options.map(opt => 
      opt.matching_category_id === categoryId 
        ? { ...opt, matching_category_id: 0 } 
        : opt
    ));
    
    // Adjust display_order for remaining categories
    setCategories(prevCategories => 
      prevCategories.map((cat, index) => ({
        ...cat,
        display_order: index
      }))
    );
  };

  // Update category text
  const handleCategoryTextChange = (categoryId: number, text: string) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId ? { ...cat, text } : cat
    ));
  };

  // Add a new option
  const handleAddOption = () => {
    const newOption: MatchingOption = {
      id: nextOptionId,
      text: '',
      matching_category_id: 0 // Default to unmatched
    };
    
    setOptions([...options, newOption]);
    setNextOptionId(nextOptionId + 1);
  };

  // Remove an option
  const handleRemoveOption = (optionId: number) => {
    setOptions(options.filter(opt => opt.id !== optionId));
  };

  // Update option text
  const handleOptionTextChange = (optionId: number, text: string) => {
    setOptions(options.map(opt => 
      opt.id === optionId ? { ...opt, text } : opt
    ));
  };

  // Update option matching category
  const handleOptionCategoryChange = (optionId: number, categoryId: number) => {
    setOptions(options.map(opt => 
      opt.id === optionId ? { ...opt, matching_category_id: categoryId } : opt
    ));
  };

  // Auto-save the question
  const handleAutoSave = () => {
    // Only save if there's actual content
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
    
    // Remove question_id if it's undefined (new question)
    if (questionId === undefined) {
      delete questionData.question_id;
    }
    
    if (onSave) {
      onSave(questionData);
    }
  };

  // Component for category box with height sync
  const CategoryBox = ({
    category,
    index,
    rowHeight
  }: {
    category: MatchingCategory;
    index: number;
    rowHeight: number;
  }) => {
    const boxRef = useRef<HTMLDivElement>(null);

    // Update row height when content changes
    useEffect(() => {
      const updateHeight = () => {
        if (boxRef.current) {
          const height = boxRef.current.scrollHeight;
          updateRowHeight(index, height);
        }
      };
      
      updateHeight();
      
      const resizeObserver = new ResizeObserver(() => {
        updateHeight();
      });
      
      if (boxRef.current) {
        resizeObserver.observe(boxRef.current);
      }
      
      return () => {
        if (boxRef.current) {
          resizeObserver.unobserve(boxRef.current);
        }
      };
    }, [index, category.text]);

    return (
      <Paper
        ref={boxRef}
        elevation={0}
        sx={{
          p: 1,
          mb: 1,
          borderRadius: '6px',
          border: `1px solid ${alpha(theme.palette.grey[300], 0.8)}`,
          minHeight: '40px',
          height: rowHeight > 0 ? `${rowHeight}px` : 'auto',
          display: 'flex',
          alignItems: 'center',
          transition: 'all 0.05s ease',
          overflow: 'auto'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            value={category.text}
            onChange={(e) => handleCategoryTextChange(category.id, e.target.value)}
            placeholder={`Варіант ${index + 1}`}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '6px',
              }
            }}
          />
          
          <IconButton 
            onClick={() => handleRemoveCategory(category.id)}
            size="small"
            sx={{ 
              ml: 0.5,
              p: 0.5,
              color: theme.palette.error.main,
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.1),
              }
            }}
          >
            <DeleteOutlineIcon />
          </IconButton>
        </Box>
      </Paper>
    );
  };

  // Component for option box with category selection and height sync
  const OptionBox = ({
    option,
    index,
    rowHeight
  }: {
    option: MatchingOption;
    index: number;
    rowHeight: number;
  }) => {
    const boxRef = useRef<HTMLDivElement>(null);

    // Update row height when content changes
    useEffect(() => {
      const updateHeight = () => {
        if (boxRef.current) {
          const height = boxRef.current.scrollHeight;
          updateRowHeight(index, height);
        }
      };
      
      updateHeight();
      
      const resizeObserver = new ResizeObserver(() => {
        updateHeight();
      });
      
      if (boxRef.current) {
        resizeObserver.observe(boxRef.current);
      }
      
      return () => {
        if (boxRef.current) {
          resizeObserver.unobserve(boxRef.current);
        }
      };
    }, [index, option.text, option.matching_category_id]);

    const handleChange = (event: SelectChangeEvent<number>) => {
      handleOptionCategoryChange(option.id, Number(event.target.value));
    };

    return (
      <Paper
        ref={boxRef}
        elevation={0}
        sx={{
          p: 1,
          mb: 1,
          borderRadius: '6px',
          border: `1px solid ${option.matching_category_id > 0
            ? alpha(theme.palette.primary.main, 0.5)
            : alpha(theme.palette.grey[300], 0.8)
          }`,
          backgroundColor: option.matching_category_id > 0
            ? alpha(theme.palette.primary.main, 0.05)
            : 'transparent',
          minHeight: '40px',
          height: rowHeight > 0 ? `${rowHeight}px` : 'auto',
          display: 'flex',
          alignItems: 'center',
          transition: 'all 0.05s ease',
          overflow: 'auto'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          width: '100%',
          gap: 1
        }}>
          <TextField
            variant="outlined"
            size="small"
            value={option.text}
            onChange={(e) => handleOptionTextChange(option.id, e.target.value)}
            placeholder={`Варіант відповіді ${index + 1}`}
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: '6px',
              }
            }}
          />
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center'
          }}>
            <FormControl size="small" sx={{ width: { xs: '100%', sm: '130px' } }}>
              <InputLabel id={`category-select-label-${option.id}`}>Відповідність</InputLabel>
              <Select
                labelId={`category-select-label-${option.id}`}
                value={option.matching_category_id}
                onChange={handleChange}
                label="Відповідність"
                sx={{
                  borderRadius: '6px',
                  fontSize: '0.875rem'
                }}
              >
                <MenuItem value={0}>
                  <em>Не обрано</em>
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.text.length > 20 
                      ? `${category.text.substring(0, 20)}...` 
                      : category.text || `Варіант ${category.display_order + 1}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <IconButton 
              onClick={() => handleRemoveOption(option.id)}
              size="small"
              sx={{ 
                ml: 0.5,
                p: 0.5,
                color: theme.palette.error.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                }
              }}
            >
              <DeleteOutlineIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>
    );
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
      
      {/* Main matching area - two columns */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        gap: 2
      }}>
        {/* Left column - Categories */}
        <Box sx={{ 
          flex: { md: '0 0 45%' }
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 0.5
          }}>
            <Typography variant="subtitle1" sx={{ 
              fontWeight: 600,
              color: theme.palette.text.primary
            }}>
              Варіанти:
            </Typography>
            
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddCircleOutlineIcon />}
              onClick={handleAddCategory}
              sx={{
                borderRadius: '6px',
                py: 0.5,
                px: 1,
                borderColor: alpha(theme.palette.primary.main, 0.5),
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  borderColor: theme.palette.primary.main,
                }
              }}
            >
              Додати
            </Button>
          </Box>
          
          {/* Category list */}
          <Box>
            {categories.map((category, index) => (
              <CategoryBox
                key={category.id}
                category={category}
                index={index}
                rowHeight={rowHeights[index] || 0}
              />
            ))}
          </Box>
        </Box>
        
        {/* Right column - Options and matching */}
        <Box sx={{ 
          width: '100%',
          flex: { md: '0 0 55%' } 
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 0.5
          }}>
            <Typography variant="subtitle1" sx={{ 
              fontWeight: 600,
              color: theme.palette.text.primary
            }}>
              Відповіді:
            </Typography>
            
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddCircleOutlineIcon />}
              onClick={handleAddOption}
              sx={{
                borderRadius: '6px',
                py: 0.5,
                px: 1,
                borderColor: alpha(theme.palette.primary.main, 0.5),
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  borderColor: theme.palette.primary.main,
                }
              }}
            >
              Додати
            </Button>
          </Box>
          
          {/* Options list */}
          <Box>
            {options.map((option, index) => (
              <OptionBox
                key={option.id}
                option={option}
                index={index}
                rowHeight={rowHeights[index] || 0}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default EditMatchingQuestion;