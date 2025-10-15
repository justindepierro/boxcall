/**
 * BoxCall Database Types - Modular Architecture
 * Generated from actual schema on 2025-08-01
 *
 * This modular structure provides:
 * - Better organization by domain
 * - Faster TypeScript compilation
 * - Easier maintenance and updates
 * - Clear separation of concerns
 */

// Domain-specific types - Phase 2 Complete System
export * from "./gamePlanningTypes";
export * from "./practicePlanningTypes";
export * from "./playerPerformanceTypes";
export * from "./teamManagementTypes";

// Core types - defined locally to avoid circular imports
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Table type imports
import type { PracticeGameTables } from "./tables/practiceGameTables";
import type { SocialTables } from "./tables/socialTables";
import type { TeamTables } from "./tables/teamTables";
import type { UserTables } from "./tables/userTables";

// Complete Database interface
export interface Database {
  public: {
    Tables: UserTables & TeamTables & PracticeGameTables & SocialTables;
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_formation_variants: {
        Args: {
          formation_id: string;
        };
        Returns: {
          id: string;
          playbook_id: string;
          name: string;
          description: string | null;
          category: string | null;
          personnel_id: string | null;
          personnel_name: string | null;
          base_formation_id: string | null;
          direction: "base" | "left" | "right";
          strength_player_position: string | null;
          strength_player_label: string | null;
          player_positions: Json;
          tags: string[];
          is_custom: boolean;
          usage_count: number;
          created_by: string;
          created_at: string;
          updated_at: string;
        }[];
      };
    };
    Enums: {
      user_role: "player" | "coach" | "family" | "admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

/**
 * Utility types for working with database tables
 */
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Inserts<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type Updates<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Convenience type exports for easy importing - UPDATED FOR PHASE 1
export type Achievement = Tables<"achievements">;
export type Game = Tables<"games">;
export type HelmetSticker = Tables<"helmet_stickers">;
export type Playbook = Tables<"playbooks">;
export type Play = Tables<"plays">;
export type PlayCall = Tables<"play_calls">;
export type PostComment = Tables<"post_comments">;
export type PostReaction = Tables<"post_reactions">;
export type PracticeScript = Tables<"practice_scripts">;
export type Profile = Tables<"profiles">;
export type ScriptPlay = Tables<"script_plays">;
export type SuperAdmin = Tables<"super_admins">;
export type TeamAnnouncement = Tables<"team_announcements">;
export type TeamFile = Tables<"team_files">;
export type TeamGoal = Tables<"team_goals">;
export type TeamInvite = Tables<"team_invites">;
export type TeamMember = Tables<"team_members">;
export type TeamMembership = Tables<"team_memberships">;
export type TeamPost = Tables<"team_posts">;
export type Team = Tables<"teams">;
export type TeamPlayer = Tables<"team_players">;
export type UserProfile = Tables<"user_profiles">;

// 🔥 PHASE 1 CRITICAL TABLES - NEW EXPORTS
export type CalendarEvent = Tables<"calendar_events">;
export type PracticeSchedule = Tables<"practice_schedules">;
export type PracticeAttendance = Tables<"practice_attendance">;
export type Equipment = Tables<"equipment">;

// 🔥 PERSONNEL SYSTEM TABLES - NEW EXPORTS
export type PersonnelConfiguration = Tables<"personnel_configurations">;
export type PersonnelPlayer = Tables<"personnel_players">;

// 🔥 FORMATION SYSTEM TABLES - NEW EXPORTS
export type Formation = Tables<"formations">;

// Insert types
export type AchievementInsert = Inserts<"achievements">;
export type GameInsert = Inserts<"games">;
export type HelmetStickerInsert = Inserts<"helmet_stickers">;
export type PlaybookInsert = Inserts<"playbooks">;
export type PlayInsert = Inserts<"plays">;
export type PlayCallInsert = Inserts<"play_calls">;
export type PostCommentInsert = Inserts<"post_comments">;
export type PostReactionInsert = Inserts<"post_reactions">;
export type PracticeScriptInsert = Inserts<"practice_scripts">;
export type ProfileInsert = Inserts<"profiles">;
export type ScriptPlayInsert = Inserts<"script_plays">;
export type SuperAdminInsert = Inserts<"super_admins">;
export type TeamAnnouncementInsert = Inserts<"team_announcements">;
export type TeamFileInsert = Inserts<"team_files">;
export type TeamGoalInsert = Inserts<"team_goals">;
export type TeamInviteInsert = Inserts<"team_invites">;
export type TeamMemberInsert = Inserts<"team_members">;
export type TeamMembershipInsert = Inserts<"team_memberships">;
export type TeamPlayerInsert = Inserts<"team_players">;
export type TeamPostInsert = Inserts<"team_posts">;

// 🔥 PHASE 1 CRITICAL INSERT TYPES - NEW EXPORTS
export type CalendarEventInsert = Inserts<"calendar_events">;
export type PracticeScheduleInsert = Inserts<"practice_schedules">;
export type PracticeAttendanceInsert = Inserts<"practice_attendance">;
export type EquipmentInsert = Inserts<"equipment">;

// 🔥 PERSONNEL SYSTEM INSERT TYPES - NEW EXPORTS
export type PersonnelConfigurationInsert = Inserts<"personnel_configurations">;
export type PersonnelPlayerInsert = Inserts<"personnel_players">;

// 🔥 PHASE 1 UPDATE TYPES - NEW EXPORTS
export type CalendarEventUpdate = Updates<"calendar_events">;
export type PracticeScheduleUpdate = Updates<"practice_schedules">;
export type PracticeAttendanceUpdate = Updates<"practice_attendance">;
export type EquipmentUpdate = Updates<"equipment">;

// 🔥 PERSONNEL SYSTEM UPDATE TYPES - NEW EXPORTS
export type PersonnelConfigurationUpdate = Updates<"personnel_configurations">;
export type PersonnelPlayerUpdate = Updates<"personnel_players">;
export type TeamInsert = Inserts<"teams">;
export type UserProfileInsert = Inserts<"user_profiles">;

// Update types
export type AchievementUpdate = Updates<"achievements">;
export type GameUpdate = Updates<"games">;
export type HelmetStickerUpdate = Updates<"helmet_stickers">;
export type PlaybookUpdate = Updates<"playbooks">;
export type PlayUpdate = Updates<"plays">;
export type PlayCallUpdate = Updates<"play_calls">;
export type PostCommentUpdate = Updates<"post_comments">;
export type PostReactionUpdate = Updates<"post_reactions">;
export type PracticeScriptUpdate = Updates<"practice_scripts">;
export type ProfileUpdate = Updates<"profiles">;
export type ScriptPlayUpdate = Updates<"script_plays">;
export type SuperAdminUpdate = Updates<"super_admins">;
export type TeamAnnouncementUpdate = Updates<"team_announcements">;
export type TeamFileUpdate = Updates<"team_files">;
export type TeamGoalUpdate = Updates<"team_goals">;
export type TeamInviteUpdate = Updates<"team_invites">;
export type TeamMemberUpdate = Updates<"team_members">;
export type TeamMembershipUpdate = Updates<"team_memberships">;
export type TeamPlayerUpdate = Updates<"team_players">;
export type TeamPostUpdate = Updates<"team_posts">;
export type TeamUpdate = Updates<"teams">;
export type UserProfileUpdate = Updates<"user_profiles">;

// Re-export table types for direct access
export type { UserTables } from "./tables/userTables";
export type { TeamTables } from "./tables/teamTables";
export type { PracticeGameTables } from "./tables/practiceGameTables";
export type { SocialTables } from "./tables/socialTables";

// Export specialized Phase 2 types
export * from "./gamePlanningTypes";

// =============================================================================
// PHASE 2 COMBINED SERVICE INTERFACES
// =============================================================================

import type { PracticePlanningService } from "./practicePlanningTypes";
import type { PlayerPerformanceService } from "./playerPerformanceTypes";
import type { TeamManagementService } from "./teamManagementTypes";

/**
 * Complete Phase 2 Database Services Interface
 * Combines all major system services for enterprise-grade team management
 */
export interface Phase2DatabaseServices {
  practicePlanning: PracticePlanningService;
  playerPerformance: PlayerPerformanceService;
  teamManagement: TeamManagementService;
}

// =============================================================================
// PHASE 2 COMMON UTILITY TYPES
// =============================================================================

/**
 * Standard database entity structure
 */
export interface Phase2BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Team-scoped entity structure
 */
export interface Phase2TeamScopedEntity extends Phase2BaseEntity {
  team_id: string;
}

/**
 * User-scoped entity structure
 */
export interface Phase2UserScopedEntity extends Phase2BaseEntity {
  user_id: string;
}

/**
 * Standard pagination parameters for Phase 2
 */
export interface Phase2PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Standard pagination response for Phase 2
 */
export interface Phase2PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Standard API response structure for Phase 2
 */
export interface Phase2ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}
