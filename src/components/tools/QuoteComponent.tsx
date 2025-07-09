import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import { GetQuote, PickNewQuote, Quote } from '../../services/MenuService';

interface QuoteData {
  text: string;
  author: string;
  source: string;
}

const AdminButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  minWidth: 'auto',
  padding: theme.spacing(1),
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

// Styled components
const QuoteContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  margin: theme.spacing(2),
  position: 'relative',
  backgroundColor: '#fafafa',
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
}));

const QuoteSymbol = styled(Typography)(({ theme }) => ({
  fontSize: '4rem',
  fontWeight: 'bold',
  color: theme.palette.grey[400],
  position: 'absolute',
  top: theme.spacing(1),
  left: theme.spacing(2),
  lineHeight: 1,
  fontFamily: 'serif',
}));

const QuoteText = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontStyle: 'italic',
  color: theme.palette.grey[600],
  marginLeft: theme.spacing(6),
  marginRight: theme.spacing(2),
  marginTop: theme.spacing(2),
  lineHeight: 1.4,
  fontWeight: 400,
}));

const AuthorText = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  color: theme.palette.grey[700],
  textAlign: 'right',
  marginTop: theme.spacing(2),
  marginRight: theme.spacing(1),
  fontStyle: 'normal',
  fontWeight: 500,
  '&::before': {
    content: '"— "',
    color: theme.palette.grey[500],
  },
}));

// Placeholder function to retrieve quote from backend
const fetchQuoteOfTheDay = async (): Promise<QuoteData> => {
  // TODO: Replace with actual API call to your Flask backend
  // Example: const response = await fetch('/api/quote-of-the-day');
  // return await response.json();
  
  // Placeholder data for now
  return {
    text: "Education is the most powerful weapon which you can use to change the world.",
    author: "Nelson Mandela",
    source: "Speech, 2003"
  };
};

const QuoteOfTheDay: React.FC = () => {
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadQuote = async () => {
    try {
      setLoading(true);
      const response = await GetQuote();
      setQuote(response.quote);
      setIsAdmin(response.is_admin || false);
    } catch (err) {
      setError('Failed to load quote of the day');
      console.error('Error fetching quote:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePickNewQuote = async () => {
    try {
      setRefreshing(true);
      const response = await PickNewQuote();
      if (response.success) {
        // Reload the quote after picking a new one
        await loadQuote();
      } else {
        setError('Failed to pick new quote');
      }
    } catch (err) {
      setError('Failed to pick new quote');
      console.error('Error picking new quote:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadQuote();
  }, []);

  if (loading) {
    return (
      <QuoteContainer>
        <Typography variant="body1" color="text.secondary">
          Loading quote of the day...
        </Typography>
      </QuoteContainer>
    );
  }

  if (error || !quote) {
    return (
      <QuoteContainer>
        <Typography variant="body1" color="error">
          {error || 'No quote available'}
        </Typography>
      </QuoteContainer>
    );
  }
  return (
    <QuoteContainer elevation={2}>
      <QuoteSymbol>"</QuoteSymbol>
      {isAdmin && (
        <AdminButton
          onClick={handlePickNewQuote}
          disabled={refreshing}
          title="Pick new quote"
        >
          {refreshing ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            <RefreshIcon fontSize="small" />
          )}
        </AdminButton>
      )}
      <QuoteText variant="h5">
        {quote.text}
      </QuoteText>
      <AuthorText variant="body1">
        {quote.author}
      </AuthorText>
    </QuoteContainer>
  );
};

export default QuoteOfTheDay;