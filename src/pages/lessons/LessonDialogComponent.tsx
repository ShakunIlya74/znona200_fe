import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Backdrop,
  alpha
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// Define the lesson interface for props
export interface LessonCardMeta {
  lesson_id: number;
  lesson_name: string;
  lesson_description?: string;
  folder_id: number;
  lesson_sha: string;
  created_at?: string;
  updated_at?: string;
  viewed?: boolean;
  completed?: boolean;
}

interface LessonModalProps {
  open: boolean;
  lesson: LessonCardMeta | null;
  onClose: () => void;
  onView: (lessonSha: string) => void;
  isAdmin: boolean;
  onLessonRemoved?: () => void;
}

const LessonDialogComponent: React.FC<LessonModalProps> = ({
  open,
  lesson,
  onClose,
  onView,
  isAdmin,
  onLessonRemoved
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  if (!lesson) return null;

  const hasViewed = lesson.viewed === true;

  const handleViewLesson = () => {
    console.log(`Viewing lesson with lesson_sha: ${lesson.lesson_sha}`);
    onView(lesson.lesson_sha);
  };
  const handleEditLesson = () => {
    console.log(`Navigating to edit lesson with lesson_sha: ${lesson.lesson_sha}`);
    navigate(`/webinars/edit/${lesson.lesson_sha}`);
  };

  const toggleDeleteMode = () => {
    setIsDeleting(!isDeleting);
  };

  // Helper function to create square buttons with responsive size
  const getButtonSx = (variant: 'outlined' | 'contained', color?: string) => {
    const isContained = variant === 'contained';
    const buttonColor = color || theme.palette.primary.main;
    
    return {
      borderRadius: '8px',
      textTransform: 'none',
      fontWeight: 600,
      minWidth: '120px',
      height: '120px',
      flex: 1,
      maxWidth: '180px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 1,
      p: 2,
      transition: 'all 0.2s ease-in-out',
      ...(isContained ? {
        backgroundColor: buttonColor,
        boxShadow: `0px 2px 4px ${alpha(buttonColor, 0.25)}`,
        '&:hover': {
          backgroundColor: alpha(buttonColor, 0.8)
        }
      } : {
        borderColor: color ? buttonColor : alpha(theme.palette.grey[500], 0.5),
        color: color || theme.palette.text.primary,
        '&:hover': {
          borderColor: buttonColor,
          backgroundColor: alpha(buttonColor, 0.05)
        }
      })
    };
  };

  return (
    <>
      <Backdrop
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: alpha(theme.palette.common.black, 0.5),
          backdropFilter: 'blur(4px)'
        }}
        open={open}
        onClick={onClose}
      />
      <Dialog
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: `0px 8px 24px ${alpha(theme.palette.common.black, 0.15)}`,
            maxWidth: '600px',
            width: '100%',
            m: 2,
            position: 'relative',
            overflow: 'visible'
          }
        }}
        sx={{
          '& .MuiBackdrop-root': {
            backgroundColor: 'transparent'
          }
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '-12px',
            right: '-12px',
            zIndex: 1
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{
              backgroundColor: theme.palette.common.white,
              boxShadow: `0px 2px 8px ${alpha(theme.palette.common.black, 0.1)}`,
              '&:hover': {
                backgroundColor: alpha(theme.palette.grey[100], 0.9)
              }
            }}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <DialogTitle
          sx={{
            py: 3,
            px: 3,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: '1.1rem'
            }}
          >
            {lesson.lesson_name}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ py: 3, px: 3 }}>
          {hasViewed && !isDeleting && (
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  borderRadius: '8px',
                  p: 1.5,
                  mb: 1,
                  mt: 1
                }}
              >
                <Typography variant="body2">
                  Статус: <strong>{lesson.completed ? "Завершено" : "Переглянуто"}</strong>
                </Typography>
              </Box>
            </Box>
          )}

          {isDeleting ? (
            <Typography
              variant="body1"
              color="error.main"
              sx={{ mb: 2, fontWeight: 500, textAlign: 'center' }}
            >
              Ви впевнені, що хочете видалити цей вебінар з папки?
              <br/>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Ця дія не може бути скасована.
              </Typography>
            </Typography>
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              {lesson.lesson_description && (
                <>
                  {lesson.lesson_description}
                  <Box sx={{ mb: 2 }} />
                </>
              )}
              Що ви бажаєте зробити з цим вебінаром?
            </Typography>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            pt: 1,
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            flexWrap: { xs: 'wrap', sm: 'nowrap' }
          }}
        >
          {isDeleting ? (
            <>
            </>
          ) : (
            <>
              {/* TODO: add change folder button and logic */}
              {/* Admin edit button */}
              {isAdmin && (
                <Button
                  onClick={handleEditLesson}
                  variant="outlined"
                  sx={{
                    ...getButtonSx('outlined'),
                    borderColor: theme.palette.warning.main,
                    color: theme.palette.warning.main,
                    '&:hover': {
                      borderColor: theme.palette.warning.dark,
                      backgroundColor: alpha(theme.palette.warning.main, 0.05)
                    }
                  }}
                >
                  <EditIcon sx={{ fontSize: '2rem', mb: 1 }} />
                  <Typography variant="body2">
                    Редагувати вебінар
                  </Typography>
                </Button>
              )}

              <Button
                onClick={handleViewLesson}
                variant="contained"
                sx={getButtonSx('contained')}
              >
                <VisibilityIcon sx={{ fontSize: '2rem', mb: 1 }} />
                <Typography variant="body2">
                  Переглянути вебінар
                </Typography>
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LessonDialogComponent;
