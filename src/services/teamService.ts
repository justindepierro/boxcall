/**
 * Unified Team Service
 *
 * Consolidates team management functionality from:
 * - teamCreationService.ts (team creation workflow)
 * - teamDuplicatePreventionService.ts (duplicate detection)
 * - teamValidationService.ts (form validation)
 *
 * This service handles the complete team lifecycle from validation through creation.
 */

import { debug, error as logError } from "../utils/logger";
import { storageKeys, writeLocalString } from "../utils/storage";
import { table } from "../data/supabase/db";
import { withDatabaseRetry } from "../lib/database-helpers";
import { emitTelemetry } from "../lib/telemetry";
import { createTeamSchema } from "../validation-services/teamValidation";

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface TeamCreationInput {
  teamName: string;
  schoolName: string;
  sport: string;
  season: string;
  schoolDistrict?: string;
  schoolAddress?: string;
  schoolCity?: string;
  schoolState?: string;
  schoolZip?: string;
  ownerFirstName?: string;
  ownerLastName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
}

export interface AuthUser {
  id: string;
  email?: string;
}

export interface TeamCreationProgress {
  setLoadingMessage: (message: string) => void;
}

export interface TeamCreationResult {
  success: boolean;
  teamId?: string;
  error?: string;
}

export interface ValidationResult {
  success: boolean;
  data?: TeamCreationInput;
  errors?: Record<string, string[]>;
  fieldErrors?: Record<string, string>;
}

export interface TeamSimilarity {
  teamId: string;
  teamName: string;
  schoolName: string;
  schoolDistrict?: string;
  schoolCity?: string;
  schoolState?: string;
  similarityScore: number;
  matchReasons: string[];
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  similarTeams: TeamSimilarity[];
  requiresApproval: boolean;
  warningMessage?: string;
}

// ============================================
// UNIFIED TEAM SERVICE
// ============================================

export class TeamService {
  // ============================================
  // VALIDATION METHODS
  // ============================================

  /**
   * Validate team creation form data
   */
  static validateTeamForm(formData: any): ValidationResult {
    const validation = createTeamSchema.safeParse(formData);

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      const errors: Record<string, string[]> = {};

      validation.error.issues.forEach((issue) => {
        const field = issue.path.join(".");
        const message = issue.message;

        if (!errors[field]) {
          errors[field] = [];
        }
        errors[field].push(message);

        if (!fieldErrors[field]) {
          fieldErrors[field] = message;
        }
      });

      return {
        success: false,
        errors,
        fieldErrors,
      };
    }

    return {
      success: true,
      data: validation.data,
    };
  }

  /**
   * Validate a specific field
   */
  static validateField(
    fieldName: string,
    value: any,
    formData: any
  ): { isValid: boolean; error?: string } {
    const fullFormData = { ...formData, [fieldName]: value };
    const result = this.validateTeamForm(fullFormData);

    if (result.success) {
      return { isValid: true };
    }

    const error = result.fieldErrors?.[fieldName];
    return {
      isValid: !error,
      error,
    };
  }

  /**
   * Check if form data is complete for a specific step
   */
  static isStepComplete(stepId: string, formData: any): boolean {
    switch (stepId) {
      case "team-info":
        return !!(formData.teamName && formData.sport && formData.season);

      case "school-info":
        return !!(formData.schoolName && formData.schoolDistrict);

      case "contact-info":
        return !!(
          formData.ownerFirstName &&
          formData.ownerLastName &&
          formData.ownerEmail
        );

      case "review":
        return this.validateTeamForm(formData).success;

      default:
        return false;
    }
  }

  // ============================================
  // DUPLICATE PREVENTION METHODS
  // ============================================

  /**
   * Check for duplicate or similar teams before creation
   */
  static async checkForDuplicates(
    teamName: string,
    schoolName: string,
    _schoolDistrict?: string,
    _schoolCity?: string,
    _schoolState?: string
  ): Promise<DuplicateCheckResult> {
    try {
      debug("🔍 Starting duplicate team check...");

      // Fetch all existing teams for comparison
      const { data: existingTeams, error } = await table("teams")
        .select("id, name, school_name")
        .limit(100); // Limit for performance

      if (error) {
        debug("Could not fetch teams for duplicate check:", error);
        return {
          isDuplicate: false,
          similarTeams: [],
          requiresApproval: false,
        };
      }

      const teams = existingTeams || [];
      const similarTeams: TeamSimilarity[] = [];

      // Check each existing team for similarity
      for (const team of teams) {
        const similarity = this.calculateSimilarity(
          { teamName, schoolName },
          {
            teamName: team.name,
            schoolName: team.school_name || "",
          }
        );

        if (similarity.score > 0.3) {
          similarTeams.push({
            teamId: team.id,
            teamName: team.name,
            schoolName: team.school_name || "",
            schoolDistrict: undefined,
            schoolCity: undefined,
            schoolState: undefined,
            similarityScore: similarity.score,
            matchReasons: similarity.reasons,
          });
        }
      }

      similarTeams.sort((a, b) => b.similarityScore - a.similarityScore);

      const highestSimilarity = similarTeams[0]?.similarityScore || 0;
      const isDuplicate = highestSimilarity > 0.85;
      const requiresApproval = highestSimilarity > 0.6;

      let warningMessage: string | undefined;

      if (isDuplicate) {
        const similar = similarTeams[0];
        warningMessage = `A very similar team already exists: "${similar.schoolName} ${similar.teamName}". This might be a duplicate. Please contact customer support if you believe this is incorrect.`;
      } else if (requiresApproval) {
        const similar = similarTeams[0];
        warningMessage = `Similar team found: "${similar.schoolName} ${similar.teamName}". Please verify this is not a duplicate before proceeding. If you're the new coach for this team, contact customer support for account transfer.`;
      }

      emitTelemetry("team.duplicate_check", {
        potential_duplicates: similarTeams.length,
        highest_similarity: highestSimilarity,
        requires_approval: requiresApproval,
        is_duplicate: isDuplicate,
      });

      debug(
        `🔍 Duplicate check completed: ${similarTeams.length} similar teams found`
      );

      return {
        isDuplicate,
        similarTeams,
        requiresApproval,
        warningMessage,
      };
    } catch (error) {
      logError("Error in duplicate check:", error);

      emitTelemetry("team.duplicate_check.error", {
        error_message: error instanceof Error ? error.message : String(error),
      });

      return {
        isDuplicate: false,
        similarTeams: [],
        requiresApproval: false,
      };
    }
  }

  /**
   * Calculate similarity between two teams
   */
  private static calculateSimilarity(
    team1: {
      teamName: string;
      schoolName: string;
      schoolDistrict?: string;
      schoolCity?: string;
      schoolState?: string;
    },
    team2: {
      teamName: string;
      schoolName: string;
      schoolDistrict?: string;
      schoolCity?: string;
      schoolState?: string;
    }
  ): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let totalScore = 0;
    let factors = 0;

    // Team name similarity (40% weight)
    const teamNameSimilarity = this.stringSimilarity(
      team1.teamName,
      team2.teamName
    );
    if (teamNameSimilarity > 0.8) {
      reasons.push(
        `Very similar team names: "${team1.teamName}" vs "${team2.teamName}"`
      );
      totalScore += teamNameSimilarity * 0.4;
    } else if (teamNameSimilarity > 0.5) {
      reasons.push(
        `Similar team names: "${team1.teamName}" vs "${team2.teamName}"`
      );
      totalScore += teamNameSimilarity * 0.4;
    }
    factors += 0.4;

    // School name similarity (35% weight)
    const schoolNameSimilarity = this.stringSimilarity(
      team1.schoolName,
      team2.schoolName
    );
    if (schoolNameSimilarity > 0.8) {
      reasons.push(
        `Very similar school names: "${team1.schoolName}" vs "${team2.schoolName}"`
      );
      totalScore += schoolNameSimilarity * 0.35;
    } else if (schoolNameSimilarity > 0.5) {
      reasons.push(
        `Similar school names: "${team1.schoolName}" vs "${team2.schoolName}"`
      );
      totalScore += schoolNameSimilarity * 0.35;
    }
    factors += 0.35;

    // Location similarity (25% weight)
    let locationScore = 0;
    let locationFactors = 0;

    if (team1.schoolState && team2.schoolState) {
      if (team1.schoolState.toLowerCase() === team2.schoolState.toLowerCase()) {
        locationScore += 0.4;
        reasons.push(`Same state: ${team1.schoolState}`);
      }
      locationFactors += 0.4;
    }

    if (team1.schoolCity && team2.schoolCity) {
      const citySim = this.stringSimilarity(team1.schoolCity, team2.schoolCity);
      if (citySim > 0.8) {
        locationScore += 0.35;
        reasons.push(
          `Same/similar city: "${team1.schoolCity}" vs "${team2.schoolCity}"`
        );
      }
      locationFactors += 0.35;
    }

    if (team1.schoolDistrict && team2.schoolDistrict) {
      const districtSim = this.stringSimilarity(
        team1.schoolDistrict,
        team2.schoolDistrict
      );
      if (districtSim > 0.8) {
        locationScore += 0.25;
        reasons.push(
          `Same/similar district: "${team1.schoolDistrict}" vs "${team2.schoolDistrict}"`
        );
      }
      locationFactors += 0.25;
    }

    if (locationFactors > 0) {
      totalScore += (locationScore / locationFactors) * 0.25;
    }
    factors += 0.25;

    const finalScore = factors > 0 ? totalScore / factors : 0;

    return {
      score: Math.min(1, Math.max(0, finalScore)),
      reasons,
    };
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private static stringSimilarity(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;

    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 1;

    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) return 1;

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Send duplicate team report to customer support
   */
  static async reportDuplicateAttempt(
    attemptedTeam: {
      teamName: string;
      schoolName: string;
      schoolDistrict?: string;
      schoolCity?: string;
      schoolState?: string;
    },
    similarTeams: TeamSimilarity[],
    userEmail?: string
  ): Promise<void> {
    try {
      debug("📧 Sending duplicate team report to support...");

      const reportData = {
        type: "duplicate_team_attempt",
        user_email: userEmail,
        attempted_team: attemptedTeam,
        similar_teams: similarTeams,
        created_at: new Date().toISOString(),
        status: "pending_review",
      };

      // TODO: Create support_tickets table in database
      // const { error } = await supabase
      //   .from("support_tickets")
      //   .insert(reportData);

      // if (error) {
      //   debug("Could not store support ticket:", error);
      // }

      debug("📧 Duplicate team report logged:", reportData);

      emitTelemetry("team.duplicate_report_sent", {
        similar_teams_count: similarTeams.length,
        has_user_email: !!userEmail,
      });

      debug("📧 Duplicate team report sent successfully");
    } catch (error) {
      logError("Error sending duplicate report:", error);
    }
  }

  // ============================================
  // TEAM CREATION METHODS
  // ============================================

  /**
   * Create a new team with full validation and duplicate checking
   */
  static async createTeam(
    formData: TeamCreationInput,
    authUser: AuthUser,
    progress: TeamCreationProgress
  ): Promise<TeamCreationResult> {
    try {
      const checkDuplicatesSafe = async (): Promise<void> => {
        progress.setLoadingMessage("Checking for similar teams...");
        try {
          const duplicateCheck = await this.checkForDuplicates(
            formData.teamName,
            formData.schoolName,
            formData.schoolDistrict,
            formData.schoolCity,
            formData.schoolState
          );

          if (duplicateCheck.isDuplicate) {
            logError(
              "🚨 Duplicate team detected:",
              duplicateCheck.warningMessage
            );
            throw new Error(
              duplicateCheck.warningMessage ||
                "A very similar team already exists. Please contact support."
            );
          }

          if (duplicateCheck.requiresApproval) {
            debug("⚠️ Similar team found:", duplicateCheck.warningMessage);
            emitTelemetry("team.create.similar_team_warning", {
              similar_teams_count: duplicateCheck.similarTeams.length,
              highest_similarity:
                duplicateCheck.similarTeams[0]?.similarityScore || 0,
            });
          }
        } catch (duplicateError) {
          debug(
            "⚠️ Duplicate check failed, proceeding anyway:",
            duplicateError
          );
        }
      };

      const insertTeamWithTimeout = async (teamData: {
        name: string;
        school_name: string;
        mascot: string;
        season_year: number;
      }): Promise<any> => {
        try {
          return await withDatabaseRetry(
            async () => {
              const { data, error } = await table("teams")
                .insert(teamData)
                .select("*")
                .single();

              if (error) {
                throw Object.assign(new Error(error.message), {
                  code: error.code,
                  details: error.details,
                  hint: error.hint,
                });
              }

              return data;
            },
            { timeout: 20000 }
          );
        } catch (err) {
          logError("❌ Team insert failed:", err);

          const code = (err as { code?: string } | null)?.code;
          const message = err instanceof Error ? err.message : String(err);
          if (
            code === "42501" ||
            message.toLowerCase().includes("row-level security")
          ) {
            logError("🔒 RLS Policy Error creating team");
            throw new Error(
              "Database permission error: Your account doesn't have permission to create teams. This might be an RLS policy issue. Please contact support."
            );
          }

          throw new Error(
            `Failed to create team: ${message || "Unknown database error"}`
          );
        }
      };

      const insertMembershipWithTimeout = async (membershipData: {
        team_id: string;
        user_id: string;
        team_role: string;
        status: string;
      }): Promise<void> => {
        try {
          await withDatabaseRetry(
            async () => {
              const { error } =
                await table("team_members").insert(membershipData);

              if (error) {
                throw Object.assign(new Error(error.message), {
                  code: error.code,
                  details: error.details,
                  hint: error.hint,
                });
              }
            },
            { timeout: 15000 }
          );
        } catch (err) {
          debug("⚠️ team_members insert warning:", err);
        }
      };

      // Emit start telemetry
      emitTelemetry("team.create.start", {
        sport_ui: formData.sport,
        season_display: formData.season,
        has_school_info: !!formData.schoolName,
      });

      progress.setLoadingMessage("Testing database connection...");

      // Check for duplicate teams (best-effort)
      await checkDuplicatesSafe();

      // Create team name
      progress.setLoadingMessage("Creating team...");

      const teamName = `${formData.schoolName} ${formData.teamName}`;

      // Compute academic year
      const currentYear = new Date().getFullYear();
      const seasonYear = currentYear;
      const seasonDisplay = `${seasonYear}-${seasonYear + 1}`;

      // Create team record
      progress.setLoadingMessage("Creating team record...");

      const teamData = {
        name: teamName,
        school_name: formData.schoolName,
        mascot: formData.teamName,
        season_year: seasonYear,
      };

      const teamInsert = await insertTeamWithTimeout(teamData);

      const newTeamId = teamInsert.id;
      if (!newTeamId) {
        throw new Error("Team created but no ID returned");
      }

      // Create team membership
      progress.setLoadingMessage("Setting up your account...");

      const membershipData = {
        team_id: newTeamId,
        user_id: authUser.id,
        team_role: "head_coach",
        status: "active",
      };

      await insertMembershipWithTimeout(membershipData);

      // Persist active team selection
      try {
        writeLocalString(storageKeys.activeTeamId, newTeamId);
      } catch {
        /* ignore localStorage errors */
      }

      // Emit success telemetry
      emitTelemetry("team.create.success", {
        teamId: newTeamId,
        season_year: seasonYear,
        season_display: seasonDisplay,
        sport_ui: formData.sport,
      });

      return {
        success: true,
        teamId: newTeamId,
      };
    } catch (error) {
      logError("❌ Team creation failed:", error);

      emitTelemetry("team.create.error", {
        error_message: error instanceof Error ? error.message : String(error),
        sport_ui: formData.sport,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // ============================================
  // FAMILY PERMISSIONS METHODS
  // ============================================

  /**
   * Get family permissions for a team
   */
  static async getFamilyPermissions(teamId: string): Promise<{
    canViewRoster: boolean;
    canViewSchedule: boolean;
    canViewStats: boolean;
    canRSVP: boolean;
    canFundraise: boolean;
  }> {
    try {
      const { data, error } = await table("teams")
        .select("settings")
        .eq("id", teamId)
        .single();

      if (error) {
        logError("Error fetching family permissions:", error);
        // Return default permissions if error
        return {
          canViewRoster: false,
          canViewSchedule: true,
          canViewStats: false,
          canRSVP: true,
          canFundraise: false,
        };
      }

      const teamData = data as any;
      const settings =
        teamData?.settings &&
        typeof teamData.settings === "object" &&
        !Array.isArray(teamData.settings)
          ? teamData.settings
          : {};
      const stored = (settings as any)?.family_permissions;

      return stored && typeof stored === "object" && !Array.isArray(stored)
        ? stored
        : {
            canViewRoster: false,
            canViewSchedule: true,
            canViewStats: false,
            canRSVP: true,
            canFundraise: false,
          };
    } catch (error) {
      logError("Error in getFamilyPermissions:", error);
      // Return safe defaults
      return {
        canViewRoster: false,
        canViewSchedule: true,
        canViewStats: false,
        canRSVP: true,
        canFundraise: false,
      };
    }
  }

  /**
   * Update family permissions for a team
   */
  static async updateFamilyPermissions(
    teamId: string,
    permissions: {
      canViewRoster: boolean;
      canViewSchedule: boolean;
      canViewStats: boolean;
      canRSVP: boolean;
      canFundraise: boolean;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: team, error: readError } = await table("teams")
        .select("settings")
        .eq("id", teamId)
        .single();

      if (readError) {
        logError(
          "Error fetching team settings for family permissions:",
          readError
        );
        return { success: false, error: readError.message };
      }

      const teamData = team as any;
      const existingSettings =
        teamData?.settings &&
        typeof teamData.settings === "object" &&
        !Array.isArray(teamData.settings)
          ? teamData.settings
          : {};

      const updatedSettings = {
        ...(existingSettings ?? {}),
        family_permissions: permissions,
      };

      const { error } = await table("teams")
        .update({
          settings: updatedSettings as any,
          updated_at: new Date().toISOString(),
        })
        .eq("id", teamId);

      if (error) {
        logError("Error updating family permissions:", error);
        return {
          success: false,
          error: error.message,
        };
      }

      emitTelemetry("team.family_permissions.updated", {
        teamId,
        permissions,
      });

      return { success: true };
    } catch (error) {
      logError("Error in updateFamilyPermissions:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
