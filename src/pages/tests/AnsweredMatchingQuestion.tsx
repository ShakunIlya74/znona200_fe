import React from 'react';
import { 
  Box, 
  Typography,
  Paper,
  useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { MatchingCategory, MatchingOption, MatchAnswer } from './interfaces';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

interface AnsweredMatchingQuestionProps {
  questionId: number;
  questionNumber: number;
  questionText: string;
  options: MatchingOption[];
  categories: MatchingCategory[];
  userMatches: MatchAnswer[];
  hideCorrectAnswers?: boolean; // New prop to control showing correct answers
}

const AnsweredMatchingQuestion: React.FC<AnsweredMatchingQuestionProps> = ({
  questionId,
  questionNumber,
  questionText,
  options,
  categories,
  userMatches,
  hideCorrectAnswers = false // Default to false to maintain backward compatibility
}) => {
  const theme = useTheme();
  
  // Sort categories by display_order if available
  const sortedCategories = [...categories].sort((a, b) => 
    (a.display_order || 0) - (b.display_order || 0)
  );

  // Find the option that user matched to a specific category
  const findUserMatchForCategory = (categoryId: number): MatchingOption | null => {
    const match = userMatches.find(m => m.matched_to_category_id === categoryId);
    if (!match) return null;
    
    const option = options.find(o => o.id === match.option_id);
    return option || null;
  };

  // Check if a match is correct
  const isMatchCorrect = (option: MatchingOption, categoryId: number): boolean => {
    return option.matching_category_id === categoryId;
  };

  // Find the correct option for a category
  const findCorrectOptionForCategory = (categoryId: number): MatchingOption | null => {
    return options.find(o => o.matching_category_id === categoryId) || null;
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ 
        mb: 1, // Reduced from mb: 2
        fontWeight: 600, 
        color: theme.palette.primary.main 
      }}>
        {questionNumber}. {questionText}
      </Typography>
      
      {/* Main matching area - two columns */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        gap: 1, // Reduced from gap: 2
        mb: 1.5 // Reduced from mb: , 2
      }}>
        {/* Left column - Categories */}
        <Box sx={{ 
          flex: { md: '0 0 45%' },
          mr: { md: 1 } // Reduced from mr: { md: 2 }
        }}>
          <Typography variant="subtitle1" sx={{ 
            mb: 0.5, // Reduced from mb: 1
            fontWeight: 600,
            borderBottom: `1px solid ${alpha(theme.palette.grey[300], 0.8)}`,
            pb: 0.5
          }}>
            Варіанти:
          </Typography>
          
          {sortedCategories.map((category) => (
            <Paper
              key={`variant-${category.id}`}
              elevation={0}
              sx={{
                p: 1, // Reduced from p: 1.5
                mb: 0.5, // Reduced from mb: 1
                borderRadius: '8px',
                border: `1px solid ${alpha(theme.palette.grey[300], 0.8)}`,
                minHeight: '32px', // Reduced from minHeight: '40px'
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Typography variant="body2">{category.text}</Typography>
            </Paper>
          ))}
        </Box>
        
        {/* Right column - User matches with feedback */}
        <Box sx={{ 
          width: '100%', 
          mr: 2, // Reduced from mr: 3
          flex: { md: '0 0 55%' } 
        }}>
          <Typography variant="subtitle1" sx={{ 
            mb: 0.5, // Reduced from mb: 1
            fontWeight: 600,
            borderBottom: `1px solid ${alpha(theme.palette.grey[300], 0.8)}`,
            pb: 0.5
          }}>
            Ваші відповідності:
          </Typography>
          
          {sortedCategories.map((category) => {
            const userMatchedOption = findUserMatchForCategory(category.id);
            const correctOption = findCorrectOptionForCategory(category.id);
            
            // Determine styling based on correctness
            let borderColor = theme.palette.grey[300];
            let bgColor = 'transparent';
            let icon = null;
            
            if (userMatchedOption) {
              const isCorrect = isMatchCorrect(userMatchedOption, category.id);
              
              if (isCorrect) {
                borderColor = theme.palette.success.main;
                bgColor = alpha(theme.palette.success.main, 0.1);
                icon = <CheckCircleOutlineIcon sx={{ color: theme.palette.success.main, fontSize: '1.1rem' }} />;
              } else {
                borderColor = theme.palette.error.main;
                bgColor = alpha(theme.palette.error.main, 0.1);
                icon = <CancelOutlinedIcon sx={{ color: theme.palette.error.main, fontSize: '1.1rem' }} />;
              }
            }
            
            return (
              <Paper
                key={`answer-${category.id}`}
                elevation={0}
                sx={{
                  p: 1, // Reduced from p: 1.5
                  mb: 0.5, // Reduced from mb: 1
                  borderRadius: '8px',
                  border: `1px solid ${borderColor}`,
                  backgroundColor: bgColor,
                  minHeight: '32px', // Reduced from minHeight: '40px'
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box>
                  {userMatchedOption ? (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 500,
                        color: isMatchCorrect(userMatchedOption, category.id) 
                          ? theme.palette.success.main 
                          : theme.palette.error.main
                      }}
                    >
                      {userMatchedOption.text}
                    </Typography>
                  ) : (
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontStyle: 'italic' }}>
                      Немає відповіді
                    </Typography>
                  )}
                  
                  {/* Show correct answer if user got it wrong or didn't answer, but only if not hiding correct answers */}
                  {!hideCorrectAnswers && 
                   ((userMatchedOption && !isMatchCorrect(userMatchedOption, category.id)) || !userMatchedOption) && 
                   correctOption && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: theme.palette.success.main,
                        mt: 0.3, // Reduced from mt: 0.5
                        fontStyle: 'italic'
                      }}
                    >
                      Правильна відповідь: {correctOption.text}
                    </Typography>
                  )}
                </Box>
                
                {icon && (
                  <Box sx={{ ml: 1 }}> {/* Reduced from ml: 2 */}
                    {icon}
                  </Box>
                )}
              </Paper>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default AnsweredMatchingQuestion;