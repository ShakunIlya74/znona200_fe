import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    IconButton,
    Tooltip,
    useTheme,
    alpha
} from '@mui/material';
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
}

const FolderContentDrawer: React.FC<FolderContentDrawerProps> = ({ items, onItemClick }) => {
    const [isHovered, setIsHovered] = useState(false);
    const theme = useTheme();

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
        } else if (item.url) {
            window.open(item.url, '_blank');
        }
    };

    const sortedItems = [...items].sort((a, b) => (a.position || 0) - (b.position || 0));    return (
        <Box
            sx={{
                position: 'fixed',
                right: '-10px', // Move slightly off-screen to account for border
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1200,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                width: isHovered ? '330px' : '66px', // Slightly wider to accommodate positioning
                maxHeight: '80vh',
                overflow: 'visible', // Allow content to be visible
                // Create a larger invisible hover area using pseudo-element
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '-20px',
                    left: '-20px',
                    right: '-20px',
                    bottom: '-20px',
                    zIndex: -1
                }
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >            <Paper
                elevation={8}
                sx={{
                    height: '100%',
                    borderRadius: isHovered ? '16px 0 0 16px' : '16px 0 0 16px',
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                    borderRight: 'none',
                    boxShadow: `0px 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    // Position the paper to show properly on screen
                    marginRight: '10px' // Pull back from the edge
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        p: 2,
                        borderBottom: `1px solid ${alpha(theme.palette.grey[300], 0.3)}`,
                        backgroundColor: alpha(theme.palette.primary.main, 0.02),
                        opacity: isHovered ? 1 : 0,
                        transition: 'opacity 0.3s ease',
                        minHeight: isHovered ? 'auto' : 0,
                        overflow: 'hidden'
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            color: theme.palette.primary.main,
                            fontSize: '1rem'
                        }}
                    >
                        Матеріали
                    </Typography>
                </Box>

                {/* Content List */}
                <Box
                    sx={{
                        flex: 1,
                        overflow: 'auto',
                        py: 1,
                        '&::-webkit-scrollbar': {
                            width: '4px'
                        },
                        '&::-webkit-scrollbar-track': {
                            background: 'transparent'
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: alpha(theme.palette.grey[400], 0.5),
                            borderRadius: '2px'
                        }
                    }}
                >
                    {sortedItems.map((item, index) => (
                        <Box
                            key={item.card_id || item.card_sha || index}
                            sx={{
                                px: isHovered ? 2 : 1,
                                py: 0.5,
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Paper
                                elevation={0}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    p: isHovered ? 1.5 : 1,
                                    borderRadius: '12px',
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
                                        transform: 'translateX(-2px)',
                                        boxShadow: `0px 4px 12px ${alpha(theme.palette.common.black, 0.08)}`
                                    }
                                }}
                                onClick={() => handleItemClick(item)}
                            >
                                {/* Icon */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minWidth: '24px',
                                        color: item.is_selected
                                            ? theme.palette.primary.main
                                            : theme.palette.text.secondary
                                    }}
                                >
                                    {isHovered ? (
                                        getIcon(item.type)
                                    ) : (
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
                                    )}
                                </Box>

                                {/* Title */}
                                <Box
                                    sx={{
                                        ml: 2,
                                        flex: 1,
                                        opacity: isHovered ? 1 : 0,
                                        transform: isHovered ? 'translateX(0)' : 'translateX(-10px)',
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
                                            fontSize: '0.875rem',
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
                </Box>

                {/* Footer indicator */}
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
                            width: isHovered ? '40px' : '20px',
                            height: '3px',
                            borderRadius: '2px',
                            backgroundColor: alpha(theme.palette.primary.main, 0.3),
                            transition: 'all 0.3s ease'
                        }}
                    />
                </Box>
            </Paper>
        </Box>
    );
};

export default FolderContentDrawer;