import { useState, useEffect, useCallback } from "react";

import {
  recalculateBlockTimes,
  calculateScheduledDuration,
  getSamplePracticeBlocks,
  loadPracticeFromStorage,
} from "../utils";

import type { CalendarEvent } from "../../../domain/calendar/types";
import type {
  PracticeBlock,
  PracticeGroup,
  UserRole,
  SelectedGroupForScript,
  EditingGroup,
} from "../types";

import { usePracticeScaffold } from "./usePracticeScaffold";
import { usePracticeBlockGroupScriptHandlers } from "./usePracticeBlockGroupScriptHandlers";

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
  const [selectedBlockForScript, setSelectedBlockForScript] = useState<
    string | null
  >(null);
  const [selectedGroupForScript, setSelectedGroupForScript] =
    useState<SelectedGroupForScript | null>(null);

  // Group management
  const [showAddGroup, setShowAddGroup] = useState<string | null>(null);
  const [editingGroup, setEditingGroup] = useState<EditingGroup | null>(null);
  const [newGroup, setNewGroup] = useState<Partial<PracticeGroup>>({
    name: "",
    location: "",
    notes: "",
  });

  // Memoized time recalculation function
  const memoizedRecalculateBlockTimes = useCallback(
    (blocks: PracticeBlock[]) => {
      return recalculateBlockTimes(blocks, event.start);
    },
    [event.start]
  );

  // Calculate practice duration from event start/end times
  useEffect(() => {
    if (event.start && event.end) {
      const duration = calculateScheduledDuration(event.start, event.end);
      setScheduledDuration(duration);
    }
  }, [event.start, event.end]);

  // Load saved practice data or sample data
  useEffect(() => {
    const savedBlocks = loadPracticeFromStorage(event.id || "");

    if (savedBlocks) {
      // Loading saved practice plan
      const blocksWithTimes = memoizedRecalculateBlockTimes(savedBlocks);
      setPracticeBlocks(blocksWithTimes);
    } else {
      // No saved practice data found, loading sample data
      const sampleBlocks = getSamplePracticeBlocks();
      const blocksWithTimes = memoizedRecalculateBlockTimes(sampleBlocks);
      setPracticeBlocks(blocksWithTimes);
    }
  }, [event.id, memoizedRecalculateBlockTimes]);

  // Calculate total planned duration
  useEffect(() => {
    const total = practiceBlocks.reduce(
      (sum, block) => sum + block.duration,
      0
    );
    setTotalDuration(total);
  }, [practiceBlocks]);

  // Computed values
  const isOvertime = totalDuration > scheduledDuration;

  const {
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
    handleTimelineClick,
    handleBlockClick,
    updateSelectedBlockDuration,
    removeEmptyTime,
    saveTimeAllocation,
    handleCancelScaffold,
  } = usePracticeScaffold({
    eventId: event.id || undefined,
    scheduledDuration,
    practiceBlocks,
    setPracticeBlocks,
    recalculateBlockTimes: memoizedRecalculateBlockTimes,
  });

  const {
    handleRemoveBlock,
    handleAddGroup,
    handleRemoveGroup,
    handleAddScriptToBlock,
    handleAddScriptToGroup,
    handleRemoveScriptFromGroup,
    handleAutoAssignCoaches,
    assignScriptToBlock,
    assignScriptToGroup,
  } = usePracticeBlockGroupScriptHandlers({
    eventId: event.id || "",
    setPracticeBlocks,
    recalculateBlockTimes: memoizedRecalculateBlockTimes,
    setEditingGroup,
    setSelectedBlockForScript,
    setSelectedGroupForScript,
    setShowScriptSelector,
  });

  // TODO: Implement remaining handlers for full integration
  const handleDragEnd = useCallback(() => {
    // TODO: implement
  }, []);

  const handleAddBlock = useCallback(() => {
    // TODO: implement
  }, []);

  const handleEditBlock = useCallback((_block: PracticeBlock) => {
    // This opens a modal or form to edit the block
    // For now, we'll just log it - the actual editing happens in modals
    // TODO: Implement block editing modal or inline editing
  }, []);

  const handleEditGroup = useCallback(() => {
    // TODO: implement
  }, []);

  const handleUpdateGroup = useCallback(() => {
    // TODO: implement
  }, []);

  return {
    practiceBlocks,
    setPracticeBlocks,
    scheduledDuration,
    totalDuration,
    userRole,
    setUserRole,
    isOvertime,
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
    newBlock,
    setNewBlock,
    selectedBlockForScript,
    setSelectedBlockForScript,
    selectedGroupForScript,
    setSelectedGroupForScript,
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
    handleTimelineClick,
    handleBlockClick,
    updateSelectedBlockDuration,
    removeEmptyTime,
    saveTimeAllocation,
    handleCancelScaffold,
    handleDragEnd,
    handleAddBlock,
    handleEditBlock,
    handleRemoveBlock,
    handleAddGroup,
    handleEditGroup,
    handleUpdateGroup,
    handleRemoveGroup,
    handleAddScriptToBlock,
    handleAddScriptToGroup,
    handleRemoveScriptFromGroup,
    handleAutoAssignCoaches,
    assignScriptToBlock,
    assignScriptToGroup,
    showAddGroup,
    setShowAddGroup,
    editingGroup,
    setEditingGroup,
    newGroup,
    setNewGroup,
    memoizedRecalculateBlockTimes,
  };
};
