/**
 * Data Resolution Service - Phase 3 Implementation
 *
 * Clean service that determines what data to load based on dev mode.
 * Replaces the confusing mix of data sources throughout the app.
 *
 * Key principles:
 * - Single source of truth for data loading decisions
 * - Clear separ      if (!teams) return [];

      // Type guard for valid team data
      const isValidTeam = (team: unknown): team is Record<string, unknown> => {
        return !!(team && typeof team === "object" && "id" in team && "name" in team);
      };

      const validTeams = teams.filter(isValidTeam);

      // Return teams with proper typing
      return validTeams.map((team) => ({
        id: team.id as string,
        name: team.name as string,
        description: (team.description as string) || "",
        teamCode: (team.team_code as string) || "",
        subscriptionType: (team.subscription_tier as string) || "free",
        season: (team.season as string) || "",
        school: (team.school as string) || "",
        mascot: (team.mascot as string) || "",n real and mock data
 * - Easy testing and maintenance
 * - Super admin override for system owner (justindepierro@gmail.com)
 *
 * @version 3.0.0 - Phase 3 Clean Dev Modes
 * @author BoxCall Development Team
 */

import type {
  CleanDevMode,
  DataSource,
  PermissionContext,
  DataResolutionContext,
} from "../app/dev-mode-types-clean";

import { DEV_MODE_CONFIGS } from "../app/dev-mode-types-clean";
import { supabase } from "../lib/supabase";

// Define consistent data interfaces
interface TeamDataResponse {
  id: string;
  name: string;
  description?: string;
  team_code?: string;
  subscription_tier?: string;
  season?: string;
  school?: string;
  mascot?: string;
  [key: string]: unknown;
}

/**
 * Service that resolves what data to load based on current dev mode
 */
export class DataResolutionService {
  private static instance: DataResolutionService;

  public static getInstance(): DataResolutionService {
    if (!DataResolutionService.instance) {
      DataResolutionService.instance = new DataResolutionService();
    }
    return DataResolutionService.instance;
  }

  /**
   * Get data resolution context for current mode
   */
  public resolveDataContext(
    devMode: CleanDevMode,
    userId?: string,
    userEmail?: string
  ): DataResolutionContext {
    const config = DEV_MODE_CONFIGS[devMode];

    // Super admin override for system owner
    const isSuperAdminUser = userEmail === "justindepierro@gmail.com";

    return {
      dataSource: config.dataSource,
      permissionContext: isSuperAdminUser
        ? "super_admin"
        : config.permissionContext,
      uiMode: config.uiMode,
      userId,
      teamIds: this.getTeamIds(config.dataSource, userId),
      shouldShowDevTools: config.uiMode === "development",
      shouldUseMockData: this.shouldUseMockData(config.dataSource),
      shouldUseBlankSlate: config.dataSource === "empty",
    };
  }

  /**
   * Determine if we should load mock data
   */
  private shouldUseMockData(dataSource: DataSource): boolean {
    return dataSource === "legacy_mock" || dataSource === "dev_realistic";
  }

  /**
   * Get team IDs for data scoping
   */
  private getTeamIds(dataSource: DataSource, _userId?: string): string[] {
    switch (dataSource) {
      case "user_real":
        // Will be resolved by team membership queries
        return [];

      case "dev_realistic":
        // Professional dev profiles use consistent dev team
        return ["dev-team-eagles-2024"];

      case "legacy_mock":
        // Old mock system
        return ["mock-team-dev"];

      case "empty":
        // Blank slate has no teams
        return [];

      default:
        return [];
    }
  }

  /**
   * Get user profile data based on context
   */
  public async getUserProfile(
    context: DataResolutionContext,
    realUserId?: string
  ) {
    switch (context.dataSource) {
      case "user_real":
        return this.loadRealUserProfile(realUserId);

      case "dev_realistic":
        return this.loadDevProfile(context.permissionContext);

      case "legacy_mock":
        return this.loadLegacyMockProfile();

      case "empty":
        return this.loadEmptyProfile();

      default:
        return null;
    }
  }

  /**
   * Get team data based on context
   */
  public async getTeamData(
    context: DataResolutionContext,
    realUserId?: string
  ): Promise<TeamDataResponse[]> {
    switch (context.dataSource) {
      case "user_real":
        return this.loadRealTeamData(realUserId);

      case "dev_realistic":
        return this.loadDevTeamData();

      case "legacy_mock":
        return this.loadLegacyMockTeamData();

      case "empty":
        return [];

      default:
        return [];
    }
  }

  /**
   * Get achievements data based on context
   */
  public async getAchievements(
    context: DataResolutionContext,
    teamId?: string
  ) {
    switch (context.dataSource) {
      case "user_real":
        return this.loadRealAchievements(teamId);

      case "dev_realistic":
        return this.loadDevAchievements(context.permissionContext);

      case "legacy_mock":
        return this.loadLegacyMockAchievements();

      case "empty":
        return [];

      default:
        return [];
    }
  }

  /**
   * Get calendar events based on context
   */
  public async getCalendarEvents(
    context: DataResolutionContext,
    teamId?: string
  ) {
    switch (context.dataSource) {
      case "user_real":
        return this.loadRealCalendarEvents(teamId);

      case "dev_realistic":
        return this.loadDevCalendarEvents(context.permissionContext);

      case "legacy_mock":
        return this.loadLegacyMockCalendarEvents();

      case "empty":
        return [];

      default:
        return [];
    }
  }

  // ========================================
  // REAL DATA LOADERS
  // ========================================

  private async loadRealUserProfile(userId?: string) {
    if (!userId) return null;

    try {
      // Load from Supabase
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error loading real user profile:", error);
      return null;
    }
  }

  private async loadRealTeamData(userId?: string): Promise<TeamDataResponse[]> {
    if (!userId) return [];

    try {
      // First, get user's team memberships
      const { data: memberships, error: membershipError } = await supabase
        .from("team_members")
        .select("team_id, role")
        .eq("user_id", userId)
        .eq("status", "active");

      if (membershipError) {
        console.error("❌ Error loading team memberships:", membershipError);
        return [];
      }

      if (!memberships || memberships.length === 0) {
        return [];
      }

      // Type guard to ensure membership data is valid
      const isValidMembership = (
        m: unknown
      ): m is { team_id: string; role: string } => {
        return !!(m && typeof m === "object" && "team_id" in m);
      };

      const validMemberships = memberships.filter(isValidMembership);
      if (validMemberships.length === 0) {
        return [];
      }

      // Then, get the actual team data for those team IDs
      const teamIds = validMemberships.map(
        (m) => (m as unknown as { team_id: string }).team_id
      );
      const { data: teams, error: teamsError } = await supabase
        .from("teams")
        .select(
          `
          id,
          name,
          description,
          team_code,
          subscription_tier,
          season,
          school,
          mascot
        `
        )
        .in("id", teamIds);

      if (teamsError) {
        console.error("❌ Error loading teams:", teamsError);
        return [];
      }

      if (!teams) return [];

      // Type guard for valid team data
      const isValidTeam = (team: unknown): team is Record<string, unknown> => {
        return !!(
          team &&
          typeof team === "object" &&
          "id" in team &&
          "name" in team
        );
      };

      const validTeams = teams.filter(isValidTeam);

      // Return teams with proper typing using type assertion
      return validTeams.map((team) => {
        const typedTeam = team as unknown as TeamDataResponse;
        return {
          id: typedTeam.id,
          name: typedTeam.name,
          description: typedTeam.description || "",
          team_code: typedTeam.team_code || "",
          subscription_tier: typedTeam.subscription_tier || "",
          season: typedTeam.season || "",
          school: typedTeam.school || "",
          mascot: typedTeam.mascot || "",
        };
      });
    } catch (error) {
      console.error("Error loading real team data:", error);
      return [];
    }
  }

  private async loadRealAchievements(teamId?: string) {
    if (!teamId) return [];

    try {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .eq("team_id", teamId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error loading real achievements:", error);
      return [];
    }
  }

  private async loadRealCalendarEvents(teamId?: string) {
    if (!teamId) return [];

    try {
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("team_id", teamId)
        .order("event_date", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error loading real calendar events:", error);
      return [];
    }
  }

  // ========================================
  // DEV PROFILE DATA LOADERS
  // ========================================

  private async loadDevProfile(permissionContext: PermissionContext) {
    // Load realistic dev profiles based on permission context
    const devProfiles = {
      head_coach: {
        id: "dev-user-head-coach",
        first_name: "Sarah",
        last_name: "Martinez",
        email: "dev_head_coach@boxcall.dev",
        role: "head_coach",
        phone: "(555) 123-4567",
        years_experience: "8",
        coaching_level: "High School Varsity",
      },
      assistant_coach: {
        id: "dev-user-assistant-coach",
        first_name: "Mike",
        last_name: "Johnson",
        email: "dev_assistant_coach@boxcall.dev",
        role: "assistant_coach",
        phone: "(555) 234-5678",
        years_experience: "4",
        coaching_level: "High School",
      },
      player: {
        id: "dev-user-player",
        first_name: "Alex",
        last_name: "Thompson",
        email: "dev_player@boxcall.dev",
        role: "player",
        jersey_number: 15,
        position: "Quarterback",
        grade: 12,
        height: "6'2\"",
        weight: 195,
      },
      manager: {
        id: "dev-user-manager",
        first_name: "Jennifer",
        last_name: "Smith",
        email: "dev_manager@boxcall.dev",
        role: "manager",
        phone: "(555) 345-6789",
        responsibilities: "Equipment, Travel, Stats",
      },
      family: {
        id: "dev-user-family",
        first_name: "David",
        last_name: "Thompson",
        email: "dev_family@boxcall.dev",
        role: "family",
        relationship: "Father of Alex Thompson (#15)",
        phone: "(555) 456-7890",
      },
      super_admin: {
        id: "dev-user-super-admin",
        first_name: "Jessica",
        last_name: "Chen",
        email: "dev_super_admin@boxcall.dev",
        role: "super_admin",
        phone: "(555) 567-8901",
        admin_level: "System Administrator",
      },
    } as const;

    // Handle different permission contexts safely
    if (permissionContext in devProfiles) {
      return devProfiles[permissionContext as keyof typeof devProfiles];
    }

    // Default fallback
    return devProfiles.head_coach;
  }

  private async loadDevTeamData(): Promise<TeamDataResponse[]> {
    // Professional dev team data
    return [
      {
        id: "dev-team-eagles-2024",
        name: "Eastside Eagles",
        description: "High School Varsity Football - Development Team",
        team_code: "EAGLES2024",
        subscription_tier: "team_premium",
        season: "2024-2025",
        school: "Eastside High School",
        mascot: "Eagles",
        colors: ["Navy Blue", "Gold"],
        established: "2018",
      },
    ];
  }

  private async loadDevAchievements(permissionContext: PermissionContext) {
    // Role-appropriate achievements
    const baseAchievements = [
      {
        id: "dev-achievement-1",
        title: "Championship Game Victory",
        description: "Defeated Central High 28-21 in overtime",
        type: "team_win",
        date: "2024-11-15",
        players_involved: ["Alex Thompson", "Marcus Williams", "Jake Davis"],
      },
      {
        id: "dev-achievement-2",
        title: "Perfect Season Record",
        description: "10-0 regular season record",
        type: "season_milestone",
        date: "2024-11-01",
        players_involved: [],
      },
    ];

    // Add role-specific achievements
    if (permissionContext === "player") {
      baseAchievements.push({
        id: "dev-achievement-player-1",
        title: "300+ Passing Yards",
        description: "Personal best performance vs. North High",
        type: "individual",
        date: "2024-10-18",
        players_involved: ["Alex Thompson"],
      });
    }

    return baseAchievements;
  }

  private async loadDevCalendarEvents(permissionContext: PermissionContext) {
    const baseEvents = [
      {
        id: "dev-event-1",
        title: "Practice - Offensive Line",
        type: "practice",
        date: "2024-08-05",
        time: "15:30",
        location: "Main Field",
        required_attendees: ["head_coach", "assistant_coach", "player"],
      },
      {
        id: "dev-event-2",
        title: "Game vs. North High",
        type: "game",
        date: "2024-08-09",
        time: "19:00",
        location: "North High Stadium",
        required_attendees: [
          "head_coach",
          "assistant_coach",
          "player",
          "manager",
        ],
      },
      {
        id: "dev-event-3",
        title: "Team Meeting - Season Goals",
        type: "meeting",
        date: "2024-08-06",
        time: "16:00",
        location: "Locker Room",
        required_attendees: ["head_coach", "assistant_coach", "player"],
      },
    ];

    // Filter events based on permission context
    return baseEvents.filter(
      (event) =>
        event.required_attendees.includes(permissionContext) ||
        permissionContext === "super_admin"
    );
  }

  // ========================================
  // LEGACY MOCK DATA LOADERS
  // ========================================

  private async loadLegacyMockProfile() {
    // Return the old mock profile for backward compatibility
    return {
      id: "mock-user-admin",
      first_name: "Mock",
      last_name: "Admin",
      email: "mock@boxcall.dev",
      role: "super_admin",
    };
  }

  private async loadLegacyMockTeamData(): Promise<TeamDataResponse[]> {
    // Return old mock team data for backward compatibility
    return [
      {
        id: "mock-team-dev",
        name: "Mock Development Team",
        description: "Legacy mock team for backward compatibility",
        team_code: "MOCK2024",
        subscription_tier: "team_premium",
        season: "2024-2025",
        school: "Mock High School",
        mascot: "Developers",
      },
    ];
  }

  private async loadLegacyMockAchievements() {
    // Return old mock achievements
    return [
      {
        id: "mock-achievement-1",
        title: "Mock Championship",
        description: "Legacy mock achievement",
        type: "legacy",
        date: "2024-01-01",
      },
    ];
  }

  private async loadLegacyMockCalendarEvents() {
    // Return old mock calendar events
    return [
      {
        id: "mock-event-1",
        title: "Mock Practice",
        type: "practice",
        date: "2024-08-05",
        time: "15:30",
      },
    ];
  }

  // ========================================
  // EMPTY STATE LOADERS
  // ========================================

  private async loadEmptyProfile() {
    // Return minimal profile for blank slate
    return {
      id: "blank-slate-user",
      first_name: "New",
      last_name: "Coach",
      email: "newcoach@example.com",
      role: "new_user",
    };
  }
}

export default DataResolutionService;
