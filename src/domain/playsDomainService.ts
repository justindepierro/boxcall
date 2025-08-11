// PlaysDomainService
// Wrapper enforcing canonicalization & future duplicate_key integration.

import { PlaysService } from "../services/playsService";
import type { Play } from "../types/play";
import {
  canonicalizePlayInput,
  computeDuplicateKey,
  type InboundPlay,
} from "../utils/playDataStandardization";

export interface DomainCreateResult {
  play: Play;
  duplicateKey: string;
  diffs: Record<string, string[]>; // original vs canonical for diagnostic (future telemetry)
}

export class PlaysDomainService {
  /**
   * Create a play ensuring canonical normalization before persistence.
   * NOTE: duplicate_key column not yet in schema; key returned for future use.
   */
  static async createPlay(input: InboundPlay): Promise<DomainCreateResult> {
    const canonical = canonicalizePlayInput(input);
    const duplicateKey = computeDuplicateKey(canonical);
    // Persist using existing raw service (no duplicate_key field yet)
    const play = await PlaysService.createPlay({ ...canonical });
    return { play, duplicateKey, diffs: {} }; // TODO: surface diffs if needed
  }

  /**
   * Update a play by id applying canonicalization to changed fields.
   */
  static async updatePlay(id: string, updates: InboundPlay): Promise<Play> {
    const canonical = canonicalizePlayInput(updates);
    // duplicateKey computed for future use; ignored until column exists
    // const duplicateKey = computeDuplicateKey(canonical);
    return PlaysService.updatePlay(id, { ...canonical });
  }
}
