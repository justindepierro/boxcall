import { useState, useEffect, useCallback } from 'react';
import type { 
  PracticeBlock, 
  PracticeGroup, 
  UserRole, 
  TimelineAllocation, 
  SelectedBlock,
  SelectedGroupForScript,
  EditingGroup
} from '../types';
import { 
  recalculateBlockTimes, 
  calculateScheduledDuration, 
  getSamplePracticeBlocks,
  loadPracticeFromStorage
} from '../utils';
import type { CalendarEvent } from '../../../services/calendarService';

export const usePracticeState = (event: CalendarEvent) => {
  // Core state
  const [practiceBlocks, setPracticeBlocks] = useState<PracticeBlock[]>([]);
  const [scheduledDuration, setScheduledDuration] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [userRole, setUserRole] = useState<UserRole>("head_coach");
  
  // UI state
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [showScriptSelector, setShowScriptSelector] = useState(false);
  const [showOvertimeWarning, setShowOvertimeWarning] = useState(false);
  const [editingBlock, setEditingBlock] = useState<PracticeBlock | null>(null);
  const [showEditBlock, setShowEditBlock] = useState(false);
  const [lastSaveMessage, setLastSaveMessage] = useState<string | null>(null);
  
  // New block form
  const [newBlock, setNewBlock] = useState<Partial<PracticeBlock>>({
    category: "meeting",
    location: "",
    notes: "",
    title: "",
  });
  
  // Script selection
  const [selectedBlockForScript, setSelectedBlockForScript] = useState<string | null>(null);
  const [selectedGroupForScript, setSelectedGroupForScript] = useState<SelectedGroupForScript | null>(null);
  
  // Timeline/Scaffold mode
  const [timeAllocationMode, setTimeAllocationMode] = useState(false);
  const [scaffoldMode, setScaffoldMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<PracticeBlock["category"] | null>(null);
  const [timelineAllocation, setTimelineAllocation] = useState<TimelineAllocation>({});
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<SelectedBlock | null>(null);
  const [sliderValue, setSliderValue] = useState<number>(5);
  const [originalBlocksBeforeScaffold, setOriginalBlocksBeforeScaffold] = useState<PracticeBlock[]>([]);
  
  // Group management
  const [showAddGroup, setShowAddGroup] = useState<string | null>(null);
  const [editingGroup, setEditingGroup] = useState<EditingGroup | null>(null);
  const [newGroup, setNewGroup] = useState<Partial<PracticeGroup>>({
    name: "",
    location: "",
    notes: "",
  });

  // Memoized time recalculation function
  const memoizedRecalculateBlockTimes = useCallback((blocks: PracticeBlock[]) => {
    return recalculateBlockTimes(blocks, event.start);
  }, [event.start]);

  // Calculate practice duration from event start/end times
  useEffect(() => {
    if (event.start && event.end) {
      const duration = calculateScheduledDuration(event.start, event.end);
      setScheduledDuration(duration);
    }
  }, [event.start, event.end]);

  // Load saved practice data or sample data
  useEffect(() => {
    const savedBlocks = loadPracticeFromStorage(event.id || '');
    
    if (savedBlocks) {
      console.log('Loading saved practice plan:', savedBlocks);
      const blocksWithTimes = memoizedRecalculateBlockTimes(savedBlocks);
      setPracticeBlocks(blocksWithTimes);
    } else {
      console.log('No saved practice data found, loading sample data');
      const sampleBlocks = getSamplePracticeBlocks();
      const blocksWithTimes = memoizedRecalculateBlockTimes(sampleBlocks);
      setPracticeBlocks(blocksWithTimes);
    }
  }, [event.id, memoizedRecalculateBlockTimes]);

  // Calculate total planned duration
  useEffect(() => {
    const total = practiceBlocks.reduce((sum, block) => sum + block.duration, 0);
    setTotalDuration(total);
  }, [practiceBlocks]);

  // Computed values
  const isOvertime = totalDuration > scheduledDuration;

  return {
    // Core state
    practiceBlocks,
    setPracticeBlocks,
    scheduledDuration,
    totalDuration,
    userRole,
    setUserRole,
    isOvertime,
    
    // UI state
    showAddBlock,
    setShowAddBlock,
    showScriptSelector,
    setShowScriptSelector,
    showOvertimeWarning,
    setShowOvertimeWarning,
    editingBlock,
    setEditingBlock,
    showEditBlock,
    setShowEditBlock,
    lastSaveMessage,
    setLastSaveMessage,
    
    // New block form
    newBlock,
    setNewBlock,
    
    // Script selection
    selectedBlockForScript,
    setSelectedBlockForScript,
    selectedGroupForScript,
    setSelectedGroupForScript,
    
    // Timeline/Scaffold mode
    timeAllocationMode,
    setTimeAllocationMode,
    scaffoldMode,
    setScaffoldMode,
    selectedCategory,
    setSelectedCategory,
    timelineAllocation,
    setTimelineAllocation,
    isSelecting,
    setIsSelecting,
    selectionStart,
    setSelectionStart,
    selectedBlock,
    setSelectedBlock,
    sliderValue,
    setSliderValue,
    originalBlocksBeforeScaffold,
    setOriginalBlocksBeforeScaffold,
    
    // Group management
    showAddGroup,
    setShowAddGroup,
    editingGroup,
    setEditingGroup,
    newGroup,
    setNewGroup,
    
    // Utility function
    memoizedRecalculateBlockTimes,
  };
};
