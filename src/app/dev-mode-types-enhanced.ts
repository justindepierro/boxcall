/**
 * Development Mode Types (Enhanced Version)
 *
 * This file now imports from the new professional dev profile system
 * while maintaining backward compatibility with existing code.
 *
 * @version 2.0.0 - Professional dev profile system
 * @author BoxCall Development Team
 */

// Import the new professional types
import type { DevMode } from "../types/dev-profiles";

export type {
  DevMode,
  DevProfileConfig,
  DevProfilePermissions,
  DevProfileState,
  DevDataScope,
} from "../types/dev-profiles";

// Legacy types for backward compatibility
export type MockTeamData = {
  id: string;
  name: string;
  description: string;
  team_code: string;
  subscription_tier: "free" | "coach" | "team_premium";
  players: Array<{
    id: string;
    first_name: string;
    last_name: string;
    jersey_number: number;
    positions: string[];
    grade: number;
    height: string;
    weight: number;
    team_level: "varsity" | "jv" | "middle_school" | "freshman";
  }>;
  coaches: Array<{
    id: string;
    name: string;
    role: "head_coach" | "assistant_coach" | "coordinator" | "manager";
  }>;
};

// Legacy context type for backward compatibility
export interface DevModeContextType {
  devMode: DevMode;
  setDevMode: (mode: DevMode) => void;
  mockTeamData: MockTeamData;
  isDevMode: boolean;
  effectiveUserRole: string;
  effectiveTeamData: MockTeamData | null;
}

// Legacy mock team data - kept for backward compatibility during transition
// TODO: Remove this once all services are migrated to new dev profile system
export const mockTeamData: MockTeamData = {
  id: "mock-team-dev",
  name: "BoxCall Dev Team",
  description: "High School Varsity Football - Mock Development Team",
  team_code: "DEVTEAM",
  subscription_tier: "team_premium",
  players: [
    {
      id: "player-1",
      first_name: "Jake",
      last_name: "Wilson",
      jersey_number: 12,
      positions: ["QB"],
      grade: 11,
      height: "6'2\"",
      weight: 185,
      team_level: "varsity",
    },
    {
      id: "player-2",
      first_name: "Marcus",
      last_name: "Johnson",
      jersey_number: 22,
      positions: ["RB"],
      grade: 12,
      height: "5'10\"",
      weight: 195,
      team_level: "varsity",
    },
    {
      id: "player-3",
      first_name: "Tyler",
      last_name: "Brown",
      jersey_number: 88,
      positions: ["WR"],
      grade: 11,
      height: "6'1\"",
      weight: 175,
      team_level: "varsity",
    },
    {
      id: "player-4",
      first_name: "Alex",
      last_name: "Davis",
      jersey_number: 7,
      positions: ["WR"],
      grade: 10,
      height: "5'11\"",
      weight: 170,
      team_level: "varsity",
    },
    {
      id: "player-5",
      first_name: "Connor",
      last_name: "Miller",
      jersey_number: 85,
      positions: ["TE"],
      grade: 12,
      height: "6'4\"",
      weight: 220,
      team_level: "varsity",
    },
    {
      id: "player-6",
      first_name: "Jordan",
      last_name: "Garcia",
      jersey_number: 77,
      positions: ["OL"],
      grade: 12,
      height: "6'3\"",
      weight: 250,
      team_level: "varsity",
    },
    {
      id: "player-7",
      first_name: "Cameron",
      last_name: "Rodriguez",
      jersey_number: 65,
      positions: ["OL"],
      grade: 11,
      height: "6'2\"",
      weight: 245,
      team_level: "varsity",
    },
    {
      id: "player-8",
      first_name: "Mason",
      last_name: "Martinez",
      jersey_number: 55,
      positions: ["LB"],
      grade: 11,
      height: "6'0\"",
      weight: 210,
      team_level: "varsity",
    },
    {
      id: "player-9",
      first_name: "Ethan",
      last_name: "Anderson",
      jersey_number: 44,
      positions: ["LB"],
      grade: 12,
      height: "5'11\"",
      weight: 205,
      team_level: "varsity",
    },
    {
      id: "player-10",
      first_name: "Logan",
      last_name: "Thomas",
      jersey_number: 33,
      positions: ["S"],
      grade: 11,
      height: "5'10\"",
      weight: 180,
      team_level: "varsity",
    },
    {
      id: "player-11",
      first_name: "Blake",
      last_name: "Jackson",
      jersey_number: 21,
      positions: ["CB"],
      grade: 10,
      height: "5'9\"",
      weight: 175,
      team_level: "varsity",
    },
    {
      id: "player-12",
      first_name: "Hunter",
      last_name: "White",
      jersey_number: 11,
      positions: ["CB"],
      grade: 11,
      height: "5'10\"",
      weight: 180,
      team_level: "varsity",
    },
    {
      id: "player-13",
      first_name: "Carson",
      last_name: "Harris",
      jersey_number: 99,
      positions: ["DL"],
      grade: 12,
      height: "6'1\"",
      weight: 235,
      team_level: "varsity",
    },
    {
      id: "player-14",
      first_name: "Trevor",
      last_name: "Clark",
      jersey_number: 98,
      positions: ["DL"],
      grade: 11,
      height: "6'0\"",
      weight: 230,
      team_level: "varsity",
    },
    {
      id: "player-15",
      first_name: "Ryan",
      last_name: "Lewis",
      jersey_number: 3,
      positions: ["K"],
      grade: 10,
      height: "5'8\"",
      weight: 165,
      team_level: "varsity",
    },
  ],
  coaches: [
    {
      id: "coach-1",
      name: "Coach Mike Thompson",
      role: "head_coach",
    },
    {
      id: "coach-2",
      name: "Coach Sarah Rodriguez",
      role: "assistant_coach",
    },
    {
      id: "coach-3",
      name: "Coach David Kim",
      role: "coordinator",
    },
    {
      id: "coach-4",
      name: "Lisa Park",
      role: "manager",
    },
  ],
};
