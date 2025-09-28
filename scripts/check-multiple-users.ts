import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

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

async function checkMultipleUsers() {
  console.log("🔍 CHECKING FOR MULTIPLE USERS WITH SAME EMAIL");
  console.log("===============================================\n");

  try {
    const { data: users, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.log("❌ Failed to list users:", error.message);
      return;
    }

    const matchingUsers = users.users.filter(
      (user) => user.email === "justindepierro@gmail.com"
    );

    console.log(`Found ${matchingUsers.length} user(s) with email justindepierro@gmail.com\n`);

    matchingUsers.forEach((user, i) => {
      console.log(`User ${i + 1}:`);
      console.log(`  - ID: ${user.id}`);
      console.log(`  - Email: ${user.email}`);
      console.log(`  - Created: ${user.created_at}`);
      console.log(`  - Last Sign In: ${user.last_sign_in_at || "Never"}`);
      console.log(`  - Email Confirmed: ${user.email_confirmed_at ? "✅" : "❌"}`);
      console.log("");
    });

    // Check profiles table
    console.log("🔍 CHECKING PROFILES TABLE");
    console.log("==========================\n");

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", "justindepierro@gmail.com");

    if (profileError) {
      console.log("❌ Failed to query profiles:", profileError.message);
    } else {
      console.log(`Found ${profiles.length} profile(s) with email justindepierro@gmail.com\n`);
      profiles.forEach((profile, i) => {
        console.log(`Profile ${i + 1}:`);
        console.log(`  - ID: ${profile.id}`);
        console.log(`  - Email: ${profile.email}`);
        console.log(`  - Full Name: ${profile.full_name || "Not set"}`);
        console.log(`  - Created: ${profile.created_at}`);
        console.log(`  - Updated: ${profile.updated_at}`);
        console.log("");
      });
    }

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

checkMultipleUsers();
