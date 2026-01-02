/**
 * PracticeService - Backward Compatibility Wrapper
 *
 * This file maintains backward compatibility while internally delegating
 * to the new modular practice services in src/services/practice/
 *
 * New code should import from:
 * - import { PracticeScriptService } from './practice/scriptService'
 * - import { PracticeScheduleService } from './practice/scheduleService'
 * - import { PracticeTemplateService } from './practice/templateService'
 * - import { PracticeSearchService } from './practice/searchService'
 */

// Re-export types for backward compatibility
export type {
  PracticeScript,
  PracticeScriptPlay,
  CreatePracticeScriptData,
  AddPlayToPracticeScriptData,
  PracticeTemplate,
  CreatePracticeTemplateData,
  PracticeSearchResult,
} from "./practice/types";

// Import modular services
import { PracticeScriptService } from "./practice/scriptService";
import { PracticeScheduleService } from "./practice/scheduleService";
import { PracticeTemplateService } from "./practice/templateService";
import { PracticeSearchService } from "./practice/searchService";

// Re-import types from practice types
import type {
  CreatePracticeBlockData,
  CreatePracticeScheduleData,
  Equipment,
  PracticeAttendance,
  PracticeBlock,
  PracticeFilters,
  PracticeSchedule,
  PracticeSearchResult as BasePracticeSearchResult,
} from "../types/practice";
import type {
  PracticeScript,
  CreatePracticeScriptData,
  AddPlayToPracticeScriptData,
  CreatePracticeTemplateData,
  PracticeTemplate,
} from "./practice/types";
import type { Play } from "../types/play";

/**
 * @deprecated Use modular services from ./practice/ instead
 * Unified PracticeService - delegates to specialized services
 */
export class PracticeService {
  // ============================================================================
  // PRACTICE SCHEDULE OPERATIONS - Delegate to PracticeScheduleService
  // ============================================================================

  static async createPracticeSchedule(
    data: CreatePracticeScheduleData
  ): Promise<PracticeSchedule> {
    return PracticeScheduleService.createPracticeSchedule(data);
  }

  static async getPracticeSchedules(
    teamId: string,
    filters?: PracticeFilters
  ): Promise<PracticeSchedule[]> {
    return PracticeScheduleService.getPracticeSchedules(teamId, filters);
  }

  static async updatePracticeSchedule(
    id: string,
    updates: Partial<PracticeSchedule>
  ): Promise<PracticeSchedule> {
    return PracticeScheduleService.updatePracticeSchedule(id, updates);
  }

  static async deletePracticeSchedule(id: string): Promise<void> {
    return PracticeScheduleService.deletePracticeSchedule(id);
  }

  // ============================================================================
  // PRACTICE BLOCK OPERATIONS - Delegate to PracticeScheduleService
  // ============================================================================

  static async addPracticeBlock(
    scheduleId: string,
    blockData: CreatePracticeBlockData
  ): Promise<PracticeBlock> {
    return PracticeScheduleService.addPracticeBlock(scheduleId, blockData);
  }

  static async updatePracticeBlock(
    scheduleId: string,
    blockId: string,
    updates: Partial<PracticeBlock>
  ): Promise<void> {
    return PracticeScheduleService.updatePracticeBlock(
      scheduleId,
      blockId,
      updates
    );
  }

  static async reorderPracticeBlocks(
    scheduleId: string,
    blocks: PracticeBlock[]
  ): Promise<void> {
    return PracticeScheduleService.reorderPracticeBlocks(scheduleId, blocks);
  }

  static async deletePracticeBlock(
    scheduleId: string,
    blockId: string
  ): Promise<void> {
    return PracticeScheduleService.deletePracticeBlock(scheduleId, blockId);
  }

  // ============================================================================
  // PRACTICE TEMPLATE OPERATIONS - Delegate to PracticeTemplateService
  // ============================================================================

  static async createPracticeTemplate(
    template: Omit<PracticeTemplate, "id" | "createdAt" | "usageCount">
  ): Promise<PracticeTemplate> {
    return PracticeTemplateService.createPracticeTemplate(template);
  }

  static async getPracticeTemplates(
    teamId: string
  ): Promise<PracticeTemplate[]> {
    return PracticeTemplateService.getPracticeTemplates(teamId);
  }

  static async getTemplates(teamId: string): Promise<PracticeTemplate[]> {
    return PracticeTemplateService.getTemplates(teamId);
  }

  static async createTemplateFromScript(
    scriptId: string,
    templateData: CreatePracticeTemplateData
  ): Promise<PracticeTemplate> {
    return PracticeTemplateService.createTemplateFromScript(
      scriptId,
      templateData
    );
  }

  static async createScriptFromTemplate(
    templateId: string,
    scriptName: string
  ): Promise<PracticeScript> {
    return PracticeTemplateService.createScriptFromTemplate(
      templateId,
      scriptName
    );
  }

  static async createScheduleFromTemplate(
    templateId: string,
    scheduleData: CreatePracticeScheduleData
  ): Promise<PracticeSchedule> {
    return PracticeTemplateService.createScheduleFromTemplate(
      templateId,
      scheduleData
    );
  }

  static async deleteTemplate(templateId: string): Promise<void> {
    return PracticeTemplateService.deleteTemplate(templateId);
  }

  static async updateTemplate(
    templateId: string,
    updates: Partial<CreatePracticeTemplateData>
  ): Promise<PracticeTemplate> {
    return PracticeTemplateService.updateTemplate(templateId, updates);
  }

  // ============================================================================
  // ATTENDANCE & EQUIPMENT - Delegate to PracticeScheduleService
  // ============================================================================

  static async recordAttendance(
    practiceId: string,
    playerId: string,
    status: "present" | "absent" | "late" | "excused",
    notes?: string
  ): Promise<PracticeAttendance> {
    return PracticeScheduleService.recordAttendance(
      practiceId,
      playerId,
      status,
      notes
    );
  }

  static async getPracticeAttendance(
    practiceId: string
  ): Promise<PracticeAttendance[]> {
    return PracticeScheduleService.getPracticeAttendance(practiceId);
  }

  static async getAvailableEquipment(teamId: string): Promise<Equipment[]> {
    return PracticeScheduleService.getAvailableEquipment(teamId);
  }

  // ============================================================================
  // SEARCH OPERATIONS - Delegate to PracticeSearchService
  // ============================================================================

  static async searchPractices(
    query: string,
    teamId: string
  ): Promise<BasePracticeSearchResult> {
    return PracticeSearchService.searchPractices(query, teamId);
  }

  // ============================================================================
  // PRACTICE SCRIPT OPERATIONS - Delegate to PracticeScriptService
  // ============================================================================

  static async createPracticeScript(
    data: CreatePracticeScriptData
  ): Promise<PracticeScript> {
    return PracticeScriptService.createPracticeScript(data);
  }

  static async updatePracticeScript(
    scriptId: string,
    data: Partial<CreatePracticeScriptData>
  ): Promise<PracticeScript> {
    return PracticeScriptService.updatePracticeScript(scriptId, data);
  }

  static async getPracticeScripts(
    teamId: string,
    forceRefresh = false
  ): Promise<PracticeScript[]> {
    return PracticeScriptService.getPracticeScripts(teamId, forceRefresh);
  }

  static async getPracticeScript(
    scriptId: string
  ): Promise<PracticeScript | null> {
    return PracticeScriptService.getPracticeScript(scriptId);
  }

  static async duplicatePracticeScript(
    scriptId: string,
    newName: string
  ): Promise<PracticeScript> {
    return PracticeScriptService.duplicatePracticeScript(scriptId, newName);
  }

  static async archivePracticeScript(scriptId: string): Promise<void> {
    return PracticeScriptService.archivePracticeScript(scriptId);
  }

  static async unarchivePracticeScript(scriptId: string): Promise<void> {
    return PracticeScriptService.unarchivePracticeScript(scriptId);
  }

  static async deletePracticeScript(scriptId: string): Promise<void> {
    return PracticeScriptService.deletePracticeScript(scriptId);
  }

  static async addPlayToScript(
    data: AddPlayToPracticeScriptData,
    play: Play
  ): Promise<PracticeScript> {
    return PracticeScriptService.addPlayToScript(data, play);
  }

  static async removePlayFromScript(scriptPlayId: string): Promise<void> {
    return PracticeScriptService.removePlayFromScript(scriptPlayId);
  }

  static async updateScriptPlay(
    scriptPlayId: string,
    data: {
      repetitions?: number;
      notes?: string;
      hash?: "left" | "middle" | "right";
      downDistance?: string;
      fieldPosition?: "plus_territory" | "red_zone" | "backed_up" | "midfield";
      defensiveFront?:
        | "base"
        | "4-3"
        | "3-4"
        | "nickel"
        | "dime"
        | "bear"
        | "tite";
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
    }
  ): Promise<void> {
    return PracticeScriptService.updateScriptPlay(scriptPlayId, data);
  }

  static async batchUpdateScriptPlays(
    updates: Array<{
      scriptPlayId: string;
      data: {
        repetitions?: number;
        notes?: string;
        hash?: "left" | "middle" | "right";
        downDistance?: string;
        fieldPosition?:
          | "plus_territory"
          | "red_zone"
          | "backed_up"
          | "midfield";
        defensiveFront?:
          | "base"
          | "4-3"
          | "3-4"
          | "nickel"
          | "dime"
          | "bear"
          | "tite";
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
      };
    }>
  ): Promise<void> {
    return PracticeScriptService.batchUpdateScriptPlays(updates);
  }

  static async reorderScriptPlays(
    scriptId: string,
    playIds: string[]
  ): Promise<void> {
    return PracticeScriptService.reorderScriptPlays(scriptId, playIds);
  }

  static async createQuickScript(
    play: Play,
    teamId: string
  ): Promise<PracticeScript> {
    return PracticeScriptService.createQuickScript(play, teamId);
  }

  static async getOrCreateQuickAddsScript(
    teamId: string
  ): Promise<PracticeScript> {
    return PracticeScriptService.getOrCreateQuickAddsScript(teamId);
  }
}
