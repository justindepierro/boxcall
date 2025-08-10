/**
 * Practice Planner Types
 *
 * Shared TypeScript interfaces for the Practice Planner system
 */
import type { CalendarEvent } from "../../../domain/calendar/types";

export interface PracticeGroup {
  id: string;
  name: string;
  location: string;
  notes: string;
  scriptId?: string;
  scriptTitle?: string;
}

export interface PracticeBlock {
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
    | "conditioning"
    | "individual"
    | "team-building"
    | "break";
  title: string;
  description: string;
  participants: string[];
  equipment: string[];
  location: string;
  intensity: "low" | "medium" | "high";
  focus: string[];
  notes: string;
  groupId?: string;
  scriptId?: string;
  scriptTitle?: string;
  reps?: number;
  totalTime?: number;
}

export interface PracticePlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent;
}

export interface TimelineAllocation {
  [category: string]: number;
}

export interface PracticeConfiguration {
  totalDuration: number;
  categories: Array<{
    id: string;
    name: string;
    color: string;
    defaultDuration: number;
    maxDuration: number;
  }>;
}

export interface PracticeFormData {
  title: string;
  date: string;
  duration: number;
  location: string;
  weather: string;
  objectives: string[];
  coaches: Array<{
    id: string;
    name: string;
    role: string;
    assignments: string[];
  }>;
  equipment: Array<{
    item: string;
    quantity: number;
    location: string;
  }>;
}

export type PracticeMode = "planner" | "timeline" | "script" | "export";
