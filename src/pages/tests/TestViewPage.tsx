import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  useTheme,
  useMediaQuery,
  Divider,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom';
import { GetTestView } from '../../services/TestService';
import LoadingDots from '../../components/tools/LoadingDots';
import { alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { getHeaderOffset } from '../../components/Header';
import { FullTestWithAnswers, Question, TestCardMeta, MatchAnswer, UserTestResponse } from './interfaces';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import MatchingQuestion from './MatchingQuestion';

// Styled components
interface QuestionButtonProps {
  active?: boolean;
  answered?: boolean;
}

const QuestionButton = styled(Button)<QuestionButtonProps>(({ theme, active, answered }) => ({
  minWidth: '40px',
  height: '40px',
  margin: '8px',
  borderRadius: '8px',
  backgroundColor: active
    ? theme.palette.primary.main
    : answered
      ? alpha(theme.palette.primary.main, 0.2)
      : alpha(theme.palette.grey[300], 0.5),
  color: active
    ? theme.palette.common.white
    : answered
      ? theme.palette.primary.main
      : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: active
      ? alpha(theme.palette.primary.main, 0.8)
      : answered
        ? alpha(theme.palette.primary.main, 0.3)
        : alpha(theme.palette.grey[400], 0.5),
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  padding: '8px 16px',
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
  },
  '&.Mui-disabled': {
    backgroundColor: alpha(theme.palette.grey[200], 0.5),
    color: theme.palette.text.disabled,
  }
}));

// Interface for user responses to be stored in state
interface UserResponses {
  [questionId: number]: {
    questionId: number;
    selectedOptions?: number[]; // For multiple choice questions
    matches?: MatchAnswer[]; // For matching questions
  };
}

const TestViewPage: React.FC = () => {
  const { tfp_sha } = useParams<{ tfp_sha: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [testData, setTestData] = useState<TestCardMeta | null>(null);
  const [testWithAnswers, setTestWithAnswers] = useState<FullTestWithAnswers | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userResponses, setUserResponses] = useState<UserResponses>({});

  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isMedium = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const headerOffset = getHeaderOffset(isMobile, isMedium);

  useEffect(() => {
    const loadTestData = async () => {
      if (!tfp_sha) {
        setError('Test ID is missing');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await GetTestView(tfp_sha);
        console.log('Response:', response);

        if (response.success && response.full_test_with_answers) {
          setTestData(response.full_test_with_answers.test);
          setTestWithAnswers(response.full_test_with_answers);

          // Initialize user responses from existing data if available
          const initialResponses: UserResponses = {};

          response.full_test_with_answers.questions.forEach(question => {
            if (question.user_answer) {
              initialResponses[question.question_id] = {
                questionId: question.question_id,
                selectedOptions: question.user_answer.response?.selected_options,
                matches: question.user_answer.response?.matches
              };
            }
          });

          setUserResponses(initialResponses);
        } else {
          setError(response.error || 'Failed to load test data');
        }
      } catch (err) {
        console.error('Error loading test data:', err);
        setError('An error occurred while loading the test');
      } finally {
        setLoading(false);
      }
    };

    loadTestData();
  }, [tfp_sha]);

  // Handler for multiple choice option selection
  const handleOptionSelect = (questionId: number, optionId: number) => {
    setUserResponses(prev => {
      const existingResponse = prev[questionId];
      const selectedOptions = existingResponse?.selectedOptions || [];

      // Toggle option selection
      const updatedOptions = selectedOptions.includes(optionId)
        ? selectedOptions.filter(id => id !== optionId)
        : [...selectedOptions, optionId];

      return {
        ...prev,
        [questionId]: {
          questionId,
          selectedOptions: updatedOptions,
          matches: existingResponse?.matches
        }
      };
    });
  };

  // Handler for matching question responses
  const handleMatchSelect = (questionId: number, optionId: number, categoryId: number) => {
    setUserResponses(prev => {
      const existingResponse = prev[questionId];
      const existingMatches = existingResponse?.matches || [];

      // Remove any existing match for this option
      const filteredMatches = existingMatches.filter(
        match => match.option_id !== optionId
      );

      // Add the new match if categoryId is not empty
      const updatedMatches = categoryId
        ? [...filteredMatches, { option_id: optionId, matched_to_category_id: categoryId }]
        : filteredMatches;

      return {
        ...prev,
        [questionId]: {
          questionId,
          selectedOptions: existingResponse?.selectedOptions,
          matches: updatedMatches
        }
      };
    });
  };

  const handleBackClick = () => {
    navigate('/tests');
  };

  const handleQuestionSelect = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (testWithAnswers && currentQuestionIndex < testWithAnswers.questions.length - 1) {
      // Log current user responses
      console.log('Current user responses:', userResponses);

      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Helper function to check if a question has been answered
  const isQuestionAnswered = (questionId: number): boolean => {
    const response = userResponses[questionId];

    if (!response) return false;

    if (response.selectedOptions && response.selectedOptions.length > 0) {
      return true;
    }

    if (response.matches && response.matches.length > 0) {
      return true;
    }

    return false;
  };

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        height: `calc(100vh - ${headerOffset}px)`,
        display: 'flex',
        flexDirection: 'column',
        p: 0
      }}
    >
      {/* Top Bar */}
      <Box sx={{
        p: 2,
        borderBottom: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
        display: 'flex',
        alignItems: 'center'
      }}>
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackClick}
          sx={{ color: theme.palette.primary.main }}
        >
          Back to Tests
        </Button>

        {testData && (
          <Typography
            variant="h6"
            sx={{
              ml: 2,
              fontWeight: 600,
              color: theme.palette.primary.main,
              flex: 1,
              textAlign: { xs: 'left', sm: 'center' }
            }}
          >
            {testData.test_name}
            {testData.default_question && (
              <Typography 
                component="div" 
                variant="caption" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  fontSize: '0.75rem',
                  mt: 0.5
                }}
              >
                {testData.default_question}
              </Typography>
            )}
          </Typography>
        )}
      </Box>

      {loading ? (
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexGrow: 1
        }}>
          <LoadingDots />
        </Box>
      ) : error ? (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: '16px',
            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            backgroundColor: alpha(theme.palette.error.main, 0.05),
            margin: 2,
            height: `calc(100vh - ${headerOffset}px)`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <Typography color="error" variant="h6" gutterBottom>
            Error
          </Typography>
          <Typography color="error">
            {error}
          </Typography>
        </Paper>
      ) : testWithAnswers ? (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          height: `calc(100vh - ${headerOffset}px)`, // Accounting for the top bar height
        }}>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            // height: '100%',
            gap: 3
          }}>
            {/* Question Navigation Column */}
            <Box sx={{
              width: { xs: '100%', md: '33.33%', lg: '25%' },
              borderRight: { md: `1px solid ${alpha(theme.palette.grey[300], 0.5)}` },
              // height: { md: '100%' },
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Питання
              </Typography>

              {/* Question number grid */}
              <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'flex-start',
                overflowY: 'auto',
                mb: 2, // Add margin bottom to create some spacing
              }}>
                {testWithAnswers.questions.map((question, index) => (
                  <QuestionButton
                    key={question.question_id}
                    active={index === currentQuestionIndex}
                    answered={isQuestionAnswered(question.question_id)}
                    onClick={() => handleQuestionSelect(index)}
                  >
                    {index + 1}
                  </QuestionButton>
                ))}
              </Box>

              {/* Navigation buttons below the question grid */}
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                pt: 2,
                px: 1
              }}>
                <NavButton
                  startIcon={<ArrowBackIcon />}
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex <= 0}
                  sx={{
                    color: theme.palette.primary.main,
                    borderColor: theme.palette.primary.main,
                  }}
                >
                </NavButton>

                <Typography variant="body1" sx={{
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: 500
                }}>
                  {currentQuestionIndex + 1} / {testWithAnswers.questions.length}
                </Typography>

                <NavButton
                  endIcon={<ArrowForwardIcon />}
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex >= testWithAnswers.questions.length - 1}
                  sx={{
                    color: theme.palette.primary.main,
                    borderColor: theme.palette.primary.main,
                  }}
                >
                </NavButton>
              </Box>

            </Box>

            {/* Question Display */}
            <Box sx={{
              width: { xs: '100%', md: '66.67%', lg: '75%' },
              height: { md: '100%' },
              display: 'flex',
              flexDirection: 'column'
            }}>
              {testWithAnswers.questions.length > 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: '16px',
                    border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                    flex: 1,
                    overflow: 'auto'
                  }}
                >
                  {(() => {
                    const currentQuestion = testWithAnswers.questions[currentQuestionIndex];

                    if (currentQuestion.question_type === 'MULTIPLE_CHOICE') {
                      const options = currentQuestion.question_data.options;
                      return (
                        <MultipleChoiceQuestion
                          questionId={currentQuestion.question_id}
                          questionNumber={currentQuestionIndex + 1}
                          questionText={currentQuestion.question}
                          options={options as any[]}
                          selectedOptions={userResponses[currentQuestion.question_id]?.selectedOptions || []}
                          onOptionSelect={handleOptionSelect}
                        />
                      );
                    } else if (currentQuestion.question_type === 'MATCHING') {
                      const options = currentQuestion.question_data.options;
                      const categories = currentQuestion.question_data.categories || [];
                      return (
                        <MatchingQuestion
                          questionId={currentQuestion.question_id}
                          questionNumber={currentQuestionIndex + 1}
                          questionText={currentQuestion.question}
                          options={options as any[]}
                          categories={categories as any[]}
                          matches={userResponses[currentQuestion.question_id]?.matches || []}
                          onMatchSelect={handleMatchSelect}
                        />
                      );
                    } else {
                      // Fallback display for unknown question types
                      return (
                        <>
                          <Typography variant="h6" sx={{
                            mb: 2,
                            fontWeight: 600,
                            color: theme.palette.primary.main
                          }}>
                            Question {currentQuestionIndex + 1}
                          </Typography>

                          <Divider sx={{ mb: 3 }} />

                          <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                              Question Text:
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 1 }}>
                              {currentQuestion.question}
                            </Typography>
                          </Box>

                          <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                              Question Type:
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 1 }}>
                              {currentQuestion.question_type} (Not implemented)
                            </Typography>
                          </Box>

                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                              Question ID:
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 1 }}>
                              {currentQuestion.question_id}
                            </Typography>
                          </Box>
                        </>
                      );
                    }
                  })()}
                </Paper>
              ) : (
                <Typography variant="body1" sx={{ textAlign: 'center' }}>
                  No questions available for this test.
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      ) : (
        <Typography variant="h5" sx={{
          textAlign: 'center',
          color: theme.palette.text.secondary,
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          No test data available
        </Typography>
      )}
    </Container>
  );
};

export default TestViewPage;