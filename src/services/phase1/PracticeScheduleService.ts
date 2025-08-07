/**
 * Phase 1 Foundation - Practice Schedule Service
 * Critical service required by practiceService.ts
 *
 * Implements standardized BaseService pattern with domain-specific logic
 * for practice scheduling, attendance tracking, and equipment management.
 */

import { supabase } from "../../lib/supabase";
import { BaseService } from "../base/BaseService";
import type {
  PracticeSchedule,
  PracticeScheduleInsert,
  PracticeScheduleUpdate,
  CalendarEventInsert,
} from "../../types/database";

export class PracticeScheduleService extends BaseService<"practice_schedules"> {
  constructor() {
    super(supabase, "practice_schedules");
  }

  // Validation methods required by BaseService
  protected async validateCreate(data: PracticeScheduleInsert): Promise<void> {
    if (!data.team_id) {
      throw new Error("Team ID is required");
    }
    if (!data.title) {
      throw new Error("Practice title is required");
    }
    if (!data.date_scheduled) {
      throw new Error("Practice date is required");
    }
    if (!data.start_time || !data.end_time) {
      throw new Error("Practice start and end times are required");
    }

    // Validate time logic
    if (data.start_time >= data.end_time) {
      throw new Error("End time must be after start time");
    }
  }

  protected async validateUpdate(
    _id: string,
    data: PracticeScheduleUpdate
  ): Promise<void> {
    if (data.start_time && data.end_time && data.start_time >= data.end_time) {
      throw new Error("End time must be after start time");
    }
  }

  // Domain-specific methods for practice scheduling

  /**
   * Create a practice schedule with optional calendar integration
   */
  async createWithCalendar(
    data: PracticeScheduleInsert,
    createCalendarEvent = true
  ): Promise<PracticeSchedule> {
    await this.validateCreate(data);

    // Create calendar event first if requested
    let calendarEventId: string | undefined;

    if (createCalendarEvent) {
      const calendarEventData: CalendarEventInsert = {
        team_id: data.team_id,
        title: data.title,
        description: data.description || `Practice: ${data.title}`,
        event_type: "practice",
        start_time: `${data.date_scheduled}T${data.start_time}`,
        end_time: `${data.date_scheduled}T${data.end_time}`,
        location: data.location,
        created_by: data.created_by,
        status: "confirmed",
        priority: "normal",
        color: "#10B981", // Green for practices
      };

      const { data: calendarEvent, error } = await this.supabase
        .from("calendar_events")
        .insert(calendarEventData)
        .select()
        .single();

      if (error) throw error;
      calendarEventId = calendarEvent.id;
    }

    // Create practice schedule with calendar reference
    const practiceData: PracticeScheduleInsert = {
      ...data,
      calendar_event_id: calendarEventId,
    };

    return this.create(practiceData);
  }

  /**
   * Get practices for a specific team and date range
   */
  async getTeamPractices(
    teamId: string,
    startDate?: string,
    endDate?: string,
    includeTemplates = false
  ): Promise<PracticeSchedule[]> {
    let query = this.supabase
      .from("practice_schedules")
      .select("*")
      .eq("team_id", teamId)
      .order("date_scheduled", { ascending: true });

    if (startDate) {
      query = query.gte("date_scheduled", startDate);
    }

    if (endDate) {
      query = query.lte("date_scheduled", endDate);
    }

    if (!includeTemplates) {
      query = query.eq("is_template", false);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  }

  /**
   * Get upcoming practices for a team
   */
  async getUpcomingPractices(
    teamId: string,
    limit = 10
  ): Promise<PracticeSchedule[]> {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await this.supabase
      .from("practice_schedules")
      .select("*")
      .eq("team_id", teamId)
      .gte("date_scheduled", today)
      .eq("is_template", false)
      .order("date_scheduled", { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Update practice completion status
   */
  async updateCompletionStatus(
    id: string,
    status: "scheduled" | "in_progress" | "completed" | "cancelled"
  ): Promise<PracticeSchedule> {
    const updateData: PracticeScheduleUpdate = {
      completion_status: status,
      updated_at: new Date().toISOString(),
    };

    // Note: actual_start_time and actual_end_time fields need to be added to schema
    // These are conceptual fields for tracking actual practice times vs scheduled times
    // For now, we'll just update the status

    return this.update(id, updateData);
  }

  /**
   * Clone a practice template
   */
  async cloneFromTemplate(
    templateId: string,
    newDate: string,
    overrides: Partial<PracticeScheduleInsert> = {}
  ): Promise<PracticeSchedule> {
    const template = await this.findById(templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    if (!template.is_template) {
      throw new Error("Source practice is not a template");
    }

    const cloneData: PracticeScheduleInsert = {
      team_id: template.team_id,
      title: template.title,
      description: template.description,
      date_scheduled: newDate,
      start_time: template.start_time,
      end_time: template.end_time,
      location: template.location,
      field_type: template.field_type,
      total_duration: template.total_duration,
      equipment_required: template.equipment_required,
      coaching_notes: template.coaching_notes,
      objectives: template.objectives,
      tags: template.tags,
      created_by: overrides.created_by || template.created_by,
      is_template: false,
      ...overrides,
    };

    return this.createWithCalendar(cloneData);
  }

  /**
   * Get practice templates for a team
   */
  async getTemplates(teamId: string): Promise<PracticeSchedule[]> {
    const { data, error } = await this.supabase
      .from("practice_schedules")
      .select("*")
      .eq("team_id", teamId)
      .eq("is_template", true)
      .order("title");

    if (error) throw error;
    return data || [];
  }

  /**
   * Get practices with attendance summary
   */
  async getPracticesWithAttendance(
    teamId: string
  ): Promise<
    Array<
      PracticeSchedule & {
        attendance_summary?: {
          total: number;
          present: number;
          percentage: number;
        };
      }
    >
  > {
    const practices = await this.getTeamPractices(teamId);

    // Get attendance summaries for all practices
    const practicesWithAttendance = await Promise.all(
      practices.map(async (practice) => {
        const { data: attendance } = await this.supabase
          .from("practice_attendance")
          .select("attendance_status")
          .eq("practice_id", practice.id);

        if (!attendance?.length) {
          return practice;
        }

        const total = attendance.length;
        const present = attendance.filter(
          (a) => a.attendance_status === "present"
        ).length;
        const percentage = Math.round((present / total) * 100);

        return {
          ...practice,
          attendance_summary: { total, present, percentage },
        };
      })
    );

    return practicesWithAttendance;
  }

  /**
   * Bulk create practices from schedule
   */
  async bulkCreateFromSchedule(
    teamId: string,
    scheduleData: Array<{
      date: string;
      startTime: string;
      endTime: string;
      title: string;
      location?: string;
    }>,
    createdBy: string
  ): Promise<PracticeSchedule[]> {
    const practices = scheduleData.map((schedule) => ({
      team_id: teamId,
      title: schedule.title,
      date_scheduled: schedule.date,
      start_time: schedule.startTime,
      end_time: schedule.endTime,
      location: schedule.location,
      created_by: createdBy,
    }));

    const results: PracticeSchedule[] = [];

    // Create practices sequentially to maintain order and handle errors properly
    for (const practice of practices) {
      try {
        const created = await this.createWithCalendar(practice);
        results.push(created);
      } catch (error) {
        console.error(
          `Failed to create practice for ${practice.date_scheduled}:`,
          error
        );
        // Continue with remaining practices
      }
    }

    return results;
  }
}

// Create singleton instance
export const practiceScheduleService = new PracticeScheduleService();
