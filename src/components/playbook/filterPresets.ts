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
    label: "⭐ Favorites",
    icon: "star",
    filters: [], // Handled specially in PlayGrid
  },
  {
    id: "most-used",
    label: "🔥 Most Used",
    icon: "trending-up",
    filters: [], // Handled specially in PlayGrid with sorting
  },
  {
    id: "run",
    label: "Run Only",
    icon: "trending-up",
    filters: [{ field: "playType", operator: "equals", value: "run" }],
  },
  {
    id: "pass",
    label: "Pass Only",
    icon: "zap",
    filters: [{ field: "playType", operator: "equals", value: "pass" }],
  },
  {
    id: "rpo",
    label: "RPO Only",
    icon: "shuffle",
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
    icon: "trending-up",
    filters: [{ field: "down", operator: "equals", value: "3" }],
  },
];
