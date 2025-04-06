import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  useTheme,
  useMediaQuery,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom';
import { GetTestView, SaveEditedTest } from '../../services/TestService';
import LoadingDots from '../../components/tools/LoadingDots';
import { alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/Save';
import { getHeaderOffset } from '../../components/Header';
import { FullTestWithAnswers, Question, TestCardMeta } from './interfaces';
import EditMultipleChoiceQuestion from './EditMultipleChoiceQuestion';
import EditMatchingQuestion from './EditMatchingQuestion';
import QuizIcon from '@mui/icons-material/Quiz';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

// Styled components
interface QuestionButtonProps {
  isNew?: boolean;
}

const QuestionButton = styled(Button)<QuestionButtonProps>(({ theme, isNew }) => ({
  minWidth: '40px',
  height: '40px',
  margin: '8px',
  borderRadius: '8px',
  backgroundColor: isNew
    ? alpha(theme.palette.primary.main, 0.2)
    : alpha(theme.palette.grey[300], 0.5),
  color: isNew
    ? theme.palette.primary.main
    : theme.palette.text.primary,
  border: isNew
    ? `1px solid ${theme.palette.primary.main}`
    : 'none',
  '&:hover': {
    backgroundColor: isNew
      ? alpha(theme.palette.primary.main, 0.3)
      : alpha(theme.palette.grey[400], 0.5),
  },
  '&.Mui-disabled': {
    opacity: 0.6,
  }
}));

// Define question type options
enum QuestionTypeOptions {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  MATCHING = 'MATCHING'
}

// Custom type for our edited questions
interface EditedQuestion extends Question {
  isEdited?: boolean;
  isNew?: boolean;
  markedForDeletion?: boolean;
}

const EditTestPage: React.FC = () => {
  const { tfp_sha } = useParams<{ tfp_sha: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [testData, setTestData] = useState<TestCardMeta | null>(null);
  const [questions, setQuestions] = useState<EditedQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [showQuestionTypeDialog, setShowQuestionTypeDialog] = useState<boolean>(false);
  const [nextQuestionId, setNextQuestionId] = useState<number>(-1); // Negative IDs for new questions
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [testNameEdited, setTestNameEdited] = useState<string>('');
  const [testNameDialogOpen, setTestNameDialogOpen] = useState<boolean>(false);

  // Create refs for each question for scroll functionality
  const questionRefs = useRef<{[key: number]: React.RefObject<HTMLDivElement>}>({});

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
          const testDataFromApi = response.full_test_with_answers.test;
          setTestData(testDataFromApi);
          setTestNameEdited(testDataFromApi.test_name || '');
          setQuestions(response.full_test_with_answers.questions.map(q => ({ ...q })));
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

  // Initialize refs for each question
  useEffect(() => {
    questions.forEach((question, index) => {
      if (!questionRefs.current[index]) {
        questionRefs.current[index] = React.createRef();
      }
    });
  }, [questions]);

  // Scroll to selected question
  const scrollToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    
    if (questionRefs.current[index]?.current) {
      setTimeout(() => {
        const questionElement = questionRefs.current[index]?.current;
        if (questionElement) {
          // Get the element's position relative to the viewport
          const elementRect = questionElement.getBoundingClientRect();
          // Scroll with offset to account for header height and some padding
          const yOffset = -1 * (headerOffset + 16);
          window.scrollTo({
            top: window.scrollY + elementRect.top + yOffset,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  };

  // Handle adding a new question
  const handleAddQuestion = () => {
    setShowQuestionTypeDialog(true);
  };

  // Create a new question based on selected type
  const createNewQuestion = (type: QuestionTypeOptions) => {
    let newQuestion: EditedQuestion;
    
    if (type === QuestionTypeOptions.MULTIPLE_CHOICE) {
      newQuestion = {
        question_id: nextQuestionId,
        question: '',
        question_type: 'MULTIPLE_CHOICE',
        question_data: {
          options: []
        },
        question_order: questions.length,
        max_points: 1,
        isNew: true,
        isEdited: true
      };
    } else {
      newQuestion = {
        question_id: nextQuestionId,
        question: '',
        question_type: 'MATCHING',
        question_data: {
          options: [],
          categories: []
        },
        question_order: questions.length,
        max_points: 1,
        isNew: true,
        isEdited: true
      };
    }
    
    const updatedQuestions = [...questions, newQuestion];
    setQuestions(updatedQuestions);
    
    // Initialize ref for the new question
    const newIndex = updatedQuestions.length - 1;
    questionRefs.current[newIndex] = React.createRef();
    
    // Set as current and scroll to it after a brief delay to allow the DOM to update
    setTimeout(() => {
      scrollToQuestion(newIndex);
    }, 100);
    
    setNextQuestionId(nextQuestionId - 1); // Decrement for next new question ID
    setShowQuestionTypeDialog(false);
  };

  // Handle deleting a question
  const handleDeleteQuestion = (index: number) => {
    const updatedQuestions = [...questions];
    
    // If it's a new question, just remove it
    if (updatedQuestions[index].isNew) {
      updatedQuestions.splice(index, 1);
      
      // Update current question index if needed
      if (currentQuestionIndex >= updatedQuestions.length) {
        setCurrentQuestionIndex(Math.max(0, updatedQuestions.length - 1));
      } else if (currentQuestionIndex === index) {
        setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1));
      }
    } else {
      // Mark existing question for deletion
      updatedQuestions[index].markedForDeletion = true;
      
      // If current question is marked for deletion, move to the next available question
      if (index === currentQuestionIndex) {
        let newIndex = currentQuestionIndex;
        let foundNewIndex = false;
        
        // Try to find the next non-deleted question
        for (let i = 0; i < updatedQuestions.length; i++) {
          if (!updatedQuestions[i].markedForDeletion) {
            newIndex = i;
            foundNewIndex = true;
            break;
          }
        }
        
        if (foundNewIndex) {
          setCurrentQuestionIndex(newIndex);
        }
      }
    }
    
    setQuestions(updatedQuestions);
  };

  // Handle saving a multiple choice question
  const handleSaveMultipleChoiceQuestion = (questionData: {
    question_text: string;
    options_list: Array<{
      id: number;
      text: string;
      is_correct: boolean;
    }>;
  }, questionIndex: number) => {
    const updatedQuestions = [...questions];
    
    // Update the question data
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      question: questionData.question_text,
      question_data: {
        options: questionData.options_list.map(option => ({
          id: option.id,
          text: option.text,
          is_correct: option.is_correct
        }))
      },
      isEdited: true
    };
    
    setQuestions(updatedQuestions);
  };

  // Handle saving a matching question
  const handleSaveMatchingQuestion = (questionData: {
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
  }, questionIndex: number) => {
    const updatedQuestions = [...questions];
    
    // Update the question data
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      question: questionData.question_text,
      question_data: {
        categories: questionData.category_list.map(category => ({
          id: category.id,
          text: category.text,
          display_order: category.display_order
        })),
        options: questionData.options_list.map(option => ({
          id: option.id,
          text: option.text,
          matching_category_id: option.matching_category_id
        }))
      },
      isEdited: true
    };
    
    setQuestions(updatedQuestions);
  };

  // Handler for question selection
  const handleQuestionSelect = (index: number) => {
    scrollToQuestion(index);
  };

  // Handle back button click
  const handleBackClick = () => {
    navigate('/tests');
  };

  // Handle save test
  const handleSaveTest = async () => {
    setIsSaving(true);
    
    // Prepare data for saving
    const testToSave = {
      test_id: testData?.test_id,
      test_name: testNameEdited,
      questions: questions
        .filter(q => !q.markedForDeletion)
        .map(q => ({
          question_id: q.question_id > 0 ? q.question_id : undefined, // Don't send negative IDs
          question: q.question,
          question_type: q.question_type,
          question_data: q.question_data,
          max_points: q.max_points,
          isNew: q.isNew
        }))
    };
    
    console.log('Saving test:', testToSave);
    
    try {
      const result = await SaveEditedTest(tfp_sha!, testToSave);
      if (result.success) {
        // Navigate back to tests list on success
        navigate('/tests');
      } else {
        setError(result.error || 'Failed to save test');
      }
    } catch (err) {
      console.error('Error saving test:', err);
      setError('An unexpected error occurred while saving the test');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle edit test name
  const handleEditTestName = () => {
    setTestNameDialogOpen(true);
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
          <Box
            sx={{
              ml: 2,
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: { xs: 'flex-start', sm: 'center' }
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: theme.palette.primary.main
              }}
            >
              {testNameEdited}
            </Typography>
            
            <IconButton 
              size="small" 
              onClick={handleEditTestName}
              sx={{ ml: 1 }}
            >
              <EditIcon  /> 
           
            </IconButton>
          </Box>
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
      ) : (
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
            {/* Question Navigation Column - Now sticky */}
            <Box sx={{
              width: { xs: '100%', md: '33.33%', lg: '25%' },
              borderRight: { md: `1px solid ${alpha(theme.palette.grey[300], 0.5)}` },
              paddingRight: { md: 3 },
              display: 'flex',
              flexDirection: 'column',
              height: { md: 'fit-content' },
              position: { md: 'sticky' },
              top: { md: `${headerOffset + 16}px` },
              alignSelf: { md: 'flex-start' }
            }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Редагування тесту
              </Typography>

              {/* Question number grid */}
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                Питання:
              </Typography>
              <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'flex-start',
                mb: 2,
              }}>
                {questions
                  .filter(q => !q.markedForDeletion)
                  .map((question, index) => (
                    <QuestionButton
                      key={question.question_id}
                      isNew={question.isNew}
                      onClick={() => handleQuestionSelect(questions.indexOf(question))}
                      disabled={isSaving}
                      sx={{
                        backgroundColor: index === currentQuestionIndex 
                          ? alpha(theme.palette.primary.main, 0.8)
                          : question.isNew
                            ? alpha(theme.palette.primary.main, 0.2)
                            : alpha(theme.palette.grey[300], 0.5),
                        color: index === currentQuestionIndex 
                          ? theme.palette.common.white
                          : question.isNew
                            ? theme.palette.primary.main
                            : theme.palette.text.primary,
                      }}
                    >
                      {index + 1}
                    </QuestionButton>
                  ))}
                
                {/* Add question button */}
                <QuestionButton
                  isNew
                  onClick={handleAddQuestion}
                  disabled={isSaving}
                  sx={{
                    backgroundColor: alpha(theme.palette.success.main, 0.2),
                    color: theme.palette.success.main,
                    border: `1px solid ${theme.palette.success.main}`,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.success.main, 0.3),
                    }
                  }}
                >
                  <AddIcon />
                </QuestionButton>
              </Box>

              {/* Save button */}
              <Button
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<SaveIcon />}
                onClick={handleSaveTest}
                disabled={isSaving}
                sx={{ 
                  mb: 2,
                  borderRadius: '8px',
                  padding: '12px 0',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.8)
                  }
                }}
              >
                {isSaving ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Зберегти тест'
                )}
              </Button>
            </Box>

            {/* Question Display/Edit Area - Now shows all questions */}
            <Box sx={{
              width: { xs: '100%', md: '66.67%', lg: '75%' },
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}>
              {showQuestionTypeDialog ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: '16px',
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    backgroundColor: alpha(theme.palette.primary.main, 0.05)
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, textAlign: 'center' }}>
                    Оберіть тип питання
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 3,
                    justifyContent: 'center'
                  }}>
                    <Box sx={{ flex: 1 }}>
                      <Card
                        onClick={() => createNewQuestion(QuestionTypeOptions.MULTIPLE_CHOICE)}
                        sx={{
                          borderRadius: '16px',
                          cursor: 'pointer',
                          height: '100%',
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            transform: 'translateY(-4px)',
                            boxShadow: `0 6px 12px ${alpha(theme.palette.primary.main, 0.15)}`
                          }
                        }}
                      >
                        <CardContent sx={{ textAlign: 'center', p: 4 }}>
                          <QuizIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
                          <Typography variant="h6" gutterBottom>
                            Вибір з варіантів
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Створити питання з вибором однієї або кількох правильних відповідей
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>
                    
                    <Box sx={{ flex: 1 }}>
                      <Card
                        onClick={() => createNewQuestion(QuestionTypeOptions.MATCHING)}
                        sx={{
                          borderRadius: '16px',
                          cursor: 'pointer',
                          height: '100%',
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            transform: 'translateY(-4px)',
                            boxShadow: `0 6px 12px ${alpha(theme.palette.primary.main, 0.15)}`
                          }
                        }}
                      >
                        <CardContent sx={{ textAlign: 'center', p: 4 }}>
                          <CompareArrowsIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
                          <Typography variant="h6" gutterBottom>
                            Встановлення відповідності
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Створити питання на встановлення відповідності між елементами
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>
                  </Box>
                </Paper>
              ) : questions.filter(q => !q.markedForDeletion).length > 0 ? (
                <>
                  {/* Display all questions */}
                  {questions
                    .filter(q => !q.markedForDeletion)
                    .map((question, index) => (
                      <Paper
                        key={question.question_id}
                        ref={questionRefs.current[questions.indexOf(question)]}
                        elevation={0}
                        id={`question-${index}`}
                        sx={{
                          p: 3,
                          borderRadius: '16px',
                          border: `1px solid ${
                            index === currentQuestionIndex 
                              ? alpha(theme.palette.primary.main, 0.5)
                              : alpha(theme.palette.grey[300], 0.5)
                          }`,
                          backgroundColor: index === currentQuestionIndex 
                            ? alpha(theme.palette.primary.main, 0.03)
                            : 'transparent'
                        }}
                      >
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          mb: 2
                        }}>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 600, 
                            color: theme.palette.primary.main
                          }}>
                            Питання {index + 1}
                          </Typography>
                          
                          {/* Delete button moved to question component */}
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteOutlineIcon />}
                            onClick={() => handleDeleteQuestion(questions.indexOf(question))}
                            disabled={isSaving}
                            size="small"
                            sx={{ 
                              borderRadius: '8px',
                              textTransform: 'none',
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.error.main, 0.05)
                              }
                            }}
                          >
                            Видалити
                          </Button>
                        </Box>
                        
                        {question.question_type === 'MULTIPLE_CHOICE' && (
                          <EditMultipleChoiceQuestion
                            questionId={question.question_id > 0 ? question.question_id : undefined}
                            initialQuestionText={question.question}
                            initialOptions={question.question_data.options as any[]}
                            onSave={(data) => handleSaveMultipleChoiceQuestion(data, questions.indexOf(question))}
                          />
                        )}
                        
                        {question.question_type === 'MATCHING' && (
                          <EditMatchingQuestion
                            questionId={question.question_id > 0 ? question.question_id : undefined}
                            initialQuestionText={question.question}
                            initialCategories={question.question_data.categories as any[]}
                            initialOptions={question.question_data.options as any[]}
                            onSave={(data) => handleSaveMatchingQuestion(data, questions.indexOf(question))}
                          />
                        )}
                      </Paper>
                    ))}
                </>
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: '16px',
                    border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 300
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                    Немає питань для редагування
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleAddQuestion}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      mt: 2
                    }}
                  >
                    Додати нове питання
                  </Button>
                </Paper>
              )}
            </Box>
          </Box>
        </Box>
      )}

      {/* Dialog for selecting question type */}
      <Dialog
        open={showQuestionTypeDialog && isMobile}
        onClose={() => setShowQuestionTypeDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Оберіть тип питання</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<QuizIcon />}
                onClick={() => createNewQuestion(QuestionTypeOptions.MULTIPLE_CHOICE)}
                sx={{
                  py: 2,
                  borderRadius: '8px',
                  justifyContent: 'flex-start',
                  textTransform: 'none'
                }}
              >
                Вибір з варіантів
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<CompareArrowsIcon />}
                onClick={() => createNewQuestion(QuestionTypeOptions.MATCHING)}
                sx={{
                  py: 2,
                  borderRadius: '8px',
                  justifyContent: 'flex-start',
                  textTransform: 'none'
                }}
              >
                Встановлення відповідності
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      {/* Dialog for editing test name */}
      <Dialog
        open={testNameDialogOpen}
        onClose={() => setTestNameDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Редагування назви тесту</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Назва тесту"
            type="text"
            fullWidth
            value={testNameEdited}
            onChange={(e) => setTestNameEdited(e.target.value)}
            variant="outlined"
            sx={{ mt: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, mb: 1 }}>
            <Button 
              onClick={() => setTestNameDialogOpen(false)} 
              sx={{ mr: 2 }}
            >
              Скасувати
            </Button>
            <Button 
              variant="contained"
              onClick={() => setTestNameDialogOpen(false)}
            >
              Зберегти
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

// Import EditIcon for test name editing
const EditIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  );
};

export default EditTestPage;