import React, { useState, useCallback } from 'react';
import ImageGallery, { ReactImageGalleryItem } from 'react-image-gallery';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Chip,
  useTheme,
  useMediaQuery,
  Card,
  CardMedia,
  Skeleton,
  Button,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  ZoomIn as ZoomInIcon,
  Download as DownloadIcon,
  Error as ErrorIcon,
  AttachFile as AttachFileIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import 'react-image-gallery/styles/css/image-gallery.css';
import './ImageViewer.css';

export interface ImageViewerProps {
  /** Array of image paths from Flask share directory */
  imagePaths: string[];
  /** Maximum width for images in pixels or percentage */
  maxWidth?: number | string;
  /** Maximum height for images in pixels */
  maxHeight?: number;
  /** Show thumbnails in gallery mode */
  showThumbnails?: boolean;
  /** Enable fullscreen mode */
  enableFullscreen?: boolean;
  /** Enable image download */
  enableDownload?: boolean;
  /** Custom title for the viewer */
  title?: string;
  /** Show as grid instead of gallery */
  gridMode?: boolean;
  /** Number of columns in grid mode */
  gridColumns?: number;
  /** Base URL for Flask share directory */
  baseUrl?: string;
  /** Allow adding new images with drop zone and file browser */
  allowAdding?: boolean;
  /** Callback when files are selected for adding */
  onFilesSelected?: (files: FileList) => void;
}

interface ImageItemProps {
  src: string;
  alt: string;
  maxWidth?: number | string;
  maxHeight?: number;
  onClick?: () => void;
}

const ImageItem: React.FC<ImageItemProps> = ({
  src,
  alt,
  maxWidth = '100%',
  maxHeight,
  onClick
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  console.log('ImageItem rendered with src:', src);

  const handleImageLoad = useCallback(() => {
    setLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);
  if (error) {
    return (
      <Card
        sx={{
          maxWidth,
          ...(maxHeight && { maxHeight }),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: maxHeight || 200,
          cursor: 'pointer'
        }}
        onClick={onClick}
      >
        <Box sx={{ textAlign: 'center', p: 2 }}>
          <ErrorIcon sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />
          <Typography variant="body2" color="error">
            Failed to load image
          </Typography>
        </Box>
      </Card>
    );
  }
  return (
    <Box sx={{ 
      position: 'relative', 
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%'
    }}>
      {loading && (
        <Skeleton
          variant="rectangular"
          width={maxWidth}
          height={maxHeight || 200}
          sx={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
        />
      )}
      <CardMedia
        component="img"
        src={src}
        alt={alt}
        onLoad={handleImageLoad}
        onError={handleImageError}
        sx={{
          maxWidth,
          ...(maxHeight && { maxHeight }),
          width: typeof maxWidth === 'string' ? maxWidth : 'auto',
          height: 'auto',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'transform 0.2s ease-in-out',
          display: 'block',
          '&:hover': onClick ? {
            transform: 'scale(1.02)',
          } : {}
        }}
        onClick={onClick}
      />
    </Box>
  );
};

const ImageViewer: React.FC<ImageViewerProps> = ({
  imagePaths = [],
  maxWidth = '100%',
  maxHeight,
  showThumbnails = true,
  enableFullscreen = true,
  enableDownload = false,
  title,
  gridMode = true,
  gridColumns = 3,
  baseUrl = '',
  allowAdding = false,
  onFilesSelected
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  // Adjust grid columns based on screen size
  const responsiveColumns = isSmall ? 1 : isMobile ? 2 : gridColumns;

  // Prepare images for react-image-gallery
  const galleryImages: ReactImageGalleryItem[] = imagePaths.map((path, index) => {
    const fullPath = baseUrl ? `${baseUrl}/${path}` : path;
    return {
      original: fullPath,
      thumbnail: fullPath,
      originalAlt: `Image ${index + 1}`,
      thumbnailAlt: `Thumbnail ${index + 1}`,
    };
  });

  const handleImageClick = useCallback((index: number) => {
    if (enableFullscreen) {
      setSelectedImageIndex(index);
      setGalleryOpen(true);
    }
  }, [enableFullscreen]);

  const handleCloseGallery = useCallback(() => {
    setGalleryOpen(false);
    setSelectedImageIndex(null);
  }, []);
  const handleDownload = useCallback((imagePath: string, index: number) => {
    const link = document.createElement('a');
    link.href = baseUrl ? `${baseUrl}/${imagePath}` : imagePath;
    link.download = `image_${index + 1}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [baseUrl]);

  const handleFileSelect = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*';
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && onFilesSelected) {
        onFilesSelected(files);
      }
    };
    input.click();
  }, [onFilesSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && onFilesSelected) {
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const renderAddImageZone = () => {
    if (!allowAdding) return null;
    
    return (
      <Paper
        elevation={dragOver ? 4 : 1}
        sx={{
          p: 2,
          mb: 2,
          border: `2px dashed ${dragOver ? theme.palette.primary.main : theme.palette.divider}`,
          backgroundColor: dragOver ? theme.palette.action.hover : 'transparent',
          transition: 'all 0.2s ease-in-out',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
            borderColor: theme.palette.primary.main,
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleFileSelect}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: 2,
          minHeight: 60
        }}>
          <CloudUploadIcon color="primary" />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body1" color="primary">
              Drop images here or click to browse
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supports multiple image files
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<AttachFileIcon />}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleFileSelect();
            }}
          >
            Browse
          </Button>
        </Box>
      </Paper>
    );
  };
  if (!imagePaths || imagePaths.length === 0) {
    if (allowAdding) {
      return (
        <Box sx={{ width: '100%' }}>
          {title && (
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6">{title}</Typography>
              <Chip 
                label="0 images" 
                size="small" 
                variant="outlined"
              />
            </Box>
          )}
          {renderAddImageZone()}
        </Box>
      );
    }
    return null;
  }if (gridMode) {
    return (
      <Box sx={{ width: '100%' }}>
        {title && (
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">{title}</Typography>
            <Chip 
              label={`${imagePaths.length} image${imagePaths.length !== 1 ? 's' : ''}`} 
              size="small" 
              variant="outlined"
            />
          </Box>
        )}
        
        {renderAddImageZone()}
        
          <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: imagePaths.length > 1 ? 'column' : 'row',
            gap: 2,
            width: '100%',
            alignItems: 'center'
          }}
        >
          {imagePaths.map((path, index) => {
            const fullPath = baseUrl ? `${baseUrl}/${path}` : path;
            return (
              <Box 
                key={index}
                sx={{ 
                  width: '100%',
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >                <ImageItem
                  src={fullPath}
                  alt={`Image ${index + 1}`}
                  maxWidth={maxWidth}
                  maxHeight={maxHeight}
                  onClick={() => handleImageClick(index)}
                />
                
                {enableDownload && (
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(path, index);
                    }}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                )}
                
                {enableFullscreen && (
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      }
                    }}
                    onClick={() => handleImageClick(index)}
                  >
                    <ZoomInIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            );
          })}
        </Box>

        {/* Fullscreen Gallery Dialog */}
        {enableFullscreen && (
          <Dialog
            open={galleryOpen}
            onClose={handleCloseGallery}
            maxWidth={false}
            fullWidth
            PaperProps={{
              sx: {
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                maxWidth: '95vw',
                maxHeight: '95vh',
              }
            }}
          >
            <DialogTitle sx={{ 
              color: 'white', 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              pb: 1
            }}>
              <Typography variant="h6">
                {title || 'Image Gallery'} ({selectedImageIndex !== null ? selectedImageIndex + 1 : 1} of {imagePaths.length})
              </Typography>
              <IconButton
                onClick={handleCloseGallery}
                sx={{ color: 'white' }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ p: 0 }}>
              <ImageGallery
                items={galleryImages}
                showThumbnails={showThumbnails && !isMobile}
                showFullscreenButton={false}
                showPlayButton={false}
                startIndex={selectedImageIndex || 0}
                thumbnailPosition={isMobile ? 'bottom' : 'bottom'}
                showNav={galleryImages.length > 1}
                additionalClass="custom-image-gallery"
                renderCustomControls={() => (
                  enableDownload && selectedImageIndex !== null ? (
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 50,
                        color: 'white',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        }
                      }}
                      onClick={() => handleDownload(imagePaths[selectedImageIndex], selectedImageIndex)}
                    >
                      <DownloadIcon />
                    </IconButton>
                  ) : null
                )}
              />
            </DialogContent>
          </Dialog>
        )}
      </Box>
    );
  }
  // Single image gallery mode
  return (
    <Box>
      {title && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">{title}</Typography>
          <Chip 
            label={`${imagePaths.length} image${imagePaths.length !== 1 ? 's' : ''}`} 
            size="small" 
            variant="outlined"
          />
        </Box>
      )}
      
      {renderAddImageZone()}
      
      <Box sx={{ 
        '& .image-gallery': {
          maxWidth: maxWidth,
          margin: '0 auto'
        },
        '& .image-gallery-slide img': {
          maxHeight: maxHeight,
          objectFit: 'contain'
        }
      }}>
        <ImageGallery
          items={galleryImages}
          showThumbnails={showThumbnails}
          showFullscreenButton={enableFullscreen}
          showPlayButton={false}
          thumbnailPosition="bottom"
          showNav={galleryImages.length > 1}
          renderCustomControls={() => (
            enableDownload ? (
              <IconButton
                sx={{
                  position: 'absolute',
                  top: 10,
                  right: enableFullscreen ? 50 : 10,
                  color: 'white',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  }
                }}
                onClick={() => {
                  const currentIndex = 0; // You'd need to track current index
                  handleDownload(imagePaths[currentIndex], currentIndex);
                }}
              >
                <DownloadIcon />
              </IconButton>
            ) : null
          )}
        />
      </Box>
    </Box>
  );
};

export default ImageViewer;
