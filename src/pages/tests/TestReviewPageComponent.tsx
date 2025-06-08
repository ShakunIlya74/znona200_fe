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
  CircularProgress,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom';
import { GetTestView } from '../../services/TestService';
import LoadingDots from '../../components/tools/LoadingDots';
import { alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ReplayIcon from '@mui/icons-material/Replay';
import { getHeaderOffset } from '../../components/Header';
import { FullTestWithAnswers, Question, TestCardMeta } from './interfaces';
import AnsweredMultipleChoiceQuestion from './components/AnsweredMultipleChoiceQuestion';
import AnsweredMatchingQuestion from './components/AnsweredMatchingQuestion';

// Styled components
interface QuestionButtonProps {
  correct?: boolean;
  incorrect?: boolean;
}

const QuestionButton = styled(Button)<QuestionButtonProps>(({ theme, correct, incorrect }) => ({
  minWidth: '36px', // Slightly reduced for better fit
  height: '36px', // Slightly reduced for better fit
  margin: '4px', // Reduced margin for more compact layout
  borderRadius: '8px',
  backgroundColor: correct
    ? alpha(theme.palette.success.main, 0.2)
    : incorrect
      ? alpha(theme.palette.error.main, 0.2)
      : alpha(theme.palette.grey[300], 0.5),
  color: correct
    ? theme.palette.success.main
    : incorrect
      ? theme.palette.error.main
      : theme.palette.text.primary,
  border: correct
    ? `1px solid ${theme.palette.success.main}`
    : incorrect
      ? `1px solid ${theme.palette.error.main}`
      : 'none',
  '&:hover': {
    backgroundColor: correct
      ? alpha(theme.palette.success.main, 0.3)
      : incorrect
        ? alpha(theme.palette.error.main, 0.3)
        : alpha(theme.palette.grey[400], 0.5),
  },
}));

const TestReviewPage: React.FC = () => {
  const { tfp_sha } = useParams<{ tfp_sha: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [testData, setTestData] = useState<TestCardMeta | null>(null);
  const [testWithAnswers, setTestWithAnswers] = useState<FullTestWithAnswers | null>(null);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [maxPossibleScore, setMaxPossibleScore] = useState<number>(0);
  // State to control hiding correct answers
  const [hideCorrectAnswers, setHideCorrectAnswers] = useState<boolean>(true);

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
          
          // Calculate total score and max possible score
          let score = 0;
          let maxScore = 0;
          
          response.full_test_with_answers.questions.forEach(question => {
            const questionMaxPoints = question.max_points || 1;
            maxScore += questionMaxPoints;
            
            // Explicitly handle missing answers by assigning 0 points
            if (question.user_answer && question.user_answer.correct_percentage !== undefined) {
              // Calculate points based on correct percentage
              score += (question.user_answer.correct_percentage / 100) * questionMaxPoints;
            } else {
              // Missing answer - explicitly add 0 points (for clarity)
              score += 0;
            }
          });
          
          setTotalScore(score);
          setMaxPossibleScore(maxScore);
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

  // Handler to navigate back to tests
  const handleBackClick = () => {
    navigate('/tests');
  };

  // Handler to take the test again
  const handleTakeAgainClick = () => {
    if (tfp_sha) {
      navigate(`/test-view/${tfp_sha}`);
    }
  };

  // Helper function to scroll to a specific question
  const scrollToQuestion = (questionId: string) => {
    const element = document.getElementById(questionId);
    if (element) {
      const yOffset = -1 * (headerOffset + 16); // Add some extra padding
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        minHeight: `calc(100vh - ${headerOffset}px)`,
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
          Назад до тестів
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
            Перегляд результатів: {testData.test_name}
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
          flexGrow: 1,
          p: 5
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
            minHeight: '300px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <Typography color="error" variant="h6" gutterBottom>
            Помилка
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
          gap: 3
        }}>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3
          }}>
            {/* Question Navigation Column - Adjusted width to be wider */}
            <Box sx={{
              width: { xs: '100%', md: '40%', lg: '35%' }, // Increased from 33.33% to 40% for md and 25% to 35% for lg
              borderRight: { md: `1px solid ${alpha(theme.palette.grey[300], 0.5)}` },
              paddingRight: { md: 2 }, // Slightly reduced padding from 3 to 2
              display: 'flex',
              flexDirection: 'column',
              height: { md: 'fit-content' }, // Set a height for desktop
              position: { md: 'sticky' }, // Make it sticky on desktop
              top: { md: `${headerOffset + 16}px` }, // Stick below header
              alignSelf: { md: 'flex-start' } // Align to top of container
            }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Огляд відповідей
              </Typography>

              {/* Score summary */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  mb: 2 // Reduced from 3
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Ваш результат:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                    {totalScore.toFixed(1)}
                  </Typography>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                    з {maxPossibleScore.toFixed(1)} можливих
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mt: 1, color: theme.palette.text.secondary }}>
                  {((totalScore / maxPossibleScore) * 100).toFixed(1)}% правильних відповідей
                </Typography>
              </Paper>

              {/* Question number grid with improved layout */}
              <Box sx={{
                mb: 2,
              }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                  Питання:
                </Typography>
                <Box sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'flex-start',
                  maxWidth: '100%', // Ensure it doesn't overflow
                  ml: -0.5, // Compensate for button margins
                  mr: -0.5, // Compensate for button margins
                }}>
                  {testWithAnswers.questions.map((question, index) => {
                    const correctPercentage = question.user_answer?.correct_percentage || 0;
                    const isFullyCorrect = correctPercentage === 100;
                    const isIncorrect = correctPercentage < 100;
                    
                    return (
                      <QuestionButton
                        key={question.question_id}
                        correct={isFullyCorrect}
                        incorrect={isIncorrect}
                        onClick={() => scrollToQuestion(`question-${question.question_id}`)}
                      >
                        {index + 1}
                      </QuestionButton>
                    );
                  })}
                </Box>
              </Box>

              {/* Option to toggle showing correct answers */}
{/*               <Button
                variant="outlined"
                color={hideCorrectAnswers ? "primary" : "success"}
                onClick={() => setHideCorrectAnswers(!hideCorrectAnswers)}
                sx={{ 
                  mb: 2,
                  borderRadius: '8px',
                  textTransform: 'none'
                }}
              >
                {hideCorrectAnswers 
                  ? "Показати правильні відповіді" 
                  : "Сховати правильні відповіді"}
              </Button> *}

              {/* Take test again button */}
              <Button
                variant="contained"
                color="primary"
                startIcon={<ReplayIcon />}
                onClick={handleTakeAgainClick}
                sx={{ 
                  mb: 2,
                  borderRadius: '8px',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.8)
                  }
                }}
              >
                Пройти знов
              </Button>

              {/* Legend */}
              <Box sx={{ mt: 1 }}> {/* Reduced from mt: 2 */}
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Позначення:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ 
                    width: 20, 
                    height: 20, 
                    borderRadius: 1, 
                    backgroundColor: alpha(theme.palette.success.main, 0.2),
                    border: `1px solid ${theme.palette.success.main}`,
                    mr: 1 
                  }} />
                  <Typography variant="body2">
                    Правильна відповідь
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ 
                    width: 20, 
                    height: 20, 
                    borderRadius: 1, 
                    backgroundColor: alpha(theme.palette.error.main, 0.2),
                    border: `1px solid ${theme.palette.error.main}`,
                    mr: 1 
                  }} />
                  <Typography variant="body2">
                    Неправильна відповідь
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Question List - Adjusted width to match navigation column change */}
            <Box sx={{
              width: { xs: '100%', md: '60%', lg: '65%' }, // Changed from 66.67% to 60% for md and 75% to 65% for lg
              display: 'flex',
              flexDirection: 'column',
              gap: 3
            }}>
              {testWithAnswers.questions.length > 0 ? (
                testWithAnswers.questions.map((question, index) => {
                  const correctPercentage = question.user_answer?.correct_percentage || 0;
                  const isFullyCorrect = correctPercentage === 100;
                  
                  return (
                    <Paper
                      id={`question-${question.question_id}`}
                      key={question.question_id}
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: '16px',
                        border: `1px solid ${isFullyCorrect
                          ? alpha(theme.palette.success.main, 0.3)
                          : alpha(theme.palette.error.main, 0.3)
                        }`,
                        backgroundColor: isFullyCorrect
                          ? alpha(theme.palette.success.light, 0.05)
                          : alpha(theme.palette.error.light, 0.05)
                      }}
                    >
                      {/* Question Header */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2
                      }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Питання {index + 1}
                        </Typography>
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          {isFullyCorrect ? (
                            <CheckCircleOutlineIcon sx={{ color: theme.palette.success.main }} />
                          ) : (
                            <CancelOutlinedIcon sx={{ color: theme.palette.error.main }} />
                          )}
                          <Typography variant="body2" sx={{
                            fontWeight: 600,
                            color: isFullyCorrect
                              ? theme.palette.success.main
                              : theme.palette.error.main
                          }}>
                            {correctPercentage}% правильно
                          </Typography>
                        </Box>
                      </Box>
                        {/* Render appropriate question type with hideCorrectAnswers prop */}
                      {question.question_type === 'MULTIPLE_CHOICE' && (
                        <AnsweredMultipleChoiceQuestion
                          questionId={question.question_id}
                          questionNumber={index + 1}
                          questionText={question.question}
                          questionImages={question.image_paths}
                          options={question.question_data.options as any[]}
                          userSelectedOptions={question.user_answer?.response?.selected_options || []}
                          hideCorrectAnswers={!isFullyCorrect && hideCorrectAnswers}
                        />
                      )}

                      {question.question_type === 'MATCHING' && (
                        <AnsweredMatchingQuestion
                          questionId={question.question_id}
                          questionNumber={index + 1}
                          questionText={question.question}
                          questionImages={question.image_paths}
                          options={question.question_data.options as any[]}
                          categories={question.question_data.categories as any[]}
                          userMatches={question.user_answer?.response?.matches || []}
                          hideCorrectAnswers={!isFullyCorrect && hideCorrectAnswers}
                        />
                      )}
                    </Paper>
                  );
                })
              ) : (
                <Typography variant="body1" sx={{ textAlign: 'center' }}>
                  Немає питань для цього тесту.
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
          justifyContent: 'center',
          p: 5
        }}>
          Дані тесту недоступні
        </Typography>
      )}
    </Container>
  );
};

export default TestReviewPage;