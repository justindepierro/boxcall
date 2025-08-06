import React, { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { Typography } from "../../components/design-system";
import { Button, Card } from "../../components/ui";
import { Icon, type IconName } from "../../components/ui/Icon/Icon";
import type { CalendarEvent } from "../../services/calendarService";
import { ScriptSelectorModal } from "./ScriptSelectorModal";
import { PDFExportTrigger } from "./LazyPDFExport";

interface PracticeGroup {
  id: string;
  name: string;
  location: string;
  notes: string;
  scriptId?: string;
  scriptTitle?: string;
}

interface PracticeBlock {
  id: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  category:
    | "offense"
    | "defense"
    | "special-teams"
    | "meeting"
    | "weight-room"
    | "transition"
    | "break";
  title: string;
  location: string;
  notes: string;
  scriptId?: string;
  scriptTitle?: string;
  assignedCoach?: string;
  isHeadCoachBlock?: boolean; // Head coach allocates time blocks, position coaches fill details
  groups?: PracticeGroup[]; // Sub-groups within this practice block
}

interface PracticePlannerModalProps {
  event: CalendarEvent;
  onClose: () => void;
}

export const PracticePlannerModal: React.FC<PracticePlannerModalProps> = ({
  event,
  onClose,
}) => {
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
  ); // Mock role
  const [timeAllocationMode, setTimeAllocationMode] = useState(false); // Head coach time allocation mode
  const [scaffoldMode, setScaffoldMode] = useState(false); // Head coach scaffold/timeline mode
  const [selectedCategory, setSelectedCategory] = useState<
    PracticeBlock["category"] | null
  >(null);
  const [timelineAllocation, setTimelineAllocation] = useState<{
    [key: number]: {
      category: PracticeBlock["category"];
      assignedCoach?: string;
      title?: string;
    };
  }>({});
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<{
    start: number;
    duration: number;
    category: PracticeBlock["category"];
  } | null>(null);
  const [sliderValue, setSliderValue] = useState<number>(5);
  const [lastSaveMessage, setLastSaveMessage] = useState<string | null>(null);
  const [originalBlocksBeforeScaffold, setOriginalBlocksBeforeScaffold] =
    useState<PracticeBlock[]>([]);
  const [showAddGroup, setShowAddGroup] = useState<string | null>(null); // Block ID for which we're adding a group
  const [editingGroup, setEditingGroup] = useState<{
    blockId: string;
    group: PracticeGroup;
  } | null>(null);
  const [newGroup, setNewGroup] = useState<Partial<PracticeGroup>>({
    name: "",
    location: "",
    notes: "",
  });

  // Recalculate start/end times for blocks in order
  const recalculateBlockTimes = useCallback(
    (blocks: PracticeBlock[]) => {
      if (!event.start || blocks.length === 0) return blocks;

      const startTime = new Date(event.start);
      let currentMinutes = 0;

      return blocks.map((block) => {
        const blockStart = new Date(
          startTime.getTime() + currentMinutes * 60000
        );
        currentMinutes += block.duration;
        const blockEnd = new Date(startTime.getTime() + currentMinutes * 60000);

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

  // Calculate practice duration from event start/end times
  useEffect(() => {
    if (event.start && event.end) {
      const start = new Date(event.start);
      const end = new Date(event.end);
      const duration = (end.getTime() - start.getTime()) / (1000 * 60); // Convert to minutes
      setScheduledDuration(duration);
    }
  }, [event]);

  // Load sample practice data for demonstration
  useEffect(() => {
    // Always check for saved practice data for this event first
    const savedPracticeKey = `practice_plan_${event.id || "default"}`;
    const savedPractice = localStorage.getItem(savedPracticeKey);

    console.log(
      "Modal opened, checking for saved data with key:",
      savedPracticeKey
    );

    if (savedPractice) {
      // Load saved practice plan
      try {
        const savedBlocks = JSON.parse(savedPractice);
        console.log("Raw saved blocks from localStorage:", savedBlocks);
        const blocksWithTimes = recalculateBlockTimes(savedBlocks);
        console.log(
          "Loading saved practice plan with recalculated times:",
          blocksWithTimes
        );
        setPracticeBlocks(blocksWithTimes);
        return; // Exit early, don't load sample data
      } catch (error) {
        console.error("Error loading saved practice plan:", error);
        // Fall through to load sample data if saved data is corrupted
      }
    } else {
      console.log("No saved practice data found, loading sample data");
    }

    // Only load sample data if no saved data exists
    // Sample practice plan matching your example
    const sampleBlocks: PracticeBlock[] = [
      {
        id: "1",
        startTime: "",
        endTime: "",
        duration: 5,
        category: "meeting",
        title: "Team Meeting",
        location: "Room 1",
        notes: "Review practice objectives and safety reminders",
        groups: [
          {
            id: "g1",
            name: "Team Captains",
            location: "Front of room",
            notes: "Lead the discussion",
          },
        ],
      },
      {
        id: "2",
        startTime: "",
        endTime: "",
        duration: 25,
        category: "weight-room",
        title: "Weight Room",
        location: "Weight Room",
        notes: "Bring sneakers and water bottles",
        groups: [
          {
            id: "g2",
            name: "Upperclassmen",
            location: "Main floor",
            notes: "Advanced routine",
          },
          {
            id: "g3",
            name: "Underclassmen",
            location: "Side room",
            notes: "Basic conditioning",
          },
        ],
      },
      {
        id: "3",
        startTime: "",
        endTime: "",
        duration: 5,
        category: "transition",
        title: "Transition to Field",
        location: "Field",
        notes: "Bring helmets only",
      },
      {
        id: "4",
        startTime: "",
        endTime: "",
        duration: 5,
        category: "offense",
        title: "Individual Offense",
        location: "Field",
        notes: "Position-specific drills",
        scriptTitle: "O Warm up offense on air 5 plays",
        groups: [
          {
            id: "g4",
            name: "Quarterbacks",
            location: "Field A",
            notes: "Footwork drills",
            scriptTitle: "QB Footwork Series",
          },
          {
            id: "g5",
            name: "Wide Receivers",
            location: "Field B",
            notes: "Route running",
          },
          {
            id: "g6",
            name: "O-Line",
            location: "Field C",
            notes: "Pass protection",
          },
        ],
      },
    ];

    // Calculate times for the sample blocks
    const blocksWithTimes = recalculateBlockTimes(sampleBlocks);
    setPracticeBlocks(blocksWithTimes);
  }, [event.id, recalculateBlockTimes]);

  // Calculate total planned duration
  useEffect(() => {
    const total = practiceBlocks.reduce(
      (sum, block) => sum + block.duration,
      0
    );
    setTotalDuration(total);
  }, [practiceBlocks]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (selectedBlock) {
          // Exit block resizing mode
          setSelectedBlock(null);
        } else if (editingGroup) {
          setEditingGroup(null);
        } else if (showAddGroup) {
          setShowAddGroup(null);
          setNewGroup({ name: "", location: "", notes: "" });
        } else if (showEditBlock) {
          setShowEditBlock(false);
          setEditingBlock(null);
        } else if (showAddBlock) {
          setShowAddBlock(false);
          setNewBlock({
            category: "meeting",
            location: "",
            notes: "",
            title: "",
          });
        }
      } else if (
        (event.key === " " || event.key === "Enter") &&
        selectedBlock
      ) {
        // Save block resize and exit
        event.preventDefault();
        setSelectedBlock(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showEditBlock, showAddBlock, selectedBlock, showAddGroup, editingGroup]);

  // Check for scheduling conflicts
  const checkForConflicts = (
    newBlock: PracticeBlock,
    existingBlocks: PracticeBlock[]
  ) => {
    // For now, just check total duration vs scheduled duration
    const totalWithNew =
      existingBlocks.reduce((sum, block) => sum + block.duration, 0) +
      newBlock.duration;
    return totalWithNew > scheduledDuration;
  };

  const addPracticeBlock = () => {
    if (!newBlock.title || !newBlock.duration || !newBlock.category) return;

    const block: PracticeBlock = {
      id: Date.now().toString(),
      startTime: "",
      endTime: "",
      duration: newBlock.duration || 0,
      category: newBlock.category || "meeting",
      title: newBlock.title || "",
      location: newBlock.location || "",
      notes: newBlock.notes || "",
    };

    // Check for conflicts before adding
    const hasConflict = checkForConflicts(block, practiceBlocks);

    if (hasConflict) {
      // Show confirmation dialog for overtime
      if (
        confirm(
          `This will make your practice ${totalDuration + block.duration - scheduledDuration} minutes over the scheduled time. Are you sure you want to continue?`
        )
      ) {
        const newBlocks = [...practiceBlocks, block];
        const blocksWithTimes = recalculateBlockTimes(newBlocks);
        setPracticeBlocks(blocksWithTimes);
        setNewBlock({
          category: "meeting",
          location: "",
          notes: "",
          title: "",
        });
        setShowAddBlock(false);
      }
    } else {
      const newBlocks = [...practiceBlocks, block];
      const blocksWithTimes = recalculateBlockTimes(newBlocks);
      setPracticeBlocks(blocksWithTimes);
      setNewBlock({ category: "meeting", location: "", notes: "", title: "" });
      setShowAddBlock(false);
    }
  };

  const updatePracticeBlock = () => {
    if (
      !editingBlock ||
      !editingBlock.title ||
      !editingBlock.duration ||
      !editingBlock.category
    ) {
      console.log("Validation failed:", { editingBlock });
      return;
    }

    console.log("Updating block:", editingBlock);

    const updatedBlocks = practiceBlocks.map((block) =>
      block.id === editingBlock.id ? { ...editingBlock } : block
    );

    console.log("Updated blocks:", updatedBlocks);

    const blocksWithTimes = recalculateBlockTimes(updatedBlocks);
    setPracticeBlocks(blocksWithTimes);
    setEditingBlock(null);
    setShowEditBlock(false);
  };

  const removePracticeBlock = (id: string) => {
    const newBlocks = practiceBlocks.filter((block) => block.id !== id);
    const blocksWithTimes = recalculateBlockTimes(newBlocks);
    setPracticeBlocks(blocksWithTimes);
  };

  const addScriptToBlock = (
    blockId: string,
    script: { id: string; title: string }
  ) => {
    setPracticeBlocks(
      practiceBlocks.map((block) =>
        block.id === blockId
          ? { ...block, scriptId: script.id, scriptTitle: script.title }
          : block
      )
    );
  };

  // Group management functions
  const addGroupToBlock = (blockId: string) => {
    if (!newGroup.name) return;

    const group: PracticeGroup = {
      id: Date.now().toString(),
      name: newGroup.name || "",
      location: newGroup.location || "",
      notes: newGroup.notes || "",
    };

    setPracticeBlocks(
      practiceBlocks.map((block) =>
        block.id === blockId
          ? { ...block, groups: [...(block.groups || []), group] }
          : block
      )
    );

    setNewGroup({ name: "", location: "", notes: "" });
    setShowAddGroup(null);
  };

  const updateGroup = (blockId: string, updatedGroup: PracticeGroup) => {
    setPracticeBlocks(
      practiceBlocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              groups: block.groups?.map((group) =>
                group.id === updatedGroup.id ? updatedGroup : group
              ),
            }
          : block
      )
    );
    setEditingGroup(null);
  };

  const removeGroup = (blockId: string, groupId: string) => {
    setPracticeBlocks(
      practiceBlocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              groups: block.groups?.filter((group) => group.id !== groupId),
            }
          : block
      )
    );
  };

  const addScriptToGroup = (
    blockId: string,
    groupId: string,
    script: { id: string; title: string }
  ) => {
    setPracticeBlocks(
      practiceBlocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              groups: block.groups?.map((group) =>
                group.id === groupId
                  ? { ...group, scriptId: script.id, scriptTitle: script.title }
                  : group
              ),
            }
          : block
      )
    );
  };

  // Handle drag and drop reordering
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(practiceBlocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update start/end times based on new order
    const updatedBlocks = recalculateBlockTimes(items);
    setPracticeBlocks(updatedBlocks);
  };

  const handleCreateNewScript = () => {
    // TODO: Navigate to Playbook/Script creation page
    console.log("Navigate to script creation");
    // In real implementation: navigate to /playbook/scripts/new
  };

  const getCategoryColor = (category: PracticeBlock["category"]) => {
    switch (category) {
      case "offense":
        return "bg-blue-100 text-blue-800";
      case "defense":
        return "bg-red-100 text-red-800";
      case "special-teams":
        return "bg-green-100 text-green-800";
      case "meeting":
        return "bg-purple-100 text-purple-800";
      case "weight-room":
        return "bg-orange-100 text-orange-800";
      case "transition":
        return "bg-gray-100 text-gray-800";
      case "break":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Timeline allocation functions
  const handleTimelineClick = (minute: number) => {
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
  };

  const removeEmptyTime = () => {
    // Find all allocated minutes and compress to the left
    const allocatedMinutes = Object.entries(timelineAllocation)
      .filter(([_, allocation]) => allocation)
      .sort(([a], [b]) => parseInt(a) - parseInt(b));

    const newAllocation: typeof timelineAllocation = {};
    allocatedMinutes.forEach(([_, allocation], index) => {
      newAllocation[index] = allocation;
    });

    setTimelineAllocation(newAllocation);
  };

  const updateBlockDuration = (
    category: string,
    currentMinutes: number,
    newMinutes: number
  ) => {
    if (newMinutes <= 0) return;

    // Find all minutes for this category and group into blocks
    const categoryMinutes = Object.entries(timelineAllocation)
      .filter(([_, allocation]) => allocation.category === category)
      .map(([minute]) => parseInt(minute))
      .sort((a, b) => a - b);

    // Group into consecutive blocks
    const blocks: { start: number; duration: number }[] = [];
    let currentBlock: { start: number; duration: number } | null = null;

    categoryMinutes.forEach((minute) => {
      if (
        !currentBlock ||
        minute !== currentBlock.start + currentBlock.duration
      ) {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = { start: minute, duration: 1 };
      } else {
        currentBlock.duration++;
      }
    });
    if (currentBlock) blocks.push(currentBlock);

    // Find the block that matches the current duration
    const targetBlock = blocks.find(
      (block) => block.duration === currentMinutes
    );
    if (!targetBlock) return;

    // Remove the old block
    const newAllocation = { ...timelineAllocation };
    for (
      let i = targetBlock.start;
      i < targetBlock.start + targetBlock.duration;
      i++
    ) {
      delete newAllocation[i];
    }

    // Add the new block with updated duration
    for (
      let i = 0;
      i < newMinutes && targetBlock.start + i < scheduledDuration;
      i++
    ) {
      newAllocation[targetBlock.start + i] = {
        category: category as PracticeBlock["category"],
      };
    }

    setTimelineAllocation(newAllocation);
  };

  const handleBlockClick = (minute: number) => {
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
  };

  const updateSelectedBlockDuration = (newDuration: number) => {
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
  };

  const savePracticePlan = () => {
    let finalBlocks = practiceBlocks;

    // If we're in scaffold mode with timeline allocations, convert them to practice blocks first
    if (scaffoldMode && Object.keys(timelineAllocation).length > 0) {
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

      const blocksWithTimes = recalculateBlockTimes(newBlocks);
      finalBlocks = blocksWithTimes;
    }

    // Save to localStorage for persistence
    const savedPracticeKey = `practice_plan_${event.id || "default"}`;
    try {
      // Remove startTime and endTime before saving since they'll be recalculated
      const blocksToSave = finalBlocks.map(
        ({ startTime: _startTime, endTime: _endTime, ...block }) => block
      );
      console.log("Saving practice blocks with groups:", blocksToSave);
      localStorage.setItem(savedPracticeKey, JSON.stringify(blocksToSave));
      console.log("Practice plan saved to localStorage:", finalBlocks);

      // Show success message
      const successMessage = `Practice plan saved! ${finalBlocks.length} blocks planned for ${finalBlocks.reduce((sum, block) => sum + block.duration, 0)} minutes.`;
      setLastSaveMessage(successMessage);

      // Auto-clear success message after 5 seconds
      setTimeout(() => setLastSaveMessage(null), 5000);

      // Ask if user wants to close
      const shouldClose = confirm(
        `${successMessage}\n\nWould you like to close the practice planner and return to your previous page?\n\n(Click Cancel to continue editing)`
      );

      if (shouldClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error saving practice plan:", error);
      alert("Error saving practice plan. Please try again.");
    }
  };

  const saveTimeAllocation = () => {
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

    const blocksWithTimes = recalculateBlockTimes(newBlocks);
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
  };

  const isOvertime = totalDuration > scheduledDuration;

  // Prepare practice data for PDF export
  const preparePracticeDataForPDF = () => {
    // Convert practice blocks to PDF format
    const pdfBlocks = practiceBlocks.map((block) => ({
      id: block.id,
      title: block.title,
      category: block.category,
      duration: block.duration,
      startTime: block.startTime || "",
      endTime: block.endTime || "",
      location: block.location || "",
      notes: block.notes || "",
      assignedCoach: block.assignedCoach || "",
      scriptId: block.scriptId,
      scriptTitle: block.scriptTitle,
      groups: block.groups?.map((group) => ({
        id: group.id,
        name: group.name,
        location: group.location || "",
        notes: group.notes || "",
        scriptId: group.scriptId,
        scriptTitle: group.scriptTitle,
      })),
    }));

    // Calculate category breakdown
    const categoryBreakdown: Record<string, number> = {};
    const coachUtilization: Record<string, number> = {};
    let totalMinutes = 0;

    practiceBlocks.forEach((block) => {
      categoryBreakdown[block.category] =
        (categoryBreakdown[block.category] || 0) + block.duration;
      totalMinutes += block.duration;

      if (block.assignedCoach) {
        coachUtilization[block.assignedCoach] =
          (coachUtilization[block.assignedCoach] || 0) + block.duration;
      }
    });

    return {
      title: event.title || "Practice Plan",
      date: new Date(event.start).toLocaleDateString(),
      duration: totalDuration,
      location: "", // Could be extracted from event location
      weather: undefined,
      blocks: pdfBlocks,
      coaches: [
        // Mock coach data - could be enhanced with real data
        {
          id: "1",
          name: "Head Coach",
          role: "Head Coach",
          assignments: ["Overall direction"],
        },
        {
          id: "2",
          name: "Offensive Coordinator",
          role: "OC",
          assignments: ["Offense blocks"],
        },
        {
          id: "3",
          name: "Defensive Coordinator",
          role: "DC",
          assignments: ["Defense blocks"],
        },
        {
          id: "4",
          name: "Special Teams Coach",
          role: "STC",
          assignments: ["Special teams"],
        },
      ],
      equipment: [
        // Mock equipment data
        { item: "Cones", quantity: 20, location: "Equipment shed" },
        { item: "Footballs", quantity: 10, location: "Equipment room" },
        { item: "Blocking pads", quantity: 8, location: "Field storage" },
      ],
      summary: {
        totalMinutes,
        categoryBreakdown,
        coachUtilization,
        objectives: [
          "Team coordination improvement",
          "Skill development focus",
          "Game preparation",
        ],
      },
    };
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        // Only close if clicking the backdrop, not the modal content
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <Typography
                variant="headline-lg"
                className="text-navy-900 flex items-center"
              >
                <Icon name="file" size="lg" className="mr-2" color="navy" />
                Practice Planner
              </Typography>
              <Typography variant="body-md" color="muted" className="mt-1">
                {event.title} - {new Date(event.start).toLocaleDateString()}
              </Typography>
              <div className="mt-2 flex items-center space-x-4">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium flex items-center ${userRole === "head_coach" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}
                >
                  {userRole === "head_coach" ? (
                    <>
                      <Icon name="crown" size="xs" className="mr-1" />
                      Head Coach
                    </>
                  ) : (
                    <>
                      <Icon name="user" size="xs" className="mr-1" />
                      Position Coach
                    </>
                  )}
                </span>
                <Typography variant="body-sm" color="muted">
                  {userRole === "head_coach"
                    ? "Allocate time blocks and assign position coaches"
                    : "Fill in detailed drills for your assigned time blocks"}
                </Typography>
                {userRole === "head_coach" && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setTimeAllocationMode(!timeAllocationMode)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center ${
                        timeAllocationMode
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      <Icon name="bar-chart" size="xs" className="mr-1" />
                      {timeAllocationMode
                        ? "Time Allocation Mode"
                        : "Enable Time Allocation"}
                    </button>
                    <button
                      onClick={() => {
                        setScaffoldMode(!scaffoldMode);
                        if (!scaffoldMode) {
                          // Entering scaffold mode - store original blocks and convert to timeline allocation
                          let blocksToConvert = practiceBlocks;
                          console.log(
                            "Entering scaffold mode with current blocks:",
                            practiceBlocks
                          );

                          // Store current blocks as backup for cancel functionality
                          setOriginalBlocksBeforeScaffold([...practiceBlocks]);

                          // If we don't have current blocks, try to load from localStorage first
                          if (practiceBlocks.length === 0) {
                            console.log(
                              "No current blocks, trying to load from localStorage..."
                            );
                            const savedPracticeKey = `practice_plan_${event.id || "default"}`;
                            const savedPractice =
                              localStorage.getItem(savedPracticeKey);

                            if (savedPractice) {
                              try {
                                const savedBlocks = JSON.parse(savedPractice);
                                const blocksWithTimes =
                                  recalculateBlockTimes(savedBlocks);
                                console.log(
                                  "Loaded saved blocks for scaffold mode:",
                                  blocksWithTimes
                                );
                                setPracticeBlocks(blocksWithTimes);
                                setOriginalBlocksBeforeScaffold([
                                  ...blocksWithTimes,
                                ]);
                                blocksToConvert = blocksWithTimes;
                              } catch (error) {
                                console.error(
                                  "Error loading saved practice plan for scaffold mode:",
                                  error
                                );
                              }
                            } else {
                              console.log(
                                "No saved practice data found in localStorage"
                              );
                            }
                          }

                          // Convert blocks to timeline allocation
                          const allocation: typeof timelineAllocation = {};
                          let currentMinute = 0;
                          blocksToConvert.forEach((block) => {
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
                            "Created timeline allocation:",
                            allocation
                          );
                          setTimelineAllocation(allocation);
                        } else {
                          // Exiting scaffold mode - clear timeline allocation
                          setTimelineAllocation({});
                          setSelectedCategory(null);
                          setSelectedBlock(null);
                          setOriginalBlocksBeforeScaffold([]);
                        }
                      }}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center ${
                        scaffoldMode
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      <Icon
                        name={scaffoldMode ? "file" : "target"}
                        size="xs"
                        className="mr-1"
                      />
                      {scaffoldMode
                        ? "Scaffold Mode"
                        : "Enable Practice Scaffold"}
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* PDF Export Button - Lazy Loading */}
              <PDFExportTrigger
                practiceData={{
                  practiceBlocks: practiceBlocks,
                  metadata: {
                    title: eventData?.title || "Practice Plan",
                    date: eventData?.date || new Date().toISOString(),
                    duration: totalDuration,
                    coach: "Head Coach",
                    team: "Team",
                  },
                }}
                buttonClassName="bg-jade-600 hover:bg-jade-700 text-white font-medium flex items-center"
                buttonText="Print Practice to PDF"
                iconName="pdf"
              />

              {/* Close Button */}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size="lg" />
              </button>
            </div>
          </div>

          {/* Success Message Banner */}
          {lastSaveMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-green-800 font-medium">
                  {lastSaveMessage}
                </span>
              </div>
              <button
                onClick={() => setLastSaveMessage(null)}
                className="text-green-600 hover:text-green-800"
              >
                <Icon name="close" size="sm" />
              </button>
            </div>
          )}

          {/* Time Summary */}
          <Card className="p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Typography variant="body-md" className="font-medium">
                  Practice Duration: {scheduledDuration} minutes
                </Typography>
                <Typography variant="body-sm" color="muted">
                  {event.start && new Date(event.start).toLocaleTimeString()} -{" "}
                  {event.end && new Date(event.end).toLocaleTimeString()}
                </Typography>
              </div>
              <div className="text-right">
                <Typography
                  variant="body-md"
                  className={`font-medium ${isOvertime ? "text-red-600" : "text-green-600"}`}
                >
                  Planned: {totalDuration} minutes
                </Typography>
                {isOvertime && (
                  <Typography
                    variant="body-sm"
                    className="text-red-600 flex items-center"
                  >
                    <Icon name="alert-triangle" size="xs" className="mr-1" />
                    {totalDuration - scheduledDuration} minutes overtime
                  </Typography>
                )}
              </div>
            </div>

            {/* Category Breakdown */}
            {practiceBlocks.length > 0 && (
              <div>
                <Typography variant="body-sm" className="font-medium mb-2">
                  Time Allocation by Category:
                </Typography>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                  {[
                    "offense",
                    "defense",
                    "special-teams",
                    "meeting",
                    "weight-room",
                    "transition",
                    "break",
                  ].map((category) => {
                    const categoryBlocks = practiceBlocks.filter(
                      (block) => block.category === category
                    );
                    const categoryTime = categoryBlocks.reduce(
                      (sum, block) => sum + block.duration,
                      0
                    );
                    if (categoryTime === 0) return null;

                    return (
                      <div
                        key={category}
                        className={`px-2 py-1 rounded text-center ${getCategoryColor(category as PracticeBlock["category"])}`}
                      >
                        <div className="font-medium capitalize">
                          {category.replace("-", " ")}
                        </div>
                        <div>{categoryTime}m</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>

          {/* Practice Blocks */}
          <div className="mb-6">
            {scaffoldMode ? (
              // Scaffold Mode - Time Allocation Interface
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Typography
                      variant="headline-md"
                      className="flex items-center gap-2"
                    >
                      <Icon name="clock" size="md" />
                      Allocate Practice Time
                    </Typography>
                    <Typography
                      variant="body-sm"
                      color="muted"
                      className="mt-1"
                    >
                      Select a category below, then click and drag on the
                      timeline to allocate time blocks
                    </Typography>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Restore original blocks before scaffold mode
                        console.log(
                          "Canceling scaffold mode, restoring original blocks:",
                          originalBlocksBeforeScaffold
                        );
                        setPracticeBlocks(originalBlocksBeforeScaffold);
                        setScaffoldMode(false);
                        setTimelineAllocation({});
                        setSelectedCategory(null);
                        setSelectedBlock(null);
                        setOriginalBlocksBeforeScaffold([]);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={saveTimeAllocation}
                    >
                      Save Time Allocation
                    </Button>
                  </div>
                </div>

                {/* Category Selector */}
                <Card className="p-4 mb-4">
                  <Typography variant="body-md" className="font-medium mb-3">
                    Select Category to Allocate:
                  </Typography>
                  <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                    {[
                      { key: "meeting", label: "Meeting", icon: "file" },
                      {
                        key: "weight-room",
                        label: "Weight Room",
                        icon: "activity",
                      },
                      {
                        key: "transition",
                        label: "Transition",
                        icon: "arrow-right",
                      },
                      { key: "offense", label: "Offense", icon: "target" },
                      { key: "defense", label: "Defense", icon: "shield" },
                      {
                        key: "special-teams",
                        label: "Special Teams",
                        icon: "zap",
                      },
                      { key: "break", label: "Break", icon: "pause" },
                    ].map((category) => (
                      <button
                        key={category.key}
                        onClick={() =>
                          setSelectedCategory(
                            category.key as PracticeBlock["category"]
                          )
                        }
                        className={`p-3 rounded-lg border-2 transition-all text-center ${
                          selectedCategory === category.key
                            ? `border-blue-500 ${getCategoryColor(category.key as PracticeBlock["category"])} shadow-md`
                            : `border-gray-200 ${getCategoryColor(category.key as PracticeBlock["category"])} hover:border-gray-300`
                        }`}
                      >
                        <div className="mb-1">
                          <Icon name={category.icon as IconName} size="lg" />
                        </div>
                        <div className="text-xs font-medium">
                          {category.label}
                        </div>
                      </button>
                    ))}
                  </div>
                  {selectedCategory && (
                    <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                      <Typography
                        variant="body-sm"
                        className="text-blue-800 flex items-center"
                      >
                        <Icon name="target" size="xs" className="mr-1" />
                        Selected:{" "}
                        <strong className="ml-1">
                          {selectedCategory
                            .replace("-", " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </strong>
                        {isSelecting && " - Click to finish selection"}
                        {!isSelecting &&
                          " - Click timeline to add 5-minute blocks (auto-aligned)"}
                      </Typography>
                      <Typography
                        variant="body-xs"
                        className="text-blue-600 mt-1 flex items-center"
                      >
                        <Icon name="info" size="xs" className="mr-1" />
                        Click empty areas to add 5-minute blocks. Click existing
                        blocks to resize with slider.
                      </Typography>
                    </div>
                  )}
                </Card>

                {/* Timeline Visualization */}
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <Typography variant="body-md" className="font-medium">
                      Practice Timeline ({scheduledDuration} minutes)
                    </Typography>
                    <div className="flex space-x-2">
                      <button
                        onClick={removeEmptyTime}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 flex items-center"
                      >
                        <Icon name="arrow-right" size="xs" className="mr-1" />
                        Remove Empty Time
                      </button>
                      <button
                        onClick={() => setTimelineAllocation({})}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 flex items-center"
                      >
                        <Icon name="delete" size="xs" className="mr-1" />
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {/* Time markers - every 5 minutes */}
                    <div className="flex text-xs text-gray-500 mb-2">
                      {Array.from(
                        { length: Math.ceil(scheduledDuration / 5) },
                        (_, i) => (
                          <div
                            key={i}
                            className="flex-1 text-center border-r border-gray-200 last:border-r-0"
                            style={{ flexBasis: "5%" }}
                          >
                            {i * 5}min
                          </div>
                        )
                      )}
                    </div>

                    {/* Timeline blocks */}
                    <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                      {Array.from(
                        { length: scheduledDuration },
                        (_, minute) => {
                          const allocation = timelineAllocation[minute];
                          const isSelected =
                            isSelecting &&
                            selectionStart !== null &&
                            Math.min(selectionStart, minute) <= minute &&
                            minute <= Math.max(selectionStart, minute);

                          // Add visual separators every 5 minutes
                          const is5MinuteBoundary =
                            minute % 5 === 0 && minute > 0;

                          return (
                            <button
                              key={minute}
                              onClick={() => {
                                if (allocation) {
                                  // Block exists - select it for editing
                                  handleBlockClick(minute);
                                } else {
                                  // No block - add new block
                                  handleTimelineClick(minute);
                                }
                              }}
                              className={`flex-1 h-12 border-r border-gray-200 transition-all hover:scale-105 relative ${
                                selectedBlock &&
                                minute >= selectedBlock.start &&
                                minute <
                                  selectedBlock.start + selectedBlock.duration
                                  ? "ring-2 ring-blue-500 bg-blue-100 border-t-4 border-t-blue-600"
                                  : allocation
                                    ? getCategoryColor(allocation.category)
                                        .replace(
                                          "text-",
                                          "border-t-4 border-t-"
                                        )
                                        .split(" ")[0] +
                                      " " +
                                      getCategoryColor(allocation.category)
                                    : isSelected
                                      ? "bg-blue-200 border-t-4 border-t-blue-500"
                                      : "bg-gray-50 hover:bg-gray-100"
                              } ${is5MinuteBoundary ? "border-l-2 border-l-gray-400" : ""}`}
                              style={{ minWidth: "3px" }}
                              title={`Minute ${minute}${allocation ? ` - ${allocation.category} (click to resize)` : " (click to add block)"}`}
                            >
                              {minute % 5 === 0 && minute > 0 && (
                                <div className="absolute -top-4 left-0 text-xs text-gray-600 font-medium">
                                  {minute}
                                </div>
                              )}
                            </button>
                          );
                        }
                      )}
                    </div>

                    {/* Expandable Slider for Selected Block */}
                    {selectedBlock && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <Typography
                              variant="body-md"
                              className="font-medium text-blue-800 flex items-center"
                            >
                              <Icon name="target" size="sm" className="mr-2" />
                              Resize Block:{" "}
                              {selectedBlock.category
                                .replace("-", " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </Typography>
                            <Typography
                              variant="body-sm"
                              className="text-blue-600"
                            >
                              Block starts at minute {selectedBlock.start},
                              currently {selectedBlock.duration} minutes
                            </Typography>
                            <Typography
                              variant="body-xs"
                              className="text-blue-500 mt-1 flex items-center"
                            >
                              <Icon name="info" size="xs" className="mr-1" />
                              Press Space/Enter to save, Esc to cancel
                            </Typography>
                          </div>
                          <button
                            onClick={() => setSelectedBlock(null)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                          >
                            <Icon name="close" size="sm" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-blue-700 mb-2">
                              Duration: {sliderValue} minutes
                            </label>
                            <input
                              type="range"
                              min="1"
                              max={Math.min(
                                50,
                                scheduledDuration - selectedBlock.start
                              )}
                              value={sliderValue}
                              onChange={(e) => {
                                const newValue = parseInt(e.target.value);
                                setSliderValue(newValue);
                                updateSelectedBlockDuration(newValue);
                              }}
                              className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                              style={{
                                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(sliderValue / Math.min(50, scheduledDuration - selectedBlock.start)) * 100}%, #e5e7eb ${(sliderValue / Math.min(50, scheduledDuration - selectedBlock.start)) * 100}%, #e5e7eb 100%)`,
                              }}
                            />
                            <div className="flex justify-between text-xs text-blue-600 mt-1">
                              <span>1 min</span>
                              <span>
                                {Math.min(
                                  50,
                                  scheduledDuration - selectedBlock.start
                                )}{" "}
                                min max
                              </span>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                const newValue = Math.max(1, sliderValue - 5);
                                setSliderValue(newValue);
                                updateSelectedBlockDuration(newValue);
                              }}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                            >
                              -5 min
                            </button>
                            <button
                              onClick={() => {
                                const newValue = Math.min(
                                  Math.min(
                                    50,
                                    scheduledDuration - selectedBlock.start
                                  ),
                                  sliderValue + 5
                                );
                                setSliderValue(newValue);
                                updateSelectedBlockDuration(newValue);
                              }}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                            >
                              +5 min
                            </button>
                            <button
                              onClick={() => {
                                const newValue = Math.min(
                                  Math.min(
                                    50,
                                    scheduledDuration - selectedBlock.start
                                  ),
                                  sliderValue + 10
                                );
                                setSliderValue(newValue);
                                updateSelectedBlockDuration(newValue);
                              }}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                            >
                              +10 min
                            </button>
                            <button
                              onClick={() => setSelectedBlock(null)}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 ml-2 flex items-center"
                            >
                              <Icon name="check" size="xs" className="mr-1" />
                              Done
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Legend with editable time blocks */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <Typography variant="body-sm" className="font-medium">
                          Current Allocation (Click time to edit):
                        </Typography>
                        <Typography
                          variant="body-xs"
                          color="muted"
                          className="flex items-center"
                        >
                          <Icon name="info" size="xs" className="mr-1" />
                          Click minutes to adjust, press Enter to save
                        </Typography>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {Object.entries(
                          Object.values(timelineAllocation).reduce(
                            (acc, allocation) => {
                              const key = allocation.category;
                              if (!acc[key]) {
                                acc[key] = { count: 0, blocks: [] };
                              }
                              acc[key].count += 1;

                              // Group consecutive minutes into blocks
                              const minutes = Object.entries(timelineAllocation)
                                .filter(
                                  ([_, a]) => a.category === allocation.category
                                )
                                .map(([minute]) => parseInt(minute))
                                .sort((a, b) => a - b);

                              // Find block boundaries
                              const blocks: {
                                start: number;
                                duration: number;
                              }[] = [];
                              let currentBlock: {
                                start: number;
                                duration: number;
                              } | null = null;

                              minutes.forEach((minute) => {
                                if (
                                  !currentBlock ||
                                  minute !==
                                    currentBlock.start + currentBlock.duration
                                ) {
                                  if (currentBlock) blocks.push(currentBlock);
                                  currentBlock = { start: minute, duration: 1 };
                                } else {
                                  currentBlock.duration++;
                                }
                              });
                              if (currentBlock) blocks.push(currentBlock);

                              acc[key].blocks = blocks;
                              return acc;
                            },
                            {} as Record<
                              string,
                              {
                                count: number;
                                blocks: { start: number; duration: number }[];
                              }
                            >
                          )
                        )
                          .map(([category, data]) =>
                            data.blocks.map((block, blockIndex) => (
                              <div
                                key={`${category}-${blockIndex}`}
                                className={`px-3 py-2 rounded-lg border-2 ${getCategoryColor(category as PracticeBlock["category"])} border-opacity-50`}
                              >
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium capitalize">
                                    {category.replace("-", " ")}
                                    {data.blocks.length > 1 &&
                                      ` #${blockIndex + 1}`}
                                  </span>
                                  <div className="flex items-center space-x-1">
                                    <input
                                      type="number"
                                      value={block.duration}
                                      onChange={(e) => {
                                        const newDuration =
                                          parseInt(e.target.value) || 0;
                                        updateBlockDuration(
                                          category,
                                          block.duration,
                                          newDuration
                                        );
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.currentTarget.blur();
                                        }
                                      }}
                                      className="w-12 px-1 py-0.5 text-xs border border-gray-300 rounded text-center"
                                      min="1"
                                      max={scheduledDuration}
                                    />
                                    <span className="text-xs">min</span>
                                  </div>
                                  <span className="text-xs text-gray-600">
                                    ({block.start}-
                                    {block.start + block.duration - 1})
                                  </span>
                                </div>
                              </div>
                            ))
                          )
                          .flat()}

                        {/* Add new block button */}
                        {selectedCategory && (
                          <button
                            onClick={() => {
                              // Find next available spot for new block
                              let nextSpot = 0;
                              while (
                                timelineAllocation[nextSpot] &&
                                nextSpot < scheduledDuration
                              ) {
                                nextSpot++;
                              }

                              // Add 5-minute block if space available
                              if (nextSpot + 4 < scheduledDuration) {
                                const newAllocation = { ...timelineAllocation };
                                for (let i = 0; i < 5; i++) {
                                  newAllocation[nextSpot + i] = {
                                    category: selectedCategory,
                                  };
                                }
                                setTimelineAllocation(newAllocation);
                              }
                            }}
                            className={`px-3 py-2 rounded-lg border-2 border-dashed transition-colors ${getCategoryColor(
                              selectedCategory
                            )
                              .replace("bg-", "border-")
                              .replace("text-", "text-")} hover:bg-opacity-20`}
                          >
                            <div className="flex items-center space-x-1">
                              <span className="text-lg">+</span>
                              <span className="text-xs font-medium">
                                Add {selectedCategory.replace("-", " ")}
                              </span>
                            </div>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              // Normal Mode - Practice Blocks
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Typography variant="headline-md">
                      Practice Schedule
                    </Typography>
                    {practiceBlocks.length > 0 && (
                      <Typography
                        variant="body-sm"
                        color="muted"
                        className="mt-1 flex items-center"
                      >
                        <Icon name="info" size="xs" className="mr-1" />
                        Drag the handle to reorder practice blocks
                      </Typography>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {userRole === "head_coach" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setScaffoldMode(true)}
                        className="flex items-center gap-2"
                      >
                        <Icon name="clock" size="sm" />
                        Allocate Practice Time
                      </Button>
                    )}
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowAddBlock(true)}
                    >
                      + Add Block
                    </Button>

                    {/* PDF Export Button - Main Location */}
                    <PDFExportTrigger
                      practiceData={{
                        practiceBlocks: practiceBlocks,
                        metadata: {
                          title: eventData?.title || "Practice Plan",
                          date: eventData?.date || new Date().toISOString(),
                          duration: totalDuration,
                          coach: "Head Coach",
                          team: "Team",
                        },
                      }}
                      buttonClassName="bg-green-600 hover:bg-green-700 text-white border-green-600 font-medium shadow-lg flex items-center"
                      buttonText="Export Practice PDF"
                      iconName="pdf"
                      size="sm"
                    />
                    {userRole === "head_coach" && practiceBlocks.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Auto-assign coaches based on category
                          const updatedBlocks = practiceBlocks.map((block) => {
                            if (block.assignedCoach) return block; // Don't override existing assignments

                            let suggestedCoach = "";
                            switch (block.category) {
                              case "offense":
                                suggestedCoach = "OC";
                                break;
                              case "defense":
                                suggestedCoach = "DC";
                                break;
                              case "special-teams":
                                suggestedCoach = "STC";
                                break;
                              case "weight-room":
                                suggestedCoach = "Head Coach";
                                break;
                              case "meeting":
                                suggestedCoach = "Head Coach";
                                break;
                              default:
                                suggestedCoach = "";
                            }

                            return { ...block, assignedCoach: suggestedCoach };
                          });

                          const blocksWithTimes =
                            recalculateBlockTimes(updatedBlocks);
                          setPracticeBlocks(blocksWithTimes);
                        }}
                        className="ml-2 flex items-center"
                      >
                        <Icon name="users" size="sm" className="mr-1" />
                        Auto-Assign Coaches
                      </Button>
                    )}
                  </div>
                </div>

                {practiceBlocks.length === 0 ? (
                  <Card className="p-8 text-center">
                    <div className="flex justify-center mb-4">
                      <Icon name="clock" size="3xl" color="jade" />
                    </div>
                    <Typography variant="body-lg" color="muted">
                      No practice blocks planned yet
                    </Typography>
                    <Typography
                      variant="body-md"
                      color="muted"
                      className="mt-2"
                    >
                      Click "Add Block" to start planning your practice
                    </Typography>
                  </Card>
                ) : (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="practice-blocks">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-3"
                        >
                          {practiceBlocks.map((block, index) => (
                            <Draggable
                              key={block.id}
                              draggableId={block.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`p-4 transition-shadow ${
                                    snapshot.isDragging
                                      ? "shadow-lg bg-blue-50"
                                      : ""
                                  } ${
                                    editingBlock?.id === block.id
                                      ? "border-2 border-green-400 bg-green-50"
                                      : ""
                                  }`}
                                >
                                  {editingBlock?.id === block.id ? (
                                    // Edit Mode - Check if Head Coach Time Allocation Mode
                                    timeAllocationMode &&
                                    userRole === "head_coach" ? (
                                      // Head Coach Time Allocation Mode - Simplified Interface
                                      <div>
                                        <div className="flex items-center mb-4">
                                          <div
                                            {...provided.dragHandleProps}
                                            className="cursor-grab active:cursor-grabbing p-2 text-gray-400 hover:text-gray-600 mr-3"
                                          >
                                            ⋮⋮
                                          </div>
                                          <div className="mr-3">
                                            <Icon
                                              name="clock"
                                              size="xl"
                                              color="navy"
                                            />
                                          </div>
                                          <Typography
                                            variant="body-md"
                                            className="font-medium"
                                          >
                                            Time Allocation -{" "}
                                            {editingBlock.title}
                                          </Typography>
                                        </div>

                                        {/* Time Allocation Controls */}
                                        <div className="grid grid-cols-3 gap-4 mb-4">
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                              Duration (minutes)
                                            </label>
                                            <input
                                              type="number"
                                              value={
                                                editingBlock.duration || ""
                                              }
                                              onChange={(e) => {
                                                const newDuration = parseInt(
                                                  e.target.value
                                                );
                                                console.log(
                                                  "Duration changing to:",
                                                  newDuration
                                                );
                                                setEditingBlock({
                                                  ...editingBlock,
                                                  duration: newDuration,
                                                });
                                              }}
                                              placeholder="15"
                                              min="1"
                                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-lg font-medium"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                              Category
                                            </label>
                                            <select
                                              value={
                                                editingBlock.category || ""
                                              }
                                              onChange={(e) => {
                                                const newCategory = e.target
                                                  .value as PracticeBlock["category"];
                                                console.log(
                                                  "Category changing to:",
                                                  newCategory
                                                );
                                                setEditingBlock({
                                                  ...editingBlock,
                                                  category: newCategory,
                                                });
                                              }}
                                              className="w-full border border-gray-300 rounded-md px-3 py-2"
                                            >
                                              <option value="">
                                                Select category
                                              </option>
                                              <option value="offense">
                                                Offense
                                              </option>
                                              <option value="defense">
                                                Defense
                                              </option>
                                              <option value="special-teams">
                                                Special Teams
                                              </option>
                                              <option value="meeting">
                                                Meeting
                                              </option>
                                              <option value="weight-room">
                                                Weight Room
                                              </option>
                                              <option value="transition">
                                                Transition
                                              </option>
                                              <option value="break">
                                                Break
                                              </option>
                                            </select>
                                          </div>
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                              Assigned Coach
                                            </label>
                                            <select
                                              value={
                                                editingBlock.assignedCoach || ""
                                              }
                                              onChange={(e) =>
                                                setEditingBlock({
                                                  ...editingBlock,
                                                  assignedCoach: e.target.value,
                                                })
                                              }
                                              className="w-full border border-gray-300 rounded-md px-3 py-2"
                                            >
                                              <option value="">
                                                Unassigned
                                              </option>
                                              <option value="OC">
                                                Offensive Coordinator
                                              </option>
                                              <option value="DC">
                                                Defensive Coordinator
                                              </option>
                                              <option value="STC">
                                                Special Teams Coach
                                              </option>
                                              <option value="OL">
                                                O-Line Coach
                                              </option>
                                              <option value="WR">
                                                WR/QB Coach
                                              </option>
                                              <option value="RB">
                                                RB Coach
                                              </option>
                                              <option value="DL">
                                                D-Line Coach
                                              </option>
                                              <option value="LB">
                                                LB Coach
                                              </option>
                                              <option value="DB">
                                                DB Coach
                                              </option>
                                            </select>
                                          </div>
                                        </div>

                                        {/* Quick Duration Adjustments */}
                                        <div className="mb-4">
                                          <Typography
                                            variant="body-sm"
                                            className="mb-2 font-medium text-gray-700"
                                          >
                                            Quick Time Adjustments:
                                          </Typography>
                                          <div className="flex flex-wrap gap-2">
                                            <button
                                              onClick={() => {
                                                const newDuration = Math.max(
                                                  1,
                                                  editingBlock.duration - 5
                                                );
                                                setEditingBlock({
                                                  ...editingBlock,
                                                  duration: newDuration,
                                                });
                                              }}
                                              className="px-3 py-2 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200 font-medium"
                                            >
                                              -5 min
                                            </button>
                                            <button
                                              onClick={() => {
                                                const newDuration =
                                                  editingBlock.duration + 5;
                                                setEditingBlock({
                                                  ...editingBlock,
                                                  duration: newDuration,
                                                });
                                              }}
                                              className="px-3 py-2 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200 font-medium"
                                            >
                                              +5 min
                                            </button>
                                            <button
                                              onClick={() => {
                                                const newDuration =
                                                  editingBlock.duration + 10;
                                                setEditingBlock({
                                                  ...editingBlock,
                                                  duration: newDuration,
                                                });
                                              }}
                                              className="px-3 py-2 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200 font-medium"
                                            >
                                              +10 min
                                            </button>
                                            <button
                                              onClick={() => {
                                                const newDuration =
                                                  editingBlock.duration + 15;
                                                setEditingBlock({
                                                  ...editingBlock,
                                                  duration: newDuration,
                                                });
                                              }}
                                              className="px-3 py-2 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 font-medium"
                                            >
                                              +15 min
                                            </button>
                                            <span className="px-4 py-2 bg-blue-50 text-blue-900 rounded text-sm font-bold border border-blue-200">
                                              Current: {editingBlock.duration}{" "}
                                              min
                                            </span>
                                          </div>
                                        </div>

                                        {/* Basic Notes */}
                                        <div className="mb-4">
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Notes for Assigned Coach
                                          </label>
                                          <textarea
                                            value={editingBlock.notes || ""}
                                            onChange={(e) =>
                                              setEditingBlock({
                                                ...editingBlock,
                                                notes: e.target.value,
                                              })
                                            }
                                            placeholder="High-level objectives for this time block..."
                                            rows={2}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                                          />
                                        </div>

                                        <div className="flex space-x-3">
                                          <Button
                                            variant="primary"
                                            onClick={updatePracticeBlock}
                                          >
                                            Save Time Allocation
                                          </Button>
                                          <Button
                                            variant="outline"
                                            onClick={() => {
                                              setShowEditBlock(false);
                                              setEditingBlock(null);
                                            }}
                                          >
                                            Cancel
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                              setTimeAllocationMode(false)
                                            }
                                            className="text-xs"
                                          >
                                            <Icon
                                              name="file"
                                              size="sm"
                                              className="mr-1"
                                            />
                                            Switch to Detail Mode
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      // Standard Edit Mode - Full Detail Interface
                                      <div>
                                        <div className="flex items-center mb-4">
                                          <div
                                            {...provided.dragHandleProps}
                                            className="cursor-grab active:cursor-grabbing p-2 text-gray-400 hover:text-gray-600 mr-3"
                                          >
                                            ⋮⋮
                                          </div>
                                          <div className="mr-3">
                                            <Icon name="edit" size="lg" />
                                          </div>
                                          <Typography
                                            variant="body-md"
                                            className="font-medium"
                                          >
                                            Edit Practice Block
                                          </Typography>
                                        </div>

                                        {/* Quick Duration Changes */}
                                        <div className="mb-4">
                                          <Typography
                                            variant="body-sm"
                                            className="mb-2 font-medium text-gray-700"
                                          >
                                            Quick Duration Changes:
                                          </Typography>
                                          <div className="flex flex-wrap gap-2">
                                            <button
                                              onClick={() => {
                                                const newDuration = Math.max(
                                                  1,
                                                  editingBlock.duration - 5
                                                );
                                                console.log(
                                                  "Quick edit: reducing duration to",
                                                  newDuration
                                                );
                                                setEditingBlock({
                                                  ...editingBlock,
                                                  duration: newDuration,
                                                });
                                              }}
                                              className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
                                            >
                                              -5 min
                                            </button>
                                            <button
                                              onClick={() => {
                                                const newDuration =
                                                  editingBlock.duration + 5;
                                                console.log(
                                                  "Quick edit: increasing duration to",
                                                  newDuration
                                                );
                                                setEditingBlock({
                                                  ...editingBlock,
                                                  duration: newDuration,
                                                });
                                              }}
                                              className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
                                            >
                                              +5 min
                                            </button>
                                            <button
                                              onClick={() => {
                                                const newDuration =
                                                  editingBlock.duration + 10;
                                                console.log(
                                                  "Quick edit: increasing duration to",
                                                  newDuration
                                                );
                                                setEditingBlock({
                                                  ...editingBlock,
                                                  duration: newDuration,
                                                });
                                              }}
                                              className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
                                            >
                                              +10 min
                                            </button>
                                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                                              Current: {editingBlock.duration}{" "}
                                              min
                                            </span>
                                          </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                              Title
                                            </label>
                                            <input
                                              type="text"
                                              value={editingBlock.title || ""}
                                              onChange={(e) => {
                                                console.log(
                                                  "Title changing to:",
                                                  e.target.value
                                                );
                                                setEditingBlock({
                                                  ...editingBlock,
                                                  title: e.target.value,
                                                });
                                              }}
                                              placeholder="e.g., Offensive line drills"
                                              className="w-full border border-gray-300 rounded-md px-3 py-2"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                              Duration (minutes)
                                            </label>
                                            <input
                                              type="number"
                                              value={
                                                editingBlock.duration || ""
                                              }
                                              onChange={(e) => {
                                                const newDuration = parseInt(
                                                  e.target.value
                                                );
                                                console.log(
                                                  "Duration changing to:",
                                                  newDuration
                                                );
                                                setEditingBlock({
                                                  ...editingBlock,
                                                  duration: newDuration,
                                                });
                                              }}
                                              placeholder="15"
                                              min="1"
                                              className="w-full border border-gray-300 rounded-md px-3 py-2"
                                            />
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                              Category
                                            </label>
                                            <select
                                              value={
                                                editingBlock.category || ""
                                              }
                                              onChange={(e) => {
                                                const newCategory = e.target
                                                  .value as PracticeBlock["category"];
                                                console.log(
                                                  "Category changing to:",
                                                  newCategory
                                                );
                                                setEditingBlock({
                                                  ...editingBlock,
                                                  category: newCategory,
                                                });
                                              }}
                                              className="w-full border border-gray-300 rounded-md px-3 py-2"
                                            >
                                              <option value="">
                                                Select category
                                              </option>
                                              <option value="offense">
                                                Offense
                                              </option>
                                              <option value="defense">
                                                Defense
                                              </option>
                                              <option value="special-teams">
                                                Special Teams
                                              </option>
                                              <option value="meeting">
                                                Meeting
                                              </option>
                                              <option value="weight-room">
                                                Weight Room
                                              </option>
                                              <option value="transition">
                                                Transition
                                              </option>
                                              <option value="break">
                                                Break
                                              </option>
                                            </select>
                                          </div>
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                              Location
                                            </label>
                                            <input
                                              type="text"
                                              value={
                                                editingBlock.location || ""
                                              }
                                              onChange={(e) =>
                                                setEditingBlock({
                                                  ...editingBlock,
                                                  location: e.target.value,
                                                })
                                              }
                                              placeholder="Field, Weight Room, etc."
                                              className="w-full border border-gray-300 rounded-md px-3 py-2"
                                            />
                                          </div>
                                        </div>
                                        <div className="mb-4">
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Notes
                                          </label>
                                          <textarea
                                            value={editingBlock.notes || ""}
                                            onChange={(e) =>
                                              setEditingBlock({
                                                ...editingBlock,
                                                notes: e.target.value,
                                              })
                                            }
                                            placeholder="Special instructions, equipment needed, etc."
                                            rows={2}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                                          />
                                        </div>
                                        <div className="flex space-x-3">
                                          <Button
                                            variant="primary"
                                            onClick={updatePracticeBlock}
                                          >
                                            Update Block
                                          </Button>
                                          <Button
                                            variant="outline"
                                            onClick={() => {
                                              setShowEditBlock(false);
                                              setEditingBlock(null);
                                            }}
                                          >
                                            Cancel
                                          </Button>
                                          <Typography
                                            variant="body-sm"
                                            color="muted"
                                            className="flex items-center"
                                          >
                                            <Icon
                                              name="info"
                                              size="xs"
                                              className="mr-1"
                                            />
                                            Press Esc to cancel
                                          </Typography>
                                        </div>
                                      </div>
                                    )
                                  ) : (
                                    // View Mode - Normal Block Display
                                    <div className="flex items-center justify-between">
                                      {/* Drag Handle */}
                                      <div
                                        {...provided.dragHandleProps}
                                        className="cursor-grab active:cursor-grabbing p-2 text-gray-400 hover:text-gray-600 mr-3"
                                      >
                                        ⋮⋮
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                          <span
                                            className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(block.category)}`}
                                          >
                                            {block.category
                                              .replace("-", " ")
                                              .toUpperCase()}
                                          </span>
                                          <Typography
                                            variant="body-md"
                                            className="font-medium"
                                          >
                                            {block.title}
                                          </Typography>
                                          <Typography
                                            variant="body-sm"
                                            color="muted"
                                          >
                                            {block.duration} min
                                          </Typography>
                                          {block.startTime && block.endTime && (
                                            <Typography
                                              variant="body-sm"
                                              className="text-blue-600 font-medium"
                                            >
                                              {block.startTime} -{" "}
                                              {block.endTime}
                                            </Typography>
                                          )}
                                          {block.assignedCoach && (
                                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-medium">
                                              <Icon
                                                name="user"
                                                size="xs"
                                                className="mr-1"
                                              />
                                              {block.assignedCoach}
                                            </span>
                                          )}
                                        </div>
                                        {block.location && (
                                          <Typography
                                            variant="body-sm"
                                            color="muted"
                                            className="flex items-center"
                                          >
                                            <Icon
                                              name="location"
                                              size="xs"
                                              className="mr-1"
                                            />
                                            {block.location}
                                          </Typography>
                                        )}
                                        {block.notes && (
                                          <Typography
                                            variant="body-sm"
                                            color="muted"
                                            className="mt-1"
                                          >
                                            Note: {block.notes}
                                          </Typography>
                                        )}
                                        {block.scriptId && (
                                          <div className="mt-2">
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="text-xs"
                                            >
                                              <Icon
                                                name="book"
                                                size="xs"
                                                className="mr-1"
                                              />{" "}
                                              {block.scriptTitle ||
                                                "View Script"}
                                            </Button>
                                          </div>
                                        )}

                                        {/* Groups Section */}
                                        {block.groups &&
                                          block.groups.length > 0 && (
                                            <div className="mt-3 space-y-2">
                                              <Typography
                                                variant="body-sm"
                                                className="font-medium text-gray-700"
                                              >
                                                Groups:
                                              </Typography>
                                              {block.groups.map((group) => (
                                                <div
                                                  key={group.id}
                                                  className="bg-gray-50 rounded-lg p-3 border"
                                                >
                                                  <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center space-x-2">
                                                      <Typography
                                                        variant="body-sm"
                                                        className="font-medium"
                                                      >
                                                        {group.name}
                                                      </Typography>
                                                      {group.scriptId && (
                                                        <span className="text-green-600 text-xs flex items-center">
                                                          <Icon
                                                            name="check"
                                                            size="xs"
                                                            className="mr-1"
                                                          />
                                                          Script
                                                        </span>
                                                      )}
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                      <button
                                                        onClick={() =>
                                                          setEditingGroup({
                                                            blockId: block.id,
                                                            group,
                                                          })
                                                        }
                                                        className="text-blue-500 hover:text-blue-700 text-xs p-1"
                                                      >
                                                        <Icon
                                                          name="edit"
                                                          size="sm"
                                                        />
                                                      </button>
                                                      <button
                                                        onClick={() =>
                                                          removeGroup(
                                                            block.id,
                                                            group.id
                                                          )
                                                        }
                                                        className="text-red-500 hover:text-red-700 text-xs p-1"
                                                      >
                                                        <Icon
                                                          name="delete"
                                                          size="sm"
                                                        />
                                                      </button>
                                                    </div>
                                                  </div>

                                                  {group.location && (
                                                    <Typography
                                                      variant="body-xs"
                                                      color="muted"
                                                      className="flex items-center mb-1"
                                                    >
                                                      <Icon
                                                        name="location"
                                                        size="xs"
                                                        className="mr-1"
                                                      />
                                                      {group.location}
                                                    </Typography>
                                                  )}

                                                  {group.notes && (
                                                    <Typography
                                                      variant="body-xs"
                                                      color="muted"
                                                      className="mb-2"
                                                    >
                                                      Note: {group.notes}
                                                    </Typography>
                                                  )}

                                                  <div className="flex items-center space-x-2">
                                                    {group.scriptId ? (
                                                      <div className="flex items-center space-x-2 w-full">
                                                        <Button
                                                          variant="outline"
                                                          size="sm"
                                                          className="text-xs flex-1"
                                                        >
                                                          <Icon
                                                            name="book"
                                                            size="xs"
                                                            className="mr-1"
                                                          />
                                                          {group.scriptTitle ||
                                                            "View Script"}
                                                        </Button>
                                                        <button
                                                          onClick={() => {
                                                            // Remove script from group
                                                            setPracticeBlocks(
                                                              practiceBlocks.map(
                                                                (b) =>
                                                                  b.id ===
                                                                  block.id
                                                                    ? {
                                                                        ...b,
                                                                        groups:
                                                                          b.groups?.map(
                                                                            (
                                                                              g
                                                                            ) =>
                                                                              g.id ===
                                                                              group.id
                                                                                ? {
                                                                                    ...g,
                                                                                    scriptId:
                                                                                      undefined,
                                                                                    scriptTitle:
                                                                                      undefined,
                                                                                  }
                                                                                : g
                                                                          ),
                                                                      }
                                                                    : b
                                                              )
                                                            );
                                                          }}
                                                          className="text-red-500 hover:text-red-700 text-xs p-1"
                                                          title="Remove script"
                                                        >
                                                          <Icon
                                                            name="delete"
                                                            size="sm"
                                                          />
                                                        </button>
                                                      </div>
                                                    ) : (
                                                      <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-xs"
                                                        onClick={() => {
                                                          setSelectedGroupForScript(
                                                            {
                                                              blockId: block.id,
                                                              groupId: group.id,
                                                            }
                                                          );
                                                          setSelectedBlockForScript(
                                                            null
                                                          ); // Clear block selection
                                                          setShowScriptSelector(
                                                            true
                                                          );
                                                        }}
                                                      >
                                                        + Script
                                                      </Button>
                                                    )}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            setShowAddGroup(block.id)
                                          }
                                        >
                                          <Icon
                                            name="user-plus"
                                            size="sm"
                                            className="mr-1"
                                          />
                                          Add Group
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            console.log(
                                              "Editing block:",
                                              block
                                            );
                                            setEditingBlock({ ...block }); // Create a copy to avoid reference issues
                                            setShowEditBlock(true);
                                          }}
                                        >
                                          <Icon
                                            name="edit"
                                            size="sm"
                                            className="mr-1"
                                          />
                                          Edit
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            setSelectedBlockForScript(block.id);
                                            setSelectedGroupForScript(null); // Clear group selection
                                            setShowScriptSelector(true);
                                          }}
                                        >
                                          + Script
                                        </Button>
                                        <button
                                          onClick={() =>
                                            removePracticeBlock(block.id)
                                          }
                                          className="text-red-500 hover:text-red-700 p-1"
                                        >
                                          <Icon name="delete" size="sm" />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </Card>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </div>
            )}
          </div>

          {/* Add Block Modal */}
          {showAddBlock && (
            <Card className="p-4 mb-6 border-2 border-blue-200">
              <Typography variant="headline-md" className="mb-4">
                Add Practice Block
              </Typography>

              {/* Quick Templates */}
              <div className="mb-4">
                <Typography
                  variant="body-sm"
                  className="mb-2 font-medium text-gray-700"
                >
                  Quick Templates:
                </Typography>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      setNewBlock({
                        title: "Team Meeting",
                        category: "meeting",
                        duration: 5,
                        location: "Room 1",
                        notes: "Review practice plan and objectives",
                      })
                    }
                    className="px-3 py-1 bg-purple-100 text-purple-800 rounded-md text-sm hover:bg-purple-200 flex items-center"
                  >
                    <Icon name="file" size="xs" className="mr-1" />
                    Meeting (5 min)
                  </button>
                  <button
                    onClick={() =>
                      setNewBlock({
                        title: "Weight Room",
                        category: "weight-room",
                        duration: 25,
                        location: "Weight Room",
                        notes: "Bring sneakers and water bottles",
                      })
                    }
                    className="px-3 py-1 bg-orange-100 text-orange-800 rounded-md text-sm hover:bg-orange-200 flex items-center"
                  >
                    <Icon name="activity" size="xs" className="mr-1" />
                    Weight Room (25 min)
                  </button>
                  <button
                    onClick={() =>
                      setNewBlock({
                        title: "Transition to Field",
                        category: "transition",
                        duration: 5,
                        location: "Field",
                        notes: "Bring helmets only",
                      })
                    }
                    className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md text-sm hover:bg-gray-200 flex items-center"
                  >
                    <Icon name="arrow-right" size="xs" className="mr-1" />
                    Transition (5 min)
                  </button>
                  <button
                    onClick={() =>
                      setNewBlock({
                        title: "Offense - Warm up on air",
                        category: "offense",
                        duration: 5,
                        location: "Field",
                        notes: "5 plays, no contact",
                      })
                    }
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm hover:bg-blue-200 flex items-center"
                  >
                    <Icon name="target" size="xs" className="mr-1" />
                    Offense Warmup (5 min)
                  </button>
                  <button
                    onClick={() =>
                      setNewBlock({
                        title: "Water Break",
                        category: "break",
                        duration: 5,
                        location: "Sideline",
                        notes: "Hydration and equipment check",
                      })
                    }
                    className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm hover:bg-yellow-200 flex items-center"
                  >
                    <Icon name="pause" size="xs" className="mr-1" />
                    Water Break (5 min)
                  </button>
                  <button
                    onClick={() =>
                      setNewBlock({
                        title: "Equipment Change",
                        category: "break",
                        duration: 10,
                        location: "Locker Room",
                        notes: "Change from weight room to field gear",
                      })
                    }
                    className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm hover:bg-yellow-200"
                  >
                    🥿 Equipment (10 min)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newBlock.title || ""}
                    onChange={(e) =>
                      setNewBlock({ ...newBlock, title: e.target.value })
                    }
                    placeholder="e.g., Offensive line drills"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={newBlock.duration || ""}
                    onChange={(e) =>
                      setNewBlock({
                        ...newBlock,
                        duration: parseInt(e.target.value),
                      })
                    }
                    placeholder="15"
                    min="1"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newBlock.category || ""}
                    onChange={(e) =>
                      setNewBlock({
                        ...newBlock,
                        category: e.target.value as PracticeBlock["category"],
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select category</option>
                    <option value="offense">Offense</option>
                    <option value="defense">Defense</option>
                    <option value="special-teams">Special Teams</option>
                    <option value="meeting">Meeting</option>
                    <option value="weight-room">Weight Room</option>
                    <option value="transition">Transition</option>
                    <option value="break">Break</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newBlock.location || ""}
                    onChange={(e) =>
                      setNewBlock({ ...newBlock, location: e.target.value })
                    }
                    placeholder="Field, Weight Room, etc."
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={newBlock.notes || ""}
                  onChange={(e) =>
                    setNewBlock({ ...newBlock, notes: e.target.value })
                  }
                  placeholder="Special instructions, equipment needed, etc."
                  rows={2}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div className="flex space-x-3">
                <Button variant="primary" onClick={addPracticeBlock}>
                  Add Block
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddBlock(false);
                    setNewBlock({
                      category: "meeting",
                      location: "",
                      notes: "",
                      title: "",
                    });
                  }}
                >
                  Cancel
                </Button>
                {userRole === "head_coach" && (
                  <Button
                    variant="outline"
                    onClick={() => setUserRole("position_coach")}
                    className="text-xs"
                  >
                    <Icon name="eye" size="sm" className="mr-1" />
                    Switch to Position Coach View
                  </Button>
                )}
              </div>
            </Card>
          )}

          {/* Development Helper */}
          {process.env.NODE_ENV === "development" && (
            <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <div className="flex items-center justify-between">
                <Typography variant="body-sm" className="text-yellow-800">
                  <Icon name="wrench" size="sm" className="mr-1" />
                  Development Tools
                </Typography>
                <button
                  onClick={() => {
                    const savedPracticeKey = `practice_plan_${event.id || "default"}`;
                    localStorage.removeItem(savedPracticeKey);
                    window.location.reload(); // Reload to show sample data
                  }}
                  className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs hover:bg-yellow-300"
                >
                  Reset to Sample Data
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <div>
              {isOvertime && (
                <Typography variant="body-sm" className="text-red-600">
                  <Icon name="alert-triangle" size="xs" className="mr-1" />
                  Warning: Practice is {totalDuration - scheduledDuration}{" "}
                  minutes over scheduled time
                </Typography>
              )}
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  if (isOvertime) {
                    setShowOvertimeWarning(true);
                  } else {
                    savePracticePlan();
                  }
                }}
              >
                Save Practice Plan
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Script Selector Modal */}
      {showScriptSelector &&
        (selectedBlockForScript || selectedGroupForScript) && (
          <ScriptSelectorModal
            onClose={() => {
              setShowScriptSelector(false);
              setSelectedBlockForScript(null);
              setSelectedGroupForScript(null);
            }}
            onSelectScript={(script) => {
              if (selectedBlockForScript) {
                addScriptToBlock(selectedBlockForScript, script);
              } else if (selectedGroupForScript) {
                addScriptToGroup(
                  selectedGroupForScript.blockId,
                  selectedGroupForScript.groupId,
                  script
                );
              }
              setShowScriptSelector(false);
              setSelectedBlockForScript(null);
              setSelectedGroupForScript(null);
            }}
            onCreateNew={handleCreateNewScript}
          />
        )}

      {/* Add Group Modal */}
      {showAddGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <Typography variant="headline-md" className="mb-4">
                Add Group
              </Typography>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    value={newGroup.name || ""}
                    onChange={(e) =>
                      setNewGroup({ ...newGroup, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Linebackers, Quarterbacks, O-Line"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newGroup.location || ""}
                    onChange={(e) =>
                      setNewGroup({ ...newGroup, location: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Room 1, Field A, Weight Room"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={newGroup.notes || ""}
                    onChange={(e) =>
                      setNewGroup({ ...newGroup, notes: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="e.g., Bring notebook, no contact"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddGroup(null);
                    setNewGroup({ name: "", location: "", notes: "" });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => addGroupToBlock(showAddGroup)}
                  disabled={!newGroup.name?.trim()}
                >
                  Add Group
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {editingGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <Typography variant="headline-md" className="mb-4">
                Edit Group
              </Typography>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    value={editingGroup.group.name || ""}
                    onChange={(e) =>
                      setEditingGroup({
                        ...editingGroup,
                        group: { ...editingGroup.group, name: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Linebackers, Quarterbacks, O-Line"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editingGroup.group.location || ""}
                    onChange={(e) =>
                      setEditingGroup({
                        ...editingGroup,
                        group: {
                          ...editingGroup.group,
                          location: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Room 1, Field A, Weight Room"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={editingGroup.group.notes || ""}
                    onChange={(e) =>
                      setEditingGroup({
                        ...editingGroup,
                        group: { ...editingGroup.group, notes: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="e.g., Bring notebook, no contact"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={() => setEditingGroup(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() =>
                    updateGroup(editingGroup.blockId, editingGroup.group)
                  }
                  disabled={!editingGroup.group.name?.trim()}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overtime Warning Modal */}
      {showOvertimeWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[70]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="mr-3">
                  <Icon name="alert-triangle" size="xl" color="warning" />
                </div>
                <Typography variant="headline-md" className="text-red-600">
                  Practice Overtime Warning
                </Typography>
              </div>
              <Typography variant="body-md" className="mb-4">
                Your practice plan is{" "}
                <strong>{totalDuration - scheduledDuration} minutes</strong>{" "}
                longer than the scheduled time. This may cause conflicts with
                other activities.
              </Typography>
              <Typography variant="body-sm" color="muted" className="mb-6">
                Are you sure you want to save this practice plan?
              </Typography>
              <div className="flex space-x-3">
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowOvertimeWarning(false);
                    savePracticePlan();
                  }}
                >
                  Yes, Save Anyway
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowOvertimeWarning(false)}
                >
                  Go Back to Edit
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
