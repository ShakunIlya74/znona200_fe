import React, { useState, useRef, useCallback } from 'react';
import {
    Box,
    Paper,
    Typography,
    IconButton,
    Tooltip,
    useTheme,
    alpha
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import {
    Description as TextIcon,
    InsertDriveFile as FileIcon,
    VideoFile as VideoIcon,
    PictureAsPdf as PdfIcon,
    AudioFile as AudioIcon,
    Image as ImageIcon
} from '@mui/icons-material';

export interface FolderContentItem {
    title: string;
    url: string;
    position?: number;
    is_selected?: boolean;
    card_id?: string;
    card_sha?: string;
    type?: 'text' | 'file' | 'video' | 'pdf' | 'audio' | 'image';
}

interface FolderContentDrawerProps {
    items: FolderContentItem[];
    onItemClick?: (item: FolderContentItem) => void;
    onUrlClick?: (url: string) => void;
    isMobile?: boolean;
}

const FolderContentDrawer: React.FC<FolderContentDrawerProps> = ({ items, onItemClick, onUrlClick, isMobile = false }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const theme = useTheme();
    const navigate = useNavigate();
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const getIcon = (type?: string) => {
        switch (type) {
            case 'video':
                return <VideoIcon />;
            case 'pdf':
                return <PdfIcon />;
            case 'audio':
                return <AudioIcon />;
            case 'image':
                return <ImageIcon />;
            case 'file':
                return <FileIcon />;
            default:
                return <TextIcon />;
        }
    };    
    const handleItemClick = (item: FolderContentItem) => {
        if (onItemClick) {
            onItemClick(item);
        } else if (onUrlClick && item.url) {
            onUrlClick(item.url);
        } else if (item.url) {
            // Try to navigate using React Router if it's an internal URL
            try {
                const url = new URL(item.url);
                // If it's an external URL (different origin), open in new tab
                if (url.origin !== window.location.origin) {
                    window.open(item.url, '_blank');
                } else {
                    // If it's an internal URL, navigate using React Router
                    navigate(url.pathname + url.search + url.hash);
                }
            } catch (error) {
                // If URL constructor fails, treat as relative path and navigate
                navigate(item.url);
            }
        }
    };    const handleMouseEnter = useCallback(() => {
        if (isMobile) return; // Disable hover behavior on mobile
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
        setIsHovered(true);
    }, [isMobile]);

    const handleMouseLeave = useCallback((e: React.MouseEvent) => {
        if (isMobile) return; // Disable hover behavior on mobile
        // Check if the mouse is still within the extended hover area
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const buffer = 30; // Extended buffer zone
            
            const isWithinBounds = 
                e.clientX >= rect.left - buffer &&
                e.clientX <= rect.right + buffer &&
                e.clientY >= rect.top - buffer &&
                e.clientY <= rect.bottom + buffer;
            
            if (isWithinBounds) {
                return; // Don't close if still within bounds
            }
        }
        
        // Add a small delay before closing to prevent flickering
        hoverTimeoutRef.current = setTimeout(() => {
            setIsHovered(false);
        }, 100);
    }, [isMobile]);

    const handleToggle = () => {
        if (isMobile) {
            setIsExpanded(!isExpanded);
        }
    };

    const sortedItems = [...items].sort((a, b) => (a.position || 0) - (b.position || 0));

    // Determine if drawer should be shown as expanded
    const shouldShowExpanded = isMobile ? isExpanded : isHovered;
      // Mobile positioning and sizing
    const mobileStyles = isMobile ? {
        position: 'fixed' as const,
        bottom: '16px',
        right: '16px',
        transform: 'none',
        width: shouldShowExpanded ? '280px' : '48px',
        maxHeight: shouldShowExpanded ? '60vh' : '48px',
        zIndex: 1300, // Higher z-index for mobile
    } : {
        position: 'fixed' as const,
        right: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        width: shouldShowExpanded ? '320px' : '56px',
        maxHeight: '80vh',
        zIndex: 1200,
    };

    return (        <Box
            ref={containerRef}
            sx={{
                ...mobileStyles,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'visible',
                // Extended invisible hover area (desktop only)
                ...(!isMobile && {
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '-30px',
                        left: '-30px',
                        right: '-30px',
                        bottom: '-30px',
                        zIndex: -1,
                        pointerEvents: 'auto'
                    },
                }),
                // Ensure the component itself captures all pointer events
                pointerEvents: 'auto'
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={(e) => {
                // Keep drawer open if mouse is moving within the component (desktop only)
                if (!isMobile && !isHovered) {
                    handleMouseEnter();
                }
            }}
            onClick={isMobile ? handleToggle : undefined}
        >            <Paper
                elevation={8}
                sx={{
                    height: '100%',
                    borderRadius: isMobile ? '12px' : '16px 0 0 16px',
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                    borderRight: isMobile ? `1px solid ${alpha(theme.palette.grey[300], 0.5)}` : 'none',
                    boxShadow: `0px 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative'
                }}
            >                {/* Invisible hover extension on the left side (desktop only) */}
                {!isMobile && (
                    <Box
                        sx={{
                            position: 'absolute',
                            left: '-20px',
                            top: 0,
                            bottom: 0,
                            width: '20px',
                            zIndex: 1,
                            pointerEvents: 'auto'
                        }}
                    />
                )}

                {/* Header */}
                <Box
                    sx={{
                        p: isMobile ? 1 : 2,
                        borderBottom: shouldShowExpanded ? `1px solid ${alpha(theme.palette.grey[300], 0.3)}` : 'none',
                        backgroundColor: alpha(theme.palette.primary.main, 0.02),
                        opacity: shouldShowExpanded ? 1 : 0,
                        transition: 'opacity 0.3s ease',
                        minHeight: shouldShowExpanded ? 'auto' : 0,
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isMobile ? 'space-between' : 'flex-start'
                    }}
                >
                    <Typography
                        variant={isMobile ? "subtitle1" : "h6"}
                        sx={{
                            fontWeight: 600,
                            color: theme.palette.primary.main,
                            fontSize: isMobile ? '0.875rem' : '1rem'
                        }}
                    >
                        Матеріали
                    </Typography>
                    {isMobile && (
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleToggle();
                            }}
                            sx={{
                                color: theme.palette.primary.main,
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1)
                                }
                            }}
                        >
                            {isExpanded ? '▲' : '▼'}
                        </IconButton>
                    )}
                </Box>                {/* Content List */}
                <Box
                    sx={{
                        flex: 1,
                        overflow: shouldShowExpanded && sortedItems.length > 7 ? 'auto' : 'visible',
                        py: isMobile ? 0.5 : 1,
                        display: isMobile && !shouldShowExpanded ? 'none' : 'block', // Only hide on mobile when collapsed
                        maxHeight: shouldShowExpanded ? 
                            (isMobile ? 'calc(7 * 60px)' : 'calc(7 * 70px)') : 
                            (isMobile ? 'calc(7 * 60px)' : 'calc(7 * 70px)'),
                        // Custom thin scrollbar - only show when expanded
                        ...(shouldShowExpanded && {
                            '&::-webkit-scrollbar': {
                                width: '2px'
                            },
                            '&::-webkit-scrollbar-track': {
                                background: 'transparent'
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: alpha(theme.palette.grey[400], 0.3),
                                borderRadius: '1px',
                                '&:hover': {
                                    background: alpha(theme.palette.grey[400], 0.5)
                                }
                            },
                            // Firefox scrollbar styling
                            scrollbarWidth: 'thin',
                            scrollbarColor: `${alpha(theme.palette.grey[400], 0.3)} transparent`
                        })
                    }}
                >
                    {sortedItems.map((item, index) => (
                        <Box
                            key={item.card_id || item.card_sha || index}
                            sx={{
                                px: isMobile ? 1 : (shouldShowExpanded ? 2 : 1),
                                py: isMobile ? 0.25 : 0.5,
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Paper
                                elevation={0}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    p: isMobile ? 0.75 : (shouldShowExpanded ? 1.5 : 1),
                                    borderRadius: isMobile ? '8px' : '12px',
                                    cursor: 'pointer',
                                    backgroundColor: item.is_selected
                                        ? alpha(theme.palette.primary.main, 0.08)
                                        : 'transparent',
                                    border: item.is_selected
                                        ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                                        : `1px solid transparent`,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: item.is_selected
                                            ? alpha(theme.palette.primary.main, 0.12)
                                            : alpha(theme.palette.grey[100], 0.8),
                                        transform: isMobile ? 'none' : 'translateX(-2px)',
                                        boxShadow: `0px 4px 12px ${alpha(theme.palette.common.black, 0.08)}`
                                    }
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleItemClick(item);
                                }}
                            >                                {/* Icon */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        // width: isMobile ? '24px' : '28px',
                                        // height: isMobile ? '24px' : '28px',
                                        minWidth: isMobile ? '20px' : '24px',
                                        // minHeight: isMobile ? '24px' : '28px',
                                        // flexShrink: 0,
                                        color: item.is_selected
                                            ? theme.palette.primary.main
                                            : theme.palette.text.secondary,
                                        '& svg': {
                                            fontSize: isMobile ? '18px' : '20px'
                                        }
                                    }}
                                >
                                    {(shouldShowExpanded || (!isMobile && !shouldShowExpanded)) ? (
                                        // Show icon directly when expanded or on desktop when collapsed
                                        shouldShowExpanded ? (
                                            getIcon(item.type)
                                        ) : (
                                            // Desktop collapsed state - show icon with tooltip
                                            <Tooltip
                                                title={item.title}
                                                placement="left"
                                                arrow
                                                PopperProps={{
                                                    sx: {
                                                        '& .MuiTooltip-tooltip': {
                                                            backgroundColor: theme.palette.grey[800],
                                                            fontSize: '0.75rem',
                                                            maxWidth: '200px'
                                                        }
                                                    }
                                                }}
                                            >
                                                <Box>
                                                    {getIcon(item.type)}
                                                </Box>
                                            </Tooltip>
                                        )
                                    ) : (
                                        // This case shouldn't occur but keeping for safety
                                        getIcon(item.type)
                                    )}
                                </Box>

                                {/* Title */}
                                <Box
                                    sx={{
                                        ml: isMobile ? 1.5 : 2,
                                        flex: 1,
                                        opacity: shouldShowExpanded ? 1 : 0,
                                        transform: shouldShowExpanded ? 'translateX(0)' : 'translateX(-10px)',
                                        transition: 'all 0.3s ease',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: item.is_selected ? 600 : 400,
                                            color: item.is_selected
                                                ? theme.palette.primary.main
                                                : theme.palette.text.primary,
                                            fontSize: isMobile ? '0.8125rem' : '0.875rem',
                                            lineHeight: 1.4,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {item.title}
                                    </Typography>
                                </Box>
                            </Paper>
                        </Box>
                    ))}
                </Box>                {/* Footer indicator */}
                {!isMobile && (
                    <Box
                        sx={{
                            p: 1,
                            display: 'flex',
                            justifyContent: 'center',
                            borderTop: `1px solid ${alpha(theme.palette.grey[300], 0.3)}`,
                            backgroundColor: alpha(theme.palette.grey[50], 0.5)
                        }}
                    >
                        <Box
                            sx={{
                                width: shouldShowExpanded ? '40px' : '20px',
                                height: '3px',
                                borderRadius: '2px',
                                backgroundColor: alpha(theme.palette.primary.main, 0.3),
                                transition: 'all 0.3s ease'
                            }}
                        />
                    </Box>
                )}                {/* Mobile toggle button when collapsed */}
                {isMobile && !isExpanded && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            borderRadius: '12px',
                            backgroundColor: alpha(theme.palette.background.paper, 0.95)
                        }}
                        onClick={handleToggle}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: theme.palette.primary.main,
                                fontSize: '1.5rem',
                                fontWeight: 'bold'
                            }}
                        >
                            ☰
                        </Box>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default FolderContentDrawer;