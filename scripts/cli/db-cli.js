#!/usr/bin/env node

/**
 * BoxCall Database CLI
 * Simple database management tool for VS Code terminal
 *
 * Commands:
 *   node db-cli.js migrate <file>     - Run a migration file
 *   node db-cli.js status             - Check database connection
 *   node db-cli.js query <sql>        - Run a simple query
 *   node db-cli.js sql-editor         - Open Supabase SQL editor
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";
import { exec } from "child_process";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Terminal colors
const c = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

const log = (msg, color = "reset") =>
  console.log(`${c[color]}${msg}${c.reset}`);
const box = (title, color = "cyan") => {
  const line = "═".repeat(50);
  log(`\n${line}`, color);
  log(`  ${title}`, color);
  log(`${line}\n`, color);
};

// Get Supabase client
function getSupabaseClient() {
  const url = process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    log("❌ Missing Supabase credentials in .env", "red");
    log("\nAdd these to your .env file:", "yellow");
    log("  VITE_SUPABASE_URL=your_url", "dim");
    log("  VITE_SUPABASE_ANON_KEY=your_key\n", "dim");
    process.exit(1);
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Get project URL for browser
function getProjectUrl() {
  const url = process.env.VITE_SUPABASE_URL;
  if (!url) return null;

  // Extract project ref from URL (e.g., lvmuiqwihlpnwppdqqfl)
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (!match) return null;

  return `https://supabase.com/dashboard/project/${match[1]}`;
}

// Command: Check status
async function checkStatus() {
  box("Database Connection Status", "cyan");

  const url = process.env.VITE_SUPABASE_URL;
  const hasKey = !!(
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
  );

  if (!url) {
    log("❌ VITE_SUPABASE_URL not set", "red");
    return false;
  }

  if (!hasKey) {
    log("❌ No Supabase key found", "red");
    return false;
  }

  log(`✓ Supabase URL: ${url}`, "green");
  log(`✓ Credentials: ${hasKey ? "Found" : "Missing"}`, "green");

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("plays")
      .select("count", { count: "exact", head: true });

    if (error) {
      log(`⚠️  Connection test: ${error.message}`, "yellow");
    } else {
      log(`✓ Connection: OK`, "green");
      log(`✓ Can access database`, "green");
    }
  } catch (err) {
    log(`❌ Connection failed: ${err.message}`, "red");
    return false;
  }

  log("");
  return true;
}

// Command: Run migration
async function runMigration(filePath) {
  box("Migration Runner", "cyan");

  // Resolve path
  const fullPath = filePath.startsWith("/")
    ? filePath
    : join(__dirname, filePath);

  if (!existsSync(fullPath)) {
    log(`❌ File not found: ${filePath}`, "red");
    log("\nTry one of these:", "yellow");
    log("  database/migrations/008_add_coverage_tracking.sql", "dim");
    log("  database/migrations/007_add_practice_metadata.sql", "dim");
    process.exit(1);
  }

  // Read SQL file
  log(`📄 Reading: ${filePath}`, "blue");
  const sql = readFileSync(fullPath, "utf-8").trim();

  if (!sql) {
    log("❌ Migration file is empty", "red");
    process.exit(1);
  }

  const lines = sql.split("\n").length;
  const chars = sql.length;
  log(`✓ Loaded ${lines} lines (${chars} characters)`, "green");

  // Show SQL preview
  log("\n📋 SQL Preview:", "cyan");
  log("─".repeat(50), "dim");
  const preview = sql.split("\n").slice(0, 10).join("\n");
  console.log(preview);
  if (lines > 10) log("... (truncated)", "dim");
  log("─".repeat(50) + "\n", "dim");

  // Instructions for running
  log("💡 To run this migration:", "yellow");
  log("\n1. Copy the SQL from the preview above (or view full file)", "white");
  log("2. Open Supabase SQL Editor:", "white");

  const projectUrl = getProjectUrl();
  if (projectUrl) {
    log(`   ${projectUrl}/sql/new`, "cyan");
  } else {
    log("   (Check your Supabase dashboard)", "dim");
  }

  log("3. Paste and run the SQL", "white");
  log("\n✓ Done!", "green");
  log("");
}

// Command: Open SQL editor
function openSqlEditor() {
  const projectUrl = getProjectUrl();

  if (!projectUrl) {
    log("❌ Could not determine project URL", "red");
    log("Set VITE_SUPABASE_URL in your .env file", "yellow");
    process.exit(1);
  }

  const url = `${projectUrl}/sql/new`;

  box("Opening Supabase SQL Editor", "cyan");
  log(`📝 URL: ${url}`, "blue");
  log("");

  // Try to open in browser
  const command =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "start"
        : "xdg-open";

  exec(`${command} "${url}"`, (error) => {
    if (error) {
      log("⚠️  Could not open browser automatically", "yellow");
      log("Copy the URL above and open it manually", "white");
    } else {
      log("✓ Opening browser...", "green");
    }
  });
}

// Command: Simple query
async function runQuery(sql) {
  box("Query Runner", "cyan");

  log(`📝 SQL: ${sql}`, "blue");
  log("");

  try {
    const supabase = getSupabaseClient();

    // For simple SELECT queries
    if (sql.trim().toUpperCase().startsWith("SELECT")) {
      const { data, error } = await supabase.rpc("exec_sql", {
        sql_query: sql,
      });

      if (error) {
        log(`❌ Query failed: ${error.message}`, "red");
        log("\nNote: Complex queries may need to run in SQL Editor", "yellow");
      } else {
        log("✓ Query successful", "green");
        log("\nResults:", "cyan");
        console.log(JSON.stringify(data, null, 2));
      }
    } else {
      log("⚠️  Non-SELECT queries must run in Supabase SQL Editor", "yellow");
      log("Use: node db-cli.js sql-editor", "cyan");
    }
  } catch (err) {
    log(`❌ Error: ${err.message}`, "red");
  }

  log("");
}

// Show help
function showHelp() {
  box("BoxCall Database CLI", "cyan");

  log("Commands:", "white");
  log("");
  log("  node db-cli.js status", "green");
  log("    Check database connection and credentials", "dim");
  log("");
  log("  node db-cli.js migrate <file>", "green");
  log("    Display migration SQL and instructions", "dim");
  log(
    "    Example: node db-cli.js migrate database/migrations/008_add_coverage_tracking.sql",
    "dim"
  );
  log("");
  log("  node db-cli.js sql-editor", "green");
  log("    Open Supabase SQL Editor in browser", "dim");
  log("");
  log('  node db-cli.js query "<sql>"', "green");
  log("    Run a simple SELECT query", "dim");
  log('    Example: node db-cli.js query "SELECT COUNT(*) FROM plays"', "dim");
  log("");
  log("Tips:", "yellow");
  log("  • Use SQL Editor for DDL migrations (ALTER, CREATE, etc.)", "dim");
  log("  • Add SUPABASE_SERVICE_ROLE_KEY to .env for admin access", "dim");
  log("  • Check database/migrations/ for available migrations", "dim");
  log("");
}

// Main
const [, , command, ...args] = process.argv;

switch (command) {
  case "status":
    checkStatus();
    break;

  case "migrate":
    if (!args[0]) {
      log("❌ Usage: node db-cli.js migrate <file>", "red");
      log(
        "Example: node db-cli.js migrate database/migrations/008_add_coverage_tracking.sql\n",
        "yellow"
      );
      process.exit(1);
    }
    runMigration(args[0]);
    break;

  case "sql-editor":
    openSqlEditor();
    break;

  case "query":
    if (!args[0]) {
      log('❌ Usage: node db-cli.js query "<sql>"', "red");
      log(
        'Example: node db-cli.js query "SELECT COUNT(*) FROM plays"\n',
        "yellow"
      );
      process.exit(1);
    }
    runQuery(args.join(" "));
    break;

  default:
    showHelp();
    if (command) {
      log(`❌ Unknown command: ${command}\n`, "red");
      process.exit(1);
    }
}
