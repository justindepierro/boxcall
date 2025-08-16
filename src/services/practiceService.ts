import { supabase } from "../lib/supabase";

import type {
  CreatePracticeBlockData,
  CreatePracticeScheduleData,
  Equipment,
  PracticeAttendance,
  PracticeBlock,
  PracticeFilters,
  PracticeSchedule,
  PracticeScript,
  PracticeSearchResult,
  PracticeTemplate,
} from "../types/practice";

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

    return { schedules, templates, scripts };
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
    // Mock implementation - will be replaced when Practice Scripts are implemented
    // For now, return empty array but accept the parameters for consistency
    console.log(
      `Searching practice scripts for query: ${query}, teamId: ${teamId}`
    );
    return [];
  }
}
