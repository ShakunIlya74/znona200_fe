import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { 
  Box, 
  Button,
  IconButton, 
  TextField, 
  Typography, 
  Paper, 
  InputAdornment,
  Divider,
  CircularProgress,
  Tooltip,
  useTheme,
  alpha,
  useMediaQuery
} from '@mui/material';
import { 
  ArrowBackIos as PrevIcon, 
  ArrowForwardIos as NextIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RestartAlt as ResetZoomIcon,
} from '@mui/icons-material';
import { FileDownloadRounded as DownloadIcon } from '@mui/icons-material';


// Set up worker for react-pdf
// Using the local worker file from the public folder
pdfjs.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.js`;

export interface PDFViewerProps {
  pdfUrl: string;
  visiblePagePercentage?: number; // 0-1, percentage of page height to show initially
  containerHeight?: number; // Container height in pixels
  containerWidthPercentage?: number; // Container width as percentage of available space (0-100), overrides responsive widths if provided
  allowDownloading?: boolean; // Whether to show download button, true by default
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  visiblePagePercentage = 1,
  containerHeight = 800,
  containerWidthPercentage,
  allowDownloading = true,
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);  const [pageWidth, setPageWidth] = useState<number | null>(null);
  const [pageHeight, setPageHeight] = useState<number | null>(null);
  const [isPageHeightSet, setIsPageHeightSet] = useState<boolean>(false);
  const theme = useTheme();
  
  // Add responsive breakpoints
  const isXLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.up('md'));
    // Define responsive width (either percentage or fixed pixels)
  const getResponsiveWidth = () => {
    if (containerWidthPercentage) return `${containerWidthPercentage}%`; // Custom percentage takes precedence
    if (isXLargeScreen) return 1100; // xl screens
    if (isLargeScreen) return 900; // lg screens
    if (isMediumScreen) return 700; // md screens
    return 350; // xs screens
  };
    // Calculate responsive width
  const responsiveWidth = getResponsiveWidth();

  // Calculate dynamic container height based on actual page content
  const getContainerHeight = () => {
    if (!pageHeight) {
      // Fallback height while PDF is loading
      return Math.min(containerHeight * visiblePagePercentage, 600);
    }
    
    // Calculate scaled height based on the current scale
    const scaledHeight = pageHeight * scale;
    
    // Apply visible percentage
    const adjustedHeight = scaledHeight * visiblePagePercentage;
    
    // Add some padding and ensure minimum/maximum heights
    const finalHeight = Math.min(Math.max(adjustedHeight + 32, 200), containerHeight);
    
    return finalHeight;
  };

  const dynamicContainerHeight = getContainerHeight();
  // Update page width when container resizes or containerWidthPercentage prop changes
  useEffect(() => {
    const updatePageWidth = () => {
      if (containerRef.current) {
        const containerElement = containerRef.current.closest('[data-pdf-container]') as HTMLElement;
        let actualWidth;
        
        if (containerWidthPercentage) {
          // For percentage width, calculate based on the actual container width
          const containerRect = containerElement?.getBoundingClientRect();
          const availableWidth = containerRect?.width || containerRef.current.parentElement?.clientWidth || window.innerWidth;
          actualWidth = availableWidth - 64; // Subtract padding
        } else {
          // For fixed pixel width
          actualWidth = (typeof responsiveWidth === 'number' ? responsiveWidth : 1100) - 64; // Subtract padding
        }
        
        setPageWidth(actualWidth);
      }
    };
    
    updatePageWidth();
    
    // Add resize listener
    window.addEventListener('resize', updatePageWidth);
    
    // Clean up
    return () => window.removeEventListener('resize', updatePageWidth);
  }, [responsiveWidth, containerWidthPercentage]);  // Function to handle document load success
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    // Reset page height tracking when a new document loads
    setPageHeight(null);
    setIsPageHeightSet(false);
  };
  // Function to handle page render success to get page dimensions
  const onPageRenderSuccess = (page: any) => {
    // Only set page height once when first page is rendered
    if (!isPageHeightSet) {
      const { height } = page;
      setPageHeight(height);
      setIsPageHeightSet(true);
    }
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
  };  // Scroll to top of container when page changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [pageNumber]);
  // Reset page height only when scale changes (not when page changes)
  useEffect(() => {
    // Reset page height when zoom changes to allow container to adjust to new scaled size
    if (isPageHeightSet && scale !== 1) {
      setPageHeight(null);
      setIsPageHeightSet(false);
    }
  }, [scale, isPageHeightSet]);

  // Function to download PDF
  const downloadPDF = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (    <Paper 
      elevation={2} 
      data-pdf-container
      sx={{ 
        width: responsiveWidth, 
        maxWidth: '100%', // Ensures it doesn't overflow on small screens
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.paper,
        mx: 'auto', // Center the container
      }}
    >
      {/* PDF Controls */}      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: 2,
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ flex: 1 }} /> {/* Spacer for left side */}
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1
        }}>
            {/* Navigation Controls */}
            <Tooltip title="Попередня сторінка">
            <Button 
              onClick={goToPrevPage} 
              disabled={pageNumber <= 1}
              size="small"
              variant="text"
              sx={{ 
              minWidth: '40px',
              borderRadius: '8px', 
              py: 0.5,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.3),
              },
              }}
            >
              <PrevIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
            </Button>
            </Tooltip>
            
            {/* Page number display (non-editable) */}
            <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              mx: 1.5,
              backgroundColor: theme.palette.background.default,
              borderRadius: '8px',
              padding: '4px 12px',
              minWidth: numPages ? `${Math.max(50, String(numPages).length * 18 + 20)}px` : '40px',
            }}
            >
            <Typography 
              variant="body1" 
              sx={{ 
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              }}
            >
              <span>{pageNumber}</span>
              <span style={{ margin: '0 4px' }}>/</span>
              <span>{numPages || '?'}</span>
            </Typography>
            </Box>
            
            <Tooltip title="Наступна сторінка">
            <Button 
              onClick={goToNextPage} 
              disabled={!numPages || pageNumber >= numPages}
              size="small"
              variant="text"
              sx={{ 
              minWidth: '40px',
              borderRadius: '8px',
              py: 0.5,
              pl: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.3),
              },
              }}
            >
              <NextIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
            </Button>
            </Tooltip>
        </Box>

        {/* Download Button - Right side */}
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          {allowDownloading && (
            <Tooltip title="Завантажити PDF">
              <IconButton 
                onClick={downloadPDF}
                size="small"
                sx={{ 
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.3),
                  },
                }}
              >
                <DownloadIcon sx={{ color: theme.palette.primary.main }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
        {/* PDF Document Container */}
      <Box 
        ref={containerRef}
        sx={{ 
          height: dynamicContainerHeight, 
          overflowY: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: 2,
          backgroundColor: theme.palette.grey[50],
        }}
      >
        {error ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', px: 3 }}>
            <Typography color="error" align="center">{error}</Typography>
          </Box>
        ) : (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress size={40} sx={{ color: theme.palette.primary.main }} />
              </Box>
            }
          >            {numPages !== null && numPages > 0 && (
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                width={pageWidth || undefined} // Use calculated width or undefined
                onRenderSuccess={onPageRenderSuccess}
              />
            )}
          </Document>
        )}
      </Box>
    </Paper>
  );
};

export default PDFViewer;