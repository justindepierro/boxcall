import { supabase } from "../lib/supabase";

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
  estimatedTime: number; // in minutes
  addedAt: Date;
}

export interface CreatePracticeScriptData {
  name: string;
  description?: string;
  teamId: string;
  isTemplate?: boolean;
  tags?: string[];
}

export interface AddPlayToPracticeScriptData {
  scriptId: string;
  playId: string;
  orderIndex?: number;
  notes?: string;
  repetitions?: number;
  estimatedTime?: number;
}

export class PracticeService {
  // Practice Schedule CRUD Operations
  static async createPracticeSchedule(
    data: CreatePracticeScheduleData
  ): Promise<PracticeSchedule> {
    const { data: schedule, error } = await supabase
      .from("practice_schedules")
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
      return data.map((script) => this.mapDatabaseScriptToPracticeScript({
        ...script,
        practice_script_plays: plays?.filter(
          (p: any) => p.practice_script_id === script.id
        ) || [],
      }));
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
   * Create a new practice script
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
    return {
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
    } as any; // Type cast for compatibility
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
        duration_minutes: data.estimatedTime || 10,
        segment_name: "Drill",
        segment_type: "drill",
      });

    if (playError) {
      console.error("Error adding play to script:", playError);
      throw new Error("Failed to add play to practice script");
    }

    const script = await this.getPracticeScript(data.scriptId);
    if (!script) {
      throw new Error("Failed to retrieve updated practice script");
    }
    return script;
  }

  /**
   * Get all practice scripts for a team
   */
  static async getPracticeScripts(teamId: string): Promise<PracticeScript[]> {
    try {
      const { data: scripts, error: scriptsError } = await supabase
        .from("practice_scripts")
        .select("*")
        .eq("team_id", teamId)
        .order("updated_at", { ascending: false });

      if (scriptsError) {
        console.error("Error fetching practice scripts:", scriptsError);
        throw new Error("Failed to fetch practice scripts");
      }

      if (!scripts || scripts.length === 0) {
        return [];
      }

      let scriptPlays: any[] = [];
      try {
        const scriptIds = scripts.map((s) => s.id);
        const { data: plays, error: playsError } = await supabase
          .from("practice_script_plays")
          .select(`*, plays (*)`)
          .in("practice_script_id", scriptIds);

        if (!playsError && plays) {
          scriptPlays = plays;
        }
      } catch (playsError) {
        console.warn(
          "Could not fetch practice script plays, continuing without plays data:",
          playsError
        );
      }

      const playsByScriptId = scriptPlays.reduce((acc, play) => {
        const scriptId = play.practice_script_id;
        if (!acc[scriptId]) {
          acc[scriptId] = [];
        }
        acc[scriptId].push(play);
        return acc;
      }, {} as Record<string, any[]>);

      return scripts.map((script) => {
        const scriptPlays = playsByScriptId[script.id] || [];
        return this.mapDatabaseScriptToPracticeScript({
          ...script,
          practice_script_plays: scriptPlays,
        });
      });
    } catch (error) {
      console.error("Error in getPracticeScripts:", error);
      return [];
    }
  }

  /**
   * Get a specific practice script by ID
   */
  static async getPracticeScript(
    scriptId: string
  ): Promise<PracticeScript | null> {
    try {
      const { data: script, error: scriptError } = await supabase
        .from("practice_scripts")
        .select("*")
        .eq("id", scriptId)
        .single();

      if (scriptError) {
        if (scriptError.code === "PGRST116") {
          return null;
        }
        console.error("Error fetching practice script:", scriptError);
        throw new Error("Failed to fetch practice script");
      }

      let scriptPlays: any[] = [];
      try {
        const { data: plays, error: playsError } = await supabase
          .from("practice_script_plays")
          .select(`*, plays (*)`)
          .eq("practice_script_id", scriptId);

        if (!playsError && plays) {
          scriptPlays = plays;
        }
      } catch (playsError) {
        console.warn(
          "Could not fetch practice script plays, continuing without plays data:",
          playsError
        );
      }

      return this.mapDatabaseScriptToPracticeScript({
        ...script,
        practice_script_plays: scriptPlays,
      });
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
        title: script.title || script.name as string,
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
}

// Backward compatibility exports
export const PracticeScriptService = PracticeService;
