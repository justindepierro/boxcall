import { useState, useEffect, useCallback } from "react";

import {
  recalculateBlockTimes,
  calculateScheduledDuration,
  getSamplePracticeBlocks,
  loadPracticeFromStorage,
  savePracticeToStorage,
} from "../utils";

import type { CalendarEvent } from "../../../domain/calendar/types";
import type {
  PracticeBlock,
  PracticeGroup,
  UserRole,
  TimelineAllocation,
  SelectedBlock,
  SelectedGroupForScript,
  EditingGroup,
} from "../types";

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

  // Timeline/Scaffold mode
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
  const [originalBlocksBeforeScaffold, setOriginalBlocksBeforeScaffold] =
    useState<PracticeBlock[]>([]);

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
      console.log("Loading saved practice plan:", savedBlocks);
      const blocksWithTimes = memoizedRecalculateBlockTimes(savedBlocks);
      setPracticeBlocks(blocksWithTimes);
    } else {
      console.log("No saved practice data found, loading sample data");
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

  // Enhanced scaffold mode setter with block-to-timeline conversion
  const setScaffoldModeWithConversion = useCallback(
    (newScaffoldMode: boolean) => {
      if (newScaffoldMode && !scaffoldMode) {
        // Entering scaffold mode - convert existing blocks to timeline allocation
        console.log(
          "🎯 ENTERING SCAFFOLD MODE - Converting blocks to timeline!"
        );
        console.log("📦 Current practice blocks:", practiceBlocks);

        // Store current blocks as backup for cancel functionality
        setOriginalBlocksBeforeScaffold([...practiceBlocks]);

        // Convert blocks to timeline allocation
        const allocation: TimelineAllocation = {};
        let currentMinute = 0;

        practiceBlocks.forEach((block) => {
          console.log(
            `🕒 Converting block "${block.title}" (${block.duration} mins, ${block.category})`
          );
          for (let i = 0; i < block.duration; i++) {
            allocation[currentMinute + i] = {
              category: block.category,
              assignedCoach: block.assignedCoach,
              title: block.title,
            };
          }
          currentMinute += block.duration;
        });

        console.log(
          "✨ Created timeline allocation from existing blocks:",
          allocation
        );
        console.log(
          "📊 Total minutes allocated:",
          Object.keys(allocation).length
        );
        setTimelineAllocation(allocation);
      } else if (!newScaffoldMode && scaffoldMode) {
        // Exiting scaffold mode - clear timeline allocation
        console.log("🚪 EXITING SCAFFOLD MODE - Clearing timeline");
        setTimelineAllocation({});
        setSelectedCategory(null);
        setSelectedBlock(null);
        setOriginalBlocksBeforeScaffold([]);
      }

      setScaffoldMode(newScaffoldMode);
    },
    [scaffoldMode, practiceBlocks]
  );

  // Timeline handlers
  const handleTimelineClick = useCallback(
    (minute: number) => {
      if (!selectedCategory) return;

      if (!isSelecting) {
        // Start selection with 5-minute default block
        setIsSelecting(true);
        setSelectionStart(minute);

        // Default to 5-minute block, expand to align with 5-minute intervals
        const blockStart = Math.floor(minute / 5) * 5;
        const blockEnd = blockStart + 4; // 5 minutes (0-4 = 5 minutes)

        const newAllocation = { ...timelineAllocation };
        for (let i = blockStart; i <= blockEnd && i < scheduledDuration; i++) {
          newAllocation[i] = { category: selectedCategory };
        }

        setTimelineAllocation(newAllocation);
        setIsSelecting(false);
        setSelectionStart(null);
      } else {
        // End selection - fill in between start and current, aligned to 5-minute intervals
        const rawStart = Math.min(selectionStart!, minute);
        const rawEnd = Math.max(selectionStart!, minute);

        // Align to 5-minute boundaries
        const blockStart = Math.floor(rawStart / 5) * 5;
        const blockEnd = Math.ceil((rawEnd + 1) / 5) * 5 - 1;

        const newAllocation = { ...timelineAllocation };
        for (let i = blockStart; i <= blockEnd && i < scheduledDuration; i++) {
          newAllocation[i] = { category: selectedCategory };
        }

        setTimelineAllocation(newAllocation);
        setIsSelecting(false);
        setSelectionStart(null);
      }
    },
    [
      selectedCategory,
      isSelecting,
      selectionStart,
      timelineAllocation,
      scheduledDuration,
    ]
  );

  const handleBlockClick = useCallback(
    (minute: number) => {
      // Find the block that contains this minute
      const allocation = timelineAllocation[minute];
      if (!allocation) return;

      // Find the start and duration of this block
      let blockStart = minute;
      let blockEnd = minute;

      // Find block start
      while (
        blockStart > 0 &&
        timelineAllocation[blockStart - 1]?.category === allocation.category
      ) {
        blockStart--;
      }

      // Find block end
      while (
        blockEnd < scheduledDuration - 1 &&
        timelineAllocation[blockEnd + 1]?.category === allocation.category
      ) {
        blockEnd++;
      }

      const blockDuration = blockEnd - blockStart + 1;

      setSelectedBlock({
        start: blockStart,
        duration: blockDuration,
        category: allocation.category,
      });
      setSliderValue(blockDuration);
    },
    [timelineAllocation, scheduledDuration]
  );

  const updateSelectedBlockDuration = useCallback(
    (newDuration: number) => {
      if (!selectedBlock) return;

      // Remove the old block
      const newAllocation = { ...timelineAllocation };
      for (
        let i = selectedBlock.start;
        i < selectedBlock.start + selectedBlock.duration;
        i++
      ) {
        delete newAllocation[i];
      }

      // Add the new block with updated duration
      for (
        let i = 0;
        i < newDuration && selectedBlock.start + i < scheduledDuration;
        i++
      ) {
        newAllocation[selectedBlock.start + i] = {
          category: selectedBlock.category,
        };
      }

      setTimelineAllocation(newAllocation);

      // Update selected block duration
      setSelectedBlock({
        ...selectedBlock,
        duration: newDuration,
      });
    },
    [selectedBlock, timelineAllocation, scheduledDuration]
  );

  const removeEmptyTime = useCallback(() => {
    // Find all allocated minutes and compress to the left
    const allocatedMinutes = Object.entries(timelineAllocation)
      .filter(([_, allocation]) => allocation)
      .sort(([a], [b]) => parseInt(a) - parseInt(b));

    const newAllocation: TimelineAllocation = {};
    allocatedMinutes.forEach(([_, allocation], index) => {
      newAllocation[index] = allocation;
    });

    setTimelineAllocation(newAllocation);
  }, [timelineAllocation]);

  const handleCancelScaffold = useCallback(() => {
    // Restore original blocks and exit scaffold mode
    setPracticeBlocks(originalBlocksBeforeScaffold);
    setScaffoldMode(false);
    setTimelineAllocation({});
    setSelectedCategory(null);
    setSelectedBlock(null);
    setOriginalBlocksBeforeScaffold([]);
  }, [originalBlocksBeforeScaffold]);

  const saveTimeAllocation = useCallback(() => {
    // Convert timeline allocation to practice blocks
    const newBlocks: PracticeBlock[] = [];
    let currentBlock: Partial<PracticeBlock> | null = null;

    for (let minute = 0; minute < scheduledDuration; minute++) {
      const allocation = timelineAllocation[minute];

      if (allocation) {
        if (!currentBlock || currentBlock.category !== allocation.category) {
          // Start new block
          if (currentBlock) {
            newBlocks.push({
              id: Date.now().toString() + Math.random(),
              startTime: "",
              endTime: "",
              duration: currentBlock.duration || 0,
              category: currentBlock.category!,
              title: `${currentBlock.category?.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())} Time`,
              location: "",
              notes: "",
              assignedCoach: currentBlock.assignedCoach,
            });
          }

          currentBlock = {
            category: allocation.category,
            duration: 1,
            assignedCoach: allocation.assignedCoach,
          };
        } else {
          // Continue current block
          currentBlock.duration = (currentBlock.duration || 0) + 1;
        }
      } else {
        // No allocation - finish current block if exists
        if (currentBlock) {
          newBlocks.push({
            id: Date.now().toString() + Math.random(),
            startTime: "",
            endTime: "",
            duration: currentBlock.duration || 0,
            category: currentBlock.category!,
            title: `${currentBlock.category?.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())} Time`,
            location: "",
            notes: "",
            assignedCoach: currentBlock.assignedCoach,
          });
          currentBlock = null;
        }
      }
    }

    // Don't forget the last block
    if (currentBlock) {
      newBlocks.push({
        id: Date.now().toString() + Math.random(),
        startTime: "",
        endTime: "",
        duration: currentBlock.duration || 0,
        category: currentBlock.category!,
        title: `${currentBlock.category?.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())} Time`,
        location: "",
        notes: "",
        assignedCoach: currentBlock.assignedCoach,
      });
    }

    const blocksWithTimes = memoizedRecalculateBlockTimes(newBlocks);
    setPracticeBlocks(blocksWithTimes);

    // Save to localStorage
    const savedPracticeKey = `practice_plan_${event.id || "default"}`;
    try {
      const blocksToSave = blocksWithTimes.map((block) => ({
        ...block,
        startTime: "",
        endTime: "",
      }));
      localStorage.setItem(savedPracticeKey, JSON.stringify(blocksToSave));
      console.log("Time allocation saved to localStorage");
    } catch (error) {
      console.error("Error saving time allocation:", error);
    }

    setScaffoldMode(false);
    setTimelineAllocation({});
    setSelectedCategory(null);
    setSelectedBlock(null);
    setOriginalBlocksBeforeScaffold([]);
  }, [
    timelineAllocation,
    scheduledDuration,
    memoizedRecalculateBlockTimes,
    event.id,
  ]);

  // TODO: Implement remaining handlers for full integration
  const handleDragEnd = useCallback(() => {
    console.log("handleDragEnd - TODO: implement");
  }, []);

  const handleAddBlock = useCallback(() => {
    console.log("handleAddBlock - TODO: implement");
  }, []);

  const handleEditBlock = useCallback((block: PracticeBlock) => {
    // This opens a modal or form to edit the block
    // For now, we'll just log it - the actual editing happens in modals
    console.log("Edit block:", block);
    // TODO: Implement block editing modal or inline editing
  }, []);

  const handleRemoveBlock = useCallback(
    (id: string) => {
      setPracticeBlocks((prevBlocks) => {
        const updatedBlocks = prevBlocks.filter((block) => block.id !== id);
        const blocksWithTimes = memoizedRecalculateBlockTimes(updatedBlocks);

        // Save to localStorage
        savePracticeToStorage(blocksWithTimes, event.id || "");

        return blocksWithTimes;
      });
    },
    [event.id, memoizedRecalculateBlockTimes]
  );

  const handleAddGroup = useCallback((blockId: string) => {
    // Open the Add Group modal for the specified block
    setEditingGroup({
      blockId,
      group: {
        id: "", // Empty ID indicates new group
        name: "",
        location: "",
        notes: "",
      },
    });
  }, []);

  const handleEditGroup = useCallback(() => {
    console.log("handleEditGroup - TODO: implement");
  }, []);

  const handleUpdateGroup = useCallback(() => {
    console.log("handleUpdateGroup - TODO: implement");
  }, []);

  const handleRemoveGroup = useCallback(
    (blockId: string, groupId: string) => {
      setPracticeBlocks((prevBlocks) => {
        const updatedBlocks = prevBlocks.map((block) => {
          if (block.id === blockId) {
            return {
              ...block,
              groups:
                block.groups?.filter((group) => group.id !== groupId) || [],
            };
          }
          return block;
        });

        const blocksWithTimes = memoizedRecalculateBlockTimes(updatedBlocks);

        // Save to localStorage
        savePracticeToStorage(blocksWithTimes, event.id || "");

        return blocksWithTimes;
      });
    },
    [event.id, memoizedRecalculateBlockTimes]
  );

  const handleAddScriptToBlock = useCallback((blockId: string) => {
    // Set the selected block and open script selector
    setSelectedBlockForScript(blockId);
    setShowScriptSelector(true);
  }, []);

  const handleAddScriptToGroup = useCallback(
    (blockId: string, groupId: string) => {
      // Set the selected group and open script selector
      setSelectedGroupForScript({ blockId, groupId });
      setShowScriptSelector(true);
    },
    []
  );

  const handleRemoveScriptFromGroup = useCallback(
    (blockId: string, groupId: string) => {
      setPracticeBlocks((prevBlocks) => {
        const updatedBlocks = prevBlocks.map((block) => {
          if (block.id === blockId) {
            return {
              ...block,
              groups:
                block.groups?.map((group) => {
                  if (group.id === groupId) {
                    return {
                      ...group,
                      scriptId: undefined,
                      scriptTitle: undefined,
                    };
                  }
                  return group;
                }) || [],
            };
          }
          return block;
        });

        const blocksWithTimes = memoizedRecalculateBlockTimes(updatedBlocks);

        // Save to localStorage
        savePracticeToStorage(blocksWithTimes, event.id || "");

        return blocksWithTimes;
      });
    },
    [event.id, memoizedRecalculateBlockTimes]
  );

  const handleAutoAssignCoaches = useCallback(() => {
    setPracticeBlocks((prevBlocks) => {
      const updatedBlocks = prevBlocks.map((block) => {
        // Auto-assign coaches based on block category
        let assignedCoach = "";
        switch (block.category) {
          case "offense":
            assignedCoach = "Offensive Coordinator";
            break;
          case "defense":
            assignedCoach = "Defensive Coordinator";
            break;
          case "special-teams":
            assignedCoach = "Special Teams Coach";
            break;
          case "meeting":
            assignedCoach = "Head Coach";
            break;
          case "weight-room":
            assignedCoach = "Strength Coach";
            break;
          default:
            assignedCoach = "Head Coach";
        }

        return {
          ...block,
          assignedCoach,
        };
      });

      const blocksWithTimes = memoizedRecalculateBlockTimes(updatedBlocks);

      // Save to localStorage
      savePracticeToStorage(blocksWithTimes, event.id || "");

      return blocksWithTimes;
    });
  }, [event.id, memoizedRecalculateBlockTimes]);

  // Script assignment functions
  const assignScriptToBlock = useCallback(
    (blockId: string, script: { id: string; title: string }) => {
      setPracticeBlocks((prevBlocks) => {
        const updatedBlocks = prevBlocks.map((block) => {
          if (block.id === blockId) {
            return {
              ...block,
              scriptId: script.id,
              scriptTitle: script.title,
            };
          }
          return block;
        });

        const blocksWithTimes = memoizedRecalculateBlockTimes(updatedBlocks);

        // Save to localStorage
        savePracticeToStorage(blocksWithTimes, event.id || "");

        return blocksWithTimes;
      });
    },
    [event.id, memoizedRecalculateBlockTimes]
  );

  const assignScriptToGroup = useCallback(
    (
      blockId: string,
      groupId: string,
      script: { id: string; title: string }
    ) => {
      setPracticeBlocks((prevBlocks) => {
        const updatedBlocks = prevBlocks.map((block) => {
          if (block.id === blockId) {
            return {
              ...block,
              groups:
                block.groups?.map((group) => {
                  if (group.id === groupId) {
                    return {
                      ...group,
                      scriptId: script.id,
                      scriptTitle: script.title,
                    };
                  }
                  return group;
                }) || [],
            };
          }
          return block;
        });

        const blocksWithTimes = memoizedRecalculateBlockTimes(updatedBlocks);

        // Save to localStorage
        savePracticeToStorage(blocksWithTimes, event.id || "");

        return blocksWithTimes;
      });
    },
    [event.id, memoizedRecalculateBlockTimes]
  );

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
    setScaffoldMode: setScaffoldModeWithConversion,
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

    // Timeline handlers
    handleTimelineClick,
    handleBlockClick,
    updateSelectedBlockDuration,
    removeEmptyTime,
    saveTimeAllocation,
    handleCancelScaffold,

    // Block and group handlers
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

    // Script assignment functions
    assignScriptToBlock,
    assignScriptToGroup,

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
