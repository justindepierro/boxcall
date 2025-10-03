#!/usr/bin/env tsx

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log("🔍 Debug - SUPABASE_URL:", supabaseUrl ? "SET" : "NOT SET");
console.log("🔍 Debug - SERVICE_ROLE_KEY:", serviceRoleKey ? "SET (" + serviceRoleKey.substring(0, 10) + "...)" : "NOT SET");

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing required environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function applySchema() {
  try {
    console.log("🚀 Applying database schema...");

    // Read the schema file
    const schemaPath = join(process.cwd(), "database", "schema.sql");
    const schemaSQL = readFileSync(schemaPath, "utf8");

    // Try a simple test query first
    console.log("🧪 Testing database connection...");
    const { error: testError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (testError) {
      console.log("⚠️  Test query failed (expected if tables don't exist):", testError.message);
    } else {
      console.log("✅ Database connection successful");
    }

    // Since RPC exec might not work, let's try a different approach
    // We'll create a simple script that can be run in Supabase SQL editor
    console.log("📝 Generating SQL script for manual execution...");
    console.log("Copy the following SQL to your Supabase SQL Editor:");
    console.log("=" .repeat(50));
    console.log(schemaSQL);
    console.log("=" .repeat(50));

    console.log("💡 Alternatively, you can run this SQL directly in your Supabase dashboard under SQL Editor");

  } catch (error: any) {
    console.error('❌ Error applying schema:', error.message);
    process.exit(1);
  }
}

applySchema();