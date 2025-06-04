import React, { useState, useCallback } from 'react';
import ImageGallery, { ReactImageGalleryItem } from 'react-image-gallery';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
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
import { UploadedImage } from '../interfaces';

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
  gridColumns?: number;  /** Base URL for Flask share directory */
  baseUrl?: string;
  /** Allow editing images (adding new and removing existing) */
  allowEditing?: boolean;
  /** Callback when files are selected for adding */
  onFilesSelected?: (files: FileList) => void;
  /** Array of uploaded images for preview */
  uploadedImages?: UploadedImage[];
  /** Callback when an uploaded image is removed */
  onUploadedImageRemove?: (imageId: string) => void;
  /** Callback when an existing image is removed */
  onExistingImageRemove?: (imagePath: string) => void;
}

interface ImageItemProps {
  src: string;
  alt: string;
  maxWidth?: number | string;
  maxHeight?: number;
  onClick?: () => void;
  onRemove?: () => void;
  allowEditing?: boolean;
}

const ImageItem: React.FC<ImageItemProps> = ({
  src,
  alt,
  maxWidth = '100%',
  maxHeight,
  onClick,
  onRemove,
  allowEditing = false
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
//   console.log('ImageItem rendered with src:', src);

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
          <ErrorIcon sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />          <Typography variant="body2" color="error">
            Не вдалося завантажити зображення
          </Typography>
        </Box>
      </Card>
    );
  }  return (
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
        {/* Remove button */}
      {allowEditing && onRemove && (
        <IconButton
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: 'error.main',
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
            }
          }}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
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
  allowEditing = false,
  onFilesSelected,
  uploadedImages = [],
  onUploadedImageRemove,
  onExistingImageRemove
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [imageToRemove, setImageToRemove] = useState<{
    type: 'uploaded' | 'existing';
    id?: string;
    path?: string;
    alt: string;
  } | null>(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  // Adjust grid columns based on screen size
  const responsiveColumns = isSmall ? 1 : isMobile ? 2 : gridColumns;

  // Combine existing image paths and uploaded images for display
  const allImages = [
    ...imagePaths.map((path, index) => ({
      type: 'existing' as const,
      src: baseUrl ? `${baseUrl}/${path}` : path,
      alt: `Зображення ${index + 1}`,
      index,
      originalPath: path
    })),
    ...uploadedImages.map((uploadedImage, index) => ({
      type: 'uploaded' as const,
      src: uploadedImage.preview,
      alt: uploadedImage.name,
      index: imagePaths.length + index,
      uploadedImage
    }))
  ];

  const totalImageCount = allImages.length;

  // Prepare images for react-image-gallery
  const galleryImages: ReactImageGalleryItem[] = allImages.map((img) => ({
    original: img.src,
    thumbnail: img.src,
    originalAlt: img.alt,
    thumbnailAlt: img.alt,
  }));

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

  // Handle confirmation dialog
  const handleRemoveClick = useCallback((type: 'uploaded' | 'existing', id?: string, path?: string, alt?: string) => {
    setImageToRemove({ type, id, path, alt: alt || 'Зображення' });
    setConfirmDialogOpen(true);
  }, []);

  const handleConfirmRemove = useCallback(() => {
    if (!imageToRemove) return;
    
    if (imageToRemove.type === 'uploaded' && imageToRemove.id && onUploadedImageRemove) {
      onUploadedImageRemove(imageToRemove.id);
    } else if (imageToRemove.type === 'existing' && imageToRemove.path && onExistingImageRemove) {
      onExistingImageRemove(imageToRemove.path);
    }
    
    setConfirmDialogOpen(false);
    setImageToRemove(null);
  }, [imageToRemove, onUploadedImageRemove, onExistingImageRemove]);

  const handleCancelRemove = useCallback(() => {
    setConfirmDialogOpen(false);
    setImageToRemove(null);
  }, []);

  // Handle removal of uploaded images
  const handleRemoveUploadedImage = useCallback((imageId: string) => {
    if (onUploadedImageRemove) {
      onUploadedImageRemove(imageId);
    }
  }, [onUploadedImageRemove]);

  // Handle removal of existing images  
  const handleRemoveExistingImage = useCallback((imagePath: string) => {
    if (onExistingImageRemove) {
      onExistingImageRemove(imagePath);
    }
  }, [onExistingImageRemove]);

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
    if (!allowEditing) return null;
    
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
          <CloudUploadIcon color="primary" />          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body1" color="primary">
              Перетягніть зображення сюди або натисніть для вибору
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Підтримуються файли зображень
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<AttachFileIcon />}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleFileSelect();
            }}          >
            Огляд
          </Button>
        </Box>
      </Paper>
    );
  };  // Show empty state with upload zone if no images and allowEditing is true
  if (totalImageCount === 0) {
    if (allowEditing) {
      return (
        <Box sx={{ width: '100%' }}>
          {title && (
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6">{title}</Typography>              <Chip 
                label="0 зображень" 
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
  }  if (gridMode) {
    return (
      <Box sx={{ width: '100%' }}>
        {title && (
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">{title}</Typography>
            <Chip 
              label={`${totalImageCount} image${totalImageCount !== 1 ? 's' : ''}`} 
              size="small" 
              variant="outlined"
            />
          </Box>        )}
        
        {renderAddImageZone()}
        
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: totalImageCount > 1 ? 'column' : 'row',
            gap: 2,
            width: '100%',
            alignItems: 'center'
          }}
        >
          {allImages.map((img, index) => (
            <Box 
              key={`${img.type}-${index}`}
              sx={{ 
                width: '100%',
                position: 'relative',
                display: 'flex',
                justifyContent: 'center'
              }}
            >              <ImageItem
                src={img.src}
                alt={img.alt}
                maxWidth={maxWidth}
                maxHeight={maxHeight}
                onClick={() => handleImageClick(index)}
                allowEditing={allowEditing}
                onRemove={img.type === 'uploaded' 
                  ? () => handleRemoveClick('uploaded', img.uploadedImage!.id, undefined, img.alt)
                  : () => handleRemoveClick('existing', undefined, img.originalPath!, img.alt)
                }
              />
              
              {enableDownload && img.type === 'existing' && (
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(img.originalPath!, index);
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
                    left: 8,
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
          ))}
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
          >            <DialogTitle sx={{ 
              color: 'white', 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              pb: 1
            }}>              <Typography variant="h6">
                {title || 'Галерея зображень'} ({selectedImageIndex !== null ? selectedImageIndex + 1 : 1} з {totalImageCount})
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
                additionalClass="custom-image-gallery"                renderCustomControls={() => (
                  enableDownload && selectedImageIndex !== null && allImages[selectedImageIndex]?.type === 'existing' ? (
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
                      onClick={() => {
                        const img = allImages[selectedImageIndex];
                        if (img.type === 'existing') {
                          handleDownload(img.originalPath!, selectedImageIndex);
                        }
                      }}
                    >
                      <DownloadIcon />
                    </IconButton>
                  ) : null
                )}
              />
            </DialogContent>          </Dialog>
        )}        {/* Confirmation Dialog for Image Removal */}
        <Dialog
          open={confirmDialogOpen}
          onClose={handleCancelRemove}
          aria-labelledby="confirm-delete-dialog-title"
          aria-describedby="confirm-delete-dialog-description"
        >
          <DialogTitle id="confirm-delete-dialog-title">
            Підтвердження видалення зображення
          </DialogTitle>
          <DialogContent>
            <Typography id="confirm-delete-dialog-description">
              Ви впевнені, що хочете видалити "{imageToRemove?.alt}"? <br />
              <strong>Після збереження тесту</strong> цю дію буде неможливо скасувати.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelRemove} color="primary">
              Скасувати
            </Button>
            <Button onClick={handleConfirmRemove} color="error" variant="contained">
              Видалити
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }  // Single image gallery mode
  return (
    <Box>      {title && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">{title}</Typography>
          <Chip 
            label={`${totalImageCount} ${totalImageCount === 1 ? 'зображення' : totalImageCount < 5 ? 'зображення' : 'зображень'}`} 
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
                  const img = allImages[currentIndex];
                  if (img?.type === 'existing') {
                    handleDownload(img.originalPath!, currentIndex);
                  }
                }}
              >
                <DownloadIcon />
              </IconButton>
            ) : null
          )}        />
      </Box>      {/* Confirmation Dialog for Image Removal */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelRemove}
        aria-labelledby="confirm-delete-dialog-title"
        aria-describedby="confirm-delete-dialog-description"
      >
        <DialogTitle id="confirm-delete-dialog-title">
          Підтвердження видалення зображення
        </DialogTitle>
        <DialogContent>
          <Typography id="confirm-delete-dialog-description">
            Ви впевнені, що хочете видалити "{imageToRemove?.alt}"? <br />
            <strong>Після збереження тесту</strong> цю дію буде неможливо скасувати.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelRemove} color="primary">
            Скасувати
          </Button>
          <Button onClick={handleConfirmRemove} color="error" variant="contained">
            Видалити
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImageViewer;
