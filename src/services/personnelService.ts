/**
 * Personnel Service
 *
 * Manages personnel configurations and player assignments for playbooks.
 * Each configuration defines the skill positions (QB, RB, TE, WR) used in plays.
 *
 * Database Schema:
 * - personnel_configurations: Configuration metadata (name, description)
 * - personnel_players: Individual player positions within a configuration
 *
 * Note: Uses 'player_position' column (not 'position' - PostgreSQL reserved keyword)
 */

import { supabase } from "../lib/supabase";
import { PersonnelValidationService } from "./validationService";
import { logError } from "../utils/logger";
import type {
  PersonnelConfiguration,
  PersonnelPlayer,
  CreatePersonnelConfiguration,
  UpdatePersonnelConfiguration,
  BadgeCustomization,
  PlayerPosition,
} from "../types/personnel";

export class PersonnelService {
  /**
   * Get all personnel configurations for a playbook
   * @param playbookId - Playbook UUID
   * @returns Array of personnel configurations with their players
   */
  static async getPersonnelConfigurations(
    playbookId: string
  ): Promise<PersonnelConfiguration[]> {
    try {
      // Fetch configurations
      const { data: configs, error: configError } = await supabase
        .from("personnel_configurations")
        .select("*")
        .eq("playbook_id", playbookId)
        .order("name");

      if (configError) throw configError;
      if (!configs) return [];

      // Type assertion for database results
      type DBConfig = {
        id: string;
        playbook_id: string;
        name: string;
        description: string | null;
        badge_customization: BadgeCustomization | null;
        confidence_score?: number | null;
        last_analyzed_at?: string | null;
        analysis_play_count?: number | null;
        usage_count?: number | null;
        created_at: string;
        updated_at: string;
      };
      const typedConfigs = configs as DBConfig[];

      // Fetch all players for these configurations
      const configIds = typedConfigs.map((c) => c.id);
      const { data: players, error: playersError } = await supabase
        .from("personnel_players")
        .select("*")
        .in("config_id", configIds)
        .order("sort_order");

      if (playersError) throw playersError;

      // Type assertion for players
      const typedPlayers = (players || []) as PersonnelPlayer[];

      // Group players by config_id
      const playersByConfig = typedPlayers.reduce(
        (acc, player) => {
          if (!acc[player.config_id]) acc[player.config_id] = [];
          acc[player.config_id].push(player);
          return acc;
        },
        {} as Record<string, PersonnelPlayer[]>
      );

      // Combine configurations with their players
      return typedConfigs.map((config) => ({
        id: config.id,
        playbook_id: config.playbook_id,
        name: config.name,
        description: config.description ?? undefined, // Convert null to undefined
        confidence_score: config.confidence_score ?? 0,
        last_analyzed_at: config.last_analyzed_at ?? null,
        analysis_play_count: config.analysis_play_count ?? 0,
        usage_count: config.usage_count ?? 0,
        created_at: config.created_at,
        updated_at: config.updated_at,
        badgeCustomization: config.badge_customization ?? undefined, // Convert null to undefined
        players: playersByConfig[config.id] || [],
      }));
    } catch (error) {
      logError("Failed to fetch personnel configurations:", error);
      throw error;
    }
  }

  /**
   * Get a specific personnel configuration by name
   * Used when loading diagrams to preload personnel
   * @param playbookId - Playbook UUID
   * @param name - Configuration name (e.g., "11 Personnel")
   * @returns Personnel configuration with players, or null if not found
   */
  static async getPersonnelConfigurationByName(
    playbookId: string,
    name: string
  ): Promise<PersonnelConfiguration | null> {
    try {
      // Fetch configuration
      const { data: config, error: configError } = await supabase
        .from("personnel_configurations")
        .select("*")
        .eq("playbook_id", playbookId)
        .eq("name", name)
        .single();

      if (configError) {
        if (configError.code === "PGRST116") return null; // Not found
        throw configError;
      }
      if (!config) return null;

      // Type assertion for database result
      type DBConfig = {
        id: string;
        playbook_id: string;
        name: string;
        description: string | null;
        badge_customization: BadgeCustomization | null;
        confidence_score?: number | null;
        last_analyzed_at?: string | null;
        analysis_play_count?: number | null;
        usage_count?: number | null;
        created_at: string;
        updated_at: string;
      };
      const typedConfig = config as DBConfig;

      // Fetch players for this configuration
      const { data: players, error: playersError } = await supabase
        .from("personnel_players")
        .select("*")
        .eq("config_id", typedConfig.id)
        .order("sort_order");

      if (playersError) throw playersError;

      // Type assertion for players
      const typedPlayers = (players || []) as PersonnelPlayer[];

      return {
        id: typedConfig.id,
        playbook_id: typedConfig.playbook_id,
        name: typedConfig.name,
        description: typedConfig.description ?? undefined,
        confidence_score: typedConfig.confidence_score ?? 0,
        last_analyzed_at: typedConfig.last_analyzed_at ?? null,
        analysis_play_count: typedConfig.analysis_play_count ?? 0,
        usage_count: typedConfig.usage_count ?? 0,
        created_at: typedConfig.created_at,
        updated_at: typedConfig.updated_at,
        badgeCustomization: typedConfig.badge_customization ?? undefined,
        players: typedPlayers,
      };
    } catch (error) {
      logError(`Failed to fetch personnel configuration "${name}":`, error);
      throw error;
    }
  }

  /**
   * Create a new personnel configuration with players
   * @param config - Configuration data with players array
   * @returns Created configuration with players
   */
  static async createPersonnelConfiguration(
    config: CreatePersonnelConfiguration
  ): Promise<PersonnelConfiguration> {
    try {
      // Validate configuration data
      const validation =
        await PersonnelValidationService.validatePersonnelConfigurationServer(
          config
        );
      if (!validation.valid) {
        throw new Error(
          `Validation failed: ${validation.errors.map((e) => e.message).join(", ")}`
        );
      }

      // Validate QB is at index 0
      if (
        config.players.length > 0 &&
        config.players[0].player_position !== "QB"
      ) {
        throw new Error("QB must be at position 0 (sort_order 0)");
      }

      // Insert configuration
      const { data: newConfig, error: configError } = await supabase
        .from("personnel_configurations")
        .insert({
          playbook_id: config.playbook_id,
          name: config.name,
          description: config.description || null,
          badge_customization: config.badgeCustomization as any, // Cast to Json for database
        })
        .select()
        .single();

      if (configError) throw configError;
      if (!newConfig) throw new Error("Failed to create configuration");

      // Type assertion for database result
      type DBConfig = {
        id: string;
        playbook_id: string;
        name: string;
        description: string | null;
        badge_customization: BadgeCustomization | null;
        created_at: string;
        updated_at: string;
      };
      const typedNewConfig = newConfig as DBConfig;

      // Insert players
      const playersToInsert = config.players.map((player, index) => ({
        config_id: typedNewConfig.id,
        player_position: player.player_position,
        label: player.label,
        sort_order: player.sort_order ?? index,
        is_wildcat_qb: player.is_wildcat_qb ?? false,
      }));

      const { data: players, error: playersError } = await supabase
        .from("personnel_players")
        .insert(playersToInsert)
        .select();

      if (playersError) throw playersError;

      // Type assertion for players
      const typedPlayers = (players || []) as PersonnelPlayer[];

      return {
        id: typedNewConfig.id,
        playbook_id: typedNewConfig.playbook_id,
        name: typedNewConfig.name,
        description: typedNewConfig.description ?? undefined,
        confidence_score: (typedNewConfig as any).confidence_score ?? 0,
        last_analyzed_at: (typedNewConfig as any).last_analyzed_at ?? null,
        analysis_play_count: (typedNewConfig as any).analysis_play_count ?? 0,
        usage_count: (typedNewConfig as any).usage_count ?? 0,
        created_at: typedNewConfig.created_at,
        updated_at: typedNewConfig.updated_at,
        badgeCustomization: typedNewConfig.badge_customization ?? undefined,
        players: typedPlayers,
      };
    } catch (error) {
      logError("Failed to create personnel configuration:", error);
      throw error;
    }
  }

  /**
   * Update a personnel configuration
   * Note: To update players, delete and recreate them (simpler than complex diff logic)
   * @param id - Configuration UUID
   * @param updates - Partial configuration updates
   * @returns Updated configuration with players
   */
  static async updatePersonnelConfiguration(
    id: string,
    updates: UpdatePersonnelConfiguration
  ): Promise<PersonnelConfiguration> {
    try {
      // Update configuration metadata
      const { data: updatedConfig, error: configError } = await supabase
        .from("personnel_configurations")
        .update({
          name: updates.name,
          description: updates.description,
          badge_customization: updates.badgeCustomization as any, // Cast to Json for database
        })
        .eq("id", id)
        .select()
        .single();

      if (configError) throw configError;
      if (!updatedConfig) throw new Error("Configuration not found");

      // Type assertion for database result
      type DBConfig = {
        id: string;
        playbook_id: string;
        name: string;
        description: string | null;
        badge_customization: BadgeCustomization | null;
        created_at: string;
        updated_at: string;
      };
      const typedUpdatedConfig = updatedConfig as DBConfig;

      // If players array provided, replace all players
      if (updates.players) {
        // Validate QB at index 0
        if (
          updates.players.length > 0 &&
          updates.players[0].player_position !== "QB"
        ) {
          throw new Error("QB must be at position 0 (sort_order 0)");
        }

        // Delete existing players
        const { error: deleteError } = await supabase
          .from("personnel_players")
          .delete()
          .eq("config_id", id);

        if (deleteError) throw deleteError;

        // Insert new players
        const playersToInsert = updates.players.map((player, index) => ({
          config_id: id,
          player_position: player.player_position,
          label: player.label,
          sort_order: player.sort_order ?? index,
          is_wildcat_qb: player.is_wildcat_qb ?? false,
        }));

        const { data: players, error: playersError } = await supabase
          .from("personnel_players")
          .insert(playersToInsert)
          .select();

        if (playersError) throw playersError;

        // Type assertion for players
        const typedPlayers = (players || []) as PersonnelPlayer[];

        return {
          id: typedUpdatedConfig.id,
          playbook_id: typedUpdatedConfig.playbook_id,
          name: typedUpdatedConfig.name,
          description: typedUpdatedConfig.description ?? undefined,
          confidence_score: (typedUpdatedConfig as any).confidence_score ?? 0,
          last_analyzed_at:
            (typedUpdatedConfig as any).last_analyzed_at ?? null,
          analysis_play_count:
            (typedUpdatedConfig as any).analysis_play_count ?? 0,
          usage_count: (typedUpdatedConfig as any).usage_count ?? 0,
          created_at: typedUpdatedConfig.created_at,
          updated_at: typedUpdatedConfig.updated_at,
          badgeCustomization:
            typedUpdatedConfig.badge_customization ?? undefined,
          players: typedPlayers,
        };
      }

      // No players update - fetch existing players
      const { data: players, error: playersError } = await supabase
        .from("personnel_players")
        .select("*")
        .eq("config_id", id)
        .order("sort_order");

      if (playersError) throw playersError;

      // Type assertion for players
      const typedPlayers = (players || []) as PersonnelPlayer[];

      return {
        id: typedUpdatedConfig.id,
        playbook_id: typedUpdatedConfig.playbook_id,
        name: typedUpdatedConfig.name,
        description: typedUpdatedConfig.description ?? undefined,
        confidence_score: (typedUpdatedConfig as any).confidence_score ?? 0,
        last_analyzed_at: (typedUpdatedConfig as any).last_analyzed_at ?? null,
        analysis_play_count:
          (typedUpdatedConfig as any).analysis_play_count ?? 0,
        usage_count: (typedUpdatedConfig as any).usage_count ?? 0,
        created_at: typedUpdatedConfig.created_at,
        updated_at: typedUpdatedConfig.updated_at,
        badgeCustomization: typedUpdatedConfig.badge_customization ?? undefined,
        players: typedPlayers,
      };
    } catch (error) {
      logError("Failed to update personnel configuration:", error);
      throw error;
    }
  }

  /**
   * Check where a personnel configuration is being used
   * Returns counts of plays and formations referencing this personnel
   * @param id - Personnel configuration UUID
   * @returns Object with playsCount and formationsCount
   */
  static async checkPersonnelUsage(
    id: string
  ): Promise<{ playsCount: number; formationsCount: number }> {
    try {
      // Check plays using this personnel (via personnel_id FK)
      const { count: playsCount, error: playsError } = await supabase
        .from("plays")
        .select("*", { count: "exact", head: true })
        .eq("personnel_id", id);

      if (playsError) throw playsError;

      // Check formations using this personnel
      const { count: formationsCount, error: formationsError } = await supabase
        .from("formations")
        .select("*", { count: "exact", head: true })
        .eq("personnel_id", id);

      if (formationsError) throw formationsError;

      return {
        playsCount: playsCount || 0,
        formationsCount: formationsCount || 0,
      };
    } catch (error) {
      logError("Failed to check personnel usage:", error);
      throw error;
    }
  }

  /**
   * Delete a personnel configuration and its players
   * CASCADE will automatically delete players via foreign key
   * @param id - Configuration UUID
   */
  static async deletePersonnelConfiguration(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("personnel_configurations")
        .delete()
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      logError("Failed to delete personnel configuration:", error);
      throw error;
    }
  }

  /**
   * Get players for a specific configuration
   * @param configId - Configuration UUID
   * @returns Array of personnel players ordered by sort_order
   */
  static async getPersonnelPlayers(
    configId: string
  ): Promise<PersonnelPlayer[]> {
    try {
      const { data, error } = await supabase
        .from("personnel_players")
        .select("*")
        .eq("config_id", configId)
        .order("sort_order");

      if (error) throw error;
      return (data || []).map((player) => ({
        ...player,
        player_position: player.player_position as PlayerPosition, // Cast string to enum
        is_wildcat_qb: player.is_wildcat_qb || false, // Convert null to false
        created_at: player.created_at || new Date().toISOString(), // Handle null created_at
      }));
    } catch (error) {
      logError("Failed to fetch personnel players:", error);
      throw error;
    }
  }
}
