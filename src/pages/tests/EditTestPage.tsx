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
import EditIcon from '@mui/icons-material/Edit';
import { getHeaderOffset } from '../../components/Header';
import { FullTestWithAnswers, MatchingCategory, MatchingOption, Question, TestCardMeta } from './interfaces';
import EditMultipleChoiceQuestion from './components/EditMultipleChoiceQuestion';
import EditMatchingQuestion from './components/EditMatchingQuestion';
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
    : theme.palette.common.white,
  color: isNew
    ? theme.palette.primary.main
    : theme.palette.text.primary,
  border: isNew
    ? `1px solid ${theme.palette.primary.main}`
    : `1px solid ${alpha(theme.palette.grey[300], 0.8)}`,
  '&:hover': {
    backgroundColor: isNew
      ? alpha(theme.palette.primary.main, 0.3)
      : alpha(theme.palette.grey[100], 0.8),
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

// EditableContent component for test name that transforms into editable field
const EditableTestName: React.FC<{
  value: string;
  onChange: (newValue: string) => void;
  placeholder?: string;
}> = ({
  value,
  onChange,
  placeholder = 'Введіть назву тесту...'
}) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    setEditValue(value);
  }, [value]);
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);
  
  const handleBlur = () => {
    setIsEditing(false);
    onChange(editValue);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(value); // Reset to original value
    }
  };
  
  if (isEditing) {
    return (
      <TextField
        inputRef={inputRef}
        fullWidth
        variant="outlined"
        size="small"
        autoFocus
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '6px',
            fontSize: '1.25rem',
            fontWeight: 600
          }
        }}
      />
    );
  }
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center',
        cursor: 'pointer',
      }}
      onClick={() => setIsEditing(true)}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 600,
          color: theme.palette.primary.main,
          mr: 1
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

const EditTestPage: React.FC = () => {
  const { tfp_sha } = useParams<{ tfp_sha: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [testData, setTestData] = useState<TestCardMeta | null>(null);
  const [questions, setQuestions] = useState<EditedQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [showQuestionTypeDialog, setShowQuestionTypeDialog] = useState<boolean>(false);
  const [showAddQuestionSection, setShowAddQuestionSection] = useState<boolean>(false); // New state
  const [nextQuestionId, setNextQuestionId] = useState<number>(-1); // Negative IDs for new questions
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [testNameEdited, setTestNameEdited] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [showExitDialog, setShowExitDialog] = useState<boolean>(false);

  // Create refs for each question for scroll functionality
  const questionRefs = useRef<{[key: number]: React.RefObject<HTMLDivElement>}>({});
  const addQuestionSectionRef = useRef<HTMLDivElement>(null); // New ref for add question section

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
          setIsSaved(true); // Initially mark as saved when loaded
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
    // Reset any existing dialogs that might be open
    setShowAddQuestionSection(false);
    
    if (isMobile) {
      // On mobile, show the dialog
      setShowQuestionTypeDialog(true);
    } else {
      // On desktop, show the add question section at the bottom
      setShowAddQuestionSection(true);
      
      // Scroll to the add question section after a brief delay to allow rendering
      setTimeout(() => {
        if (addQuestionSectionRef.current) {
          const rect = addQuestionSectionRef.current.getBoundingClientRect();
          const scrollOffset = window.pageYOffset + rect.top - headerOffset - 20;
          window.scrollTo({ top: scrollOffset, behavior: 'smooth' });
        }
      }, 300);
    }
    
    // Log to help with debugging
    console.log("Add question triggered:", {showAddQuestionSection: showAddQuestionSection});
  };

  // Create a new question based on selected type
  const createNewQuestion = (type: QuestionTypeOptions) => {
    // Log that function was called to help with debugging
    console.log("createNewQuestion called with type:", type);
    
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
    setIsSaved(false); // Mark as unsaved when adding a new question
    
    // Initialize ref for the new question
    const newIndex = updatedQuestions.length - 1;
    questionRefs.current[newIndex] = React.createRef();
    
    // Set as current and scroll to it after a brief delay to allow the DOM to update
    setTimeout(() => {
      setCurrentQuestionIndex(newIndex);
      scrollToQuestion(newIndex);
    }, 100);
    
    setNextQuestionId(nextQuestionId - 1); // Decrement for next new question ID
    setShowQuestionTypeDialog(false);
    setShowAddQuestionSection(false); // Hide the add question section
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
    
    // console.log('Updated questions after deletion:', updatedQuestions);
    setQuestions(updatedQuestions);
    setIsSaved(false); // Mark as unsaved when deleting a question
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
    
    console.log('Updated question:', updatedQuestions[questionIndex]);
    setQuestions(updatedQuestions);
    setIsSaved(false); // Mark as unsaved when a question is edited
  };

  // Handle saving a matching question
  const handleSaveMatchingQuestion = (questionData: {
    question_id?: number;
    question_text: string;
    category_list: Array<MatchingCategory>;
    options_list: Array<MatchingOption>;
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
    setIsSaved(false); // Mark as unsaved when a question is edited
  };

  // Handler for question selection
  const handleQuestionSelect = (index: number) => {
    setShowQuestionTypeDialog(false);
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
        .map(q => ({
          question_id: q.question_id > 0 ? q.question_id : undefined, // Don't send negative IDs
          question: q.question,
          question_type: q.question_type,
          question_data: q.question_data,
          max_points: q.max_points,
          isNew: q.isNew,
          markedForDeletion: q.markedForDeletion // Include marked for deletion
        }))
    };
    
    console.log('Saving test:', testToSave);
    
    try {
      const result = await SaveEditedTest(tfp_sha!, testToSave);
      if (result.success) {
        setIsSaved(true); // Mark as saved when successfully saved
        // Note: if we want to stay on the page after saving, remove this navigate
        // navigate('/tests');
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

  // Handle test name change
  const handleTestNameChange = (newName: string) => {
    setTestNameEdited(newName);
    setIsSaved(false); // Mark as unsaved when test name is edited
  };

  // Handle exit with unsaved changes
  const handleExitClick = () => {
    if (!isSaved) {
      setShowExitDialog(true);
    } else {
      navigate('/tests');
    }
  };

  // Handle exit confirmation
  const handleConfirmExit = () => {
    setShowExitDialog(false);
    navigate('/tests');
  };

  // Handle exit cancellation
  const handleCancelExit = () => {
    setShowExitDialog(false);
  };

  // Define a responsive padding value based on screen size
  const questionTypeCardPadding = useMediaQuery(theme.breakpoints.between('sm', 'lg',)) 
    ? 1  // Less padding for medium screens
    : 4; // Normal padding for other screen sizes

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
          onClick={handleExitClick}
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
            <EditableTestName
              value={testNameEdited}
              onChange={handleTestNameChange}
            />
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
          }}>            {/* Question Navigation Column - Now sticky */}
            <Box sx={{
              width: { xs: '100%', md: '30%', lg: '30%' },
              borderRight: { md: `1px solid ${alpha(theme.palette.grey[300], 0.5)}` },
              paddingRight: { md: 3 },
              display: 'flex',
              flexDirection: 'column',
              height: { md: 'fit-content' },
              position: { md: 'sticky' },
              top: { md: `${headerOffset + 16}px` },
              alignSelf: { md: 'flex-start' },
              maxHeight: { md: `calc(100vh - ${headerOffset + 90}px)` },
              overflow: { md: 'auto' },
            }}>

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
                            : theme.palette.common.white,
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

              {/* Save status indicator */}
              <Box 
                sx={{ 
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    color: isSaved ? theme.palette.success.main : theme.palette.error.main,
                    fontWeight: 600
                  }}
                >
                  {isSaved ? 'Збережено' : 'Зміни не збережено'}
                </Typography>
              </Box>

              {/* Save and Exit buttons */}
              <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<SaveIcon />}
                  onClick={handleSaveTest}
                  disabled={isSaving}
                  sx={{ 
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

                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  startIcon={<ArrowBackIcon />}
                  onClick={handleExitClick}
                  disabled={isSaving}
                  sx={{ 
                    borderRadius: '8px',
                    padding: '12px 0',
                    fontWeight: 600,
                    textTransform: 'none'
                  }}
                >
                  Вийти
                </Button>
              </Box>
            </Box>            {/* Question Display/Edit Area - Now shows all questions */}
            <Box sx={{
              width: { xs: '100%', md: '70%', lg: '70%' },
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}>
              {questions.filter(q => !q.markedForDeletion).length > 0 ? (
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
                    
                  {/* Add Question Section - Appears at the bottom when adding a new question */}
                  {showAddQuestionSection && (
                    <Paper
                      ref={addQuestionSectionRef}
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
                            <CardContent sx={{ textAlign: 'center', p: questionTypeCardPadding }}>
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
                            <CardContent sx={{ textAlign: 'center', p: questionTypeCardPadding }}>
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
                  )}
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
                    <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleAddQuestion}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      mt: 2,
                      '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.8)
                      }
                    }}
                    >
                    Додати нове питання
                    </Button>
                </Paper>
                </>
              ) : (
                <>
                {/* Add Question Section - Appears at the bottom when adding a new question */}
                {showAddQuestionSection && (
                  <Paper
                    ref={addQuestionSectionRef}
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
                          <CardContent sx={{ textAlign: 'center', p: questionTypeCardPadding }}>
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
                          <CardContent sx={{ textAlign: 'center', p: questionTypeCardPadding }}>
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
                )}
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
                      mt: 2,
                      '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.8)
                      }
                    }}
                    >
                    Додати нове питання
                    </Button>
                </Paper>
                </>
              )}
              
              {/* Empty box at the bottom that can be scrolled to when adding questions */}
              {showAddQuestionSection && <Box sx={{ height: 20 }} />}
            </Box>
          </Box>
        </Box>
      )}

      {/* Question Type Dialog for Mobile (keeping only this dialog) */}
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

      {/* Exit confirmation dialog */}
      <Dialog
        open={showExitDialog}
        onClose={handleCancelExit}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: `0px 8px 24px ${alpha(theme.palette.common.black, 0.15)}`,
            maxWidth: '400px',
          }
        }}
      >
        <DialogTitle sx={{ 
          py: 3, 
          px: 3,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              fontSize: '1.1rem'
            }}
          >
            Незбережені зміни
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 3, px: 3 }}>
          <Typography variant="body1">
            У вас є незбережені зміни. Ви впевнені, що хочете вийти без збереження?
          </Typography>
        </DialogContent>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          px: 3, 
          pb: 3, 
          pt: 1
        }}>
          <Button 
            onClick={handleCancelExit}
            variant="outlined"
            sx={{
              borderRadius: '8px',
              py: 1,
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: alpha(theme.palette.grey[300], 0.8),
              color: theme.palette.text.primary
            }}
          >
            Повернутися до редагування
          </Button>
          
          <Button 
            onClick={handleConfirmExit}
            variant="contained"
            color="error"
            sx={{
              borderRadius: '8px',
              py: 1,
              px: 3,
              ml: 1,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Вийти без збереження
          </Button>
        </Box>
      </Dialog>
    </Container>
  );
};

export default EditTestPage;