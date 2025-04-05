import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography,
  Paper,
  useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { MatchingCategory, MatchingOption, MatchAnswer } from './interfaces';

// dnd imports
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  UniqueIdentifier,
  DragOverlay
} from "@dnd-kit/core";
import {
  arrayMove,
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

// Droppable container for options
const DroppableContainer = ({ 
  id, 
  children, 
  isPlaceholder = false,
  hasItem = false,
  isDraggingOver = false,
  theme 
}: { 
  id: string; 
  children: React.ReactNode; 
  isPlaceholder?: boolean;
  hasItem?: boolean;
  isDraggingOver?: boolean;
  theme: any;
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        mb: 1,
        borderRadius: '8px',
        border: `1px solid ${isDraggingOver 
          ? theme.palette.primary.main 
          : hasItem && isPlaceholder
            ? theme.palette.primary.light
            : alpha(theme.palette.grey[300], 0.8)}`,
        backgroundColor: isDraggingOver 
          ? alpha(theme.palette.primary.main, 0.05)
          : hasItem && isPlaceholder
            ? alpha(theme.palette.primary.light, 0.05)
            : isPlaceholder 
              ? 'transparent'
              : alpha(theme.palette.grey[100], 0.3),
        minHeight: '40px',
        display: 'flex',
        alignItems: 'center',
        transition: 'all 0.2s ease',
        ...(isPlaceholder ? {
          flexDirection: 'row'
        } : {
          flexWrap: 'wrap',
          gap: 1.5
        })
      }}
    >
      {children}
    </Paper>
  );
};

// Draggable option item
const SortableOption = ({ 
  id, 
  option, 
  theme 
}: { 
  id: string; 
  option: MatchingOption;
  theme: any;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Paper
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      elevation={isDragging ? 4 : 1}
      sx={{
        p: 1,
        borderRadius: '6px',
        backgroundColor: isDragging 
          ? alpha(theme.palette.primary.main, 0.1)
          : theme.palette.background.paper,
        border: `1px solid ${isDragging 
          ? theme.palette.primary.main 
          : alpha(theme.palette.grey[300], 0.8)}`,
        minWidth: '120px',
        maxWidth: '250px',
        // transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        // transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        cursor: 'grab',
        '&:active': {
          cursor: 'grabbing'
        },
        ...style
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {option.text}
      </Typography>
    </Paper>
  );
};

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
  const [matchedOptions, setMatchedOptions] = useState<{[key: number]: MatchingOption | null}>({});
  
  // Track active dragging item
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeOption, setActiveOption] = useState<MatchingOption | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState<string | null>(null);

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5, // 5px
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
    const initialMatchedOptions: {[key: number]: MatchingOption | null} = {};
    categories.forEach(category => {
      initialMatchedOptions[category.id] = null;
    });
    
    // Set already matched options in our state
    const matched: {[key: number]: MatchingOption | null} = {...initialMatchedOptions};
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

  // Get option from ID
  const getOptionFromId = (id: UniqueIdentifier): MatchingOption | null => {
    const idStr = id.toString();
    
    // Handle available options
    if (idStr.startsWith('option-')) {
      const optionId = parseInt(idStr.replace('option-', ''), 10);
      return availableOptions.find(opt => opt.id === optionId) || null;
    }
    
    // Handle matched options
    if (idStr.startsWith('matched-')) {
      const parts = idStr.replace('matched-', '').split('-');
      const categoryId = parseInt(parts[1], 10);
      return matchedOptions[categoryId] || null;
    }
    
    return null;
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id);
    setActiveOption(getOptionFromId(active.id));
  };

  // Handle drag over
  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      setIsDraggingOver(over.id.toString());
    } else {
      setIsDraggingOver(null);
    }
  };
  
  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveOption(null);
    setIsDraggingOver(null);
    
    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();
    
    // If dropped in the same place
    if (activeId === overId) return;
    
    // Get the option being dragged
    const option = getOptionFromId(activeId);
    if (!option) return;

    // Handle drop to a category placeholder
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
        const newMatchedOptions = {...matchedOptions};
        
        // Remove the dragged option from available options
        newAvailableOptions.splice(optionIndex, 1);
        
        // If there was an option already in the destination, add it back to available options
        if (existingOption) {
          newAvailableOptions.push(existingOption);
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
      else if (activeId.startsWith('matched-')) {
        const parts = activeId.replace('matched-', '').split('-');
        const sourceCategoryId = parseInt(parts[1], 10);
        
        // Don't do anything if dropping in the same category
        if (sourceCategoryId === categoryId) return;
        
        const destOption = matchedOptions[categoryId];
        
        // Create new matched options state
        const newMatchedOptions = {...matchedOptions};
        
        // Swap options (or just move if destination was empty)
        newMatchedOptions[sourceCategoryId] = destOption;
        newMatchedOptions[categoryId] = option;
        
        // Update state
        setMatchedOptions(newMatchedOptions);
        
        // Notify parent component
        onMatchSelect(questionId, option.id, categoryId);
        
        // If there was an option in the destination, update that match too
        if (destOption) {
          onMatchSelect(questionId, destOption.id, sourceCategoryId);
        }
      }
    }
    // Handle drop to available options area
    else if (overId === 'availableOptions' && activeId.startsWith('matched-')) {
      const parts = activeId.replace('matched-', '').split('-');
      const categoryId = parseInt(parts[1], 10);
      
      // Create new state objects
      const newAvailableOptions = [...availableOptions];
      const newMatchedOptions = {...matchedOptions};
      
      // Add the option back to available options
      newAvailableOptions.push(option);
      
      // Remove the option from matched options
      newMatchedOptions[categoryId] = null;
      
      // Update state
      setAvailableOptions(newAvailableOptions);
      setMatchedOptions(newMatchedOptions);
      
      // Notify parent component - passing 0 as categoryId to indicate removal
      onMatchSelect(questionId, option.id, 0);
    }
  };
  
  // Sort categories by display_order if available
  const sortedCategories = [...categories].sort((a, b) => 
    (a.display_order || 0) - (b.display_order || 0)
  );

  // Get option IDs for SortableContext
  const availableOptionIds = availableOptions.map(option => `option-${option.id}`);
  
  // Get matched option IDs for each category
  const getMatchedOptionId = (categoryId: number): string => {
    const option = matchedOptions[categoryId];
    return option ? `matched-${option.id}-${categoryId}` : `empty-${categoryId}`;
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ 
        mb: 2, 
        fontWeight: 600, 
        color: theme.palette.primary.main 
      }}>
        {questionNumber}. {questionText}
      </Typography>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* Main matching area - two columns */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 2,
          mb: 2
        }}>
          {/* Left column - Variants */}
          <Box sx={{ 
            flex: { md: '0 0 45%' },
            mr: { md: 2 }
          }}>
            <Typography variant="subtitle1" sx={{ 
              mb: 1, 
              fontWeight: 600,
              borderBottom: `1px solid ${alpha(theme.palette.grey[300], 0.8)}`,
              pb: 0.5
            }}>
              Варіанти:
            </Typography>
            
            {sortedCategories.map((category) => (
              <Paper
                key={`variant-${category.id}`}
                elevation={0}
                sx={{
                  p: 1.5,
                  mb: 1,
                  borderRadius: '8px',
                  border: `1px solid ${alpha(theme.palette.grey[300], 0.8)}`,
                  minHeight: '40px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Typography variant="body2">{category.text}</Typography>
              </Paper>
            ))}
          </Box>
          
          {/* Right column - Placeholders for answers */}
          <Box sx={{ 
            flex: { md: '0 0 55%' } 
          }}>
            <Typography variant="subtitle1" sx={{ 
              mb: 1, 
              fontWeight: 600,
              borderBottom: `1px solid ${alpha(theme.palette.grey[300], 0.8)}`,
              pb: 0.5
            }}>
              Відповідності:
            </Typography>
            
            {sortedCategories.map((category) => {
              const placeholderId = `placeholder-${category.id}`;
              const hasItem = !!matchedOptions[category.id];
              return (
                <Box key={placeholderId}>
                  <DroppableContainer 
                    id={placeholderId}
                    isPlaceholder={true}
                    hasItem={hasItem}
                    isDraggingOver={isDraggingOver === placeholderId}
                    theme={theme}
                  >
                    {matchedOptions[category.id] && (
                      <SortableContext items={[getMatchedOptionId(category.id)]}>
                        <SortableOption 
                          id={getMatchedOptionId(category.id)}
                          option={matchedOptions[category.id]!}
                          theme={theme}
                        />
                      </SortableContext>
                    )}
                  </DroppableContainer>
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
          
          <DroppableContainer 
            id="availableOptions"
            isDraggingOver={isDraggingOver === "availableOptions"}
            theme={theme}
          >
            <SortableContext 
              items={availableOptionIds}
              strategy={horizontalListSortingStrategy}
            >
              {availableOptions.map((option) => (
                <SortableOption 
                  key={`option-${option.id}`}
                  id={`option-${option.id}`}
                  option={option}
                  theme={theme}
                />
              ))}
            </SortableContext>
          </DroppableContainer>
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

export default MatchingQuestion;