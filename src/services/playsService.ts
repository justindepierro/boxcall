/**
 * PlaysService - Backward Compatibility Wrapper
 *
 * This file maintains backward compatibility while internally delegating
 * to the new modular play services in src/services/plays/
 *
 * New code should import from:
 * - import { PlayCrudService } from './plays/crudService'
 * - import { PlaySuggestionService } from './plays/suggestionService'
 * - import { PlaybookSearchService } from './plays/searchService'
 * - import { PlayHelperService } from './plays/helperService'
 */

// Re-export types for backward compatibility
export type {
  SearchResult,
  QuickFilter,
  SearchPreset,
  PlayQueryOptions,
  MergePlaybooksResult,
} from "./plays/types";

// Import modular services
import { PlayCrudService } from "./plays/crudService";
import { PlaySuggestionService } from "./plays/suggestionService";
import { PlayHelperService } from "./plays/helperService";
import { PlaybookSearchService } from "./plays/searchService";

import type { Play } from "../types/play";

/**
 * @deprecated Use modular services from ./plays/ instead
 * Unified PlaysService - delegates to specialized services
 */
export class PlaysService {
  // ============================================================================
  // HELPER METHODS - Delegate to PlayHelperService
  // ============================================================================

  static async ensureUserHasPlaybook(): Promise<string> {
    return PlayHelperService.ensureUserHasPlaybook();
  }

  static async getUniqueFormations(): Promise<string[]> {
    return PlayHelperService.getUniqueFormations();
  }

  static async getUniquePlayNames(): Promise<string[]> {
    return PlayHelperService.getUniquePlayNames();
  }

  static async getUniquePersonnel(): Promise<string[]> {
    return PlayHelperService.getUniquePersonnel();
  }

  static async getUniquePlayTypes(): Promise<string[]> {
    return PlayHelperService.getUniquePlayTypes();
  }

  // ============================================================================
  // CRUD OPERATIONS - Delegate to PlayCrudService
  // ============================================================================

  static async createPlay(playData: Partial<Play>): Promise<Play> {
    return PlayCrudService.createPlay(playData);
  }

  static async getPlaysByPlaybook(
    playbookId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<Play[]> {
    return PlayCrudService.getPlaysByPlaybook(playbookId, options);
  }

  static async getPlay(id: string): Promise<Play | null> {
    return PlayCrudService.getPlay(id);
  }

  static async getPlaysByIds(ids: string[]): Promise<Play[]> {
    return PlayCrudService.getPlaysByIds(ids);
  }

  static async updatePlay(id: string, updates: Partial<Play>): Promise<Play> {
    return PlayCrudService.updatePlay(id, updates);
  }

  static async deletePlay(id: string): Promise<void> {
    return PlayCrudService.deletePlay(id);
  }

  static async deletePlays(ids: string[]): Promise<void> {
    return PlayCrudService.deletePlays(ids);
  }

  static async restorePlays(ids: string[]): Promise<void> {
    return PlayCrudService.restorePlays(ids);
  }

  static async mergePlaybooks(
    sourcePlaybookIds: string[],
    newName: string,
    newDescription?: string,
    teamId?: string
  ): Promise<{ playbookId: string; playCount: number }> {
    return PlayCrudService.mergePlaybooks(
      sourcePlaybookIds,
      newName,
      newDescription,
      teamId
    );
  }

  // ============================================================================
  // AI SUGGESTIONS - Delegate to PlaySuggestionService
  // ============================================================================

  static async getAISuggestedFormations(
    currentFormation?: string,
    playbookId?: string,
    limit = 5
  ): Promise<string[]> {
    return PlaySuggestionService.getAISuggestedFormations(
      currentFormation,
      playbookId,
      limit
    );
  }

  static async getAISuggestedPlayNames(
    formation?: string,
    playType?: string,
    playbookId?: string,
    limit = 5
  ): Promise<string[]> {
    return PlaySuggestionService.getAISuggestedPlayNames(
      formation,
      playType,
      playbookId,
      limit
    );
  }

  static async getAISuggestedPersonnel(
    formation?: string,
    playbookId?: string,
    limit = 5
  ): Promise<string[]> {
    return PlaySuggestionService.getAISuggestedPersonnel(
      formation,
      playbookId,
      limit
    );
  }

  static generatePlayNameSuggestions(
    formation?: string,
    playType?: string,
    existingNames: string[] = []
  ): string[] {
    return PlaySuggestionService.generatePlayNameSuggestions(
      formation,
      playType,
      existingNames
    );
  }
}

// ============================================================================
// PLAYBOOK SEARCH SERVICE - Re-export for backward compatibility
// ============================================================================

export { PlaybookSearchService };
