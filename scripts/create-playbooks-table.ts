#!/usr/bin/env tsx

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load environment variables
config({ path: "../.env.local" });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing required environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createPlaybooksTable() {
  console.log("📖 CREATING PLAYBOOKS TABLE");
  console.log("===========================\n");

  try {
    // Check if playbooks table already exists
    const { data: existingTable, error: checkError } = await supabase
      .from("playbooks")
      .select("id")
      .limit(1);

    if (!checkError) {
      console.log("✅ Playbooks table already exists");

      // Create default playbook for admin team if none exists
      const { data: adminTeam, error: teamError } = await supabase
        .from("teams")
        .select("id")
        .limit(1)
        .single();

      if (!teamError) {
        const { data: existingPlaybook, error: playbookCheck } = await supabase
          .from("playbooks")
          .select("id")
          .eq("team_id", adminTeam.id)
          .limit(1);

        if (
          !playbookCheck &&
          (!existingPlaybook || existingPlaybook.length === 0)
        ) {
          const { error: insertError } = await supabase
            .from("playbooks")
            .insert({
              team_id: adminTeam.id,
              name: "Main Playbook",
              description: "Default playbook for the team",
            });

          if (insertError) {
            console.log(
              "❌ Failed to create default playbook:",
              insertError.message
            );
          } else {
            console.log("✅ Default playbook created");
          }
        } else {
          console.log("✅ Default playbook already exists");
        }
      }

      console.log("\n🎉 PLAYBOOKS TABLE ALREADY EXISTS");
      console.log("==================================");
      return;
    }

    console.log("❌ Playbooks table does not exist - need to create manually");
    console.log("Please run the following SQL in Supabase SQL Editor:");
    console.log(`
CREATE TABLE playbooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Main Playbook',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  play_count INTEGER DEFAULT 0,
  last_modified_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE playbooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view playbooks from their teams" ON playbooks
FOR SELECT USING (
  team_id IN (
    SELECT team_id FROM team_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert playbooks for their teams" ON playbooks
FOR INSERT WITH CHECK (
  team_id IN (
    SELECT team_id FROM team_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update playbooks from their teams" ON playbooks
FOR UPDATE USING (
  team_id IN (
    SELECT team_id FROM team_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete playbooks from their teams" ON playbooks
FOR DELETE USING (
  team_id IN (
    SELECT team_id FROM team_members 
    WHERE user_id = auth.uid()
  )
);
    `);
  } catch (err) {
    console.error("❌ Error:", (err as Error).message);
  }
}

createPlaybooksTable().catch(console.error);
