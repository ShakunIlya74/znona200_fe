import React, { useEffect, useRef, useState } from 'react';
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

// Interface for the row height state
interface RowHeights {
  [rowIndex: number]: number;
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

  // State to track row heights for synchronized sizing
  const [rowHeights, setRowHeights] = useState<RowHeights>({});

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

          {sortedCategories.map((category, index) => (
            <VariantBox
              key={`variant-${category.id}`}
              category={category}
              theme={theme}
              rowHeight={rowHeights[index] || 0}
            />
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

          {sortedCategories.map((category, index) => {
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
              <AnswerBox
                key={`answer-${category.id}`}
                userMatchedOption={userMatchedOption}
                correctOption={correctOption}
                theme={theme}
                borderColor={borderColor}
                bgColor={bgColor}
                icon={icon}
                categoryId={category.id}
                isCorrect={userMatchedOption ? isMatchCorrect(userMatchedOption, category.id) : false}
                hideCorrectAnswers={hideCorrectAnswers}
                rowIndex={index}
                updateRowHeight={updateRowHeight}
                rowHeight={rowHeights[index] || 0}
              />
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

// Component for variant box with height sync
const VariantBox = ({
  category,
  theme,
  rowHeight
}: {
  category: MatchingCategory;
  theme: any;
  rowHeight: number;
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        py: 6,
        px: 1,
        mb: 0.5,
        borderRadius: '8px',
        border: `1px solid ${alpha(theme.palette.grey[300], 0.8)}`,
        minHeight: '32px',
        height: rowHeight > 0 ? `${rowHeight}px` : 'auto',
        display: 'flex',
        alignItems: 'center',
        transition: 'all 0.05s ease'
      }}
    >
      <Typography
        variant="body2"
        sx={{
          wordWrap: 'break-word',
          overflowWrap: 'break-word'
        }}
      >
        {category.text}
      </Typography>
    </Paper>
  );
};

// Component for answer box with height sync
const AnswerBox = ({
  userMatchedOption,
  correctOption,
  theme,
  borderColor,
  bgColor,
  icon,
  categoryId,
  isCorrect,
  hideCorrectAnswers,
  rowIndex,
  updateRowHeight,
  rowHeight
}: {
  userMatchedOption: MatchingOption | null;
  correctOption: MatchingOption | null;
  theme: any;
  borderColor: string;
  bgColor: string;
  icon: React.ReactNode;
  categoryId: number;
  isCorrect: boolean;
  hideCorrectAnswers: boolean;
  rowIndex: number;
  updateRowHeight: (index: number, height: number) => void;
  rowHeight: number;
}) => {
  const boxRef = useRef<HTMLDivElement>(null);

  // Update row height when content changes
  useEffect(() => {
    const updateHeight = () => {
      if (boxRef.current) {
        // Get the actual content height
        const height = boxRef.current.scrollHeight;
        updateRowHeight(rowIndex, height);
      }
    };

    // Update on initial render and when children change
    updateHeight();

    // Also set up a resize observer to detect content height changes
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
  }, [userMatchedOption, correctOption, updateRowHeight, rowIndex]);

  return (
    <Paper
      ref={boxRef}
      elevation={0}
      sx={{
        py: 6,
        px: 1,
        mb: 0.5,
        borderRadius: '8px',
        border: `1px solid ${borderColor}`,
        backgroundColor: bgColor,
        minHeight: '32px',
        height: rowHeight > 0 ? `${rowHeight}px` : 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all 0.05s ease'
      }}
    >
      <Box sx={{ width: icon ? 'calc(100% - 24px)' : '100%' }}>
        {userMatchedOption ? (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: isCorrect
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
          ((userMatchedOption && !isCorrect) || !userMatchedOption) &&
          correctOption && (
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.success.main,
                mt: 0.3,
                fontStyle: 'italic'
              }}
            >
              Правильна відповідь: {correctOption.text}
            </Typography>
          )}
      </Box>

      {icon && (
        <Box sx={{ ml: 1 }}>
          {icon}
        </Box>
      )}
    </Paper>
  );
};

export default AnsweredMatchingQuestion;