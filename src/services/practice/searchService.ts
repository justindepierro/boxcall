/**
 * Practice Search Operations
 * Extracted from monolithic practiceService.ts for better maintainability
 */

import { table } from "../../data/supabase/db";
import { error as logError } from "../../utils/logger";

import type {
  PracticeSearchResult,
  PracticeScript,
  PracticeTemplate,
} from "../../types/practice-service";
import type { PracticeSchedule } from "../../types/practice";

/**
 * Service for searching across practice entities
 */
export class PracticeSearchService {
  /**
   * Search across all practice entities (schedules, templates, scripts)
   */
  static async searchPractices(
    query: string,
    teamId: string
  ): Promise<PracticeSearchResult> {
    const [schedules, templates, scripts] = await Promise.all([
      this.searchPracticeSchedules(query, teamId),
      this.searchPracticeTemplates(query, teamId),
      this.searchPracticeScripts(query, teamId),
    ]);

    return {
      schedules,
      templates,
      scripts: scripts as any[],
    };
  }

  /**
   * Search practice schedules by title, description, or location
   */
  private static async searchPracticeSchedules(
    query: string,
    teamId: string
  ): Promise<PracticeSchedule[]> {
    const { data, error } = await table("practice_schedules")
      .select("*")
      .eq("team_id", teamId)
      .or(
        `title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`
      )
      .order("date", { ascending: true });

    if (error) throw error;
    return data.map(this.transformScheduleFromDB);
  }

  /**
   * Search practice templates by name or description
   */
  private static async searchPracticeTemplates(
    query: string,
    teamId: string
  ): Promise<PracticeTemplate[]> {
    const { data, error } = await table("practice_templates")
      .select("*")
      .or(`team_id.eq.${teamId},is_public.eq.true`)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data.map(this.transformTemplateFromDB);
  }

  /**
   * Search practice scripts by title or description
   */
  private static async searchPracticeScripts(
    query: string,
    teamId: string
  ): Promise<PracticeScript[]> {
    try {
      const { data, error } = await table("practice_scripts")
        .select("*")
        .eq("team_id", teamId)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Get plays for these scripts
      const scriptIds = data.map((s) => s.id);
      const { data: plays } = await table("practice_script_plays")
        .select(`*, plays (*)`)
        .in("practice_script_id", scriptIds);

      // Map scripts with their plays
      return data.map((script) =>
        this.mapDatabaseScriptToPracticeScript({
          ...script,
          practice_script_plays:
            plays?.filter((p: any) => p.practice_script_id === script.id) || [],
        })
      );
    } catch (error) {
      logError("Error searching practice scripts:", error);
      return [];
    }
  }

  // ============================================================================
  // UTILITY METHODS - Database Transformations
  // ============================================================================

  private static transformScheduleFromDB(
    dbSchedule: Record<string, unknown>
  ): PracticeSchedule {
    return {
      id: dbSchedule.id as string,
      teamId: dbSchedule.team_id as string,
      date: new Date(dbSchedule.date as string),
      title: dbSchedule.title as string,
      description: dbSchedule.description as string,
      location: dbSchedule.location as string,
      fieldType: dbSchedule.field_type as
        | "indoor"
        | "outdoor"
        | "gym"
        | "field",
      startTime: new Date(dbSchedule.start_time as string),
      endTime: new Date(dbSchedule.end_time as string),
      isTemplate: dbSchedule.is_template as boolean,
      templateName: dbSchedule.template_name as string,
      blocks: (dbSchedule.blocks as any[]) || [],
      attendanceRequired: dbSchedule.attendance_required as boolean,
      weatherDependent: dbSchedule.weather_dependent as boolean,
      equipmentRequired: (dbSchedule.equipment_required as string[]) || [],
      coachNotes: dbSchedule.coach_notes as string,
      createdBy: dbSchedule.created_by as string,
      createdAt: new Date(dbSchedule.created_at as string),
      updatedAt: new Date(dbSchedule.updated_at as string),
    };
  }

  private static transformTemplateFromDB(
    dbTemplate: Record<string, unknown>
  ): PracticeTemplate {
    return {
      id: dbTemplate.id as string,
      name: dbTemplate.name as string,
      description: (dbTemplate.description as string | null) ?? undefined,
      teamId: (dbTemplate.team_id as string | null) ?? null,
      duration: (dbTemplate.duration as number | null) ?? null,
      isPublic: Boolean(dbTemplate.is_public),
      createdBy: (dbTemplate.created_by as string | null) ?? null,
      createdAt: dbTemplate.created_at
        ? new Date(dbTemplate.created_at as string)
        : new Date(),
      updatedAt: dbTemplate.updated_at
        ? new Date(dbTemplate.updated_at as string)
        : undefined,
    };
  }

  private static mapDatabaseScriptToPracticeScript(
    scriptData: any
  ): PracticeScript {
    const plays = (scriptData.practice_script_plays || []).map(
      (playData: any) => ({
        id: playData.id,
        playId: playData.play_id,
        play: playData.plays,
        order: playData.sequence_order || 0,
        notes: playData.coaching_points?.join(", ") || "",
        repetitions: playData.repetitions || 1,
        estimatedTime: playData.duration_minutes || 10,
        addedAt: new Date(playData.created_at),
        // Game scenario fields
        defensiveFront: playData.defensive_front,
        coverage: playData.coverage,
        blitz: playData.blitz,
        hash: playData.hash,
        downDistance: playData.down_distance,
        fieldPosition: playData.field_position,
      })
    );

    const title = scriptData.title || scriptData.name || "Untitled Script";

    return {
      id: scriptData.id,
      title,
      name: title,
      description: scriptData.description,
      teamId: scriptData.team_id,
      createdBy: scriptData.created_by,
      createdAt: new Date(scriptData.created_at),
      updatedAt: new Date(scriptData.updated_at),
      isTemplate: scriptData.is_template || false,
      plays,
      duration: scriptData.duration_minutes || scriptData.duration || 120,
      tags: scriptData.focus_areas || scriptData.tags || [],
    } as any;
  }
}
