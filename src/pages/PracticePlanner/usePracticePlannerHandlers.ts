import type { Dispatch, SetStateAction } from "react";
import type {
  CreatePracticeBlockData,
  DragDropResult,
  PracticeBlock,
} from "../../types/practice";
import { PRACTICE_BLOCK_TYPES } from "../../types/practice";
import { markFirstPracticeScheduled } from "../../components/onboarding/activationHelpers";
import { error as logError } from "../../utils/logger";

interface UsePracticePlannerHandlersProps {
  // State setters
  currentBlocks: PracticeBlock[];
  setCurrentBlocks: Dispatch<SetStateAction<PracticeBlock[]>>;
  setPracticeStarted: Dispatch<SetStateAction<boolean>>;
  setLockedSchedule: Dispatch<SetStateAction<boolean>>;
  lockedSchedule: boolean;
  selectedScheduleId: string;

  // API functions
  addBlock: (data: CreatePracticeBlockData) => Promise<PracticeBlock>;
  reorderBlocks: (blocks: PracticeBlock[]) => Promise<void>;
  deleteBlock: (blockId: string) => Promise<void>;
  startTimer: () => void;
  stopTimer: () => void;
}

export function usePracticePlannerHandlers({
  currentBlocks,
  setCurrentBlocks,
  setPracticeStarted,
  setLockedSchedule,
  lockedSchedule,
  selectedScheduleId,
  addBlock,
  reorderBlocks,
  deleteBlock,
  startTimer,
  stopTimer,
}: UsePracticePlannerHandlersProps) {
  const handleDragEnd = async (result: DragDropResult) => {
    if (!result.destination || lockedSchedule) return;

    const reorderedBlocks = Array.from(currentBlocks);
    const [removed] = reorderedBlocks.splice(result.source.index, 1);
    reorderedBlocks.splice(result.destination.index, 0, removed);

    // Update local state immediately for UI responsiveness
    setCurrentBlocks(reorderedBlocks);

    try {
      await reorderBlocks(reorderedBlocks);
    } catch (err) {
      // Revert on error
      setCurrentBlocks(currentBlocks);
      logError("Failed to reorder blocks:", err);
    }
  };

  const handleQuickAddBlock = async (
    blockType: keyof typeof PRACTICE_BLOCK_TYPES,
    duration?: number
  ) => {
    const blockConfig = PRACTICE_BLOCK_TYPES[blockType];
    const blockData: CreatePracticeBlockData = {
      title: blockConfig.title,
      duration: duration || blockConfig.defaultDuration,
      description: `${blockConfig.title} - ${duration || blockConfig.defaultDuration} minutes`,
    };

    try {
      const newBlock = await addBlock(blockData);
      setCurrentBlocks((prev) => [...prev, newBlock]);
    } catch (err) {
      logError("Failed to add block:", err);
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    if (lockedSchedule) return;

    try {
      await deleteBlock(blockId);
      setCurrentBlocks((prev) => prev.filter((block) => block.id !== blockId));
    } catch (error) {
      logError("Failed to delete block:", error);
    }
  };

  const handleStartPractice = () => {
    setPracticeStarted(true);
    setLockedSchedule(true);
    startTimer();

    // Activation: mark first practice (using schedule id)
    if (selectedScheduleId) {
      markFirstPracticeScheduled(selectedScheduleId);
    } else {
      markFirstPracticeScheduled();
    }
  };

  const handleStopPractice = () => {
    setPracticeStarted(false);
    stopTimer();
  };

  const handleUnlockSchedule = () => {
    setLockedSchedule(false);
  };

  return {
    handleDragEnd,
    handleQuickAddBlock,
    handleDeleteBlock,
    handleStartPractice,
    handleStopPractice,
    handleUnlockSchedule,
  };
}
