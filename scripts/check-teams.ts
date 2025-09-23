#!/usr/bin/env npx tsx

/**
 * Quick script to check if teams exist in the database
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.VITE_SUPABASE_URL || "https://lvmuiqwihlpnwppdqqfl.supabase.co";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bXVpcXdpaGxwbndwcGRxcWZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjAyMjM0OCwiZXhwIjoyMDY3NTk4MzQ4fQ.cCLvqoIWqHHMN_PQoSoST5Jh1PtECbFirGpr-L46Oic";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTeams() {
  console.log("🔍 Checking for teams in database...");

  try {
    const { data: teams, error } = await supabase
      .from("teams")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching teams:", error.message);
      return;
    }

    console.log(`✅ Found ${teams?.length || 0} teams:`);

    if (teams && teams.length > 0) {
      teams.forEach((team, index) => {
        console.log(`${index + 1}. ${team.name} (${team.id})`);
        console.log(`   School: ${team.school_name || "N/A"}`);
        console.log(`   Mascot: ${team.mascot || "N/A"}`);
        console.log(`   Season: ${team.season_year || "N/A"}`);
        console.log("");
      });
    } else {
      console.log("❌ No teams found in database");
      console.log("");
      console.log("💡 To add a demo team, you can run the seed data:");
      console.log("   npx supabase db reset --local (requires Docker)");
      console.log("   Or manually insert via SQL:");
      console.log(
        `   INSERT INTO teams (name, school_name, mascot, season_year)`
      );
      console.log(`   VALUES ('Demo Team', 'BoxCall High', 'Eagles', 2025);`);
    }
  } catch (err) {
    console.error("❌ Unexpected error:", err);
  }
}

checkTeams();
