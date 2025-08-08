#!/usr/bin/env tsx

/**
 * Role Testing Utility
 * Create test accounts for different roles to test the role-based system
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const testUsers = [
  {
    email: "coach.test@gmail.com",
    password: "BoxCall2025!",
    role: "coach",
    full_name: "Coach Johnson",
    description:
      "Head Coach - Access to team management, playbook creation, practice planning",
  },
  {
    email: "player.test@gmail.com",
    password: "BoxCall2025!",
    role: "player",
    full_name: "Mike Thompson",
    description:
      "Player - Access to personal stats, team schedule, playbook viewing",
  },
  {
    email: "family.test@gmail.com",
    password: "BoxCall2025!",
    role: "family",
    full_name: "Sarah Thompson",
    description:
      "Family Member - Access to player updates, schedule, team communications",
  },
  {
    email: "admin.test@gmail.com",
    password: "BoxCall2025!",
    role: "admin",
    full_name: "System Admin",
    description:
      "Admin - Full system access, user management, system analytics",
  },
];

async function createTestAccounts() {
  console.log("🚀 BOXCALL ROLE TESTING UTILITY\n");

  for (const user of testUsers) {
    try {
      console.log(`🔍 Creating ${user.role} account: ${user.email}`);

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            full_name: user.full_name,
            role: user.role,
          },
        },
      });

      if (authError) {
        console.log(`⚠️  Account might already exist: ${authError.message}`);
        continue;
      }

      if (authData.user) {
        // Create profile entry
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: authData.user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
        });

        if (profileError) {
          console.log(`⚠️  Profile creation issue: ${profileError.message}`);
        } else {
          console.log(`✅ ${user.role} account created successfully!`);
          console.log(`   📧 Email: ${user.email}`);
          console.log(`   🔑 Password: ${user.password}`);
          console.log(`   📝 Description: ${user.description}\n`);
        }
      }
    } catch (error) {
      console.error(`❌ Error creating ${user.role} account:`, error);
    }
  }
}

async function displayLoginInstructions() {
  console.log("📋 TESTING INSTRUCTIONS:");
  console.log("========================\n");
  console.log("1. Start the development server: npm run dev");
  console.log("2. Navigate to: http://localhost:5173");
  console.log("3. Test role-based access with these accounts:\n");

  testUsers.forEach((user) => {
    console.log(`🔐 ${user.role.toUpperCase()} LOGIN:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${user.password}`);
    console.log(`   Access: ${user.description}`);
    console.log("");
  });

  console.log("🎯 ROLE-SPECIFIC ROUTES TO TEST:");
  console.log("- /dashboard - Smart role-based dashboard");
  console.log("- /coach - Coach management hub (coaches/admins only)");
  console.log("- /player - Player dashboard (players only)");
  console.log("- /profile - User profile (all authenticated users)");
  console.log("- /calendar - Team calendar (all authenticated users)");
  console.log("");
  console.log("🧪 TEST SCENARIOS:");
  console.log(
    "1. Login as coach → should see coach dashboard and have access to /coach"
  );
  console.log(
    "2. Login as player → should see player dashboard and have access to /player"
  );
  console.log('3. Try accessing /coach as player → should see "Access Denied"');
  console.log('4. Try accessing /player as coach → should see "Access Denied"');
  console.log("5. All roles should access /dashboard, /profile, /calendar");
}

async function main() {
  await createTestAccounts();
  await displayLoginInstructions();

  console.log("\n🎉 ROLE TESTING SETUP COMPLETE!");
  console.log(
    "Your BoxCall app now has comprehensive role-based access control."
  );
}

main().catch((error) => {
  console.error("💥 Role testing setup failed:", error);
  process.exit(1);
});
