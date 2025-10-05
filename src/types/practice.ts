// Practice Schedule System Types
// Phase 2.2 Implementation
export interface PracticeBlock {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  order: number;
  isLocked: boolean;
  practiceScriptId?: string;
  drillIds?: string[];
  notes?: string;
  equipmentIds?: string[];
  // Training-specific properties
  equipment?: string[]; // Equipment list (different from equipmentIds)
  focus?: string[]; // Focus areas for this block
  intensity?: "low" | "medium" | "high"; // Training intensity
  reps?: number; // Number of repetitions
  totalTime?: number; // Total time including breaks
  // Practice planning properties
  category?:
    | "offense"
    | "defense"
    | "special-teams"
    | "meeting"
    | "weight-room"
    | "transition"
    | "break"
    | "conditioning"
    | "individual"
    | "team-building";
  location?: string; // Practice location
}
export interface PracticeSchedule {
  id: string;
  teamId: string;
  date: Date;
  title: string;
  description?: string;
  location: string;
  fieldType: "indoor" | "outdoor" | "gym" | "field";
  startTime: Date;
  endTime: Date;
  isTemplate: boolean;
  templateName?: string;
  blocks: PracticeBlock[];
  attendanceRequired: boolean;
  weatherDependent: boolean;
  equipmentRequired: string[];
  coachNotes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface PracticeTemplate {
  id: string;
  name: string;
  description?: string;
  teamId: string;
  duration: number; // total template duration in minutes
  blocks: Omit<PracticeBlock, "id" | "startTime" | "endTime">[];
  defaultLocation: string;
  defaultFieldType: "indoor" | "outdoor" | "gym" | "field";
  equipmentRequired: string[];
  isPublic: boolean; // can be shared with other teams
  createdBy: string;
  createdAt: Date;
  usageCount: number;
}
export interface PracticeScript {
  id: string;
  title: string;
  description?: string;
  teamId: string;
  category:
    | "offense"
    | "defense"
    | "special-teams"
    | "conditioning"
    | "fundamentals";
  duration: number; // estimated duration in minutes
  drills: PracticeDrill[];
  equipment: string[];
  objectives: string[];
  notes?: string;
  createdBy: string;
  createdAt: Date;
}
export interface PracticeDrill {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  playerCount: number;
  equipment: string[];
  objectives: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
}
export interface PracticeAttendance {
  id: string;
  practiceId: string;
  playerId: string;
  status: "present" | "absent" | "late" | "excused";
  arrivalTime?: Date;
  notes?: string;
  recordedBy: string;
  recordedAt: Date;
}
export interface Equipment {
  id: string;
  name: string;
  category: "balls" | "cones" | "dummies" | "sleds" | "protective" | "other";
  quantity: number;
  available: number;
  condition: "excellent" | "good" | "fair" | "poor";
  location: string;
  lastChecked: Date;
}
// Quick Time Interval Presets
export const QUICK_TIME_INTERVALS = {
  FIVE_MIN: { duration: 5, label: "5 min" },
  TEN_MIN: { duration: 10, label: "10 min" },
  FIFTEEN_MIN: { duration: 15, label: "15 min" },
  TWENTY_MIN: { duration: 20, label: "20 min" },
  THIRTY_MIN: { duration: 30, label: "30 min" },
} as const;
export type QuickTimeInterval =
  (typeof QUICK_TIME_INTERVALS)[keyof typeof QUICK_TIME_INTERVALS];
// Practice Block Types for Quick Creation
// Using Tailwind design tokens for consistent theming
export const PRACTICE_BLOCK_TYPES = {
  WARMUP: { title: "Warm-up", defaultDuration: 15, color: "rgb(16, 185, 129)" }, // emerald-500
  STRETCH: { title: "Stretching", defaultDuration: 10, color: "rgb(6, 182, 212)" }, // cyan-500
  DRILLS: { title: "Skill Drills", defaultDuration: 20, color: "rgb(139, 92, 246)" }, // electric-500
  SCRIMMAGE: { title: "Scrimmage", defaultDuration: 30, color: "rgb(245, 158, 11)" }, // warning-500
  CONDITIONING: {
    title: "Conditioning",
    defaultDuration: 15,
    color: "rgb(239, 68, 68)", // error-500
  },
  FILM: { title: "Film Review", defaultDuration: 20, color: "rgb(107, 114, 128)" }, // gray-500
  COOL_DOWN: { title: "Cool Down", defaultDuration: 10, color: "rgb(20, 184, 166)" }, // teal-500
  SPECIAL_TEAMS: {
    title: "Special Teams",
    defaultDuration: 25,
    color: "rgb(249, 115, 22)", // orange-600
  },
  CUSTOM: { title: "Custom Block", defaultDuration: 15, color: "rgb(0, 168, 107)" }, // jade-500 (brand)
} as const;
export type PracticeBlockType =
  (typeof PRACTICE_BLOCK_TYPES)[keyof typeof PRACTICE_BLOCK_TYPES];
// Drag and Drop Types
export interface DragDropResult {
  source: {
    index: number;
    droppableId: string;
  };
  destination: {
    index: number;
    droppableId: string;
  } | null;
  draggableId: string;
}
// Practice Schedule Form Data
export interface CreatePracticeScheduleData {
  teamId: string;
  date: Date;
  title: string;
  description?: string;
  location: string;
  fieldType: "indoor" | "outdoor" | "gym" | "field";
  startTime: Date;
  endTime: Date;
  templateId?: string; // if creating from template
  attendanceRequired: boolean;
  weatherDependent: boolean;
  equipmentRequired: string[];
  coachNotes?: string;
}
export interface CreatePracticeBlockData {
  title: string;
  description?: string;
  duration: number;
  practiceScriptId?: string;
  equipmentIds?: string[];
  notes?: string;
}
// API Response Types
export interface PracticeScheduleResponse {
  schedule: PracticeSchedule;
  attendance: PracticeAttendance[];
  weather?: WeatherInfo;
}
export interface WeatherInfo {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  isOutdoorSafe: boolean;
}
// Filter and Search Types
export interface PracticeFilters {
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  location: string[];
  fieldType: ("indoor" | "outdoor" | "gym" | "field")[];
  templates: boolean;
  weatherDependent: boolean;
}
export interface PracticeSearchResult {
  schedules: PracticeSchedule[];
  templates: PracticeTemplate[];
  scripts: PracticeScript[];
}
