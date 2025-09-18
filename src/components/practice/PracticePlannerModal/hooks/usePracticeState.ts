import { useState, useEffect, useCallback } from "react";

import type { CalendarEvent } from "../../../../domain/calendar/types";
import type {
  PracticeBlock,
  TimelineAllocation,
  SelectedBlock,
  PracticeGroup,
} from "../types";

export const usePracticeState = (event: CalendarEvent) => {
  const [practiceBlocks, setPracticeBlocks] = useState<PracticeBlock[]>([]);
  const [newBlock, setNewBlock] = useState<Partial<PracticeBlock>>({
    category: "meeting",
    location: "",
    notes: "",
    title: "",
  });
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [showScriptSelector, setShowScriptSelector] = useState(false);
  const [selectedBlockForScript, setSelectedBlockForScript] = useState<
    string | null
  >(null);
  const [selectedGroupForScript, setSelectedGroupForScript] = useState<{
    blockId: string;
    groupId: string;
  } | null>(null);
  const [showOvertimeWarning, setShowOvertimeWarning] = useState(false);
  const [editingBlock, setEditingBlock] = useState<PracticeBlock | null>(null);
  const [showEditBlock, setShowEditBlock] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);
  const [scheduledDuration, setScheduledDuration] = useState(0);
  const [userRole, setUserRole] = useState<"head_coach" | "position_coach">(
    "head_coach"
  );
  const [timeAllocationMode, setTimeAllocationMode] = useState(false);
  const [scaffoldMode, setScaffoldMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    PracticeBlock["category"] | null
  >(null);
  const [timelineAllocation, setTimelineAllocation] =
    useState<TimelineAllocation>({});
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<SelectedBlock | null>(
    null
  );
  const [sliderValue, setSliderValue] = useState<number>(5);
  const [lastSaveMessage, setLastSaveMessage] = useState<string | null>(null);
  const [originalBlocksBeforeScaffold, setOriginalBlocksBeforeScaffold] =
    useState<PracticeBlock[]>([]);
  const [showAddGroup, setShowAddGroup] = useState<string | null>(null);
  const [editingGroup, setEditingGroup] = useState<{
    blockId: string;
    group: PracticeGroup;
  } | null>(null);

  // Calculate total duration whenever blocks change
  useEffect(() => {
    const total = practiceBlocks.reduce(
      (sum, block) => sum + block.duration,
      0
    );
    setTotalDuration(total);

    // Calculate scheduled duration (from event start to end)
    if (event.start && event.end) {
      const start = new Date(event.start);
      const end = new Date(event.end);
      const diffInMinutes = Math.round(
        (end.getTime() - start.getTime()) / (1000 * 60)
      );
      setScheduledDuration(diffInMinutes);

      // Show overtime warning if total exceeds scheduled
      setShowOvertimeWarning(total > diffInMinutes);
    }
  }, [practiceBlocks, event.start, event.end]);

  // Helper function to recalculate block times based on order
  const recalculateBlockTimes = useCallback(
    (blocks: PracticeBlock[]): PracticeBlock[] => {
      return blocks.map((block, index) => {
        const previousBlocks = blocks.slice(0, index);
        const totalPreviousDuration = previousBlocks.reduce(
          (sum, prevBlock) => sum + prevBlock.duration,
          0
        );

        const eventStart = new Date(event.start);
        const blockStart = new Date(
          eventStart.getTime() + totalPreviousDuration * 60000
        );
        const blockEnd = new Date(
          blockStart.getTime() + block.duration * 60000
        );

        return {
          ...block,
          startTime: blockStart.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          endTime: blockEnd.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
      });
    },
    [event.start]
  );

  // Load saved practice plan on mount
  useEffect(() => {
    const savedPracticeKey = `practice_plan_${event.id || "default"}`;
    const savedPractice = localStorage.getItem(savedPracticeKey);

    if (savedPractice) {
      try {
        const savedBlocks = JSON.parse(savedPractice);
        const blocksWithTimes = recalculateBlockTimes(savedBlocks);
        setPracticeBlocks(blocksWithTimes);
      } catch (error) {
// console.error("Error loading saved practice plan:", error);
      }
    }
  }, [event.id, event.start, recalculateBlockTimes]);

  const savePracticeToLocalStorage = useCallback(() => {
    const practiceKey = `practice_plan_${event.id || "default"}`;
    localStorage.setItem(practiceKey, JSON.stringify(practiceBlocks));
    setLastSaveMessage("Practice plan saved");
    setTimeout(() => setLastSaveMessage(null), 2000);
  }, [practiceBlocks, event.id]);

  return {
    // State
    practiceBlocks,
    newBlock,
    showAddBlock,
    showScriptSelector,
    selectedBlockForScript,
    selectedGroupForScript,
    showOvertimeWarning,
    editingBlock,
    showEditBlock,
    totalDuration,
    scheduledDuration,
    userRole,
    timeAllocationMode,
    scaffoldMode,
    selectedCategory,
    timelineAllocation,
    isSelecting,
    selectionStart,
    selectedBlock,
    sliderValue,
    lastSaveMessage,
    originalBlocksBeforeScaffold,
    showAddGroup,
    editingGroup,

    // Setters
    setPracticeBlocks,
    setNewBlock,
    setShowAddBlock,
    setShowScriptSelector,
    setSelectedBlockForScript,
    setSelectedGroupForScript,
    setShowOvertimeWarning,
    setEditingBlock,
    setShowEditBlock,
    setTotalDuration,
    setScheduledDuration,
    setUserRole,
    setTimeAllocationMode,
    setScaffoldMode,
    setSelectedCategory,
    setTimelineAllocation,
    setIsSelecting,
    setSelectionStart,
    setSelectedBlock,
    setSliderValue,
    setLastSaveMessage,
    setOriginalBlocksBeforeScaffold,
    setShowAddGroup,
    setEditingGroup,

    // Utilities
    recalculateBlockTimes,
    savePracticeToLocalStorage,
  };
};
