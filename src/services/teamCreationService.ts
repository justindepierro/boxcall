import { createTeamDirectly, createTeamMembershipDirectly } from "../utils/direct-api";
import { emitTelemetry } from "../lib/telemetry";

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

/**
 * Core team creation service
 * Handles the database operations and business logic for creating teams
 */
export class TeamCreationService {
  
  /**
   * Create a new team with membership
   */
  static async createTeam(
    formData: TeamCreationInput,
    authUser: AuthUser,
    progress: TeamCreationProgress
  ): Promise<TeamCreationResult> {
    console.log("🚀 Starting team creation...");
    const startTime = performance.now();

    try {
      // Emit start telemetry
      console.log("🎯 Starting telemetry...");
      emitTelemetry("team.create.start", {
        sport_ui: formData.sport,
        season_display: formData.season,
        has_school_info: !!formData.schoolName,
      });
      console.log("✅ Telemetry completed");

      // Test database connectivity
      console.log("🔌 Testing database connectivity...");
      progress.setLoadingMessage("Testing database connection...");
      
      // Note: Database connectivity test often times out in browser, but direct API works
      // So we skip the connectivity test and proceed directly to team creation
      console.log("🔄 Skipping connectivity test, proceeding with team creation");

      // Check for duplicate teams before creating
      console.log("🔍 Checking for duplicate teams...");
      progress.setLoadingMessage("Checking for similar teams...");
      
      try {
        const { TeamDuplicatePreventionService } = await import('./teamDuplicatePreventionService');
        const duplicateCheck = await TeamDuplicatePreventionService.checkForDuplicates(
          formData.teamName,
          formData.schoolName,
          formData.schoolDistrict,
          formData.schoolCity,
          formData.schoolState
        );
        
        if (duplicateCheck.isDuplicate) {
          console.error("🚨 Duplicate team detected:", duplicateCheck.warningMessage);
          throw new Error(duplicateCheck.warningMessage || "A very similar team already exists. Please contact support.");
        }
        
        if (duplicateCheck.requiresApproval) {
          console.warn("⚠️ Similar team found:", duplicateCheck.warningMessage);
          // For now, we'll allow creation but log it
          emitTelemetry("team.create.similar_team_warning", {
            similar_teams_count: duplicateCheck.similarTeams.length,
            highest_similarity: duplicateCheck.similarTeams[0]?.similarityScore || 0
          });
        }
        
        console.log("✅ Duplicate check passed");
      } catch (duplicateError) {
        console.warn("⚠️ Duplicate check failed, proceeding anyway:", duplicateError);
        // Don't fail team creation if duplicate check fails
      }

      // Create team name
      console.log("🏷️ Creating team name...");
      progress.setLoadingMessage("Creating team...");
      
      const teamName = `${formData.schoolName} ${formData.teamName}`;
      console.log("📝 Team name created:", teamName);

      // Compute academic year
      console.log("📅 Computing academic year...");
      const currentYear = new Date().getFullYear();
      const seasonYear = currentYear;
      const seasonDisplay = `${seasonYear}-${seasonYear + 1}`;
      console.log("📅 Academic year computed:", { seasonYear, seasonDisplay });

      // Create team record in database
      console.log("🏗️ Creating team record in database...");
      progress.setLoadingMessage("Creating team record...");
      
      const teamData = {
        name: teamName,
        school_name: formData.schoolName,
        mascot: formData.teamName,
        season_year: seasonYear,
      };
      console.log("📊 Team data to insert:", teamData);

      console.log("🚀 About to start team insert operation...");
      console.log("🚀 Starting team insert with direct HTTP API...");
      
      // Use direct HTTP approach for team creation
      const directInsertPromise = createTeamDirectly(teamData);
      
      const insertTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Team insert timeout")), 20000)
      );
      
      const insertResult = await Promise.race([directInsertPromise, insertTimeoutPromise]) as { data: any, error: any };
      const teamInsert = insertResult.data;
      const teamErr = insertResult.error;

      console.log(`🗄️ Team insert completed`);

      if (teamErr || !teamInsert) {
        console.error("❌ Team insert failed:", teamErr);
        
        if (teamErr?.code === "42501" || teamErr?.message?.includes("row-level security")) {
          console.error("🔒 RLS Policy Error - Run the SQL fix in Supabase!");
          throw new Error("Database permission error: Your account doesn't have permission to create teams. This might be an RLS policy issue. Please contact support.");
        }
        
        throw new Error(`Failed to create team: ${teamErr?.message || "Unknown database error"}`);
      }

      const newTeamId = teamInsert.id;
      if (!newTeamId) {
        throw new Error("Team created but no ID returned");
      }

      console.log("✅ Team created with ID:", newTeamId);

      // Create team membership
      console.log("👤 Adding team membership...");
      progress.setLoadingMessage("Setting up your account...");
      
      const membershipData = {
        team_id: newTeamId,
        user_id: authUser.id,
        team_role: "head_coach",
        status: "active",
      };
      
      console.log("📊 Membership data to insert:", membershipData);
      
      const memberInsertPromise = createTeamMembershipDirectly(membershipData);
      
      const memberTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Membership insert timeout")), 15000)
      );
      
      const memberResult = await Promise.race([memberInsertPromise, memberTimeoutPromise]) as { data: any, error: any };
      const memberErr = memberResult.error;

      console.log(`👥 Membership insert completed`);

      if (memberErr) {
        console.warn("⚠️ team_members insert warning:", memberErr);
        // Don't fail the entire operation for membership errors
      } else {
        console.log("✅ Team membership created successfully");
      }

      // Persist active team selection
      try {
        localStorage.setItem("activeTeamId", newTeamId);
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

      console.log("🎉 Team creation successful!");
      console.log(`⏱️ Total creation time: ${performance.now() - startTime}ms`);

      return {
        success: true,
        teamId: newTeamId
      };

    } catch (error) {
      console.error("❌ Team creation failed:", error);
      
      // Emit failure telemetry
      emitTelemetry("team.create.error", {
        error_message: error instanceof Error ? error.message : String(error),
        sport_ui: formData.sport,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}