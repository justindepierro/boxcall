#!/usr/bin/env tsx

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load environment variables
config({ path: "../.env.local" });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing required environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function setupAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error("❌ Missing ADMIN_EMAIL or ADMIN_PASSWORD in env");
    process.exit(1);
  }

  console.log("👑 SETTING UP ADMIN USER");
  console.log("========================\n");

  try {
    // Check if admin user exists
    const { data: users, error: listError } =
      await supabase.auth.admin.listUsers();

    if (listError) {
      console.log("❌ Failed to list users:", listError.message);
      return;
    }

    const existingUser = users.users.find((user) => user.email === adminEmail);

    if (existingUser) {
      console.log(
        `✅ Admin user exists: ${existingUser.email} (${existingUser.id})`
      );

      // Ensure profile exists
      await ensureProfile(existingUser.id);
    } else {
      console.log("🔄 Admin user not found - creating user...");

      // Create the admin user
      const { data: newUser, error: createError } =
        await supabase.auth.admin.createUser({
          email: adminEmail,
          password: adminPassword,
          user_metadata: { role: "admin" },
          email_confirm: true,
        });

      if (createError) {
        console.log("❌ Failed to create admin user:", createError.message);
        return;
      }

      console.log(
        `✅ Admin user created: ${newUser.user.email} (${newUser.user.id})`
      );

      // Ensure profile exists
      await ensureProfile(newUser.user.id);
    }

    console.log("\n🎉 ADMIN SETUP COMPLETE");
    console.log("=======================");
    console.log(`Email: ${adminEmail}`);
    console.log("Password: (set via ADMIN_PASSWORD env var)");
    console.log("\n💡 Next: Test login at http://localhost:5173");
  } catch (err) {
    console.error("❌ Error:", (err as Error).message);
  }
}

async function ensureProfile(userId: string) {
  console.log("Ensuring admin profile...");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (profileError && profileError.code !== "PGRST116") {
    console.log("❌ Profile check failed:", profileError.message);
    return;
  }

  if (!profile) {
    // Try without role first
    const { error: insertError } = await supabase.from("profiles").insert({
      id: userId,
      full_name: "Justin DePierro",
      display_name: "Justin",
    });

    if (insertError) {
      console.log("❌ Failed to create profile:", insertError.message);
      console.log("Profile table may not have expected columns");
      return;
    }

    console.log("✅ Profile created");
  } else {
    console.log("✅ Profile exists");
  }
}

setupAdmin().catch(console.error);
