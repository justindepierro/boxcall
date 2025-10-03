#!/usr/bin/env node

/**
 * Execute Migration Files via SQL
 *
 * This script reads the generated migration files and executes them
 * using Supabase's SQL execution capabilities
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function executeMigration() {
  console.log("🚀 EXECUTING ROLE SYSTEM MIGRATION\n");

  try {
    // Step 1: Execute schema migration
    console.log("📝 STEP 1: Executing schema migration...");

    const schemaMigrationPath = resolve(
      process.cwd(),
      "database/migrations/2025-09-29T01-01-28_role_system_migration.sql"
    );
    const schemaSQL = readFileSync(schemaMigrationPath, "utf8");

    // Split the SQL into individual statements (rough approach)
    const statements = schemaSQL
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    console.log(`Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n🔄 Executing statement ${i + 1}/${statements.length}:`);
      console.log(
        statement.substring(0, 100) + (statement.length > 100 ? "..." : "")
      );

      try {
        // For ALTER TABLE statements, we need to use raw SQL execution
        const { data, error } = await supabase.rpc("query", {
          query: statement,
        });

        if (error) {
          console.log(`⚠️  Statement ${i + 1} result: ${error.message}`);
          // Continue with other statements
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.log(`⚠️  Statement ${i + 1} error: ${err.message}`);
      }
    }

    // Step 2: Execute data migration
    console.log("\n📝 STEP 2: Executing data migration...");

    const dataMigrationPath = resolve(
      process.cwd(),
      "database/migrations/2025-09-29T01-01-28_migrate_role_data.sql"
    );
    const dataSQL = readFileSync(dataMigrationPath, "utf8");

    const dataStatements = dataSQL
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s.startsWith("UPDATE"));

    for (const statement of dataStatements) {
      console.log(`\n🔄 Executing data update...`);
      try {
        const { data, error } = await supabase.rpc("query", {
          query: statement,
        });

        if (error) {
          console.log(`⚠️  Data update result: ${error.message}`);
        } else {
          console.log(`✅ Data updated successfully`);
        }
      } catch (err) {
        console.log(`⚠️  Data update error: ${err.message}`);
      }
    }

    // Step 3: Try alternative approach - direct column updates
    console.log(
      "\n📝 STEP 3: Attempting direct updates via Supabase client..."
    );

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          // These will only work if columns exist
        })
        .eq("email", "justindepierro@gmail.com");

      if (error) {
        console.log(
          "ℹ️  Direct update not possible yet - columns need to be added first"
        );
        console.log("   This is expected if schema migration hasn't run yet");
      } else {
        console.log("✅ Direct update successful");
      }
    } catch (err) {
      console.log(
        "ℹ️  Direct update not possible - schema changes needed first"
      );
    }
  } catch (error) {
    console.error("❌ Migration execution failed:", error);
    process.exit(1);
  }

  console.log("\n🎯 MIGRATION EXECUTION COMPLETE");
  console.log(
    "If schema changes failed above, you'll need to run them manually in Supabase SQL Editor"
  );
  console.log("Next: run node scripts/verify-migration.js to check results");
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  if (
    !process.env.VITE_SUPABASE_URL ||
    !process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.error("❌ Missing required environment variables");
    process.exit(1);
  }

  executeMigration();
}

export { executeMigration };
