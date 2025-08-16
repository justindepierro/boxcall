// PlaysDomainService
// Wrapper enforcing canonicalization & future duplicate_key integration.

import { PlaysService } from "../services/playsService";
import { TelemetryEventTypes } from "../telemetry/events";
import {
  canonicalizePlayInput,
  computeDuplicateKey,
  type InboundPlay,
} from "../utils/playDataStandardization";

import type { Play } from "../types/play";


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
    if (!duplicateKey) {
      try {
        (await import("../telemetry/dispatcher")).telemetry.enqueue({
          type: "play.duplicate_key.missing",
          data: {
            path: "createPlay",
            inputSnapshot: {
              play_name: input.play_name,
              formation: input.formation,
            },
          },
        });
      } catch {
        /* ignore */
      }
    }
    try {
      const play = await PlaysService.createPlay({
        ...canonical,
        duplicate_key: duplicateKey,
      });
      // Lightweight telemetry event (buffered)
      try {
        (await import("../telemetry/dispatcher")).telemetry.enqueue({
          type: TelemetryEventTypes.PlayCreate,
          data: { duplicateKey, id: play.id },
        });
      } catch (_e) {
        // ignore telemetry failures
      }
      return { play, duplicateKey, diffs: {} };
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      if (
        e?.code === "23505" ||
        /duplicate key value/.test(String(e?.message))
      ) {
        throw new Error(
          "Duplicate play detected: a play with the same name & formation already exists (active)."
        );
      }
      throw err;
    }
  }

  /**
   * Update a play by id applying canonicalization to changed fields.
   */
  static async updatePlay(id: string, updates: InboundPlay): Promise<Play> {
    const canonical = canonicalizePlayInput(updates);
    const duplicateKey = computeDuplicateKey(canonical);
    if (!duplicateKey) {
      try {
        (await import("../telemetry/dispatcher")).telemetry.enqueue({
          type: "play.duplicate_key.missing",
          data: {
            path: "updatePlay",
            id,
            updatesSnapshot: {
              play_name: updates.play_name,
              formation: updates.formation,
            },
          },
        });
      } catch {
        /* ignore */
      }
    }
    try {
      const updated = await PlaysService.updatePlay(id, {
        ...canonical,
        duplicate_key: duplicateKey,
      });
      try {
        (await import("../telemetry/dispatcher")).telemetry.enqueue({
          type: TelemetryEventTypes.PlayUpdate,
          data: { duplicateKey, id },
        });
      } catch (_e) {
        // ignore telemetry failures
      }
      return updated;
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      if (
        e?.code === "23505" ||
        /duplicate key value/.test(String(e?.message))
      ) {
        throw new Error(
          "Duplicate play conflict on update: another active play already has this name & formation."
        );
      }
      throw err;
    }
  }
}
