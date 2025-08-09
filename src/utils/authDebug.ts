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
      console.log("🔍 Checking profiles in database...");

      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, created_at");

      if (error) {
        console.error("❌ Error fetching profiles:", error);
        return;
      }

      console.log("👤 Found profiles:", profiles);

      if (profiles && profiles.length > 0) {
        console.log(`✅ Found ${profiles.length} profile(s):`);
        profiles.forEach((profile) => {
          console.log(
            `  - ${profile.full_name || "No Name"} (${profile.email || "No Email"}) - Role: ${profile.role}`
          );
        });
      } else {
        console.log("⚠️ No profiles found in database!");
        console.log("💡 You need to register a user account first");
      }
    } catch (error) {
      console.error("❌ AuthDebug.checkProfiles failed:", error);
    }
  }

  /**
   * Check current auth session
   */
  static async checkAuthSession(): Promise<void> {
    try {
      console.log("🔍 Checking current auth session...");

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("❌ Error getting session:", error);
        return;
      }

      if (session) {
        console.log("✅ Active session found:");
        console.log("  - User ID:", session.user.id);
        console.log("  - Email:", session.user.email);
        console.log("  - Role:", session.user.role);
      } else {
        console.log("⚠️ No active session - user not logged in");
      }
    } catch (error) {
      console.error("❌ AuthDebug.checkAuthSession failed:", error);
    }
  }

  /**
   * Create a test user (for development only)
   */
  static async createTestUser(): Promise<void> {
    try {
      console.log("🧪 Creating test user...");

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
        console.error("❌ Error creating test user:", error.message);
        return;
      }

      if (data.user) {
        console.log("✅ Test user created successfully!");
        console.log("  - Email:", data.user.email);
        console.log("  - ID:", data.user.id);
        console.log("💡 You can now login with:", testEmail);
      }
    } catch (error) {
      console.error("❌ AuthDebug.createTestUser failed:", error);
    }
  }

  /**
   * Run all debug checks
   */
  static async runAllChecks(): Promise<void> {
    console.log("🚀 Running auth debug checks...");
    console.log("=====================================");

    await this.checkAuthSession();
    console.log("-------------------------------------");

    await this.checkProfiles();
    console.log("=====================================");
  }
}

// Make it available globally for console debugging
if (typeof window !== "undefined") {
  (window as typeof window & { AuthDebug: typeof AuthDebug }).AuthDebug =
    AuthDebug;
}
