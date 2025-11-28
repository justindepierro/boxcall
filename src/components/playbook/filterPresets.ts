export interface FilterPreset {
  id: string;
  label: string;
  icon: string;
  filters: {
    field: string;
    operator: "equals" | "contains" | "in";
    value: string | string[];
  }[];
}

export const QUICK_PRESETS: FilterPreset[] = [
  {
    id: "all",
    label: "All Plays",
    icon: "grid",
    filters: [],
  },
  {
    id: "favorites",
    label: "Favorites",
    icon: "star",
    filters: [], // Handled specially in PlayGrid
  },
  {
    id: "most-used",
    label: "Most Used",
    icon: "trending-up",
    filters: [], // Handled specially in PlayGrid with sorting
  },
  {
    id: "run",
    label: "Run Plays",
    icon: "arrow-right",
    filters: [{ field: "playType", operator: "equals", value: "run" }],
  },
  {
    id: "pass",
    label: "Pass Plays",
    icon: "zap",
    filters: [{ field: "playType", operator: "equals", value: "pass" }],
  },
  {
    id: "rpo",
    label: "RPO Plays",
    icon: "repeat",
    filters: [{ field: "playType", operator: "equals", value: "rpo" }],
  },
  {
    id: "redzone",
    label: "Red Zone",
    icon: "target",
    filters: [{ field: "fieldPosition", operator: "equals", value: "redzone" }],
  },
  {
    id: "thirddown",
    label: "3rd Down",
    icon: "award",
    filters: [{ field: "down", operator: "equals", value: "3" }],
  },
];
