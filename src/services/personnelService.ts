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
import type {
  PersonnelConfiguration,
  PersonnelPlayer,
  CreatePersonnelConfiguration,
  UpdatePersonnelConfiguration,
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

      // Fetch all players for these configurations
      const configIds = configs.map((c) => c.id);
      const { data: players, error: playersError } = await supabase
        .from("personnel_players")
        .select("*")
        .in("config_id", configIds)
        .order("sort_order");

      if (playersError) throw playersError;

      // Group players by config_id
      const playersByConfig = (players || []).reduce(
        (acc, player) => {
          if (!acc[player.config_id]) acc[player.config_id] = [];
          acc[player.config_id].push(player);
          return acc;
        },
        {} as Record<string, PersonnelPlayer[]>
      );

      // Combine configurations with their players
      return configs.map((config) => ({
        ...config,
        players: playersByConfig[config.id] || [],
      }));
    } catch (error) {
      console.error("Failed to fetch personnel configurations:", error);
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

      // Fetch players for this configuration
      const { data: players, error: playersError } = await supabase
        .from("personnel_players")
        .select("*")
        .eq("config_id", config.id)
        .order("sort_order");

      if (playersError) throw playersError;

      return {
        ...config,
        players: players || [],
      };
    } catch (error) {
      console.error(
        `Failed to fetch personnel configuration "${name}":`,
        error
      );
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
          description: config.description,
        })
        .select()
        .single();

      if (configError) throw configError;
      if (!newConfig) throw new Error("Failed to create configuration");

      // Insert players
      const playersToInsert = config.players.map((player, index) => ({
        config_id: newConfig.id,
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

      return {
        ...newConfig,
        players: players || [],
      };
    } catch (error) {
      console.error("Failed to create personnel configuration:", error);
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
        })
        .eq("id", id)
        .select()
        .single();

      if (configError) throw configError;
      if (!updatedConfig) throw new Error("Configuration not found");

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

        return {
          ...updatedConfig,
          players: players || [],
        };
      }

      // No players update - fetch existing players
      const { data: players, error: playersError } = await supabase
        .from("personnel_players")
        .select("*")
        .eq("config_id", id)
        .order("sort_order");

      if (playersError) throw playersError;

      return {
        ...updatedConfig,
        players: players || [],
      };
    } catch (error) {
      console.error("Failed to update personnel configuration:", error);
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
      console.error("Failed to delete personnel configuration:", error);
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
      return data || [];
    } catch (error) {
      console.error("Failed to fetch personnel players:", error);
      throw error;
    }
  }
}
