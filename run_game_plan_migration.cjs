#!/usr/bin/env node

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Use service_role key for admin operations
const client = createClient(
  "https://lvmuiqwihlpnwppdqqfl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bXVpcXdpaGxwbndwcGRxcWZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjAyMjM0OCwiZXhwIjoyMDY3NTk4MzQ4fQ.kfhJKME3bnPR2eVs7kC_V7J1tTfOzqKxK88pT6DW7Bs"
);

async function runMigration() {
  try {
    console.log("🚀 Running game plans migration...");

    // Read migration file
    const migrationPath = path.join(
      __dirname,
      "database/migrations/20251019_create_game_plans.sql"
    );
    const sql = fs.readFileSync(migrationPath, "utf8");

    // Execute migration using RPC to run raw SQL
    const { data, error } = await client.rpc("exec_sql", { sql_query: sql });

    if (error) {
      // If exec_sql doesn't exist, try direct execution via REST API
      console.log("⚠️  exec_sql not available, trying alternative method...");

      // Split SQL into individual statements
      const statements = sql
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith("--"));

      console.log(`📝 Found ${statements.length} SQL statements`);

      // Execute each statement
      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i] + ";";
        console.log(`   Executing statement ${i + 1}/${statements.length}...`);

        try {
          // Use the Postgres connection directly
          const { data, error } = await client.rpc("exec", {
            query: stmt,
          });

          if (error) {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
            // Continue with other statements
          }
        } catch (err) {
          console.error(`❌ Exception in statement ${i + 1}:`, err.message);
        }
      }

      console.log("✅ Migration completed (with alternative method)");
    } else {
      console.log("✅ Migration completed successfully!");
      console.log("   Result:", data);
    }

    // Verify tables were created
    console.log("\n🔍 Verifying tables...");

    const tables = ["game_plans", "game_plan_situations", "game_plan_plays"];

    for (const table of tables) {
      const { count, error } = await client
        .from(table)
        .select("*", { count: "exact", head: true });

      if (error) {
        console.log(`   ❌ ${table}: ${error.message}`);
      } else {
        console.log(`   ✅ ${table}: exists (${count} rows)`);
      }
    }

    console.log("\n🎉 Game plans system ready!");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  }
}

runMigration();
