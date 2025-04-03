import React from 'react';
import { 
  Box, 
  Typography, 
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  useTheme 
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { MatchingCategory, MatchingOption, MatchAnswer } from './interfaces';

interface MatchingQuestionProps {
  questionId: number;
  questionNumber: number;
  questionText: string;
  options: MatchingOption[];
  categories: MatchingCategory[];
  matches: MatchAnswer[];
  onMatchSelect: (questionId: number, optionId: number, categoryId: number) => void;
}

const MatchingQuestion: React.FC<MatchingQuestionProps> = ({
  questionId,
  questionNumber,
  questionText,
  options,
  categories,
  matches,
  onMatchSelect
}) => {
  const theme = useTheme();

  // Helper function to get the matched category for an option
  const getMatchedCategoryId = (optionId: number): number | null => {
    const match = matches.find(m => m.option_id === optionId);
    return match ? match.matched_to_category_id : null;
  };

  // Sort categories by display_order if available
  const sortedCategories = [...categories].sort((a, b) => 
    (a.display_order || 0) - (b.display_order || 0)
  );

  return (
    <Box>
      <Typography variant="h6" sx={{ 
        mb: 3, 
        fontWeight: 600, 
        color: theme.palette.primary.main 
      }}>
        {questionNumber}. {questionText}
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        <Box sx={{ flex: { md: '0 0 41.67%' } }}>
          <Typography variant="subtitle1" sx={{ 
            mb: 2, 
            fontWeight: 600,
            borderBottom: `1px solid ${alpha(theme.palette.grey[300], 0.8)}`,
            pb: 1
          }}>
            Варіанти:
          </Typography>
          
          {options.map((option) => (
            <Paper
              key={option.id}
              elevation={0}
              sx={{
                p: 2,
                mb: 2,
                borderRadius: '8px',
                border: `1px solid ${alpha(theme.palette.grey[300], 0.8)}`,
                backgroundColor: getMatchedCategoryId(option.id) 
                  ? alpha(theme.palette.primary.main, 0.05) 
                  : 'transparent'
              }}
            >
              <Typography variant="body1">{option.text}</Typography>
            </Paper>
          ))}
        </Box>
        
        <Box sx={{ flex: { md: '0 0 58.33%' } }}>
          <Typography variant="subtitle1" sx={{ 
            mb: 2, 
            fontWeight: 600,
            borderBottom: `1px solid ${alpha(theme.palette.grey[300], 0.8)}`,
            pb: 1
          }}>
            Відповідності:
          </Typography>
          
          {options.map((option) => (
            <Box 
              key={option.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 2,
                p: 2,
                borderRadius: '8px',
                border: `1px solid ${getMatchedCategoryId(option.id) 
                  ? theme.palette.primary.main 
                  : alpha(theme.palette.grey[300], 0.8)}`,
                backgroundColor: getMatchedCategoryId(option.id) 
                  ? alpha(theme.palette.primary.main, 0.05) 
                  : 'transparent'
              }}
            >
              <Typography variant="body2" sx={{ 
                fontWeight: 500,
                minWidth: '120px',
                mr: 2
              }}>
                {option.text.length > 30 ? `${option.text.substring(0, 30)}...` : option.text}
              </Typography>
              
              <FormControl fullWidth>
                <InputLabel id={`match-select-${option.id}-label`}>Категорія</InputLabel>
                <Select
                  labelId={`match-select-${option.id}-label`}
                  id={`match-select-${option.id}`}
                  value={getMatchedCategoryId(option.id) || ''}
                  label="Категорія"
                  onChange={(e) => onMatchSelect(questionId, option.id, Number(e.target.value))}
                  sx={{ 
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: '8px' 
                  }}
                >
                  <MenuItem value="">
                    <em>Не вибрано</em>
                  </MenuItem>
                  {sortedCategories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.text}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default MatchingQuestion;