#!/usr/bin/env node
/**
 * Reset a user's password in Supabase Auth
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lvmuiqwihlpnwppdqqfl.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
  process.exit(1);
}

const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.error(
    "Usage: node scripts/reset-password.mjs <email> <new-password>"
  );
  console.error(
    'Example: node scripts/reset-password.mjs "user@example.com" "mynewpassword"'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function resetPassword() {
  console.log(`\nResetting password for: ${email}\n`);

  // First, find the user
  const {
    data: { users },
    error: listError,
  } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error("Error listing users:", listError);
    return;
  }

  const user = users.find((u) => u.email === email);

  if (!user) {
    console.error("❌ User not found:", email);
    return;
  }

  console.log(`Found user: ${user.id}`);

  // Update the password
  const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword,
  });

  if (error) {
    console.error("❌ Error resetting password:", error);
    return;
  }

  console.log("✅ Password reset successfully!");
  console.log(`\nYou can now log in with:`);
  console.log(`  Email: ${email}`);
  console.log(`  Password: ${newPassword}`);
}

resetPassword().catch(console.error);
