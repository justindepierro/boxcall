/**
 * Practice Template Management
 * Extracted from monolithic practiceService.ts for better maintainability
 */

import { table } from "../../data/supabase/db";
import { getCurrentUserId } from "../../lib/auth-helpers";
import { error as logError } from "../../utils/logger";
import type {
  PracticeTemplate,
  CreatePracticeTemplateData,
  PracticeScript,
} from "../../types/practice-service";

/**
 * Service for managing practice templates
 */
export class PracticeTemplateService {
  /**
   * Create a new practice template
   */
  static async createPracticeTemplate(
    template: Omit<PracticeTemplate, "id" | "createdAt" | "usageCount">
  ): Promise<PracticeTemplate> {
    const { name, description, teamId, duration, isPublic, createdBy } =
      template;
    const { data, error } = await table("practice_templates")
      .insert({
        name,
        description: description ?? null,
        team_id: teamId,
        duration,
        is_public: isPublic,
        created_by: createdBy,
      })
      .select()
      .single();

    if (error) throw error;
    return this.transformTemplateFromDB(data);
  }

  /**
   * Get all practice templates for a team (includes public templates)
   */
  static async getPracticeTemplates(
    teamId: string
  ): Promise<PracticeTemplate[]> {
    const { data, error } = await table("practice_templates")
      .select("*")
      .or(`team_id.eq.${teamId},is_public.eq.true`)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data.map(this.transformTemplateFromDB);
  }

  /**
   * Get all templates for a team (alternative API)
   */
  static async getTemplates(teamId: string): Promise<PracticeTemplate[]> {
    try {
      const { data, error } = await table("practice_templates")
        .select("*")
        .eq("team_id", teamId)
        .order("name", { ascending: true });

      if (error) throw error;
      if (!data) return [];

      return data.map((template) => ({
        id: template.id,
        name: template.name,
        description: template.description ?? undefined,
        teamId: template.team_id,
        duration: template.duration,
        isPublic: template.is_public ?? false,
        createdBy: template.created_by,
        createdAt: template.created_at
          ? new Date(template.created_at)
          : new Date(),
        updatedAt: template.updated_at
          ? new Date(template.updated_at)
          : undefined,
        plays: [], // Templates don't store plays directly
      }));
    } catch (error) {
      logError("Error fetching practice templates:", error);
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
      // Get the source script with plays (from PracticeScriptService)
      const { data: sourceScript, error: scriptError } = await table(
        "practice_scripts"
      )
        .select("*")
        .eq("id", scriptId)
        .single();

      if (scriptError || !sourceScript) {
        throw new Error("Source script not found");
      }

      // Create the template
      const { data: template, error } = await table("practice_templates")
        .insert({
          team_id: templateData.teamId,
          name: templateData.name,
          description: templateData.description,
          duration:
            templateData.duration ||
            (sourceScript.duration_minutes as number) ||
            120,
          is_public: templateData.isPublic || false,
          created_by: getCurrentUserId(),
        })
        .select()
        .single();

      if (error) throw error;

      // Store template play configuration in JSONB metadata (future enhancement)
      // For now, templates are lightweight - just name and duration

      return {
        id: template.id,
        name: template.name,
        description: template.description ?? undefined,
        teamId: template.team_id,
        duration: template.duration,
        isPublic: template.is_public ?? false,
        createdBy: template.created_by,
        createdAt: template.created_at
          ? new Date(template.created_at)
          : new Date(),
        updatedAt: template.updated_at
          ? new Date(template.updated_at)
          : undefined,
        plays: [], // Would include plays from sourceScript in future enhancement
      };
    } catch (error) {
      logError("Error creating template from script:", error);
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
      const { data: template, error: templateError } = await table(
        "practice_templates"
      )
        .select("*")
        .eq("id", templateId)
        .single();

      if (templateError) throw templateError;
      if (!template) throw new Error("Template not found");
      if (!template.team_id) throw new Error("Template has no team_id");

      // Create new script with template data
      const { data: newScript, error: scriptError } = await table(
        "practice_scripts"
      )
        .insert({
          title: scriptName,
          description:
            template.description || `Created from ${template.name} template`,
          team_id: template.team_id,
          focus_areas: ["from-template", template.name],
          created_by: getCurrentUserId(),
        })
        .select()
        .single();

      if (scriptError) throw scriptError;

      // Note: Template play configuration would be copied here if stored
      // For now, templates are just starting points with metadata

      const scriptData = newScript as any;
      return {
        id: scriptData.id as string,
        title: scriptData.title as string,
        name: scriptData.title as string,
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
    } catch (error) {
      logError("Error creating script from template:", error);
      throw new Error("Failed to create script from template");
    }
  }

  /**
   * Create a schedule from a template
   * Note: Not supported by current schema - throws error
   */
  static async createScheduleFromTemplate(
    templateId: string,
    scheduleData: any
  ): Promise<any> {
    void templateId;
    void scheduleData;
    throw new Error(
      "Creating schedules from templates is not supported by the current practice_templates schema"
    );
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
      if (updates.duration !== undefined)
        updateData.duration = updates.duration;
      if (updates.isPublic !== undefined)
        updateData.is_public = updates.isPublic;

      const { data: template, error } = await table("practice_templates")
        .update(updateData)
        .eq("id", templateId)
        .select()
        .single();

      if (error) throw error;
      if (!template) throw new Error("Template not found");

      return {
        id: template.id,
        name: template.name,
        description: template.description ?? undefined,
        teamId: template.team_id,
        duration: template.duration,
        isPublic: template.is_public ?? false,
        createdBy: template.created_by,
        createdAt: template.created_at
          ? new Date(template.created_at)
          : new Date(),
        updatedAt: template.updated_at
          ? new Date(template.updated_at)
          : undefined,
        plays: [],
      };
    } catch (error) {
      logError("Error updating practice template:", error);
      throw new Error("Failed to update practice template");
    }
  }

  /**
   * Delete a practice template
   */
  static async deleteTemplate(templateId: string): Promise<void> {
    try {
      const { error } = await table("practice_templates")
        .delete()
        .eq("id", templateId);

      if (error) throw error;
    } catch (error) {
      logError("Error deleting practice template:", error);
      throw new Error("Failed to delete practice template");
    }
  }

  // ============================================================================
  // UTILITY METHODS - Database Transformations
  // ============================================================================

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
}
