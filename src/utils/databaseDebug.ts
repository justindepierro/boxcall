/**
 * Database Debug Utility
 * Quick tool to check what data exists in the database
 */

import { supabase } from "../lib/supabase";

export class DatabaseDebug {
  static async checkPlaybooks(): Promise<void> {
    try {
      console.log("🔍 Checking playbooks in database...");

      const { data: playbooks, error } = await supabase
        .from("playbooks")
        .select("*");

      if (error) {
        console.error("❌ Error fetching playbooks:", error);
        return;
      }

      console.log("📚 Found playbooks:", playbooks);

      if (playbooks && playbooks.length > 0) {
        console.log(`✅ Found ${playbooks.length} playbook(s):`);
        playbooks.forEach((pb) => {
          console.log(`  - ${pb.name} (${pb.id})`);
        });
      } else {
        console.log("⚠️ No playbooks found in database!");
        console.log("💡 You may need to run database seeds");
      }
    } catch (error) {
      console.error("❌ DatabaseDebug.checkPlaybooks failed:", error);
    }
  }

  static async checkTeams(): Promise<void> {
    try {
      console.log("🔍 Checking teams in database...");

      const { data: teams, error } = await supabase.from("teams").select("*");

      if (error) {
        console.error("❌ Error fetching teams:", error);
        return;
      }

      console.log("🏈 Found teams:", teams);
    } catch (error) {
      console.error("❌ DatabaseDebug.checkTeams failed:", error);
    }
  }

  static async createDemoPlaybook(): Promise<string | null> {
    try {
      console.log("🔧 Creating demo playbook...");

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
        console.log("👤 Creating demo user...");
        const { error: userError } = await supabase.from("users").insert([
          {
            id: demoUserId,
            email: "demo@boxcall.app",
            // Add any other required fields for users table
          },
        ]);

        if (userError) {
          console.error("❌ Error creating demo user:", userError);
          // If we can't create user, let's try without created_by constraint
          console.log("⚠️ Continuing without demo user...");
        } else {
          console.log("✅ Demo user created successfully");
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
        console.log("🏗️ Creating demo team...");
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
          console.error("❌ Error creating demo team:", teamError);

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
            console.error(
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
        console.error("❌ Error creating demo playbook:", error);
        return null;
      }

      console.log("✅ Demo playbook created:", data);
      return playbookId;
    } catch (error) {
      console.error("❌ DatabaseDebug.createDemoPlaybook failed:", error);
      return null;
    }
  }
}
