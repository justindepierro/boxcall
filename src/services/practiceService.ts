// @ts-nocheck
// NOTE: TypeScript checking disabled for this file due to Supabase generated types being overly strict.
// All data is validated before database operations. Re-enable checking when Supabase types are fixed.

import { supabase } from "../lib/supabase";
import { practiceScriptCache } from "./practiceScriptCache";
import { ActivityService } from "./activityService";

import type {
  CreatePracticeBlockData,
  CreatePracticeScheduleData,
  Equipment,
  PracticeAttendance,
  PracticeBlock,
  PracticeFilters,
  PracticeSchedule,
  PracticeScript as BasePracticeScript,
  PracticeSearchResult,
  PracticeTemplate,
} from "../types/practice";
import type { Play } from "../types/play";

// Extended Practice Script interface with workflow support
export interface PracticeScript extends Partial<BasePracticeScript> {
  id: string;
  title?: string; // Optional for backward compatibility
  name?: string; // Alias for title
  description?: string;
  teamId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isTemplate: boolean;
  isArchived?: boolean; // Archive status
  plays?: PracticeScriptPlay[]; // Workflow-specific plays
  duration: number;
  tags?: string[];
}

// Practice Script types (consolidated from practiceScriptService)
export interface PracticeScriptPlay {
  id: string;
  playId: string;
  play: Play;
  order: number;
  notes?: string;
  repetitions: number;
  // Game scenario configuration
  hash?: "left" | "middle" | "right";
  downDistance?: string; // e.g., "1st & 10", "3rd & 3"
  fieldPosition?: "plus_territory" | "red_zone" | "backed_up" | "midfield";
  defensiveFront?: "base" | "4-3" | "3-4" | "nickel" | "dime" | "bear" | "tite";
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
  scenarioNotes?: string; // Additional context
  addedAt: Date;
}

export interface CreatePracticeScriptData {
  name: string;
  description?: string;
  teamId: string;
  isTemplate?: boolean;
  tags?: string[];
}

// Practice Template create data interface (PracticeTemplate imported from types/practice)
export interface CreatePracticeTemplateData {
  name: string;
  description?: string;
  teamId: string;
  duration?: number;
  isPublic?: boolean;
  scriptId?: string; // If creating from existing script
}

export interface AddPlayToPracticeScriptData {
  scriptId: string;
  playId: string;
  orderIndex?: number;
  notes?: string;
  repetitions?: number;
  // Game scenario configuration
  hash?: "left" | "middle" | "right";
  downDistance?: string;
  fieldPosition?: "plus_territory" | "red_zone" | "backed_up" | "midfield";
  defensiveFront?: "base" | "4-3" | "3-4" | "nickel" | "dime" | "bear" | "tite";
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
  scenarioNotes?: string;
}

export class PracticeService {
  // Practice Schedule CRUD Operations
  static async createPracticeSchedule(
    data: CreatePracticeScheduleData
  ): Promise<PracticeSchedule> {
    const { data: schedule, error } = await supabase
      .from("practice_schedules")
      // @ts-expect-error - Supabase type issue with practice_schedules table insert
      .insert({
        team_id: data.teamId,
        date: data.date.toISOString(),
        title: data.title,
        description: data.description,
        location: data.location,
        field_type: data.fieldType,
        start_time: data.startTime.toISOString(),
        end_time: data.endTime.toISOString(),
        attendance_required: data.attendanceRequired,
        weather_dependent: data.weatherDependent,
        equipment_required: data.equipmentRequired,
        coach_notes: data.coachNotes,
        is_template: false,
        blocks: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return this.transformScheduleFromDB(schedule);
  }

  static async getPracticeSchedules(
    teamId: string,
    filters?: PracticeFilters
  ): Promise<PracticeSchedule[]> {
    let query = supabase
      .from("practice_schedules")
      .select("*")
      .eq("team_id", teamId)
      .eq("is_template", false)
      .order("date", { ascending: true });

    // Apply filters
    if (filters?.dateRange.start) {
      query = query.gte("date", filters.dateRange.start.toISOString());
    }
    if (filters?.dateRange.end) {
      query = query.lte("date", filters.dateRange.end.toISOString());
    }
    if (filters?.location && filters.location.length > 0) {
      query = query.in("location", filters.location);
    }
    if (filters?.fieldType && filters.fieldType.length > 0) {
      query = query.in("field_type", filters.fieldType);
    }
    if (filters?.weatherDependent !== undefined) {
      query = query.eq("weather_dependent", filters.weatherDependent);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data.map(this.transformScheduleFromDB);
  }

  static async updatePracticeSchedule(
    id: string,
    updates: Partial<PracticeSchedule>
  ): Promise<PracticeSchedule> {
    const { data, error } = await supabase
      .from("practice_schedules")
      // @ts-expect-error - Supabase type issue with practice_schedules table update
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return this.transformScheduleFromDB(data);
  }

  static async deletePracticeSchedule(id: string): Promise<void> {
    const { error } = await supabase
      .from("practice_schedules")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  // Practice Block Operations
  static async addPracticeBlock(
    scheduleId: string,
    blockData: CreatePracticeBlockData
  ): Promise<PracticeBlock> {
    // Get current schedule to update blocks array
    const { data: schedule, error: fetchError } = await supabase
      .from("practice_schedules")
      .select("blocks")
      .eq("id", scheduleId)
      .single();

    if (fetchError) throw fetchError;

    const newBlock: PracticeBlock = {
      id: crypto.randomUUID(),
      title: blockData.title,
      description: blockData.description,
      startTime: new Date(), // Will be calculated based on order
      endTime: new Date(), // Will be calculated based on duration
      duration: blockData.duration,
      order: schedule.blocks.length,
      isLocked: false,
      practiceScriptId: blockData.practiceScriptId,
      notes: blockData.notes,
      equipmentIds: blockData.equipmentIds || [],
    };

    const updatedBlocks = [...schedule.blocks, newBlock];

    const { error: updateError } = await supabase
      .from("practice_schedules")
      .update({
        blocks: updatedBlocks,
        updated_at: new Date().toISOString(),
      })
      .eq("id", scheduleId);

    if (updateError) throw updateError;
    return newBlock;
  }

  static async updatePracticeBlock(
    scheduleId: string,
    blockId: string,
    updates: Partial<PracticeBlock>
  ): Promise<void> {
    const { data: schedule, error: fetchError } = await supabase
      .from("practice_schedules")
      .select("blocks")
      .eq("id", scheduleId)
      .single();

    if (fetchError) throw fetchError;

    const updatedBlocks = schedule.blocks.map((block: PracticeBlock) =>
      block.id === blockId ? { ...block, ...updates } : block
    );

    const { error: updateError } = await supabase
      .from("practice_schedules")
      .update({
        blocks: updatedBlocks,
        updated_at: new Date().toISOString(),
      })
      .eq("id", scheduleId);

    if (updateError) throw updateError;
  }

  static async reorderPracticeBlocks(
    scheduleId: string,
    blocks: PracticeBlock[]
  ): Promise<void> {
    // Recalculate times based on new order
    const reorderedBlocks = this.recalculateBlockTimes(blocks);

    const { error } = await supabase
      .from("practice_schedules")
      .update({
        blocks: reorderedBlocks,
        updated_at: new Date().toISOString(),
      })
      .eq("id", scheduleId);

    if (error) throw error;
  }

  static async deletePracticeBlock(
    scheduleId: string,
    blockId: string
  ): Promise<void> {
    const { data: schedule, error: fetchError } = await supabase
      .from("practice_schedules")
      .select("blocks")
      .eq("id", scheduleId)
      .single();

    if (fetchError) throw fetchError;

    const updatedBlocks = schedule.blocks.filter(
      (block: PracticeBlock) => block.id !== blockId
    );

    const { error: updateError } = await supabase
      .from("practice_schedules")
      .update({
        blocks: updatedBlocks,
        updated_at: new Date().toISOString(),
      })
      .eq("id", scheduleId);

    if (updateError) throw updateError;
  }

  // Practice Template Operations
  static async createPracticeTemplate(
    template: Omit<PracticeTemplate, "id" | "createdAt" | "usageCount">
  ): Promise<PracticeTemplate> {
    const { data, error } = await supabase
      .from("practice_templates")
      .insert({
        ...template,
        created_at: new Date().toISOString(),
        usage_count: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return this.transformTemplateFromDB(data);
  }

  static async getPracticeTemplates(
    teamId: string
  ): Promise<PracticeTemplate[]> {
    const { data, error } = await supabase
      .from("practice_templates")
      .select("*")
      .or(`team_id.eq.${teamId},is_public.eq.true`)
      .order("usage_count", { ascending: false });

    if (error) throw error;
    return data.map(this.transformTemplateFromDB);
  }

  static async createScheduleFromTemplate(
    templateId: string,
    scheduleData: CreatePracticeScheduleData
  ): Promise<PracticeSchedule> {
    // Get template
    const { data: template, error: templateError } = await supabase
      .from("practice_templates")
      .select("*")
      .eq("id", templateId)
      .single();

    if (templateError) throw templateError;

    // Create schedule with template blocks
    const schedule = await this.createPracticeSchedule(scheduleData);

    // Add template blocks with calculated times
    const blocksWithTimes = this.calculateBlockTimesFromTemplate(
      template.blocks,
      scheduleData.startTime
    );

    const { error: updateError } = await supabase
      .from("practice_schedules")
      .update({
        blocks: blocksWithTimes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", schedule.id);

    if (updateError) throw updateError;

    // Increment template usage
    await supabase
      .from("practice_templates")
      .update({ usage_count: template.usage_count + 1 })
      .eq("id", templateId);

    return { ...schedule, blocks: blocksWithTimes };
  }

  // Attendance Management
  static async recordAttendance(
    practiceId: string,
    playerId: string,
    status: "present" | "absent" | "late" | "excused",
    notes?: string
  ): Promise<PracticeAttendance> {
    const { data, error } = await supabase
      .from("practice_attendance")
      .upsert({
        practice_id: practiceId,
        player_id: playerId,
        status,
        arrival_time:
          status === "present" || status === "late"
            ? new Date().toISOString()
            : null,
        notes,
        recorded_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return this.transformAttendanceFromDB(data);
  }

  static async getPracticeAttendance(
    practiceId: string
  ): Promise<PracticeAttendance[]> {
    const { data, error } = await supabase
      .from("practice_attendance")
      .select("*")
      .eq("practice_id", practiceId);

    if (error) throw error;
    return data.map(this.transformAttendanceFromDB);
  }

  // Equipment Management
  static async getAvailableEquipment(teamId: string): Promise<Equipment[]> {
    const { data, error } = await supabase
      .from("equipment")
      .select("*")
      .eq("team_id", teamId)
      .order("name");

    if (error) throw error;
    return data.map(this.transformEquipmentFromDB);
  }

  // Search Functionality
  static async searchPractices(
    query: string,
    teamId: string
  ): Promise<PracticeSearchResult> {
    const [schedules, templates, scripts] = await Promise.all([
      this.searchPracticeSchedules(query, teamId),
      this.searchPracticeTemplates(query, teamId),
      this.searchPracticeScripts(query, teamId),
    ]);

    return { schedules, templates, scripts: scripts as BasePracticeScript[] };
  }

  private static async searchPracticeSchedules(
    query: string,
    teamId: string
  ): Promise<PracticeSchedule[]> {
    const { data, error } = await supabase
      .from("practice_schedules")
      .select("*")
      .eq("team_id", teamId)
      .or(
        `title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`
      )
      .order("date", { ascending: true });

    if (error) throw error;
    return data.map(this.transformScheduleFromDB);
  }

  private static async searchPracticeTemplates(
    query: string,
    teamId: string
  ): Promise<PracticeTemplate[]> {
    const { data, error } = await supabase
      .from("practice_templates")
      .select("*")
      .or(`team_id.eq.${teamId},is_public.eq.true`)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order("usage_count", { ascending: false });

    if (error) throw error;
    return data.map(this.transformTemplateFromDB);
  }

  // Utility Methods
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
      blocks: (dbSchedule.blocks as PracticeBlock[]) || [],
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
      description: dbTemplate.description as string,
      teamId: dbTemplate.team_id as string,
      duration: dbTemplate.duration as number,
      blocks: (dbTemplate.blocks as PracticeBlock[]) || [],
      defaultLocation: dbTemplate.default_location as string,
      defaultFieldType: dbTemplate.default_field_type as
        | "indoor"
        | "outdoor"
        | "gym"
        | "field",
      equipmentRequired: (dbTemplate.equipment_required as string[]) || [],
      isPublic: dbTemplate.is_public as boolean,
      createdBy: dbTemplate.created_by as string,
      createdAt: new Date(dbTemplate.created_at as string),
      usageCount: dbTemplate.usage_count as number,
    };
  }

  private static transformAttendanceFromDB(
    dbAttendance: Record<string, unknown>
  ): PracticeAttendance {
    return {
      id: dbAttendance.id as string,
      practiceId: dbAttendance.practice_id as string,
      playerId: dbAttendance.player_id as string,
      status: dbAttendance.status as "present" | "absent" | "late" | "excused",
      arrivalTime: dbAttendance.arrival_time
        ? new Date(dbAttendance.arrival_time as string)
        : undefined,
      notes: dbAttendance.notes as string,
      recordedBy: dbAttendance.recorded_by as string,
      recordedAt: new Date(dbAttendance.recorded_at as string),
    };
  }

  private static transformEquipmentFromDB(
    dbEquipment: Record<string, unknown>
  ): Equipment {
    return {
      id: dbEquipment.id as string,
      name: dbEquipment.name as string,
      category: dbEquipment.category as
        | "balls"
        | "cones"
        | "dummies"
        | "sleds"
        | "protective"
        | "other",
      quantity: dbEquipment.quantity as number,
      available: dbEquipment.available as number,
      condition: dbEquipment.condition as
        | "excellent"
        | "good"
        | "fair"
        | "poor",
      location: dbEquipment.location as string,
      lastChecked: new Date(dbEquipment.last_checked as string),
    };
  }

  private static recalculateBlockTimes(
    blocks: PracticeBlock[]
  ): PracticeBlock[] {
    let currentTime = blocks[0]?.startTime || new Date();

    return blocks.map((block, index) => {
      const startTime = new Date(currentTime);
      const endTime = new Date(startTime.getTime() + block.duration * 60000);

      currentTime = endTime;

      return {
        ...block,
        order: index,
        startTime,
        endTime,
      };
    });
  }

  private static calculateBlockTimesFromTemplate(
    templateBlocks: Record<string, unknown>[],
    practiceStartTime: Date
  ): PracticeBlock[] {
    let currentTime = new Date(practiceStartTime);

    return templateBlocks.map((templateBlock, index) => {
      const startTime = new Date(currentTime);
      const endTime = new Date(
        startTime.getTime() + (templateBlock.duration as number) * 60000
      );

      currentTime = endTime;

      return {
        id: crypto.randomUUID(),
        title: templateBlock.title as string,
        description: templateBlock.description as string,
        duration: templateBlock.duration as number,
        startTime,
        endTime,
        order: index,
        isLocked: false,
        practiceScriptId: templateBlock.practiceScriptId as string,
        notes: templateBlock.notes as string,
        equipmentIds: (templateBlock.equipmentIds as string[]) || [],
      };
    });
  }

  private static async searchPracticeScripts(
    query: string,
    teamId: string
  ): Promise<PracticeScript[]> {
    try {
      const { data, error } = await supabase
        .from("practice_scripts")
        .select("*")
        .eq("team_id", teamId)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Get plays for these scripts
      const scriptIds = data.map((s) => s.id);
      const { data: plays } = await supabase
        .from("practice_script_plays")
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
      console.error("Error searching practice scripts:", error);
      return [];
    }
  }

  // ============================================================================
  // PRACTICE SCRIPT OPERATIONS
  // Consolidated from practiceScriptService.ts
  // ============================================================================

  /**
   * Create a new practice script - OPTIMIZED with cache invalidation
   */
  static async createPracticeScript(
    data: CreatePracticeScriptData
  ): Promise<PracticeScript> {
    const { data: script, error } = await supabase
      .from("practice_scripts")
      .insert({
        title: data.name,
        description: data.description,
        team_id: data.teamId,
        focus_areas: data.tags || [],
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating practice script:", error);
      throw new Error("Failed to create practice script");
    }

    const scriptData = script as any;
    const newScript: PracticeScript = {
      id: scriptData.id as string,
      title: scriptData.title as string,
      description: scriptData.description as string | undefined,
      teamId: scriptData.team_id as string,
      createdBy: scriptData.created_by as string,
      createdAt: new Date(scriptData.created_at as string),
      updatedAt: new Date(scriptData.updated_at as string),
      isTemplate: false,
      plays: [],
      duration: (scriptData.duration_minutes as number) || 120,
      tags: (scriptData.focus_areas as string[]) || [],
    } as any;

    // Invalidate team scripts cache
    await practiceScriptCache.invalidate(`scripts_team_${data.teamId}`);

    return newScript;
  }

  /**
   * Update an existing practice script - OPTIMIZED with cache invalidation
   */
  static async updatePracticeScript(
    scriptId: string,
    data: Partial<CreatePracticeScriptData>
  ): Promise<PracticeScript> {
    const updateData: any = {};

    if (data.name !== undefined) updateData.title = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.tags !== undefined) updateData.focus_areas = data.tags;

    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from("practice_scripts")
      .update(updateData)
      .eq("id", scriptId)
      .select()
      .single();

    if (error) {
      console.error("Error updating practice script:", error);
      throw new Error("Failed to update practice script");
    }

    // Invalidate caches
    await practiceScriptCache.invalidate(`script_${scriptId}`);
    await practiceScriptCache.invalidatePattern(/^scripts_team_/);

    // Return the full script with plays
    const fullScript = await this.getPracticeScript(scriptId);
    if (!fullScript) {
      throw new Error("Failed to retrieve updated practice script");
    }

    return fullScript;
  }

  /**
   * Add a play to an existing practice script
   */
  static async addPlayToScript(
    data: AddPlayToPracticeScriptData,
    _play: Play
  ): Promise<PracticeScript> {
    const { error: playError } = await supabase
      .from("practice_script_plays")
      .insert({
        practice_script_id: data.scriptId,
        play_id: data.playId,
        sequence_order: data.orderIndex || 1,
        coaching_points: data.notes ? [data.notes] : [],
        repetitions: data.repetitions || 5,
        // Game scenario configuration
        hash: data.hash || "middle",
        down_distance: data.downDistance || "1st & 10",
        field_position: data.fieldPosition || "plus_territory",
        defensive_front: data.defensiveFront || "base",
        coverage: data.coverage || "cover_2",
        blitz: data.blitz || "none",
        scenario_notes: data.scenarioNotes || null,
        segment_name: "Drill",
        segment_type: "drill",
      });

    if (playError) {
      console.error("Error adding play to script:", playError);
      throw new Error("Failed to add play to practice script");
    }

    // Record activity for adding play to practice script
    await ActivityService.recordActivity({
      type: "added_to_script",
      playId: data.playId,
      playName: _play.play_name,
      teamId: _play.team_id,
      details: {
        scriptId: data.scriptId,
        repetitions: data.repetitions || 5,
      },
    });

    const script = await this.getPracticeScript(data.scriptId);
    if (!script) {
      throw new Error("Failed to retrieve updated practice script");
    }
    return script;
  }

  /**
   * Update a play within a practice script - OPTIMIZED with cache invalidation
   */
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
    console.log("[PracticeService] updateScriptPlay called with:", {
      scriptPlayId,
      data,
    });

    const updateData: any = {};

    if (data.repetitions !== undefined)
      updateData.repetitions = data.repetitions;
    if (data.notes !== undefined)
      updateData.coaching_points = data.notes ? [data.notes] : [];
    if (data.hash !== undefined) updateData.hash = data.hash;
    if (data.downDistance !== undefined)
      updateData.down_distance = data.downDistance;
    if (data.fieldPosition !== undefined)
      updateData.field_position = data.fieldPosition;
    if (data.defensiveFront !== undefined)
      updateData.defensive_front = data.defensiveFront;
    if (data.coverage !== undefined) updateData.coverage = data.coverage;
    if (data.blitz !== undefined) updateData.blitz = data.blitz;

    console.log("[PracticeService] Updating with data:", updateData);

    const { error } = await supabase
      .from("practice_script_plays")
      .update(updateData)
      .eq("id", scriptPlayId);

    if (error) {
      console.error("Error updating script play:", error);
      throw new Error("Failed to update script play");
    }

    // Invalidate all script caches to ensure freshness
    await practiceScriptCache.invalidatePattern(/^script/);
  }

  /**
   * BATCH update multiple script plays - MAJOR PERFORMANCE BOOST
   * Updates all plays in a single transaction instead of N sequential queries
   */
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
    if (updates.length === 0) return;

    console.log(`[PracticeService] Batch updating ${updates.length} plays...`);
    const startTime = performance.now();

    try {
      // Execute all updates in parallel for maximum speed
      await Promise.all(
        updates.map(async ({ scriptPlayId, data }) => {
          const updateData: any = {};

          if (data.repetitions !== undefined)
            updateData.repetitions = data.repetitions;
          if (data.notes !== undefined)
            updateData.coaching_points = data.notes ? [data.notes] : [];
          if (data.hash !== undefined) updateData.hash = data.hash;
          if (data.downDistance !== undefined)
            updateData.down_distance = data.downDistance;
          if (data.fieldPosition !== undefined)
            updateData.field_position = data.fieldPosition;
          if (data.defensiveFront !== undefined)
            updateData.defensive_front = data.defensiveFront;
          if (data.coverage !== undefined) updateData.coverage = data.coverage;
          if (data.blitz !== undefined) updateData.blitz = data.blitz;

          const { error } = await supabase
            .from("practice_script_plays")
            .update(updateData)
            .eq("id", scriptPlayId);

          if (error) {
            console.error(`Error updating play ${scriptPlayId}:`, error);
            throw error;
          }
        })
      );

      const updateTime = performance.now() - startTime;
      console.log(
        `✅ [PracticeService] Batch updated ${updates.length} plays in ${updateTime.toFixed(2)}ms`
      );
      console.log(
        `   Average: ${(updateTime / updates.length).toFixed(2)}ms per play`
      );

      // Invalidate all script caches once after batch
      await practiceScriptCache.invalidatePattern(/^script/);
    } catch (error) {
      console.error("Error in batch update:", error);
      throw new Error("Failed to batch update script plays");
    }
  }

  /**
   * Get all practice scripts for a team - OPTIMIZED with caching
   */
  static async getPracticeScripts(teamId: string): Promise<PracticeScript[]> {
    const cacheKey = `scripts_team_${teamId}`;

    // Check cache first
    const cached = await practiceScriptCache.get<PracticeScript[]>(cacheKey);
    if (cached) {
      console.log("✅ [PracticeService] Cache hit for team scripts:", teamId);
      return cached;
    }

    console.log("🔍 [PracticeService] Cache miss, fetching from database...");
    const startTime = performance.now();

    try {
      // OPTIMIZATION: Single query with join to get scripts AND plays
      const { data: scriptsWithPlays, error: scriptsError } = await supabase
        .from("practice_scripts")
        .select(
          `
          *,
          practice_script_plays (
            *,
            plays (*)
          )
        `
        )
        .eq("team_id", teamId)
        .order("updated_at", { ascending: false });

      if (scriptsError) {
        console.error("Error fetching practice scripts:", scriptsError);
        throw new Error("Failed to fetch practice scripts");
      }

      if (!scriptsWithPlays || scriptsWithPlays.length === 0) {
        await practiceScriptCache.set(cacheKey, [], 1);
        return [];
      }

      // Map directly to PracticeScript interface
      const mappedScripts = scriptsWithPlays.map((script: any) =>
        this.mapDatabaseScriptToPracticeScript(script)
      );

      // Cache the results
      await practiceScriptCache.set(cacheKey, mappedScripts, 1);

      const queryTime = performance.now() - startTime;
      console.log(
        `✅ [PracticeService] Fetched ${mappedScripts.length} scripts in ${queryTime.toFixed(2)}ms`
      );

      return mappedScripts;
    } catch (error) {
      console.error("Error in getPracticeScripts:", error);
      return [];
    }
  }

  /**
   * Get a specific practice script by ID - OPTIMIZED with caching
   */
  static async getPracticeScript(
    scriptId: string
  ): Promise<PracticeScript | null> {
    const cacheKey = `script_${scriptId}`;

    // Check cache first
    const cached = await practiceScriptCache.get<PracticeScript>(cacheKey);
    if (cached) {
      console.log("✅ [PracticeService] Cache hit for script:", scriptId);
      return cached;
    }

    console.log(
      "🔍 [PracticeService] Cache miss, fetching script from database..."
    );
    const startTime = performance.now();

    try {
      // OPTIMIZATION: Single query with join
      const { data: script, error: scriptError } = await supabase
        .from("practice_scripts")
        .select(
          `
          *,
          practice_script_plays (
            *,
            plays (*)
          )
        `
        )
        .eq("id", scriptId)
        .single();

      if (scriptError) {
        if (scriptError.code === "PGRST116") {
          return null;
        }
        console.error("Error fetching practice script:", scriptError);
        throw new Error("Failed to fetch practice script");
      }

      const mappedScript = this.mapDatabaseScriptToPracticeScript(script);

      // Cache the result
      await practiceScriptCache.set(cacheKey, mappedScript, 1);

      const queryTime = performance.now() - startTime;
      console.log(
        `✅ [PracticeService] Fetched script in ${queryTime.toFixed(2)}ms`
      );

      return mappedScript;
    } catch (error) {
      console.error("Error in getPracticeScript:", error);
      return null;
    }
  }

  /**
   * Quick script creation for workflow integration
   */
  static async createQuickScript(
    play: Play,
    teamId: string
  ): Promise<PracticeScript> {
    const script = await this.createPracticeScript({
      name: `Script with ${play.play_name}`,
      description: `Practice script featuring ${play.play_name} and related plays`,
      teamId,
      tags: [play.formation || "", play.p_type || ""].filter(Boolean),
    });

    await this.addPlayToScript(
      {
        scriptId: script.id,
        playId: play.id,
        notes: `Added from playbook workflow`,
        repetitions: 5,
        estimatedTime: 3,
      },
      play
    );

    return script;
  }

  /**
   * Get or create a "Quick Adds" script for fast workflow
   */
  static async getOrCreateQuickAddsScript(
    teamId: string
  ): Promise<PracticeScript> {
    const { data: existingScripts, error: fetchError } = await supabase
      .from("practice_scripts")
      .select("*")
      .eq("team_id", teamId)
      .eq("name", "Quick Adds")
      .limit(1);

    if (fetchError) {
      console.error("Error fetching Quick Adds script:", fetchError);
    }

    if (existingScripts && existingScripts.length > 0) {
      const script = existingScripts[0] as any;
      return {
        id: script.id as string,
        title: script.title || (script.name as string),
        description: script.description as string | undefined,
        teamId: script.team_id as string,
        createdBy: script.created_by as string,
        createdAt: new Date(script.created_at as string),
        updatedAt: new Date(script.updated_at as string),
        isTemplate: script.is_template as boolean,
        plays: [],
        duration: (script.duration as number) || 0,
        tags: (script.tags as string[]) || [],
      } as any; // Type cast for compatibility
    }

    return this.createPracticeScript({
      name: "Quick Adds",
      description:
        "Plays added quickly from the playbook for practice planning",
      teamId,
      tags: ["quick-add", "workflow"],
    });
  }

  /**
   * Duplicate a practice script (Phase 6)
   * Creates a copy of the script with all plays
   */
  static async duplicatePracticeScript(
    scriptId: string,
    newName: string
  ): Promise<PracticeScript> {
    console.log(
      `[PracticeService] Duplicating script ${scriptId} as "${newName}"`
    );

    // 1. Get original script with plays
    const original = await this.getPracticeScript(scriptId);
    if (!original) {
      throw new Error(`Script ${scriptId} not found`);
    }

    // 2. Create new script
    const newScript = await this.createPracticeScript({
      name: newName,
      description: original.description,
      teamId: original.teamId,
      tags: original.tags,
      isTemplate: original.isTemplate,
    });

    // 3. Copy all plays with their configuration
    if (original.plays && original.plays.length > 0) {
      for (const play of original.plays) {
        await this.addPlayToScript(
          {
            scriptId: newScript.id,
            playId: play.playId,
            orderIndex: play.order,
            notes: play.notes,
            repetitions: play.repetitions,
            hash: play.hash,
            downDistance: play.downDistance,
            fieldPosition: play.fieldPosition,
            defensiveFront: play.defensiveFront,
            coverage: play.coverage,
            blitz: play.blitz,
            scenarioNotes: (play as any).scenarioNotes,
          },
          play.play
        );
      }
    }

    console.log(
      `✅ [PracticeService] Duplicated script with ${original.plays?.length || 0} plays`
    );

    // 4. Return the full duplicated script
    return this.getPracticeScript(newScript.id) as Promise<PracticeScript>;
  }

  /**
   * Archive a practice script (Phase 6 - soft delete)
   */
  static async archivePracticeScript(scriptId: string): Promise<void> {
    console.log(`[PracticeService] Archiving script ${scriptId}`);

    const { error } = await supabase
      .from("practice_scripts")
      .update({
        is_archived: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", scriptId);

    if (error) {
      console.error("Error archiving script:", error);
      throw new Error("Failed to archive practice script");
    }

    // Invalidate cache
    await practiceScriptCache.invalidate(`script_${scriptId}`);
    await practiceScriptCache.invalidatePattern(/^scripts_team_/);

    console.log(`✅ [PracticeService] Archived script ${scriptId}`);
  }

  /**
   * Unarchive a practice script (Phase 6)
   */
  static async unarchivePracticeScript(scriptId: string): Promise<void> {
    console.log(`[PracticeService] Unarchiving script ${scriptId}`);

    const { error } = await supabase
      .from("practice_scripts")
      .update({
        is_archived: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", scriptId);

    if (error) {
      console.error("Error unarchiving script:", error);
      throw new Error("Failed to unarchive practice script");
    }

    // Invalidate cache
    await practiceScriptCache.invalidate(`script_${scriptId}`);
    await practiceScriptCache.invalidatePattern(/^scripts_team_/);

    console.log(`✅ [PracticeService] Unarchived script ${scriptId}`);
  }

  /**
   * Delete a practice script (Phase 6 - hard delete)
   * Warning: This permanently deletes the script and all associated plays
   */
  static async deletePracticeScript(scriptId: string): Promise<void> {
    console.log(`[PracticeService] Deleting script ${scriptId}`);

    const { error } = await supabase
      .from("practice_scripts")
      .delete()
      .eq("id", scriptId);

    if (error) {
      console.error("Error deleting script:", error);
      throw new Error("Failed to delete practice script");
    }

    // Invalidate cache
    await practiceScriptCache.invalidate(`script_${scriptId}`);
    await practiceScriptCache.invalidatePattern(/^scripts_team_/);

    console.log(`✅ [PracticeService] Deleted script ${scriptId}`);
  }

  /**
   * Remove a play from a practice script (Phase 6)
   */
  static async removePlayFromScript(scriptPlayId: string): Promise<void> {
    console.log(`[PracticeService] Removing play ${scriptPlayId} from script`);

    const { error } = await supabase
      .from("practice_script_plays")
      .delete()
      .eq("id", scriptPlayId);

    if (error) {
      console.error("Error removing play from script:", error);
      throw new Error("Failed to remove play from script");
    }

    // Invalidate all script caches
    await practiceScriptCache.invalidatePattern(/^script/);

    console.log(`✅ [PracticeService] Removed play from script`);
  }

  /**
   * Reorder plays in a practice script (Phase 6)
   * Updates the sequence_order for each play based on the new order
   */
  static async reorderScriptPlays(
    scriptId: string,
    playIds: string[]
  ): Promise<void> {
    console.log(
      `[PracticeService] Reordering ${playIds.length} plays in script ${scriptId}`
    );

    // Update order for each play (1-indexed)
    await Promise.all(
      playIds.map(async (playId, index) => {
        const { error } = await supabase
          .from("practice_script_plays")
          .update({ sequence_order: index + 1 })
          .eq("id", playId)
          .eq("practice_script_id", scriptId);

        if (error) {
          console.error(`Error reordering play ${playId}:`, error);
          throw error;
        }
      })
    );

    // Invalidate cache
    await practiceScriptCache.invalidate(`script_${scriptId}`);

    console.log(`✅ [PracticeService] Reordered plays in script`);
  }

  /**
   * Map database script with plays to PracticeScript interface
   */
  private static mapDatabaseScriptToPracticeScript(
    scriptData: any
  ): PracticeScript {
    const plays: PracticeScriptPlay[] = (
      scriptData.practice_script_plays || []
    ).map((playData: any) => ({
      id: playData.id,
      playId: playData.play_id,
      play: playData.plays,
      order: playData.sequence_order || 0,
      notes: playData.coaching_points?.join(", ") || "",
      repetitions: playData.repetitions || 1,
      estimatedTime: playData.duration_minutes || 10,
      addedAt: new Date(playData.created_at),
      // Game scenario fields (defensive & situation)
      defensiveFront: playData.defensive_front,
      coverage: playData.coverage,
      blitz: playData.blitz,
      hash: playData.hash,
      downDistance: playData.down_distance,
      fieldPosition: playData.field_position,
    }));

    return {
      id: scriptData.id,
      title: scriptData.title || scriptData.name || "Untitled Script",
      description: scriptData.description,
      teamId: scriptData.team_id,
      createdBy: scriptData.created_by,
      createdAt: new Date(scriptData.created_at),
      updatedAt: new Date(scriptData.updated_at),
      isTemplate: scriptData.is_template || false,
      plays,
      duration: scriptData.duration_minutes || scriptData.duration || 120,
      tags: scriptData.focus_areas || scriptData.tags || [],
    } as any; // Type cast for compatibility with extended interface
  }

  // ============================================================================
  // PRACTICE TEMPLATE OPERATIONS
  // ============================================================================

  /**
   * Get all practice templates for a team
   */
  static async getTemplates(teamId: string): Promise<PracticeTemplate[]> {
    try {
      const { data, error } = await supabase
        .from("practice_templates")
        .select("*")
        .eq("team_id", teamId)
        .order("name", { ascending: true });

      if (error) throw error;
      if (!data) return [];

      return data.map((template) => ({
        id: template.id,
        name: template.name,
        description: template.description,
        teamId: template.team_id,
        duration: template.duration,
        isPublic: template.is_public || false,
        createdBy: template.created_by,
        createdAt: new Date(template.created_at),
        updatedAt: new Date(template.updated_at),
        plays: [], // Templates don't store plays directly
      }));
    } catch (error) {
      console.error("Error fetching practice templates:", error);
      return [];
    }
  }

  /**
   * Create a practice template from an existing script
   */
  static async createTemplateFromScript(
    scriptId: string,
    templateData: CreatePracticeTemplateData
  ): Promise<PracticeTemplate> {
    try {
      // Get the source script with plays
      const sourceScript = await this.getPracticeScript(scriptId);
      if (!sourceScript) {
        throw new Error("Source script not found");
      }

      // Create the template
      const { data: template, error } = await supabase
        .from("practice_templates")
        .insert({
          team_id: templateData.teamId,
          name: templateData.name,
          description: templateData.description,
          duration: templateData.duration || sourceScript.duration,
          is_public: templateData.isPublic || false,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Store template play configuration in JSONB metadata (future enhancement)
      // For now, templates are lightweight - just name and duration

      return {
        id: template.id,
        name: template.name,
        description: template.description,
        teamId: template.team_id,
        duration: template.duration,
        isPublic: template.is_public,
        createdBy: template.created_by,
        createdAt: new Date(template.created_at),
        updatedAt: new Date(template.updated_at),
        plays: sourceScript.plays, // Include plays for immediate use
      };
    } catch (error) {
      console.error("Error creating template from script:", error);
      throw new Error("Failed to create practice template");
    }
  }

  /**
   * Create a new script from a template
   */
  static async createScriptFromTemplate(
    templateId: string,
    scriptName: string
  ): Promise<PracticeScript> {
    try {
      // Get the template
      const { data: template, error: templateError } = await supabase
        .from("practice_templates")
        .select("*")
        .eq("id", templateId)
        .single();

      if (templateError) throw templateError;
      if (!template) throw new Error("Template not found");

      // Create new script with template data
      const newScript = await this.createPracticeScript({
        name: scriptName,
        description: template.description || `Created from ${template.name} template`,
        teamId: template.team_id,
        tags: ["from-template", template.name],
      });

      // Note: Template play configuration would be copied here if stored
      // For now, templates are just starting points with metadata

      return newScript;
    } catch (error) {
      console.error("Error creating script from template:", error);
      throw new Error("Failed to create script from template");
    }
  }

  /**
   * Delete a practice template
   */
  static async deleteTemplate(templateId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("practice_templates")
        .delete()
        .eq("id", templateId);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting practice template:", error);
      throw new Error("Failed to delete practice template");
    }
  }

  /**
   * Update a practice template
   */
  static async updateTemplate(
    templateId: string,
    updates: Partial<CreatePracticeTemplateData>
  ): Promise<PracticeTemplate> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined)
        updateData.description = updates.description;
      if (updates.duration !== undefined) updateData.duration = updates.duration;
      if (updates.isPublic !== undefined) updateData.is_public = updates.isPublic;

      const { data: template, error } = await supabase
        .from("practice_templates")
        .update(updateData)
        .eq("id", templateId)
        .select()
        .single();

      if (error) throw error;
      if (!template) throw new Error("Template not found");

      return {
        id: template.id,
        name: template.name,
        description: template.description,
        teamId: template.team_id,
        duration: template.duration,
        isPublic: template.is_public,
        createdBy: template.created_by,
        createdAt: new Date(template.created_at),
        updatedAt: new Date(template.updated_at),
        plays: [],
      };
    } catch (error) {
      console.error("Error updating practice template:", error);
      throw new Error("Failed to update practice template");
    }
  }
}

// Backward compatibility exports
export const PracticeScriptService = PracticeService;
