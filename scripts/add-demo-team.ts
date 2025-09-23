#!/usr/bin/env npx tsx

/**
 * Simple script to add demo team using service role
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

async function addDemoTeam() {
  console.log("🚀 Adding demo team with service role...");

  try {
    // First try to disable RLS using service role
    console.log("🔓 Attempting to disable RLS...");
    const { error: rlsError } = await supabase.rpc("exec_sql", {
      sql: "ALTER TABLE teams DISABLE ROW LEVEL SECURITY;",
    });

    if (rlsError) {
      console.log(
        "⚠️  RLS disable failed, trying direct insert with service role..."
      );
    } else {
      console.log("✅ RLS disabled");
    }

    // Try inserting with service role (should bypass RLS)
    console.log("🌱 Inserting demo team...");
    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .insert({
        name: "Demo Team",
        school_name: "BoxCall High",
        mascot: "Eagles",
        season_year: 2025,
      })
      .select()
      .single();

    if (teamError) {
      console.error("❌ Error inserting team:", teamError.message);
      console.log("");
      console.log(
        "💡 You may need to manually run this SQL in Supabase dashboard:"
      );
      console.log("ALTER TABLE teams DISABLE ROW LEVEL SECURITY;");
      console.log(
        "INSERT INTO teams (name, school_name, mascot, season_year) VALUES ('Demo Team', 'BoxCall High', 'Eagles', 2025);"
      );
      return;
    }

    console.log("✅ Demo team created successfully!");
    console.log("� Team data:", teamData);
    console.log(
      '�📱 You can now navigate to /teams and click on the "Demo Team" card'
    );
  } catch (err) {
    console.error("❌ Unexpected error:", err);
  }
}

addDemoTeam();
