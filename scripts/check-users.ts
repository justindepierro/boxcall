#!/usr/bin/env npx tsx

/**
 * Check for existing users in auth.users
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

async function checkUsers() {
  console.log("👥 Checking for existing users...");

  try {
    const { data: users, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error("❌ Error fetching users:", error.message);
      return;
    }

    console.log(`✅ Found ${users.users?.length || 0} users:`);

    if (users.users && users.users.length > 0) {
      users.users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} (${user.id})`);
      });

      // Use the first user for demo team
      const demoUserId = users.users[0].id;
      console.log(`\n🎯 Using user ${demoUserId} for demo team`);

      // Try to create team with this user
      console.log("🌱 Creating demo team...");
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .insert({
          name: "Demo Team",
          school_name: "BoxCall High",
          mascot: "Eagles",
          season_year: 2025,
          created_by: demoUserId,
        })
        .select()
        .single();

      if (teamError) {
        console.error("❌ Error creating team:", teamError.message);
      } else {
        console.log("✅ Demo team created successfully!");
        console.log("📊 Team data:", teamData);
        console.log(
          '📱 You can now navigate to /teams and click on the "Demo Team" card'
        );
      }
    } else {
      console.log(
        "❌ No users found. You need to create a user first or run this SQL in Supabase:"
      );
      console.log("");
      console.log("-- Temporarily allow null created_by for demo");
      console.log("ALTER TABLE teams ALTER COLUMN created_by DROP NOT NULL;");
      console.log("");
      console.log("-- Create demo team");
      console.log(
        "INSERT INTO teams (name, school_name, mascot, season_year) VALUES ('Demo Team', 'BoxCall High', 'Eagles', 2025);"
      );
      console.log("");
      console.log("-- Restore NOT NULL constraint later");
      console.log("ALTER TABLE teams ALTER COLUMN created_by SET NOT NULL;");
    }
  } catch (err) {
    console.error("❌ Unexpected error:", err);
  }
}

checkUsers();
