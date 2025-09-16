/**
 * Team Related Tables
 * All tables related to teams, memberships, and team management
 *
 * Updated for Role System Overhaul (Migration 999)
 */

import type { TeamRole, Capability } from "../../roles";

export interface TeamTables {
  teams: {
    Row: {
      id: string;
      name: string;
      school_name: string | null;
      mascot: string | null;
      colors_primary: string | null;
      colors_secondary: string | null;
      logo_url: string | null;
      created_by: string;
      subscription_tier: "free" | "coach" | "team_premium" | null;
      subscription_expires_at: string | null;
      team_code: string | null;
      season_year: number | null;
      league_division: string | null;
      created_at: string | null;
      updated_at: string | null;
    };
    Insert: {
      id?: string;
      name: string;
      school_name?: string | null;
      mascot?: string | null;
      colors_primary?: string | null;
      colors_secondary?: string | null;
      logo_url?: string | null;
      created_by: string;
      subscription_tier?: "free" | "coach" | "team_premium" | null;
      subscription_expires_at?: string | null;
      team_code?: string | null;
      season_year?: number | null;
      league_division?: string | null;
      created_at?: string | null;
      updated_at?: string | null;
    };
    Update: {
      id?: string;
      name?: string;
      school_name?: string | null;
      mascot?: string | null;
      colors_primary?: string | null;
      colors_secondary?: string | null;
      logo_url?: string | null;
      created_by?: string;
      subscription_tier?: "free" | "coach" | "team_premium" | null;
      subscription_expires_at?: string | null;
      team_code?: string | null;
      season_year?: number | null;
      league_division?: string | null;
      created_at?: string | null;
      updated_at?: string | null;
    };
  };
  // Updated team_members table with new role system
  team_members: {
    Row: {
      id: string;
      team_id: string;
      user_id: string;
      role: "player" | "coach" | "family" | "admin" | null; // Legacy field - kept for migration safety
      team_role: TeamRole; // New standardized team role
      capabilities: Capability[]; // Granular permissions array
      role_notes: string | null; // Optional role description
      assigned_at: string; // When role was assigned
      status: "active" | "inactive" | "pending" | null; // Updated to use status instead of is_active
      permissions: Record<string, unknown> | null; // Legacy permissions field
      joined_at: string | null;
      invited_by: string | null;
    };
    Insert: {
      id?: string;
      team_id: string;
      user_id: string;
      role?: "player" | "coach" | "family" | "admin" | null; // Legacy field
      team_role?: TeamRole; // New standardized team role
      capabilities?: Capability[]; // Granular permissions array
      role_notes?: string | null;
      assigned_at?: string;
      status?: "active" | "inactive" | "pending" | null;
      permissions?: Record<string, unknown> | null;
      joined_at?: string | null;
      invited_by?: string | null;
    };
    Update: {
      id?: string;
      team_id?: string;
      user_id?: string;
      role?: "player" | "coach" | "family" | "admin" | null; // Legacy field
      team_role?: TeamRole; // New standardized team role
      capabilities?: Capability[]; // Granular permissions array
      role_notes?: string | null;
      assigned_at?: string;
      status?: "active" | "inactive" | "pending" | null;
      permissions?: Record<string, unknown> | null;
      joined_at?: string | null;
      invited_by?: string | null;
    };
  };
  team_memberships: {
    Row: {
      id: string;
      team_id: string;
      user_id: string;
      role: "player" | "coach" | "parent" | "admin" | null;
      status: "active" | "inactive" | "pending" | null;
      joined_at: string | null;
      created_at: string | null;
    };
    Insert: {
      id?: string;
      team_id: string;
      user_id: string;
      role?: "player" | "coach" | "parent" | "admin" | null;
      status?: "active" | "inactive" | "pending" | null;
      joined_at?: string | null;
      created_at?: string | null;
    };
    Update: {
      id?: string;
      team_id?: string;
      user_id?: string;
      role?: "player" | "coach" | "parent" | "admin" | null;
      status?: "active" | "inactive" | "pending" | null;
      joined_at?: string | null;
      created_at?: string | null;
    };
  };
  team_invites: {
    Row: {
      id: string;
      team_id: string;
      email: string;
      role: "player" | "coach" | "parent" | "admin" | null;
      status: "pending" | "accepted" | "declined" | "expired" | null;
      invited_by: string;
      expires_at: string | null;
      created_at: string | null;
    };
    Insert: {
      id?: string;
      team_id: string;
      email: string;
      role?: "player" | "coach" | "parent" | "admin" | null;
      status?: "pending" | "accepted" | "declined" | "expired" | null;
      invited_by: string;
      expires_at?: string | null;
      created_at?: string | null;
    };
    Update: {
      id?: string;
      team_id?: string;
      email?: string;
      role?: "player" | "coach" | "parent" | "admin" | null;
      status?: "pending" | "accepted" | "declined" | "expired" | null;
      invited_by?: string;
      expires_at?: string | null;
      created_at?: string | null;
    };
  };
  team_files: {
    Row: {
      id: string;
      team_id: string;
      uploaded_by: string;
      file_name: string;
      file_path: string;
      file_type: string;
      file_size_bytes: number | null;
      mime_type: string | null;
      description: string | null;
      is_public: boolean | null;
      download_count: number | null;
      created_at: string | null;
    };
    Insert: {
      id?: string;
      team_id: string;
      uploaded_by: string;
      file_name: string;
      file_path: string;
      file_type: string;
      file_size_bytes?: number | null;
      mime_type?: string | null;
      description?: string | null;
      is_public?: boolean | null;
      download_count?: number | null;
      created_at?: string | null;
    };
    Update: {
      id?: string;
      team_id?: string;
      uploaded_by?: string;
      file_name?: string;
      file_path?: string;
      file_type?: string;
      file_size_bytes?: number | null;
      mime_type?: string | null;
      description?: string | null;
      is_public?: boolean | null;
      download_count?: number | null;
      created_at?: string | null;
    };
  };
  team_goals: {
    Row: {
      id: string;
      team_id: string;
      title: string;
      description: string | null;
      target_date: string | null;
      is_completed: boolean | null;
      completion_date: string | null;
      created_by: string;
      priority: "low" | "medium" | "high" | "critical" | null;
      category: "team" | "individual" | "seasonal" | "game" | null;
      progress_percentage: number | null;
      assigned_to: string | null;
      created_at: string | null;
      updated_at: string | null;
    };
    Insert: {
      id?: string;
      team_id: string;
      title: string;
      description?: string | null;
      target_date?: string | null;
      is_completed?: boolean | null;
      completion_date?: string | null;
      created_by: string;
      priority?: "low" | "medium" | "high" | "critical" | null;
      category?: "team" | "individual" | "seasonal" | "game" | null;
      progress_percentage?: number | null;
      assigned_to?: string | null;
      created_at?: string | null;
      updated_at?: string | null;
    };
    Update: {
      id?: string;
      team_id?: string;
      title?: string;
      description?: string | null;
      target_date?: string | null;
      is_completed?: boolean | null;
      completion_date?: string | null;
      created_by?: string;
      priority?: "low" | "medium" | "high" | "critical" | null;
      category?: "team" | "individual" | "seasonal" | "game" | null;
      progress_percentage?: number | null;
      assigned_to?: string | null;
      created_at?: string | null;
      updated_at?: string | null;
    };
  };
  team_announcements: {
    Row: {
      id: string;
      team_id: string;
      title: string;
      content: string;
      created_by: string;
      is_pinned: boolean | null;
      expires_at: string | null;
      created_at: string | null;
    };
    Insert: {
      id?: string;
      team_id: string;
      title: string;
      content: string;
      created_by: string;
      is_pinned?: boolean | null;
      expires_at?: string | null;
      created_at?: string | null;
    };
    Update: {
      id?: string;
      team_id?: string;
      title?: string;
      content?: string;
      created_by?: string;
      is_pinned?: boolean | null;
      expires_at?: string | null;
      created_at?: string | null;
    };
  };
  team_posts: {
    Row: {
      id: string;
      team_id: string;
      author_id: string;
      title: string | null;
      content: string;
      post_type: "announcement" | "update" | "question" | "celebration" | null;
      tags: string[] | null;
      is_pinned: boolean | null;
      allows_comments: boolean | null;
      media_urls: string[] | null;
      visibility: "public" | "team_only" | "coaches_only" | null;
      scheduled_for: string | null;
      expires_at: string | null;
      created_at: string | null;
      updated_at: string | null;
    };
    Insert: {
      id?: string;
      team_id: string;
      author_id: string;
      title?: string | null;
      content: string;
      post_type?: "announcement" | "update" | "question" | "celebration" | null;
      tags?: string[] | null;
      is_pinned?: boolean | null;
      allows_comments?: boolean | null;
      media_urls?: string[] | null;
      visibility?: "public" | "team_only" | "coaches_only" | null;
      scheduled_for?: string | null;
      expires_at?: string | null;
      created_at?: string | null;
      updated_at?: string | null;
    };
    Update: {
      id?: string;
      team_id?: string;
      author_id?: string;
      title?: string | null;
      content?: string;
      post_type?: "announcement" | "update" | "question" | "celebration" | null;
      tags?: string[] | null;
      is_pinned?: boolean | null;
      allows_comments?: boolean | null;
      media_urls?: string[] | null;
      visibility?: "public" | "team_only" | "coaches_only" | null;
      scheduled_for?: string | null;
      expires_at?: string | null;
      created_at?: string | null;
      updated_at?: string | null;
    };
  };
}
