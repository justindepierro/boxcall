import { useEffect, useState } from "react";
import type { PracticeBlock, PracticeSchedule } from "../../types/practice";

interface UsePracticePlannerStateProps {
  schedules: PracticeSchedule[];
}

export function usePracticePlannerState({
  schedules,
}: UsePracticePlannerStateProps) {
  // Schedule selection
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("");

  // Modal states
  const [isCreateBlockModalOpen, setIsCreateBlockModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isPDFExportOpen, setIsPDFExportOpen] = useState(false);

  // Practice state
  const [currentBlocks, setCurrentBlocks] = useState<PracticeBlock[]>([]);
  const [practiceStarted, setPracticeStarted] = useState(false);
  const [lockedSchedule, setLockedSchedule] = useState(false);

  // Select the first schedule if available
  useEffect(() => {
    if (schedules.length > 0 && !selectedScheduleId) {
      setSelectedScheduleId(schedules[0].id);
      setCurrentBlocks(schedules[0].blocks);
    }
  }, [schedules, selectedScheduleId]);

  // Update blocks when schedule changes
  useEffect(() => {
    const selectedSchedule = schedules.find((s) => s.id === selectedScheduleId);
    if (selectedSchedule) {
      setCurrentBlocks(selectedSchedule.blocks);
    }
  }, [selectedScheduleId, schedules]);

  // Computed values
  const selectedSchedule = schedules.find((s) => s.id === selectedScheduleId);
  const totalDurationMinutes = currentBlocks.reduce(
    (sum, block) => sum + block.duration,
    0
  );

  return {
    // State
    selectedScheduleId,
    setSelectedScheduleId,
    isCreateBlockModalOpen,
    setIsCreateBlockModalOpen,
    isTemplateModalOpen,
    setIsTemplateModalOpen,
    isPDFExportOpen,
    setIsPDFExportOpen,
    currentBlocks,
    setCurrentBlocks,
    practiceStarted,
    setPracticeStarted,
    lockedSchedule,
    setLockedSchedule,
    // Computed
    selectedSchedule,
    totalDurationMinutes,
  };
}
