/**
 * Database Debug Utility
 * Quick tool to check what data exists in the database
 */

import { supabase } from "../lib/supabase";
import { logError } from "./logger";

export class DatabaseDebug {
  static async checkPlaybooks(): Promise<void> {
    try {
      console.info("🔍 Checking playbooks in database...");

      const { data: playbooks, error } = await supabase
        .from("playbooks")
        .select("*");

      if (error) {
        logError("❌ Error fetching playbooks:", error);
        return;
      }

      console.info("📚 Found playbooks:", playbooks);

      if (playbooks && playbooks.length > 0) {
        console.info(`✅ Found ${playbooks.length} playbook(s):`);
        playbooks.forEach((pb) => {
          console.info(`  - ${pb.name} (${pb.id})`);
        });
      } else {
        console.info("⚠️ No playbooks found in database!");
        console.info("💡 You may need to run database seeds");
      }
    } catch (error) {
      logError("❌ DatabaseDebug.checkPlaybooks failed:", error);
    }
  }

  static async checkTeams(): Promise<void> {
    try {
      console.info("🔍 Checking teams in database...");

      const { data: teams, error } = await supabase.from("teams").select("*");

      if (error) {
        logError("❌ Error fetching teams:", error);
        return;
      }

      console.info("🏈 Found teams:", teams);
    } catch (error) {
      logError("❌ DatabaseDebug.checkTeams failed:", error);
    }
  }

  static async createDemoPlaybook(): Promise<string | null> {
    try {
      console.info("🔧 Creating demo playbook...");

      // First, create or get demo user
      const demoUserId = "00000000-0000-0000-0000-000000000001";

      // Check if demo user exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", demoUserId)
        .limit(1);

      if (!existingUser || existingUser.length === 0) {
        // Create demo user - minimal required fields
        console.info("👤 Creating demo user...");
        const { error: userError } = await supabase.from("users").insert([
          {
            id: demoUserId,
            email: "demo@boxcall.app",
            // Add any other required fields for users table
          },
        ]);

        if (userError) {
          logError("❌ Error creating demo user:", userError);
          // If we can't create user, let's try without created_by constraint
          console.info("⚠️ Continuing without demo user...");
        } else {
          console.info("✅ Demo user created successfully");
        }
      }

      // Check if demo team exists
      const { data: teams } = await supabase
        .from("teams")
        .select("id")
        .eq("name", "Demo Team")
        .limit(1);

      const teamId = "550e8400-e29b-41d4-a716-446655440000";

      if (!teams || teams.length === 0) {
        // Create demo team first
        console.info("🏗️ Creating demo team...");
        const { error: teamError } = await supabase.from("teams").insert([
          {
            id: teamId,
            name: "Demo Team",
            school_name: "BoxCall High",
            mascot: "Eagles",
            season_year: 2025,
            created_by: demoUserId,
          },
        ]);

        if (teamError) {
          logError("❌ Error creating demo team:", teamError);

          // Try without created_by if user constraint is the issue
          const { error: teamErrorFallback } = await supabase
            .from("teams")
            .insert([
              {
                id: teamId,
                name: "Demo Team",
                school_name: "BoxCall High",
                mascot: "Eagles",
                season_year: 2025,
                // Skip created_by field
              },
            ]);

          if (teamErrorFallback) {
            logError(
              "❌ Error creating demo team (fallback):",
              teamErrorFallback
            );
            return null;
          }
        }
      } // Now create the playbook
      const playbookId = "550e8400-e29b-41d4-a716-446655440001";
      const { data, error } = await supabase
        .from("playbooks")
        .insert([
          {
            id: playbookId,
            team_id: teamId,
            name: "Main Playbook",
            description: "Primary offensive playbook for BoxCall",
            created_by: "00000000-0000-0000-0000-000000000001", // Demo coach UUID
          },
        ])
        .select()
        .single();

      if (error) {
        logError("❌ Error creating demo playbook:", error);
        return null;
      }

      console.info("✅ Demo playbook created:", data);
      return playbookId;
    } catch (error) {
      logError("❌ DatabaseDebug.createDemoPlaybook failed:", error);
      return null;
    }
  }
}
