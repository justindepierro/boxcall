#!/usr/bin/env node
/**
 * Check user status in Supabase Auth
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lvmuiqwihlpnwppdqqfl.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
  console.log(
    "Run with: SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/check-user.mjs"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const email = "justindepierro@gmail.com";

async function checkUser() {
  console.log(`\nChecking user: ${email}\n`);

  // List all users and find ours
  const {
    data: { users },
    error,
  } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error("Error listing users:", error);
    return;
  }

  const user = users.find((u) => u.email === email);

  if (!user) {
    console.log("❌ User NOT FOUND in Supabase Auth");
    console.log("\nAvailable users:");
    users.forEach((u) => console.log(`  - ${u.email} (${u.id})`));
    return;
  }

  console.log("✅ User found!");
  console.log("\nUser details:");
  console.log(`  ID: ${user.id}`);
  console.log(`  Email: ${user.email}`);
  console.log(
    `  Email confirmed: ${user.email_confirmed_at ? "Yes (" + user.email_confirmed_at + ")" : "NO"}`
  );
  console.log(`  Created: ${user.created_at}`);
  console.log(`  Last sign in: ${user.last_sign_in_at || "Never"}`);
  console.log(`  Phone: ${user.phone || "None"}`);
  console.log(`  Provider: ${user.app_metadata?.provider || "email"}`);
  console.log(`  Role: ${user.role}`);
  console.log(
    `  Banned: ${user.banned_until ? "Yes until " + user.banned_until : "No"}`
  );

  // Check if user is in identities
  if (user.identities?.length > 0) {
    console.log("\nIdentities:");
    user.identities.forEach((id) => {
      console.log(`  - Provider: ${id.provider}, ID: ${id.id}`);
    });
  }

  console.log("\n--- Password Reset Option ---");
  console.log("To reset the password, run:");
  console.log(`  node scripts/reset-password.mjs "${email}" "newpassword123"`);
}

checkUser().catch(console.error);
