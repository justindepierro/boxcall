import { useCallback, useState } from "react";

import type {
  PracticeBlock,
  TimelineAllocation,
  SelectedBlock,
} from "../types";

function createTimelineAllocationFromBlocks(
  practiceBlocks: PracticeBlock[]
): TimelineAllocation {
  const allocation: TimelineAllocation = {};
  let currentMinute = 0;

  practiceBlocks.forEach((block) => {
    for (let i = 0; i < block.duration; i++) {
      allocation[currentMinute + i] = {
        category: block.category,
        assignedCoach: block.assignedCoach,
        title: block.title,
      };
    }
    currentMinute += block.duration;
  });

  return allocation;
}

function formatCategoryTitle(category: PracticeBlock["category"]) {
  return `${category
    .replace("-", " ")
    .replace(/\b\w/g, (l) => l.toUpperCase())} Time`;
}

function timelineAllocationToBlocks(
  timelineAllocation: TimelineAllocation,
  scheduledDuration: number
): PracticeBlock[] {
  const newBlocks: PracticeBlock[] = [];
  let currentBlock: Partial<PracticeBlock> | null = null;

  for (let minute = 0; minute < scheduledDuration; minute++) {
    const allocation = timelineAllocation[minute];

    if (allocation) {
      if (!currentBlock || currentBlock.category !== allocation.category) {
        if (currentBlock) {
          newBlocks.push({
            id: Date.now().toString() + Math.random(),
            startTime: "",
            endTime: "",
            duration: currentBlock.duration || 0,
            category: currentBlock.category!,
            title: formatCategoryTitle(currentBlock.category!),
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
        currentBlock.duration = (currentBlock.duration || 0) + 1;
      }
    } else if (currentBlock) {
      newBlocks.push({
        id: Date.now().toString() + Math.random(),
        startTime: "",
        endTime: "",
        duration: currentBlock.duration || 0,
        category: currentBlock.category!,
        title: formatCategoryTitle(currentBlock.category!),
        location: "",
        notes: "",
        assignedCoach: currentBlock.assignedCoach,
      });
      currentBlock = null;
    }
  }

  if (currentBlock) {
    newBlocks.push({
      id: Date.now().toString() + Math.random(),
      startTime: "",
      endTime: "",
      duration: currentBlock.duration || 0,
      category: currentBlock.category!,
      title: formatCategoryTitle(currentBlock.category!),
      location: "",
      notes: "",
      assignedCoach: currentBlock.assignedCoach,
    });
  }

  return newBlocks;
}

export type UsePracticeScaffoldArgs = {
  eventId: string | undefined;
  scheduledDuration: number;
  practiceBlocks: PracticeBlock[];
  setPracticeBlocks: React.Dispatch<React.SetStateAction<PracticeBlock[]>>;
  recalculateBlockTimes: (blocks: PracticeBlock[]) => PracticeBlock[];
};

function usePracticeScaffoldLifecycleActions(params: {
  eventId: string | undefined;
  scheduledDuration: number;
  timelineAllocation: TimelineAllocation;
  originalBlocksBeforeScaffold: PracticeBlock[];
  setPracticeBlocks: React.Dispatch<React.SetStateAction<PracticeBlock[]>>;
  recalculateBlockTimes: (blocks: PracticeBlock[]) => PracticeBlock[];
  setScaffoldMode: (newScaffoldMode: boolean) => void;
  setTimelineAllocation: React.Dispatch<
    React.SetStateAction<TimelineAllocation>
  >;
  setSelectedCategory: React.Dispatch<
    React.SetStateAction<PracticeBlock["category"] | null>
  >;
  setSelectedBlock: React.Dispatch<React.SetStateAction<SelectedBlock | null>>;
  setOriginalBlocksBeforeScaffold: React.Dispatch<
    React.SetStateAction<PracticeBlock[]>
  >;
}) {
  const {
    eventId,
    scheduledDuration,
    timelineAllocation,
    originalBlocksBeforeScaffold,
    setPracticeBlocks,
    recalculateBlockTimes,
    setScaffoldMode,
    setTimelineAllocation,
    setSelectedCategory,
    setSelectedBlock,
    setOriginalBlocksBeforeScaffold,
  } = params;

  const resetScaffoldState = useCallback(() => {
    setScaffoldMode(false);
    setTimelineAllocation({});
    setSelectedCategory(null);
    setSelectedBlock(null);
    setOriginalBlocksBeforeScaffold([]);
  }, [
    setOriginalBlocksBeforeScaffold,
    setScaffoldMode,
    setSelectedBlock,
    setSelectedCategory,
    setTimelineAllocation,
  ]);

  const removeEmptyTime = useCallback(() => {
    const allocatedMinutes = Object.entries(timelineAllocation)
      .filter(([_, allocation]) => allocation)
      .sort(([a], [b]) => parseInt(a) - parseInt(b));

    const newAllocation: TimelineAllocation = {};
    allocatedMinutes.forEach(([_, allocation], index) => {
      newAllocation[index] = allocation;
    });

    setTimelineAllocation(newAllocation);
  }, [timelineAllocation, setTimelineAllocation]);

  const handleCancelScaffold = useCallback(() => {
    setPracticeBlocks(originalBlocksBeforeScaffold);
    resetScaffoldState();
  }, [originalBlocksBeforeScaffold, resetScaffoldState, setPracticeBlocks]);

  const saveTimeAllocation = useCallback(() => {
    const newBlocks = timelineAllocationToBlocks(
      timelineAllocation,
      scheduledDuration
    );

    const blocksWithTimes = recalculateBlockTimes(newBlocks);
    setPracticeBlocks(blocksWithTimes);

    const savedPracticeKey = `practice_plan_${eventId || "default"}`;
    try {
      const blocksToSave = blocksWithTimes.map((block) => ({
        ...block,
        startTime: "",
        endTime: "",
      }));
      localStorage.setItem(savedPracticeKey, JSON.stringify(blocksToSave));
    } catch {
      // ignore
    }

    resetScaffoldState();
  }, [
    eventId,
    recalculateBlockTimes,
    resetScaffoldState,
    scheduledDuration,
    setPracticeBlocks,
    timelineAllocation,
  ]);

  return { removeEmptyTime, saveTimeAllocation, handleCancelScaffold };
}

export function usePracticeScaffold({
  eventId,
  scheduledDuration,
  practiceBlocks,
  setPracticeBlocks,
  recalculateBlockTimes,
}: UsePracticeScaffoldArgs) {
  const [timeAllocationMode, setTimeAllocationMode] = useState(false);
  const [scaffoldMode, setScaffoldModeRaw] = useState(false);
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
  const [sliderValue, setSliderValue] = useState(5);
  const [originalBlocksBeforeScaffold, setOriginalBlocksBeforeScaffold] =
    useState<PracticeBlock[]>([]);

  const setScaffoldMode = useCallback(
    (newScaffoldMode: boolean) => {
      if (newScaffoldMode && !scaffoldMode) {
        setOriginalBlocksBeforeScaffold([...practiceBlocks]);
        setTimelineAllocation(
          createTimelineAllocationFromBlocks(practiceBlocks)
        );
      } else if (!newScaffoldMode && scaffoldMode) {
        setTimelineAllocation({});
        setSelectedCategory(null);
        setSelectedBlock(null);
        setOriginalBlocksBeforeScaffold([]);
      }

      setScaffoldModeRaw(newScaffoldMode);
    },
    [practiceBlocks, scaffoldMode]
  );

  const handleTimelineClick = useCallback(
    (minute: number) => {
      if (!selectedCategory) return;

      if (!isSelecting) {
        setIsSelecting(true);
        setSelectionStart(minute);

        const blockStart = Math.floor(minute / 5) * 5;
        const blockEnd = blockStart + 4;

        const newAllocation = { ...timelineAllocation };
        for (let i = blockStart; i <= blockEnd && i < scheduledDuration; i++) {
          newAllocation[i] = { category: selectedCategory };
        }

        setTimelineAllocation(newAllocation);
        setIsSelecting(false);
        setSelectionStart(null);
      } else {
        const rawStart = Math.min(selectionStart!, minute);
        const rawEnd = Math.max(selectionStart!, minute);

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
      isSelecting,
      scheduledDuration,
      selectedCategory,
      selectionStart,
      timelineAllocation,
    ]
  );

  const handleBlockClick = useCallback(
    (minute: number) => {
      const allocation = timelineAllocation[minute];
      if (!allocation) return;

      let blockStart = minute;
      let blockEnd = minute;

      while (
        blockStart > 0 &&
        timelineAllocation[blockStart - 1]?.category === allocation.category
      ) {
        blockStart--;
      }

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
    [scheduledDuration, timelineAllocation]
  );

  const updateSelectedBlockDuration = useCallback(
    (newDuration: number) => {
      if (!selectedBlock) return;

      const newAllocation = { ...timelineAllocation };
      for (
        let i = selectedBlock.start;
        i < selectedBlock.start + selectedBlock.duration;
        i++
      ) {
        delete newAllocation[i];
      }

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
      setSelectedBlock({
        ...selectedBlock,
        duration: newDuration,
      });
    },
    [scheduledDuration, selectedBlock, timelineAllocation]
  );

  const { removeEmptyTime, saveTimeAllocation, handleCancelScaffold } =
    usePracticeScaffoldLifecycleActions({
      eventId,
      scheduledDuration,
      timelineAllocation,
      originalBlocksBeforeScaffold,
      setPracticeBlocks,
      recalculateBlockTimes,
      setScaffoldMode,
      setTimelineAllocation,
      setSelectedCategory,
      setSelectedBlock,
      setOriginalBlocksBeforeScaffold,
    });

  return {
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
  };
}
