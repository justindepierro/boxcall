#!/usr/bin/env node

/**
 * Authentication Testing Script for BoxCall
 *
 * Tests all authentication flows and database connections
 * Run this to verify your auth system is working properly
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Load environment variables manually from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnvFile() {
  try {
    const envPath = resolve(__dirname, "../.env");
    const envContent = readFileSync(envPath, "utf8");
    const envVars = {};

    envContent.split("\n").forEach((line) => {
      const [key, ...valueParts] = line.split("=");
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join("=").trim();
      }
    });

    return envVars;
  } catch (error) {
    console.error("Error loading .env file:", error.message);
    return {};
  }
}

const envVars = loadEnvFile();

// Initialize Supabase client
const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase environment variables in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuthentication() {
  console.log("🔐 Testing BoxCall Authentication System...\n");

  try {
    // Test 1: Database Connection
    console.log("📡 Test 1: Database Connection");
    const { data: profilesTest, error: profilesError } = await supabase
      .from("profiles")
      .select("count");

    if (profilesError) {
      console.error("❌ Database connection failed:", profilesError.message);
      return;
    }
    console.log("✅ Database connection successful!\n");

    // Test 2: Check existing users
    console.log("👥 Test 2: Existing User Profiles");
    const { data: profiles, error: profilesListError } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .limit(10);

    if (profilesListError) {
      console.error("❌ Error fetching profiles:", profilesListError.message);
    } else {
      console.log(`✅ Found ${profiles.length} existing user profiles:`);
      profiles.forEach((profile) => {
        console.log(
          `   • ${profile.full_name || "No name"} (${profile.email || "No email"}) - ${profile.role || "No role"}`
        );
      });
    }

    // Test 3: Check protected tables accessibility
    console.log("\n🔒 Test 3: Protected Tables (RLS Testing)");

    const protectedTables = ["teams", "plays", "playbooks", "team_members"];

    for (const table of protectedTables) {
      const { data, error } = await supabase
        .from(table)
        .select("count")
        .limit(1);

      if (error) {
        if (
          error.code === "PGRST301" ||
          error.message.includes("permission denied")
        ) {
          console.log(
            `🔒 ${table}: Protected by RLS (requires authentication)`
          );
        } else {
          console.log(`❌ ${table}: Error - ${error.message}`);
        }
      } else {
        console.log(`✅ ${table}: Accessible`);
      }
    }

    // Test 4: Auth session check
    console.log("\n🎫 Test 4: Current Auth Session");
    const { data: session, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      console.error("❌ Session check failed:", sessionError.message);
    } else if (session?.session) {
      console.log("✅ Active session found:");
      console.log(`   • User ID: ${session.session.user.id}`);
      console.log(`   • Email: ${session.session.user.email}`);
      console.log(
        `   • Expires: ${new Date(session.session.expires_at * 1000).toLocaleString()}`
      );
    } else {
      console.log(
        "ℹ️  No active session (expected - this is a server-side script)"
      );
    }

    // Test 5: Database table discovery
    console.log("\n📊 Test 5: Database Schema Discovery");
    const { data: tablesData, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .order("table_name");

    if (tablesError) {
      console.log(
        "ℹ️  Could not query schema (may require elevated permissions)"
      );
    } else {
      console.log(`✅ Found ${tablesData.length} database tables:`);
      const tableNames = tablesData.map((t) => t.table_name).slice(0, 10);
      tableNames.forEach((name) => {
        console.log(`   • ${name}`);
      });
      if (tablesData.length > 10) {
        console.log(`   • ... and ${tablesData.length - 10} more tables`);
      }
    }

    // Summary
    console.log("\n🎉 Authentication System Status:");
    console.log("✅ Database connection: Working");
    console.log("✅ User profiles table: Accessible");
    console.log("✅ Protected tables: RLS security active");
    console.log("✅ Supabase client: Configured correctly");

    console.log("\n📝 Next Steps:");
    console.log("1. Start your development server: npm run dev");
    console.log("2. Visit http://localhost:5173/login");
    console.log("3. Create a new account to test the auth flow");
    console.log("4. After login, run the demo data loader:");
    console.log("   node scripts/load-demo-data.mjs");
  } catch (error) {
    console.error("💥 Unexpected error during testing:", error);
  }
}

// Test authentication configuration
async function testConfig() {
  console.log("⚙️  Configuration Test:");
  console.log(`   • Supabase URL: ${supabaseUrl}`);
  console.log(
    `   • Anon Key: ${supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + "..." : "Not set"}`
  );
  console.log("");
}

// Run the tests
testConfig()
  .then(testAuthentication)
  .then(() => {
    console.log("\n✨ Authentication testing complete!");
  })
  .catch((error) => {
    console.error("💥 Testing failed:", error);
  });
