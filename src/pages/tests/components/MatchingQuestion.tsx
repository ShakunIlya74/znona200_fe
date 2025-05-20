import React, { useEffect, useState, useRef, useCallback, memo } from 'react';
import {
  Box,
  Typography,
  Paper,
  useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { MatchingCategory, MatchingOption, MatchAnswer } from '../interfaces';

// dnd imports
import {
  DndContext,
  rectIntersection,
  pointerWithin,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  UniqueIdentifier,
  DragOverlay,
  useDroppable,
  useDndContext
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface MatchingQuestionProps {
  questionId: number;
  questionNumber: number;
  questionText: string;
  options: MatchingOption[];
  categories: MatchingCategory[];
  matches: MatchAnswer[];
  onMatchSelect: (questionId: number, optionId: number, categoryId: number) => void;
}

// Interface for the row height state
interface RowHeights {
  [rowIndex: number]: number;
}

// Custom droppable placeholder for the category items
const DroppablePlaceholder = memo(({
  id,
  children,
  hasItem = false,
  theme,
  rowIndex,
  updateRowHeight,
  rowHeight
}: {
  id: string;
  children: React.ReactNode;
  hasItem?: boolean;
  theme: any;
  rowIndex: number;
  updateRowHeight: (index: number, height: number) => void;
  rowHeight: number;
}) => {
  const { setNodeRef } = useDroppable({
    id
  });

  // grab the live "over" target from context
  const { over } = useDndContext();

  // normalize any matched-<optId>-<catId> into placeholder-<catId>
  const normalizedOverId = (() => {
    if (!over?.id) return null;
    const oid = over.id.toString();
    if (oid.startsWith("matched-")) {
      const [, , cat] = oid.split("-");
      return `placeholder-${cat}`;
    }
    return oid;
  })();

  // use *this* to drive your highlight, not the raw useDroppable.isOver
  const isOverPlaceholder = normalizedOverId === id;

  const placeholderRef = useRef<HTMLDivElement>(null);
  const prevHeightRef = useRef<number>(rowHeight);

  // Update row height when content changes
  useEffect(() => {
    const updateHeight = () => {
      if (placeholderRef.current) {
        // Get the actual content height
        const height = placeholderRef.current.scrollHeight;

        // Only update if height has changed significantly (by more than 2px)
        if (Math.abs(height - prevHeightRef.current) > 2) {
          prevHeightRef.current = height;
          updateRowHeight(rowIndex, height);
        }
      }
    };

    // Set up a resize observer to detect content height changes
    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });

    if (placeholderRef.current) {
      // Initial height check
      updateHeight();
      resizeObserver.observe(placeholderRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [children, updateRowHeight, rowIndex]);

  return (
    <div ref={setNodeRef} style={{
      width: '100%',
      position: 'relative',
      // marginLeft: '-100px', // Keep left extension
      // paddingLeft: '100px', // Keep left padding
      // marginRight: '-100px', // Keep right extension
      // paddingRight: '100px', // Keep right padding
      zIndex: isOverPlaceholder ? 5 : 1, // Increase z-index when being dragged over
      pointerEvents: 'auto', // Ensure droppable areas always receive pointer events
    }}>
      <Paper
        ref={placeholderRef}
        elevation={0}
        sx={{
          py: hasItem ? 5.5 : 5.5,
          px: hasItem ? 1.5 : 0.5,
          mb: 1,
          borderRadius: '8px',
          border: `1px solid ${isOverPlaceholder
            ? theme.palette.primary.main
            : hasItem
              ? theme.palette.primary.light
              : alpha(theme.palette.grey[300], 0.8)}`,
          backgroundColor: isOverPlaceholder
            ? alpha(theme.palette.primary.main, 0.05)
            : hasItem
              ? alpha(theme.palette.primary.light, 0.05)
              : 'transparent',
          minHeight: '40px',
          height: rowHeight > 0 ? `${rowHeight}px` : 'auto',
          display: 'flex',
          alignItems: 'center',
          transition: 'all 0.05s ease',
          flexDirection: 'row',
          width: '100%',
          overflowX: 'visible',
          whiteSpace: 'normal',
          position: 'relative', // Add relative positioning
          zIndex: isOverPlaceholder ? 1 : 0, // Lower z-index for the visual part
        }}
      >
        {/* Add invisible overlay that's always on top to capture drops */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: isOverPlaceholder ? 4 : -1, // Only activate when being dragged over
        }} />

        {children}
      </Paper>
    </div>
  );
});

// Variant box component that syncs height with placeholder
const VariantBox = memo(({
  category,
  theme,
  rowHeight
}: {
  category: MatchingCategory;
  theme: any;
  rowHeight: number;
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        py: 5.5,
        px: 1.5,
        mb: 1,
        borderRadius: '8px',
        border: `1px solid ${alpha(theme.palette.grey[300], 0.8)}`,
        minHeight: '40px',
        height: rowHeight > 0 ? `${rowHeight}px` : 'auto',
        display: 'flex',
        alignItems: 'center',
        transition: 'all 0.05s ease',
        position: 'relative',
        zIndex: 0, // Add lower z-index to prevent overlap issues
      }}
    >
      <Box sx={{ width: '100%' }}>
        <Typography
          variant="body2"
          sx={{
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
          }}
        >
          {category.text}
        </Typography>
      </Box>
    </Paper>
  );
});

// Droppable container for the available options
const DroppableOptionsContainer = memo(({
  id,
  children,
  theme
}: {
  id: string;
  children: React.ReactNode;
  theme: any;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id
  });

  return (
    <div ref={setNodeRef} style={{
      position: 'relative',
      marginTop: '-40px',    // Only extend top
      // marginBottom: '-40px', // Only extend bottom
      paddingTop: '40px',    // Match top padding
      // paddingBottom: '40px', // Match bottom padding
      width: '100%',         // Maintain width
      zIndex: isOver ? 5 : 1, // Increase z-index when being dragged over
    }}>
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          mb: 1,
          borderRadius: '8px',
          border: `1px solid ${isOver
            ? theme.palette.primary.main
            : alpha(theme.palette.grey[400], 0.5)}`,
          backgroundColor: isOver
            ? alpha(theme.palette.primary.main, 0.05)
            : alpha(theme.palette.grey[100], 0.3),
          minHeight: '50px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1.5,
          alignItems: 'center',
          transition: 'all 0.05s ease',
          position: 'relative', // Add relative positioning
        }}
      >
        {/* Add invisible overlay to help with drops */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: isOver ? 4 : -1, // Only visible when dragging over
        }} />

        {children}
      </Paper>
    </div>
  );
});

// Draggable option item
const SortableOption = memo(({
  id,
  option,
  theme,
  activeId
}: {
  id: string;
  option: MatchingOption;
  theme: any;
  activeId: UniqueIdentifier | null;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const idStr = id.toString();
  const isMatched = idStr.startsWith('matched-');

  // Only disable pointer events for matched items (those already in a target container)
  // when there's an active drag occurring and this item isn't the one being dragged
  const isActiveDrag = activeId !== null;
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging && id === activeId ? 999 : isMatched ? 1 : 2, // Lower z-index for matched items
    opacity: isDragging ? 0.5 : 1,
    pointerEvents: isActiveDrag && isMatched && id !== activeId ? 'none' as const : 'auto' as const,
  };

  return (
    <Paper
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      elevation={isDragging ? 4 : 1}
      sx={{
        p: 0.5,
        borderRadius: '6px',
        backgroundColor: isDragging
          ? alpha(theme.palette.primary.main, 0.1)
          : theme.palette.background.paper,
        border: `1px solid ${isDragging
          ? theme.palette.primary.main
          : alpha(theme.palette.grey[300], 0.8)}`,
        minWidth: '120px',
        width: 'fit-content',
        maxWidth: '100%',
        height: 'auto',
        cursor: 'grab',
        '&:active': {
          cursor: 'grabbing'
        },
        transform: style.transform,
        transition: style.transition,
        zIndex: style.zIndex,
        opacity: style.opacity,
        pointerEvents: style.pointerEvents as 'none' | 'auto',
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {option.text}
      </Typography>
    </Paper>
  );
});

const MatchingQuestion: React.FC<MatchingQuestionProps> = ({
  questionId,
  questionNumber,
  questionText,
  options,
  categories,
  matches,
  onMatchSelect
}) => {
  const theme = useTheme();

  // State to track available options (ones not yet matched)
  const [availableOptions, setAvailableOptions] = useState<MatchingOption[]>([]);

  // State to track matched options
  const [matchedOptions, setMatchedOptions] = useState<{ [key: number]: MatchingOption | null }>({});

  // Track active dragging item
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeOption, setActiveOption] = useState<MatchingOption | null>(null);

  // State to track row heights for synchronized sizing
  const [rowHeights, setRowHeights] = useState<RowHeights>({});

  // Function to update row heights (memoized)
  const updateRowHeight = useCallback((rowIndex: number, height: number) => {
    setRowHeights(prev => {
      // Skip update if height hasn't changed
      if (prev[rowIndex] === height) return prev;

      return {
        ...prev,
        [rowIndex]: height
      };
    });
  }, []);

  // Configure sensors for drag and drop (memoized)
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialize the component state based on props
  useEffect(() => {
    // Initialize matched options object with null values for all categories
    const initialMatchedOptions: { [key: number]: MatchingOption | null } = {};
    categories.forEach(category => {
      initialMatchedOptions[category.id] = null;
    });

    // Set already matched options in our state
    const matched: { [key: number]: MatchingOption | null } = { ...initialMatchedOptions };
    const alreadyMatchedOptionIds = new Set<number>();

    matches.forEach(match => {
      const matchedOption = options.find(o => o.id === match.option_id);
      if (matchedOption) {
        matched[match.matched_to_category_id] = matchedOption;
        alreadyMatchedOptionIds.add(match.option_id);
      }
    });

    // Set available options (those that are not matched yet)
    const availableOpts = options.filter(option => !alreadyMatchedOptionIds.has(option.id));

    setMatchedOptions(matched);
    setAvailableOptions(availableOpts);
  }, [options, categories, matches]);

  // Get option from ID (memoized)
  const getOptionFromId = useCallback((id: UniqueIdentifier): { option: MatchingOption | null, categoryId?: number } => {
    const idStr = id.toString();

    // Handle available options
    if (idStr.startsWith('option-')) {
      const optionId = parseInt(idStr.replace('option-', ''), 10);
      const option = availableOptions.find(opt => opt.id === optionId) || null;
      return { option };
    }

    // Handle matched options
    if (idStr.startsWith('matched-')) {
      const parts = idStr.replace('matched-', '').split('-');
      const optionId = parseInt(parts[0], 10);
      const categoryId = parseInt(parts[1], 10);
      const option = matchedOptions[categoryId] || null;

      return { option, categoryId };
    }

    return { option: null };
  }, [availableOptions, matchedOptions]);

  // Handle drag start (memoized)
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id);

    const { option } = getOptionFromId(active.id);
    setActiveOption(option);
  }, [getOptionFromId]);

  // Handle drag end (memoized)
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveOption(null);

    if (!over) return;

    // 1) normalize any "matched-<optId>-<catId>" into "placeholder-<catId>"
    let overId = over.id.toString();
    if (overId.startsWith('matched-')) {
      const [, , catId] = overId.split('-');
      overId = `placeholder-${catId}`;
    }

    // 2) if it's still not a placeholder or the available-list, bail
    if (
      !overId.startsWith('placeholder-') &&
      overId !== 'availableOptions'
    ) {
      return;
    }

    const activeId = active.id.toString();

    // If dropped in the same place
    if (activeId === overId) return;

    // Get the option being dragged
    const { option, categoryId: sourceCategoryId } = getOptionFromId(activeId);
    if (!option) return;

    // 3) now handle placeholder drops just as before
    if (overId.startsWith('placeholder-')) {
      const categoryId = parseInt(overId.replace('placeholder-', ''), 10);

      // If drag from available options
      if (activeId.startsWith('option-')) {
        const optionIndex = availableOptions.findIndex(opt => opt.id === option.id);
        if (optionIndex === -1) return;

        // If there's already an option in the destination, swap them
        const existingOption = matchedOptions[categoryId];

        // Create new state objects
        const newAvailableOptions = [...availableOptions];
        const newMatchedOptions = { ...matchedOptions };

        // Remove the dragged option from available options
        newAvailableOptions.splice(optionIndex, 1);

        // If there was an option already in the destination, add it back to available options
        if (existingOption) {
          newAvailableOptions.push(existingOption);

          // Also notify parent component about the removal of the existing option
          // from this category before we assign the new one
          onMatchSelect(questionId, existingOption.id, 0);
        }

        // Put the dragged option in the destination
        newMatchedOptions[categoryId] = option;

        // Update state
        setAvailableOptions(newAvailableOptions);
        setMatchedOptions(newMatchedOptions);

        // Notify parent component
        onMatchSelect(questionId, option.id, categoryId);
      }
      // If drag from another category
      else if (activeId.startsWith('matched-') && sourceCategoryId !== undefined) {
        // Don't do anything if dropping in the same category
        if (sourceCategoryId === categoryId) return;

        const destOption = matchedOptions[categoryId];

        // Create new matched options state
        const newMatchedOptions = { ...matchedOptions };

        // If there was an option in the destination, first notify that it's being moved
        if (destOption) {
          onMatchSelect(questionId, destOption.id, 0);
        }

        // Notify that the source option is being removed from its current category
        onMatchSelect(questionId, option.id, 0);

        // Swap options (or just move if destination was empty)
        newMatchedOptions[sourceCategoryId] = destOption;
        newMatchedOptions[categoryId] = option;

        // Update state
        setMatchedOptions(newMatchedOptions);

        // Notify parent component that options are being assigned to new categories
        onMatchSelect(questionId, option.id, categoryId);

        // If there was an option in the destination, update that match too
        if (destOption) {
          onMatchSelect(questionId, destOption.id, sourceCategoryId);
        }
      }
    }
    // Handle drop to available options area
    else if (overId === 'availableOptions' && activeId.startsWith('matched-') && sourceCategoryId !== undefined) {
      // Create new state objects
      const newAvailableOptions = [...availableOptions];
      const newMatchedOptions = { ...matchedOptions };

      // Add the option back to available options
      newAvailableOptions.push(option);

      // Remove the option from matched options
      newMatchedOptions[sourceCategoryId] = null;

      // Update state
      setAvailableOptions(newAvailableOptions);
      setMatchedOptions(newMatchedOptions);

      // Notify parent component - passing 0 as categoryId to indicate removal
      onMatchSelect(questionId, option.id, 0);
    }
  }, [availableOptions, getOptionFromId, matchedOptions, onMatchSelect, questionId]);

  // Sort categories by display_order if available
  const sortedCategories = React.useMemo(() =>
    [...categories].sort((a, b) => (a.display_order || 0) - (b.display_order || 0)),
    [categories]
  );

  // Render the component
  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <Typography variant="h6" sx={{
          mb: 2,
          fontWeight: 500,
          color: theme.palette.primary.main,
        }}
        >
          {questionNumber}.&nbsp;
        </Typography>
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontWeight: 500,
            color: theme.palette.primary.main,
            '& p': {
              margin: 0, // Override margin
              padding: 0, // Override padding
            },
            '& h3': {
              margin: 0, // Override margin
              padding: 0, // Override padding
            },
          }}
          dangerouslySetInnerHTML={{ __html: `${questionText}` }}
        />
      </Box>
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Main matching area - two columns */}
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 0,
          mb: 2
        }}>
          {/* Left column - Variants */}
          <Box sx={{
            flex: { sm: '0 0 45%' },
            mr: { sm: 2 }
          }}>
            <Typography variant="subtitle1" sx={{
              mb: 1,
              fontWeight: 600,
              borderBottom: `1px solid ${alpha(theme.palette.grey[300], 0.8)}`,
              pb: 0.5
            }}>
              Варіанти:
            </Typography>

            {sortedCategories.map((category, index) => (
              <VariantBox
                key={`variant-${category.id}`}
                category={category}
                theme={theme}
                rowHeight={rowHeights[index] || 0}
              />
            ))}
          </Box>

          {/* Right column - Placeholders for answers */}
          <Box sx={{
            flex: { sm: '0 0 55%' },
            width: '100%'
          }}>
            <Typography variant="subtitle1" sx={{
              mb: 1,
              fontWeight: 600,
              borderBottom: `1px solid ${alpha(theme.palette.grey[300], 0.8)}`,
              pb: 0.5
            }}>
              Відповідності:
            </Typography>

            {sortedCategories.map((category, index) => {
              const placeholderId = `placeholder-${category.id}`;
              const hasItem = !!matchedOptions[category.id];
              return (
                <Box key={placeholderId} sx={{ width: '100%' }}>
                  <DroppablePlaceholder
                    id={placeholderId}
                    hasItem={hasItem}
                    theme={theme}
                    rowIndex={index}
                    updateRowHeight={updateRowHeight}
                    rowHeight={rowHeights[index] || 0}
                  >
                    {matchedOptions[category.id] && (
                      <SortableOption
                        id={`matched-${matchedOptions[category.id]!.id}-${category.id}`}
                        option={matchedOptions[category.id]!}
                        theme={theme}
                        activeId={activeId}
                      />
                    )}
                  </DroppablePlaceholder>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Available options - bottom section */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" sx={{
            mb: 1,
            fontWeight: 600,
            borderBottom: `1px solid ${alpha(theme.palette.grey[300], 0.8)}`,
            pb: 0.5
          }}>
            Перетягніть варіанти відповідей:
          </Typography>

          <DroppableOptionsContainer
            id="availableOptions"
            theme={theme}
          >
            {availableOptions.map((option) => (
              <SortableOption
                key={`option-${option.id}`}
                id={`option-${option.id}`}
                option={option}
                theme={theme}
                activeId={activeId}
              />
            ))}
          </DroppableOptionsContainer>
        </Box>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId && activeOption && (
            <Paper
              elevation={4}
              sx={{
                p: 1,
                borderRadius: '6px',
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                border: `1px solid ${theme.palette.primary.main}`,
                minWidth: '120px',
                maxWidth: '250px',
                transform: 'scale(1.02)',
                opacity: 0.8
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {activeOption.text}
              </Typography>
            </Paper>
          )}
        </DragOverlay>
      </DndContext>
    </Box>
  );
};

export default React.memo(MatchingQuestion);