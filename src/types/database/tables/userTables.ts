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
      role: AppRole; // Legacy role field (kept for backward compatibility)
      app_role:
        | "admin"
        | "head_coach"
        | "coach"
        | "free_coach"
        | "player"
        | "family"; // New app-level role system
      is_admin: boolean; // Simple admin boolean check
      bio: string | null;
      phone: string | null;
      email: string | null;
      display_name: string | null;
      address: string | null;
      settings: Json | null;
      last_login: string | null;
      created_at: string;
      updated_at: string;
      subscription_tier: string | null; // 'free', 'premium', etc.
      subscription_expires_at: string | null;
      // Enhanced fields for Phase 1 (Athletic Information)
      position: string | null;
      jersey_number: number | null;
      emergency_contact: string | null;
      emergency_phone: string | null;
      grade_level: string | null;
      height_inches: number | null;
      weight_lbs: number | null;
      // Enhanced fields for Phase 2 (Coaching Information)
      coaching_experience: string | null;
      education: string | null;
      certifications: string | null;
      coaching_philosophy: string | null;
      specializations: string | null;
      current_school: string | null;
      previous_schools: string | null;
      mentors: string | null;
      coaching_system: string | null;
      years_coaching: number | null;
      // Social Media Links
      social_twitter: string | null;
      social_instagram: string | null;
      social_linkedin: string | null;
      social_tiktok: string | null;
      social_youtube: string | null;
      personal_website: string | null;
      is_active: boolean | null;
      notification_preferences: Json | null;
    };
    Insert: {
      id: string; // References auth.users.id
      full_name?: string | null;
      avatar_url?: string | null;
      role?: AppRole; // Legacy role field (kept for backward compatibility)
      app_role?:
        | "admin"
        | "head_coach"
        | "coach"
        | "free_coach"
        | "player"
        | "family"; // New app-level role system
      is_admin?: boolean; // Simple admin boolean check
      bio?: string | null;
      phone?: string | null;
      email?: string | null;
      display_name?: string | null;
      address?: string | null;
      settings?: Json | null;
      last_login?: string | null;
      created_at?: string;
      updated_at?: string;
      subscription_tier?: string | null; // 'free', 'premium', etc.
      subscription_expires_at?: string | null;
      position?: string | null;
      jersey_number?: number | null;
      emergency_contact?: string | null;
      emergency_phone?: string | null;
      grade_level?: string | null;
      height_inches?: number | null;
      weight_lbs?: number | null;
      // Enhanced fields for Phase 2 (Coaching Information)
      coaching_experience?: string | null;
      education?: string | null;
      certifications?: string | null;
      coaching_philosophy?: string | null;
      specializations?: string | null;
      current_school?: string | null;
      previous_schools?: string | null;
      mentors?: string | null;
      coaching_system?: string | null;
      years_coaching?: number | null;
      // Social Media Links
      social_twitter?: string | null;
      social_instagram?: string | null;
      social_linkedin?: string | null;
      social_tiktok?: string | null;
      social_youtube?: string | null;
      personal_website?: string | null;
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
      position?: string | null;
      jersey_number?: number | null;
      emergency_contact?: string | null;
      emergency_phone?: string | null;
      grade_level?: string | null;
      height_inches?: number | null;
      weight_lbs?: number | null;
      // Enhanced fields for Phase 2 (Coaching Information)
      coaching_experience?: string | null;
      education?: string | null;
      certifications?: string | null;
      coaching_philosophy?: string | null;
      specializations?: string | null;
      current_school?: string | null;
      previous_schools?: string | null;
      mentors?: string | null;
      coaching_system?: string | null;
      years_coaching?: number | null;
      // Social Media Links
      social_twitter?: string | null;
      social_instagram?: string | null;
      social_linkedin?: string | null;
      social_tiktok?: string | null;
      social_youtube?: string | null;
      personal_website?: string | null;
      is_active?: boolean | null;
      notification_preferences?: Json | null;
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
