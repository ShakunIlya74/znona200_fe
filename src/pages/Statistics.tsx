import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Container,
  List,
  ListItem,
  ListItemText,
  Divider,
  Collapse,
  IconButton,
  Paper,
  alpha,
  Tooltip,
  Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useNavigate } from 'react-router-dom';
import { getMainUserStatistics, FolderStatistics } from '../services/UserService';
import LoadingDots from '../components/tools/LoadingDots';
import { getHeaderOffset } from '../components/Header';

const StatisticsPage: React.FC = () => {  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [folderStats, setFolderStats] = useState<FolderStatistics[]>([]);
  const [totalStars, setTotalStars] = useState<number>(0);
  const [totalAvailableTests, setTotalAvailableTests] = useState<number>(0);
  const [totalSolvedTests, setTotalSolvedTests] = useState<number>(0);
  const [avgSolvedCorrectPercentage, setAvgSolvedCorrectPercentage] = useState<number>(0);
  const [openFolderId, setOpenFolderId] = useState<number | string | null>(null);
  
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isMedium = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const HEADER_OFFSET = getHeaderOffset(isMobile, isMedium);

  useEffect(() => {
    const loadUserStatistics = async () => {
      setLoading(true);
      try {
        const response = await getMainUserStatistics();
          if (response.success && response.folder_dicts) {
          setFolderStats(response.folder_dicts);
          setTotalStars(response.stars_number || 0);
          setTotalAvailableTests(response.total_available_tests || 0);
          setTotalSolvedTests(response.total_solved_tests || 0);
          setAvgSolvedCorrectPercentage(response.avg_solved_correct_percentage || 0);
        } else {
          setError(response.error || 'Failed to load user statistics');
        }
      } catch (err) {
        console.error('Error loading user statistics:', err);
        setError('An error occurred while loading statistics');
      } finally {
        setLoading(false);
      }
    };

    loadUserStatistics();
  }, []);
  const handleFolderClick = (folderId: number | string) => {
    setOpenFolderId(openFolderId === folderId ? null : folderId);
  };

  const handleTestClick = (tfp_sha: string) => {
    navigate(`/tests/review/${tfp_sha}`);
  };

  const renderStars = (stars: number) => {
    const starIcons = [];
    for (let i = 1; i <= 3; i++) {      starIcons.push(
        <StarIcon
          key={i}
          sx={{
            fontSize: '1.5rem',
            color: i <= stars ? '#FFD700' : theme.palette.grey[300]
          }}
        />
      );
    }
    return starIcons;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return theme.palette.success.main;
    if (percentage >= 30) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <LoadingDots />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: '16px',
            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            backgroundColor: alpha(theme.palette.error.main, 0.05),
            textAlign: 'center'
          }}
        >
          <Typography color="error" variant="h6" gutterBottom>
            Помилка завантаження статистики
          </Typography>
          <Typography color="error">
            {error}
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 2,
            color: theme.palette.primary.main
          }}
        >
          Моя статистика
        </Typography>
          {/* Total Stars Display */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: '16px',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StarIcon sx={{ fontSize: '2rem', color: '#FFD700' }} />
            <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
              {totalStars}
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Загальна кількість зірок
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Зібрано за всі пройдені тести
            </Typography>
          </Box>
        </Paper>

        {/* Statistics Overview */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '16px',
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
              backgroundColor: alpha(theme.palette.success.main, 0.05),
              textAlign: 'center'
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.success.main, mb: 1 }}>
              {totalSolvedTests}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Пройдено тестів
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '16px',
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              backgroundColor: alpha(theme.palette.info.main, 0.05),
              textAlign: 'center'
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.info.main, mb: 1 }}>
              {totalAvailableTests}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Доступно тестів
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '16px',
              border: `1px solid ${alpha(getScoreColor(avgSolvedCorrectPercentage), 0.2)}`,
              backgroundColor: alpha(getScoreColor(avgSolvedCorrectPercentage), 0.05),
              textAlign: 'center'
            }}
          >
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                color: getScoreColor(avgSolvedCorrectPercentage), 
                mb: 1 
              }}
            >
              {Math.round(avgSolvedCorrectPercentage * 10) / 10}%
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Середній результат
            </Typography>
          </Paper>
        </Box>

        <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
          Перегляньте свій прогрес по папках і тестах
        </Typography>
      </Box>

      {/* Folder Statistics */}
      {folderStats.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {folderStats.map((folder) => (
            <Box
              key={folder.folder_id}
              sx={{
                position: 'relative',
                zIndex: openFolderId === folder.folder_id ? 2 : 1
              }}
            >
              <Card
                sx={{
                  position: openFolderId === folder.folder_id ? 'sticky' : 'static',
                  top: HEADER_OFFSET,
                  zIndex: 3,
                  width: '100%',
                  borderRadius: '16px',
                  boxShadow: openFolderId === folder.folder_id
                    ? `0px 2px 8px ${alpha(theme.palette.common.black, 0.08)}`
                    : `0px 1px 3px ${alpha(theme.palette.common.black, 0.05)}`,
                  border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: openFolderId === folder.folder_id
                      ? `0px 2px 8px ${alpha(theme.palette.common.black, 0.08)}`
                      : `0px 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
                    transform: openFolderId === folder.folder_id
                      ? 'none'
                      : 'translateY(-2px)'
                  }
                }}
              >
                <CardActionArea
                  onClick={() => handleFolderClick(folder.folder_id)}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pr: 2,
                    borderRadius: openFolderId === folder.folder_id
                      ? '16px 16px 0 0'
                      : '16px',
                    py: 0.5
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, py: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          fontSize: '1.1rem',
                          flex: 1
                        }}
                      >
                        {folder.folder_name}
                      </Typography>
                        {/* Average Score Chip */}
                      <Chip
                        icon={<BarChartIcon />}
                        label={`${Math.round((folder.avg_correct_percentage || 0) * 10) / 10}%`}
                        size="small"
                        sx={{
                          backgroundColor: alpha(getScoreColor(folder.avg_correct_percentage), 0.1),
                          color: getScoreColor(folder.avg_correct_percentage),
                          fontWeight: 600,
                          ml: 2
                        }}
                      />
                    </Box>
                      <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontSize: '0.9rem'
                      }}
                    >
                      Пройдено тестів: {folder.tests.length} • Середній бал: {Math.round((folder.avg_correct_percentage || 0) * 10) / 10}%
                    </Typography>
                  </CardContent>
                  
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFolderClick(folder.folder_id);
                    }}
                    size="small"
                    sx={{
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      color: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      },
                      transition: 'all 0.2s'
                    }}
                  >
                    {openFolderId === folder.folder_id
                      ? <ExpandLessIcon />
                      : <ExpandMoreIcon />
                    }
                  </IconButton>
                </CardActionArea>
              </Card>

              <Collapse
                in={openFolderId === folder.folder_id}
                timeout="auto"
                unmountOnExit
              >
                <Box
                  sx={{
                    mt: 0,
                    mb: 2,
                    mr: 1,
                    borderLeft: '2px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                    borderRadius: '0 0 16px 16px',
                    ml: 2,
                    position: 'relative',
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      backgroundColor: theme.palette.background.paper,
                      borderRadius: '0 0 12px 12px',
                      overflow: 'hidden',
                      border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                      borderTop: 'none',
                      marginTop: '-1px',
                    }}
                  >
                    {folder.tests.length > 0 ? (
                      <List disablePadding>
                        {folder.tests.map((test, index) => (
                          <React.Fragment key={test.test_id}>                            <ListItem
                              onClick={() => handleTestClick(test.tfp_sha)}
                              sx={{
                                py: 2,
                                px: 3,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                cursor: 'pointer',
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                },
                                transition: 'background-color 0.2s ease-in-out'
                              }}
                            >
                              <Typography
                                sx={{
                                  fontWeight: 600,
                                  color: theme.palette.primary.main,
                                  minWidth: '32px',
                                  textAlign: 'center'
                                }}
                              >
                                {index + 1}
                              </Typography>
                                <ListItemText
                                primary={
                                  <Typography sx={{ 
                                    fontWeight: 500,
                                    '&:hover': {
                                      color: theme.palette.primary.main
                                    },
                                    transition: 'color 0.2s ease-in-out'
                                  }}>
                                    {test.test_name}
                                  </Typography>
                                }
                                secondary={                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        color: getScoreColor(test.correct_percentage),
                                        fontWeight: 600
                                      }}
                                    >
                                      {Math.round((test.correct_percentage || 0) * 10) / 10}%
                                    </Typography>
                                  </Box>
                                }
                              />
                                {/* Stars Display */}
                              <Tooltip title={`${Math.round((test.correct_percentage || 0) * 10) / 10}% правильних відповідей`}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  {renderStars(test.stars)}
                                </Box>
                              </Tooltip>
                            </ListItem>
                            
                            {index < folder.tests.length - 1 && (
                              <Divider component="li" sx={{ borderColor: alpha(theme.palette.divider, 0.5) }} />
                            )}
                          </React.Fragment>
                        ))}
                      </List>
                    ) : (
                      <Box sx={{ py: 4, px: 3, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          У цій папці немає пройдених тестів
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Box>
              </Collapse>
            </Box>
          ))}
        </Box>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: '16px',
            border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
            textAlign: 'center'
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Поки що немає статистики
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Пройдіть кілька тестів, щоб побачити свою статистику тут
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default StatisticsPage;