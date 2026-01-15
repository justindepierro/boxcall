/**
 * Backup Service - Automatic backup management
 *
 * Handles automatic local backups and comprehensive exports
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { CSVService } from "../csv";
import type { GamePlan } from "../gamePlanService";
import type { PracticeScript } from "../practice";
import type { BackupData } from "./types";
import { IndexedDBService } from "./IndexedDBService";
import { CacheService } from "./CacheService";
import { PlaysQueryService } from "./PlaysQueryService";
import { debug, logError, warn } from "../../utils/logger";
import { tableWithClient } from "../../data/supabase/db";

// Minimal CSV escape helper for inline CSV generation
function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  // Quote if contains comma, quote, or newline
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export class BackupService {
  private static backupInterval: NodeJS.Timeout | null = null;
  private static supabase: SupabaseClient | null = null;

  /**
   * Initialize backup service
   */
  static initialize(supabase: SupabaseClient): void {
    this.supabase = supabase;
  }

  /**
   * Start automatic backup system (every 5 minutes)
   */
  static startAutomaticBackups(): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
    }

    this.backupInterval = setInterval(
      async () => {
        try {
          await this.createAutomaticBackup();
          debug("[BackupService] Automatic backup completed");
        } catch (error) {
          logError("❌ Automatic backup failed:", error);
        }
      },
      5 * 60 * 1000
    ); // Every 5 minutes
  }

  /**
   * Stop automatic backups
   */
  static stopAutomaticBackups(): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
    }
  }

  /**
   * Trigger a backup (debounced)
   */
  static triggerBackup(): void {
    // Debounce opportunistic backups to at most once per 2 minutes
    const now = Date.now();
    const minGap = 2 * 60 * 1000;
    const last =
      (CacheService.get<number>("__last_backup_ts__")?.data as number) || 0;
    if (now - last < minGap) return;

    CacheService.set("__last_backup_ts__", now, 1);

    // Fire and forget
    this.createAutomaticBackup().catch((e) =>
      warn("Opportunistic backup failed", e)
    );
  }

  /**
   * Create comprehensive local backup
   */
  private static async createAutomaticBackup(): Promise<void> {
    if (!this.supabase) {
      warn("Supabase not initialized, skipping backup");
      return;
    }

    try {
      // Get current team data (replace with actual team ID)
      const teamId = "current-team-id"; // TODO: Get from auth context

      // Gather all data
      const [plays, practiceScripts, gamePlans] = await Promise.all([
        PlaysQueryService.getAllPlays(this.supabase, teamId),
        this.getAllPracticeScripts(teamId),
        this.getAllGamePlans(teamId),
      ]);

      const backupData: BackupData = {
        timestamp: new Date().toISOString(),
        version: Date.now(),
        plays,
        practiceScripts,
        gamePlans,
        metadata: {
          teamId,
          playCount: plays.length,
          lastModified: new Date().toISOString(),
        },
      };

      // Save to IndexedDB (backups store)
      await IndexedDBService.saveBackup(`backup_${Date.now()}`, {
        data: backupData,
        timestamp: Date.now(),
        version: 1,
      });

      // Clean up old backups (keep last 50)
      await IndexedDBService.cleanupOldBackups(50);

      CacheService.incrementBackupFrequency();
    } catch (error) {
      logError("Backup creation failed:", error);
      throw error;
    }
  }

  /**
   * Export comprehensive backup as downloadable files
   */
  static async exportComprehensiveBackup(teamId: string): Promise<void> {
    if (!this.supabase) {
      throw new Error("Supabase not initialized");
    }

    try {
      const timestamp = new Date().toISOString().split("T")[0];

      // Get all data
      const [plays, practiceScripts, gamePlans] = await Promise.all([
        PlaysQueryService.getAllPlays(this.supabase, teamId),
        this.getAllPracticeScripts(teamId),
        this.getAllGamePlans(teamId),
      ]);

      // Create CSV exports
      const playsCSV = CSVService.exportPlaysToCSV(plays, {
        includePrivateNotes: true,
        formatForCoach: true,
      });

      // Download as zip file
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      zip.file(`plays-${timestamp}.csv`, playsCSV);
      zip.file(
        `practice-scripts-${timestamp}.csv`,
        this.exportPracticeScriptsCSV(practiceScripts)
      );
      zip.file(
        `game-plans-${timestamp}.csv`,
        this.exportGamePlansCSV(gamePlans)
      );
      zip.file(
        "backup-info.json",
        JSON.stringify(
          {
            timestamp,
            version: Date.now(),
            playCount: plays.length,
            scriptCount: practiceScripts.length,
            gamePlanCount: gamePlans.length,
          },
          null,
          2
        )
      );

      const zipBlob = await zip.generateAsync({ type: "blob" });

      // Download the backup
      const link = document.createElement("a");
      link.href = URL.createObjectURL(zipBlob);
      link.download = `playbook-backup-${timestamp}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      debug("✅ Comprehensive backup exported successfully");
    } catch (error) {
      logError("Export backup failed:", error);
      throw error;
    }
  }

  /**
   * Get all practice scripts for a team
   */
  private static async getAllPracticeScripts(
    teamId: string
  ): Promise<PracticeScript[]> {
    const client = this.supabase;
    if (!client) return [];

    try {
      const { data, error } = await tableWithClient(client, "practice_scripts")
        .select(
          "id, team_id, name, description, total_duration, created_by, created_at, updated_at, is_template, tags"
        )
        .eq("team_id", teamId)
        .order("updated_at", { ascending: false });

      if (error || !data) return [] as unknown as PracticeScript[];

      const mapped = (data as unknown[]).map((row) => {
        const r = row as Record<string, unknown>;
        return {
          id: String(r["id"]),
          name: String(r["name"]),
          description: (r["description"] as string | undefined) ?? undefined,
          teamId: String(r["team_id"]),
          createdBy: (r["created_by"] as string | undefined) ?? "",
          createdAt: r["created_at"]
            ? new Date(String(r["created_at"]))
            : new Date(),
          updatedAt: r["updated_at"]
            ? new Date(String(r["updated_at"]))
            : new Date(),
          isTemplate: Boolean(r["is_template"]),
          plays: [],
          duration: (r["total_duration"] as number | undefined) ?? 0,
          tags: Array.isArray(r["tags"]) ? (r["tags"] as string[]) : [],
        } as PracticeScript;
      });
      return mapped;
    } catch {
      return [] as unknown as PracticeScript[];
    }
  }

  /**
   * Get all game plans for a team
   */
  private static async getAllGamePlans(teamId: string): Promise<GamePlan[]> {
    const client = this.supabase;
    if (!client) return [];

    try {
      const { data, error } = await tableWithClient(client, "game_plans")
        .select(
          "id, team_id, name, opponent, game_date, game_location, notes, created_by, created_at, updated_at, is_archived"
        )
        .eq("team_id", teamId)
        .order("updated_at", { ascending: false });

      if (error || !data) return [] as unknown as GamePlan[];

      const mapped = (data as unknown[]).map((row) => {
        const r = row as Record<string, unknown>;
        const opponentRaw = r["opponent"] as string | null | undefined;
        const gameLocationRaw = r["game_location"] as string | null | undefined;
        const notesRaw = r["notes"] as string | null | undefined;
        return {
          id: String(r["id"]),
          teamId: String(r["team_id"]),
          name: String(r["name"]),
          opponent: opponentRaw ?? undefined,
          gameDate: r["game_date"] ? String(r["game_date"]) : undefined,
          gameLocation: gameLocationRaw ?? undefined,
          notes: notesRaw ?? undefined,
          createdBy: (r["created_by"] as string | undefined) ?? undefined,
          createdAt: r["created_at"]
            ? new Date(String(r["created_at"]))
            : new Date(),
          updatedAt: r["updated_at"]
            ? new Date(String(r["updated_at"]))
            : new Date(),
          isArchived: Boolean(r["is_archived"]),
          situations: [],
        } as GamePlan;
      });
      return mapped;
    } catch {
      return [] as unknown as GamePlan[];
    }
  }

  /**
   * Export practice scripts as CSV
   */
  private static exportPracticeScriptsCSV(scripts: PracticeScript[]): string {
    const headers = [
      "id",
      "name",
      "teamId",
      "duration_minutes",
      "isTemplate",
      "tags",
      "createdAt",
      "updatedAt",
    ];
    const rows = scripts.map((s) => [
      s.id,
      s.name,
      s.teamId,
      String(s.duration ?? 0),
      s.isTemplate ? "true" : "false",
      (s.tags || []).join("|"),
      s.createdAt instanceof Date
        ? s.createdAt.toISOString()
        : String(s.createdAt),
      s.updatedAt instanceof Date
        ? s.updatedAt.toISOString()
        : String(s.updatedAt),
    ]);
    return [
      headers.join(","),
      ...rows.map((r) => r.map(csvEscape).join(",")),
    ].join("\n");
  }

  /**
   * Export game plans as CSV
   */
  private static exportGamePlansCSV(gamePlans: GamePlan[]): string {
    const headers = [
      "id",
      "name",
      "teamId",
      "opponent",
      "gameDate",
      "gameLocation",
      "isArchived",
      "createdAt",
      "updatedAt",
    ];
    const rows = gamePlans.map((g) => [
      g.id,
      g.name,
      g.teamId,
      g.opponent ?? "",
      g.gameDate ?? "",
      g.gameLocation ?? "",
      g.isArchived ? "true" : "false",
      g.createdAt instanceof Date
        ? g.createdAt.toISOString()
        : String(g.createdAt),
      g.updatedAt instanceof Date
        ? g.updatedAt.toISOString()
        : String(g.updatedAt),
    ]);
    return [
      headers.join(","),
      ...rows.map((r) => r.map(csvEscape).join(",")),
    ].join("\n");
  }
}
