/**
 * Development Profile Repository
 *
 * Repository pattern implementation for dev profile data management.
 * Handles data persistence, caching, and retrieval for development profiles.
 *
 * @version 2.0.0
 * @author BoxCall Development Team
 */

import { table } from "../../data/supabase/db";
import { logError } from "../../utils/logger";

import { getProfileConfigurations, hasProfileConfig } from "./configs";

import type {
  DevMode,
  DevProfileConfig,
  IDevProfileRepository,
} from "../../types/dev-profiles";

/**
 * Professional repository for dev profile data
 * Implements separation of concerns and proper error handling
 */
export class DevProfileRepository implements IDevProfileRepository {
  private static instance: DevProfileRepository;
  private readonly cacheMap = new Map<
    string,
    { data: unknown; expiry: number }
  >();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  /**
   * Singleton pattern for repository instance
   */
  public static getInstance(): DevProfileRepository {
    if (!DevProfileRepository.instance) {
      DevProfileRepository.instance = new DevProfileRepository();
    }
    return DevProfileRepository.instance;
  }

  /**
   * Get profile configuration for a dev mode
   * @param devMode - The development mode
   * @returns Promise resolving to profile configuration
   */
  public async getProfileConfig(devMode: DevMode): Promise<DevProfileConfig> {
    const cacheKey = `profile_config_${devMode}`;
    const cached = this.getCachedData<DevProfileConfig>(cacheKey);

    if (cached) {
      return cached;
    }

    const config = await this.buildProfileConfig(devMode);
    this.setCachedData(cacheKey, config);

    return config;
  }

  /**
   * Get achievements for a profile
   * @param profileId - The profile identifier
   * @returns Promise resolving to achievements array
   */
  public async getAchievements(profileId: string): Promise<unknown[]> {
    const cacheKey = `achievements_${profileId}`;
    const cached = this.getCachedData<unknown[]>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const { data, error } = await table("achievements")
        .select("*")
        .eq("user_id", profileId)
        .order("earned_at", { ascending: false });

      if (error) {
        logError("Error fetching achievements:", error);
        return [];
      }

      const achievements = data || [];
      this.setCachedData(cacheKey, achievements);
      return achievements;
    } catch (error) {
      logError("Repository error fetching achievements:", error);
      return [];
    }
  }

  /**
   * Get team data for a profile
   * @param profileId - The profile identifier
   * @returns Promise resolving to team data array
   */
  public async getTeamData(profileId: string): Promise<unknown[]> {
    const cacheKey = `team_data_${profileId}`;
    const cached = this.getCachedData<unknown[]>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const { data, error } = await table("team_members")
        .select(
          `
          *,
          teams (*)
        `
        )
        .eq("user_id", profileId)
        .eq("status", "active");

      if (error) {
        logError("Error fetching team data:", error);
        return [];
      }

      const teamData = data || [];
      this.setCachedData(cacheKey, teamData);
      return teamData;
    } catch (error) {
      logError("Repository error fetching team data:", error);
      return [];
    }
  }

  /**
   * Get calendar events for a profile
   * @param profileId - The profile identifier
   * @returns Promise resolving to calendar events array
   */
  public async getCalendarEvents(profileId: string): Promise<unknown[]> {
    const cacheKey = `calendar_events_${profileId}`;
    const cached = this.getCachedData<unknown[]>(cacheKey);

    if (cached) {
      return cached;
    }

    // For now, return empty array - will implement real calendar queries later
    const events: unknown[] = [];
    this.setCachedData(cacheKey, events);
    return events;
  }

  /**
   * Get activity feed for a profile
   * @param profileId - The profile identifier
   * @returns Promise resolving to activity feed array
   */
  public async getActivityFeed(profileId: string): Promise<unknown[]> {
    const cacheKey = `activity_feed_${profileId}`;
    const cached = this.getCachedData<unknown[]>(cacheKey);

    if (cached) {
      return cached;
    }

    // For now, return empty array - will implement real activity queries later
    const activities: unknown[] = [];
    this.setCachedData(cacheKey, activities);
    return activities;
  }

  /**
   * Clear all cached data
   */
  public clearCache(): void {
    this.cacheMap.clear();
  }

  /**
   * Build profile configuration based on dev mode
   * @private
   */
  private async buildProfileConfig(
    devMode: DevMode
  ): Promise<DevProfileConfig> {
    if (!hasProfileConfig(devMode)) {
      throw new Error(`Unknown dev mode: ${devMode}`);
    }

    const configs = getProfileConfigurations();
    return configs[devMode];
  }

  /**
   * Get cached data if valid
   * @private
   */
  private getCachedData<T>(key: string): T | null {
    const cached = this.cacheMap.get(key);
    if (cached && Date.now() < cached.expiry) {
      return cached.data as T;
    }

    // Clean up expired cache
    if (cached) {
      this.cacheMap.delete(key);
    }

    return null;
  }

  /**
   * Set cached data with expiry
   * @private
   */
  private setCachedData<T>(key: string, data: T): void {
    this.cacheMap.set(key, {
      data,
      expiry: Date.now() + this.CACHE_DURATION,
    });
  }
}
