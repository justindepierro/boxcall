import { FORMATION_OPTIONS, PLAY_TYPE_OPTIONS } from "../../../types/play";
import type { FilterField } from "./types";

export const FILTER_FIELDS: FilterField[] = [
  // ============ CORE IDENTIFICATION ============
  { value: "name", label: "Play Name", type: "text" },
  {
    value: "formation",
    label: "Formation",
    type: "select",
    options: FORMATION_OPTIONS.map((f) => ({ value: f.name, label: f.name })),
  },
  {
    value: "playType",
    label: "Play Type",
    type: "select",
    options: PLAY_TYPE_OPTIONS.map((p) => ({ value: p.value, label: p.label })),
  },
  {
    value: "playFamily",
    label: "Play Family",
    type: "select",
    options: [
      { value: "inside_zone", label: "Inside Zone" },
      { value: "outside_zone", label: "Outside Zone" },
      { value: "power", label: "Power" },
      { value: "counter", label: "Counter" },
      { value: "trap", label: "Trap" },
      { value: "draw", label: "Draw" },
      { value: "screen", label: "Screen" },
      { value: "sweep", label: "Sweep" },
      { value: "quick_game", label: "Quick Game" },
      { value: "drop_back", label: "Drop Back" },
      { value: "play_action", label: "Play Action" },
      { value: "rpo", label: "RPO" },
      { value: "boot", label: "Boot/Rollout" },
      { value: "sprint_out", label: "Sprint Out" },
    ],
  },
  { value: "description", label: "Description / Notes", type: "text" },

  // ============ PERSONNEL & ALIGNMENT ============
  {
    value: "personnel",
    label: "Personnel Grouping",
    type: "select",
    options: [
      { value: "00", label: "00 (Empty)" },
      { value: "10", label: "10 (1 RB, 0 TE)" },
      { value: "11", label: "11 (1 RB, 1 TE)" },
      { value: "12", label: "12 (1 RB, 2 TE)" },
      { value: "13", label: "13 (1 RB, 3 TE)" },
      { value: "20", label: "20 (2 RB, 0 TE)" },
      { value: "21", label: "21 (2 RB, 1 TE)" },
      { value: "22", label: "22 (2 RB, 2 TE)" },
      { value: "23", label: "23 (2 RB, 3 TE / Goal Line)" },
    ],
  },
  {
    value: "prefHash",
    label: "Hash Preference",
    type: "select",
    options: [
      { value: "left", label: "Left Hash" },
      { value: "middle", label: "Middle" },
      { value: "right", label: "Right Hash" },
      { value: "any", label: "Any Hash" },
    ],
  },

  // ============ DOWN & DISTANCE (Billick Methodology) ============
  {
    value: "down",
    label: "Preferred Down",
    type: "select",
    options: [
      { value: "1", label: "1st Down" },
      { value: "2", label: "2nd Down" },
      { value: "3", label: "3rd Down" },
      { value: "4", label: "4th Down" },
      { value: "1-2", label: "Early Downs (1st & 2nd)" },
    ],
  },
  {
    value: "distance",
    label: "Distance Bucket",
    type: "select",
    options: [
      { value: "short", label: "Short (1-3 yds)" },
      { value: "medium", label: "Medium (4-6 yds)" },
      { value: "long", label: "Long (7+ yds)" },
      { value: "goal_to_go", label: "Goal to Go" },
    ],
  },
  {
    value: "downDistanceBucket",
    label: "Down & Distance",
    type: "select",
    options: [
      { value: "1st_normal", label: "1st & 10" },
      { value: "2nd_short", label: "2nd & Short (1-3)" },
      { value: "2nd_medium", label: "2nd & Medium (4-6)" },
      { value: "2nd_long", label: "2nd & Long (7+)" },
      { value: "3rd_short", label: "3rd & Short (1-3)" },
      { value: "3rd_medium", label: "3rd & Medium (4-6)" },
      { value: "3rd_long", label: "3rd & Long (7+)" },
      { value: "4th_short", label: "4th & Short" },
      { value: "goal_to_go", label: "Goal to Go" },
    ],
  },

  // ============ FIELD POSITION (Game Planning) ============
  {
    value: "fieldPosition",
    label: "Field Zone",
    type: "select",
    options: [
      { value: "backed_up", label: "Backed Up (Own 1-10)" },
      { value: "own_territory", label: "Own Territory (Own 11-49)" },
      { value: "plus_territory", label: "Plus Territory (Opp 40-21)" },
      { value: "redzone", label: "Red Zone (Opp 20-6)" },
      { value: "goalline", label: "Goal Line (Opp 5-1)" },
    ],
  },
  {
    value: "situation",
    label: "Game Situation",
    type: "select",
    options: [
      { value: "2-minute", label: "2-Minute Drill" },
      { value: "4-minute", label: "4-Minute / Ball Control" },
      { value: "coming_out", label: "Coming Out" },
      { value: "must_have", label: "Must Have" },
      { value: "openers", label: "Openers / Script" },
    ],
  },

  // ============ DEFENSIVE READS ============
  {
    value: "prefCov",
    label: "Coverage Preference",
    type: "select",
    options: [
      { value: "man", label: "vs Man Coverage" },
      { value: "zone", label: "vs Zone Coverage" },
      { value: "cover2", label: "vs Cover 2" },
      { value: "cover3", label: "vs Cover 3" },
      { value: "cover4", label: "vs Cover 4 / Quarters" },
      { value: "press", label: "vs Press" },
    ],
  },
  {
    value: "prefFront",
    label: "Front Preference",
    type: "select",
    options: [
      { value: "even", label: "vs Even Front (4-3, 4-2-5)" },
      { value: "odd", label: "vs Odd Front (3-4, 3-3-5)" },
      { value: "bear", label: "vs Bear / Goal Line" },
    ],
  },

  // ============ TAGS & CATEGORIZATION ============
  { value: "tags", label: "Tags / Flags", type: "text" },
  {
    value: "category",
    label: "Smart Category",
    type: "select",
    options: [
      { value: "run", label: "Run" },
      { value: "pass", label: "Pass" },
      { value: "rpo", label: "RPO" },
      { value: "play-action", label: "Play Action" },
      { value: "screen", label: "Screen" },
      { value: "special", label: "Special" },
    ],
  },
  {
    value: "complexity",
    label: "Install Complexity",
    type: "select",
    options: [
      { value: "1", label: "Basic (Week 1)" },
      { value: "2", label: "Intermediate (Week 2-3)" },
      { value: "3", label: "Advanced (Week 4+)" },
    ],
  },

  // ============ ANALYTICS & PERFORMANCE ============
  { value: "successRate", label: "Success Rate (%)", type: "number" },
  { value: "yardsPerPlay", label: "Yards Per Play", type: "number" },
  { value: "timesUsed", label: "Times Called", type: "number" },
  { value: "lastUsed", label: "Last Used", type: "date" },
  { value: "created_at", label: "Date Created", type: "date" },
  { value: "updated_at", label: "Last Updated", type: "date" },
];
