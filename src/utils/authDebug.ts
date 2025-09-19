/**
 * Auth Debug Utility
 * Check what users exist in profiles table and help debug auth issues
 */

import { supabase } from "../lib/supabase";

export class AuthDebug {
  /**
   * Check what profiles exist in the database
   */
  static async checkProfiles(): Promise<void> {
    try {
      // console.info("🔍 Checking profiles in database...");

      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, created_at");

      if (error) {
        // console.error("❌ Error fetching profiles:", error);
        return;
      }

      // console.info("👥 Profiles in database:");
      if (profiles && profiles.length > 0) {
        // console.info(`✅ Found ${profiles.length} profile(s):`);
        profiles.forEach((_profile) => {
          // console.info(`  - ${_profile.full_name || "No Name"} (${_profile.email || "No Email"}) - Role: ${_profile.role}`)
        });
      } else {
        // console.info("⚠️ No profiles found in database!");
        // console.info("💡 You need to register a user account first");
      }
    } catch (_error) {
      // console.error("❌ AuthDebug.checkProfiles failed:", _error);
    }
  }

  /**
   * Check current auth session
   */
  static async checkAuthSession(): Promise<void> {
    try {
      // console.info("🔍 Checking current auth session...");

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        // console.error("❌ Error getting session:", error);
        return;
      }

      if (session) {
        // console.info("✅ Active session found:");
        // console.info("  - User ID:", session.user.id);
        // console.info("  - Email:", session.user.email);
        // console.info("  - Role:", session.user.role);
      } else {
        // console.info("⚠️ No active session - user not logged in");
      }
    } catch (_error) {
      // console.error("❌ AuthDebug.checkAuthSession failed:", _error);
    }
  }

  /**
   * Create a test user (for development only)
   */
  static async createTestUser(): Promise<void> {
    try {
      // console.info("🧪 Creating test user...");

      const testEmail = "coachd@boxcallapp.com";
      const testPassword = "testpassword123";

      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            full_name: "Coach Demo",
            role: "coach",
          },
        },
      });

      if (error) {
        // console.error("❌ Error creating test user:", error.message);
        return;
      }

      if (data.user) {
        // console.info("✅ Test user created successfully!");
        // console.info("  - Email:", data.user.email);
        // console.info("  - ID:", data.user.id);
        // console.info("💡 You can now login with:", testEmail);
      }
    } catch (_error) {
      // console.error("❌ AuthDebug.createTestUser failed:", _error);
    }
  }

  /**
   * Run all debug checks
   */
  static async runAllChecks(): Promise<void> {
    // console.info("🚀 Running auth debug checks...");
    // console.info("=====================================");

    await this.checkAuthSession();
    // console.info("-------------------------------------");

    await this.checkProfiles();
    // console.info("=====================================");
  }

  /**
   * Check auth setup (supabase.auth)
   */
  static async checkAuthSetup(): Promise<void> {
    try {
      // console.info("🔧 Checking auth setup...");

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        // console.error("❌ Error fetching session:", error);
        return;
      }

      if (session) {
        // console.info("✅ Auth setup seems OK.");
      }
    } catch (_error) {
      // console.error("❌ Error during auth debug check:", _error);
    }
  }

  /**
   * Sign out the current user
   */
  static async signOutUser(): Promise<void> {
    try {
      // console.info("Attempting to sign out...");
      await supabase.auth.signOut();
      // console.info("✅ Sign out successful.");
    } catch (_error) {
      // console.error("❌ Error signing out:", _error);
    }
  }

  /**
   * Check all teams in the database
   */
  static async checkTeams(): Promise<void> {
    try {
      // console.info("🔍 Checking teams in database...");

      const { data: teams, error: teamsError } = await supabase
        .from("teams")
        .select("id, name, sport, created_at");

      if (teamsError) {
        // console.error("❌ Error fetching teams:", teamsError);
        return;
      }

      if (teams && teams.length > 0) {
        // console.info(`✅ Found ${teams.length} team(s):`);
        teams.forEach((_team) => {
          // console.info(`  - ${_team.name} (${_team.sport})`);
        });
      } else {
        // console.info("⚠️ No teams found in database!");
        // console.info("💡 You need to create a team first");
      }
    } catch (_error) {
      // console.error("❌ Error during team check:", _error);
    }
  }
}

// Make it available globally for console debugging
if (typeof window !== "undefined") {
  (window as typeof window & { AuthDebug: typeof AuthDebug }).AuthDebug =
    AuthDebug;
}
