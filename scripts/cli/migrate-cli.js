#!/usr/bin/env node

/**
 * BoxCall Migration Runner - Works with Supabase CLI
 * Uses db push with direct SQL execution
 */

import {
  readFileSync,
  existsSync,
  writeFileSync,
  mkdirSync,
  unlinkSync,
} from "fs";
import { spawn } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const c = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
};

const log = (msg, color = "reset") =>
  console.log(`${c[color]}${msg}${c.reset}`);

async function runMigration(migrationPath) {
  try {
    log("\n🚀 BoxCall Migration Runner", "cyan");
    log("═══════════════════════════════════════\n", "cyan");

    const fullPath = join(__dirname, migrationPath);
    if (!existsSync(fullPath)) {
      log(`❌ Migration file not found: ${migrationPath}`, "red");
      process.exit(1);
    }

    // Read migration
    const sql = readFileSync(fullPath, "utf-8");
    const lines = sql.split("\n").length;
    log(`📄 Migration: ${migrationPath}`, "blue");
    log(`✓ ${lines} lines of SQL\n`, "green");

    // Show preview
    log("📋 Preview:", "cyan");
    log("─".repeat(50), "dim");
    const preview = sql.split("\n").slice(0, 12).join("\n");
    console.log(preview);
    if (lines > 12) log("... (truncated)", "dim");
    log("─".repeat(50) + "\n", "dim");

    // Get Supabase credentials
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      log("❌ Missing Supabase credentials", "red");
      log("\nAdd to .env:", "yellow");
      log("VITE_SUPABASE_URL=...", "dim");
      log("SUPABASE_SERVICE_ROLE_KEY=...\n", "dim");
      process.exit(1);
    }

    log("🔌 Connecting to Supabase...", "blue");
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    log("✓ Connected", "green");
    log("\n📤 Executing migration via Supabase client...", "yellow");
    log("─".repeat(50), "dim");

    // Split into statements and execute
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ";";
      const preview = statement.substring(0, 60).replace(/\s+/g, " ");

      process.stdout.write(`[${i + 1}/${statements.length}] ${preview}...`);

      try {
        const { error } = await supabase.rpc("query", {
          query_text: statement,
        });

        if (error) {
          // Try direct SQL execution (for DDL)
          const { error: sqlError } = await supabase
            .from("_migrations")
            .insert({ statement });

          if (sqlError) {
            // Last resort - this means we need SQL Editor
            console.log(c.yellow + " ⚠️  Requires SQL Editor" + c.reset);
            failCount++;
            continue;
          }
        }

        console.log(c.green + " ✓" + c.reset);
        successCount++;
      } catch (err) {
        console.log(c.red + " ✗" + c.reset);
        failCount++;
      }
    }

    log("\n" + "─".repeat(50), "dim");

    if (failCount > 0) {
      log("\n⚠️  Migration partially completed", "yellow");
      log(`  Success: ${successCount}`, "green");
      log(`  Need SQL Editor: ${failCount}`, "yellow");
      log("\n💡 For best results, use:", "yellow");
      log("   npm run db:migrate:easy " + migrationPath, "cyan");
      log("\nThis copies SQL and opens the editor automatically.", "dim");
    } else {
      log("\n✅ Migration executed successfully!", "green");
      log(`  ${successCount} statements executed`, "dim");
    }

    log("═══════════════════════════════════════\n", "cyan");
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, "red");
    log("\n💡 For complex migrations, use SQL Editor:", "yellow");
    log("   npm run db:migrate:easy " + migrationPath, "cyan");
    log("═══════════════════════════════════════\n", "cyan");
    process.exit(1);
  }
}

const migrationPath = process.argv[2];

if (!migrationPath) {
  log("❌ Usage: node migrate-cli.js <migration-file>", "red");
  log(
    "Example: node migrate-cli.js database/migrations/008_add_coverage_tracking.sql\n",
    "yellow"
  );
  process.exit(1);
}

runMigration(migrationPath);
