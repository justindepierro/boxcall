/**
 * Bulk Operations Service - Bulk create and import operations
 *
 * Handles bulk play creation and CSV imports
 */

import type { PlaysDomainService as _PlaysDomainService } from "../../domain/playsDomainService";
import { CSVService } from "../csv";
import { PlaysService } from "../playsService";
import type { Play } from "../../types/play";
import type { InboundPlay as _InboundPlay } from "../../utils/playDataStandardization";
import { CacheService } from "./CacheService";
import { debug, logError } from "../../utils/logger";

export class BulkOperationsService {
  /**
   * Bulk create plays from CSV import (for 300+ play testing)
   */
  static async bulkCreatePlays(
    playbookId: string,
    plays: Omit<Play, "id" | "created_at" | "updated_at" | "created_by">[]
  ): Promise<{
    success: boolean;
    created: Play[];
    errors: string[];
    totalProcessed: number;
  }> {
    const startTime = performance.now();
    const created: Play[] = [];
    const errors: string[] = [];

    debug(`🚀 Starting delegated bulk import of ${plays.length} plays...`);

    try {
      // Sequential delegation (can be optimized/batched later)
      for (const p of plays) {
        try {
          // Ensure playbook_id is present in the play data
          const playWithPlaybookId = {
            ...p,
            playbook_id: p.playbook_id || playbookId,
          };

          // Use PlaysService directly for bulk import; inputs should already be validated/standardized.
          const createdPlay = await PlaysService.createPlay(playWithPlaybookId);

          created.push(createdPlay);
          CacheService.addToLocal("play", createdPlay);
        } catch (e: unknown) {
          errors.push(
            e instanceof Error ? e.message : "Unknown error creating play"
          );
        }
      }

      // Clear playbook cache to force refresh
      const cacheKey = `plays_${playbookId}`;
      CacheService.delete(cacheKey);

      const duration = performance.now() - startTime;
      debug(
        `✅ Delegated bulk import complete: ${created.length}/${plays.length} plays created in ${duration.toFixed(2)}ms`
      );

      return {
        success: errors.length === 0,
        created,
        errors,
        totalProcessed: plays.length,
      };
    } catch (error) {
      logError("❌ Bulk import failed:", error);
      return {
        success: false,
        created,
        errors: [error instanceof Error ? error.message : "Unknown error"],
        totalProcessed: plays.length,
      };
    }
  }

  /**
   * Import plays from CSV content
   */
  static async importFromCSV(
    playbookId: string,
    csvContent: string
  ): Promise<{
    success: boolean;
    totalRows: number;
    importedPlays: number;
    errors: string[];
    created: Play[];
  }> {
    debug("📊 Parsing CSV content...");

    // Parse CSV using existing CSV service
    const parseResult = CSVService.parseCSVForPreview(csvContent);

    if (parseResult.previews.length === 0) {
      return {
        success: false,
        totalRows: parseResult.summary.totalRows,
        importedPlays: 0,
        errors: ["No valid plays found in CSV"],
        created: [],
      };
    }

    // Convert previews to actual plays
    const validPreviews = parseResult.previews.filter((p) => p.isValid);
    const convertResult = CSVService.convertPreviewsToPlays(
      validPreviews,
      playbookId
    );
    const plays = convertResult.plays;

    debug(`📋 Parsed ${plays.length} valid plays from CSV`);

    // Bulk create the parsed plays
    const bulkResult = await this.bulkCreatePlays(playbookId, plays);

    return {
      success: bulkResult.success,
      totalRows: parseResult.summary.totalRows,
      importedPlays: bulkResult.created.length,
      errors: bulkResult.errors,
      created: bulkResult.created,
    };
  }
}
