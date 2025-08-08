// Custom field types
export type CustomFieldType =
  | "text"
  | "number"
  | "boolean"
  | "select"
  | "multi_select"
  | "date"
  | "url";

// Valid custom field values
export type CustomFieldValue =
  | string
  | number
  | boolean
  | string[]
  | Date
  | null;

// Custom field definition (team-specific)
export interface CustomFieldDefinition {
  id: string;
  team_id: string;
  field_name: string;
  field_type: CustomFieldType;
  field_label: string;
  field_description?: string;
  field_options?: string[]; // For select/multi_select types
  default_value?: CustomFieldValue;
  is_required: boolean;
  display_order: number;
  category: string; // 'formation', 'execution', 'analysis', 'conditions', etc.
  created_at: Date;
  updated_at: Date;
}

// Custom field values (stored as JSONB in database)
export interface CustomFieldValues {
  [field_name: string]: CustomFieldValue; // Dynamic based on field definitions
}

// Play types that match the exact database schema
export interface Play {
  id: string; // uuid
  playbook_id: string; // uuid
  formation: string; // text
  f_dir?: string; // text - Formation direction/strength
  ftag1?: string; // text - Formation tag 1
  ftag2?: string; // text - Formation tag 2
  back_align?: string; // text - RB alignment
  shift?: string; // text - Formation shift
  motion?: string; // text - Pre-snap motion
  protection?: string; // text - Protection scheme
  play_name: string; // text - Main play name
  p_tag1?: string; // text - Play tag 1
  p_tag2?: string; // text - Play tag 2
  p_dir?: string; // text - Play direction
  f_type?: string; // text - Formation type (10P, 11P, etc)
  p_type: string; // text - Play type (changed from enum to string to match DB)
  key_player1?: string; // text - Key player identifier
  key_player2?: string; // text - Second key player
  pref_down?: string; // text - Preferred down
  pref_dis?: string; // text - Preferred distance
  pref_hash?: string; // text - Preferred hash
  pref_cov?: string; // text - Preferred coverage
  pref_front?: string; // text - Preferred front
  check_into?: string; // text - Check/audible options
  r_str?: string; // text - Run strength
  p_str?: string; // text - Pass strength
  personnel?: string; // text - Personnel grouping
  confidence_base: number; // numeric - Base confidence (default 70)
  success_rate?: number; // numeric - Historical success rate
  times_called: number; // integer - Usage tracking
  times_successful: number; // integer - Success tracking
  diagram_url?: string; // text - Play diagram image
  video_url?: string; // text - Instructional video
  notes?: string; // text - Additional notes
  tags?: string[]; // ARRAY _text - Flexible tagging
  custom_fields?: CustomFieldValues; // JSONB - Team-defined custom fields
  created_by: string; // uuid - User who created the play
  created_at: Date; // timestamptz - Creation timestamp
  updated_at: Date; // timestamptz - Last update timestamp
  one_word_play?: string; // text - "Corndog" style audible call
  is_archived?: boolean; // bool - Archive status
  last_used_at?: Date; // timestamptz - When play was last used
  complexity_score?: number; // integer - Play complexity rating
  search_vector?: string; // tsvector - Full-text search (handled by DB)
}
// Play type enumeration matching database constraint (text field)
export type PlayType =
  | "Pass"
  | "Run"
  | "RPO"
  | "Play Action"
  | "Screen"
  | "Special";
// Formation types commonly used in football
export interface FormationOption {
  name: string;
  type: string;
  personnel: string;
  description: string;
}
// Builder wizard step data
export interface PlayBuilderData {
  // Step 1: Basic Info
  play_name: string;
  p_type: PlayType;
  one_word_play?: string;
  // Step 2: Formation
  formation: string;
  f_dir?: string;
  ftag1?: string;
  ftag2?: string;
  f_type?: string;
  personnel?: string;
  back_align?: string;
  // Step 3: Protection & Motion
  protection?: string;
  shift?: string;
  motion?: string;
  // Step 4: Play Details
  p_dir?: string;
  p_tag1?: string;
  p_tag2?: string;
  key_player1?: string;
  key_player2?: string;
  check_into?: string;
  r_str?: string;
  p_str?: string;
  // Step 5: Preferences
  pref_down?: string;
  pref_dis?: string;
  pref_hash?: string;
  pref_cov?: string;
  pref_front?: string;
  // Step 6: Additional
  notes?: string;
  tags?: string[];
  confidence_base: number;
}
// Common formation options
export const FORMATION_OPTIONS: FormationOption[] = [
  {
    name: "Empty",
    type: "Spread",
    personnel: "Regular",
    description: "0 RB, 5 WR",
  },
  {
    name: "Shotgun",
    type: "Spread",
    personnel: "Regular",
    description: "QB in shotgun, RB behind",
  },
  {
    name: "Pistol",
    type: "Spread",
    personnel: "Regular",
    description: "QB 4 yards, RB behind",
  },
  {
    name: "I-Formation",
    type: "Power",
    personnel: "Regular",
    description: "FB and RB in line",
  },
  {
    name: "Singleback",
    type: "Balanced",
    personnel: "Regular",
    description: "Single RB behind QB",
  },
  {
    name: "Doubles",
    type: "Spread",
    personnel: "Regular",
    description: "2x2 receiver formation",
  },
  {
    name: "Trips",
    type: "Spread",
    personnel: "Regular",
    description: "3x1 receiver formation",
  },
  {
    name: "Trio",
    type: "Spread",
    personnel: "Regular",
    description: "3 receivers one side",
  },
  {
    name: "Deuce",
    type: "Balanced",
    personnel: "Regular",
    description: "2 receivers each side",
  },
  {
    name: "Ace",
    type: "Balanced",
    personnel: "Regular",
    description: "Tight formation",
  },
  {
    name: "Twins",
    type: "Spread",
    personnel: "Regular",
    description: "Twin receivers",
  },
  {
    name: "Stack",
    type: "Spread",
    personnel: "Regular",
    description: "Stacked receivers",
  },
  {
    name: "Bunch",
    type: "Bunch",
    personnel: "Regular",
    description: "Tight receiver bunch",
  },
];
// Direction options
export const DIRECTION_OPTIONS = ["Left", "Right", "Middle"] as const;
// Formation tags
export const FORMATION_TAGS = [
  "Far",
  "Near",
  "eFar",
  "eNear",
  "Flex",
  "Stack",
  "Bunch",
  "Tight",
  "Wide",
  "Next",
] as const;
// Back alignment options
export const BACK_ALIGN_OPTIONS = [
  "Default",
  "Deep",
  "Shallow",
  "Wide",
  "Tight",
  "Offset",
] as const;
// Protection schemes
export const PROTECTION_OPTIONS = [
  "Half",
  "Full",
  "Quick",
  "Max",
  "Slide",
  "Six",
  "Seven",
  "Hot",
] as const;
// Down preferences
export const DOWN_OPTIONS = ["Any", "1", "2", "3", "4"] as const;
// Distance preferences
export const DISTANCE_OPTIONS = [
  "Any",
  "Short",
  "Medium",
  "Long",
  "1-3",
  "4-6",
  "7-10",
  "11+",
] as const;
// Hash preferences
export const HASH_OPTIONS = ["Any", "Left", "Right", "Middle"] as const;
// Play type options for filtering
export const PLAY_TYPE_OPTIONS: {
  value: PlayType;
  label: string;
  description: string;
}[] = [
  { value: "Pass", label: "Pass", description: "Passing plays" },
  { value: "Run", label: "Run", description: "Running plays" },
  { value: "RPO", label: "RPO", description: "Run-Pass Options" },
];
