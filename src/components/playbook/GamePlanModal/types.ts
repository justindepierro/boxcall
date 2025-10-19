import type { BillickSituationType } from "../../../constants/gamePlanSituations";

/**
 * Play assigned to a game plan situation
 */
export interface GamePlanPlay {
  id: string;
  playId: string; // Reference to playbook play
  playName: string;
  formation?: string;
  personnel?: string;
  wristbandNumber?: string;
  priority: number; // Order within the situation (1, 2, 3...)
}

/**
 * Billick situation within a game plan
 */
export interface GamePlanSituation {
  id: string;
  situationType: BillickSituationType;
  plays: GamePlanPlay[];
}

/**
 * Complete game plan
 */
export interface GamePlan {
  id: string;
  name: string;
  opponent: string;
  gameDate?: string;
  gameLocation?: "Home" | "Away" | "Neutral";
  situations: GamePlanSituation[];
  createdAt: Date;
  updatedAt: Date;
  isArchived?: boolean;
}

/**
 * Form data for game plan metadata
 */
export interface GamePlanFormData {
  name: string;
  opponent: string;
  gameDate?: string;
  gameLocation?: "Home" | "Away" | "Neutral";
}
