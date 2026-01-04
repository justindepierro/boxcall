/** Practice service shared types (service-layer shapes distinct from DB types). */
import type { Play } from "./play";
import type { PracticeScript as BasePracticeScript } from "./practice";

export interface PracticeScript extends Partial<BasePracticeScript> {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  teamId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isTemplate: boolean;
  isArchived?: boolean;
  plays?: PracticeScriptPlay[];
  duration: number;
  tags?: string[];
}

export interface PracticeScriptPlay {
  id: string;
  playId: string;
  play: Play;
  order: number;
  notes?: string;
  repetitions: number;
  estimatedTime?: number;
  hash?: "left" | "middle" | "right";
  downDistance?: string;
  fieldPosition?: "plus_territory" | "red_zone" | "backed_up" | "midfield";
  defensiveFront?: "base" | "4-3" | "3-4" | "nickel" | "dime" | "bear" | "tite";
  coverage?:
    | "cover_0"
    | "cover_1"
    | "cover_2"
    | "cover_3"
    | "cover_4"
    | "cover_6"
    | "quarters"
    | "man";
  blitz?:
    | "none"
    | "edge"
    | "a_gap"
    | "b_gap"
    | "sim_pressure"
    | "zone_blitz"
    | "all_out";
  scenarioNotes?: string;
  addedAt: Date;
}

export interface CreatePracticeScriptData {
  name: string;
  description?: string;
  teamId: string;
  isTemplate?: boolean;
  tags?: string[];
}

export interface AddPlayToPracticeScriptData {
  scriptId: string;
  playId: string;
  orderIndex?: number;
  notes?: string;
  repetitions?: number;
  estimatedTime?: number;
  hash?: "left" | "middle" | "right";
  downDistance?: string;
  fieldPosition?: "plus_territory" | "red_zone" | "backed_up" | "midfield";
  defensiveFront?: "base" | "4-3" | "3-4" | "nickel" | "dime" | "bear" | "tite";
  coverage?:
    | "cover_0"
    | "cover_1"
    | "cover_2"
    | "cover_3"
    | "cover_4"
    | "cover_6"
    | "quarters"
    | "man";
  blitz?:
    | "none"
    | "edge"
    | "a_gap"
    | "b_gap"
    | "sim_pressure"
    | "zone_blitz"
    | "all_out";
  scenarioNotes?: string;
}

export interface PracticeTemplate {
  id: string;
  name: string;
  description?: string;
  teamId: string | null;
  duration: number | null;
  isPublic: boolean;
  createdBy: string | null;
  createdAt: Date;
  updatedAt?: Date;
  plays?: PracticeScriptPlay[];
}

export interface CreatePracticeTemplateData {
  name: string;
  description?: string;
  teamId: string;
  duration?: number;
  isPublic?: boolean;
  scriptId?: string;
}

export interface PracticeSearchResult {
  schedules: any[];
  templates: PracticeTemplate[];
  scripts: any[];
}
