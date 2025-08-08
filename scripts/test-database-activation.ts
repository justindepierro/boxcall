#!/usr/bin/env tsx

/**
 * Database Activation Test
 * Tests the connection to Supabase and validates core functionality
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Create supabase client for testing
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase environment variables in .env file");
  console.error(
    "Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabaseConnection() {
  console.log("🔍 Testing Supabase Connection...");

  try {
    // Test basic connection
    const { data: _data, error } = await supabase
      .from("profiles")
      .select("*")
      .limit(1);

    if (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }

    console.log("✅ Database connection successful!");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

async function testAuthFlow() {
  console.log("🔍 Testing Auth Flow...");

  try {
    // Test auth session check (should work even without login)
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      throw new Error(`Auth flow failed: ${error.message}`);
    }

    console.log("✅ Auth flow working!");
    console.log(
      `📊 Current session: ${session ? "Active" : "No active session (expected)"}`
    );
    return true;
  } catch (error) {
    console.error("❌ Auth flow failed:", error);
    return false;
  }
}

async function testTableSchema() {
  console.log("🔍 Testing Table Schema...");

  try {
    // Test if our core tables exist by running a simple query
    const tables = ["profiles", "teams", "playbooks", "plays"];

    for (const table of tables) {
      const { error } = await supabase.from(table).select("*").limit(1);

      if (error) {
        console.log(`⚠️  Table '${table}' might not exist: ${error.message}`);
      } else {
        console.log(`✅ Table '${table}' exists and accessible`);
      }
    }

    return true;
  } catch (error) {
    console.error("❌ Schema test failed:", error);
    return false;
  }
}

async function main() {
  console.log("🚀 BOXCALL DATABASE ACTIVATION TEST\n");

  const connectionOK = await testDatabaseConnection();
  const authOK = await testAuthFlow();
  const schemaOK = await testTableSchema();

  console.log("\n📊 ACTIVATION TEST RESULTS:");
  console.log(`Database Connection: ${connectionOK ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Auth Flow: ${authOK ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Schema Access: ${schemaOK ? "✅ PASS" : "❌ FAIL"}`);

  if (connectionOK && authOK) {
    console.log("\n🎉 DATABASE IS READY FOR ACTIVATION!");
    console.log("Next steps:");
    console.log("1. Create some test accounts");
    console.log("2. Test role-based page access");
    console.log("3. Verify data sync services");
  } else {
    console.log("\n💥 ACTIVATION BLOCKED - FIX DATABASE ISSUES FIRST");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("💥 Activation test crashed:", error);
  process.exit(1);
});
