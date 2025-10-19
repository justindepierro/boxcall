#!/usr/bin/env node
/**
 * Run migration: Create practice_script_plays table
 * Date: 2025-10-18
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load environment variables
require("dotenv").config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials");
  console.error("   VITE_SUPABASE_URL:", supabaseUrl ? "✓" : "✗");
  console.error("   VITE_SUPABASE_ANON_KEY:", supabaseKey ? "✓" : "✗");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log("🚀 Running migration: Create practice_script_plays table\n");

  const migrationSQL = fs.readFileSync(
    path.join(
      __dirname,
      "database/migrations/20251018_create_practice_script_plays.sql"
    ),
    "utf8"
  );

  try {
    // Note: Supabase client doesn't support raw SQL execution directly
    // This migration needs to be run through the Supabase SQL Editor
    console.log("📋 Migration SQL:");
    console.log("─".repeat(80));
    console.log(migrationSQL);
    console.log("─".repeat(80));
    console.log("\n📝 Instructions:");
    console.log("   1. Copy the SQL above");
    console.log(
      "   2. Go to: https://app.supabase.com/project/YOUR_PROJECT/editor"
    );
    console.log("   3. Paste and run the SQL");
    console.log("   4. Verify table created successfully\n");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
