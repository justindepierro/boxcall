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

export interface TimelineAllocation {
  [key: number]: {
    category: PracticeBlock["category"];
    assignedCoach?: string;
    title?: string;
  };
}

export interface SelectedBlock {
  start: number;
  duration: number;
  category: PracticeBlock["category"];
}

export interface EventData {
  title: string;
  date: string;
}
