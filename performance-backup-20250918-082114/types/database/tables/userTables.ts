/**
 * User Related Tables
 * All tables related to users, profiles, and authentication
 *
 * Updated for Role System Overhaul (Migration 999)
 */

import type { AppRole } from "../../roles";

// Define Json type locally for this module
type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface UserTables {
  // 🔥 CRITICAL: Enhanced Profiles table (required by dashboardService.ts)
  // Updated for unified role system
  profiles: {
    Row: {
      id: string; // References auth.users.id
      full_name: string | null;
      avatar_url: string | null;
      role: AppRole; // Updated to use standardized AppRole enum
      bio: string | null;
      phone: string | null;
      email: string | null;
      display_name: string | null;
      address: string | null;
      settings: Json | null;
      last_login: string | null;
      created_at: string;
      updated_at: string;
      // Enhanced fields for Phase 1
      position: string | null;
      jersey_number: number | null;
      is_active: boolean | null;
      notification_preferences: Json | null;
    };
    Insert: {
      id: string; // References auth.users.id
      full_name?: string | null;
      avatar_url?: string | null;
      role?: AppRole; // Updated to use standardized AppRole enum
      bio?: string | null;
      phone?: string | null;
      email?: string | null;
      display_name?: string | null;
      address?: string | null;
      settings?: Json | null;
      last_login?: string | null;
      created_at?: string;
      updated_at?: string;
      position?: string | null;
      jersey_number?: number | null;
      is_active?: boolean | null;
      notification_preferences?: Json | null;
    };
    Update: {
      id?: string;
      full_name?: string | null;
      avatar_url?: string | null;
      role?: AppRole | null; // Updated to use standardized AppRole enum
      bio?: string | null;
      phone?: string | null;
      created_at?: string | null;
      email?: string | null;
      display_name?: string | null;
      address?: string | null;
      settings?: Json | null;
      last_login?: string | null;
      updated_at?: string | null;
    };
  };
  user_profiles: {
    Row: {
      id: string;
      user_id: string;
      display_name: string | null;
      avatar_url: string | null;
      phone: string | null;
      emergency_contact: string | null;
      emergency_phone: string | null;
      position: string | null;
      jersey_number: number | null;
      grade_level: string | null;
      height_inches: number | null;
      weight_lbs: number | null;
      created_at: string | null;
      updated_at: string | null;
    };
    Insert: {
      id?: string;
      user_id: string;
      display_name?: string | null;
      avatar_url?: string | null;
      phone?: string | null;
      emergency_contact?: string | null;
      emergency_phone?: string | null;
      position?: string | null;
      jersey_number?: number | null;
      grade_level?: string | null;
      height_inches?: number | null;
      weight_lbs?: number | null;
      created_at?: string | null;
      updated_at?: string | null;
    };
    Update: {
      id?: string;
      user_id?: string;
      display_name?: string | null;
      avatar_url?: string | null;
      phone?: string | null;
      emergency_contact?: string | null;
      emergency_phone?: string | null;
      position?: string | null;
      jersey_number?: number | null;
      grade_level?: string | null;
      height_inches?: number | null;
      weight_lbs?: number | null;
      created_at?: string | null;
      updated_at?: string | null;
    };
  };
  super_admins: {
    Row: {
      id: string;
      user_id: string;
      email: string;
      admin_level: "super_admin" | "admin" | "moderator" | null;
      permissions: Json | null;
      added_by: string | null;
      created_at: string | null;
      updated_at: string | null;
    };
    Insert: {
      id?: string;
      user_id: string;
      email: string;
      admin_level?: "super_admin" | "admin" | "moderator" | null;
      permissions?: Json | null;
      added_by?: string | null;
      created_at?: string | null;
      updated_at?: string | null;
    };
    Update: {
      id?: string;
      user_id?: string;
      email?: string;
      admin_level?: "super_admin" | "admin" | "moderator" | null;
      permissions?: Json | null;
      added_by?: string | null;
      created_at?: string | null;
      updated_at?: string | null;
    };
  };
}
