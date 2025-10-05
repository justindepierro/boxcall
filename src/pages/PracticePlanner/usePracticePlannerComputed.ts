import { format } from "date-fns";
import type { PracticeBlock, PracticeSchedule } from "../../types/practice";

interface UsePracticePlannerComputedProps {
  selectedSchedule: PracticeSchedule | undefined;
  currentBlocks: PracticeBlock[];
  practiceStarted: boolean;
  formatTime: (seconds: number) => string;
  getElapsedTime: () => number;
  getTimeRemaining: (endTime: Date) => number;
}

export function usePracticePlannerComputed({
  selectedSchedule,
  currentBlocks,
  practiceStarted,
  formatTime,
  getElapsedTime,
  getTimeRemaining,
}: UsePracticePlannerComputedProps) {
  const scheduleDateLabel = selectedSchedule
    ? format(selectedSchedule.date, "EEE, MMM d")
    : "Select schedule";

  const scheduleLocationLabel = selectedSchedule?.location || "Location TBD";

  const practiceElapsed = practiceStarted ? formatTime(getElapsedTime()) : null;

  const finalBlockEnd =
    currentBlocks.length > 0
      ? currentBlocks[currentBlocks.length - 1].endTime
      : null;

  const practiceFinishEta =
    practiceStarted && finalBlockEnd instanceof Date
      ? formatTime(getTimeRemaining(finalBlockEnd))
      : null;

  const scrollToSection = (sectionId: string) => {
    if (typeof window === "undefined") return;
    const section = document.getElementById(sectionId);
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return {
    scheduleDateLabel,
    scheduleLocationLabel,
    practiceElapsed,
    practiceFinishEta,
    scrollToSection,
  };
}
