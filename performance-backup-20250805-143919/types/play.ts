// Play types that match the existing database schema
export interface Play {
  id: string;
  playbook_id: string;
  formation: string; // Main formation name
  f_dir?: string; // Formation direction/strength
  ftag1?: string; // Formation tag 1
  ftag2?: string; // Formation tag 2
  back_align?: string; // RB alignment
  shift?: string; // Formation shift
  motion?: string; // Pre-snap motion
  protection?: string; // Protection scheme
  play_name: string; // Main play name
  one_word_play?: string; // "Corndog" style audible call
  p_tag1?: string; // Play tag 1
  p_tag2?: string; // Play tag 2
  p_dir?: string; // Play direction
  f_type?: string; // Formation type (10P, 11P, etc)
  p_type: PlayType; // Play type
  key_player1?: string; // Key player identifier
  key_player2?: string; // Second key player
  pref_down?: string; // Preferred down
  pref_dis?: string; // Preferred distance
  pref_hash?: string; // Preferred hash
  pref_cov?: string; // Preferred coverage
  pref_front?: string; // Preferred front
  check_into?: string; // Check/audible options
  r_str?: string; // Run strength
  p_str?: string; // Pass strength
  personnel?: string; // Personnel grouping
  confidence_base: number; // Base confidence (default 70)
  success_rate?: number; // Historical success rate
  times_called: number; // Usage tracking
  times_successful: number; // Success tracking
  diagram_url?: string; // Play diagram image
  video_url?: string; // Instructional video
  notes?: string; // Additional notes
  tags?: string[]; // Flexible tagging
  created_by: string;
  created_at: Date;
  updated_at: Date;
}
// Play type enumeration matching database constraint
export type PlayType = "Pass" | "Run" | "RPO" | "Play Action";
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
