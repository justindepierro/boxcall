#!/usr/bin/env tsx

import { Client } from "pg";
import { readFileSync } from "fs";
import { join } from "path";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing required environment variables");
  process.exit(1);
}

// Extract connection details from Supabase URL
const url = new URL(supabaseUrl);
const host = url.hostname;
const database = url.pathname.slice(1); // Remove leading slash

async function applyMigration() {
  const client = new Client({
    host,
    database,
    user: "postgres",
    password: serviceRoleKey,
    port: 5432,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log("🔌 Connecting to database...");
    await client.connect();
    console.log("✅ Connected successfully");

    console.log("🚀 Applying enhanced achievement system migration...");

    // Read the migration file
    const migrationPath =
      "../supabase/migrations/061_enhanced_achievement_system.sql";
    const migrationSQL = readFileSync(
      join(process.cwd(), migrationPath),
      "utf8"
    );

    // Split into individual statements (more carefully)
    const statements = migrationSQL
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"))
      .map((s) => s + ";"); // Add semicolon back

    console.log(`📄 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim() && statement.trim() !== ";") {
        try {
          console.log(
            `⚡ Executing statement ${i + 1}/${statements.length}...`
          );
          await client.query(statement);
          console.log(`   ✅ Statement ${i + 1} executed successfully`);
        } catch (stmtError: any) {
          console.log(`   ❌ Statement ${i + 1} failed: ${stmtError.message}`);
          // Continue with other statements
        }
      }
    }

    console.log("✅ Migration script completed!");
    console.log("🎯 Check database for new achievement tables:");
    console.log("   - achievement_definitions");
    console.log("   - achievement_progress");
  } catch (error: any) {
    console.error("❌ Migration failed:", error.message);
  } finally {
    await client.end();
  }
}

applyMigration();
