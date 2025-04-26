import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { 
  Box, 
  IconButton, 
  TextField, 
  Typography, 
  Paper, 
  InputAdornment,
  Divider,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { 
  ArrowBackIos as PrevIcon, 
  ArrowForwardIos as NextIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Fullscreen as FullscreenIcon
} from '@mui/icons-material';

// Set up worker for react-pdf
// Using the local worker file from the public folder
pdfjs.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.js`;

export interface PDFViewerProps {
  pdfUrl: string;
  visiblePagePercentage?: number; // 0-1, percentage of page height to show initially
  containerHeight?: number; // Container height in pixels
  containerWidth?: number; // Container width in pixels
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  visiblePagePercentage = 1,
  containerHeight = 800,
  containerWidth = 600,
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate page height based on visible percentage
  const pageContainerHeight = containerHeight * visiblePagePercentage;

  // Function to handle document load success
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  // Function to handle document load error
  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF document. Please check if the URL is correct: '+ pdfUrl);
    setLoading(false);
  };

  // Functions to navigate between pages
  const goToPrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const goToNextPage = () => {
    if (pageNumber < (numPages || 1)) {
      setPageNumber(pageNumber + 1);
    }
  };

  // Function to handle manual page number input
  const handlePageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value);
    if (page && page > 0 && page <= (numPages || 1)) {
      setPageNumber(page);
    }
  };

  // Functions to zoom in and out
  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.2, 3));
  };

  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
  };

  // Reset zoom to default
  const resetZoom = () => {
    setScale(1);
  };

  // Scroll to top of container when page changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [pageNumber]);

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        width: containerWidth, 
        borderRadius: 2,
        overflow: 'hidden',
        backgroundColor: '#f8f9fa',
      }}
    >
      {/* PDF Controls */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: 2,
          backgroundColor: '#fff',
          borderBottom: '1px solid #eaeaea',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Previous page">
            <IconButton 
              onClick={goToPrevPage} 
              disabled={pageNumber <= 1}
              size="small"
              sx={{ color: '#1da1f2' }}
            >
              <PrevIcon />
            </IconButton>
          </Tooltip>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mx: 1 }}>
            <TextField
              variant="outlined"
              size="small"
              value={pageNumber}
              onChange={handlePageChange}
              sx={{ 
                width: 65, 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography variant="body2" color="text.secondary">
                      /{numPages || '?'}
                    </Typography>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          
          <Tooltip title="Next page">
            <IconButton 
              onClick={goToNextPage} 
              disabled={!numPages || pageNumber >= numPages}
              size="small"
              sx={{ color: '#1da1f2' }}
            >
              <NextIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Zoom out">
            <IconButton 
              onClick={zoomOut} 
              disabled={scale <= 0.5}
              size="small"
              sx={{ color: '#536471' }}
            >
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Reset zoom">
            <Typography 
              variant="body2" 
              sx={{ 
                cursor: 'pointer', 
                mx: 1, 
                color: '#536471',
                fontWeight: 'medium',
                '&:hover': { textDecoration: 'underline' }
              }}
              onClick={resetZoom}
            >
              {Math.round(scale * 100)}%
            </Typography>
          </Tooltip>
          
          <Tooltip title="Zoom in">
            <IconButton 
              onClick={zoomIn} 
              disabled={scale >= 3}
              size="small"
              sx={{ color: '#536471' }}
            >
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
          
          <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 24 }} />
          
          <Tooltip title="Fullscreen">
            <IconButton 
              size="small"
              sx={{ color: '#536471' }}
            >
              <FullscreenIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* PDF Document Container */}
      <Box 
        ref={containerRef}
        sx={{ 
          height: pageContainerHeight, 
          overflowY: 'auto',
          display: 'flex',
          justifyContent: 'center',
          padding: 2,
          backgroundColor: '#f8f9fa',
        }}
      >
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress size={40} sx={{ color: '#1da1f2' }} />
          </Box>
        )}
        
        {error && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}
        
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={null}
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderAnnotationLayer={false}
            renderTextLayer={false}
            loading={null}
            width={containerWidth - 64} // Subtract padding
          />
        </Document>
      </Box>
    </Paper>
  );
};

export default PDFViewer;