/**
 * Auth Debug Utility
 * Check what users exist in profiles table and help debug auth issues
 */

import { supabase } from "../lib/supabase";
import { logError } from "./logger";

export class AuthDebug {
  /**
   * Check what profiles exist in the database
   */
  static async checkProfiles(): Promise<void> {
    try {
      console.info("🔍 Checking profiles in database...");

      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, created_at");

      if (error) {
        logError("❌ Error fetching profiles:", error);
        return;
      }

      console.info("👤 Found profiles:", profiles);

      if (profiles && profiles.length > 0) {
        console.info(`✅ Found ${profiles.length} profile(s):`);
        profiles.forEach((profile) => {
          console.info(
            `  - ${profile.full_name || "No Name"} (${profile.email || "No Email"}) - Role: ${profile.role}`
          );
        });
      } else {
        console.info("⚠️ No profiles found in database!");
        console.info("💡 You need to register a user account first");
      }
    } catch (error) {
      logError("❌ AuthDebug.checkProfiles failed:", error);
    }
  }

  /**
   * Check current auth session
   */
  static async checkAuthSession(): Promise<void> {
    try {
      console.info("🔍 Checking current auth session...");

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        logError("❌ Error getting session:", error);
        return;
      }

      if (session) {
        console.info("✅ Active session found:");
        console.info("  - User ID:", session.user.id);
        console.info("  - Email:", session.user.email);
        console.info("  - Role:", session.user.role);
      } else {
        console.info("⚠️ No active session - user not logged in");
      }
    } catch (error) {
      logError("❌ AuthDebug.checkAuthSession failed:", error);
    }
  }

  /**
   * Create a test user (for development only)
   */
  static async createTestUser(): Promise<void> {
    try {
      console.info("🧪 Creating test user...");

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
        logError("❌ Error creating test user:", error.message);
        return;
      }

      if (data.user) {
        console.info("✅ Test user created successfully!");
        console.info("  - Email:", data.user.email);
        console.info("  - ID:", data.user.id);
        console.info("💡 You can now login with:", testEmail);
      }
    } catch (error) {
      logError("❌ AuthDebug.createTestUser failed:", error);
    }
  }

  /**
   * Run all debug checks
   */
  static async runAllChecks(): Promise<void> {
    console.info("🚀 Running auth debug checks...");
    console.info("=====================================");

    await this.checkAuthSession();
    console.info("-------------------------------------");

    await this.checkProfiles();
    console.info("=====================================");
  }
}

// Make it available globally for console debugging
if (typeof window !== "undefined") {
  (window as typeof window & { AuthDebug: typeof AuthDebug }).AuthDebug =
    AuthDebug;
}
