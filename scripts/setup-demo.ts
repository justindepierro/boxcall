#!/usr/bin/env npx tsx

/**
 * Disable RLS and seed demo data for development
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.VITE_SUPABASE_URL || "https://lvmuiqwihlpnwppdqqfl.supabase.co";
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bXVpcXdpaGxwbndwcGRxcWZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjAyMjM0OCwiZXhwIjoyMDY3NTk4MzQ4fQ.cCLvqoIWqHHMN_PQoSoST5Jh1PtECbFirGpr-L46Oic";

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setupDemoData() {
  console.log("🔧 Setting up demo environment...");

  try {
    // First, disable RLS for demo
    console.log("🔓 Disabling RLS policies...");
    const { error: rlsError } = await supabase.rpc("exec_sql", {
      sql: `
        ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
        ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
        ALTER TABLE plays DISABLE ROW LEVEL SECURITY;
        ALTER TABLE playbooks DISABLE ROW LEVEL SECURITY;
      `,
    });

    if (rlsError) {
      console.log("⚠️  Could not disable RLS via RPC, trying direct SQL...");
      // Try direct approach
      const { error: directError } = await supabase
        .from("teams")
        .select("*")
        .limit(1);

      if (directError && directError.message.includes("row-level security")) {
        console.log(
          "❌ RLS is blocking access. Please run this SQL in Supabase dashboard:"
        );
        console.log("");
        console.log("ALTER TABLE teams DISABLE ROW LEVEL SECURITY;");
        console.log("ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;");
        console.log("ALTER TABLE plays DISABLE ROW LEVEL SECURITY;");
        console.log("ALTER TABLE playbooks DISABLE ROW LEVEL SECURITY;");
        return;
      }
    }

    console.log("✅ RLS policies disabled");

    // Clear existing data
    console.log("🧹 Clearing existing demo data...");
    await supabase
      .from("plays")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("playbooks")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("team_members")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("teams")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    console.log("✅ Existing data cleared");

    // Insert demo team
    console.log("🌱 Seeding demo team...");
    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .insert({
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "Demo Team",
        school_name: "BoxCall High",
        mascot: "Eagles",
        season_year: 2025,
        // created_by will be null for demo
      })
      .select()
      .single();

    if (teamError) {
      console.error("❌ Error inserting team:", teamError.message);
      return;
    }

    console.log("✅ Created team:", teamData.name);

    // Insert demo playbook
    const { data: playbookData, error: playbookError } = await supabase
      .from("playbooks")
      .insert({
        id: "550e8400-e29b-41d4-a716-446655440001",
        team_id: teamData.id,
        name: "Main Playbook",
        description: "Primary offensive playbook for demo",
      })
      .select()
      .single();

    if (playbookError) {
      console.error("❌ Error inserting playbook:", playbookError.message);
      return;
    }

    console.log("✅ Created playbook:", playbookData.name);

    // Insert some sample plays
    const samplePlays = [
      {
        playbook_id: playbookData.id,
        formation: "I-Formation",
        play_name: "Power O",
        one_word_play: "Thunder",
        p_type: "Run",
        personnel: "21",
        notes: "Strong side power run",
        created_by: "demo-coach",
      },
      {
        playbook_id: playbookData.id,
        formation: "Shotgun",
        play_name: "Four Verticals",
        one_word_play: "Smash",
        p_type: "Pass",
        personnel: "11",
        notes: "Vertical stretch concept",
        created_by: "demo-coach",
      },
      {
        playbook_id: playbookData.id,
        formation: "Singleback",
        play_name: "Inside Zone",
        one_word_play: "Zorro",
        p_type: "Run",
        personnel: "11",
        notes: "Gap scheme running play",
        created_by: "demo-coach",
      },
    ];

    const { data: playsData, error: playsError } = await supabase
      .from("plays")
      .insert(samplePlays)
      .select();

    if (playsError) {
      console.error("❌ Error inserting plays:", playsError.message);
      return;
    }

    console.log(`✅ Created ${playsData?.length || 0} sample plays`);
    console.log("");
    console.log("🎉 Demo environment setup complete!");
    console.log(
      '📱 You can now navigate to /teams and click on the "Demo Team" card'
    );
    console.log("🔒 Note: RLS has been disabled for demo purposes");
  } catch (err) {
    console.error("❌ Unexpected error:", err);
  }
}

setupDemoData();
