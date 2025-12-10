/**
 * Game Plan Service - Billick Situational Method
 *
 * Manages game plans organized by down/distance/field zone using the database.
 * Replaces mock data with real Supabase integration.
 */

import { supabase } from "../lib/supabase";
import { getCurrentUserId } from "../lib/auth-helpers";
import { error as logError } from "../utils/logger";
import type { Play } from "../types/play";
import type { BillickSituationType } from "../constants/gamePlanSituations";
import { getAllBillickSituations } from "../constants/gamePlanSituations";

// ===========================================
// TYPES & INTERFACES
// ===========================================

export interface GamePlan {
  id: string;
  teamId: string;
  name: string; // e.g., "vs. Central High - Week 8"
  opponent?: string;
  gameDate?: string; // ISO date string
  gameLocation?: string; // "Home", "Away", "Neutral"
  notes?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
  situations?: GamePlanSituation[];
}

export interface GamePlanSituation {
  id: string;
  gamePlanId: string;
  situationType: BillickSituationType;
  displayOrder: number;
  notes?: string;
  createdAt: Date;
  plays?: GamePlanPlay[];
}

export interface GamePlanPlay {
  id: string;
  situationId: string;
  playId: string;
  play?: Play; // Populated via join
  priority: number; // Order within situation (1 = highest priority)
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGamePlanData {
  teamId: string;
  name: string;
  opponent?: string;
  gameDate?: string;
  gameLocation?: string;
  notes?: string;
}

export interface AddPlayToGamePlanData {
  situationId: string;
  playId: string;
  priority?: number;
  notes?: string;
}

export interface CreateGamePlanSituationData {
  gamePlanId: string;
  situationType: BillickSituationType;
  displayOrder?: number;
  notes?: string;
}

export interface UpdateGamePlanData {
  name?: string;
  opponent?: string;
  gameDate?: string;
  gameLocation?: string;
  notes?: string;
  isArchived?: boolean;
}

// ===========================================
// SERVICE CLASS
// ===========================================

export class GamePlanService {
  /**
   * Create a new game plan with all 12 Billick situations
   */
  static async createGamePlan(data: CreateGamePlanData): Promise<GamePlan> {
    const userId = getCurrentUserId();

    const { data: gamePlan, error } = await supabase
      .from("game_plans")
      .insert({
        team_id: data.teamId,
        name: data.name,
        opponent: data.opponent || null,
        game_date: data.gameDate || null,
        game_location: data.gameLocation || null,
        notes: data.notes || null,
        created_by: userId || null,
        is_archived: false,
      } as any)
      .select()
      .single();

    if (error) {
      logError("❌ Error creating game plan:", error);
      throw new Error(`Failed to create game plan: ${error.message}`);
    }

    // Create all 12 Billick situations
    const situations = getAllBillickSituations();
    const situationInserts = situations.map((config) => ({
      game_plan_id: (gamePlan as any).id,
      situation_type: config.type,
      display_order: config.displayOrder,
    }));

    const { error: situationsError } = await supabase
      .from("game_plan_situations")
      .insert(situationInserts as any);

    if (situationsError) {
      logError("❌ Error creating situations:", situationsError);
      // Don't fail the whole operation, situations can be added later
    }

    return this.getGamePlan((gamePlan as any).id);
  }

  /**
   * Get all game plans for a team
   */
  static async getGamePlans(
    teamId: string,
    includeArchived = false
  ): Promise<GamePlan[]> {
    try {
      // Use new api() client for bulletproof requests
      const { api } = await import("../lib/api/client");

      // Build the query with proper select
      let selectQuery = `
        *,
        game_plan_situations (
          *,
          game_plan_plays (
            *,
            plays (*)
          )
        )
      `;

      // For non-archived, we need to filter
      // Note: api() doesn't support chained conditional filters the same way,
      // so we'll filter in JS for the archived flag
      const { data, error } = await api("game_plans")
        .select(selectQuery)
        .eq("team_id", teamId as any)
        .order("created_at", { ascending: false });

      if (error) {
        logError("❌ Error fetching game plans:", error);
        throw new Error(`Failed to fetch game plans: ${error.message}`);
      }

      // Filter archived in JS (simpler than complex query builder)
      const filtered = includeArchived
        ? data || []
        : (data || []).filter((plan: any) => !plan.is_archived);

      return filtered.map(this.mapGamePlanFromDb);
    } catch (error) {
      logError("❌ Error in getGamePlans:", error);
      throw error;
    }
  }

  /**
   * Get a single game plan by ID
   */
  static async getGamePlan(gamePlanId: string): Promise<GamePlan> {
    try {
      const { api } = await import("../lib/api/client");

      const { data, error } = await api("game_plans")
        .select(
          `
        *,
        game_plan_situations (
          *,
          game_plan_plays (
            *,
            plays (*)
          )
        )
      `
        )
        .eq("id", gamePlanId as any)
        .limit(1);

      if (error) {
        logError("❌ Error fetching game plan:", error);
        throw new Error(`Failed to fetch game plan: ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error("Game plan not found");
      }

      return this.mapGamePlanFromDb(data[0]);
    } catch (error) {
      logError("❌ Error in getGamePlan:", error);
      throw error;
    }
  }

  /**
   * Update a game plan
   */
  static async updateGamePlan(
    gamePlanId: string,
    updates: UpdateGamePlanData
  ): Promise<GamePlan> {
    const { data, error } = await supabase
      .from("game_plans")
      // @ts-expect-error - Type will be correct after regenerating Supabase types
      .update({
        name: updates.name,
        opponent: updates.opponent,
        game_date: updates.gameDate,
        game_location: updates.gameLocation,
        notes: updates.notes,
        is_archived: updates.isArchived,
        updated_at: new Date().toISOString(),
      })
      .eq("id", gamePlanId)
      .select()
      .single();

    if (error) {
      logError("❌ Error updating game plan:", error);
      throw new Error(`Failed to update game plan: ${error.message}`);
    }

    return this.mapGamePlanFromDb(data);
  }

  /**
   * Delete a game plan (cascades to situations and plays)
   */
  static async deleteGamePlan(gamePlanId: string): Promise<void> {
    const { error } = await supabase
      .from("game_plans")
      .delete()
      .eq("id", gamePlanId);

    if (error) {
      logError("❌ Error deleting game plan:", error);
      throw new Error(`Failed to delete game plan: ${error.message}`);
    }
  }

  /**
   * Archive a game plan
   */
  static async archiveGamePlan(gamePlanId: string): Promise<GamePlan> {
    return this.updateGamePlan(gamePlanId, { isArchived: true });
  }

  /**
   * Unarchive a game plan
   */
  static async unarchiveGamePlan(gamePlanId: string): Promise<GamePlan> {
    return this.updateGamePlan(gamePlanId, { isArchived: false });
  }

  /**
   * Create a situation within a game plan
   */
  static async createSituation(
    data: CreateGamePlanSituationData
  ): Promise<GamePlanSituation> {
    const { data: situation, error } = await supabase
      .from("game_plan_situations")
      .insert({
        game_plan_id: data.gamePlanId,
        situation_type: data.situationType,
        display_order: data.displayOrder || 1,
        notes: data.notes || null,
      } as any)
      .select()
      .single();

    if (error) {
      logError("❌ Error creating situation:", error);
      throw new Error(`Failed to create situation: ${error.message}`);
    }

    return this.mapSituationFromDb(situation);
  }

  /**
   * Add a play to a situation
   */
  static async addPlayToSituation(
    data: AddPlayToGamePlanData
  ): Promise<GamePlanPlay> {
    const { data: gamePlanPlay, error } = await supabase
      .from("game_plan_plays")
      .insert({
        situation_id: data.situationId,
        play_id: data.playId,
        priority: data.priority || 1,
        notes: data.notes || null,
      } as any)
      .select(
        `
        *,
        plays (*)
      `
      )
      .single();

    if (error) {
      logError("❌ Error adding play to situation:", error);
      throw new Error(`Failed to add play to situation: ${error.message}`);
    }

    return this.mapPlayFromDb(gamePlanPlay);
  }

  /**
   * Remove a play from a situation
   */
  static async removePlayFromSituation(gamePlanPlayId: string): Promise<void> {
    const { error } = await supabase
      .from("game_plan_plays")
      .delete()
      .eq("id", gamePlanPlayId);

    if (error) {
      logError("❌ Error removing play from situation:", error);
      throw new Error(`Failed to remove play from situation: ${error.message}`);
    }
  }

  /**
   * Update play priority within a situation
   */
  static async updatePlayPriority(
    gamePlanPlayId: string,
    priority: number
  ): Promise<void> {
    const { error } = await supabase
      .from("game_plan_plays")
      // @ts-expect-error - Type will be correct after regenerating Supabase types
      .update({ priority, updated_at: new Date().toISOString() })
      .eq("id", gamePlanPlayId);

    if (error) {
      logError("❌ Error updating play priority:", error);
      throw new Error(`Failed to update play priority: ${error.message}`);
    }
  }

  /**
   * Duplicate a game plan
   */
  static async duplicateGamePlan(
    gamePlanId: string,
    newName: string
  ): Promise<GamePlan> {
    // Get original game plan with all situations and plays
    const original = await this.getGamePlan(gamePlanId);

    // Create new game plan
    const newGamePlan = await this.createGamePlan({
      teamId: original.teamId,
      name: newName,
      opponent: original.opponent,
      gameDate: original.gameDate,
      gameLocation: original.gameLocation,
      notes: original.notes,
    });

    // Copy all plays from original situations to new situations
    if (original.situations && newGamePlan.situations) {
      for (const origSituation of original.situations) {
        // Find matching situation in new game plan
        const newSituation = newGamePlan.situations.find(
          (s) => s.situationType === origSituation.situationType
        );

        if (newSituation && origSituation.plays) {
          // Copy plays to new situation
          for (const play of origSituation.plays) {
            await this.addPlayToSituation({
              situationId: newSituation.id,
              playId: play.playId,
              priority: play.priority,
              notes: play.notes,
            });
          }
        }
      }
    }

    return this.getGamePlan(newGamePlan.id);
  }

  // ===========================================
  // MAPPING HELPERS
  // ===========================================

  private static mapGamePlanFromDb(data: any): GamePlan {
    return {
      id: data.id,
      teamId: data.team_id,
      name: data.name,
      opponent: data.opponent,
      gameDate: data.game_date,
      gameLocation: data.game_location,
      notes: data.notes,
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      isArchived: data.is_archived || false,
      situations: data.game_plan_situations
        ? data.game_plan_situations
            .map(this.mapSituationFromDb)
            .sort(
              (a: GamePlanSituation, b: GamePlanSituation) =>
                a.displayOrder - b.displayOrder
            )
        : undefined,
    };
  }

  private static mapSituationFromDb(data: any): GamePlanSituation {
    return {
      id: data.id,
      gamePlanId: data.game_plan_id,
      situationType: data.situation_type,
      displayOrder: data.display_order,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      plays: data.game_plan_plays
        ? data.game_plan_plays
            .map(this.mapPlayFromDb)
            .sort((a: GamePlanPlay, b: GamePlanPlay) => a.priority - b.priority)
        : undefined,
    };
  }

  private static mapPlayFromDb(data: any): GamePlanPlay {
    return {
      id: data.id,
      situationId: data.situation_id,
      playId: data.play_id,
      play: data.plays,
      priority: data.priority,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
