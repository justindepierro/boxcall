/**
 * Shared types for DataSync services
 */

import type { Play } from "../../types/play";
import type { GamePlan } from "../gamePlanService";
import type { PracticeScript } from "../practiceService";

export interface CachedData<T = unknown> {
  data: T;
  timestamp: number;
  version: number;
}

export interface BackupData {
  timestamp: string;
  version: number;
  plays: Play[];
  practiceScripts: PracticeScript[];
  gamePlans: GamePlan[];
  metadata: {
    teamId: string;
    playCount: number;
    lastModified: string;
  };
}

export interface SyncMetrics {
  queryTime: number;
  cacheHitRate: number;
  backupFrequency: number;
  offlineCapability: number;
}
