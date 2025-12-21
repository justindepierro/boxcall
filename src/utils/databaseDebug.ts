/**
 * Database Debug Utility
 * Quick tool to check what data exists in the database
 */

import { table } from "../data/supabase/db";
import { debug, logError } from "./logger";

export class DatabaseDebug {
  static async checkPlaybooks(): Promise<void> {
    try {
      debug("🔍 Checking playbooks in database...");

      const { data: playbooks, error } = await table("playbooks").select("*");

      if (error) {
        logError("❌ Error fetching playbooks:", error);
        return;
      }

      debug("📚 Found playbooks:", playbooks);

      if (playbooks && playbooks.length > 0) {
        debug(`✅ Found ${playbooks.length} playbook(s):`);
        playbooks.forEach((pb) => {
          debug(`  - ${pb.name} (${pb.id})`);
        });
      } else {
        debug("⚠️ No playbooks found in database!");
        debug("💡 You may need to run database seeds");
      }
    } catch (error) {
      logError("❌ DatabaseDebug.checkPlaybooks failed:", error);
    }
  }

  static async checkTeams(): Promise<void> {
    try {
      debug("🔍 Checking teams in database...");

      const { data: teams, error } = await table("teams").select("*");

      if (error) {
        logError("❌ Error fetching teams:", error);
        return;
      }

      debug("🏈 Found teams:", teams);
    } catch (error) {
      logError("❌ DatabaseDebug.checkTeams failed:", error);
    }
  }

  static async createDemoPlaybook(): Promise<string | null> {
    try {
      debug("🔧 Creating demo playbook...");

      // Check if demo team exists
      const { data: teams } = await table("teams")
        .select("id")
        .eq("name", "Demo Team")
        .limit(1);

      const teamId = "550e8400-e29b-41d4-a716-446655440000";

      if (!teams || teams.length === 0) {
        // Create demo team first
        debug("🏗️ Creating demo team...");
        const { error: teamError } = await table("teams").insert([
          {
            id: teamId,
            name: "Demo Team",
            school_name: "BoxCall High",
            mascot: "Eagles",
            season_year: 2025,
            created_by: null,
          },
        ]);

        if (teamError) {
          logError("❌ Error creating demo team:", teamError);

          // Try without created_by if user constraint is the issue
          const { error: teamErrorFallback } = await table("teams").insert([
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
      const { data, error } = await table("playbooks")
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

      debug("✅ Demo playbook created:", data);
      return playbookId;
    } catch (error) {
      logError("❌ DatabaseDebug.createDemoPlaybook failed:", error);
      return null;
    }
  }
}
