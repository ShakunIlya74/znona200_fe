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
import { FullTestWithAnswers, Question, TestCardMeta } from './interfaces';

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
      ? theme.palette.primary.dark 
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

const TestViewPage: React.FC = () => {
  const { tfp_sha } = useParams<{ tfp_sha: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [testData, setTestData] = useState<TestCardMeta | null>(null);
  const [testWithAnswers, setTestWithAnswers] = useState<FullTestWithAnswers | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  
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
        
        if (response.success && response.test_dict && response.full_test_with_answers) {
          setTestData(response.test_dict);
          setTestWithAnswers(response.full_test_with_answers);
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
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Helper function to check if a question has been answered (just as an example)
  const isQuestionAnswered = (questionId: number): boolean => {
    if (!testWithAnswers) return false;
    
    const question = testWithAnswers.questions.find(q => q.question_id === questionId);
    return question?.user_answer !== undefined;
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
            height: 'calc(100% - 32px)',
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
          height: 'calc(100% - 72px)', // Accounting for the top bar height
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            height: '100%'
          }}>
            {/* Question Navigation */}
            <Box sx={{ 
              width: { xs: '100%', md: '25%', lg: '20%' },
              borderRight: { md: `1px solid ${alpha(theme.palette.grey[300], 0.5)}` },
              height: { xs: 'auto', md: '100%' },
              display: 'flex', 
              flexDirection: 'column',
              pr: { md: 2 }
            }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Questions
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                justifyContent: 'flex-start',
                overflowY: 'auto'
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
            </Box>
            
            {/* Question Display */}
            <Box sx={{ 
              width: { xs: '100%', md: '75%', lg: '80%' },
              height: { xs: 'auto', md: '100%' },
              display: 'flex',
              flexDirection: 'column'
            }}>
              {testWithAnswers.questions.length > 0 ? (
                <>
                  <Paper 
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: '16px',
                      border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                      flex: 1,
                      mb: 2,
                      overflow: 'auto'
                    }}
                  >
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
                        {testWithAnswers.questions[currentQuestionIndex].question}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        Question Type:
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        {testWithAnswers.questions[currentQuestionIndex].question_type}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        Question ID:
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        {testWithAnswers.questions[currentQuestionIndex].question_id}
                      </Typography>
                    </Box>
                  </Paper>
                  
                  {/* Question Navigation */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    mt: 'auto',
                    mb: 2
                  }}>
                    <NavButton
                      startIcon={<ArrowBackIcon />}
                      onClick={handlePrevQuestion}
                      disabled={currentQuestionIndex <= 0}
                    >
                      Previous
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
                    >
                      Next
                    </NavButton>
                  </Box>
                </>
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