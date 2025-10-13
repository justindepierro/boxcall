/**
 * Plays Query Service - Play data queries and mutations
 *
 * Handles all play-related database operations with 3-layer caching
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { PlaysDomainService } from "../../domain/playsDomainService";
import {
  normalizePlayName,
  normalizeText,
} from "../../utils/textNormalization";
import type { Play } from "../../types/play";
import type { InboundPlay } from "../../utils/playDataStandardization";
import { CacheService } from "./CacheService";
import { IndexedDBService } from "./IndexedDBService";

export class PlaysQueryService {
  /**
   * Get plays with 3-layer caching for sub-100ms response
   */
  static async getPlays(
    supabase: SupabaseClient,
    playbookId: string,
    useCache = true
  ): Promise<Play[]> {
    const startTime = performance.now();
    const cacheKey = `plays_${playbookId}`;

    // Level 1: Check in-memory cache (instant)
    if (useCache && CacheService.has(cacheKey)) {
      const cached = CacheService.get<Play[]>(cacheKey)!;
      CacheService.updateMetrics("cache_hit", performance.now() - startTime);
      return cached.data;
    }

    try {
      // Level 2: Check IndexedDB cache (fast)
      const indexedData = await IndexedDBService.get(cacheKey);
      if (indexedData && useCache) {
        CacheService.set(cacheKey, indexedData.data, indexedData.version);
        CacheService.updateMetrics(
          "indexeddb_hit",
          performance.now() - startTime
        );
        return indexedData.data as Play[];
      }

      // Level 3: Query Supabase (reliable)
      const { data, error } = await supabase
        .from("plays")
        .select("*")
        .eq("playbook_id", playbookId)
        .eq("is_archived", false)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const plays = data as Play[];

      // Cache the results
      CacheService.set(cacheKey, plays, 1);
      await IndexedDBService.save(cacheKey, {
        data: plays,
        timestamp: Date.now(),
        version: 1,
      });

      CacheService.updateMetrics("database_hit", performance.now() - startTime);
      return plays;
    } catch (error) {
      console.error("Database query failed, using cached data:", error);

      // Fallback to any cached data available
      const fallbackData = await IndexedDBService.get(cacheKey);
      if (fallbackData) {
        return fallbackData.data as Play[];
      }

      throw new Error("No data available offline");
    }
  }

  /**
   * Update play with optimistic UI updates
   */
  static async updatePlay(
    playId: string,
    updates: Partial<Play>,
    _onTriggerBackup: () => void
  ): Promise<void> {
    // 1. Update local cache immediately for instant UI response
    CacheService.updateLocal("play", playId, updates);

    try {
      // 2. Delegate to domain layer (handles canonicalization + duplicate key)
      await PlaysDomainService.updatePlay(playId, updates as InboundPlay);

      // 3. Trigger local backup
      _onTriggerBackup();
    } catch (error) {
      // 4. Rollback local changes if sync fails
      CacheService.rollbackLocal("play", playId);
      throw new Error(`Failed to sync play update: ${error}`);
    }
  }

  /**
   * Create play with optimistic creation
   */
  static async createPlay(
    play: Omit<Play, "id" | "created_at" | "updated_at">,
    _onTriggerBackup: () => void
  ): Promise<Play> {
    const tempId = `temp_${Date.now()}`;

    // Lightweight optimistic object
    const optimisticPlay: Play = {
      ...(play as Play),
      play_name: normalizePlayName(play.play_name),
      formation: normalizeText(play.formation),
      one_word_play: play.one_word_play
        ? normalizeText(play.one_word_play)
        : play.one_word_play,
      id: tempId,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // 1. Add to local cache immediately
    CacheService.addToLocal("play", optimisticPlay);

    try {
      // 2. Delegate creation to domain service
      const { play: createdPlay } = await PlaysDomainService.createPlay(
        play as InboundPlay
      );

      // 3. Replace temp data with real data
      CacheService.replaceInLocal("play", tempId, createdPlay);

      return createdPlay;
    } catch (error) {
      // 4. Remove temp data if creation fails
      CacheService.removeFromLocal("play", tempId);
      throw new Error(`Failed to create play: ${error}`);
    }
  }

  /**
   * Get all plays for a team across all playbooks
   */
  static async getAllPlays(
    supabase: SupabaseClient,
    teamId: string
  ): Promise<Play[]> {
    try {
      // Fetch playbook IDs for team
      const { data: playbooks, error: pbErr } = await supabase
        .from("playbooks")
        .select("id")
        .eq("team_id", teamId);

      if (pbErr || !playbooks || playbooks.length === 0) return [];

      const ids = (playbooks as Array<{ id: string }>).map((p) => p.id);

      const { data, error } = await supabase
        .from("plays")
        .select("*")
        .in("playbook_id", ids)
        .eq("is_archived", false);

      if (error || !data) return [];

      // Coerce timestamp fields to Date for Play typing
      return (data as unknown[]).map((row) => {
        const r = row as Record<string, unknown>;
        return {
          ...(r as object),
          created_at: r["created_at"]
            ? new Date(String(r["created_at"]))
            : new Date(),
          updated_at: r["updated_at"]
            ? new Date(String(r["updated_at"]))
            : new Date(),
          last_used_at: r["last_used_at"]
            ? new Date(String(r["last_used_at"]))
            : undefined,
        } as Play;
      });
    } catch {
      return [];
    }
  }
}
