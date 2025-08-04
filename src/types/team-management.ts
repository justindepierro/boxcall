// Team Management Types
// Player and team management specific types
export interface TeamPlayer {
  id: string;
  team_id: string;
  user_id?: string; // Optional - links to profiles table if user has account
  // Basic Information
  first_name: string;
  last_name: string;
  email?: string;
  // Contact Information
  phone?: string;
  parent_email?: string;
  // Physical Information
  positions: string[]; // Array of positions like ["QB", "WR", "Safety"]
  jersey_number?: number;
  height?: string; // Format: "6'2\"" or "6 feet 2 inches"
  weight?: number; // In pounds
  // Academic Information
  graduation_year?: number;
  // Team Information
  team_level: "varsity" | "jv" | "middle_school" | "freshman";
  // System Fields
  created_at: string;
  updated_at: string;
}
export interface TeamPlayerInsert {
  id?: string;
  team_id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  parent_email?: string;
  positions: string[];
  jersey_number?: number;
  height?: string;
  weight?: number;
  graduation_year?: number;
  team_level: "varsity" | "jv" | "middle_school" | "freshman";
  created_at?: string;
  updated_at?: string;
}
export interface TeamPlayerUpdate {
  id?: string;
  team_id?: string;
  user_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  parent_email?: string;
  positions?: string[];
  jersey_number?: number;
  height?: string;
  weight?: number;
  graduation_year?: number;
  team_level?: "varsity" | "jv" | "middle_school" | "freshman";
  updated_at?: string;
}
// Team Configuration Types
import type { SubscriptionTier } from "./permissions";
// Team Settings
export interface TeamSettings {
  id: string;
  name: string;
  school: string;
  level: TeamLevel;
  season: string;
  logoUrl?: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  subscription: {
    tier: SubscriptionTier;
    features: string[];
    staffCount?: number; // Number of staff subscriptions
    maxStaff?: number; // Max staff allowed (5 for $40 deal)
    headCoachId: string; // User ID of the head coach who owns subscription
  };
  familyPermissions: {
    canViewRoster: boolean;
    canViewSchedule: boolean;
    canViewStats: boolean;
    canRSVP: boolean;
    canFundraise: boolean;
  };
}
// Coach Invitation Types
export interface CoachInvitation {
  id: string;
  team_id: string;
  email: string;
  role: "head_coach" | "coach" | "assistant_coach" | "manager";
  // Invitation Details
  invite_token: string;
  status: "pending" | "accepted" | "expired" | "cancelled";
  expires_at: string;
  // Tracking
  invited_by: string;
  accepted_at?: string;
  created_at: string;
}
export interface CoachInvitationInsert {
  id?: string;
  team_id: string;
  email: string;
  role: "head_coach" | "coach" | "assistant_coach" | "manager";
  invite_token: string;
  status?: "pending" | "accepted" | "expired" | "cancelled";
  expires_at: string;
  invited_by: string;
  accepted_at?: string;
  created_at?: string;
}
// CSV Import Types
export interface CSVImportRow {
  // Raw CSV data
  [key: string]: string | undefined;
}
export interface ParsedPlayerData {
  // Mapped player data from CSV
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  parent_email?: string;
  positions: string[];
  jersey_number?: number;
  height?: string;
  weight?: number;
  graduation_year?: number;
  team_level: "varsity" | "jv" | "middle_school" | "freshman";
  // Import metadata
  row_index: number;
  has_errors: boolean;
  errors: string[];
}
export interface CSVImportResult {
  total_rows: number;
  valid_rows: number;
  error_rows: number;
  parsed_data: ParsedPlayerData[];
  errors: string[];
}
// Position Constants
export const FOOTBALL_POSITIONS = [
  // Offense
  "QB",
  "QB1",
  "QB2",
  "RB",
  "RB1",
  "RB2",
  "FB",
  "HB",
  "WR",
  "WR1",
  "WR2",
  "WR3",
  "Slot",
  "TE",
  "TE1",
  "TE2",
  "LT",
  "LG",
  "C",
  "RG",
  "RT",
  "OL",
  // Defense
  "DE",
  "DT",
  "NT",
  "DL",
  "OLB",
  "MLB",
  "ILB",
  "LB",
  "CB",
  "CB1",
  "CB2",
  "FS",
  "SS",
  "S",
  "DB",
  // Special Teams
  "K",
  "P",
  "LS",
  "KR",
  "PR",
  "ST",
  // Common Combinations
  "RB/WR",
  "WR/DB",
  "LB/DE",
  "OL/DL",
] as const;
export type FootballPosition = (typeof FOOTBALL_POSITIONS)[number];
// Team Level Constants
export const TEAM_LEVELS = [
  { value: "varsity", label: "Varsity", color: "red" },
  { value: "jv", label: "JV", color: "blue" },
  { value: "freshman", label: "Freshman", color: "green" },
  { value: "middle_school", label: "Middle School", color: "purple" },
] as const;
export type TeamLevel = (typeof TEAM_LEVELS)[number]["value"];
