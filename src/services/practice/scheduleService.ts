/**
 * Practice Schedule & Block Management
 * Extracted from monolithic practiceService.ts for better maintainability
 */

import { table } from "../../data/supabase/db";

import type {
  PracticeSchedule,
  PracticeBlock,
  CreatePracticeScheduleData,
  CreatePracticeBlockData,
  PracticeFilters,
  PracticeAttendance,
  Equipment,
} from "../../types/practice";

/**
 * Service for managing practice schedules, blocks, attendance, and equipment
 */
export class PracticeScheduleService {
  // ============================================================================
  // PRACTICE SCHEDULE CRUD OPERATIONS
  // ============================================================================

  /**
   * Create a new practice schedule
   */
  static async createPracticeSchedule(
    data: CreatePracticeScheduleData
  ): Promise<PracticeSchedule> {
    const { data: schedule, error } = await table("practice_schedules")
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

  /**
   * Get all practice schedules for a team with optional filters
   */
  static async getPracticeSchedules(
    teamId: string,
    filters?: PracticeFilters
  ): Promise<PracticeSchedule[]> {
    let query = table("practice_schedules")
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

  /**
   * Update an existing practice schedule
   */
  static async updatePracticeSchedule(
    id: string,
    updates: Partial<PracticeSchedule>
  ): Promise<PracticeSchedule> {
    const { data, error } = await table("practice_schedules")
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

  /**
   * Delete a practice schedule
   */
  static async deletePracticeSchedule(id: string): Promise<void> {
    const { error } = await table("practice_schedules").delete().eq("id", id);

    if (error) throw error;
  }

  // ============================================================================
  // PRACTICE BLOCK OPERATIONS
  // ============================================================================

  /**
   * Add a practice block to a schedule
   * Note: Not supported by current schema - throws error
   */
  static async addPracticeBlock(
    scheduleId: string,
    blockData: CreatePracticeBlockData
  ): Promise<PracticeBlock> {
    void scheduleId;
    void blockData;
    throw new Error(
      "Practice blocks are not supported by the current practice_schedules schema"
    );
  }

  /**
   * Update a practice block
   * Note: Not supported by current schema - throws error
   */
  static async updatePracticeBlock(
    scheduleId: string,
    blockId: string,
    updates: Partial<PracticeBlock>
  ): Promise<void> {
    void scheduleId;
    void blockId;
    void updates;
    throw new Error(
      "Practice blocks are not supported by the current practice_schedules schema"
    );
  }

  /**
   * Reorder practice blocks in a schedule
   * Note: Not supported by current schema - throws error
   */
  static async reorderPracticeBlocks(
    scheduleId: string,
    blocks: PracticeBlock[]
  ): Promise<void> {
    void scheduleId;
    void blocks;
    throw new Error(
      "Practice blocks are not supported by the current practice_schedules schema"
    );
  }

  /**
   * Delete a practice block from a schedule
   * Note: Not supported by current schema - throws error
   */
  static async deletePracticeBlock(
    scheduleId: string,
    blockId: string
  ): Promise<void> {
    void scheduleId;
    void blockId;
    throw new Error(
      "Practice blocks are not supported by the current practice_schedules schema"
    );
  }

  // ============================================================================
  // ATTENDANCE MANAGEMENT
  // ============================================================================

  /**
   * Record player attendance for a practice
   */
  static async recordAttendance(
    practiceId: string,
    playerId: string,
    status: "present" | "absent" | "late" | "excused",
    notes?: string
  ): Promise<PracticeAttendance> {
    const { data, error } = await table("practice_attendance")
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

  /**
   * Get all attendance records for a practice
   */
  static async getPracticeAttendance(
    practiceId: string
  ): Promise<PracticeAttendance[]> {
    const { data, error } = await table("practice_attendance")
      .select("*")
      .eq("practice_id", practiceId);

    if (error) throw error;
    return data.map(this.transformAttendanceFromDB);
  }

  // ============================================================================
  // EQUIPMENT MANAGEMENT
  // ============================================================================

  /**
   * Get all available equipment for a team
   */
  static async getAvailableEquipment(teamId: string): Promise<Equipment[]> {
    const { data, error } = await table("equipment")
      .select("*")
      .eq("team_id", teamId)
      .order("name");

    if (error) throw error;
    return data.map(this.transformEquipmentFromDB);
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
}
