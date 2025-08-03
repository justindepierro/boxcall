// Practice Planner Types and Interfaces

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
    title?: string 
  };
}

export type UserRole = "head_coach" | "position_coach";

export interface SelectedBlock {
  start: number;
  duration: number;
  category: PracticeBlock["category"];
}

export interface SelectedGroupForScript {
  blockId: string;
  groupId: string;
}

export interface EditingGroup {
  blockId: string;
  group: PracticeGroup;
}

export interface Script {
  id: string;
  title: string;
}

// Props interfaces
export interface PracticePlannerModalProps {
  event: import("../../services/calendarService").CalendarEvent;
  onClose: () => void;
}

export interface PracticeHeaderProps {
  event: import("../../services/calendarService").CalendarEvent;
  userRole: UserRole;
  timeAllocationMode: boolean;
  scaffoldMode: boolean;
  onUserRoleChange: (role: UserRole) => void;
  onTimeAllocationModeToggle: () => void;
  onScaffoldModeToggle: () => void;
  onClose: () => void;
}

export interface TimeSummaryProps {
  scheduledDuration: number;
  totalDuration: number;
  practiceBlocks: PracticeBlock[];
  event: import("../../services/calendarService").CalendarEvent;
}

export interface PracticeBlocksListProps {
  practiceBlocks: PracticeBlock[];
  userRole: UserRole;
  scaffoldMode: boolean;
  onDragEnd: (result: import("@hello-pangea/dnd").DropResult) => void;
  onEditBlock: (block: PracticeBlock) => void;
  onRemoveBlock: (id: string) => void;
  onAddGroup: (blockId: string) => void;
  onEditGroup: (blockId: string, group: PracticeGroup) => void;
  onRemoveGroup: (blockId: string, groupId: string) => void;
  onAddScriptToBlock: (blockId: string) => void;
  onAddScriptToGroup: (blockId: string, groupId: string) => void;
  onRemoveScriptFromGroup: (blockId: string, groupId: string) => void;
  onAddBlock: () => void;
  onScaffoldMode: () => void;
}
