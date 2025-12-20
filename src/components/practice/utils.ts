import type { PracticeBlock } from "./types";
import { readLocalJson, storageKeys, writeLocalJson } from "../../utils/storage";

// Re-export centralized formatDuration for backwards compatibility
export { formatDuration } from "../../utils/dateFormatting";

/**
 * Get category color classes for styling
 */
export const getCategoryColor = (category: PracticeBlock["category"]) => {
  switch (category) {
    case "offense":
      return "bg-info/20 text-info";
    case "defense":
      return "bg-surface-error text-error";
    case "special-teams":
      return "bg-success/20 text-success";
    case "meeting":
      return "bg-tertiary text-tertiary";
    case "weight-room":
      return "bg-warning/20 text-warning";
    case "transition":
      return "bg-subtle text-primary";
    case "break":
      return "bg-warning/20 text-warning";
    default:
      return "bg-subtle text-primary";
  }
};
/**
 * Recalculate start/end times for blocks in chronological order
 */
export const recalculateBlockTimes = (
  blocks: PracticeBlock[],
  eventStart: string | Date
): PracticeBlock[] => {
  if (!eventStart || blocks.length === 0) return blocks;
  const startTime = new Date(eventStart);
  let currentMinutes = 0;
  return blocks.map((block) => {
    const blockStart = new Date(startTime.getTime() + currentMinutes * 60000);
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
};
/**
 * Check if adding a new block would cause scheduling conflicts
 */
export const checkForConflicts = (
  newBlock: PracticeBlock,
  existingBlocks: PracticeBlock[],
  scheduledDuration: number
): boolean => {
  const totalWithNew =
    existingBlocks.reduce((sum, block) => sum + block.duration, 0) +
    newBlock.duration;
  return totalWithNew > scheduledDuration;
};
/**
 * Calculate practice duration from event start/end times
 */
export const calculateScheduledDuration = (
  start: string | Date,
  end: string | Date
): number => {
  if (!start || !end) return 0;
  const startTime = new Date(start);
  const endTime = new Date(end);
  return (endTime.getTime() - startTime.getTime()) / (1000 * 60); // Convert to minutes
};
/**
 * Get sample practice blocks for demonstration
 */
export const getSamplePracticeBlocks = (): PracticeBlock[] => [
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
/**
 * Save practice plan to localStorage
 */
export const savePracticeToStorage = (
  blocks: PracticeBlock[],
  eventId: string
): void => {
  const savedPracticeKey = storageKeys.practice.planForEvent(eventId);
  const blocksToSave = blocks.map(
    ({ startTime: _startTime, endTime: _endTime, ...block }) => block
  );
  writeLocalJson(savedPracticeKey, blocksToSave);
};
/**
 * Load practice plan from localStorage
 */
export const loadPracticeFromStorage = (
  eventId: string
): PracticeBlock[] | null => {
  const savedPracticeKey = storageKeys.practice.planForEvent(eventId);
  const savedPractice = readLocalJson<PracticeBlock[]>(savedPracticeKey, {
    clearOnParseError: true,
  });
  if (!savedPractice) return null;
  return savedPractice;
};
